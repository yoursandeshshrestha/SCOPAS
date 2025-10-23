import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables before validation
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  API_VERSION: z.string().default("/api/v1"),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),

  CORS_ORIGINS: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  CORS_METHODS: z.string().optional(),
  CORS_HEADERS: z.string().optional(),
  CORS_CREDENTIALS: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),

  PLAID_CLIENT_ID: z.string().optional(),
  PLAID_SECRET: z.string().optional(),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Throw with concise message listing missing/invalid keys
  const issues = parsed.error.issues.map(
    (i) => `${i.path.join(".")}: ${i.message}`
  );
  throw new Error(
    `Invalid environment configuration. Issues: ${issues.join(", ")}`
  );
}

const env = parsed.data;

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export const config = {
  nodeEnv: env.NODE_ENV,
  server: {
    port: env.PORT,
    basePath: env.API_VERSION,
  },
  db: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.ACCESS_TOKEN_TTL,
    refreshTtl: env.REFRESH_TOKEN_TTL,
  },
  cors: {
    origins: Array.from(
      new Set([...parseCsv(env.CORS_ORIGINS), ...parseCsv(env.CORS_ORIGIN)])
    ),
    methods: parseCsv(env.CORS_METHODS),
    headers: parseCsv(env.CORS_HEADERS),
    credentials: String(env.CORS_CREDENTIALS) === "true",
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  plaid: {
    clientId: env.PLAID_CLIENT_ID,
    secret: env.PLAID_SECRET,
    env: env.PLAID_ENV,
  },
} as const;

export type AppConfig = typeof config;
