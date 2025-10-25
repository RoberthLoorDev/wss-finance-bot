import { z } from "zod";

export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "id debe ser numérico"),
});

// body: create
export const CreateConversationSchema = z.object({
     user_id: z.string().regex(/^\d+$/, "user_id debe ser numérico"),
     title: z.string().min(1, "El título no puede estar vacío").optional(),
     is_active: z.boolean().optional(),
});

// body: update
export const UpdateConversationSchema = z.object({
     title: z.string().min(1).optional(),
     is_active: z.boolean().optional(),
     ended_at: z.string().datetime().optional(),
});

// query para listado
export const ListConversationsQuerySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     pageSize: z.coerce.number().int().min(1).max(100).default(20),
     user_id: z.string().regex(/^\d+$/, "user_id debe ser numérico").optional(),
     is_active: z.coerce.boolean().optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;
export type ListConversationsQuery = z.infer<typeof ListConversationsQuerySchema>;
