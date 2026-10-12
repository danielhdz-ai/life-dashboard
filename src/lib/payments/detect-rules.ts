export type DetectionInput = {
  from: string;
  subject: string;
  snippet: string;
};

export type DetectionResult = {
  type: "ingreso" | "gasto";
  amount: number | null;
  confidence: number;
  concept: string;
  probableSourceSlug: string | null;
};

const KEYWORDS_INCOME = [
  "pago recibido",
  "transferencia recibida",
  "ingreso",
  "cobro",
  "has recibido",
  "payment received",
  "stripe",
];
const KEYWORDS_EXPENSE = [
  "factura",
  "vencimiento",
  "cargo",
  "suscripción",
  "subscription",
  "invoice due",
  "paypal",
];

const SENDER_SOURCE: Record<string, string> = {
  livendia: "livendia",
  inmonest: "inmonest",
  firmacert: "firmacert",
  stripe: "firmacert",
  mercat: "mercat-immobiliari",
  nuevahabitat: "nuevahabitat",
};

export function extractAmountEur(text: string): number | null {
  const normalized = text.replace(/\s/g, " ");
  const m =
    normalized.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/i) ??
    normalized.match(/€\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i) ??
    normalized.match(/(\d+(?:[.,]\d{2})?)\s*EUR/i);
  if (!m) return null;
  const raw = m[1].replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function detectPayment(input: DetectionInput): DetectionResult | null {
  const blob = `${input.from} ${input.subject} ${input.snippet}`.toLowerCase();
  const amount = extractAmountEur(blob);
  if (!amount && !KEYWORDS_INCOME.some((k) => blob.includes(k)) && !KEYWORDS_EXPENSE.some((k) => blob.includes(k))) {
    return null;
  }

  let type: "ingreso" | "gasto" = "ingreso";
  if (KEYWORDS_EXPENSE.some((k) => blob.includes(k)) && !KEYWORDS_INCOME.some((k) => blob.includes(k))) {
    type = "gasto";
  }

  let probableSourceSlug: string | null = null;
  for (const [needle, slug] of Object.entries(SENDER_SOURCE)) {
    if (blob.includes(needle)) {
      probableSourceSlug = slug;
      break;
    }
  }

  let confidence = 0.45;
  if (amount) confidence += 0.25;
  if (probableSourceSlug) confidence += 0.15;
  if (type === "ingreso" && KEYWORDS_INCOME.some((k) => blob.includes(k))) confidence += 0.1;

  return {
    type,
    amount,
    confidence: Math.min(0.95, confidence),
    concept: input.subject.slice(0, 200),
    probableSourceSlug,
  };
}
