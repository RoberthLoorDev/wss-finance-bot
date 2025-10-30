import { AiService } from "@/services/ai.service";
import { InfoHandler } from "@/intents/info.handler";
import { ChangeNameHandler } from "@/intents/change-name.handler";
import { RegisterTransactionHandler } from "@/intents/register-transaction.handler";

interface IHandler {
     execute(user: any, text: string, context: string): Promise<any>;
}

type HandledIntent = "info" | "change_name" | "register_transaction";

export class ConversationManager {
     private ai = new AiService();

     private handlers: Record<string, IHandler> = {
          info: new InfoHandler(),
          change_name: new ChangeNameHandler(),
          register_transaction: new RegisterTransactionHandler(),
     };

     async process(user: any, text: string, context: string) {
          const intent = await this.ai.detectIntentAdvanced(text, context);
          // intent puede ser: 'info', 'change_name', 'register_transaction', o 'other'

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
