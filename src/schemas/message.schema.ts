import { z } from "zod";

export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "id debe ser numérico"),
});

export const CreateMessageSchema = z.object({
     conversation_id: z.string().regex(/^\d+$/, "conversation_id debe ser numérico"),
     sender: z.string().min(1, "El remitente es obligatorio"),
     text: z.string().min(1, "El texto no puede estar vacío"),
});

export const UpdateMessageSchema = z.object({
     text: z.string().min(1).optional(),
});

export const ListMessagesQuerySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     pageSize: z.coerce.number().int().min(1).max(100).default(50),
     conversation_id: z.string().regex(/^\d+$/, "conversation_id debe ser numérico").optional(),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageSchema>;
export type ListMessagesQuery = z.infer<typeof ListMessagesQuerySchema>;
