import Provider from "@/lib/trpc/provider";
import "@/styles/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
