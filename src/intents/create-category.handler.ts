import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";
import { TypeService } from "@/services/types.service";

export class CreateCategoryHandler {
     private ai = new AiService();
     private categories = new CategoryService();
     private types = new TypeService();

     async execute(user: any, text: string, context: string) {
          // extraer las dos partes: Nombre y Tipo
          const extracted = await this.ai.extractCategoryInfo(text);
          // 'extracted' debería ser algo como { categoryName: "Mascotas", typeName: "gasto" }

          if (!extracted || !extracted.categoryName || !extracted.typeName) {
               return {
                    reply: "No te entendí bien. ¿Puedes repetirme el nombre de la categoría y su tipo? (ej: 'Sueldo, Ingreso')",
               };
          }

          const { categoryName, typeName } = extracted;

          // ID del Tipo en la BD
          const { items: foundTypes } = await this.types.findAll({ page: 1, pageSize: 1, search: typeName });

          if (foundTypes.length === 0) {
               return { reply: `No encontré el tipo "${typeName}". Los tipos disponibles son Ingresos, Gastos y Ahorros.` };
          }
          const type = foundTypes[0];

          // Crear la categoría
          try {
               await this.categories.create({
                    name: categoryName,
                    user: { connect: { id: user.id } },
                    type: { connect: { id: type.id } },
               });

               const reply = await this.ai.generateCategoryCreatedReply(categoryName, typeName);
               return { reply };
          } catch (error) {
               console.error("Error creando categoría:", error);
               return { reply: "Hubo un error al guardar tu categoría. Avísale a mi creador 😔." };
          }
     }
}
