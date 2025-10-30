import { ENV } from "@/config/env";
import { errorResponse, successResponse } from "@/helpers/response.helper";
import { TelegramUpdateSchema } from "@/schemas/telegram.schema";
import { TelegramService } from "@/services/telegram.service";
import { Request, Response } from "express";

export class TelegramController {
     private service = new TelegramService();

     // POST /api/telegram/webhook
     async webhook(req: Request, res: Response) {
          try {
               const update = TelegramUpdateSchema.parse(req.body);
               await this.service.handleUpdate(update);
               return successResponse(res, "Update recibido", {}, 200);
          } catch (error) {
               console.error("❌ Telegram webhook:", error);
               return errorResponse(res, "Error procesando actualización de Telegram", 500);
          }
     }

     // GET /api/telegram/setup
     async setup(req: Request, res: Response) {
          try {
               const baseUrl = ENV.NGROK_URL!;
               await this.service.setupWebhook(baseUrl);
               return successResponse(res, "Webhook configurado correctamente");
          } catch (error) {
               return errorResponse(res, "Error al configurar webhook", 500);
          }
     }
}
