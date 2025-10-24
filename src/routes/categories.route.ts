import { CategoriesController } from "@/controllers/categories.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";
import { CreateCategorySchema, IdParamSchema, ListCategoriesQuerySchema, UpdateCategorySchema } from "@/schemas/category.schema";
import { Router } from "express";

export class CategoriesRoute {
     public router = Router();
     private controller = new CategoriesController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", validateBody(CreateCategorySchema), this.controller.create.bind(this.controller));
          this.router.get("/", validateQuery(ListCategoriesQuerySchema), this.controller.list.bind(this.controller));
          this.router.get("/:id", validateParams(IdParamSchema), this.controller.getById.bind(this.controller));
          this.router.patch(
               "/:id",
               validateParams(IdParamSchema),
               validateBody(UpdateCategorySchema),
               this.controller.update.bind(this.controller)
          );
          this.router.delete("/:id", validateParams(IdParamSchema), this.controller.remove.bind(this.controller));
     }
}
