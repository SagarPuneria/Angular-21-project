# Angular KT Session 2 — Training Notes
**Trainer:** Chandishwar (Chandi) | **Series:** Angular Workshops – FullStack TFG (April 13–17, 2026)  
**Topic:** Angular Architecture, Building Blocks, Project Setup & Core Concepts

---

## Table of Contents
1. [Single-Page Application (SPA) vs Multi-Page Application (MPA)](#1-single-page-application-spa-vs-multi-page-application-mpa)
2. [AngularJS vs Angular 2+](#2-angularjs-vs-angular-2)
3. [Angular CLI Setup & Project Creation](#3-angular-cli-setup--project-creation)
4. [Angular Project Folder Structure](#4-angular-project-folder-structure)
5. [package.json Deep Dive](#5-packagejson-deep-dive)
6. [Angular Building Blocks](#6-angular-building-blocks)
7. [NgModule — The Root Module](#7-ngmodule--the-root-module)
8. [Angular Bootstrapping Process](#8-angular-bootstrapping-process)
9. [Angular vs React — Rendering & Architecture](#9-angular-vs-react--rendering--architecture)
10. [RxJS — Reactive Programming in Angular](#10-rxjs--reactive-programming-in-angular)
11. [Change Detection & Signals](#11-change-detection--signals)
12. [Component Communication](#12-component-communication)
13. [CLI Commands Reference](#13-cli-commands-reference)

---

## 1. Single-Page Application (SPA) vs Multi-Page Application (MPA)

### Demonstration: Gmail
Chandi opened Gmail and performed multiple actions (clicking folders, opening emails, going back). Key observation:
- The URL changes on every action
- The **browser never fully refreshes** — the spinning reload icon never activates
- This is the defining behaviour of a **Single-Page Application (SPA)**

### Multi-Page Application (MPA) — Legacy Model
- Every navigation triggers a **full round-trip to the server**
- Server returns a **new HTML page** for every URL
- Page reloads fully on every action
- Used by most web apps before frameworks like Angular and React became popular

### Single-Page Application (SPA)
```
Browser loads ONE HTML file (index.html) → Angular takes over → 
User interacts → Angular swaps components in/out without full page reload → 
URL updates (via router) → No server round-trip for navigation
```

**Key characteristics:**
- Only **one HTML page** is ever loaded (`index.html`)
- Based on the route and business logic, Angular **pumps the relevant component** into that single page
- Data is fetched via **REST or GraphQL API calls** (JSON responses) and rendered dynamically
- The user never experiences a page flash/reload

**Common SPA frameworks:** Angular, React, Vue

**Analogy:** A shopping mall — you enter the mall once (page load), then navigate to different shops (components) without leaving the building (browser tab).

---

## 2. AngularJS vs Angular 2+

### Timeline
- **~2010:** AngularJS (1.x) launched — built on JavaScript, MVC/MVVM pattern
- **2016:** Angular 2 launched — complete rewrite in TypeScript, component-based
- **Present:** Angular releases approximately **2–3 major versions per year**; currently at v21

### Key Differences

| | AngularJS (1.x) | Angular 2+ |
|---|---|---|
| Language | JavaScript | TypeScript (mandatory) |
| Architecture | MVC / MVVM | Component-based |
| Upgrade path | Cannot migrate to Angular 2+ easily | Any v2+ knowledge transfers to any later version |
| Module system | Tightly coupled | NgModule → Standalone components (Angular 17+) |
| Mobile support | Limited | Full mobile support via Ionic framework |
| Performance | Lower | Significantly improved |
| Data binding | Two-way (with $scope) | Unidirectional + event-based |
| DI system | Implicit | Explicit, hierarchical |

### Why Angular 2+ is Better Than AngularJS
- JavaScript is **loosely typed** → runtime bugs
- TypeScript catches errors **at write-time** — in the editor before compilation
- AngularJS had many "pitfalls" — framework patterns that led to hard-to-maintain code
- Angular 2+ is a complete redesign addressing all those issues

### Version Upgrade Reality
- **AngularJS → Angular 2:** Complete rewrite; start from scratch
- **Angular 2 → Any higher version (4, 5, 8, 12, 16, 20...):** Relatively smooth — the fundamentals are the same
- Example: CEP MIQ project upgraded from Angular 16 → Angular 20 successfully

### Angular 16 → 17+ Note (Material MDC Components)
Angular 17 introduced updated **Material Design Components (MDC)** — Google's newer Material standards. Upgrading from Angular 16 to 17+ requires migrating Material component usage (significant but manageable effort). This is why the session deliberately uses Angular 16 — to show the older NgModule-based architecture before introducing standalone components.

---

## 3. Angular CLI Setup & Project Creation

### Install Angular CLI

```bash
# Install globally (recommended for a primary dev machine)
npm install -g @angular/cli@latest

# Install a specific version globally
npm install -g @angular/cli@16

# Install locally (scoped to one project folder — avoids conflicts between projects)
npm install @angular/cli@16

# Verify installation — shows Angular, Node, TypeScript versions
ng version
# or (when using local install)
npx ng version
```

> **Why `npx`?** When working on multiple projects with different Angular versions, use `npx ng` to run the locally installed CLI, not the globally installed one. This prevents version conflicts.

### Create a New Angular Project

```bash
# Create new project (uses globally installed CLI version)
ng new my-app

# Create project with specific CLI version (local)
npx ng new my-app
```

The CLI scaffolds the entire project structure, installs `node_modules`, and sets up all configuration files in **one to two minutes**.

---

## 4. Angular Project Folder Structure

```
my-angular-app/
├── src/                        ← All application source code lives here
│   ├── app/                    ← Primary business logic folder
│   │   ├── app.module.ts       ← Root NgModule (Angular 16 style)
│   │   ├── app.component.ts    ← Root component (TypeScript class)
│   │   ├── app.component.html  ← Root component template
│   │   ├── app.component.css   ← Root component styles
│   │   └── app.component.spec.ts ← Root component unit tests
│   ├── assets/                 ← Static files: images, icons, fonts
│   ├── index.html              ← THE one HTML file (SPA entry point)
│   └── main.ts                 ← Application entry point (bootstraps the app)
├── angular.json                ← Angular CLI configuration (build, serve, test settings)
├── package.json                ← NPM dependencies and scripts
├── tsconfig.json               ← TypeScript compiler configuration (base)
├── tsconfig.app.json           ← TypeScript config for the app build
├── tsconfig.spec.json          ← TypeScript config for unit tests
└── node_modules/               ← All installed third-party packages
```

### Key File Roles

| File | Purpose |
|---|---|
| `src/index.html` | The **only** HTML file — SPA's single page. Contains `<app-root>` tag. |
| `src/main.ts` | **Entry point** — bootstraps the Angular app (calls `bootstrapModule` or `bootstrapApplication`) |
| `app/app.module.ts` | **Root NgModule** — declares all components, imports, providers |
| `angular.json` | CLI configuration — build targets, file paths, budgets, test config |
| `package.json` | NPM scripts (`start`, `build`, `test`) + all dependencies and versions |
| `tsconfig.json` | TypeScript compiler settings — strict mode, target ES version, etc. |
| `assets/` | Images, favicon, fonts — served as static files |

---

## 5. package.json Deep Dive

```json
{
  "name": "my-angular-app",
  "version": "0.0.0",
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test":  "ng test"
  },
  "dependencies": {
    "@angular/animations": "^16.0.0",
    "@angular/common":     "^16.0.0",
    "@angular/compiler":   "^16.0.0",
    "@angular/core":       "^16.0.0",
    "@angular/forms":      "^16.0.0",
    "@angular/platform-browser":         "^16.0.0",
    "@angular/platform-browser-dynamic": "^16.0.0",
    "@angular/router":     "^16.0.0",
    "rxjs":                "~7.8.0",
    "zone.js":             "~0.13.0"
  },
  "devDependencies": {
    "@angular/cli":         "^16.0.0",
    "@angular/compiler-cli":"^16.0.0",
    "typescript":           "~5.0.0",
    "jasmine-core":         "~5.0.0",
    "karma":                "~6.4.0"
  }
}
```

### `dependencies` vs `devDependencies`

| | `dependencies` | `devDependencies` |
|---|---|---|
| Purpose | Needed to **run** the app in production | Needed only **during development** |
| Included in production build? | ✅ Yes | ❌ No |
| Examples | `@angular/core`, `rxjs`, `zone.js` | `@angular/cli`, `typescript`, `jasmine`, `karma` |

**Install flag for devDependencies:**
```bash
npm install some-package --save-dev   # Adds to devDependencies
npm install some-package              # Adds to dependencies (default)
```

> Keeping dev tools in `devDependencies` keeps your **production bundle smaller**.

### Key Scripts

| Script | Command | Description |
|---|---|---|
| `npm start` / `npm run start` | `ng serve` | Starts dev server at `http://localhost:4200` |
| `npm run build` | `ng build` | Creates optimised production build in `dist/` |
| `npm test` | `ng test` | Runs unit tests |
| `npm run watch` | `ng build --watch` | Dev build in watch mode |

### `ng build` — What Actually Happens
1. TypeScript compiler (`tsc`) compiles all `.ts` → `.js`
2. **Tree shaking** — unused code is removed (dead code elimination)
3. **Minification** — variable names shortened, whitespace removed
4. **Bundling** — all files merged into a small set of bundle files
5. Output goes into **`dist/`** folder — ready to deploy to a web server
6. Result: MBs of source code → **KBs of optimised bundles** → faster browser rendering

### Notable Dependencies Explained

| Package | Purpose |
|---|---|
| `@angular/platform-browser` | Required to run the app in a browser (provides BrowserModule) |
| `@angular/platform-browser-dynamic` | JIT (Just-in-Time) compiler — used in development |
| `@angular/router` | Client-side routing |
| `rxjs` | Reactive programming library (HTTP calls, event streams) |
| `zone.js` | Change detection mechanism (being phased out in favour of Signals) |
| `primeicons` / `primeng` | Third-party UI component library (optional, project-specific) |

---

## 6. Angular Building Blocks

Every Angular application is built from these core units:

```
Angular Application
├── Modules      — Organise the app into cohesive feature groups
├── Components   — UI building blocks (view + logic)
├── Templates    — HTML that defines the component's view
├── Styles       — CSS/SCSS scoped to the component
├── Services     — Shared business logic & API interactions
├── Directives   — Extend HTML behaviour
├── Pipes        — Transform displayed data
└── Routing      — Navigate between components/views
```

---

### 6.1 Components — The Core Building Block

A component is Angular's primary UI unit. **Every Angular component is a TypeScript class** decorated with `@Component`.

#### Generate a Component
```bash
ng generate component simple
# Short form:
ng g c simple
```

#### Files Created (4 files per component)

```
src/app/simple/
├── simple.component.ts       ← TypeScript class — business logic
├── simple.component.html     ← HTML template — the view
├── simple.component.css      ← CSS/SCSS styles — scoped to this component
└── simple.component.spec.ts  ← Unit test file (Jasmine boilerplate)
```

**Why 4 files?**
| File | Role |
|---|---|
| `.ts` | Business logic: fetch data, handle events, define state |
| `.html` | Template: define what the user sees |
| `.css` / `.scss` | Styles: beautify the view (scoped — won't leak to other components) |
| `.spec.ts` | Unit tests: validate logic in isolation |

#### Component TypeScript Anatomy

```typescript
import { Component, OnInit } from '@angular/core';
import { UserService }        from '../services/user.service';

@Component({
  selector:    'app-simple',          // HTML tag used to embed this component
  templateUrl: './simple.component.html',
  styleUrls:   ['./simple.component.css']
})
export class SimpleComponent implements OnInit {

  users: any[] = [];

  // Dependency Injection — inject the service
  constructor(private userService: UserService) {}

  // Lifecycle hook — runs once when component initialises
  ngOnInit(): void {
    this.users = this.userService.getUsers();
    console.log(this.users);
  }
}
```

> **Note:** In Angular 17+ (standalone / signal-based projects), `inject()` replaces constructor injection and `input()`/`output()` replace `@Input()`/`@Output()`. The above shows Angular 16 style (NgModule-based).

---

### 6.2 Services — The Data & Logic Layer

Services handle **API interactions and shared business logic**. They are plain TypeScript classes — **no HTML**, no template.

#### Why Services?
- Components should only deal with the **view and view-specific logic**
- Putting API calls inside components violates the **Single Responsibility Principle** and **separation of concerns**
- Services act as the **data/API layer** — they fetch data and hand it to components

#### Generate a Service
```bash
ng generate service user
# Short form:
ng g s user

# Create in its own folder (recommended for organisation)
ng g s test --flat=false
```

`--flat=false` creates a dedicated folder; by default (`--flat=true`) the service files are placed in the current directory.

#### Files Created (2 files — no HTML)
```
src/app/user/
├── user.service.ts       ← Service class with business logic
└── user.service.spec.ts  ← Unit tests
```

#### Service TypeScript Anatomy
```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'   // Registered at the root injector — available app-wide
})
export class UserService {

  getUsers() {
    // In real projects: returns an Observable from HttpClient
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
  }
}
```

> **`providedIn: 'root'`** makes the service a **singleton** — one instance shared across the whole app. It also makes it **tree-shakeable** — if no component uses it, it won't be included in the production bundle. Services with `providedIn: 'root'` do **NOT** need to be listed in `NgModule.providers`.

---

### 6.3 Directives — Extending HTML Behaviour

Directives let you attach behaviour to DOM elements or conditionally render parts of the template.

#### Structural Directives (Angular 16 style)
These change the **DOM structure** (add/remove elements):

```html
<!-- Conditionally render -->
<div *ngIf="isLoggedIn">Welcome back!</div>

<!-- Iterate over a list -->
<li *ngFor="let user of users">{{ user.name }}</li>
```

> ⚠️ **Angular 17+ (modern style):** Use built-in control flow blocks instead:
> ```html
> @if (isLoggedIn) { <div>Welcome back!</div> }
> @for (user of users; track user.id) { <li>{{ user.name }}</li> }
> ```

#### Attribute Directives
These change the **appearance or behaviour** of an existing element (e.g., `ngClass`, `ngStyle`).

---

### 6.4 Pipes — Transforming Display Data

Pipes format/transform data in the template without changing the underlying data model.

```html
<!-- Built-in pipes -->
{{ user.name   | uppercase }}    <!-- ALICE -->
{{ user.name   | lowercase }}    <!-- alice -->
{{ user.name   | titlecase }}    <!-- Alice Smith -->
{{ price       | currency:'USD' }}  <!-- $29.99 -->
{{ today       | date:'dd/MM/yyyy' }}  <!-- 23/05/2026 -->
```

Angular also supports **custom pipes** for project-specific formatting.

---

### 6.5 Routing

Angular Router enables navigation between components without a page reload — the core of SPA behaviour.

```typescript
// app-routing.module.ts (Angular 16)
const routes: Routes = [
  { path: '',       component: HomeComponent },
  { path: 'users',  component: UsersComponent },
  { path: 'about',  component: AboutComponent }
];
```

We will cover routing in depth in a dedicated session.

---

## 7. NgModule — The Root Module

Every Angular application (Angular 16 / NgModule-based) has **exactly one root module**: `AppModule`. Feature modules can be added as the app grows.

```typescript
// app.module.ts
import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { AppComponent }        from './app.component';
import { SimpleComponent }     from './simple/simple.component';
import { UserService }         from './services/user.service';

@NgModule({
  declarations: [
    AppComponent,      // Root component (auto-added)
    SimpleComponent,   // Any component generated via CLI is auto-registered here
    // Also: Directives, Pipes
  ],
  imports: [
    BrowserModule,     // REQUIRED — provides core Angular directives + browser platform
    // Other Angular modules (FormsModule, HttpClientModule, RouterModule, etc.)
    // Feature modules
  ],
  providers: [
    // Services NOT using providedIn:'root' are listed here
    // UserService — NOT needed here because it uses providedIn:'root'
  ],
  bootstrap: [AppComponent]  // The ROOT component Angular loads into index.html
})
export class AppModule {}
```

### NgModule Decorator Properties

| Property | Role |
|---|---|
| `declarations` | Components, Directives, and Pipes that **belong to this module** |
| `imports` | Other NgModules whose exports this module needs |
| `providers` | Services to register with this module's injector |
| `exports` | Components/Directives/Pipes this module **exposes to other modules** |
| `bootstrap` | The **root component** Angular renders at startup |

### Important: BrowserModule
`BrowserModule` is **required in AppModule** to run the Angular app in a browser. It provides:
- Core directives (`NgIf`, `NgFor`, etc. — Angular 16)
- The browser rendering platform

> ⚠️ `BrowserModule` should only be imported in `AppModule`, **not** in feature modules. Feature modules use `CommonModule` instead (Angular 16).  
> In Angular 17+ standalone style, neither is needed — built-in control flow (`@if`, `@for`) is used directly.

### When CLI Generates a Component
When you run `ng g c simple`, Angular CLI **automatically**:
1. Creates the 4 component files
2. Imports the component into `app.module.ts`
3. Adds it to the `declarations` array

You do not write this registration manually.

---

## 8. Angular Bootstrapping Process

Understanding how an Angular app starts up from a blank browser tab.

### Angular 16 (NgModule-based) — Step by Step

```
Browser → index.html → <script> tags (compiled bundles)
       → main.ts
       → platformBrowserDynamic().bootstrapModule(AppModule)
       → AppModule (@NgModule decorator)
       → bootstrap: [AppComponent]
       → AppComponent (@Component decorator) → selector: 'app-root'
       → index.html contains <app-root></app-root>
       → Angular renders AppComponent's template into <app-root>
       → Application is live in the browser
```

### File-by-file Breakdown

#### `index.html` — The One HTML File
```html
<!doctype html>
<html>
<head>...</head>
<body>
  <app-root></app-root>   ← Custom tag — matches AppComponent's selector
</body>
</html>
```

#### `main.ts` — Application Entry Point
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule }              from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)   // Bootstraps the root module
  .catch(err => console.error(err));
```

#### `app.module.ts` — Root NgModule
```typescript
@NgModule({
  bootstrap: [AppComponent]    // Tells Angular which component is the root
})
export class AppModule {}
```

#### `app.component.ts` — Root Component
```typescript
@Component({
  selector: 'app-root',          // Matches <app-root> in index.html
  templateUrl: './app.component.html'
})
export class AppComponent {}
```

### Why This Works
The `selector: 'app-root'` in `AppComponent` **matches** the `<app-root>` tag in `index.html`. When Angular bootstraps, it finds that tag and replaces it with the rendered template. Everything flows from there.

### Angular 17+ Standalone Bootstrapping (Different)
```typescript
// main.ts — Angular 17+ standalone
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }         from './app/app.component';
import { appConfig }            from './app/app.config';

bootstrapApplication(AppComponent, appConfig);
// No AppModule — AppComponent IS the root; appConfig provides router, HTTP, etc.
```
In standalone mode, **every component acts as its own module** — no centralised NgModule is needed. This is the current Angular 17+ best practice.

---

## 9. Angular vs React — Rendering & Architecture

### Virtual DOM (React) vs Ivy Renderer (Angular)

| | React | Angular |
|---|---|---|
| Rendering approach | Virtual DOM | Ivy Renderer (direct DOM updates) |
| DOM update strategy | Diffs a virtual copy, patches minimal changes | Updates real DOM directly via generated view functions |
| Memory usage | Higher — maintains previous virtual state | Lower — no full virtual copy |
| Bundle size | Smaller (React core is lightweight) | Larger initially; Ivy + tree shaking reduces it significantly |
| Small/medium apps | Fast | Slightly slower to load (more initial setup) |
| Large enterprise apps | Performance gap closes — virtual diffing on large trees gets expensive | Consistent performance; scales well |
| Learning curve | Lower | Steeper |
| Template style | JSX (JS + HTML mixed) | Template-based (HTML + Angular syntax) |
| Language | JavaScript (TypeScript optional) | TypeScript (mandatory) |
| Type | Library | Full framework |

### React Virtual DOM — How It Works
1. On state change, React builds a new **virtual DOM tree** (a JS object copy of the DOM)
2. React **diffs** the old vs new virtual tree (**reconciliation**)
3. Only the minimal set of real DOM updates is applied

**Limitation:** As the app grows, the virtual DOM tree becomes very large. Diffing a large tree becomes expensive — the performance advantage shrinks.

### Angular Ivy Renderer — How It Works
- Angular generates **view functions** at build time (compiled output)
- On change, Angular's change detection runs these view functions to update **only the relevant DOM nodes directly** — no virtual copy is maintained
- Uses **tree shaking** aggressively — unused components/code are eliminated from the bundle

Angular uses its own **Ivy renderer** (not Incremental DOM). Angular Ivy does not maintain a virtual copy of the DOM; it updates the real DOM directly via compiled view functions.

### Angular Ivy — When Was It Introduced?

- **Angular 9** — Ivy became the **default renderer**, replacing View Engine
- **Angular 13** — View Engine support was **completely removed**; Ivy became the only renderer
- Bundle size improvements from tree shaking started with **Angular 9+**

---

## 10. RxJS — Reactive Programming in Angular

### Evolution of Async Programming in JavaScript

```
Callbacks (ES5)  →  Promises (ES6)  →  RxJS Observables (Angular standard)
```

#### 1. Callbacks — The Original Approach
```javascript
getUserData(userId, function(data) {
  getOrders(data.id, function(orders) {
    getOrderDetails(orders[0].id, function(details) {
      // "Callback hell" — deeply nested, hard to read/maintain
    });
  });
});
```

#### 2. Promises — Improved (ES6)
```javascript
getUserData(userId)
  .then(data => getOrders(data.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => console.log(details))
  .catch(err => console.error(err));
```

**Promise limitations:**
- **Not cancellable** — once a Promise starts, it cannot be cancelled
- Emits only **one value** (resolves once, then done)
- Limited operators for complex async flows

#### 3. RxJS Observables — Angular's Approach
```typescript
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, filter, switchMap }              from 'rxjs/operators';

// Example: HTTP call returns an Observable
this.http.get<User[]>('/api/users')
  .pipe(
    filter(users => users.length > 0),
    map(users => users.map(u => u.name))
  )
  .subscribe({
    next:     (names) => console.log(names),
    error:    (err)   => console.error(err),
    complete: ()      => console.log('Done')
  });
```

### RxJS Key Concepts

| Concept | Description |
|---|---|
| `Observable` | A stream of values over time — subscribe to receive them |
| `Observer` | The subscriber that receives `next`, `error`, `complete` notifications |
| `Subject` | Both an Observable AND an Observer — can multicast to many subscribers |
| `BehaviorSubject` | A Subject that holds the **current value** and emits it to new subscribers immediately |
| `subscribe()` | Start listening to the stream |
| `unsubscribe()` | **Cancel** the subscription — prevents memory leaks |
| Operators (`map`, `filter`, `switchMap`...) | Transform, filter, combine streams |

### Important: RxJS is NOT Angular

> RxJS is a **standalone library** — it works independently of Angular. Angular **uses** RxJS for its HTTP client, router events, reactive forms, and more. You can use RxJS in any JavaScript project.

### Where RxJS Is Used in Angular
- `HttpClient.get()` / `.post()` etc. — returns Observables
- Router events (`router.events`)
- `@ngrx/store` state management
- `BehaviorSubject` / `Subject` for cross-component communication

---

## 11. Change Detection & Signals

### The Component Tree

As an app grows, components form a **tree**:
```
AppComponent (root)
├── HeaderComponent
├── SidebarComponent
└── MainContentComponent
    ├── ProductListComponent
    │   └── ProductCardComponent
    └── CartComponent
```

### What Is Change Detection?

Angular needs to know **when something changed** (user clicked a button, API data arrived) so it can update the DOM. This process is called **change detection**.

**How it works (Angular 16, Zone.js-based):**
1. An event happens (click, HTTP response, timer)
2. **Zone.js** intercepts the event and notifies Angular
3. Angular runs change detection **from the root component down the entire component tree**
4. Every component in the tree is checked — even if only one leaf component changed
5. Angular updates the DOM for any components with changed values

**Problem:** If the app has 100 components and a leaf component changes, Angular still checks all 100 — wasteful.

### Zone.js

Zone.js is the library Angular 16 uses to intercept and track async operations (DOM events, `setTimeout`, `Promise`, `XMLHttpRequest`). When these occur, Zone.js triggers Angular's change detection. Angular 16 introduced **experimental zoneless** support; Angular 18 made **zoneless mode a developer preview**. Zone.js is still the default in most Angular apps but is being phased out as Signals mature — opting out is intentional, not automatic.

### OnPush Change Detection Strategy

A performance optimisation available before Signals:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```
With `OnPush`, Angular only checks the component when:
- Its `@Input()` reference changes
- An event originates from the component itself
- An Observable it subscribes to via `async` pipe emits

### Signals — Angular's Modern Solution

- **Angular 16** — Signals introduced as **developer preview**
- **Angular 17** — Signals became **stable** (production-ready)
- **Angular 18–21** — Signals became the strongly encouraged approach for all reactive state

**The problem Signals solve:**
- With Signals, Angular knows **exactly which component** is affected by a state change
- No more full tree traversal — only the specific component(s) that read the signal are re-evaluated

```typescript
import { signal, computed, effect } from '@angular/core';

// Declare reactive state
count     = signal(0);
doubled   = computed(() => this.count() * 2);

// React to changes
constructor() {
  effect(() => console.log('Count changed:', this.count()));
}

increment() {
  this.count.update(v => v + 1);
}
```

**Template:**
```html
<p>Count: {{ count() }}</p>       <!-- Call the signal like a function -->
<p>Doubled: {{ doubled() }}</p>
<button (click)="increment()">+1</button>
```

### Signals vs RxJS — They Coexist

Signals and RxJS serve different purposes and coexist — neither replaces the other:

| | Signals | RxJS |
|---|---|---|
| Purpose | Component-level **reactive state** | Complex async streams, HTTP, event pipelines |
| Use case | Replace `signal()` for component variables | HTTP calls, router events, cross-service streams |
| Replaces | `BehaviorSubject` for local state | Not replaced — remains the standard for HTTP |
| Bridge | `toSignal()` / `toObservable()` connects them | Same |

Angular strongly encourages Signals for component state management. RxJS remains the standard for HTTP calls, complex async operations, and stream-based patterns.

```typescript
// Bridging RxJS with Signals
import { toSignal } from '@angular/core/rxjs-interop';

users = toSignal(this.http.get<User[]>('/api/users'), { initialValue: [] });
// Now 'users' is a signal — use in template as {{ users() }}
```

---

## 12. Component Communication

### Parent → Child: `@Input()` (Angular 16)
```typescript
// child.component.ts
@Input() title: string = '';
```
```html
<!-- parent.component.html -->
<app-child [title]="parentTitle"></app-child>
```

### Child → Parent: `@Output()` + `EventEmitter` (Angular 16)
```typescript
// child.component.ts
@Output() clicked = new EventEmitter<string>();
onButtonClick() { this.clicked.emit('Hello from child'); }
```
```html
<!-- parent.component.html -->
<app-child (clicked)="handleClick($event)"></app-child>
```

### Modern Signal-Based (Angular 17+)
```typescript
// child.component.ts
title   = input<string>('');      // replaces @Input()
clicked = output<string>();       // replaces @Output() + EventEmitter
```

### Parent Accessing Child Directly: `@ViewChild`
```typescript
// parent.component.ts
@ViewChild(ChildComponent) child!: ChildComponent;

ngAfterViewInit() {
  this.child.someMethod();  // Directly call child's method
}
```

### Unrelated Components: RxJS `BehaviorSubject` / `Subject`
```typescript
// shared.service.ts
private messageSource = new BehaviorSubject<string>('default');
currentMessage$ = this.messageSource.asObservable();

sendMessage(msg: string) { this.messageSource.next(msg); }

// component-a.ts
this.sharedService.sendMessage('Hello!');

// component-b.ts
this.sharedService.currentMessage$.subscribe(msg => this.message = msg);
```

---

## 13. CLI Commands Reference

### Generate Commands

| Command | What It Creates |
|---|---|
| `ng g c component-name` | Component (4 files: .ts, .html, .css, .spec.ts) in a folder |
| `ng g s service-name` | Service (2 files: .service.ts, .service.spec.ts) — flat |
| `ng g s service-name --flat=false` | Service in its own subfolder |
| `ng g d directive-name` | Directive |
| `ng g p pipe-name` | Pipe |
| `ng g m module-name` | Module |
| `ng g guard guard-name` | Route guard |

### Run Commands

| Command | Description |
|---|---|
| `ng serve` / `npm start` | Start dev server at `http://localhost:4200` with live reload |
| `ng build` | Production build → `dist/` folder (minified, tree-shaken) |
| `ng build --watch` | Dev build in watch mode |
| `ng test` | Run unit tests |
| `ng version` / `ng v` | Show Angular, Node.js, TypeScript versions |

### Project Setup Commands

```bash
# Install Angular CLI globally
npm install -g @angular/cli@latest

# Install specific version globally
npm install -g @angular/cli@16

# Install locally (for project-specific version)
npm install @angular/cli@16

# Create new project
ng new my-app

# Install missing packages in an existing project
npm install
```

---

## Key Takeaways from Session 2

1. **SPA = one HTML file** — Angular loads index.html once; all subsequent navigation swaps components, never reloads the page
2. **Every Angular component is a TypeScript class** — 4 files: `.ts`, `.html`, `.css`, `.spec.ts`
3. **Services are the API/data layer** — 2 files: `.service.ts`, `.spec.ts` — no HTML
4. **NgModule is the organiser** — declarations (components), imports (modules), providers (services), bootstrap (root component)
5. **Bootstrapping chain:** `main.ts` → `AppModule` → `AppComponent` → `<app-root>` in `index.html`
6. **`ng build` = production bundle** — TypeScript compilation + tree shaking + minification → `dist/`
7. **RxJS** is Angular's standard for async/HTTP — callbacks → Promises → Observables
8. **Signals** are Angular's modern reactive state primitive (stable from v17) — work alongside RxJS
9. **Angular CLI is powerful** — one command creates a complete, boilerplated component/service with correct registrations
10. **Angular 16 uses NgModule; Angular 17+ encourages standalone components** — both architectures are valid to understand

---

*Notes compiled from Angular KT Session 2 transcript — Trainer: Chandishwar*
