import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();
const TOKEN = process.env.MAILTRAP_TOKEN;
const SENDER_EMAIL = "mailtrap@demomailtrap.com";
// const RECIPIENT_EMAIL = "azharruk66@gmail.com";

export const client = new MailtrapClient({ token: TOKEN });

export const sender = { name: "Junaid Ali", email: SENDER_EMAIL };
