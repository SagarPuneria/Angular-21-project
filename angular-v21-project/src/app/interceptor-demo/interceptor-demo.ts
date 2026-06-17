import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestLogService } from './request-log.service';

/*
 * ─── Interceptor Demo ────────────────────────────────────────────────────────
 *
 * Demonstrates functional HTTP interceptors in Angular 21.
 *
 * Two interceptors are active (registered in app.config.ts):
 *   1. authTokenInterceptor — clones every request and adds Bearer token header
 *   2. loggingInterceptor   — times every request and logs to RequestLogService
 *
 * This component makes real HTTP calls to JSONPlaceholder so you can see the
 * live request log below.
 *
 * Key concepts:
 *   - Interceptors receive (req, next) — HttpRequest + HandlerFn
 *   - req is immutable; clone before modifying
 *   - next(req) forwards to the next interceptor in the chain
 *   - withInterceptors([...]) registers them in order (first in = first to run)
 */
@Component({
  selector: 'app-interceptor-demo',
  imports: [],
  templateUrl: './interceptor-demo.html',
  styleUrl: './interceptor-demo.scss',
})
export class InterceptorDemo {
  private readonly http = inject(HttpClient);
  readonly logService = inject(RequestLogService);

  loading = signal(false);

  makeGetRequest(): void {
    this.loading.set(true);
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  makePostRequest(): void {
    this.loading.set(true);
    this.http
      .post('https://jsonplaceholder.typicode.com/posts', {
        title: 'Interceptor Demo Post',
        body: 'Created from interceptor demo',
        userId: 1,
      })
      .subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }

  makeMultipleRequests(): void {
    this.loading.set(true);
    let remaining = 3;
    const done = () => { if (--remaining === 0) this.loading.set(false); };

    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({ next: done, error: done });
    this.http.get('https://jsonplaceholder.typicode.com/users/1').subscribe({ next: done, error: done });
    this.http.get('https://jsonplaceholder.typicode.com/todos/1').subscribe({ next: done, error: done });
  }

  clearLog(): void {
    this.logService.clear();
  }
}
