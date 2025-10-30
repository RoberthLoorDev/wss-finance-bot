import { Category, Type } from "@prisma/client";

// Formatear lista de tipos
export const formatTypes = (types: Type[]): string => {
     return types.map((t) => `- **${t.name}**`).join("\n");
};

// Formatear lista de categorías
export const formatCategories = (categories: (Category & { type?: Type | null })[]): string => {
     return categories.map((c) => `- **${c.name}** (Tipo: ${c.type?.name || "Desconocido"})`).join("\n");
};
