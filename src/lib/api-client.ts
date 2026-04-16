/**
 * Typed fetch wrapper for internal API calls.
 *
 * Usage (Server Component):
 *   const { data } = await apiClient.get<Prompt[]>("/api/prompts");
 *
 * Usage (Client Component):
 *   const { data, error } = await apiClient.post<Prompt>("/api/prompts", body);
 */

// In the browser, use relative URLs (origin is implicit).
// On the server (SSR/RSC), we need an absolute URL.
const BASE_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
  /** Next.js cache / revalidation options passed directly to fetch() */
  next?: NextFetchRequestConfig;
}

interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

async function request<TResponse, TBody = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<ApiResult<TResponse>> {
  const { body, headers = {}, next } = options;

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const fetchOptions: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(next ? { next } : {}),
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    const json = (await res.json()) as unknown;

    if (!res.ok) {
      const errorMessage =
        typeof json === "object" && json !== null && "error" in json
          ? String((json as Record<string, unknown>).error)
          : `Request failed with status ${res.status}`;
      return { data: null, error: errorMessage, status: res.status };
    }

    const data =
      typeof json === "object" && json !== null && "data" in json
        ? (json as Record<string, unknown>).data
        : json;

    return { data: data as TResponse, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}

export const apiClient = {
  get: <TResponse>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<TResponse>("GET", path, options),

  post: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "body">
  ) => request<TResponse, TBody>("POST", path, { ...options, body }),

  put: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "body">
  ) => request<TResponse, TBody>("PUT", path, { ...options, body }),

  delete: <TResponse>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<TResponse>("DELETE", path, options),
};
