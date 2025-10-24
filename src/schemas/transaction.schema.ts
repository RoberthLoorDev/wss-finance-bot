import { z } from "zod";

export const CreateTransactionSchema = z.object({
     user_id: z.coerce.bigint({ message: "user_id debe ser un número" }),
     category_id: z.coerce.bigint().optional(),
     amount: z.coerce.number().positive("El monto debe ser positivo"),
     description: z.string().optional(),
     date: z.coerce.date().optional(),
});

export const UpdateTransactionSchema = z.object({
     category_id: z.coerce.bigint().optional(),
     amount: z.coerce.number().positive().optional(),
     description: z.string().optional(),
     date: z.coerce.date().optional(),
});

export const IdParamSchema = z.object({
     id: z.string().regex(/^\d+$/, "ID inválido"),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
