import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class CategoryService {
     async create(data: Prisma.CategoryCreateInput) {
          return prisma.category.create({ data });
     }

     async findAll(params: { page: number; pageSize: number; search?: string; user_id?: bigint; type_id?: bigint }) {
          const { page, pageSize, search, user_id, type_id } = params;

          const where: Prisma.CategoryWhereInput = {
               deleted_at: null,
               ...(user_id ? { user_id } : {}),
               ...(type_id ? { type_id } : {}),
               ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
          };

          const [items, total] = await Promise.all([
               prisma.category.findMany({
                    where,
                    include: {
                         type: true,
                    },
                    orderBy: { created_at: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
               }),
               prisma.category.count({ where }),
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
          return prisma.category.findUnique({
               where: { id },
               include: { type: true },
          });
     }

     async update(id: bigint, data: Prisma.CategoryUpdateInput) {
          return prisma.category.update({ where: { id }, data });
     }

     async softDelete(id: bigint) {
          return prisma.category.update({
               where: { id },
               data: { deleted_at: new Date() },
          });
     }
}
