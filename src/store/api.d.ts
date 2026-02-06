declare module '@/store/api' {
  interface Api {
    get<T = unknown>(path: string, config?: unknown): Promise<{ data: T }>;
    patch<T = unknown>(path: string, payload?: unknown, config?: unknown): Promise<{ data: T }>;
    post(path: string, payload?: unknown, config?: unknown): Promise<unknown>;
    put(path: string, payload?: unknown, config?: unknown): Promise<unknown>;
    delete(path: string, config?: unknown): Promise<unknown>;
    all(promises: Promise<unknown>[]): Promise<unknown[]>;
    spread<T>(callback: (...args: unknown[]) => T): (responses: unknown[]) => T;
    set_auth_token(token: string): void;
  }
  const api: Api;
  export default api;
}
