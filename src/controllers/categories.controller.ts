import { Request, Response } from "express";
import { CategoryService } from "@/services/categories.service";
import { prisma } from "@/db/prisma.db";
import { CreateCategoryInput, ListCategoriesQuerySchema, UpdateCategoryInput } from "@/schemas/category.schema";
import { successResponse, errorResponse } from "@/helpers/response.helper";

const toBigInt = (n: string) => BigInt(n);

export class CategoriesController {
     private service = new CategoryService();

     // POST /api/categories
     async create(req: Request<{}, {}, CreateCategoryInput>, res: Response) {
          try {
               const { user_id, type_id, name, spending_limit } = req.body;
               const userId = toBigInt(user_id);
               const typeId = toBigInt(type_id);

               const [userExists, typeExists] = await Promise.all([
                    prisma.user.findUnique({ where: { id: userId } }),
                    prisma.type.findUnique({ where: { id: typeId } }),
               ]);

               if (!userExists) return errorResponse(res, "Usuario no encontrado", 404);
               if (!typeExists) return errorResponse(res, "Tipo no encontrado", 404);

               const category = await this.service.create({
                    name,
                    spending_limit: spending_limit ?? null,
                    user: { connect: { id: userId } },
                    type: { connect: { id: typeId } },
               });

               return successResponse(res, "Categoría creada correctamente", category, 201);
          } catch (error) {
               console.error("❌ create category:", error);
               return errorResponse(res, "Error al crear categoría", 500);
          }
     }

     // GET /api/categories
     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, search, user_id, type_id } = ListCategoriesQuerySchema.parse(req.query);

               const result = await this.service.findAll({
                    page,
                    pageSize,
                    search,
                    user_id: user_id ? toBigInt(user_id) : undefined,
                    type_id: type_id ? toBigInt(type_id) : undefined,
               });

               return successResponse(res, "Categorías obtenidas correctamente", result);
          } catch (error) {
               console.error("❌ list categories:", error);
               return errorResponse(res, "Error al listar categorías", 400);
          }
     }

     // GET /api/categories/:id
     async getById(req: Request<{ id: string }, {}, {}, { user_id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const userId = toBigInt(req.query.user_id);

               const category = await this.service.findById(id);
               if (!category) return errorResponse(res, "Categoría no encontrada", 404);

               if (category.user_id !== userId) return errorResponse(res, "No autorizado para acceder a esta categoría", 403);

               return successResponse(res, "Categoría obtenida correctamente", category);
          } catch (error) {
               console.error("❌ getById category:", error);
               return errorResponse(res, "Error al obtener categoría", 400);
          }
     }

     // PATCH /api/categories/:id
     async update(req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const { user_id, name, type_id, spending_limit } = req.body;

               const userId = toBigInt(user_id);

               const existing = await this.service.findById(id);
               if (!existing) return errorResponse(res, "Categoría no encontrada", 404);
               if (existing.user_id !== userId) return errorResponse(res, "No autorizado para modificar esta categoría", 403);

               const data: import("@prisma/client").Prisma.CategoryUpdateInput = {
                    name: name ?? undefined,
                    spending_limit: spending_limit ?? undefined,
                    ...(type_id ? { type: { connect: { id: toBigInt(type_id) } } } : {}),
               };

               const updated = await this.service.update(id, data);
               return successResponse(res, "Categoría actualizada correctamente", updated);
          } catch (error) {
               console.error("❌ update category:", error);
               return errorResponse(res, "Error al actualizar categoría", 400);
          }
     }

     // DELETE /api/categories/:id
     async remove(req: Request<{ id: string }, {}, {}, { user_id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const userId = toBigInt(req.query.user_id);

               const category = await this.service.findById(id);
               if (!category) return errorResponse(res, "Categoría no encontrada", 404);

               if (category.user_id !== userId) return errorResponse(res, "No autorizado para eliminar esta categoría", 403);

               const deleted = await this.service.softDelete(id);
               return successResponse(res, "Categoría eliminada correctamente", deleted);
          } catch (error) {
               console.error("❌ remove category:", error);
               return errorResponse(res, "Error al eliminar categoría", 400);
          }
     }
}
