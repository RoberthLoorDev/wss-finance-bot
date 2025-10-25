import dotenvSafe from "dotenv-safe";
import path from "path";

dotenvSafe.config({
     example: path.resolve(__dirname, "../../.env.example"),
});

const {
     PORT = "3000",
     GEMINI_API_KEY,
     DATABASE_URL,
     POSTGRES_USER,
     POSTGRES_PASSWORD,
     POSTGRES_DB,
     POSTGRES_PORT = "5433",
     DB_HOST = "localhost",
     NODE_ENV,

     // Telegram
     TELEGRAM_API_KEY,
     TELEGRAM_API,
     NGROK_URL,
} = process.env;

export const ENV = {
     PORT: parseInt(PORT, 10),
     GEMINI_API_KEY: GEMINI_API_KEY as string,
     POSTGRES_USER: POSTGRES_USER as string,
     POSTGRES_PASSWORD: POSTGRES_PASSWORD as string,
     POSTGRES_DB: POSTGRES_DB as string,
     POSTGRES_PORT: parseInt(POSTGRES_PORT, 10),
     DB_HOST,
     DATABASE_URL: DATABASE_URL as string,
     NODE_ENV: NODE_ENV || "development",
     // Telegram
     TELEGRAM_API_KEY: TELEGRAM_API_KEY as string,
     TELEGRAM_API: TELEGRAM_API as string,
     NGROK_URL: NGROK_URL as string,
};
