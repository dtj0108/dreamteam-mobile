import { usePathname } from "expo-router";

export type ProductId = "finance" | "sales" | "team" | "projects" | "knowledge";

export interface Product {
  id: ProductId;
  name: string;
  emoji: string;
  route: string;
  description: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "finance",
    name: "Finance",
    emoji: "💰",
    route: "/(main)/finance",
    description: "Financial management",
  },
  {
    id: "sales",
    name: "Sales",
    emoji: "🤝",
    route: "/(main)/sales",
    description: "CRM and pipeline",
  },
  {
    id: "team",
    name: "Team",
    emoji: "💬",
    route: "/(main)/team",
    description: "Team messaging",
  },
  {
    id: "projects",
    name: "Projects",
    emoji: "📋",
    route: "/(main)/projects",
    description: "Project management",
  },
  {
    id: "knowledge",
    name: "Knowledge",
    emoji: "📖",
    route: "/(main)/more/knowledge",
    description: "Documentation wiki",
  },
];

export function useCurrentProduct(): Product {
  const pathname = usePathname();

  if (pathname.startsWith("/sales")) return PRODUCTS[1];
  if (pathname.startsWith("/team")) return PRODUCTS[2];
  if (pathname.startsWith("/projects")) return PRODUCTS[3];
  if (pathname.startsWith("/more/knowledge") || pathname.startsWith("/knowledge"))
    return PRODUCTS[4];

  return PRODUCTS[0]; // default to finance
}
