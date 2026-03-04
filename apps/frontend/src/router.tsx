import { QueryClient } from "@tanstack/react-query";
import { createRouter, Link } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import "@/lib/api-config";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-lg text-muted-foreground">
        La pagina que buscas no existe.
      </p>
      <Link
        to="/"
        className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },

    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultSsr: false,
    defaultNotFoundComponent: NotFound
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
