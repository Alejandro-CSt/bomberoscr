import env from "@/server/env";
import Script from "next/script";
import { unstable_noStore as noStore } from "next/cache";

export function Analytics() {
  noStore();
  return <Script defer src={`${env.UMAMI_URL}/script.js`} data-website-id={env.UMAMI_WEBSITE_ID} />;
}