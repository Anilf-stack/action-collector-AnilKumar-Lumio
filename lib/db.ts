// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached: any = (global as any)._mongoose;
if (!cached) (global as any)._mongoose = cached = { conn: null, promise: null };

export async function dbConnect() {
  if (!MONGODB_URI) {
    // no DB configured — skip connection
    return;
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "meeting-summarizer" }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
