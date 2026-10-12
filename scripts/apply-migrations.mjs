import pg from "pg";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");

function loadEnv() {
  const path = join(root, ".env.local");
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const password = env.SUPABASE_DB_PASSWORD;
const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

if (!password || !ref) {
  console.error(
    "Añade SUPABASE_DB_PASSWORD en .env.local (Database password del proyecto Supabase).",
  );
  process.exit(1);
}

const connectionString =
  env.DATABASE_URL ||
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

await client.connect();
try {
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log("Applying", file, "...");
    await client.query(sql);
  }
  console.log("Migraciones aplicadas.");
} finally {
  await client.end();
}
