import { Router } from "express";
import { PingController } from "../controllers/ping.controller";

export class PingRoute {
     public router: Router;
     private controller: PingController;

     constructor() {
          this.router = Router();
          this.controller = new PingController();
          this.inicializeRoutes();
     }

     private inicializeRoutes() {
          // get /api/ping
          this.router.get("/ping", this.controller.ping);
     }
}
