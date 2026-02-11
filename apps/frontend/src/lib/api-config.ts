import { client } from "@/lib/api/client.gen";

const baseUrl = import.meta.env.VITE_SERVER_URL || "/bomberos/hono";

client.setConfig({ baseUrl });
