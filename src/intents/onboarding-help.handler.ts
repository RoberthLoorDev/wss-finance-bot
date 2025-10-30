import { AiService } from "@/services/ai.service";
import { TypeService } from "@/services/types.service";

export class OnboardingHelpHandler {
     private ai = new AiService();
     private types = new TypeService();

     async execute(user: any, text: string, context: string) {
          // tipos dinámicamente
          const { items: allTypes } = await this.types.findAll({ page: 1, pageSize: 10 });

          const reply = await this.ai.generateOnboardingExplanation(user.name, allTypes);
          return { reply };
     }
}
