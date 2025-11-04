import { ENV } from "@/config/env";
import { PromptTemplates } from "@/config/prompt-templates";
import { ExtractedCategoryInfo, ExtractedUpdateInfo } from "@/types/ia.types";
import {
     ExtractedTransactionFilters,
     ExtractedTransactionInfo,
     ParsedDateQuery,
     ExtractedTransactionUpdateSlots,
} from "@/types/transaction.types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Category, Transaction, Type } from "@prisma/client";

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

     async detectIntentAdvanced(
          message: string,
          context: string
     ): Promise<
          | "info"
          | "change_name"
          | "register_transaction"
          | "create_category"
          | "request_onboarding_help"
          | "other"
          | "check_categories"
          | "update_category"
          | "update_transaction"
          | "create_transaction"
          | "check_transactions"
     > {
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

          - create_transaction: El usuario quiere registrar un gasto o ingreso (sinónimo de register_transaction).
          (Ej: "gasté 50 en...", "me pagaron 1000")

          - change_name: El usuario quiere cambiar su nombre.
          (Ej: "llámame Pepe")

          - info: Es un saludo, una despedida, o charla general que no encaja en lo anterior.
          (Ej: "hola", "gracias", "cuánto es 2+2")
          
          - check_categories: El usuario quiere ver, consultar o listar sus categorías existentes. 
          (Ej: "¿cuáles son mis categorías?", "ver mis categorías", "dime mis categorías")

          - check_transactions: El usuario quiere ver, consultar, listar o un reporte de sus **movimientos o transacciones**.
          (Ej: "ver mis gastos", "cuánto gasté en comida", "reporte de este mes", "dame los movimientos de ayer")

          - update_category: El usuario quiere **RENOMBRAR** una categoría existente. Quiere que el nombre de la categoría en sí cambie.
          (Ej: "renombra la categoría", "cambia el nombre a mascotas por Animales", "actualiza 'comida' a 'Alimentos'")
          
          - update_transaction: El usuario quiere **MODIFICAR** o **ASIGNAR** una transacción (un movimiento de dinero) a una categoría. La categoría en sí no cambia, pero la transacción se guarda *dentro* de ella.
          (Ej: "quiero editar la última transacción", "actualiza el gasto de la cena", "mueve el pago de 50 a otra categoría", "quiero que la ultima transaccion la agregues a la categoria familia")

          - other: Cualquier otra cosa.
          `;

          const output = (await this.generateText(prompt)).toLowerCase().trim();

          if (output.includes("create_category")) return "create_category";
          if (output.includes("request_onboarding_help")) return "request_onboarding_help";
          if (output.includes("register_transaction")) return "register_transaction";
          if (output.includes("change_name")) return "change_name";
          if (output.includes("check_categories")) return "check_categories";
          if (output.includes("update_transaction")) return "update_transaction";
          if (output.includes("update_category")) return "update_category";
          if (output.includes("check_transactions")) return "check_transactions";
          if (output.includes("create_transaction")) return "create_transaction";
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

     async generateCategoryListReply(username: string, categories: (Category & { type?: Type | null })[]): Promise<string> {
          const prompt = PromptTemplates.generateCategoryListReply(username, categories);
          return this.generateText(prompt);
     }

     async generateNoCategoriesReply(username: string): Promise<string> {
          const prompt = PromptTemplates.generateNoCategoriesReply(username);
          return this.generateText(prompt);
     }

     async extractUpdateCategoryInfo(message: string): Promise<ExtractedUpdateInfo | null> {
          const prompt = PromptTemplates.extractUpdateCategoryInfo(message);
          try {
               const rawOutput = (await this.generateText(prompt)).replace(/```json\n?|\n?```/g, "").trim();
               const parsed = JSON.parse(rawOutput) as ExtractedUpdateInfo;
               return parsed;
          } catch (error) {
               console.error("❌ Error al parsear JSON (extractUpdateCategoryInfo):", error);
               return null;
          }
     }

     async findBestCategoryMatch(targetName: string, categoryNames: string[]): Promise<string | null> {
          const prompt = PromptTemplates.findBestCategoryMatch(targetName, categoryNames);
          const match = await this.generateText(prompt);

          if (match.toUpperCase() === "NULL" || match.length > 50) {
               return null;
          }
          return match;
     }

     async generateCategoryUpdatedReply(oldName: string, newName: string): Promise<string> {
          const prompt = PromptTemplates.generateCategoryUpdatedReply(oldName, newName);
          return this.generateText(prompt);
     }

     async extractTransactionInfo(message: string): Promise<ExtractedTransactionInfo | null> {
          const prompt = PromptTemplates.extractTransactionInfo(message);
          try {
               const rawOutput = (await this.generateText(prompt)).replace(/```json\n?|\n?```/g, "").trim();
               const parsed = JSON.parse(rawOutput) as ExtractedTransactionInfo;

               if (parsed.amount === null || parsed.description === null) {
                    return null;
               }
               return parsed;
          } catch (error) {
               console.error("❌ Error al parsear JSON (extractTransactionInfo):", error);
               return null;
          }
     }

     async generateTransactionCreatedReply(amount: number, description: string, categoryName: string): Promise<string> {
          const prompt = PromptTemplates.generateTransactionCreatedReply(amount, description, categoryName);
          return this.generateText(prompt);
     }

     async generateAskForCategoryReply(
          username: string,
          amount: number,
          description: string,
          categories: (Category & { type?: Type | null })[]
     ): Promise<string> {
          const prompt = PromptTemplates.generateAskForCategoryReply(username, amount, description, categories);
          return this.generateText(prompt);
     }

     async extractTransactionUpdateSlots(
          message: string,
          context: string,
          categoryNames: string[]
     ): Promise<ExtractedTransactionUpdateSlots | null> {
          const prompt = PromptTemplates.extractTransactionUpdateSlots(message, context, categoryNames);
          try {
               const rawOutput = (await this.generateText(prompt)).replace(/```json\n?|\n?```/g, "").trim();
               const parsed = JSON.parse(rawOutput) as ExtractedTransactionUpdateSlots;
               return parsed;
          } catch (error) {
               console.error("❌ Error al parsear JSON (extractTransactionUpdateSlots):", error);
               return null;
          }
     }

     async generateAskForTransactionDescription(username: string): Promise<string> {
          const prompt = PromptTemplates.generateAskForTransactionDescription(username);
          return this.generateText(prompt);
     }

     async generateConfirmTransactionFound(
          username: string,
          transaction: Transaction,
          categories: (Category & { type?: Type | null })[]
     ): Promise<string> {
          const prompt = PromptTemplates.generateConfirmTransactionFound(username, transaction, categories);
          return this.generateText(prompt);
     }

     async generateTransactionUpdatedReply(description: string, newCategoryName: string): Promise<string> {
          const prompt = PromptTemplates.generateTransactionUpdatedReply(description, newCategoryName);
          return this.generateText(prompt);
     }

     // extraer filtros de transacciones
     async extractTransactionFilters(message: string): Promise<ExtractedTransactionFilters | null> {
          const prompt = PromptTemplates.extractTransactionFilters(message);
          try {
               const rawOutput = (await this.generateText(prompt)).replace(/```json\n?|\n?```/g, "").trim();
               const parsed = JSON.parse(rawOutput) as ExtractedTransactionFilters;
               return parsed;
          } catch (error) {
               console.error("❌ Error al parsear JSON (extractTransactionFilters):", error);
               return null;
          }
     }

     async parseDateQuery(dateQuery: string, currentDate: string): Promise<ParsedDateQuery | null> {
          const prompt = PromptTemplates.parseDateQuery(dateQuery, currentDate);
          try {
               const rawOutput = (await this.generateText(prompt)).replace(/```json\n?|\n?```/g, "").trim();
               const parsed = JSON.parse(rawOutput) as ParsedDateQuery;
               return parsed;
          } catch (error) {
               console.error("❌ Error al parsear JSON (parseDateQuery):", error);
               return null;
          }
     }

     async generateTransactionListReply(
          username: string,
          transactions: (Transaction & { category?: Category | null })[],
          filterDescription: string
     ): Promise<string> {
          const prompt = PromptTemplates.generateTransactionListReply(username, transactions, filterDescription);
          return this.generateText(prompt);
     }

     async generateNoTransactionsFoundReply(username: string, filterDescription: string): Promise<string> {
          const prompt = PromptTemplates.generateNoTransactionsFoundReply(username, filterDescription);
          return this.generateText(prompt);
     }

     async generateCategoryNotFoundForFilterReply(username: string, categoryName: string): Promise<string> {
          const prompt = PromptTemplates.generateCategoryNotFoundForFilterReply(username, categoryName);
          return this.generateText(prompt);
     }
}
