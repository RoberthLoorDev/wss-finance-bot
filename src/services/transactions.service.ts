import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class TransactionService {
     async create(data: Prisma.TransactionCreateInput) {
          return prisma.transaction.create({ data });
     }

     async findAll(params: {
          page: number;
          pageSize: number;
          user_id: bigint;
          category_id?: bigint;
          type_id?: bigint;
          dateRanges: { start: Date; end: Date }[] | null;
     }) {
          const { page, pageSize, user_id, category_id, type_id, dateRanges } = params;

          const where: Prisma.TransactionWhereInput = {
               deleted_at: null,
               user_id: user_id,
          };

          if (category_id) {
               where.category_id = category_id;
          } else if (type_id) {
               where.category = {
                    type_id: type_id,
               };
          }

          // fecha avanzada
          if (dateRanges && dateRanges.length > 0) {
               if (dateRanges.length === 1) {
                    // Caso simple: "este mes", "mes pasado", "febrero a marzo"
                    where.date = {
                         gte: dateRanges[0].start,
                         lte: dateRanges[0].end,
                    };
               } else {
                    // Caso "discrete": "enero Y noviembre"
                    where.OR = dateRanges.map((range) => ({
                         date: {
                              gte: range.start,
                              lte: range.end,
                         },
                    }));
               }
          }
          // Si dateRanges es null, no se aplica filtro de fecha (todo el historial)

          const [items, total] = await Promise.all([
               prisma.transaction.findMany({
                    where,
                    include: {
                         category: {
                              include: {
                                   type: true,
                              },
                         },
                    },
                    orderBy: { date: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
               }),
               prisma.transaction.count({ where }),
          ]);

          return {
               items,
               page,
               pageSize,
               total,
               totalPages: Math.ceil(total / pageSize),
          };
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

     async findRecentByUser(user_id: bigint, days: number = 30) {
          const dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - days);

          return prisma.transaction.findMany({
               where: {
                    user_id,
                    deleted_at: null,
                    date: { gte: dateLimit },
               },
               orderBy: { date: "desc" },
               include: { category: true },
          });
     }

     async update(id: bigint, data: Prisma.TransactionUpdateInput) {
          return prisma.transaction.update({ where: { id }, data });
     }
}
