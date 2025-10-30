import { AiService } from "@/services/ai.service";
import { InfoHandler } from "@/intents/info.handler";
import { ChangeNameHandler } from "@/intents/change-name.handler";
import { RegisterTransactionHandler } from "@/intents/register-transaction.handler";
import { TypeService } from "@/services/types.service";
import { CreateCategoryHandler } from "@/intents/create-category.handler";
import { OnboardingHelpHandler } from "@/intents/onboarding-help.handler";

interface IHandler {
     execute(user: any, text: string, context: string): Promise<any>;
}

type HandledIntent = "info" | "change_name" | "register_transaction" | "create_category" | "other";

export class ConversationManager {
     private ai = new AiService();
     private types = new TypeService();

     private handlers: Record<string, IHandler> = {
          info: new InfoHandler(),
          change_name: new ChangeNameHandler(),
          register_transaction: new RegisterTransactionHandler(),
          create_category: new CreateCategoryHandler(),
          request_onboarding_help: new OnboardingHelpHandler(),
     };

     async process(user: any, text: string, context: string) {
          const intent = await this.ai.detectIntentAdvanced(text, context);
          // intent puede ser: 'info', 'change_name', 'register_transaction', o 'other'

          if (intent === "register_transaction" && (!user.categories || user.categories.length === 0)) {
               const { items: allTypes } = await this.types.findAll({ page: 1, pageSize: 10 });
               const reply = await this.ai.generateCategoryOnboardingReply(user.name, allTypes);
               return { reply }; // Devolvemos la respuesta de onboarding y terminamos.
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
