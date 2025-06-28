import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "";
export const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET || "";
export const CLOUDFLARE_ENDPOINT = process.env.CLOUDFLARE_ENDPOINT || "";
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "";
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "";
export const CLOUDFLARE_BUCKET = process.env.CLOUDFLARE_BUCKET || "";
export const RPC_URL = process.env.RPC_URL || ""; 
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";


export const TOTAL_LAMPORTS_AMOUNT = 1_000_000; 
