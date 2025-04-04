import { config } from "dotenv";
import { expand } from "dotenv-expand";

import { z } from "zod";

const EnvSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  DRIZZLE_POSTGRES_URL: z.string(),
  SIGAE_API_URL: z.string().url(),
  SIGAE_IP: z.string(),
  SIGAE_USER: z.string(),
  SIGAE_PASSWORD: z.string(),
  SIGAE_COD_SYS: z.string(),
  UMAMI_URL: z.string().url(),
  UMAMI_WEBSITE_ID: z.string(),
  SITE_URL: z.string().url()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config());

function validateEnv() {
  if (process.env.SKIP_ENV_CHECK) {
    return process.env as unknown as EnvSchema;
  }

  return EnvSchema.parse(process.env);
}

export default validateEnv();
