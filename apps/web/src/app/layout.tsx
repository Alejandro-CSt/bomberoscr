import TRPCProvider from "@/lib/trpc/provider";
import env from "@/server/env";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geist = Geist({ subsets: ["latin"], weight: "variable" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <Script defer src={`${env.UMAMI_URL}/script.js`} data-website-id={env.UMAMI_WEBSITE_ID} />
      </head>
      <body className="antialiased" style={geist.style}>
        <NuqsAdapter>
          <TRPCProvider>{children}</TRPCProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
