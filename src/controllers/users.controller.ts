import { CreateUserInput, ListUsersQuerySchema, UpdateUserInput } from "@/schemas/user.schema";
import { UserService } from "@/services/users.service";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

// helper
const toBigInt = (n: string) => BigInt(n);

export class UsersController {
     private service = new UserService();

     // POST /api/users
     async create(req: Request<{}, {}, CreateUserInput>, res: Response) {
          try {
               // req.body ya viene validado por middleware
               const body = req.body;

               const hashed = body.password ? await bcrypt.hash(body.password, 10) : null;

               const user = await this.service.create({
                    phone_number: body.phone_number,
                    email: body.email ?? null,
                    password: hashed,
                    username: body.username ?? null,
                    name: body.name ?? null,
                    age: body.age ?? null,
                    role: body.role ?? UserRole.USER,
               });

               return res.status(201).json({ message: "Usuario creado exitosamente", data: user });
          } catch (error: any) {
               if (error?.code === "P2002") {
                    return res.status(409).json({
                         message: "Conflicto de unicidad (correo/username/teléfono ya existe)",
                         meta: error.meta,
                    });
               }
               console.error("❌ create user:", error);
               return res.status(500).json({ message: "Error interno del servidor" });
          }
     }

     // GET /api/users
     async list(req: Request, res: Response) {
          try {
               const { page, pageSize, search, role, is_active } = ListUsersQuerySchema.parse(req.query);
               const result = await this.service.findAll({ page, pageSize, search, role, is_active });
               return res.status(200).json(result);
          } catch (error: any) {
               return res.status(400).json({ message: "Query inválida" });
          }
     }

     // GET /api/users/:id
     async getById(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const user = await this.service.findById(id);
               if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
               return res.status(200).json(user);
          } catch {
               return res.status(400).json({ message: "ID inválido" });
          }
     }

     // GET /api/users/phone/:phone
     async getByPhone(req: Request<{ phone: string }>, res: Response) {
          try {
               const user = await this.service.findByPhone(req.params.phone);
               if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
               return res.status(200).json(user);
          } catch (error) {
               console.error("❌ getByPhone:", error);
               return res.status(500).json({ message: "Error al buscar usuario" });
          }
     }

     // PATCH /api/users/:id
     async update(req: Request<{ id: string }, {}, UpdateUserInput>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const body = req.body;

               const data: any = { ...body };
               if (body.password) data.password = await bcrypt.hash(body.password, 10);

               const user = await this.service.update(id, data);
               return res.status(200).json({ message: "Usuario actualizado correctamente", data: user });
          } catch (error: any) {
               if (error?.code === "P2002") {
                    return res.status(409).json({ message: "Conflicto de unicidad", meta: error.meta });
               }
               console.error("❌ update user:", error);
               return res.status(400).json({ message: "Error al actualizar usuario" });
          }
     }

     // DELETE /api/users/:id
     async remove(req: Request<{ id: string }>, res: Response) {
          try {
               const id = toBigInt(req.params.id);
               const user = await this.service.softDelete(id);
               return res.status(200).json({ message: "Usuario desactivado correctamente", data: user });
          } catch (error) {
               console.error("❌ remove user:", error);
               return res.status(400).json({ message: "Error al desactivar usuario" });
          }
     }
}
