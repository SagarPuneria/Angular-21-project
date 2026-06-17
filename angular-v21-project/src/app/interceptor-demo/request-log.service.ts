import { Injectable, signal } from '@angular/core';

export interface RequestLogEntry {
  id: number;
  method: string;
  url: string;
  status: number | null;    // null while in-flight
  durationMs: number | null;
  startedAt: string;
  authHeader: boolean;
}

/*
 * ─── RequestLogService ───────────────────────────────────────────────────────
 *
 * Holds a signal-based log of HTTP requests processed by the interceptors.
 * The logging interceptor writes here; the InterceptorDemo component reads it.
 *
 * Pattern: service is the single source of truth — interceptors push entries,
 * components only subscribe (read). Never mutate from outside the service.
 */
@Injectable({ providedIn: 'root' })
export class RequestLogService {
  private _nextId = 1;
  readonly entries = signal<RequestLogEntry[]>([]);

  /** Called by the interceptor when the request departs. Returns the entry id. */
  logRequest(method: string, url: string, authHeader: boolean): number {
    const id = this._nextId++;
    const entry: RequestLogEntry = {
      id,
      method: method.toUpperCase(),
      url: this.shortUrl(url),
      status: null,
      durationMs: null,
      startedAt: new Date().toLocaleTimeString(),
      authHeader,
    };
    this.entries.update(list => [entry, ...list]);
    return id;
  }

  /** Called by the interceptor when the response arrives. */
  logResponse(id: number, status: number, durationMs: number): void {
    this.entries.update(list =>
      list.map(e => e.id === id ? { ...e, status, durationMs } : e)
    );
  }

  clear(): void {
    this.entries.set([]);
  }

  private shortUrl(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch {
      return url;
    }
  }
}
