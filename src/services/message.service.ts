import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class MessageService {
     async create(data: Prisma.MessageCreateInput) {
          return prisma.message.create({ data });
     }

     async findAll(params: { page: number; pageSize: number; conversation_id?: bigint }) {
          const { page, pageSize, conversation_id } = params;
          const where: Prisma.MessageWhereInput = conversation_id ? { conversation_id } : {};

          const [items, total] = await Promise.all([
               prisma.message.findMany({
                    where,
                    orderBy: { created_at: "asc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
               }),
               prisma.message.count({ where }),
          ]);

          return {
               items,
               page,
               pageSize,
               total,
               totalPages: Math.ceil(total / pageSize),
          };
     }

     async update(id: bigint, data: Prisma.MessageUpdateInput) {
          return prisma.message.update({ where: { id }, data });
     }

     async delete(id: bigint) {
          return prisma.message.delete({ where: { id } });
     }
}
