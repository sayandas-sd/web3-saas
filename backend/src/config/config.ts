
function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return value;
}

export const JWT_SECRET = requireEnvVar('JWT_SECRET');
export const WORKER_JWT_SECRET = requireEnvVar('WORKER_JWT_SECRET');
export const TOTAL_LAMPORTS_AMOUNT = 1000_000;

export const CLOUDFLARE_ENDPOINT = requireEnvVar('CLOUDFLARE_ENDPOINT');
export const S3_ACCESS_KEY = requireEnvVar('S3_ACCESS_KEY');
export const S3_SECRET_KEY = requireEnvVar('S3_SECRET_KEY');
export const CLOUDFLARE_BUCKET = requireEnvVar('CLOUDFLARE_BUCKET');
export const RPC_URL = requireEnvVar('RPC_URL');
export const PRIVATE_KEY = requireEnvVar('PRIVATE_KEY');