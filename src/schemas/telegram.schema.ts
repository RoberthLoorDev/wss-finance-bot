import { z } from "zod";

export const TelegramUpdateSchema = z.object({
     update_id: z.number(),
     message: z
          .object({
               message_id: z.number(),
               date: z.number(),
               chat: z.object({
                    id: z.number(),
                    first_name: z.string().optional(),
                    username: z.string().optional(),
                    type: z.string(),
               }),
               text: z.string().optional(),
          })
          .optional(),
});

export type TelegramUpdate = z.infer<typeof TelegramUpdateSchema>;
