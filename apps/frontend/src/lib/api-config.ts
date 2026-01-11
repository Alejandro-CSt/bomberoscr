import { client } from "@/lib/api/client.gen";

const baseUrl = import.meta.env.DEV ? "http://localhost:9998/bomberos/hono" : "/bomberos/hono";

client.setConfig({ baseUrl });
