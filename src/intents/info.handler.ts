import { AiService } from "@/services/ai.service";

export class InfoHandler {
     private ai = new AiService();

     async execute(user: any, text: string, context: string) {
          if (user.categories && user.categories.length === 0) {
               const conversationHistory = context.split("\n");
               const isFirstInteraction = conversationHistory.length < 3;

               if (isFirstInteraction) {
                    const reply = await this.ai.generateFirstTimeGreeting_Ask(user.name);
                    return { reply };
               }
          }

          const username = user.name || "Usuario";
          const reply = await this.ai.generateConversationalReply(username, context);
          return { reply };
     }
}
