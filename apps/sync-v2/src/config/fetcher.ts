import env from "@/config/env";
import { createFetcher } from "@bomberoscr/sync-domain/fetcher";

export const fetcher = createFetcher({
  baseUrl: env.SIGAE_API_URL,
  credentials: {
    IP: env.SIGAE_IP,
    Password: env.SIGAE_PASSWORD,
    Usuario: env.SIGAE_USER,
    codSistema: env.SIGAE_SYSTEM_CODE
  }
});
