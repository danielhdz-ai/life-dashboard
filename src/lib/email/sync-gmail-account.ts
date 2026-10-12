import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptSecret } from "@/lib/crypto/tokens";
import { getGmailClient, type StoredGoogleTokens } from "@/lib/email/google-oauth";
import { detectPayment } from "@/lib/payments/detect-rules";

type EmailAccountRow = {
  id: string;
  user_id: string;
  email_address: string;
  encrypted_tokens: string;
  history_id: string | null;
};

export async function syncGmailAccount(
  admin: SupabaseClient,
  account: EmailAccountRow,
  redirectUri: string,
) {
  const tokens = JSON.parse(decryptSecret(account.encrypted_tokens)) as StoredGoogleTokens;
  const gmail = getGmailClient(tokens, redirectUri);

  const profile = await gmail.users.getProfile({ userId: "me" });
  const currentHistory = profile.data.historyId ?? undefined;

  let messageIds: string[] = [];

  if (account.history_id) {
    try {
      const hist = await gmail.users.history.list({
        userId: "me",
        startHistoryId: account.history_id,
        historyTypes: ["messageAdded"],
      });
      for (const h of hist.data.history ?? []) {
        for (const added of h.messagesAdded ?? []) {
          if (added.message?.id) messageIds.push(added.message.id);
        }
      }
    } catch {
      messageIds = [];
    }
  }

  if (messageIds.length === 0) {
    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 40,
      q: "newer_than:30d (pago OR cobro OR factura OR stripe OR transferencia)",
    });
    messageIds = (list.data.messages ?? []).map((m) => m.id!).filter(Boolean);
  }

  const uniqueIds = [...new Set(messageIds)].slice(0, 50);
  let alertsCreated = 0;

  const { data: sources } = await admin
    .from("income_sources")
    .select("id, slug")
    .eq("user_id", account.user_id);

  const sourceBySlug = new Map((sources ?? []).map((s) => [s.slug, s.id]));

  for (const msgId of uniqueIds) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msgId,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });

    const headers = full.data.payload?.headers ?? [];
    const from = headers.find((h) => h.name === "From")?.value ?? "";
    const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
    const snippet = full.data.snippet ?? "";
    const internalDate = full.data.internalDate
      ? new Date(Number(full.data.internalDate))
      : new Date();

    const hash = createHash("sha256").update(`${msgId}:${subject}:${snippet}`).digest("hex");

    const { data: meta, error: metaError } = await admin
      .from("email_messages_meta")
      .upsert(
        {
          user_id: account.user_id,
          account_id: account.id,
          external_id: msgId,
          message_hash: hash,
          from_address: from,
          subject,
          snippet: snippet.slice(0, 500),
          received_at: internalDate.toISOString(),
        },
        { onConflict: "account_id,external_id" },
      )
      .select("id")
      .single();

    if (metaError || !meta) continue;

    const detection = detectPayment({ from, subject, snippet });
    if (!detection) continue;

    const { count } = await admin
      .from("payment_alerts")
      .select("id", { count: "exact", head: true })
      .eq("message_id", meta.id);

    if (count && count > 0) continue;

    const sourceId = detection.probableSourceSlug
      ? sourceBySlug.get(detection.probableSourceSlug) ?? null
      : null;

    const { error: alertError } = await admin.from("payment_alerts").insert({
      user_id: account.user_id,
      message_id: meta.id,
      status: "por_revisar",
      detected_type: detection.type,
      amount: detection.amount,
      currency: "EUR",
      payment_date: internalDate.toISOString().slice(0, 10),
      source_id: sourceId,
      concept: detection.concept,
      confidence: detection.confidence * 100,
    });

    if (!alertError) alertsCreated += 1;
  }

  await admin
    .from("email_accounts")
    .update({
      history_id: currentHistory ?? account.history_id,
      last_sync_at: new Date().toISOString(),
      sync_error: null,
    })
    .eq("id", account.id);

  return { processed: uniqueIds.length, alertsCreated };
}
