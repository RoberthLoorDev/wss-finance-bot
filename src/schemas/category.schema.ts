import { z } from "zod";

export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "id debe ser numérico"),
});

export const CreateCategorySchema = z.object({
     user_id: z.string().regex(/^\d+$/, "user_id debe ser numérico"),
     type_id: z.string().regex(/^\d+$/, "type_id debe ser numérico"),
     name: z.string().min(2, "El nombre es obligatorio"),
     spending_limit: z.coerce.number().positive().optional(),
});

export const UpdateCategorySchema = z.object({
     name: z.string().min(2).optional(),
     user_id: z.string().regex(/^\d+$/, "user_id debe ser numérico"),
     type_id: z.string().regex(/^\d+$/, "type_id debe ser numérico").optional(),
     spending_limit: z.coerce.number().positive().optional(),
});

export const ListCategoriesQuerySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     pageSize: z.coerce.number().int().min(1).max(100).default(20),
     search: z.string().optional(),
     type_id: z.string().regex(/^\d+$/).optional(),
     user_id: z.string().regex(/^\d+$/).optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;
