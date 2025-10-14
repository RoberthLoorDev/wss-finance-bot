import { Server } from "./core/server";
import { ENV } from "./config/env";

const server = new Server(ENV.PORT);
server.listen();
