import { ENV } from "@/config/env";
import axios from "axios";
import { AiService } from "@/services/ai.service";
import { UserService } from "@/services/users.service";
import { MessageService } from "@/services/message.service";
import { prisma } from "@/db/prisma.db";

export class TelegramService {
     private ai = new AiService();
     private users = new UserService();
     private messages = new MessageService();

     async sendMessage(chatId: number | string, text: string) {
          try {
               await axios.post(`${ENV.TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text,
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
               let user = await this.users.findByTelegramId(telegramId);
               if (!user) {
                    user = await this.users.create({
                         telegram_user_id: telegramId,
                         name,
                         username,
                    });
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
                    conversation: { connect: { id: conversation.id } }, // connect by relation
                    sender: "user",
                    text,
               });

               // Get the last 20 messages for context
               const history = await this.messages.getRecentMessages(conversation.id, 20);

               const context = history
                    .map((m) => `${m.sender === "user" ? `${user.name || "Usuario"}` : "FinBot"}: ${m.text}`)
                    .join("\n");

               // Generate a contextual reply
               const reply = await this.ai.generateConversationalReply(user.name || "amigo", context);

               // Send the reply
               await this.sendMessage(chatId, reply);

               // Save the bot's reply
               await this.messages.create({
                    conversation: { connect: { id: conversation.id } },
                    sender: "bot",
                    text: reply,
               });
          } catch (error: any) {
               console.error("❌ Telegram handleUpdate error:", error.message || error);
          }
     }
}
