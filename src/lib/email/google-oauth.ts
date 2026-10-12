import { google } from "googleapis";

export function getGoogleOAuthClient(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET no configurados");
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export type StoredGoogleTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
};

export function getGmailClient(tokens: StoredGoogleTokens, redirectUri: string) {
  const oauth2 = getGoogleOAuthClient(redirectUri);
  oauth2.setCredentials(tokens);
  return google.gmail({ version: "v1", auth: oauth2 });
}
