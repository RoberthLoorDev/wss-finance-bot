import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";

export class UpdateCategoryHandler {
     private ai = new AiService();
     private categories = new CategoryService();

     async execute(user: any, text: string, context: string) {
          // extraer la info de oldName y newName usando IA
          const extracted = await this.ai.extractUpdateCategoryInfo(text);

          if (!extracted || !extracted.oldName || !extracted.newName) {
               return {
                    reply: "No te entendí bien. ¿Puedes decirme el nombre de la categoría que quieres cambiar y el nuevo nombre? (ej: 'renombra Comida a Alimentos')",
               };
          }

          const { oldName, newName } = extracted;

          const { items: userCategories } = await this.categories.findAll({
               page: 1,
               pageSize: 100,
               user_id: user.id,
          });

          if (userCategories.length === 0) {
               return { reply: "Vaya, parece que aún no tienes categorías para editar. ¿Quieres crear una?" };
          }

          const categoryNames = userCategories.map((c) => c.name);

          // la ia busca la mejor coincidencia para oldName
          const bestMatch = await this.ai.findBestCategoryMatch(oldName, categoryNames);

          if (!bestMatch) {
               return {
                    reply: `No estoy segura de cuál categoría es "${oldName}". Tus categorías son: ${categoryNames.join(
                         ", "
                    )}. ¿Puedes intentarlo de nuevo?`,
               };
          }

          const categoryToUpdate = userCategories.find((c) => c.name === bestMatch);

          if (!categoryToUpdate) {
               return { reply: "Hubo un error extraño. No pude encontrar esa categoría." };
          }

          try {
               await this.categories.update(categoryToUpdate.id, { name: newName });

               // 6. Confirmar al usuario
               const reply = await this.ai.generateCategoryUpdatedReply(bestMatch, newName);
               return { reply };
          } catch (error) {
               console.error("Error actualizando categoría:", error);
               return { reply: "Hubo un error al actualizar tu categoría. 😔" };
          }
     }
}
