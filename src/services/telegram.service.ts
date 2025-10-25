import { ENV } from "@/config/env";
import axios from "axios";

export class TelegramService {
     async sendMessage(chatId: number, text: string) {
          try {
               await axios.post(`${ENV.TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text,
               });
          } catch (error: any) {
               console.error("❌ Error enviando mensaje:", error.response?.data || error.message);
          }
     }

     async processMessage(text?: string): Promise<string> {
          if (!text) return "No entendí tu mensaje 😅";

          const lower = text.toLowerCase();

          if (lower.includes("hola")) return "👋 ¡Hola! Soy tu asesor financiero personal.";
          if (lower.includes("ayuda")) return "Puedes decirme: registrar gasto de 50 en comida 🍔";

          return "No entendí eso 🤔. Intenta decir 'hola' o 'ayuda'.";
     }

     async setupWebhook(baseUrl: string) {
          try {
               const webhookUrl = `${baseUrl}/api/telegram/webhook`;
               const res = await axios.post(`${ENV.TELEGRAM_API}/setWebhook`, { url: webhookUrl });
               console.log("✅ Webhook configurado:", res.data);
          } catch (error: any) {
               console.error("❌ Error configurando webhook:", error.response?.data || error.message);
          }
     }
}
