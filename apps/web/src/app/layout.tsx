import TRPCProvider from "@/lib/trpc/provider";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geist = Geist({ subsets: ["latin"], weight: "variable" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased" style={geist.style}>
        <NuqsAdapter>
          <TRPCProvider>{children}</TRPCProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
