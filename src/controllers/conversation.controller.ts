import { Request, Response } from "express";
import { CreateConversationInput, ListConversationsQuerySchema, UpdateConversationInput } from "@/schemas/conversation.schema";
import { ConversationService } from "@/services/conversation.service";
import { successResponse, errorResponse } from "@/helpers/response.helper";

const toBigInt = (n: string) => BigInt(n);

export class ConversationsController {
     private service = new ConversationService();

     async create(req: Request<{}, {}, CreateConversationInput>, res: Response) {
          try {
               const data = req.body;
               const createData: any = {
                    user: { connect: { id: toBigInt(data.user_id) } },
                    title: data.title ?? null,
                    is_active: data.is_active ?? true,
               };

               const conversation = await this.service.create(createData);
               return successResponse(res, "Conversación creada exitosamente", conversation, 201);
          } catch (error) {
               console.error("❌ create conversation:", error);
               return errorResponse(res, "Error al crear conversación", 500);
          }
     }

     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, user_id, is_active } = ListConversationsQuerySchema.parse(req.query);
               const result = await this.service.findAll({
                    page,
                    pageSize,
                    user_id: user_id ? toBigInt(user_id) : undefined,
                    is_active,
               });
               return successResponse(res, "Conversaciones obtenidas correctamente", result);
          } catch (error) {
               console.error("❌ list conversations:", error);
               return errorResponse(res, "Error al listar conversaciones", 400);
          }
     }

     async getById(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const conversation = await this.service.findById(id);
               if (!conversation) return errorResponse(res, "Conversación no encontrada", 404);
               return successResponse(res, "Conversación obtenida correctamente", conversation);
          } catch {
               return errorResponse(res, "ID inválido", 400);
          }
     }

     async update(req: Request<{ id: string }, {}, UpdateConversationInput>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const conversation = await this.service.update(id, req.body);
               return successResponse(res, "Conversación actualizada correctamente", conversation);
          } catch (error) {
               console.error("❌ update conversation:", error);
               return errorResponse(res, "Error al actualizar conversación", 400);
          }
     }

     async end(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const conversation = await this.service.softEnd(id);
               return successResponse(res, "Conversación finalizada correctamente", conversation);
          } catch (error) {
               console.error("❌ end conversation:", error);
               return errorResponse(res, "Error al finalizar conversación", 400);
          }
     }
}
