import dotenvSafe from "dotenv-safe";
import path from "path";

// Load environment variables from .env file
dotenvSafe.config({
     example: path.resolve(__dirname, "../../.env.example"),
});

//export variables
export const ENV = {
     PORT: parseInt(process.env.PORT || "3000", 10),
     DATABASE_URL: process.env.DATABASE_URL as string,
     GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
};
