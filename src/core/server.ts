import express, { Application } from "express";
import { PingRoute } from "../routes/ping.route";
import { ENV } from "../config/env";

export class Server {
     private app: Application;
     private readonly port: number;

     constructor(port: number = 3000) {
          this.app = express();
          this.port = port;
          this.middlewares();
          this.routes();
     }

     private middlewares(): void {
          this.app.use(express.json());
     }

     private routes(): void {
          const pingRoute = new PingRoute();
          this.app.use("/api", pingRoute.router);
          this.app.get("/", (req, res) => {
               res.send("Server is running");
          });
     }

     public listen(): void {
          this.app.listen(this.port, () => {
               console.log(`Server is running on port ${this.port}`);
               console.log(`Environment: ${ENV.NODE_ENV}`);
          });
     }
}
