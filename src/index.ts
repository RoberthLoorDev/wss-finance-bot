import { Server } from "./core/server";
import { ENV } from "./config/env";
import { TelegramService } from "./services/telegram.service";

const server = new Server(ENV.PORT);
server.listen();

// Setup automático del webhook de Telegram al iniciar el servidor.
// Se ejecuta de forma asíncrona y no bloquea el arranque. Requiere que
if (ENV.NGROK_URL) {
     const telegramService = new TelegramService();
     telegramService.setupWebhook(ENV.NGROK_URL).catch((err) => console.error("❌ Error auto-configurando webhook:", err));
} else {
     console.log("ℹ️ NGROK_URL no configurada. Saltando setup automático de webhook.");
}
