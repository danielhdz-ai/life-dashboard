import { locale } from "@/lib/design-tokens";

export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale.language, {
    style: "currency",
    currency: locale.currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}
