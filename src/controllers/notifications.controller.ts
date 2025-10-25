import { Request, Response } from "express";
import { NotificationsService } from "@/services/notifications.service";
import { CreateNotificationInput, ListNotificationsQuerySchema } from "@/schemas/notification.schema";
import { successResponse, errorResponse } from "@/helpers/response.helper";

const toBigInt = (n: string) => BigInt(n);

export class NotificationsController {
     private service = new NotificationsService();

     // POST /api/notifications
     async create(req: Request<{}, {}, CreateNotificationInput>, res: Response) {
          try {
               const { user_id, title, description, external_id } = req.body;

               const notification = await this.service.create({
                    user: { connect: { id: BigInt(user_id) } },
                    title,
                    description: description ?? null,
                    external_id: external_id ?? null,
               });

               return successResponse(res, "Notificación creada correctamente", notification, 201);
          } catch (error: any) {
               console.error("❌ create notification:", error);
               return errorResponse(res, "Error al crear notificación", 500);
          }
     }

     // GET /api/notifications
     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, user_id, unread } = ListNotificationsQuerySchema.parse(req.query);
               const result = await this.service.findAll({ page, pageSize, user_id, unread });
               return successResponse(res, "Notificaciones obtenidas correctamente", result);
          } catch (error) {
               console.error("❌ list notifications:", error);
               return errorResponse(res, "Error al listar notificaciones", 400);
          }
     }

     // GET /api/notifications/:id
     async getById(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const notification = await this.service.findById(id);
               if (!notification) return errorResponse(res, "Notificación no encontrada", 404);
               return successResponse(res, "Notificación obtenida correctamente", notification);
          } catch {
               return errorResponse(res, "ID inválido", 400);
          }
     }

     // GET /api/notifications/user/:userId
     async getByUser(req: Request<{ userId: string }>, res: Response) {
          try {
               const userId = toBigInt(req.params.userId);
               const items = await this.service.findByUser(userId);
               return successResponse(res, "Notificaciones del usuario obtenidas correctamente", { items });
          } catch (error) {
               console.error("❌ getByUser:", error);
               return errorResponse(res, "Error al obtener notificaciones del usuario", 400);
          }
     }

     // PATCH /api/notifications/:id/read
     async markAsRead(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const notif = await this.service.markAsRead(id);
               return successResponse(res, "Notificación marcada como leída", notif);
          } catch (error) {
               console.error("❌ markAsRead:", error);
               return errorResponse(res, "Error al marcar como leída", 400);
          }
     }

     // PATCH /api/notifications/:id/delete
     async softDelete(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const notif = await this.service.softDelete(id);
               return successResponse(res, "Notificación eliminada correctamente", notif);
          } catch (error) {
               console.error("❌ softDelete:", error);
               return errorResponse(res, "Error al eliminar notificación", 400);
          }
     }
}
