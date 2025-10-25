import { Request, Response } from "express";
import { CreateMessageInput, ListMessagesQuerySchema, UpdateMessageInput } from "@/schemas/message.schema";
import { MessageService } from "@/services/message.service";
import { successResponse, errorResponse } from "@/helpers/response.helper";

const toBigInt = (n: string) => BigInt(n);

export class MessagesController {
     private service = new MessageService();

     async create(req: Request<{}, {}, CreateMessageInput>, res: Response) {
          try {
               const body = req.body;
               const createData: any = {
                    sender: body.sender,
                    text: body.text,
                    conversation: { connect: { id: toBigInt(body.conversation_id) } },
               };
               const message = await this.service.create(createData);
               return successResponse(res, "Mensaje creado correctamente", message, 201);
          } catch (error) {
               console.error("❌ create message:", error);
               return errorResponse(res, "Error al crear mensaje", 500);
          }
     }

     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, conversation_id } = ListMessagesQuerySchema.parse(req.query);
               const result = await this.service.findAll({
                    page,
                    pageSize,
                    conversation_id: conversation_id ? toBigInt(conversation_id) : undefined,
               });
               return successResponse(res, "Mensajes obtenidos correctamente", result);
          } catch (error) {
               console.error("❌ list messages:", error);
               return errorResponse(res, "Error al listar mensajes", 400);
          }
     }

     async update(req: Request<{ id: string }, {}, UpdateMessageInput>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const message = await this.service.update(id, req.body);
               return successResponse(res, "Mensaje actualizado correctamente", message);
          } catch (error) {
               console.error("❌ update message:", error);
               return errorResponse(res, "Error al actualizar mensaje", 400);
          }
     }

     async remove(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const deleted = await this.service.delete(id);
               return successResponse(res, "Mensaje eliminado correctamente", deleted);
          } catch (error) {
               console.error("❌ remove message:", error);
               return errorResponse(res, "Error al eliminar mensaje", 400);
          }
     }
}
