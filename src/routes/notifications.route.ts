import { Router } from "express";
import { NotificationsController } from "@/controllers/notifications.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";
import {
     CreateNotificationSchema,
     ListNotificationsQuerySchema,
     IdParamSchema,
     UserIdParamSchema,
} from "@/schemas/notification.schema";

export class NotificationsRoute {
     public router = Router();
     private controller = new NotificationsController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", validateBody(CreateNotificationSchema), this.controller.create.bind(this.controller));
          this.router.get("/", validateQuery(ListNotificationsQuerySchema), this.controller.list.bind(this.controller));
          this.router.get("/:id", validateParams(IdParamSchema), this.controller.getById.bind(this.controller));
          this.router.get("/user/:userId", validateParams(UserIdParamSchema), this.controller.getByUser.bind(this.controller));
          this.router.patch("/:id/read", validateParams(IdParamSchema), this.controller.markAsRead.bind(this.controller));
          this.router.patch("/:id/delete", validateParams(IdParamSchema), this.controller.softDelete.bind(this.controller));
     }
}
