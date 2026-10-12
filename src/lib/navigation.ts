import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bot,
  Calendar,
  GitBranch,
  Home,
  Receipt,
  Settings,
  Wallet,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const dashboardNav: DashboardNavItem[] = [
  { href: "/", label: "Inicio", icon: Home, description: "Resumen del mes" },
  {
    href: "/ingresos",
    label: "Ingresos y gastos",
    icon: Wallet,
    description: "Movimientos y filtros",
  },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, description: "Cobros esperados" },
  { href: "/calendario", label: "Calendario", icon: Calendar, description: "Pagos del mes" },
  { href: "/impuestos", label: "Impuestos", icon: Receipt, description: "Estimaciones fiscales" },
  { href: "/avisos", label: "Avisos", icon: Bell, description: "Correos y detecciones" },
  { href: "/asistente", label: "Asistente IA", icon: Bot, description: "Chat con Gemini" },
  { href: "/ajustes", label: "Ajustes", icon: Settings, description: "Cuentas y reglas" },
];

export const incomeSourceNav = [
  { slug: "livendia", label: "Livendia" },
  { slug: "inmonest", label: "Inmonest" },
  { slug: "firmacert", label: "FirmaCert" },
  { slug: "mercat-immobiliari", label: "Mercat Immobiliari" },
  { slug: "nuevahabitat", label: "NuevaHabitat" },
] as const;

export function getCommandPages() {
  return [
    ...dashboardNav.map((item) => ({
      id: item.href,
      label: item.label,
      href: item.href,
      group: "Navegación",
    })),
    ...incomeSourceNav.map((s) => ({
      id: `/fuentes/${s.slug}`,
      label: s.label,
      href: `/fuentes/${s.slug}`,
      group: "Negocios",
    })),
    {
      id: "action-income",
      label: "Añadir ingreso…",
      href: "/ingresos?nuevo=ingreso",
      group: "Acciones",
    },
    {
      id: "action-expense",
      label: "Añadir gasto…",
      href: "/ingresos?nuevo=gasto",
      group: "Acciones",
    },
    {
      id: "action-ai",
      label: "Preguntar a la IA…",
      href: "/asistente",
      group: "Acciones",
    },
  ];
}
