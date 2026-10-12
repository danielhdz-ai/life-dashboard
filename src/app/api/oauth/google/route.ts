import { NextResponse } from "next/server";

import { GMAIL_SCOPES, getGoogleOAuthClient } from "@/lib/email/google-oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
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
    state: user.id,
  });

  return NextResponse.redirect(url);
}
