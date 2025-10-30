import { AiService } from "@/services/ai.service";

export class InfoHandler /*implements IIntentHandler*/ {
     private ai = new AiService();

     async execute(user: any, text: string, context: string) {
          const username = user.name || "Usuario";

          const reply = await this.ai.generateConversationalReply(username, context);

          return { reply };
     }
}
