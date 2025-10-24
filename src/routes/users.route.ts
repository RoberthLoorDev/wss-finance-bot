import { Router } from "express";
import { UsersController } from "@/controllers/users.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";
import { CreateUserSchema, UpdateUserSchema, IdParamSchema, PhoneParamSchema, ListUsersQuerySchema } from "@/schemas/user.schema";

export class UsersRoute {
     public router = Router();
     private controller = new UsersController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", validateBody(CreateUserSchema), this.controller.create.bind(this.controller));
          this.router.get("/", validateQuery(ListUsersQuerySchema), this.controller.list.bind(this.controller));
          this.router.get("/phone/:phone", validateParams(PhoneParamSchema), this.controller.getByPhone.bind(this.controller));
          this.router.get("/:id", validateParams(IdParamSchema), this.controller.getById.bind(this.controller));
          this.router.patch(
               "/:id",
               validateParams(IdParamSchema),
               validateBody(UpdateUserSchema),
               this.controller.update.bind(this.controller)
          );
          this.router.delete("/:id", validateParams(IdParamSchema), this.controller.remove.bind(this.controller));
     }
}
