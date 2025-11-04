import { Category, Transaction, Type } from "@prisma/client";

// Formatear lista de tipos
export const formatTypes = (types: Type[]): string => {
     return types.map((t) => `- **${t.name}**`).join("\n");
};

// Formatear lista de categorías
export const formatCategories = (categories: (Category & { type?: Type | null })[]): string => {
     return categories.map((c) => `- **${c.name}** (Tipo: ${c.type?.name || "Desconocido"})`).join("\n");
};

// Formatear lista de transacciones
export const formatTransactions = (
     transactions: (Transaction & { category?: (Category & { type?: Type | null }) | null })[]
): string => {
     if (transactions.length === 0) return "No se encontraron movimientos.";

     return transactions
          .map((t) => {
               const catName = t.category?.name || "Sin Categoría";
               const typeId = t.category?.type?.id;
               const emoji = getEmojiForType(typeId);

               // Formato: 03/nov (sin hora)
               const date = new Date(t.date).toLocaleString("es-EC", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "America/Guayaquil",
               });

               return `*${emoji} ${date}* | $${t.amount} | ${t.description} (${catName})`;
          })
          .join("\n");
};

//  Obtener emoji según el tipo de categoría
const getEmojiForType = (typeId: bigint | undefined | null): string => {
     if (!typeId) return "⚪️";

     const id = Number(typeId);
     switch (id) {
          case 1: // Ingresos
               return "🟢";
          case 2: // Gastos
               return "🟡";
          case 3: // Ahorros
               return "💰";
          default:
               return "⚪️";
     }
};

/**
 * Utilidad para extraer JSON limpio de respuestas de IA
 */
export const extractJSON = <T = any>(response: string): T | null => {
     try {
          // Intenta parsear directamente
          return JSON.parse(response.trim());
     } catch {
          // Busca JSON entre texto
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
               try {
                    return JSON.parse(jsonMatch[0]);
               } catch {
                    return null;
               }
          }
          return null;
     }
};
