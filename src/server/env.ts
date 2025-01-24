import { config } from "dotenv";
import { expand } from "dotenv-expand";

import { ZodError, z } from "zod";

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
  SYNC_TOKEN: z.string()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config());

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    for (const issue of error.issues) {
      message += `${issue.path[0]}\n`;
    }
    const e = new Error(message);
    e.stack = "";
    throw e;
  }
  console.error(error);
}

export default EnvSchema.parse(process.env);
