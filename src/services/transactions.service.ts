import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class TransactionService {
     async create(data: Prisma.TransactionCreateInput) {
          return prisma.transaction.create({ data });
     }

     async findAllByUser(user_id: bigint) {
          return prisma.transaction.findMany({
               where: { user_id, deleted_at: null },
               orderBy: { date: "desc" },
               include: { category: true },
          });
     }

     async findById(id: bigint) {
          return prisma.transaction.findUnique({
               where: { id },
               include: { user: true, category: true },
          });
     }

     async delete(id: bigint) {
          return prisma.transaction.update({
               where: { id },
               data: { deleted_at: new Date() },
          });
     }
}
