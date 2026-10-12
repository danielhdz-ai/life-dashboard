import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export default async function FuenteDetailPage({ params }: Props) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <PlaceholderPage
      title={title}
      description="Histórico, gráficas e ingresos/gastos por negocio — Fase 1."
    />
  );
}
