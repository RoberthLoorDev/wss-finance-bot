import { Router } from "express";
import { TelegramController } from "@/controllers/telegram.controller";

export class TelegramRoute {
     public router = Router();
     private controller = new TelegramController();

     constructor() {
          this.initializeRoutes();
     }

     private initializeRoutes() {
          this.router.post("/webhook", this.controller.webhook.bind(this.controller));
          this.router.get("/setup", this.controller.setup.bind(this.controller));
     }
}
