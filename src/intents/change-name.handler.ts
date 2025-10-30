import { AiService } from "@/services/ai.service";
import { UserService } from "@/services/users.service";

export class ChangeNameHandler {
     private ai = new AiService();
     private users = new UserService();

     async execute(user: any, text: string, context: string) {
          const newName = await this.ai.detectNameChange(text);
          if (!newName) {
               return {
                    reply: "No entendí el nombre, ¿puedes repetirlo por favor?",
               };
          }

          await this.users.update(user.id, { name: newName, username: newName });
          const reply = await this.ai.generateNameChangeReply(user.name || "amigo", newName, context);

          return { reply, updatedUser: { ...user, name: newName } };
     }
}
