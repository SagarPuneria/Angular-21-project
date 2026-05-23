# Angular KT Session 3 — Training Notes
**Trainer:** Chandishwar (Chandi) | **Series:** Angular Workshops – FullStack TFG (April 13–17, 2026)  
**Topic:** Angular 21 vs Angular 16, Data Binding (All Types), Lifecycle Hooks, Parent-Child Communication, Dependency Injection

---

## Table of Contents
1. [Angular 21 vs Angular 16 — Key Differences](#1-angular-21-vs-angular-16--key-differences)
2. [Standalone Components — Architecture Shift](#2-standalone-components--architecture-shift)
3. [Angular 21 Bootstrapping (Standalone Style)](#3-angular-21-bootstrapping-standalone-style)
4. [Interpolation — `{{ }}`](#4-interpolation---)
5. [Property Binding — `[property]`](#5-property-binding--property)
6. [Class Binding — `[class.name]`](#6-class-binding--classname)
7. [Style Binding — `[style.property]`](#7-style-binding--styleproperty)
8. [Event Binding — `(event)`](#8-event-binding--event)
9. [Two-Way Data Binding — `[(ngModel)]`](#9-two-way-data-binding--ngmodel)
10. [Structural Directives — `*ngIf` / `*ngFor`](#10-structural-directives--ngif--ngfor)
11. [Angular Lifecycle Hooks](#11-angular-lifecycle-hooks)
12. [Parent → Child: `@Input()`](#12-parent--child-input)
13. [Child → Parent: `@Output()` + `EventEmitter`](#13-child--parent-output--eventemitter)
14. [Dependency Injection — `inject()` vs Constructor](#14-dependency-injection--inject-vs-constructor)
15. [Services & Component Interaction Demo](#15-services--component-interaction-demo)

---

## 1. Angular 21 vs Angular 16 — Key Differences

Chandi recapped the evolution from Angular 16 (covered in Session 2) to Angular 21. The table below summarises what changed:

| Feature | Angular ≤ 13 | Angular 14–16 | Angular 17–21 |
|---|---|---|---|
| Module system | `NgModule` mandatory | `NgModule` + Standalone opt-in | Standalone **default** (`NgModule` optional) |
| Bootstrapping | `platformBrowserDynamic().bootstrapModule(AppModule)` | Both styles | `bootstrapApplication(AppComponent, appConfig)` |
| Build system | **Webpack** | Webpack | **esbuild** (much faster) |
| Change detection | Zone.js | Zone.js | **Zoneless** (opt-in, signals-driven) |
| Control flow | `*ngIf`, `*ngFor` (directives) | Same | `@if`, `@for`, `@switch` (built-in blocks) |
| Test runner | Karma + Jasmine | Karma + Jasmine | **Vitest** (Karma deprecated) |
| Reactive state | RxJS / BehaviorSubject | Same + experimental Signals | **Signals** (stable, strongly recommended) |
| Forms | Template-driven / Reactive | Same | **Signal Forms** (new, ties into Signals) |

### Why Standalone Components Are Faster

In an `NgModule`-based app:
- All components registered in a module are **loaded together** when the module is loaded
- As the app grows, the module becomes heavier → **longer initial page load**

With standalone components:
- Each component **only loads what it needs** (declared in its own `imports: []`)
- Unused components are **not loaded** until they are navigated to
- Result: **smaller initial bundle, faster first paint**

---

## 2. Standalone Components — Architecture Shift

### Angular 14+ — When Standalone Was Introduced
- **Angular 14** — Standalone components available as **developer preview** (`standalone: true`)
- **Angular 15** — Standalone APIs **stabilised**
- **Angular 17** — Standalone became the **recommended default** (`standalone: true` no longer required — it is the implicit default)
- **Angular 19+** — `standalone: true` in the `@Component` decorator is **fully optional**; all components are standalone unless explicitly part of an NgModule

### How to Identify a Standalone Component
Two signals in the TypeScript file tell you a component is standalone:

1. **`standalone: true`** in the `@Component` decorator (Angular 14–18 style)
2. **`imports: [...]`** array in the `@Component` decorator — standalone components declare their own dependencies here, not in an NgModule

```typescript
// Angular 17–21 style — no `standalone: true` needed (it's the default)
@Component({
  selector:    'app-data-binding',
  templateUrl: './data-binding.component.html',
  styleUrl:    './data-binding.component.scss',
  imports:     [CommonModule, FormsModule]   // <-- signals standalone
})
export class DataBindingComponent implements OnInit {
  // ...
}
```

### Angular 16 vs Angular 21 — `app.module.ts`

```
Angular 16:  app.module.ts EXISTS — every component must be declared here
Angular 21:  app.module.ts DOES NOT EXIST — each component manages itself
```

---

## 3. Angular 21 Bootstrapping (Standalone Style)

### Angular 16 (NgModule-based) — `main.ts`
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule }              from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

### Angular 17–21 (Standalone) — `main.ts`
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }         from './app/app.component';
import { appConfig }            from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

### `app.config.ts` — Providers for Standalone
```typescript
import { ApplicationConfig }    from '@angular/core';
import { provideRouter }        from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes }               from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
};
```

> In standalone mode, everything that was in `NgModule.imports` + `NgModule.providers` moves to `appConfig.providers` and each component's own `imports: []`.

---

## 4. Interpolation — `{{ }}`

**Interpolation** is the simplest form of data binding. It reads a value from the TypeScript class and renders it in the HTML template. It is **one-way** (TypeScript → HTML).

### Syntax
```html
{{ expression }}
```

### What Can Go Inside `{{ }}`?
- **Variables** (class properties)
- **Method calls** (returns the value)
- **Expressions** (arithmetic, string operations, ternary)
- **Built-in pipes** (format the output)

### TypeScript Class
```typescript
@Component({ selector: 'app-data-binding', ... })
export class DataBindingComponent {
  username    = 'John Doe';
  currentDate = new Date();
  number      = 7;

  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  isEven(n: number): boolean {
    return n % 2 === 0;
  }

  getMultiplied(a: number, b: number): number {
    return a * b;
  }
}
```

### HTML Template
```html
<!-- Variable -->
<p>Username: {{ username }}</p>

<!-- Variable with pipe -->
<p>Username (upper): {{ username | uppercase }}</p>

<!-- Method call -->
<p>Current date/time: {{ getCurrentDateTime() }}</p>

<!-- Date pipe on a property -->
<p>Today: {{ currentDate | date:'fullDate' }}</p>

<!-- Arithmetic expression -->
<p>5 × 3 = {{ getMultiplied(5, 3) }}</p>

<!-- Ternary expression -->
<p>{{ number }} is {{ isEven(number) ? 'even' : 'odd' }}</p>
```

### Key Rules
- `{{ }}` only works in the **HTML template**, not inside element attributes
- For attributes, use **Property Binding** `[attribute]` instead
- Interpolation is effectively shorthand for `[textContent]` property binding

---

## 5. Property Binding — `[property]`

**Property binding** binds a TypeScript expression to a **DOM element property** (not an HTML attribute). It is **one-way** (TypeScript → DOM).

### Syntax
```html
[domProperty]="typescriptExpression"
```

### Square Bracket = Dynamic / Property Binding
| Static (no binding) | Dynamic (property binding) |
|---|---|
| `<img src="logo.png">` | `<img [src]="imageUrl">` |
| `<button disabled>` | `<button [disabled]="isDisabled">` |
| `<input title="Name">` | `<input [title]="fieldLabel">` |

### Examples

```typescript
imageUrl   = 'https://angular.io/assets/images/logos/angular/angular.png';
isDisabled = false;
fieldLabel = 'Enter your name';
buttonText = 'Submit';

toggleButton() {
  this.isDisabled = !this.isDisabled;
}
```

```html
<!-- Dynamic image — changes based on data/API response -->
<img [src]="imageUrl" alt="Logo">

<!-- Dynamic disabled state — e.g., disable submit while form is invalid -->
<button [disabled]="isDisabled" (click)="toggleButton()">
  Toggle Disabled
</button>

<!-- Dynamic title tooltip -->
<input [title]="fieldLabel" type="text">
```

### Real-world Use Case
In production apps, `imageUrl` would come from an API response — the same component automatically renders the correct image for each product, user, etc. without changing the template.

---

## 6. Class Binding — `[class.name]`

**Class binding** conditionally applies or removes a CSS class based on a TypeScript expression.

### Syntax
```html
[class.className]="booleanExpression"
```

### Example

```typescript
clickCount = 0;

get isHighlighted(): boolean {
  return this.clickCount > 5;
}

increment() { this.clickCount++; }
```

```html
<!-- Class 'highlight' is applied when clickCount > 5 -->
<p [class.highlight]="isHighlighted">
  Click count: {{ clickCount }}
</p>

<button (click)="increment()">Click me</button>
```

```scss
/* data-binding.component.scss */
.highlight {
  background-color: yellow;
  color: darkblue;
  font-weight: bold;
}
```

### Multiple Classes — `[ngClass]`
```html
<div [ngClass]="{
  'highlight': clickCount > 5,
  'danger':    clickCount > 10,
  'success':   isComplete
}">
  Status box
</div>
```

---

## 7. Style Binding — `[style.property]`

**Style binding** applies inline CSS styles dynamically.

### Syntax
```html
[style.cssProperty]="expression"
[style.cssProperty.unit]="numericExpression"
```

### Example

```typescript
dynamicStyles = { color: 'blue', fontSize: '16px' };

toggleColor() {
  this.dynamicStyles.color =
    this.dynamicStyles.color === 'blue' ? 'red' : 'blue';
}
```

```html
<!-- Single property -->
<p [style.color]="dynamicStyles.color">Styled text</p>
<p [style.font-size.px]="16">Fixed pixel size</p>

<!-- Object binding via ngStyle -->
<div [ngStyle]="dynamicStyles">Dynamic styled div</div>

<!-- Ternary -->
<p [style.color]="clickCount > 5 ? 'red' : 'blue'">
  Conditional color
</p>

<button (click)="toggleColor()">Toggle Color</button>
```

---

## 8. Event Binding — `(event)`

**Event binding** listens to DOM events and calls a TypeScript method when they fire. It is **one-way** (DOM → TypeScript).

### Syntax
```html
(eventName)="handlerMethod($event)"
```

The `$event` object carries the native browser event data.

### Common Events

| Event | Usage |
|---|---|
| `(click)` | Button/element clicks |
| `(mouseover)` / `(mouseout)` | Mouse hover enter/leave |
| `(keyup)` / `(keydown)` | Keyboard input |
| `(input)` | Input field value changes |
| `(submit)` | Form submission |
| `(change)` | Select dropdown changes |

### Example

```typescript
clickCount  = 0;
mouseX      = 0;
mouseY      = 0;
inputValue  = '';

onButtonClick(): void {
  this.clickCount++;
}

onMouseMove(event: MouseEvent): void {
  this.mouseX = event.clientX;
  this.mouseY = event.clientY;
}

onInputChange(event: Event): void {
  this.inputValue = (event.target as HTMLInputElement).value;
}
```

```html
<!-- Click event -->
<button (click)="onButtonClick()">
  Clicked {{ clickCount }} times
</button>

<!-- Mouse move event — reads $event coordinates -->
<div (mousemove)="onMouseMove($event)" style="height:100px; border:1px solid">
  Mouse position: X={{ mouseX }}, Y={{ mouseY }}
</div>

<!-- Input event — reads typed value -->
<input type="text" (input)="onInputChange($event)">
<p>You typed: {{ inputValue }}</p>
```

### Data Flow Summary So Far

```
TypeScript → HTML  : Interpolation {{ }}   and Property Binding [prop]
HTML → TypeScript  : Event Binding (event)
Both directions    : Two-Way Binding [(ngModel)]
```

---

## 9. Two-Way Data Binding — `[(ngModel)]`

**Two-way data binding** synchronises a TypeScript variable and an HTML input **in both directions simultaneously**:
- When the TypeScript variable changes → the input reflects it
- When the user types in the input → the TypeScript variable updates immediately

### The "Banana in a Box" Syntax
```html
[(ngModel)]="variableName"
```
- `[...]` = **property binding** (TypeScript → HTML)
- `(...)` = **event binding** (HTML → TypeScript)
- Combined `[(...)]` = two-way binding

### ⚠️ Critical: `FormsModule` Must Be Imported

> `ngModel` is provided by **`FormsModule`**. Without importing it, the app will throw a runtime error: `Can't bind to 'ngModel' since it isn't a known property of 'input'`.

**Standalone component (Angular 17+):**
```typescript
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-binding',
  imports:  [FormsModule],   // ← Required
  templateUrl: './data-binding.component.html'
})
export class DataBindingComponent {
  inputValue  = 'ABC';
  selectedOption = 'option1';
  isChecked    = false;
}
```

**NgModule-based app (Angular 16):**
```typescript
// app.module.ts
import { FormsModule } from '@angular/forms';
@NgModule({
  imports: [BrowserModule, FormsModule]   // ← Required
})
```

### Examples

```html
<!-- Text input — both directions -->
<input type="text" [(ngModel)]="inputValue">
<p>Live value: {{ inputValue }}</p>

<!-- Select dropdown -->
<select [(ngModel)]="selectedOption">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
<p>Selected: {{ selectedOption }}</p>

<!-- Checkbox -->
<input type="checkbox" [(ngModel)]="isChecked">
<p>Checked: {{ isChecked }}</p>
```

### One-Way vs Two-Way — Analogy
| Type | Analogy |
|---|---|
| One-way (interpolation/property) | Cafeteria menu board — you see what's offered, no choice |
| Two-way (`ngModel`) | Restaurant table service — you order what you want AND the waiter responds |

### Modern Alternative — `model()` Signal (Angular 17+)
```typescript
// In child component — replaces @Input() + @Output() pair for two-way
inputValue = model<string>('');
```
```html
<!-- In parent template -->
<app-child [(inputValue)]="parentVar"></app-child>
```

---

## 10. Structural Directives — `*ngIf` / `*ngFor`

Structural directives change the **DOM structure** by adding or removing elements.

### `*ngIf` — Conditional Rendering

#### Angular 16 (directive syntax)
```html
<div *ngIf="isLoggedIn">Welcome, {{ username }}!</div>
<div *ngIf="!isLoggedIn">Please log in.</div>

<!-- With else block -->
<div *ngIf="isLoggedIn; else loginBlock">Welcome!</div>
<ng-template #loginBlock>
  <p>Please log in.</p>
</ng-template>
```

#### Angular 17+ (built-in control flow)
```html
@if (isLoggedIn) {
  <div>Welcome, {{ username }}!</div>
} @else {
  <div>Please log in.</div>
}
```

---

### `*ngFor` — List Rendering

#### Angular 16 (directive syntax)
```html
<ul>
  <li *ngFor="let employee of employees; trackBy: trackById">
    {{ employee.id }} — {{ employee.name }} — {{ employee.department }}
  </li>
</ul>
```

```typescript
employees = [
  { id: 1, name: 'Alice', department: 'Engineering' },
  { id: 2, name: 'Bob',   department: 'Design' },
  { id: 3, name: 'Carol', department: 'Product' }
];

trackById(index: number, employee: any): number {
  return employee.id;
}
```

#### Angular 17+ (built-in control flow)
```html
<ul>
  @for (employee of employees; track employee.id) {
    <li>{{ employee.id }} — {{ employee.name }}</li>
  } @empty {
    <li>No employees found.</li>
  }
</ul>
```

> **Note:** `track` is **mandatory** in `@for`. This is the equivalent of `trackBy` in `*ngFor`.

### `trackBy` / `track` — Why It Matters (Performance)
Without track/trackBy:
- Every change detection cycle: Angular **destroys and recreates all DOM nodes** in the list
- For large lists this causes heavy reflows and repaints

With `trackBy: trackById` or `track employee.id`:
- Angular identifies each element by its unique key
- Only the **changed, added, or removed** elements are updated in the DOM
- Significant performance improvement for lists of 50+ items

---

## 11. Angular Lifecycle Hooks

Every Angular component goes through a predictable lifecycle from creation to destruction. Angular provides **8 lifecycle hook interfaces** you can implement.

> **Important:** The `constructor` is NOT a lifecycle hook — it is a TypeScript/OOP class constructor. Lifecycle hooks are Angular-specific interfaces.

### Complete Lifecycle Order

```
new Component()          ← constructor (OOP, not a lifecycle hook)
     ↓
ngOnChanges()            ← fires BEFORE ngOnInit (if @Input properties exist)
     ↓
ngOnInit()               ← fires ONCE after first ngOnChanges (or directly if no @Input)
     ↓
ngDoCheck()              ← fires on every change detection run
     ↓
ngAfterContentInit()     ← fires ONCE after <ng-content> is projected
     ↓
ngAfterContentChecked()  ← fires after every projected content check
     ↓
ngAfterViewInit()        ← fires ONCE after component's view (+ child views) is initialised
     ↓
ngAfterViewChecked()     ← fires after every view check
     ↓
ngOnDestroy()            ← fires just BEFORE the component is removed from the DOM
```

### Implementation

```typescript
import {
  Component, OnInit, OnDestroy, OnChanges, SimpleChanges,
  AfterViewInit, AfterContentInit, DoCheck
} from '@angular/core';

@Component({ selector: 'app-lifecycle', template: '' })
export class LifecycleComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  constructor() {
    // OOP constructor — runs first
    // ⚠️ Do NOT inject-and-use services that depend on @Input values here
    //    — @Input values are not set yet at this point
    console.log('1. constructor');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Fires BEFORE ngOnInit on first load, then on every @Input change
    // 'changes' contains old and new values for each changed @Input
    console.log('2. ngOnChanges', changes);
  }

  ngOnInit(): void {
    // Fires ONCE after first ngOnChanges (or after constructor if no @Input)
    // ✅ Best place for: API calls, service calls, initial data setup
    console.log('3. ngOnInit');
  }

  ngAfterViewInit(): void {
    // Fires ONCE after the component's template and child views are rendered
    // ✅ Best place for: @ViewChild access, DOM manipulation
    console.log('4. ngAfterViewInit');
  }

  ngOnDestroy(): void {
    // Fires just before the component is removed
    // ✅ Best place for: unsubscribing Observables, clearing timers, cleanup
    console.log('5. ngOnDestroy');
  }
}
```

### The 3 Hooks You'll Use 95% of the Time

| Hook | When | Use For |
|---|---|---|
| `ngOnInit` | Once, after component initialises | API calls, service calls, set up subscriptions |
| `ngOnChanges` | Before init + on every `@Input` change | React to parent data updates |
| `ngOnDestroy` | Just before component is removed | Unsubscribe observables, clear intervals, prevent memory leaks |

### `ngAfterViewInit` — 4th Most Common
Used when you need to access a child component or DOM element via `@ViewChild`:
```typescript
@ViewChild(ChildComponent) child!: ChildComponent;

ngAfterViewInit(): void {
  // this.child is now safely available
  console.log(this.child.someProperty);
}
```

### Why `ngDoCheck`, `ngAfterContentChecked`, `ngAfterViewChecked` Are Rarely Used
These hooks fire on **every change detection cycle** (can be dozens of times per second). Putting heavy logic here causes serious performance problems. Avoid unless you have a specific, well-understood reason.

### `ngOnChanges` — Execution Order
- On **first load**: `ngOnChanges` fires **before** `ngOnInit`
- On **subsequent @Input changes**: `ngOnChanges` fires alone (ngOnInit does not re-run)
- `ngOnChanges` receives a `SimpleChanges` object with `previousValue`, `currentValue`, and `firstChange`

```typescript
ngOnChanges(changes: SimpleChanges): void {
  if (changes['title']) {
    const prev = changes['title'].previousValue;
    const curr = changes['title'].currentValue;
    console.log(`title changed from "${prev}" to "${curr}"`);
  }
}
```

---

## 12. Parent → Child: `@Input()`

**`@Input()`** allows a parent component to **pass data down to a child component**.

### Setup

```typescript
// child.component.ts (Angular 16 style)
import { Component, Input } from '@angular/core';

@Component({
  selector:    'app-child',
  templateUrl: './child.component.html'
})
export class ChildComponent {
  @Input() messageFromParent: string = '';
  @Input() userId: number = 0;
}
```

```html
<!-- child.component.html -->
<div class="child-box">
  <h3>Child Component</h3>
  <p>Message received from parent: {{ messageFromParent }}</p>
  <p>User ID: {{ userId }}</p>
</div>
```

```typescript
// app.component.ts (parent)
export class AppComponent {
  parentMessage = 'Hello from parent!';
  currentUserId = 42;
}
```

```html
<!-- app.component.html (parent template) -->
<!-- [property]="value" = property binding passing data to child -->
<app-child
  [messageFromParent]="parentMessage"
  [userId]="currentUserId">
</app-child>
```

### Modern Signal-Based `input()` — Angular 17+
```typescript
// child.component.ts (Angular 17+ style)
import { Component, input } from '@angular/core';

@Component({ selector: 'app-child', ... })
export class ChildComponent {
  messageFromParent = input<string>('');  // replaces @Input()
  userId            = input<number>(0);
}
```
```html
<!-- Template: call signal as function -->
<p>{{ messageFromParent() }}</p>
```

---

## 13. Child → Parent: `@Output()` + `EventEmitter`

**`@Output()`** with **`EventEmitter`** allows a child component to **send events/data up to the parent**.

### Setup

```typescript
// child.component.ts (Angular 16 style)
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector:    'app-child',
  templateUrl: './child.component.html'
})
export class ChildComponent {
  @Output() messageSentToParent = new EventEmitter<string>();

  sendMessage(): void {
    this.messageSentToParent.emit('Hello from child! 👋');
  }
}
```

```html
<!-- child.component.html -->
<button (click)="sendMessage()">Send Message to Parent</button>
```

```typescript
// app.component.ts (parent)
export class AppComponent {
  receivedMessage = '';

  onMessageReceived(message: string): void {
    this.receivedMessage = message;
  }
}
```

```html
<!-- app.component.html (parent template) -->
<!-- (outputEvent)="parentHandler($event)" = event binding from child -->
<app-child (messageSentToParent)="onMessageReceived($event)">
</app-child>
<p>Message received from child: {{ receivedMessage }}</p>
```

### Summary of Component Communication Patterns

```
Parent → Child   : [squareBracket]="value"       @Input() / input()
Child → Parent   : (roundBracket)="handler()"    @Output() + EventEmitter / output()
Two-way          : [(banana)]="value"             @Input() + @Output('valueChange') / model()
Sibling/Unrelated: via shared Service            BehaviorSubject / Subject / Signals
```

### Modern Signal-Based `output()` — Angular 17+
```typescript
// child.component.ts (Angular 17+ style)
import { Component, output } from '@angular/core';

@Component({ selector: 'app-child', ... })
export class ChildComponent {
  messageSentToParent = output<string>();  // replaces @Output() + EventEmitter

  sendMessage(): void {
    this.messageSentToParent.emit('Hello!');
  }
}
```

---

## 14. Dependency Injection — `inject()` vs Constructor

Dependency Injection (DI) is Angular's mechanism for providing services to components without the component creating the service instance itself.

### Angular 16 — Constructor Injection
```typescript
import { Component, OnInit }  from '@angular/core';
import { EmployeeService }     from '../services/employee.service';

@Component({ selector: 'app-data-binding', ... })
export class DataBindingComponent implements OnInit {
  employees: any[] = [];

  // Service is injected via constructor parameter
  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employees = this.employeeService.getAllEmployees();
  }
}
```

### Angular 17+ — `inject()` Function (Preferred)
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { EmployeeService }            from '../services/employee.service';

@Component({ selector: 'app-data-binding', ... })
export class DataBindingComponent implements OnInit {
  private employeeService = inject(EmployeeService);  // ← clean, no constructor needed
  employees: any[] = [];

  ngOnInit(): void {
    this.employees = this.employeeService.getAllEmployees();
  }
}
```

### Why `inject()` Is Preferred in Modern Angular
- No constructor needed (especially clean when a component has no other constructor logic)
- Works in **injection context** (constructor, field initialiser, factory functions)
- Cleaner, more functional style
- Aligns with standalone component patterns

### Access Modifiers on Injected Services
- `private` — accessible only within this component (most services)
- `public` — accessible in the template and from outside (rarely needed for services)
- `readonly` — signals the service reference should not be reassigned

```typescript
private readonly employeeService = inject(EmployeeService);
```

### `providedIn: 'root'` — Singleton Services
```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  // One shared instance across the entire app
}
```
- The service is **tree-shakeable** — if no component uses it, it is excluded from the production bundle
- Does **not** need to be listed in `NgModule.providers` or `appConfig.providers`

---

## 15. Services & Component Interaction Demo

The session ended with a practical demo showing end-to-end data flow: Service → Component → Template.

### Employee Service
```typescript
// employee.service.ts
import { Injectable } from '@angular/core';

export interface Employee {
  id:         number;
  name:       string;
  department: string;
  role:       string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  // In a real project, this data comes from an HTTP API call
  private employees: Employee[] = [
    { id: 1, name: 'Alice',   department: 'Engineering', role: 'Developer' },
    { id: 2, name: 'Bob',     department: 'Design',      role: 'UI Designer' },
    { id: 3, name: 'Carol',   department: 'Product',     role: 'PM' },
    { id: 4, name: 'Dave',    department: 'Engineering', role: 'Tech Lead' },
  ];

  getAllEmployees(): Employee[] {
    return this.employees;
  }
}
```

### Data Binding Component (Angular 21 style)
```typescript
// data-binding.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { NgFor }                      from '@angular/common';
import { EmployeeService, Employee }  from '../services/employee.service';

@Component({
  selector:    'app-data-binding',
  templateUrl: './data-binding.component.html',
  styleUrl:    './data-binding.component.scss',
  imports:     [NgFor]       // or just use @for in Angular 17+ (no import needed)
})
export class DataBindingComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  employees: Employee[] = [];

  ngOnInit(): void {
    this.employees = this.employeeService.getAllEmployees();
  }
}
```

### HTML Template
```html
<!-- data-binding.component.html -->
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Department</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <!-- Angular 17+ built-in control flow -->
    @for (emp of employees; track emp.id) {
      <tr>
        <td>{{ emp.id }}</td>
        <td>{{ emp.name }}</td>
        <td>{{ emp.department }}</td>
        <td>{{ emp.role }}</td>
      </tr>
    } @empty {
      <tr><td colspan="4">No employees found.</td></tr>
    }
  </tbody>
</table>
```

### Data Flow
```
EmployeeService.getAllEmployees()
       ↓
DataBindingComponent.ngOnInit()  (assigns to this.employees)
       ↓
HTML template: @for loop renders a <tr> for each Employee
       ↓
Browser displays the table
```

### What About Real API Calls?
In production, the static array in `EmployeeService` would be replaced with an `HttpClient` call:
```typescript
import { HttpClient }       from '@angular/common/http';
import { Observable }       from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('https://api.example.com/employees');
  }
}
```
We'll cover HTTP and RxJS integration in the next session.

---

## Key Takeaways from Session 3

1. **Angular 21 = standalone by default** — no `app.module.ts`, `bootstrapApplication()` instead of `bootstrapModule()`, esbuild, zoneless, Vitest
2. **All 4 binding types serve different directions:**
   - `{{ }}` — TS → HTML (read-only)
   - `[property]` — TS → DOM property (read-only)
   - `(event)` — DOM → TS (trigger)
   - `[(ngModel)]` — bidirectional (requires `FormsModule`)
3. **`ngOnInit` is the right place for API calls** — not the constructor
4. **Angular has 8 lifecycle hooks** — `ngOnInit`, `ngOnChanges`, `ngOnDestroy` cover 95% of real-world use
5. **`ngOnChanges` fires BEFORE `ngOnInit`** on first load
6. **`@Input()` = parent passes data down; `@Output()` = child pushes events up**
7. **`inject()` function** is preferred over constructor injection in Angular 17+
8. **`trackBy`/`track`** in loops is a performance must-have for large datasets
9. **Unrelated components** communicate via shared services + RxJS BehaviorSubject/Subject (covered in Session 4)
10. **`[(ngModel)]` requires `FormsModule`** — always import it explicitly

---

## Preview: Session 4 Topics
- Services in depth — dependency injection patterns
- RxJS operators — `map`, `filter`, `switchMap`, `takeUntil`
- `Subject` and `BehaviorSubject` — cross-component communication
- Integrating real HTTP API calls with `HttpClient`
- Routing — navigation, route params, guards

---

*Notes compiled from Angular KT Session 3 transcript — Trainer: Chandishwar*
