import { Router } from "express";
import { PingRoute } from "./ping.route";
import { UsersRoute } from "./users.route";
import { TransactionsRoute } from "./transactions.route";

export const registerRoutes = (): Router => {
     const router = Router();

     router.use("/", new PingRoute().router);
     router.use("/users", new UsersRoute().router);
     router.use("/transactions", new TransactionsRoute().router);

     return router;
};
