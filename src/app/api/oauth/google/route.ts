import { NextResponse } from "next/server";

import { GMAIL_SCOPES, getGoogleOAuthClient } from "@/lib/email/google-oauth";
import { getServerDataClient } from "@/lib/supabase/data-client";

export async function GET() {
  const ctx = await getServerDataClient();
  if (!ctx) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL("/ajustes?error=google_not_configured", process.env.NEXT_PUBLIC_APP_URL),
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/oauth/google/callback`;
  const oauth2 = getGoogleOAuthClient(redirectUri);

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state: ctx.userId,
  });

  return NextResponse.redirect(url);
}
