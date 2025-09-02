import { config } from "dotenv";
import fs from "fs";

try {
  if (fs.existsSync(".env")) {
    config({ path: ".env" });
  }
} catch (error) {
  console.error("Error reading .env file:", error);
}

export const ENVIRONMENT = process.env.NODE_ENV;

const prod: boolean = ENVIRONMENT === "production";

export const SECRET_KEY: string = process.env["SECRET_KEY"] || "";

export const PAYSTACK_SECRET: string = prod
  ? process.env["PAYSTACK_PUBLIC"] || ""
  : process.env["PAYSTACK_SECRET"] || "";

export const DB_URI: string = prod
  ? process.env["MONGO_LOCAL"] || ""
  : process.env["MONGO_SERVER"] || "";

export const emailRegEx = /^$/; // TODO: add regex for email here
export const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // TODO: add regex for password here
export const USER = process.env["MAIL"] || "";
export const PASS = process.env["PASS"] || "";