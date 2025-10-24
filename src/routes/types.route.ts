import { Router } from "express";
import { TypesController } from "@/controllers/types.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";
import { CreateTypeSchema, UpdateTypeSchema, IdParamSchema, ListTypesQuerySchema } from "@/schemas/type.schema";

export class TypesRoute {
     public router = Router();
     private controller = new TypesController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", validateBody(CreateTypeSchema), this.controller.create.bind(this.controller));
          this.router.get("/", validateQuery(ListTypesQuerySchema), this.controller.list.bind(this.controller));
          this.router.get("/:id", validateParams(IdParamSchema), this.controller.getById.bind(this.controller));
          this.router.patch(
               "/:id",
               validateParams(IdParamSchema),
               validateBody(UpdateTypeSchema),
               this.controller.update.bind(this.controller)
          );
          this.router.delete("/:id", validateParams(IdParamSchema), this.controller.remove.bind(this.controller));
     }
}
