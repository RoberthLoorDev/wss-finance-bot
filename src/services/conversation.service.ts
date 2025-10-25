import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class ConversationService {
     async create(data: Prisma.ConversationCreateInput) {
          return prisma.conversation.create({ data });
     }

     async findAll(params: { page: number; pageSize: number; user_id?: bigint; is_active?: boolean }) {
          const { page, pageSize, user_id, is_active } = params;

          const where: Prisma.ConversationWhereInput = {
               ...(user_id ? { user_id } : {}),
               ...(typeof is_active === "boolean" ? { is_active } : {}),
          };

          const [items, total] = await Promise.all([
               prisma.conversation.findMany({
                    where,
                    orderBy: { created_at: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    include: { messages: true },
               }),
               prisma.conversation.count({ where }),
          ]);

          return {
               items,
               page,
               pageSize,
               total,
               totalPages: Math.ceil(total / pageSize),
          };
     }

     async findById(id: bigint) {
          return prisma.conversation.findUnique({
               where: { id },
               include: { messages: true },
          });
     }

     async update(id: bigint, data: Prisma.ConversationUpdateInput) {
          return prisma.conversation.update({ where: { id }, data });
     }

     async softEnd(id: bigint) {
          return prisma.conversation.update({
               where: { id },
               data: { is_active: false, ended_at: new Date() },
          });
     }
}
