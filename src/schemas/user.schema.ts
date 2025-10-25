import { z } from "zod";
import { UserRole } from "@prisma/client";

// params comunes
export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "id debe ser numérico"),
});

export const PhoneParamSchema = z.object({
     phone: z.string().min(5, "teléfono inválido"),
});

// body: create
export const CreateUserSchema = z.object({
     phone_number: z.string().min(5, "El número de teléfono es obligatorio").optional(),
     // telegram_user_id se acepta como string de dígitos (se convertirá a BigInt en el controller)
     telegram_user_id: z.string().regex(/^\d+$/, "telegram_user_id inválido").optional(),
     email: z.string().email("Correo inválido").optional(),
     password: z.string().min(6, "Mínimo 6 caracteres").optional(),
     username: z.string().min(3).optional(),
     name: z.string().optional(),
     age: z.number().int().min(0).optional(),
     role: z.nativeEnum(UserRole).optional(),
});

// body: update
export const UpdateUserSchema = z.object({
     phone_number: z.string().min(5).optional(),
     telegram_user_id: z.string().regex(/^\d+$/, "telegram_user_id inválido").optional(),
     email: z.string().email().optional(),
     password: z.string().min(6).optional(),
     username: z.string().min(3).optional(),
     name: z.string().optional(),
     age: z.number().int().min(0).optional(),
     role: z.nativeEnum(UserRole).optional(),
     is_active: z.boolean().optional(),
});

// query para listado
export const ListUsersQuerySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     pageSize: z.coerce.number().int().min(1).max(100).default(20),
     search: z.string().optional(),
     role: z.nativeEnum(UserRole).optional(),
     is_active: z.coerce.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
