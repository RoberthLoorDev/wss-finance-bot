import { AiService } from "@/services/ai.service";
import { InfoHandler } from "@/intents/info.handler";
import { ChangeNameHandler } from "@/intents/change-name.handler";
import { RegisterTransactionHandler } from "@/intents/register-transaction.handler";
import { TypeService } from "@/services/types.service";
import { CreateCategoryHandler } from "@/intents/create-category.handler";
import { OnboardingHelpHandler } from "@/intents/onboarding-help.handler";
import { CheckCategoriesHandler } from "@/intents/check-categories.handler";
import { UpdateCategoryHandler } from "@/intents/update-category.handler";
import { UpdateTransactionHandler } from "@/intents/update-transaction.handler";
import { CheckTransactionsHandler } from "@/intents/check-transactions.handler";

interface IHandler {
     execute(user: any, text: string, context: string): Promise<any>;
}

type HandledIntent =
     | "info"
     | "change_name"
     | "register_transaction"
     | "create_category"
     | "update_category"
     | "check_categories"
     | "update_transaction"
     | "create_transaction"
     | "check_transactions"
     | "other";

export class ConversationManager {
     private ai = new AiService();
     private types = new TypeService();

     private handlers: Record<string, IHandler> = {
          info: new InfoHandler(),
          change_name: new ChangeNameHandler(),
          register_transaction: new RegisterTransactionHandler(),
          create_category: new CreateCategoryHandler(),
          request_onboarding_help: new OnboardingHelpHandler(),
          check_categories: new CheckCategoriesHandler(),
          update_category: new UpdateCategoryHandler(),
          update_transaction: new UpdateTransactionHandler(),
          create_transaction: new RegisterTransactionHandler(),
          check_transactions: new CheckTransactionsHandler(),
     };

     async process(user: any, text: string, context: string) {
          const intent = await this.ai.detectIntentAdvanced(text, context);
          // intent puede ser: 'info', 'change_name', 'register_transaction', 'create_category', 'request_onboarding_help' o 'other'

          if (intent === "register_transaction" && (!user.categories || user.categories.length === 0)) {
               const { items: allTypes } = await this.types.findAll({ page: 1, pageSize: 10 });
               const reply = await this.ai.generateCategoryOnboardingReply(user.name, allTypes);
               return { reply }; // retorna inmediatamente si no hay categorías
          }

          let handlerToExecute: IHandler;

          if (intent in this.handlers) {
               handlerToExecute = this.handlers[intent];
          } else {
               handlerToExecute = this.handlers.info;
          }

          const result = await handlerToExecute.execute(user, text, context);

          return result;
     }
}
