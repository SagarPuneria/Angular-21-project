# Angular KT Session 5 — Training Notes
**Trainer:** Chandishwar (Chandi) | **Series:** Angular Workshops – FullStack TFG (April 13–17, 2026)  
**Topic:** Angular Routing, Route Guards, Route Parameters, Reactive Forms, FormArray, Signal Forms (Experimental)

## Series Navigation

| Session | Core Topics | Demo / Focus Area |
|---|---|---|
| [Session 1](KT-Session-1.md) | JS & TypeScript Prerequisites | ES6+, TypeScript types, OOP, decorators, generics |
| [Session 2](KT-Session-2.md) | Angular Architecture & Setup | SPA vs MPA, CLI, project structure, building blocks |
| [Session 3](KT-Session-3.md) | Data Binding & Lifecycle Hooks | All binding types, `@if`/`@for`, lifecycle hooks, parent-child |
| [Session 4](KT-Session-4.md) | Services, RxJS & HttpClient | DI, Observables, BehaviorSubject, HTTP CRUD, interceptors |
| **Session 5 ←** | **Routing, Guards & Forms** | **Route config, canActivate, lazy loading, Reactive Forms** |

---

## Table of Contents
1. [Angular Routing — Core Concepts](#1-angular-routing--core-concepts)
2. [Route Configuration — `app.routes.ts`](#2-route-configuration--approutests)
3. [RouterOutlet, RouterLink, RouterLinkActive](#3-routeroutlet-routerlink-routerlinkactive)
4. [Route Types — Redirect, Specific, Wildcard, Child](#4-route-types--redirect-specific-wildcard-child)
5. [Lazy Loading — `loadComponent`](#5-lazy-loading--loadcomponent)
6. [Route Guards — `canActivate`](#6-route-guards--canactivate)
7. [Route Guards — `canDeactivate`](#7-route-guards--candeactivate)
8. [Route Parameters](#8-route-parameters)
9. [Reactive Forms — Introduction](#9-reactive-forms--introduction)
10. [FormBuilder, FormGroup, FormControl](#10-formbuilder-formgroup-formcontrol)
11. [Form Validation and State](#11-form-validation-and-state)
12. [FormArray — Dynamic Repeated Fields](#12-formarray--dynamic-repeated-fields)
13. [`patchValue`, `setValue`, and `getRawValue`](#13-patchvalue-setvalue-and-getrawvalue)
14. [Service-Backed Form Flow — Register → Summary](#14-service-backed-form-flow--register--summary)
15. [FormControl — Advanced Options and `toSignal` vs `computed`](#15-formcontrol--advanced-options-and-tosignal-vs-computed)
16. [Signal Forms — Experimental (Angular 21)](#16-signal-forms--experimental-angular-21)
17. [Key Takeaways from Session 5](#key-takeaways-from-session-5)

---

## 1. Angular Routing — Core Concepts

### What Is Angular Routing?

Angular Routing is a **client-side navigation mechanism** that lets an Angular application switch between views (components) based on the browser URL — without reloading the entire page.

> *"The single agenda of a single-page application (SPA) is: we are not reloading a page. We are always dealing with one HTML file, and based on the user's action, the relevant component is loaded into that HTML."*

```
Traditional multi-page app:  click → browser requests NEW HTML from server → full page reload
Angular SPA:                 click → URL updates → component swaps inside one HTML file
```

### How the SPA Bootstrap Works

```
Browser loads index.html (once)
         ↓
main.ts — bootstrapApplication(App, appConfig)
         ↓
app.config.ts — provideRouter(routes, ...)
         ↓
app.html — contains <router-outlet>
         ↓
Angular Router watches the URL
  → URL changes → loads matching component into <router-outlet>
```

### The `@angular/router` Package

Angular Router is not part of `@angular/core` — it is a separate package from the Angular framework included in every new Angular project:

```typescript
// app.config.ts
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    // withComponentInputBinding() → route params are auto-bound to component input() signals
  ],
};
```

### Shopping Mall Analogy

| Real World | Angular Routing |
|---|---|
| Shopping mall with multiple floors | Angular app with multiple routes |
| Ground floor (free entry) | Public routes — `home`, `about`, `products` |
| Cinema floor (ticket required) | Protected route — `dashboard` (needs authentication) |
| Security guard at cinema | Route guard (`canActivate`) |
| Showing your ticket | Returning `true` from the guard |
| Being turned away | Guard redirecting to `/login` |

---

## 2. Route Configuration — `app.routes.ts`

All routes are defined in `app.routes.ts` as an array of `Routes`. This file is the **rulebook** — it maps URL paths to components.

### Actual Workspace Configuration

```typescript
// src/app/app.routes.ts
import { Routes }    from '@angular/router';
import { Home }      from './pages/home/home';
import { About }     from './pages/about/about';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [

  // Default route — redirect empty path to /home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Eagerly loaded — bundled at startup
  { path: 'home',  component: Home },
  { path: 'about', component: About },

  // Courses — lazy loaded parent + lazy loaded children
  {
    path: 'courses',
    loadComponent: () => import('./pages/courses/courses').then(m => m.Courses),
    children: [
      { path: '',         redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./pages/courses/overview/course-overview').then(m => m.CourseOverview) },
      { path: 'details',  loadComponent: () => import('./pages/courses/details/course-details').then(m => m.CourseDetails) },
    ],
  },

  // Products — lazy loaded list + detail with route param :id
  {
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductList),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },

  // Registration flow — register form → summary page (data shared via RegistrationDataService)
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'summary',
    loadComponent: () => import('./pages/summary/summary').then(m => m.Summary),
  },

  // Forms demos
  {
    path: 'form-array',
    loadComponent: () => import('./pages/form-array/form-array').then(m => m.FormArrayExample),
  },
  {
    path: 'controls-demo',
    loadComponent: () => import('./pages/controls-demo/controls-demo').then(m => m.ControlsDemo),
  },
  {
    path: 'signal-form',
    loadComponent: () => import('./pages/signal-form/signal-form').then(m => m.SignalForm),
  },

  // Enroll — lazy loaded (separate JS chunk)
  {
    path: 'enroll',
    loadComponent: () => import('./pages/enroll/enroll').then(m => m.Enroll),
  },

  // Dashboard — protected by authGuard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
  },

  // Login — public
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },

  // Wildcard — catch all unknown URLs and redirect to home
  { path: '**', redirectTo: 'home' },
];
```

### The Two-Step Process for Navigation

When the user clicks a link (e.g. `routerLink="/about"`):

1. The browser URL updates to `/about`
2. Angular Router scans `routes` top-to-bottom for a matching `path`
3. The matched component is loaded into `<router-outlet>`

No server round-trip happens — Angular handles everything in the browser.

---

## 3. RouterOutlet, RouterLink, RouterLinkActive

Three template directives from `@angular/router` power most routing interaction:

### `<router-outlet>`

The **placeholder** in the template where the matched component is rendered. Without it, navigation changes the URL but nothing appears on screen.

```html
<!-- app.html — top-level outlet -->
<nav>
  <a routerLink="/home"  routerLinkActive="active">Home</a>
  <a routerLink="/about" routerLinkActive="active">About</a>
  <a routerLink="/courses" routerLinkActive="active">Courses</a>
</nav>

<router-outlet />
<!-- ↑ matched component renders here when URL changes -->
```

Every parent component with child routes also needs its own nested `<router-outlet>`:

```html
<!-- courses.html — outlet for overview and details child routes -->
<nav>
  <a routerLink="overview" routerLinkActive="active">Overview</a>
  <a routerLink="details"  routerLinkActive="active">Details</a>
</nav>

<router-outlet />
```

### `routerLink`

Use `routerLink` instead of `href` for internal navigation — `href` triggers a full page reload, `routerLink` uses the Angular router.

```html
<!-- ❌ Full page reload — loses application state -->
<a href="/home">Home</a>

<!-- ✅ Client-side navigation — preserves application state -->
<a routerLink="/home">Home</a>

<!-- ✅ Array syntax for dynamic paths -->
<a [routerLink]="['/products', product.id]">View Product</a>
```

### `routerLinkActive`

Applies a CSS class to the link when its route is currently active:

```html
<!-- The "active" class is applied when /home is the current URL -->
<a routerLink="/home" routerLinkActive="active">Home</a>
```

```typescript
// Component must import RouterLink, RouterLinkActive (or RouterModule)
@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  ...
})
```

---

## 4. Route Types — Redirect, Specific, Wildcard, Child

### Default / Redirect Route

Runs when the URL is empty (user opens the app root with no path):

```typescript
{ path: '', redirectTo: 'home', pathMatch: 'full' }
// pathMatch: 'full' — only matches when the URL is EXACTLY '' (empty)
// Without 'full', it would match every URL that starts with ''
```

### Specific Route

Maps a fixed path to a component (eagerly or lazily loaded):

```typescript
{ path: 'home',  component: Home }         // eager
{ path: 'login', loadComponent: () => ... } // lazy
```

### Wildcard Route (`**`)

Catches any URL that didn't match any of the routes above. **Must always be last** — routes are matched top-to-bottom:

```typescript
{ path: '**', redirectTo: 'home' }
```

> If `**` were placed first, it would catch every URL and nothing else would ever match.

### Child Routes

Child routes are nested under a parent path. The parent component must contain its own `<router-outlet>` to render children:

```typescript
{
  path: 'courses',
  loadComponent: () => import('./pages/courses/courses').then(m => m.Courses),
  children: [
    { path: '',         redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', loadComponent: () => ... },
    { path: 'details',  loadComponent: () => ... },
  ],
}
```

| URL | What Renders |
|---|---|
| `/courses` | Courses + redirects to `/courses/overview` |
| `/courses/overview` | Courses parent + CourseOverview in nested outlet |
| `/courses/details` | Courses parent + CourseDetails in nested outlet |

The URL reflects the hierarchy: child paths are relative to the parent (`overview` → `/courses/overview`).

---

## 5. Lazy Loading — `loadComponent`

### What Is Lazy Loading?

By default, Angular bundles all components into the initial JavaScript download. Lazy loading defers loading a component until the user actually navigates to that route — reducing the initial bundle size and improving startup performance.

### Eager vs Lazy

```typescript
// Eager — component code is in the initial bundle (loaded at app startup)
{ path: 'home', component: Home }

// Lazy — component code is in a separate JS chunk (loaded only when navigated to)
{
  path: 'enroll',
  loadComponent: () => import('./pages/enroll/enroll').then(m => m.Enroll),
}
```

The `import()` call inside `loadComponent` is a **dynamic import** — JavaScript loads the module on demand, not at startup.

### Real-World Justification

> *"Out of 10 users, 9 come to see what courses are available, price, and schedule. Only 1 will actually click Enroll. So why download the Enroll component for all 10 users?"*

| Approach | Initial bundle | User experience |
|---|---|---|
| Eager load everything | Larger | Slower first load |
| Lazy load infrequent pages | Smaller | Faster first load; tiny delay on first navigation |

### What You See in the Browser Network Tab

- On initial load: `main.js`, `home.js`, `about.js` — no `enroll.js`
- When user clicks Enroll: browser fetches `enroll.js` chunk on demand

### All Routes in This Project

| Route | Loading Strategy | Notes |
|---|---|---|
| `home`, `about` | Eager | Imported at top of `app.routes.ts` |
| `courses`, `overview`, `details` | Lazy (`loadComponent`) | Parent + child routes |
| `products` | Lazy | Product list |
| `products/:id` | Lazy | Product detail — `:id` auto-bound to `input()` via `withComponentInputBinding()` |
| `register` | Lazy | Registration form; submits data to `RegistrationDataService` |
| `summary` | Lazy | Shows data stored by `RegistrationDataService` |
| `form-array` | Lazy | `FormArray` demo (dynamic phone numbers + skills) |
| `controls-demo` | Lazy | `FormGroup`/`FormControl` advanced options (`nonNullable`, `toSignal` vs `computed`) |
| `signal-form` | Lazy | Signal-based form experiment (no `FormControl`) |
| `enroll` | Lazy | Least-frequent action — a typical lazy-load justification |
| `dashboard` | Lazy + guarded by `authGuard` | Protected route |
| `login` | Lazy | Public — handles `?returnUrl` redirect |

---

## 6. Route Guards — `canActivate`

### What Is a Route Guard?

A route guard is a function that runs **before** a route is activated. It decides whether navigation to that route is allowed.

> *"Like a security guard at a cinema entrance — you must show your ticket before entering. The guard checks: is this user authenticated? If yes, enter. If no, redirect to the login page."*

### Functional Guard — `CanActivateFn` (Angular 17+)

The modern approach is a **functional guard** — a plain function, no class or decorator needed:

```typescript
// src/app/auth/auth.guard.ts
import { inject }                    from '@angular/core';
import { CanActivateFn, Router }     from '@angular/router';
import { AuthService }               from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn()) {
    return true;   // ✅ allow navigation
  }

  // ❌ block navigation — redirect to login, passing the attempted URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
```

### AuthService (signal-based)

```typescript
// src/app/auth/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  readonly loggedIn = signal(false);  // ← reactive login state

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === '1234') {
      this.loggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
```

### Applying the Guard to a Route

```typescript
// app.routes.ts
{
  path: 'dashboard',
  canActivate: [authGuard],     // ← guard runs before activating this route
  loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
}
```

### Login Component — Reading the `returnUrl`

After login succeeds, the user is sent back to the page they originally tried to reach:

```typescript
// src/app/pages/login/login.ts
export class Login {
  private authService = inject(AuthService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);

  username = signal('');
  password = signal('');
  error    = signal('');

  submit(): void {
    if (this.authService.login(this.username(), this.password())) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.error.set('Invalid credentials. Try admin / 1234');
    }
  }
}
```

### Guard Return Values

| Return value | Effect |
|---|---|
| `true` | Navigation proceeds |
| `false` | Navigation is blocked (user stays on current page) |
| `UrlTree` (from `router.createUrlTree(...)`) | Navigation redirected to the given URL |

---

## 7. Route Guards — `canDeactivate`

### What Is `canDeactivate`?

`canDeactivate` runs **before** the user navigates **away** from a route. The most common use case is preventing loss of unsaved form data.

> *"Have you ever filled a long form, then accidentally pressed the back button and seen a popup: 'You have unsaved changes. Are you sure you want to leave?'"*

### Functional `CanDeactivateFn`

```typescript
// unsaved-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';

// Define an interface components can implement
export interface CanDeactivateComponent {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanDeactivateComponent> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Leave this page?');
  }
  return true;  // allow navigation if no unsaved changes
};
```

### Applying to a Route

```typescript
{
  path: 'registration',
  component: RegistrationForm,
  canDeactivate: [unsavedChangesGuard],
}
```

### Component Implementation

```typescript
export class RegistrationForm implements CanDeactivateComponent {
  private form = inject(FormBuilder).group({ ... });

  hasUnsavedChanges(): boolean {
    return this.form.dirty;   // form.dirty = true when user has typed anything
  }
}
```

### Guard Types Summary

| Guard | Runs | Use Case |
|---|---|---|
| `canActivate` | Before entering a route | Authentication, authorization |
| `canDeactivate` | Before leaving a route | Unsaved form data protection |
| `canMatch` | Before route is matched | Feature flags, role-based route availability |
| `resolve` | Before route is activated | Pre-fetch data before component loads |

---

## 8. Route Parameters

### What Are Route Parameters?

Route parameters allow data to be embedded in the URL. This is how product detail pages, user profiles, and article pages work — one route definition handles all records:

```typescript
// Route config — :id is a dynamic segment
{ path: 'products/:id', loadComponent: () => ... }
```

| URL | `id` value |
|---|---|
| `/products/1` | `"1"` |
| `/products/42` | `"42"` |
| `/products/abc` | `"abc"` |

One route definition handles all 220,000 products — you don't write 220,000 different paths.

### Navigating to a Parameterised Route

```html
<!-- From a product list template -->
@for (product of products(); track product.id) {
  <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
}
```

```typescript
// Programmatic navigation
this.router.navigate(['/products', product.id]);
```

### Reading Route Parameters — Modern Approach (Angular 17+)

With `withComponentInputBinding()` enabled in `app.config.ts`, route parameters are automatically bound to component `input()` signals — no `ActivatedRoute` needed:

```typescript
// app.config.ts — enables input binding from route params
provideRouter(routes, withComponentInputBinding())
```

The workspace demonstrates this with the `ProductList` → `ProductDetail` flow in `src/app/pages/product-list/` and `src/app/pages/product-detail/`:

```typescript
// pages/product-list/products.data.ts — shared product data
export interface Product {
  id: number;
  name: string;
  price: number;
}

export const ALL_PRODUCTS: Product[] = [
  { id: 1, name: 'Angular Book', price: 29 },
  { id: 2, name: 'TypeScript Course', price: 49 },
  { id: 3, name: 'RxJS Guide', price: 19 },
];
```

```typescript
// pages/product-list/product-list.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_PRODUCTS, Product } from './products.data';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
})
export class ProductList {
  products: Product[] = ALL_PRODUCTS;
}
```

```html
<!-- product-list.html — navigate to detail with the product's id -->
@for (product of products; track product.id) {
  <a [routerLink]="['/products', product.id]">{{ product.name }} — ${{ product.price }}</a>
}
```

```typescript
// pages/product-detail/product-detail.ts
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_PRODUCTS, Product } from '../product-list/products.data';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  // Route param :id is automatically bound via withComponentInputBinding() in app.config.ts.
  // No ActivatedRoute, no ngOnInit subscription needed.
  id = input<string>('');

  // computed() reads id() — a signal — so it re-evaluates whenever :id changes.
  product = computed<Product | undefined>(() =>
    ALL_PRODUCTS.find(p => String(p.id) === this.id()),
  );
}
```

```html
<!-- product-detail.html -->
@if (product()) {
  <h2>{{ product()!.name }}</h2>
  <p>Price: ${{ product()!.price }}</p>
} @else {
  <p>Product not found.</p>
}
<a routerLink="/products">← Back to list</a>
```

### Reading Route Parameters — Traditional Approach

If `withComponentInputBinding()` is not configured, or if you need to react to param changes while staying on the same component, use `ActivatedRoute`:

```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({ ... })
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  productId = signal('');

  ngOnInit(): void {
    // paramMap is an Observable — emits each time the param changes
    this.route.paramMap.subscribe(params => {
      this.productId.set(params.get('id') ?? '');
    });
  }
}
```

### Passing Multiple Parameters and Query Params

```typescript
// Route with multiple segments
{ path: 'products/:category/:id', component: ProductDetail }

// Query parameters (e.g. /products?sort=price&page=2)
this.router.navigate(['/products'], { queryParams: { sort: 'price', page: 2 } });

// Reading query params
this.route.queryParamMap.subscribe(params => {
  const sort = params.get('sort');
});
```

---

## 9. Reactive Forms — Introduction

### Why Reactive Forms?

Angular provides a dedicated forms library (`@angular/forms`) that gives you:

| Feature | Without `@angular/forms` | With `@angular/forms` |
|---|---|---|
| Track field values | Manual variable per field | `form.get('field').value` |
| Validate inputs | Manual checks in code | Declarative `Validators` |
| Track field state | Manual flags | `.valid`, `.invalid`, `.touched`, `.dirty` |
| Show error messages | Custom logic | Conditional template using `.errors` |
| Pre-populate form data | Manual assignment | `patchValue()` / `setValue()` |
| Reset form | Manual reset of all vars | `form.reset()` |

### Two Form Approaches in Angular

| | Template-Driven | Reactive |
|---|---|---|
| Definition | In HTML template with directives | In TypeScript class |
| Module | `FormsModule` | `ReactiveFormsModule` |
| Testing | Harder (DOM-dependent) | Easy (pure TypeScript) |
| Best for | Simple login forms, small inputs | Complex forms, dynamic fields, validation |

Reactive Forms is the recommended approach for any non-trivial form in Angular.

### Providing the Forms Module

```typescript
// In the component's imports array (standalone components)
@Component({
  imports: [ReactiveFormsModule],
  ...
})
export class RegistrationForm { ... }
```

---

## 10. FormBuilder, FormGroup, FormControl

### The Building Blocks

| Class | Purpose |
|---|---|
| `FormControl` | Tracks the value and state of a single input field |
| `FormGroup` | Groups multiple `FormControl`s into one object |
| `FormBuilder` | Angular service — factory for creating `FormGroup` / `FormControl` with less boilerplate |
| `Validators` | Built-in validation functions (`required`, `email`, `minLength`, `maxLength`, etc.) |

### Creating a Form with `FormBuilder` (Recommended)

```typescript
// registration-form.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration-form',
  imports: [ReactiveFormsModule],
  templateUrl: './registration-form.html',
})
export class RegistrationForm {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    fullName:       ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', [Validators.required, Validators.email]],
    city:           ['', Validators.required],
    attendanceMode: ['', Validators.required],
  });
  // ↑ First element = initial value, Second = validators (array or single)

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form data:', this.form.getRawValue());
    }
  }

  showError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
```

### Equivalent Using `new FormGroup` (More Verbose)

Both approaches produce identical behaviour — `FormBuilder` is syntactic sugar:

```typescript
// ✅ With FormBuilder (recommended)
form = this.fb.group({
  fullName: ['', [Validators.required, Validators.minLength(3)]],
  email:    ['', [Validators.required, Validators.email]],
});

// ✅ With new FormGroup (equivalent — more code)
form = new FormGroup({
  fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
  email:    new FormControl('', [Validators.required, Validators.email]),
});
```

### Binding the Form to the Template

```html
<!-- registration-form.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">

  <!-- Full Name -->
  <label>Full Name</label>
  <input formControlName="fullName" placeholder="Enter full name" />
  @if (showError('fullName')) {
    <span class="error">
      @if (form.get('fullName')?.errors?.['required'])  { Full name is required. }
      @if (form.get('fullName')?.errors?.['minlength']) { Minimum 3 characters required. }
    </span>
  }

  <!-- Email -->
  <label>Email</label>
  <input type="email" formControlName="email" placeholder="Enter email" />
  @if (showError('email')) {
    <span class="error">
      @if (form.get('email')?.errors?.['required']) { Email is required. }
      @if (form.get('email')?.errors?.['email'])    { Enter a valid email address. }
    </span>
  }

  <!-- City -->
  <label>City</label>
  <input formControlName="city" placeholder="Enter city" />
  @if (showError('city')) {
    <span class="error">City is required.</span>
  }

  <!-- Attendance Mode -->
  <label>Attendance Mode</label>
  <select formControlName="attendanceMode">
    <option value="">-- Select --</option>
    <option value="Online">Online</option>
    <option value="Offline">Offline</option>
  </select>
  @if (showError('attendanceMode')) {
    <span class="error">Please select an attendance mode.</span>
  }

  <button type="submit" [disabled]="form.invalid">Submit</button>

</form>
```

### Key Template Directives

| Directive | Where | Purpose |
|---|---|---|
| `[formGroup]="form"` | `<form>` | Binds the entire `FormGroup` to the HTML form |
| `(ngSubmit)="onSubmit()"` | `<form>` | Calls `onSubmit()` when the form is submitted |
| `formControlName="fieldName"` | `<input>` | Binds a single control inside the group |

---

## 11. Form Validation and State

### Control State Properties

Every `FormControl` has state flags that Angular updates automatically:

| Property | Meaning |
|---|---|
| `.valid` | All validators pass |
| `.invalid` | One or more validators fail |
| `.pristine` | User has not yet interacted with this field |
| `.dirty` | User has typed or changed the value |
| `.untouched` | Field has never received focus |
| `.touched` | Field has received and lost focus at least once |

### Why Validation Messages Use `.touched`

When the form loads, all fields are empty and technically `invalid` (if `required`). Showing errors immediately on load is bad UX. The convention: **only show errors after the user has touched the field** (focused and blurred it):

```typescript
showError(field: string): boolean {
  const ctrl = this.form.get(field);
  return !!(ctrl?.invalid && ctrl?.touched);  // dirty also works
}
```

### Built-in Validators

```typescript
import { Validators } from '@angular/forms';

Validators.required             // field must not be empty
Validators.email                // must be a valid email format
Validators.minLength(3)         // at least 3 characters
Validators.maxLength(50)        // at most 50 characters
Validators.min(0)               // numeric minimum
Validators.max(100)             // numeric maximum
Validators.pattern(/^\d{10}$/)  // must match regex (e.g. 10-digit phone)
```

### Form-Level Validity

```typescript
// In component class
onSubmit(): void {
  if (this.form.valid) {
    const data = this.form.getRawValue();  // typed object matching the form shape
    console.log(data);
    // → send to API, navigate to next step, etc.
  }
}
```

```html
<!-- In template — disable submit until entire form is valid -->
<button type="submit" [disabled]="form.invalid">Submit</button>
```

---

## 12. FormArray — Dynamic Repeated Fields

### When to Use FormArray

`FormGroup` handles **one set of fields** (one name, one email, one city).  
`FormArray` handles **a variable number of the same field group** — like multiple phone numbers, multiple skills, or multiple addresses.

| Data shape | Use |
|---|---|
| Single value | `FormControl` |
| Fixed set of fields | `FormGroup` |
| Repeating set (0 to N entries) | `FormArray` |

### FormArray Example — Dynamic Phone Numbers

```typescript
// contact-form.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
})
export class ContactForm {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name:         ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    phoneNumbers: this.fb.array([this.createPhoneNumber()]),  // start with one entry
    skills:       this.fb.array([this.fb.control('')]),
  });

  // Typed getter — avoids casting in template
  get phoneNumbers(): FormArray {
    return this.form.get('phoneNumbers') as FormArray;
  }

  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  createPhoneNumber(): FormGroup {
    return this.fb.group({
      number: ['', Validators.required],
      type:   ['mobile'],            // default type
    });
  }

  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneNumber());
  }

  removePhoneNumber(index: number): void {
    this.phoneNumbers.removeAt(index);
  }

  addSkill(): void {
    this.skills.push(this.fb.control(''));
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
    }
  }
}
```

### FormArray Template

```html
<!-- contact-form.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">

  <input formControlName="name"  placeholder="Name" />
  <input formControlName="email" placeholder="Email" />

  <!-- Phone Numbers (FormArray) -->
  <h4>Phone Numbers</h4>
  <div formArrayName="phoneNumbers">
    @for (ctrl of phoneNumbers.controls; track $index; let i = $index) {
      <div [formGroupName]="i">
        <input  formControlName="number" placeholder="Phone number" />
        <select formControlName="type">
          <option value="mobile">Mobile</option>
          <option value="home">Home</option>
          <option value="work">Work</option>
        </select>
        <button type="button" (click)="removePhoneNumber(i)">Remove</button>
      </div>
    }
  </div>
  <button type="button" (click)="addPhoneNumber()">+ Add Phone</button>

  <!-- Skills (FormArray of simple controls) -->
  <h4>Skills</h4>
  <div formArrayName="skills">
    @for (ctrl of skills.controls; track $index; let i = $index) {
      <div>
        <input [formControlName]="i" placeholder="Skill" />
        <button type="button" (click)="removeSkill(i)">Remove</button>
      </div>
    }
  </div>
  <button type="button" (click)="addSkill()">+ Add Skill</button>

  <button type="submit" [disabled]="form.invalid">Submit</button>

</form>
```

### `formArrayName` + `[formGroupName]` — How It Works

```
[formGroup]="form"                 ← binds top-level FormGroup
  formArrayName="phoneNumbers"     ← binds the FormArray inside it
    [formGroupName]="i"            ← binds each FormGroup within the array (by index)
      formControlName="number"     ← binds the FormControl inside that group
```

The string passed to `formArrayName` must exactly match the key used in `this.fb.group({ phoneNumbers: ... })`.

---

## 13. `patchValue`, `setValue`, and `getRawValue`

### Pre-populating Form Data

When editing an existing record, you need to load the current values into the form before the user sees it. Two methods accomplish this:

```typescript
// patchValue — update some fields; unspecified fields are left unchanged ✅
this.form.patchValue({
  fullName: 'Alice Johnson',
  city:     'Hyderabad',
  // email and attendanceMode are NOT set — retain their current values
});

// setValue — update ALL fields; every field must be provided ✅
this.form.setValue({
  fullName:       'Alice Johnson',
  email:          'alice@example.com',
  city:           'Hyderabad',
  attendanceMode: 'Online',
  // omitting any field throws an error
});
```

**Use `patchValue` when** loading partial data (e.g. from a profile endpoint that doesn't return all fields).  
**Use `setValue` when** you have the complete record and want to guarantee all controls are set.

### Reading Form Values

```typescript
// .value — returns only the enabled controls' values
const partialData = this.form.value;

// .getRawValue() — returns ALL controls' values, including disabled ones ✅ (recommended)
const fullData = this.form.getRawValue();
```

> `getRawValue()` is preferred because it returns a fully-typed object matching the form shape, including any controls you may have temporarily disabled (e.g. a read-only field).

### Resetting the Form

```typescript
this.form.reset();                          // clears all values, resets state flags
this.form.reset({ city: 'Hyderabad' });     // clears most fields, keeps city
this.form.get('email')?.reset();            // reset only one control
```

---

## 14. Service-Backed Form Flow — Register → Summary

### The Pattern

A common pattern in real Angular apps: a form submits data, the data is stored in a shared service, and a second component reads it to display a confirmation. This avoids passing large objects through route params and is a natural extension of the DI-based service pattern from Session 4.

```
User fills /register form
  → Register.submit() calls RegistrationDataService.setData(formValue)
  → Router navigates to /summary
  → Summary reads RegistrationDataService.data() (a readonly signal)
  → Displays the submitted data
```

### `RegistrationDataService`

```typescript
// services/registration-data.service.ts
import { Injectable, signal } from '@angular/core';

export interface RegistrationData {
  fullName: string;
  email: string;
  city: string;
  attendanceMode: 'In-Person' | 'Online' | 'Hybrid' | '';
}

@Injectable({ providedIn: 'root' })
export class RegistrationDataService {
  // Private writable signal — only this service can set the value
  private readonly formData = signal<RegistrationData | null>(null);

  // Public read-only signal — components read from this
  readonly data = this.formData.asReadonly();

  setData(value: RegistrationData): void { this.formData.set(value); }
  clearData(): void { this.formData.set(null); }
}
```

Key points:
- Uses `signal<T | null>()` for nullable state — `null` means "no data submitted yet"
- `.asReadonly()` exposes a read-only signal; no component can call `.set()` on it
- `providedIn: 'root'` means the same instance is shared between `Register` and `Summary`

### `Register` Component

```typescript
// pages/register/register.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationData, RegistrationDataService } from '../../services/registration-data.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly registrationDataService = inject(RegistrationDataService);

  readonly attendanceModes = ['In-Person', 'Online', 'Hybrid'] as const;

  readonly registrationForm = this.formBuilder.group({
    fullName:       ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', [Validators.required, Validators.email]],
    city:           ['', [Validators.required]],
    attendanceMode: ['', [Validators.required]],
  });

  showError(controlName: 'fullName' | 'email' | 'city' | 'attendanceMode'): boolean {
    const control = this.registrationForm.controls[controlName];
    return !!(control.invalid && (control.dirty || control.touched));
  }

  loadDemoData(): void {
    this.registrationForm.patchValue({
      fullName: 'Chandishwar Chittimalla',
      email: 'ccchandishwar@gmail.com',
      city: 'Hyderabad',
      attendanceMode: 'Online',
    });
  }

  submit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();  // show all validation errors at once
      return;
    }
    const formValue = this.registrationForm.getRawValue() as RegistrationData;
    this.registrationDataService.setData(formValue);   // store in service
    void this.router.navigate(['/summary']);            // navigate to summary
  }
}
```

### `Summary` Component

```typescript
// pages/summary/summary.ts
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationDataService } from '../../services/registration-data.service';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
})
export class Summary {
  private readonly router = inject(Router);
  private readonly registrationDataService = inject(RegistrationDataService);

  // Read the signal directly — no subscription needed
  readonly data = this.registrationDataService.data;

  // computed() works here because data is a signal()
  readonly hasData = computed(() => !!this.data());

  edit(): void  { void this.router.navigate(['/register']); }
  clear(): void { this.registrationDataService.clearData(); }
}
```

```html
<!-- summary.html -->
@if (hasData()) {
  <p><strong>Name:</strong> {{ data()!.fullName }}</p>
  <p><strong>Email:</strong> {{ data()!.email }}</p>
  <p><strong>City:</strong> {{ data()!.city }}</p>
  <p><strong>Mode:</strong> {{ data()!.attendanceMode }}</p>
  <button (click)="edit()">Edit</button>
  <button (click)="clear()">Clear</button>
} @else {
  <p>No registration data. <a routerLink="/register">Go to Register</a></p>
}
```

### Why Not Pass Data via Route Params?

Route params are strings — embedding a large object in the URL requires serialization, is limited by URL length, and is visible to the user. A shared service solves all these issues cleanly, follows the DI principle from Session 4, and keeps the URL simple.

---

## 15. FormControl — Advanced Options and `toSignal` vs `computed`

The workspace `/controls-demo` route (`src/app/pages/controls-demo/controls-demo.ts`) demonstrates three things that come up when you move beyond basic `FormBuilder.group()`:

1. `FormGroup` with `new FormControl` directly — including the `nonNullable` option
2. A standalone `FormControl` used outside any `FormGroup`
3. The critical rule: **`computed()` cannot track `FormGroup`/`FormControl` state — use `toSignal()` instead**

### `nonNullable` FormControl

By default, `FormControl.reset()` sets the value to `null`. The `nonNullable: true` option makes `reset()` restore the **initial value** instead:

```typescript
// Default (nullable) — reset() → null
const control = new FormControl('');
control.reset();          // value is now null

// nonNullable: true — reset() → initial value
const control = new FormControl('', { nonNullable: true });
control.reset();          // value is now '' (the initial value)
```

### `FormGroup` with `new FormControl` Directly (Workspace)

```typescript
// controls-demo.ts — Section 1
readonly profileForm = new FormGroup({
  firstName: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)],
  }),
  age: new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0),
    Validators.max(120),
  ]),
});
```

Using `new FormControl` directly instead of `FormBuilder.group()` gives explicit control over the `nonNullable` option and the generic type parameter (`FormControl<number | null>`).

### Standalone `FormControl` (Outside a `FormGroup`)

A `FormControl` can be used independently — bound directly to an input with `[formControl]`:

```typescript
// controls-demo.ts — Section 2
readonly emailControl = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.email],
});
```

```html
<!-- Bind with [formControl] (not formControlName — that requires a FormGroup) -->
<input [formControl]="emailControl" type="email" />
@if (emailControl.invalid && emailControl.touched) {
  <span class="error">Enter a valid email address.</span>
}
```

### `computed()` Does NOT Track `FormGroup` State — Use `toSignal()`

This is a critical rule documented in the workspace:

```typescript
// ❌ WRONG — computed() reads .valid/.dirty/.touched which are plain class getters, NOT signals
// computed() establishes zero reactive dependencies — it will NEVER re-run
readonly state = computed(() => ({
  valid:   this.controlsForm.valid,     // plain getter — not a signal
  dirty:   this.controlsForm.dirty,     // plain getter — not a signal
  touched: this.controlsForm.touched,   // plain getter — not a signal
}));
```

```typescript
// ✅ CORRECT — toSignal() bridges the form.events Observable into a signal
// form.events (Angular 18+) emits on every control interaction
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

readonly state = toSignal(
  this.controlsForm.events.pipe(
    map(() => ({
      valid:   this.controlsForm.valid,
      dirty:   this.controlsForm.dirty,
      touched: this.controlsForm.touched,
    })),
  ),
);
```

`form.events` (Angular 18+) is an Observable that emits a typed event (`TouchedChangeEvent`, `DirtyChangeEvent`, `StatusChangeEvent`, `ValueChangeEvent`) on every control interaction. `toSignal()` converts this stream into a signal so `@if (state()?.valid)` in the template reacts correctly.

### Rule of Thumb

| Source of truth | How to use in `computed()` / template |
|---|---|
| `signal()` / `computed()` | Use directly — full reactivity |
| Observable (RxJS, HttpClient, `form.events`) | `toSignal()` to bridge first |
| `FormGroup` / `FormControl` getters (`.valid`, `.dirty`, `.touched`) | `toSignal(form.events.pipe(map(...)))` |

---

## 16. Signal Forms — Experimental (Angular 21)

### What Are Signal Forms?

Signal Forms are an **experimental** feature introduced in recent Angular versions. Instead of `FormControl` (which is Observable-based), each field is represented as a `signal()`, and validation logic is expressed with `computed()`.

> As of Angular 21, the Angular team has not yet promoted signal forms to stable. They are suitable for exploration and learning, but production code should still use the stable `ReactiveFormsModule` APIs.

### Why Introduce Signals into Forms?

The same motivation that drove signals into components applies to forms:

| Observable-based forms | Signal-based forms |
|---|---|
| `FormControl.valueChanges` is an `Observable` | Field value is a `signal()` |
| Validation result requires subscribing | Validation is a `computed()` — synchronous, direct read |
| Change detection triggered by Zone.js | Change detection is targeted and fine-grained |

Fewer change detection cycles = better performance, especially for large forms with many fields.

### Signal Form Pattern (Workspace Implementation)

The workspace `/signal-form` route (`src/app/pages/signal-form/signal-form.ts`) demonstrates this. Note the difference from the simple `touched = signal(false)` approach — the workspace uses **per-field touch tracking** to show errors only on the specific field the user has interacted with:

```typescript
// pages/signal-form/signal-form.ts
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-signal-form',
  imports: [],
  templateUrl: './signal-form.html',
})
export class SignalForm {
  // ─── Form field signals ───────────────────────────────────────────────────
  // Each field is a plain signal — no FormControl, no FormGroup, no DI needed.
  readonly name     = signal('');
  readonly email    = signal('');
  readonly password = signal('');

  // Per-field touched tracking in a single object signal
  // (grouped to avoid three separate signals)
  readonly touched = signal({ name: false, email: false, password: false });

  // ─── Validation computed signals ─────────────────────────────────────────
  // computed() re-evaluates automatically whenever the signal it reads changes.
  // Returns a string error message or null (valid).

  readonly nameError = computed(() => {
    const v = this.name().trim();
    if (!v) return 'Name is required.';
    if (v.length < 2) return 'Name must be at least 2 characters.';
    return null;
  });

  readonly emailError = computed(() => {
    const v = this.email().trim();
    if (!v) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return null;
  });

  readonly passwordError = computed(() => {
    const v = this.password();
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    return null;
  });

  // Form-level validity — all error signals must return null
  readonly isValid = computed(() =>
    !this.nameError() && !this.emailError() && !this.passwordError(),
  );

  touch(field: 'name' | 'email' | 'password'): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  submit(): void {
    // Mark all fields touched to reveal all errors at once
    this.touched.set({ name: true, email: true, password: true });
    if (this.isValid()) {
      console.log({ name: this.name(), email: this.email(), password: this.password() });
    }
  }
}
```

```html
<!-- signal-form.html — plain event binding, no formControlName directive needed -->
<form (ngSubmit)="submit()">

  <input
    [value]="name()"
    (input)="name.set($any($event.target).value)"
    (blur)="touch('name')"
    placeholder="Name" />
  @if (touched().name && nameError()) {
    <span class="error">{{ nameError() }}</span>
  }

  <input
    type="email"
    [value]="email()"
    (input)="email.set($any($event.target).value)"
    (blur)="touch('email')"
    placeholder="Email" />
  @if (touched().email && emailError()) {
    <span class="error">{{ emailError() }}</span>
  }

  <input
    type="password"
    [value]="password()"
    (input)="password.set($any($event.target).value)"
    (blur)="touch('password')"
    placeholder="Password" />
  @if (touched().password && passwordError()) {
    <span class="error">{{ passwordError() }}</span>
  }

  <button type="submit" [disabled]="!isValid()">Submit</button>
</form>
```

**Key implementation insight**: `computed()` works here because every value read inside the callbacks (`this.name()`, `this.email()`, etc.) is a `signal()`. Angular tracks these dependencies and re-runs the computed signal automatically. This is the opposite of `controls-demo` where `FormControl` getters are plain class properties — not signals — and `computed()` never re-runs.

> See `signal-form.ts` for the inline documentation explaining exactly when `toSignal()` is and isn't needed.

### Signal Forms vs Reactive Forms — When to Use Which

| | Reactive Forms | Signal Forms |
|---|---|---|
| Stability | Stable — production-ready | Experimental in Angular 21 |
| API | `FormBuilder`, `FormGroup`, `FormControl`, `Validators` | `signal()`, `computed()` |
| Validation | `Validators` + `.errors` object | `computed()` returning strings |
| Angular integration | `[formGroup]`, `formControlName` directives | Plain property/event binding |
| Best for | Production apps, complex validation, edit forms | Learning signals; small/simple forms |

> **Recommendation:** Learn Reactive Forms thoroughly first. Once you are comfortable with them, exploring signal forms is straightforward because the concepts (field tracking, validation, submit handling) are identical — only the implementation mechanism changes.

---

## Key Takeaways from Session 5

1. **Angular routing is client-side** — the URL updates and a component swaps into `<router-outlet>` without a server round-trip or page reload
2. **`app.routes.ts` is the rulebook** — it maps paths to components; no business logic lives here
3. **Route matching is top-to-bottom** — order matters; place `**` (wildcard) last
4. **`<router-outlet>` is mandatory** — without it, routing works but nothing renders
5. **Use `routerLink` not `href`** for internal navigation — `href` reloads the page
6. **`routerLinkActive`** automatically applies a CSS class to the active navigation link
7. **Child routes** require a nested `<router-outlet>` in the parent component's template
8. **Lazy loading** (`loadComponent` with `import()`) reduces the initial bundle — only load what the user needs
9. **`canActivate`** guards protect routes from unauthenticated or unauthorised access; use the functional `CanActivateFn` signature
10. **`canDeactivate`** guards protect users from accidentally losing unsaved form data
11. **Route parameters** (`:id`) allow one route to serve any number of records; with `withComponentInputBinding()`, params bind directly to `input()` signals
12. **Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControl`, `Validators`) are the recommended approach for any non-trivial form
13. **`FormArray`** is for fields that repeat (multiple phone numbers, skills, addresses) — `FormGroup` for fixed-shape data
14. **Validation messages should check `.touched`** — don't show errors before the user has interacted
15. **`patchValue()`** updates some fields; **`setValue()`** requires all fields; **`getRawValue()`** reads all values including disabled controls
16. **Service-backed form flow**: form submits → service stores data via `signal()` → next component reads via `.asReadonly()` signal — avoids URL serialization and keeps data in a typed service
17. **`nonNullable: true`** on `FormControl` makes `reset()` restore the initial value instead of `null`; use `new FormControl<T | null>` when explicit generic typing is needed
18. **`computed()` cannot track `FormGroup`/`FormControl` state** — their `.valid`/`.dirty`/`.touched` are plain getters, not signals; use `toSignal(form.events.pipe(map(...)))` instead
19. **Signal Forms** are experimental in Angular 21 — use `signal()` + `computed()` per-field touch tracking; understand the pattern but use stable Reactive Forms in production

---

## Preview: Session 6 (If Applicable)
Based on the session, the trainer suggested continued practice on:
- Implementing `canDeactivate` guard for a registration form
- Extending existing projects with route guards via Copilot prompts
- Deeper form scenarios (custom validators, cross-field validation)

---

*Notes compiled from Angular KT Session 5 transcript — Trainer: Chandishwar*
