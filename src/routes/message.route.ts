import { Router } from "express";
import { MessagesController } from "@/controllers/message.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";
import { CreateMessageSchema, UpdateMessageSchema, IdParamSchema, ListMessagesQuerySchema } from "@/schemas/message.schema";

export class MessagesRoute {
     public router = Router();
     private controller = new MessagesController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", validateBody(CreateMessageSchema), this.controller.create.bind(this.controller));
          this.router.get("/", validateQuery(ListMessagesQuerySchema), this.controller.list.bind(this.controller));
          this.router.patch(
               "/:id",
               validateParams(IdParamSchema),
               validateBody(UpdateMessageSchema),
               this.controller.update.bind(this.controller)
          );
          this.router.delete("/:id", validateParams(IdParamSchema), this.controller.remove.bind(this.controller));
     }
}
