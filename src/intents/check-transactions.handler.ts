import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";
import { TransactionService } from "@/services/transactions.service";
import { TypeService } from "@/services/types.service";
import { formatAmount, formatDateShort, sumAmounts, summarizeByCategory, escapeHtml } from "@/utils/check-transactions.utils";

export class CheckTransactionsHandler {
     private ai = new AiService();
     private categories = new CategoryService();
     private transactions = new TransactionService();
     private types = new TypeService();

     async execute(user: any, text: string, context: string) {
          const filters = await this.ai.extractTransactionFilters(text); // extraer filtros del texto

          let categoryId: bigint | undefined = undefined;
          let typeId: bigint | undefined = undefined;

          let textDescription = ""; // Para Tipo/Categoría
          let timeDescription = ""; // Para Fechas

          // validar tipo
          if (filters?.typeName) {
               const { items: foundTypes } = await this.types.findAll({ page: 1, pageSize: 1, search: filters.typeName });
               if (foundTypes.length > 0) {
                    typeId = foundTypes[0].id;
                    textDescription += ` del tipo "${foundTypes[0].name}"`;
               } else {
                    return { reply: `No encontré el tipo "${filters.typeName}". Mis tipos son Ingresos, Gastos y Ahorros.` };
               }
          }

          // validar categoría
          if (filters?.categoryName) {
               const { items: userCategories } = await this.categories.findAll({ user_id: user.id, page: 1, pageSize: 1000 });
               const categoryNames = userCategories.map((c) => c.name);
               const bestMatch = await this.ai.findBestCategoryMatch(filters.categoryName, categoryNames);

               if (!bestMatch) {
                    const reply = await this.ai.generateCategoryNotFoundForFilterReply(user.name, filters.categoryName);
                    return { reply };
               }
               const category = userCategories.find((c) => c.name === bestMatch);
               categoryId = category?.id;
               textDescription += ` en la categoría "${category?.name}"`;
          }

          // Parsear fechas
          let dateRanges: { start: Date; end: Date }[] | null = null;

          // helper: detectar si el usuario pidió explícitamente 'todo(s)/todas'
          const isExplicitShowAll = (txt: string) => {
               if (!txt) return false;
               const t = txt.toLowerCase();
               // palabras claves que indican "todas/ todo" explícito
               const re = /\b(todo|todos|todas)\b/;
               return re.test(t);
          };

          if (filters?.dateQuery) {
               timeDescription = ` ${filters.dateQuery}`; // usar el texto original

               const currentDate = new Date().toLocaleDateString("es-EC", {
                    dateStyle: "full",
                    timeZone: "America/Guayaquil",
               });
               const parsedDates = await this.ai.parseDateQuery(filters.dateQuery, currentDate);

               if (parsedDates) {
                    dateRanges = parsedDates.ranges.map((range) => {
                         // parse manual para evitar problemas de timezone
                         const [startYear, startMonth, startDay] = range.start.split("-").map(Number);
                         const [endYear, endMonth, endDay] = range.end.split("-").map(Number);

                         // crear fechas en timezone local, no UTC
                         const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
                         const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

                         return { start: startDate, end: endDate };
                    });
               } else {
                    return { reply: `No entendí muy bien el rango de fechas "${filters.dateQuery}". ¿Podrías repetirlo?` };
               }
          } else {
               // Si no especificó fecha, sólo mostrar TODO si lo pidió explícitamente.
               const askedAll = isExplicitShowAll(text);
               if (askedAll) {
                    timeDescription = "de todo tu historial";
                    dateRanges = null; // no filtrar
               } else {
                    // Por defecto, mostrar del 1 al último día del mes actual
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    dateRanges = [{ start, end }];
                    timeDescription = "de este mes";
               }
          }

          const { items: transactions } = await this.transactions.findAll({
               page: 1,
               pageSize: 100,
               user_id: user.id,
               category_id: categoryId,
               type_id: typeId,
               dateRanges: dateRanges,
          });

          // ordenar transacciones de la más antigua a la más nueva (ascending by date)
          transactions.sort((a: any, b: any) => {
               const aTime = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
               const bTime = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
               return aTime - bTime;
          });

          let finalFilterDescription = "";
          if (textDescription === "") {
               finalFilterDescription = timeDescription;
          } else {
               finalFilterDescription = (timeDescription + textDescription).trim();
          }

          if (transactions.length === 0) {
               const reply = await this.ai.generateNoTransactionsFoundReply(user.name, finalFilterDescription);
               return { reply };
          }

          // Agrupar transacciones por tipo (Ingresos, Gastos, Ahorros)
          const groups: Record<string, any[]> = {
               Ingresos: [],
               Gastos: [],
               Ahorros: [],
               Otros: [],
          };

          for (const tx of transactions) {
               const typeName = tx?.category?.type?.name || "Otros";
               if (typeName.toLowerCase().includes("ingres")) groups.Ingresos.push(tx);
               else if (typeName.toLowerCase().includes("gasto")) groups.Gastos.push(tx);
               else if (typeName.toLowerCase().includes("ahorr")) groups.Ahorros.push(tx);
               else groups.Otros.push(tx);
          }

          // Construir el mensaje de respuesta
          const lines: string[] = [];
          lines.push("💰 Resumen de movimientos");
          lines.push("");
          lines.push(
               `👋 Hola, ${escapeHtml(
                    user.name || ""
               )}! Aquí tienes el resumen de tus movimientos, separados por ingresos y gastos:`
          );
          lines.push("");

          const appendGroup = (titleEmoji: string, title: string, items: any[], sign: string) => {
               if (!items || items.length === 0) return;
               lines.push("──────────────────────────────");
               lines.push(`<b>${titleEmoji} ${escapeHtml(title.toUpperCase())}</b>`);
               lines.push("");

               for (const t of items) {
                    const amount = formatAmount(t.amount);
                    const categoryName = t.category?.name || "Sin categoría";
                    const dateShort = formatDateShort(t.date);
                    const description = t.description ? String(t.description) : "-";
                    // usar HTML: línea monoespaciada para la transacción, descripción en cursiva
                    const txLine = `<code>${escapeHtml(`${sign} $${amount} — ${categoryName} (${dateShort})`)}</code>`;
                    lines.push(txLine);
                    lines.push(`<i>📄 Desc: ${escapeHtml(description)}</i>`);
                    lines.push("");
               }

               lines.push("──────────────────────────────");
               // total del grupo (usar util)
               const total = sumAmounts(items);
               // total con el valor en negrita
               lines.push(`🟰 Total ${title.toUpperCase()}: <b>$${total.toFixed(2)}</b>`);
               lines.push("");

               // resumen por categoría (usar util)
               const catMap = summarizeByCategory(items);

               if (catMap.size > 0) {
                    lines.push("📊 Resumen por categoría:");
                    for (const [cname, sum] of catMap.entries()) {
                         lines.push(`• 💼 ${escapeHtml(cname)}: <b>$${sum.toFixed(2)}</b>`);
                    }
                    lines.push("");
               }
          };

          // Orden de presentación: Ingresos, Gastos, Ahorros, Otros
          appendGroup("🟢", "INGRESOS", groups.Ingresos, "+");
          appendGroup("🔴", "GASTOS", groups.Gastos, "-");
          appendGroup("🔵", "AHORROS", groups.Ahorros, "💾");
          appendGroup("📦", "OTROS", groups.Otros, "");

          lines.push("¡Estoy aquí si necesitas algo más!");

          const reply = lines.join("\n");
          return { reply };
     }
}
