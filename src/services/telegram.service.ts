import { ENV } from "@/config/env";
import { prisma } from "@/db/prisma.db";
import { MessageService } from "@/services/message.service";
import { UserService } from "@/services/users.service";
import axios from "axios";
import { ConversationManager } from "./conversation.manager";

export class TelegramService {
     private users = new UserService();
     private messages = new MessageService();
     private manager = new ConversationManager();

     // Enviar mensaje a un chat de Telegram usando parseo de Markdown o HTML
     async sendMessage(chatId: number | string, text: string, parseMode: "Markdown" | "MarkdownV2" | "HTML" = "HTML") {
          try {
               await axios.post(`${ENV.TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text,
                    parse_mode: parseMode,
               });
          } catch (error: any) {
               console.error("Error sending message:", error.response?.data || error.message);
          }
     }

     async setupWebhook(baseUrl: string) {
          try {
               const webhookUrl = `${baseUrl}/api/telegram/webhook`;
               const res = await axios.post(`${ENV.TELEGRAM_API}/setWebhook`, {
                    url: webhookUrl,
                    drop_pending_updates: true,
               });
               console.log("✅ Webhook set:", res.data);
          } catch (error: any) {
               console.error("Error setting webhook:", error.response?.data || error.message);
          }
     }

     async handleUpdate(update: any) {
          try {
               const message =
                    update.message ||
                    update.edited_message ||
                    update.callback_query?.message ||
                    update.channel_post ||
                    update.edited_channel_post;

               if (!message) {
                    console.debug("Telegram update with no relevant message:", update);
                    return;
               }

               const text = message.text ?? message.caption;
               if (!text) return;

               const chatId = String(message.chat?.id);
               const telegramId = BigInt(String(message.chat?.id));
               const name = message.chat?.first_name || "Usuario";
               const username = message.chat?.username || name;

               // Check or create the user
               let user = await this.users.findByTelegramId(telegramId, {
                    include: { categories: true }, // add categories relation
               });

               if (!user) {
                    user = await this.users.create({
                         telegram_user_id: telegramId,
                         name,
                         username,
                    });
                    user = { ...user };
                    console.log(`New user registered: ${name} (${telegramId})`);
               }

               // Check or create the conversation
               let conversation = await prisma.conversation.findFirst({
                    where: { user_id: user.id, is_active: true },
               });

               if (!conversation) {
                    conversation = await prisma.conversation.create({
                         data: { user_id: user.id, title: "Chat con FinBot" },
                    });
               }

               // Save the user's message
               await this.messages.create({
                    conversation: { connect: { id: conversation!.id } },
                    sender: "user",
                    text,
               });

               // obtain context
               const history = await this.messages.getRecentMessages(conversation.id, 20);
               const context = history
                    .map((m) => `${m.sender === "user" ? user?.name ?? "Usuario" : "Eira"}: ${m.text}`)
                    .join("\n");

               // process conversation
               const { reply, updatedUser } = await this.manager.process(user, text, context);

               // guardar respuesta
               await this.messages.create({
                    conversation: { connect: { id: conversation.id } },
                    sender: "bot",
                    text: reply,
               });

               // enviar mensaje
               await this.sendMessage(chatId, reply);

               // actualizar user en memoria si cambió
               if (updatedUser) user = updatedUser;
          } catch (error: any) {
               console.error("❌ Telegram handleUpdate error:", error.message || error);
          }
     }
}
