import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGO_DB_NAME,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
}
