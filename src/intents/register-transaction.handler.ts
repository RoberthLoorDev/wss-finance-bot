import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";
import { TransactionService } from "@/services/transactions.service";
import { Category } from "@prisma/client";

export class RegisterTransactionHandler {
     private ai = new AiService();
     private categories = new CategoryService();
     private transactions = new TransactionService();

     async execute(user: any, text: string, context: string) {
          // 1. Extraer la información de la transacción del mensaje
          const extracted = await this.ai.extractTransactionInfo(text);

          if (!extracted || !extracted.amount || !extracted.description) {
               return {
                    reply: "No te entendí bien 😅. Para registrar un movimiento, necesito que me digas un monto y una descripción (ej: 'gasté 50 en comida').",
               };
          }

          const { amount, description, date } = extracted;

          const { items: userCategories } = await this.categories.findAll({
               user_id: user.id,
               page: 1,
               pageSize: 1000,
          });

          if (!userCategories || userCategories.length === 0) {
               return {
                    reply: "¡Ups! Veo que aún no tienes categorías. Debes crear una categoría primero (ej: 'Sueldo, Ingreso') para poder registrar movimientos.",
               };
          }

          // buscar la mejor coincidencia de categoría
          const categoryNames = userCategories.map((c: Category) => c.name);
          const bestMatchName = await this.ai.findBestCategoryMatch(description, categoryNames);

          let transactionCategory: Category | undefined;

          if (bestMatchName) {
               transactionCategory = userCategories.find((c: Category) => c.name === bestMatchName);
          }

          if (transactionCategory) {
               // categoría encontrada
               try {
                    await this.transactions.create({
                         amount: amount,
                         description: description,
                         date: date ? new Date(date) : new Date(),
                         user: { connect: { id: user.id } },
                         category: { connect: { id: transactionCategory.id } },
                    });

                    const reply = await this.ai.generateTransactionCreatedReply(amount, description, transactionCategory.name);
                    return { reply };
               } catch (error) {
                    console.error("Error creando transacción:", error);
                    return { reply: "Hubo un error al guardar tu transacción. Avísale a mi creador 😔." };
               }
          } else {
               // categoría NO encontrada
               try {
                    await this.transactions.create({
                         amount: amount,
                         description: description,
                         date: date ? new Date(date) : new Date(),
                         user: { connect: { id: user.id } },
                    });

                    const reply = await this.ai.generateAskForCategoryReply(user.name, amount, description, userCategories);
                    return { reply };
               } catch (error) {
                    console.error("Error creando transacción PENDIENTE:", error);
                    return { reply: "Hubo un error al procesar tu movimiento. Inténtalo de nuevo." };
               }
          }
     }
}
