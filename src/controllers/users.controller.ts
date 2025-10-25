import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { CreateUserInput, ListUsersQuerySchema, UpdateUserInput } from "@/schemas/user.schema";
import { UserService } from "@/services/users.service";
import { successResponse, errorResponse } from "@/helpers/response.helper";

const toBigInt = (n: string) => BigInt(n);

export class UsersController {
     private service = new UserService();

     // POST /api/users
     async create(req: Request<{}, {}, CreateUserInput>, res: Response) {
          try {
               const body = req.body;
               const hashed = body.password ? await bcrypt.hash(body.password, 10) : null;

               const createData: any = {
                    phone_number: body.phone_number ?? null,
                    telegram_user_id: body.telegram_user_id ? BigInt(body.telegram_user_id) : null,
                    email: body.email ?? null,
                    password: hashed,
                    username: body.username ?? null,
                    name: body.name ?? null,
                    age: body.age ?? null,
                    role: body.role ?? UserRole.USER,
               };

               const user = await this.service.create(createData);

               return successResponse(res, "Usuario creado exitosamente", user, 201);
          } catch (error: any) {
               if (error?.code === "P2002") {
                    return errorResponse(
                         res,
                         "Conflicto de unicidad (correo/username/teléfono/telegram ya existe)",
                         409,
                         error.meta
                    );
               }
               console.error("❌ create user:", error);
               return errorResponse(res, "Error interno del servidor", 500);
          }
     }

     // GET /api/users
     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, search, role, is_active } = ListUsersQuerySchema.parse(req.query);

               const result = await this.service.findAll({
                    page,
                    pageSize,
                    search,
                    role,
                    is_active,
               });

               // ✅ aquí es donde te fallaba: envolvemos el resultado
               return successResponse(res, "Usuarios obtenidos correctamente", result);
          } catch (error) {
               console.error("❌ list users:", error);
               return errorResponse(res, "Query inválida o error al listar usuarios", 400);
          }
     }

     // GET /api/users/:id
     async getById(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const user = await this.service.findById(id);
               if (!user) return errorResponse(res, "Usuario no encontrado", 404);

               return successResponse(res, "Usuario obtenido correctamente", user);
          } catch {
               return errorResponse(res, "ID inválido", 400);
          }
     }

     // GET /api/users/phone/:phone
     async getByPhone(req: Request<{ phone: string }>, res: Response) {
          try {
               const user = await this.service.findByPhone(req.params.phone);
               if (!user) return errorResponse(res, "Usuario no encontrado", 404);

               return successResponse(res, "Usuario obtenido correctamente", user);
          } catch (error) {
               console.error("❌ getByPhone:", error);
               return errorResponse(res, "Error al buscar usuario", 500);
          }
     }

     // PATCH /api/users/:id
     async update(req: Request<{ id: string }, {}, UpdateUserInput>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const body = req.body;
               const data: any = { ...body };

               if (body.password) {
                    data.password = await bcrypt.hash(body.password, 10);
               }

               // convertir telegram_user_id si viene como string de dígitos
               if (body.telegram_user_id !== undefined) {
                    data.telegram_user_id = body.telegram_user_id === null ? null : BigInt(body.telegram_user_id as any);
               }

               const user = await this.service.update(id, data);
               return successResponse(res, "Usuario actualizado correctamente", user);
          } catch (error: any) {
               if (error?.code === "P2002") {
                    return errorResponse(res, "Conflicto de unicidad", 409, error.meta);
               }
               console.error("❌ update user:", error);
               return errorResponse(res, "Error al actualizar usuario", 400);
          }
     }

     // DELETE /api/users/:id
     async remove(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const user = await this.service.softDelete(id);
               return successResponse(res, "Usuario desactivado correctamente", user);
          } catch (error) {
               console.error("❌ remove user:", error);
               return errorResponse(res, "Error al desactivar usuario", 400);
          }
     }
}
