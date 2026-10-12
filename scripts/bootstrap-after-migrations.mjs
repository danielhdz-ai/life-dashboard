import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const email = (env.ALLOWED_EMAIL || "danielhernandezhv3@gmail.com").toLowerCase();
const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
const user = list?.users?.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error("Usuario no encontrado:", email);
  process.exit(1);
}

const { error: profileError } = await admin.from("profiles").upsert({
  id: user.id,
  email,
  display_name: "Daniel Hernández",
});

if (profileError) {
  console.error("profiles:", profileError.message);
  process.exit(1);
}

await admin.from("tax_settings").upsert({ user_id: user.id });

const { error: seedError } = await admin.rpc("seed_default_income_sources", {
  p_user_id: user.id,
});

if (seedError) {
  console.error("seed:", seedError.message);
  process.exit(1);
}

console.log("Perfil, fiscal y fuentes listos para", email);
