import { HttpInterceptorFn } from '@angular/common/http';

/*
 * ─── Auth Token Interceptor ─────────────────────────────────────────────────
 *
 * Attaches a JWT Authorization header to every outgoing request.
 * In a real app, read the token from an AuthService or localStorage.
 *
 * Pattern:
 *   - Never mutate req directly — requests are immutable.
 *   - Use req.clone({ setHeaders: { ... } }) to create a new request with headers.
 *   - Cloning is cheap — only a shallow copy of the metadata object.
 *
 * This demo uses a hardcoded mock token so you can see the header appear in
 * the RequestLogService log without needing a real auth backend.
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // In production: const token = inject(AuthService).getToken();
  const mockToken = 'demo-jwt-token-abc123';

  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${mockToken}`,
    },
  });

  // Forward the CLONED request (with auth header) — not the original
  return next(clonedReq);
};
