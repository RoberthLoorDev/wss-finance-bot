import express, { Application } from "express";
import { ENV } from "../config/env";
import { registerRoutes } from "../routes/router.index";

export class Server {
     private app: Application;
     private readonly port: number;

     constructor(port: number = ENV.PORT) {
          this.app = express();
          this.port = port;
          this.middlewares();
          this.routes();
     }

     private middlewares(): void {
          this.app.use(express.json());

          //  evita errores al devolver BigInt
          this.app.use((_req, res, next) => {
               const oldJson = res.json.bind(res);
               res.json = (data: any) => {
                    return oldJson(
                         JSON.parse(JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value)))
                    );
               };
               next();
          });
     }

     private routes(): void {
          this.app.use("/api", registerRoutes());
          this.app.get("/", (_req, res) => {
               res.send("Server is running");
          });
     }

     public listen(): void {
          this.app.listen(this.port, () => {
               console.log(`🚀 Server running on port ${this.port}`);
               console.log(`Environment: ${ENV.NODE_ENV}`);
          });
     }
}
