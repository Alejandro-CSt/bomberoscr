import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

const EnvSchema = z.object({
  SENTRY_DSN: z.string()
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
