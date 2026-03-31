import { z } from "zod"

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  PORT: z
    .string()
    .default("3000")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
  FRONTEND_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32)
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
