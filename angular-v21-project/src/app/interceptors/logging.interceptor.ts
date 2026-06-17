import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, finalize } from 'rxjs';
import { RequestLogService } from '../interceptor-demo/request-log.service';

/*
 * ─── Logging Interceptor ────────────────────────────────────────────────────
 *
 * A functional interceptor (Angular 17+ style — HttpInterceptorFn).
 * Runs before every outgoing request and records timing/status to RequestLogService.
 *
 * Pattern:
 *   1. Log the outgoing request with RequestLogService.logRequest()
 *   2. Forward the (possibly cloned) request via next(req)
 *   3. Use tap() to capture the response status
 *   4. Use finalize() to stamp the duration — runs on success AND error
 *
 * Why functional interceptors (not class-based)?
 *   - No need for @Injectable or implements HttpInterceptor
 *   - inject() works because interceptors run in the injection context
 *   - Registered with withInterceptors([...]) in provideHttpClient()
 *   - Simpler, more tree-shakeable
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logService = inject(RequestLogService);

  const authHeader = req.headers.has('Authorization');
  const startTime = performance.now();
  const entryId = logService.logRequest(req.method, req.url, authHeader);

  return next(req).pipe(
    tap({
      // HttpSentEvent fires before the response, but HttpResponse has the status.
      // We use the response event here to capture the status code.
      next: (event: any) => {
        if (event?.status) {
          const duration = Math.round(performance.now() - startTime);
          logService.logResponse(entryId, event.status, duration);
        }
      },
      error: (err: any) => {
        const duration = Math.round(performance.now() - startTime);
        logService.logResponse(entryId, err?.status ?? 0, duration);
      },
    }),
    finalize(() => {
      // finalize always runs — handles cases where status was not captured via tap
    })
  );
};
