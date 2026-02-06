declare module '@/store/api' {
  interface Api {
    get<T = unknown>(path: string, config?: unknown): Promise<{ data: T }>;
    patch<T = unknown>(path: string, payload?: unknown, config?: unknown): Promise<{ data: T }>;
    post<T = unknown>(path: string, payload?: unknown, config?: unknown): Promise<{ data: T }>;
    put<T = unknown>(path: string, payload?: unknown, config?: unknown): Promise<{ data: T }>;
    delete<T = unknown>(path: string, config?: unknown): Promise<{ data: T }>;
    all<T = unknown>(promises: Promise<unknown>[]): Promise<T[]>;
    spread<T>(callback: (...args: unknown[]) => T): (responses: unknown[]) => T;
    setAuthToken(token: string): void;
  }
  const api: Api;
  export default api;
}
