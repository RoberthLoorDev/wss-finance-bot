import { prisma } from "@/db/prisma.db";
import { Prisma } from "@prisma/client";

export class NotificationsService {
     async create(data: Prisma.NotificationCreateInput) {
          return prisma.notification.create({ data });
     }

     async findAll(params: { page: number; pageSize: number; user_id?: string; unread?: boolean }) {
          const { page, pageSize, user_id, unread } = params;

          const where: Prisma.NotificationWhereInput = {
               deleted_at: null,
               ...(user_id ? { user_id: BigInt(user_id) } : {}),
               ...(typeof unread === "boolean" ? { is_read: !unread ? undefined : false } : {}),
          };

          const [items, total] = await Promise.all([
               prisma.notification.findMany({
                    where,
                    orderBy: { created_at: "desc" },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
               }),
               prisma.notification.count({ where }),
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
          return prisma.notification.findUnique({ where: { id } });
     }

     async findByUser(user_id: bigint) {
          return prisma.notification.findMany({
               where: { user_id, deleted_at: null },
               orderBy: { created_at: "desc" },
          });
     }

     async markAsRead(id: bigint) {
          return prisma.notification.update({
               where: { id },
               data: { is_read: true, updated_at: new Date() },
          });
     }

     async softDelete(id: bigint) {
          return prisma.notification.update({
               where: { id },
               data: { deleted_at: new Date() },
          });
     }
}
