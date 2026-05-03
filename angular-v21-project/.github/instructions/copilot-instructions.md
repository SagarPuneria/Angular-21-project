---
applyTo: "**"
---

# Copilot Instructions — Angular v21 Project

## Project Version Reference

| Package                  | Version  |
|--------------------------|----------|
| `@angular/core`          | ^21.2.0  |
| `@angular/cli`           | ^21.2.7  |
| `@angular/router`        | ^21.2.0  |
| `@angular/forms`         | ^21.2.0  |
| `typescript`             | ~5.9.2   |
| `rxjs`                   | ~7.8.0   |

---

## Core Rules (All Modes)

- **Always target Angular 21.x** — never suggest syntax, APIs, or patterns from Angular versions below 17.
- **Never suggest NgModules** — this project uses standalone components exclusively (`standalone: true` is the default in Angular 19+; no decorator flag is needed).
- **Never suggest `@NgModule`, `declarations`, `imports` in module files** — there is no `app.module.ts`.
- **Never suggest `CommonModule`** — directives like `NgIf`, `NgFor` are not needed; use built-in control flow instead.

---

## Templates — Control Flow

Use the **built-in control flow syntax** (introduced in Angular 17, stable in Angular 18+):

```html
<!-- Conditional -->
@if (condition) {
  ...
} @else if (other) {
  ...
} @else {
  ...
}

<!-- Iteration -->
@for (item of items; track item.id) {
  ...
} @empty {
  <p>No items found.</p>
}

<!-- Switch -->
@switch (value) {
  @case ('a') { ... }
  @default { ... }
}
```

**Never suggest:**
- `*ngIf` / `*ngFor` / `*ngSwitch`
- `<ng-template>` with structural directive syntax
- `NgIf`, `NgFor`, `NgSwitch` imports

---

## Components

- Use `@Component` with no `standalone` flag (it defaults to `true` in Angular 19+).
- Use `imports: [...]` in the component decorator for any dependencies (pipes, child components, directives).
- Prefer `input()` / `output()` signal-based APIs over `@Input()` / `@Output()` decorators.
- Prefer `model()` for two-way binding over `[(ngModel)]` where applicable.

```typescript
// Preferred signal-based inputs/outputs (Angular 17+)
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-example',
  imports: [],
  templateUrl: './example.html',
})
export class ExampleComponent {
  title = input<string>('');
  clicked = output<string>();
}
```

---

## Signals & State

- Use `signal()`, `computed()`, and `effect()` for reactive state — **not** `BehaviorSubject` or manual change detection.
- Use `toSignal()` / `toObservable()` from `@angular/core/rxjs-interop` when bridging RxJS with signals.
- Use `linkedSignal()` for dependent state that resets when its source changes.
- Use `resource()` / `rxResource()` for async data loading with signals.

```typescript
import { signal, computed, effect } from '@angular/core';

count = signal(0);
doubled = computed(() => this.count() * 2);
```

---

## Dependency Injection

- Use `inject()` function instead of constructor injection.
- Use `providedIn: 'root'` in `@Injectable` for singleton services.

```typescript
// Preferred
export class MyComponent {
  private myService = inject(MyService);
}

// Avoid
constructor(private myService: MyService) {}
```

---

## Routing

- Use `@angular/router` with `provideRouter()` in `app.config.ts`.
- Use `loadComponent` for lazy loading (not `loadChildren` with modules).
- Use `withComponentInputBinding()` to bind route params directly to component inputs.

---

## Forms

- Prefer **Reactive Forms** with typed `FormControl<T>` and `FormGroup`.
- Use `FormBuilder` via `inject(FormBuilder)`.
- Use `Validators` from `@angular/forms`.
- Avoid template-driven forms with `ngModel` for complex forms.

---

## HTTP

- Use `HttpClient` via `inject(HttpClient)`.
- Provide HTTP via `provideHttpClient(withFetch())` in `app.config.ts`.
- Use `toSignal(this.http.get(...))` to convert HTTP observables to signals where appropriate.
- Use `httpInterceptorFns` (functional interceptors) — not class-based interceptors.

---

## TypeScript

- Target **TypeScript ~5.9.x** — use modern features: `satisfies`, template literal types, `const` type parameters.
- Enable strict mode (`"strict": true` in `tsconfig.json`).
- Avoid `any` — use `unknown` and narrow types explicitly.

---

## Styling

- Stylesheet format is **SCSS** (configured in `angular.json`).
- Use component-level `styleUrl` (singular) — not `styleUrls` (array).
- Global styles go in `src/styles.scss`.

---

## Testing

- Test runner is **Vitest** (`vitest: ^4.0.8`) — not Karma/Jasmine.
- Use `jsdom` as the test environment.
- Do not suggest `TestBed` Karma-based setup; align with Vitest patterns.

---

## What to Avoid

| Avoid | Use Instead |
|-------|-------------|
| `*ngIf`, `*ngFor`, `*ngSwitch` | `@if`, `@for`, `@switch` |
| `NgModule`, `declarations` | Standalone components |
| `CommonModule` | Built-in control flow |
| `@Input()` / `@Output()` decorators | `input()` / `output()` signals |
| `BehaviorSubject` for component state | `signal()` |
| Constructor injection | `inject()` function |
| `standalone: true` in decorator | Omit (default in Angular 19+) |
| Class-based HTTP interceptors | Functional interceptors |
| Karma / Jasmine | Vitest |
