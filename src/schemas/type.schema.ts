import { z } from "zod";

export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "id debe ser numérico"),
});

export const CreateTypeSchema = z.object({
     name: z.string().min(3, "El nombre es obligatorio y debe tener al menos 3 caracteres"),
});

export const UpdateTypeSchema = z.object({
     name: z.string().min(3).optional(),
});

export const ListTypesQuerySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     pageSize: z.coerce.number().int().min(1).max(100).default(20),
     search: z.string().optional(),
     includeDeleted: z.coerce.boolean().optional(),
});

export type CreateTypeInput = z.infer<typeof CreateTypeSchema>;
export type UpdateTypeInput = z.infer<typeof UpdateTypeSchema>;
export type ListTypesQuery = z.infer<typeof ListTypesQuerySchema>;
