import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class UserService {
     async create(data: Prisma.UserCreateInput) {
          return prisma.user.create({ data });
     }

     async findAll(params: { page: number; pageSize: number; search?: string; role?: string; is_active?: boolean }) {
          const { page, pageSize, search, role, is_active } = params;
          const where: Prisma.UserWhereInput = {
               deleted_at: null,
               ...(role ? { role: role as any } : {}),
               ...(typeof is_active === "boolean" ? { is_active } : {}),
               ...(search
                    ? {
                           OR: [
                                { phone_number: { contains: search, mode: "insensitive" } },
                                { email: { contains: search, mode: "insensitive" } },
                                { username: { contains: search, mode: "insensitive" } },
                                { name: { contains: search, mode: "insensitive" } },
                           ],
                      }
                    : {}),
          };

          const [items, total] = await Promise.all([
               prisma.user.findMany({
                    where,
                    orderBy: { created_at: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
               }),
               prisma.user.count({ where }),
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
          return prisma.user.findUnique({ where: { id } });
     }

     async findByPhone(phone_number: string) {
          return prisma.user.findUnique({ where: { phone_number } });
     }

     async update(id: bigint, data: Prisma.UserUpdateInput) {
          return prisma.user.update({ where: { id }, data });
     }

     async softDelete(id: bigint) {
          return prisma.user.update({
               where: { id },
               data: { is_active: false, deleted_at: new Date() },
          });
     }
}
