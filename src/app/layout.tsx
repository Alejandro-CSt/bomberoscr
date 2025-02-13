import TRPCProvider from "@/lib/trpc/provider";
import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <NuqsAdapter>
          <TRPCProvider>{children}</TRPCProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
