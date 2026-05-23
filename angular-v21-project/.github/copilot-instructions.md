# Copilot Instructions — Angular v21 Project

## Commands

```bash
npm start          # Dev server → http://localhost:4200
npm run build      # Production build → dist/
npm test           # Run all tests with Vitest
npm run watch      # Dev build in watch mode
```

Run a single test file with Vitest directly:
```bash
npx vitest run src/app/app.spec.ts
```

Format code with Prettier:
```bash
npx prettier --write "src/**/*.{ts,html,scss}"
```

## Architecture

```
src/app/
├── app.ts / app.html / app.routes.ts / app.config.ts   ← root component & bootstrap
├── auth/                  ← AuthService (signal-based) + functional authGuard
├── services/              ← EmployeeService (static in-memory data)
├── CommunicationWithService/  ← MessageService + Sender/Receiver demo components
├── data-binding/          ← Data binding demo components
├── data-binding-demo/
├── child/                 ← Parent↔child input/output demo
└── pages/                 ← Routed page components
    ├── home/
    ├── about/
    ├── courses/           ← Has nested child routes (overview, details)
    ├── enroll/
    ├── dashboard/         ← Protected by authGuard
    └── login/             ← Handles ?returnUrl redirect after guard
```

**Routing strategy:** `home` and `about` are eagerly loaded; all other pages use `loadComponent` lazy loading. The `courses` route uses nested `loadComponent` child routes. Route params bind directly to component inputs via `withComponentInputBinding()` in `app.config.ts`.

**Auth flow:** `AuthService` holds a `signal(false)` for login state. The functional `authGuard` (`CanActivateFn`) redirects unauthenticated users to `/login?returnUrl=<attempted-path>`. After login, `Login` component reads `returnUrl` from query params and navigates there. Mock credentials: `admin` / `1234`.

## Key Conventions

### File and Class Naming

Components drop the `Component` suffix in both the filename and class name:
- `dashboard.ts` → `export class Dashboard` (not `DashboardComponent`)
- `login.ts` → `export class Login`
- Files are named `<feature>.ts`, not `<feature>.component.ts`

### Standalone Components (No NgModule)

No `app.module.ts` exists. Every component is standalone by default (Angular 19+). Do not add `standalone: true` — it is the implicit default.

### Control Flow Syntax

Always use built-in block syntax, never structural directives:

```html
@if (condition) { ... } @else { ... }
@for (item of items; track item.id) { ... } @empty { <p>None.</p> }
@switch (val) { @case ('x') { ... } @default { ... } }
```

### Signals for State

Use `signal()`, `computed()`, and `effect()` for all reactive state. Use `toSignal()` / `toObservable()` from `@angular/core/rxjs-interop` to bridge RxJS.

```typescript
count = signal(0);
doubled = computed(() => this.count() * 2);
```

### Dependency Injection

Use `inject()`, never constructor injection:
```typescript
private authService = inject(AuthService);  // ✓
constructor(private authService: AuthService) {}  // ✗
```

### Component Inputs/Outputs

Prefer signal-based APIs over decorators:
```typescript
title = input<string>('');   // replaces @Input()
clicked = output<string>();  // replaces @Output() + EventEmitter
```

> Note: `child.ts` still uses `@Input()` / `@Output()` decorators as a learning example — new code should use signal APIs.

### Styling

- SCSS is the stylesheet format (configured globally in `angular.json`)
- Use `styleUrl` (singular string), not `styleUrls` (array)
- Global styles: `src/styles.scss`
- Prettier: single quotes, 100-char print width, `angular` parser for HTML files

### Services

Services use `providedIn: 'root'` and `inject()`. Data services currently use in-memory arrays (no HTTP backend). When adding HTTP, provide via `provideHttpClient(withFetch())` in `app.config.ts` and use functional interceptors (`httpInterceptorFns`).

### Testing

Test runner is **Vitest** with **jsdom** — not Karma/Jasmine. Do not suggest `TestBed` Karma-based setup.

## What to Avoid

| Avoid | Use Instead |
|---|---|
| `*ngIf`, `*ngFor`, `*ngSwitch` | `@if`, `@for`, `@switch` |
| `NgModule`, `declarations` | Standalone components |
| `CommonModule` | Built-in control flow |
| `@Input()` / `@Output()` | `input()` / `output()` signals |
| `BehaviorSubject` for component state | `signal()` |
| Constructor injection | `inject()` |
| `standalone: true` in decorator | Omit (default in Angular 19+) |
| Class-based HTTP interceptors | Functional interceptors |
| Karma / Jasmine | Vitest |
| `<feature>.component.ts` filenames | `<feature>.ts` |
| `export class DashboardComponent` | `export class Dashboard` |
