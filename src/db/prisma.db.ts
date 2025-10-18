import { PrismaClient } from "@prisma/client";
import { ENV } from "../config/env";

export const prisma = new PrismaClient({
     datasources: { db: { url: ENV.DATABASE_URL } },
     log: ENV.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"], // Log all queries in development, only warnings and errors in production
});

// Disconnect Prisma Client when the Node.js process ends
process.on("beforeExit", async () => {
     await prisma.$disconnect();
});
