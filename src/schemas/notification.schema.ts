import { z } from "zod";

export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "id debe ser numérico"),
});

export const UserIdParamSchema = z.object({
     userId: z.string().regex(/^\d+$/, "userId debe ser numérico"),
});

export const CreateNotificationSchema = z.object({
     user_id: z.string().regex(/^\d+$/, "user_id debe ser numérico"),
     title: z.string().min(3, "Título obligatorio"),
     description: z.string().optional(),
     external_id: z.string().optional(),
});

export const ListNotificationsQuerySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     pageSize: z.coerce.number().int().min(1).max(100).default(20),
     user_id: z.string().regex(/^\d+$/, "user_id debe ser numérico").optional(),
     unread: z.coerce.boolean().optional(),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;
