import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnv() {
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = (env.ALLOWED_EMAIL || "danielhernandezhv3@gmail.com").toLowerCase();

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const password =
  env.INITIAL_PASSWORD || randomBytes(18).toString("base64url").slice(0, 24);

const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);

let userId = existing?.id;

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("No se pudo actualizar usuario:", error.message);
    process.exit(1);
  }
  console.log("Usuario existente — contraseña actualizada.");
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Daniel Hernández" },
  });
  if (error) {
    console.error("No se pudo crear usuario:", error.message);
    process.exit(1);
  }
  userId = data.user?.id;
  console.log("Usuario creado en Supabase Auth.");
}

if (userId) {
  const { error: seedError } = await admin.rpc("seed_default_income_sources", {
    p_user_id: userId,
  });
  if (seedError?.message?.includes("function public.seed_default_income_sources")) {
    console.warn(
      "Seed omitido (aplica migraciones con supabase db push antes):",
      seedError.message,
    );
  } else if (seedError) {
    console.warn("Seed:", seedError.message);
  } else {
    console.log("Fuentes de ingreso seed OK.");
  }
}

mkdirSync(join(root, ".setup"), { recursive: true });
const credPath = join(root, ".setup", "login-credentials.txt");
writeFileSync(
  credPath,
  [
    "Life Dashboard — acceso local (NO SUBIR A GIT)",
    `Email: ${email}`,
    `Contraseña: ${password}`,
    "",
    "Cámbiala tras el primer login en Supabase Auth si lo prefieres.",
  ].join("\n"),
  "utf8",
);

console.log(`Credenciales guardadas en ${credPath}`);
