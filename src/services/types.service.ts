import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class TypeService {
     async create(data: Prisma.TypeCreateInput) {
          return prisma.type.create({ data });
     }

     async findAll(params: { page: number; pageSize: number; search?: string; includeDeleted?: boolean }) {
          const { page, pageSize, search, includeDeleted } = params;
          const where: Prisma.TypeWhereInput = {
               ...(includeDeleted ? {} : { deleted_at: null }),
               ...(search
                    ? {
                           name: { contains: search, mode: "insensitive" },
                      }
                    : {}),
          };

          const [items, total] = await Promise.all([
               prisma.type.findMany({
                    where,
                    orderBy: { created_at: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
               }),
               prisma.type.count({ where }),
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
          return prisma.type.findUnique({ where: { id } });
     }

     async update(id: bigint, data: Prisma.TypeUpdateInput) {
          return prisma.type.update({ where: { id }, data });
     }

     async softDelete(id: bigint) {
          return prisma.type.update({
               where: { id },
               data: { deleted_at: new Date() },
          });
     }
}
