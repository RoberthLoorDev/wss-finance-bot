import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";
import { TransactionService } from "@/services/transactions.service";

export class UpdateTransactionHandler {
     private ai = new AiService();
     private categories = new CategoryService();
     private transactions = new TransactionService();

     async execute(user: any, text: string, context: string) {
          const { items: userCategories } = await this.categories.findAll({
               user_id: user.id,
               page: 1,
               pageSize: 1000,
          });
          const categoryNames = userCategories.map((c) => c.name);

          const slots = await this.ai.extractTransactionUpdateSlots(text, context, categoryNames);

          // Actualizar una transacción existente
          if (slots?.targetTransactionId && slots?.newCategoryName) {
               try {
                    const txId = BigInt(slots.targetTransactionId);

                    // Encontrar la categoría por su nombre
                    const categoryMatch = await this.ai.findBestCategoryMatch(slots.newCategoryName, categoryNames);
                    const category = userCategories.find((c) => c.name === categoryMatch);

                    if (!category) {
                         return { reply: `No encontré una categoría llamada '${slots.newCategoryName}'. ¿Usamos otra?` };
                    }

                    // ¡Actualizar la transacción!
                    const updatedTx = await this.transactions.update(txId, {
                         category: { connect: { id: category.id } },
                    });

                    // Responder con éxito
                    const reply = await this.ai.generateTransactionUpdatedReply(
                         updatedTx.description || "esa transacción",
                         category.name
                    );
                    return { reply };
               } catch (error) {
                    console.error("Error actualizando Tx:", error);
                    return { reply: "Hubo un error al actualizar tu transacción 😔." };
               }
          }

          // buscar la transacción a editar si no se proporcionó ID
          if (!slots?.targetTransactionId) {
               // Vamos a buscar la transacción que el usuario describió en 'text'
               const userTransactions = await this.transactions.findRecentByUser(user.id);
               if (userTransactions.length === 0) {
                    return { reply: "Revisé tus movimientos, pero no encontré ninguna transacción reciente para editar." };
               }

               const txDescriptions = userTransactions.map((tx) => tx.description || "Transacción sin descripción");

               // Usar IA para encontrar la mejor coincidencia
               const bestMatchDesc = await this.ai.findBestCategoryMatch(text, txDescriptions);

               if (!bestMatchDesc) {
                    // No encontramos coincidencia, volvemos a preguntar
                    const reply = await this.ai.generateAskForTransactionDescription(user.name);
                    return { reply };
               }

               const matchedTx = userTransactions.find(
                    (tx) => (tx.description || "Transacción sin descripción") === bestMatchDesc
               );

               if (matchedTx) {
                    const reply = await this.ai.generateConfirmTransactionFound(user.name, matchedTx, userCategories);
                    return { reply };
               }
          }

          // Si llegamos aquí, no se entendió bien
          return { reply: "No te entendí bien. ¿Qué transacción quieres editar y en qué categoría la ponemos?" };
     }
}
