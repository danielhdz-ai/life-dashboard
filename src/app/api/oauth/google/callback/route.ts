import { NextResponse } from "next/server";

import { encryptSecret } from "@/lib/crypto/tokens";
import { getGmailClient, getGoogleOAuthClient } from "@/lib/email/google-oauth";
import { syncGmailAccount } from "@/lib/email/sync-gmail-account";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/oauth/google/callback`;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state");

  if (!code || !stateUserId) {
    return NextResponse.redirect(new URL("/ajustes?error=oauth", appUrl));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateUserId) {
    return NextResponse.redirect(new URL("/ajustes?error=oauth_user", appUrl));
  }

  const oauth2 = getGoogleOAuthClient(redirectUri);
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);

  const gmail = getGmailClient(tokens, redirectUri);
  const profile = await gmail.users.getProfile({ userId: "me" });
  const emailAddress = profile.data.emailAddress;
  if (!emailAddress) {
    return NextResponse.redirect(new URL("/ajustes?error=no_email", appUrl));
  }

  const admin = createAdminClient();
  const encrypted = encryptSecret(JSON.stringify(tokens));

  const { data: account, error } = await admin
    .from("email_accounts")
    .upsert(
      {
        user_id: user.id,
        provider: "google",
        email_address: emailAddress.toLowerCase(),
        encrypted_tokens: encrypted,
        is_active: true,
        sync_error: null,
      },
      { onConflict: "user_id,email_address" },
    )
    .select("id, user_id, email_address, encrypted_tokens, history_id")
    .single();

  if (error || !account) {
    return NextResponse.redirect(new URL("/ajustes?error=save", appUrl));
  }

  try {
    await syncGmailAccount(admin, account, redirectUri);
  } catch {
    /* sync puede fallar; la cuenta ya quedó conectada */
  }

  return NextResponse.redirect(new URL("/ajustes?connected=1", appUrl));
}
