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

     async detectIntentAdvanced(
          message: string,
          context: string
     ): Promise<"info" | "change_name" | "register_transaction" | "other"> {
          const prompt = `
               Eres un analizador de intenciones para un asistente financiero.

               Historial de conversación:
               ${context}

               Mensaje actual: "${message}"

               Responde con UNA palabra exacta:
               - change_name
               - register_transaction
               - info
               - other
               `;
          const output = (await this.generateText(prompt)).toLowerCase();
          if (output.includes("change_name")) return "change_name";
          if (output.includes("register_transaction")) return "register_transaction";
          if (output.includes("info")) return "info";
          return "other";
     }

     async generateNameChangeReply(username: string, newName: string, context: string): Promise<string> {
          const prompt = PromptTemplates.generateNameChangeReply(username, newName, context);
          return this.generateText(prompt);
     }

     async detectNameChange(message: string): Promise<string | null> {
          const prompt = PromptTemplates.detectNameChange(message);
          const output = (await this.generateText(prompt)).trim();

          if (output.toUpperCase() === "NULL" || output.length > 30) {
               return null;
          }

          return output; // return the name
     }
}
