import { Router } from "express";
import { ConversationsController } from "@/controllers/conversation.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";
import {
     CreateConversationSchema,
     UpdateConversationSchema,
     IdParamSchema,
     ListConversationsQuerySchema,
} from "@/schemas/conversation.schema";

export class ConversationsRoute {
     public router = Router();
     private controller = new ConversationsController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", validateBody(CreateConversationSchema), this.controller.create.bind(this.controller));
          this.router.get("/", validateQuery(ListConversationsQuerySchema), this.controller.list.bind(this.controller));
          this.router.get("/:id", validateParams(IdParamSchema), this.controller.getById.bind(this.controller));
          this.router.patch(
               "/:id",
               validateParams(IdParamSchema),
               validateBody(UpdateConversationSchema),
               this.controller.update.bind(this.controller)
          );
          this.router.delete("/:id", validateParams(IdParamSchema), this.controller.end.bind(this.controller));
     }
}
