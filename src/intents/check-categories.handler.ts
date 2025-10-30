import { AiService } from "@/services/ai.service";
import { CategoryService } from "@/services/categories.service";

export class CheckCategoriesHandler {
     private ai = new AiService();
     private categories = new CategoryService();
     async execute(user: any, text: string, context: string) {
          const { items: userCategories } = await this.categories.findAll({
               page: 1,
               pageSize: 100,
               user_id: user.id,
          });

          if (userCategories.length === 0) {
               const reply = await this.ai.generateNoCategoriesReply(user.name);
               return { reply };
          } else {
               const reply = await this.ai.generateCategoryListReply(user.name, userCategories);
               return { reply };
          }
     }
}
