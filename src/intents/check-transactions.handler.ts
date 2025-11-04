import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";
import { TransactionService } from "@/services/transactions.service";
import { TypeService } from "@/services/types.service";

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
               timeDescription = "de todo tu historial"; // default es 'todos'
          }

          const { items: transactions } = await this.transactions.findAll({
               page: 1,
               pageSize: 100,
               user_id: user.id,
               category_id: categoryId,
               type_id: typeId,
               dateRanges: dateRanges,
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

          const reply = await this.ai.generateTransactionListReply(user.name, transactions, finalFilterDescription);
          return { reply };
     }
}
