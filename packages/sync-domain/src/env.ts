import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

const EnvSchema = z.object({
  SIGAE_API_URL: z.string().url(),
  SIGAE_IP: z.string(),
  SIGAE_USER: z.string(),
  SIGAE_PASSWORD: z.string(),
  SIGAE_COD_SYS: z.string()
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
