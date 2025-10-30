import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "@/config/env";
import { PromptTemplates } from "@/config/prompt-templates";
import { Type } from "@prisma/client";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });

interface ExtractedCategoryInfo {
     categoryName: string | null;
     typeName: string | null;
}

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

     async detectIntentAdvanced(
          message: string,
          context: string
     ): Promise<"info" | "change_name" | "register_transaction" | "create_category" | "request_onboarding_help" | "other"> {
          const prompt = `
          Eres un analizador de intenciones para un asistente financiero.
          Tu objetivo es clasificar el "Mensaje actual" del usuario en UNA categoría.

          Historial de conversación:
          ${context}

          Mensaje actual: "${message}"

          Analiza el "Mensaje actual" en el "Historial de conversación".
          Responde con UNA palabra exacta de la siguiente lista:

          - create_category: El usuario está intentando **crear una categoría específica**.
          (Ej: "crea la categoría Mascotas, Gasto", "Sueldo, Ingreso", "Quiero añadir 'Compras'")

          - request_onboarding_help: El usuario está pidiendo **información general sobre CÓMO crear categorías** o respondiendo "sí" a una pregunta de bienvenida.
          (Ej: "sí", "explícame", "ayúdame a empezar", "¿cómo se crean?", "¿cuáles son los pasos?", "cómo lo hago")

          - register_transaction: El usuario quiere registrar un gasto o ingreso.
          (Ej: "gasté 50 en...", "me pagaron 1000")

          - change_name: El usuario quiere cambiar su nombre.
          (Ej: "llámame Pepe")

          - info: Es un saludo, una despedida, o charla general que no encaja en lo anterior.
          (Ej: "hola", "gracias", "cuánto es 2+2")

          - other: Cualquier otra cosa.
          `;

          const output = (await this.generateText(prompt)).toLowerCase().trim();

          if (output.includes("create_category")) return "create_category";
          if (output.includes("request_onboarding_help")) return "request_onboarding_help";
          if (output.includes("register_transaction")) return "register_transaction";
          if (output.includes("change_name")) return "change_name";
          if (output.includes("info")) return "info";
          return "other";
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

     async generateCategoryOnboardingReply(username: string, types: Type[]): Promise<string> {
          const prompt = PromptTemplates.generateCategoryOnboardingReply(username, types);
          return this.generateText(prompt);
     }

     async generateFirstTimeGreeting(name: string, types: Type[]): Promise<string> {
          const prompt = PromptTemplates.generateFirstTimeGreeting(name, types);
          return this.generateText(prompt);
     }

     async generateFirstTimeGreeting_Ask(name: string): Promise<string> {
          const prompt = PromptTemplates.generateFirstTimeGreeting_Ask(name);
          return this.generateText(prompt);
     }

     async generateOnboardingExplanation(name: string, types: Type[]): Promise<string> {
          const prompt = PromptTemplates.generateOnboardingExplanation(name, types);
          return this.generateText(prompt);
     }

     async extractCategoryInfo(message: string): Promise<ExtractedCategoryInfo | null> {
          const prompt = PromptTemplates.extractCategoryInfo(message);

          try {
               const rawOutput = await this.generateText(prompt);

               const cleanedOutput = rawOutput.replace(/```json\n?|\n?```/g, "").trim();

               const parsed = JSON.parse(cleanedOutput) as ExtractedCategoryInfo;
               return parsed;
          } catch (error) {
               console.error("❌ Error al parsear JSON de Gemini (extractCategoryInfo):", error);

               return null;
          }
     }

     async generateCategoryCreatedReply(categoryName: string, typeName: string): Promise<string> {
          const prompt = PromptTemplates.generateCategoryCreatedReply(categoryName, typeName);
          return this.generateText(prompt);
     }
}
