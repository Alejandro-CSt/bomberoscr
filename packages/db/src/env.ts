import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

const EnvSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  DRIZZLE_POSTGRES_URL: z.string()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config({ quiet: true }));

function validateEnv() {
  if (process.env.SKIP_ENV_CHECK) {
    return process.env as unknown as EnvSchema;
  }

  return EnvSchema.parse(process.env);
}

export default validateEnv();
