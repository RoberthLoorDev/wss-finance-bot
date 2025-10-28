import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });

export class AiService {
     /**
      * Genera texto con Gemini según el prompt que se le envíe.
      */
     async generateText(prompt: string): Promise<string> {
          try {
               const result = await model.generateContent(prompt);
               return result.response.text().trim();
          } catch (error: any) {
               console.error("❌ Error en Gemini:", error.message || error);
               return "Hubo un error al procesar tu mensaje con IA 😔";
          }
     }

     /**
      * Mensaje estático de bienvenida rápido
      */
     async generateWelcome(): Promise<string> {
          return "👋 ¡Hola! Soy FinBot, tu asesor financiero personal.\n¿Deseas registrarte o conocer más sobre la app?";
     }

     /**
      * Mensaje estático informativo sobre la app.
      */
     async generateInfoMessage(): Promise<string> {
          return "FinBot te ayuda a registrar tus ingresos y gastos personales de manera sencilla. ¡Pronto podrás probar todas sus funciones!";
     }

     /**
      * Mensaje de bienvenida generado dinámicamente con Gemini.
      * Ideal para saludar usuarios nuevos por nombre (si lo tienes).
      */
     async generateWelcomeMessage(username?: string): Promise<string> {
          const prompt = `
Eres un asistente financiero llamado FinBot.
El usuario ${username ?? "nuevo"} acaba de iniciar conversación en Telegram.

Tu tarea:
- Da una bienvenida cálida y profesional.
- Explica brevemente que eres un asesor financiero que ayuda a registrar ingresos y gastos.
- Pregunta si desea registrarse o solo conocer más sobre la aplicación.
- Responde en español natural y amistoso.
`;
          return this.generateText(prompt);
     }

     /**
      * Saludo personalizado para usuarios registrados.
      */
     async generateGreeting(name: string): Promise<string> {
          const prompt = `
Eres FinBot, un asesor financiero.
El usuario ${name} acaba de escribirte.
Salúdalo por su nombre y recuérdale que puede registrar gastos o consultar su balance.
Usa un tono amistoso, breve y en español.
`;
          return this.generateText(prompt);
     }

     /**
      * Detección simple de intención.
      * Devuelve: "register" | "info" | "other"
      */
     async detectIntent(message: string): Promise<"register" | "info" | "other"> {
          const prompt = `
Analiza el siguiente mensaje de usuario:
"${message}"

Responde SOLO con una palabra EXACTA entre:
- register  (si quiere registrarse o dar su nombre/edad)
- info      (si quiere conocer más de la app)
- other     (si es algo fuera de contexto)
`;
          const output = (await this.generateText(prompt)).toLowerCase();
          if (output.includes("register")) return "register";
          if (output.includes("info")) return "info";
          return "other";
     }
}
