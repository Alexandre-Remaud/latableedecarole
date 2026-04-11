import { z } from "zod"

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  MONGO_DB_NAME: z.string().default("latableedecarole_dev"),
  PORT: z
    .string()
    .default("3000")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
  FRONTEND_URL: z.string().url().optional(),
  BACKEND_URL: z
    .string()
    .url("BACKEND_URL must be a valid URL (e.g. http://localhost:3000)")
    .default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().url().optional()
})

export type EnvConfig = z.infer<typeof envSchema>

export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")
    throw new Error(`Environment validation failed:\n${formatted}`)
  }

  return result.data
}
