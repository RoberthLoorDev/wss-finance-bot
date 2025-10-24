import { Router } from "express";
import { TransactionsController } from "@/controllers/transactions.controller";

export class TransactionsRoute {
     public router = Router();
     private controller = new TransactionsController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/", this.controller.create.bind(this.controller));
          this.router.get("/", this.controller.getAll.bind(this.controller));
          this.router.get("/:id", this.controller.getById.bind(this.controller));
          this.router.delete("/:id", this.controller.delete.bind(this.controller));
     }
}
