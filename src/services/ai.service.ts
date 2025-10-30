import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "@/config/env";
import { PromptTemplates } from "@/config/prompt-templates";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });

export class AiService {
     private async generateText(prompt: string): Promise<string> {
          try {
               const result = await model.generateContent(prompt);
               return result.response.text().trim();
          } catch (error: any) {
               console.error("❌ Error en Gemini:", error.message || error);
               return "Hubo un error al procesar tu mensaje 😔";
          }
     }

     async generateConversationalReply(username: string, context: string): Promise<string> {
          const prompt = PromptTemplates.generateConversationalReply(username, context);
          return this.generateText(prompt);
     }

     async generateInfoMessage(): Promise<string> {
          return Promise.resolve(PromptTemplates.getInfoMessage());
     }

     async generateGreeting(name: string): Promise<string> {
          const prompt = PromptTemplates.generateGreeting(name);
          return this.generateText(prompt);
     }

     async detectIntent(message: string): Promise<"register" | "info" | "other"> {
          const prompt = PromptTemplates.detectIntent(message);
          const output = (await this.generateText(prompt)).toLowerCase();

          if (output.includes("register")) return "register";
          if (output.includes("info")) return "info";
          return "other";
     }
}
