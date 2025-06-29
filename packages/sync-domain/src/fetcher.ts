import { ResultAsync, errAsync, okAsync } from "neverthrow";

class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchError";
  }
}

/**
 * The run-time signature all network helpers will receive.
 *
 * @example const incidents = await fetcher<ObtenerListaUltimasEmergenciasApp>(…);
 */
export type Fetcher = <T>(
  path: string,
  body?: Record<string, unknown>,
  init?: RequestInit
) => ResultAsync<T, FetchError>;

/**
 * Factory.  Call it once in your "config" layer and inject the returned
 * function in the rest of the codebase.
 *
 *  @example const fetcher = createFetcher({ baseUrl: process.env.SIGAE_API_URL! });
 */
export interface Credentials {
  IP: string;
  Password: string;
  Usuario: string;
  codSistema: string;
}

export function createFetcher(opts: {
  baseUrl: string;
  credentials: Credentials;
  defaultInit?: RequestInit;
}): Fetcher {
  const { baseUrl, credentials, defaultInit } = opts;

  return function fetcher<T>(
    path: string,
    body: Record<string, unknown> = {},
    init: RequestInit = {}
  ) {
    return ResultAsync.fromPromise(
      fetch(new URL(path, baseUrl).toString(), {
        method: init.method ?? "POST",
        ...defaultInit,
        ...init,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(defaultInit?.headers ?? {}),
          ...(init.headers ?? {})
        },
        body: JSON.stringify({ ...credentials, ...body })
      }),
      (_) => new FetchError("Network error")
    )
      .andThen((res) => {
        if (!res.ok) return errAsync(new FetchError(res.statusText));
        return okAsync(res);
      })
      .andThen((res) =>
        ResultAsync.fromThrowable(
          () => res.json() as Promise<T>,
          (_) => new FetchError("JSON parsing error")
        )()
      );
  };
}
