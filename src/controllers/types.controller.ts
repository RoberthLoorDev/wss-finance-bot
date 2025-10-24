import { Request, Response } from "express";
import { TypeService } from "@/services/types.service";
import { CreateTypeInput, ListTypesQuerySchema, UpdateTypeInput } from "@/schemas/type.schema";
import { successResponse, errorResponse } from "@/helpers/response.helper";

const toBigInt = (n: string) => BigInt(n);

export class TypesController {
     private service = new TypeService();

     // POST /api/types
     async create(req: Request<{}, {}, CreateTypeInput>, res: Response) {
          try {
               const body = req.body;
               const type = await this.service.create({ name: body.name });
               return successResponse(res, "Tipo creado exitosamente", type, 201);
          } catch (error) {
               console.error("❌ create type:", error);
               return errorResponse(res, "Error al crear tipo", 500);
          }
     }

     // GET /api/types
     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, search, includeDeleted } = ListTypesQuerySchema.parse(req.query);
               const result = await this.service.findAll({ page, pageSize, search, includeDeleted });
               return successResponse(res, "Tipos obtenidos correctamente", result);
          } catch (error) {
               console.error("❌ list types:", error);
               return errorResponse(res, "Error al listar tipos", 400);
          }
     }

     // GET /api/types/:id
     async getById(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const type = await this.service.findById(id);
               if (!type) return errorResponse(res, "Tipo no encontrado", 404);
               return successResponse(res, "Tipo obtenido correctamente", type);
          } catch {
               return errorResponse(res, "ID inválido", 400);
          }
     }

     // PATCH /api/types/:id
     async update(req: Request<{ id: string }, {}, UpdateTypeInput>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const updated = await this.service.update(id, req.body);
               return successResponse(res, "Tipo actualizado correctamente", updated);
          } catch (error) {
               console.error("❌ update type:", error);
               return errorResponse(res, "Error al actualizar tipo", 400);
          }
     }

     // DELETE /api/types/:id
     async remove(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const deleted = await this.service.softDelete(id);
               return successResponse(res, "Tipo eliminado correctamente", deleted);
          } catch (error) {
               console.error("❌ remove type:", error);
               return errorResponse(res, "Error al eliminar tipo", 400);
          }
     }
}
