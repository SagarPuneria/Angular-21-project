# Angular KT Session 4 — Training Notes
**Trainer:** Chandishwar (Chandi) | **Series:** Angular Workshops – FullStack TFG (April 13–17, 2026)  
**Topic:** Services (Deep Dive), Dependency Injection, Signals, `@ViewChild`, Async Programming, RxJS, Subject/BehaviorSubject, HTTP Interceptors, HttpClient CRUD, Unit Testing Intro

## Series Navigation

| Session | Core Topics | Demo / Focus Area |
|---|---|---|
| [Session 1](KT-Session-1.md) | JS & TypeScript Prerequisites | ES6+, TypeScript types, OOP, decorators, generics |
| [Session 2](KT-Session-2.md) | Angular Architecture & Setup | SPA vs MPA, CLI, project structure, building blocks |
| [Session 3](KT-Session-3.md) | Data Binding & Lifecycle Hooks | All binding types, `@if`/`@for`, lifecycle hooks, parent-child |
| **Session 4 ←** | **Services, RxJS & HttpClient** | **DI, Observables, BehaviorSubject, HTTP CRUD, interceptors** |
| [Session 5](KT-Session-5.md) | Routing, Guards & Forms | Route config, canActivate, lazy loading, Reactive Forms |

---

## Table of Contents
1. [Services — Deep Dive](#1-services--deep-dive)
2. [Dependency Injection (DI)](#2-dependency-injection-di)
3. [Cross-Component Communication via Service](#3-cross-component-communication-via-service)
4. [The Reactivity Problem — Why Observables/Signals Are Needed](#4-the-reactivity-problem--why-observablessignals-are-needed)
5. [Signal-Based `input()` / `output()` — Performance Benefits](#5-signal-based-input--output--performance-benefits)
6. [`@ViewChild` — Parent Controls Child](#6-viewchild--parent-controls-child)
7. [Synchronous vs Asynchronous JavaScript](#7-synchronous-vs-asynchronous-javascript)
8. [RxJS — Reactive Extensions for JavaScript](#8-rxjs--reactive-extensions-for-javascript)
9. [Observable, Observer, and Subscription](#9-observable-observer-and-subscription)
10. [Subject vs BehaviorSubject](#10-subject-vs-behaviorsubject)
11. [HTTP Interceptors](#11-http-interceptors)
12. [HttpClient — CRUD Operations](#12-httpclient--crud-operations)
13. [Observables Are Lazy — Must `.subscribe()`](#13-observables-are-lazy--must-subscribe)
14. [TypeScript Generics `<T>` in HTTP Calls](#14-typescript-generics-t-in-http-calls)
15. [Unit Testing — Brief Introduction](#15-unit-testing--brief-introduction)

---

## 1. Services — Deep Dive

### What Is a Service?

A service is a **TypeScript class** decorated with `@Injectable` (instead of `@Component`). It has:
- A `.ts` file
- A `.spec.ts` file (test file)
- **No** `.html`, `.scss`, or style files — it is not for rendering

```
Component = @Component decorator → renders UI
Service   = @Injectable decorator → handles data/logic
```

### The Warehouse Analogy
> *Imagine D-Mart has a central warehouse outside the city. All stores (Tolichowki, Ameerpet, Miyapur) get their stock from that warehouse. The warehouse doesn't serve customers directly — it serves the stores. Each store subscribes to the warehouse for daily deliveries.*

- **Warehouse** = Service (central data/logic layer)
- **Stores** = Components (UI layers that consume the data)
- **Daily delivery** = Subscription / data push
- If a store closes = Unsubscribe

### Why Use Services?
| Reason | Detail |
|---|---|
| **Code reusability** | A function used in 5 components lives once in the service |
| **Separation of concerns** | Component handles UI; service handles data |
| **Centralized data management** | One place to read/write/transform data |
| **API interaction** | All REST API calls go through services |
| **State management** | Services hold shared state across components |

### Service vs Component: At a Glance

| | Component | Service |
|---|---|---|
| Decorator | `@Component` | `@Injectable` |
| Has HTML template | Yes | No |
| Has stylesheet | Yes | No |
| Purpose | Render UI, handle user events | Fetch data, share state, business logic |
| Created by CLI | `ng generate component` | `ng generate service` |

### Service Structure (Angular 21)

```typescript
// employee.service.ts
import { Injectable } from '@angular/core';

export interface Employee {
  id:         number;
  name:       string;
  department: string;
  role:       string;
  email:      string;
  salary:     number;
  status:     'Active' | 'Inactive';
}

@Injectable({ providedIn: 'root' })   // ← singleton, app-wide, tree-shakeable
export class EmployeeService {

  // In production: this data comes from HttpClient API call
  private employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering',  role: 'Senior Developer', email: 'alice@company.com', salary: 95000, status: 'Active' },
    { id: 2, name: 'Bob Smith',     department: 'Design',       role: 'UI/UX Designer',   email: 'bob@company.com',   salary: 78000, status: 'Active' },
    { id: 3, name: 'Carol White',   department: 'Engineering',  role: 'Tech Lead',         email: 'carol@company.com', salary: 115000, status: 'Active' },
    { id: 4, name: 'David Brown',   department: 'Marketing',    role: 'Marketing Manager', email: 'david@company.com', salary: 82000, status: 'Inactive' },
  ];

  getEmployees(): Employee[] {
    return this.employees;
  }
}
```

### `providedIn: 'root'` — What It Means
- Angular creates **one singleton instance** of the service for the entire app
- **Tree-shakeable**: if no component uses the service, it is excluded from the production bundle
- Does **not** need to be listed in any `NgModule.providers` or `appConfig.providers`

---

## 2. Dependency Injection (DI)

### What Is DI?

**Dependency Injection** is a design pattern where a class receives its dependencies from the outside (the framework) instead of creating them itself.

> *"One object accessing another object's methods from a different class — Angular manages the object creation so you don't need the `new` keyword."*

### Without DI (what we normally do in plain OOP)
```typescript
// ❌ You manage object creation — leads to multiple instances and memory leaks
class MyComponent {
  private service = new EmployeeService();  // You create it
}
```

### With DI (Angular 16 — Constructor Injection)
```typescript
// ✅ Angular creates ONE shared instance for the whole app
@Component({ ... })
export class MyComponent implements OnInit {
  employees: Employee[] = [];

  constructor(private employeeService: EmployeeService) {}  // Angular injects it

  ngOnInit(): void {
    this.employees = this.employeeService.getEmployees();
  }
}
```

### With DI (Angular 17+ — `inject()` Function — Preferred)
```typescript
// ✅ Cleaner — no constructor needed
import { Component, OnInit, inject } from '@angular/core';
import { EmployeeService, Employee } from '../services/employee.service';

@Component({ selector: 'app-example', ... })
export class ExampleComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  employees: Employee[] = [];

  ngOnInit(): void {
    this.employees = this.employeeService.getEmployees();
  }
}
```

### Why Angular's DI Is Powerful
| Without DI | With Angular DI |
|---|---|
| Every class creates its own instance (`new`) | Framework creates **one singleton** |
| Multiple objects → memory leaks | Memory efficient |
| Hard to test (tight coupling) | Easy to mock in tests |
| Messy dependency management | Clean, declarative |

### Access Modifiers for Injected Services
```typescript
private employeeService = inject(EmployeeService);   // accessible only in this class
public  messageService  = inject(MessageService);    // accessible from template too
readonly authService    = inject(AuthService);       // reference cannot be reassigned
```

> **Best practice**: Use `private` for services unless the template needs direct access.

---

## 3. Cross-Component Communication via Service

### Problem: Siblings Have No Parent-Child Relationship

```
AppComponent
├── SenderComponent    (no relation to Receiver)
└── ReceiverComponent  (no relation to Sender)
```

You cannot use `@Input()`/`@Output()` between Sender and Receiver because they share no direct parent-child relationship.

### Solution: Shared Service

```
SenderComponent  ──writes to──>  MessageService  ──read by──>  ReceiverComponent
```

### MessageService (in the workspace)

```typescript
// message.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MessageService {
  currentMessage: string = '';

  updateMessage(msg: string): void {
    this.currentMessage = msg;
  }
}
```

### Sender Component

```typescript
// sender.ts
import { Component, inject } from '@angular/core';
import { FormsModule }        from '@angular/forms';
import { MessageService }     from '../message.service';

@Component({
  selector:  'app-sender',
  imports:   [FormsModule],
  templateUrl: './sender.html',
})
export class Sender {
  messageService = inject(MessageService);
  message: string = '';

  sendMessage(): void {
    this.messageService.updateMessage(this.message);
    this.message = '';   // clear input after send
  }
}
```

```html
<!-- sender.html -->
<div style="border: 2px solid #28a745; padding: 16px;">
  <h4>Sender</h4>
  <input [(ngModel)]="message" placeholder="Type a message..." />
  <button (click)="sendMessage()">Send via Service</button>
</div>
```

### Receiver Component

```typescript
// receiver.ts
import { Component, inject } from '@angular/core';
import { MessageService }     from '../message.service';

@Component({
  selector:  'app-receiver',
  imports:   [],
  templateUrl: './receiver.html',
})
export class Receiver {
  messageService = inject(MessageService);
}
```

```html
<!-- receiver.html -->
<div style="border: 2px solid #17a2b8; padding: 16px;">
  <h4>Receiver</h4>
  <p><strong>Message:</strong>
    {{ messageService.currentMessage || 'No message yet' }}
  </p>
</div>
```

### How It Works
1. User types a message in Sender and clicks "Send"
2. `sendMessage()` calls `messageService.updateMessage(message)`
3. The shared service instance (singleton) updates `currentMessage`
4. Angular's change detection re-evaluates the Receiver template's interpolation
5. Receiver displays the new message without any direct link to Sender

---

## 4. The Reactivity Problem — Why Observables/Signals Are Needed

### What Chandi Demonstrated

Consider this naive approach in the Receiver:

```typescript
// ❌ Naive approach — stores a snapshot, not reactive
export class Receiver implements OnInit {
  private messageService = inject(MessageService);
  message = '';

  ngOnInit(): void {
    this.message = this.messageService.currentMessage;  // Snapshot at init time only
  }
}
```

```html
<p>{{ message }}</p>  <!-- Only shows the value from when the component loaded -->
```

**Problem**: `ngOnInit` runs **once** when the component loads. Whatever value `currentMessage` had at that moment is captured into `this.message`. After that, even if the Sender updates the service, the Receiver's `message` variable never changes — it doesn't "watch" the service.

### Two Solutions

| Solution | Mechanism |
|---|---|
| **Angular Change Detection** (current demo) | Access `messageService.currentMessage` directly in the template — Angular re-checks on every change detection cycle |
| **Reactive (Observable/Signal)** | Service holds a `BehaviorSubject` or `signal`; Receiver subscribes — gets notified instantly when value changes |

The simple `messageService.currentMessage` interpolation in the template **does** work via Angular's change detection, but for high-frequency updates or complex state, the reactive approach (Observable or Signal) is far more efficient and explicit.

---

## 5. Signal-Based `input()` / `output()` — Performance Benefits

### Why Signals Instead of `@Input()`/`@Output()`?

**Traditional Zone.js change detection:**
```
User action at component level 10
  → Zone.js starts at root (level 0)
    → traverses down: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
    → runs ngDoCheck at every level
```
This is expensive for deeply nested component trees.

**Signal-based change detection:**
```
Signal changes at component level 10
  → Angular directly notifies level 10 only
  → No traversal from root
```

### Signal-Based Input/Output (Angular 17+ — Preferred)

```typescript
// child.ts — Signal-based
import { Component, input, output } from '@angular/core';

@Component({ selector: 'app-child', ... })
export class ChildComponent {
  // Signal input — writable from parent, read-only in child (call as function)
  messageFromParent = input<string>('');    // replaces @Input()

  // Signal output — emit events to parent
  messageSentToParent = output<string>();   // replaces @Output() + EventEmitter

  sendToParent(): void {
    this.messageSentToParent.emit('Hello from child!');
  }
}
```

```html
<!-- child template — access signal value by calling it as a function -->
<p>{{ messageFromParent() }}</p>
<button (click)="sendToParent()">Send to Parent</button>
```

```typescript
// parent.ts — Signal-based
import { Component, signal } from '@angular/core';

@Component({ selector: 'app-parent', ... })
export class ParentComponent {
  messageToChild   = signal('Hello from parent!');  // writable signal
  messageFromChild = signal('');

  onChildMessage(msg: string): void {
    this.messageFromChild.set(msg);
  }
}
```

```html
<!-- parent template — pass signal as property binding -->
<app-child
  [messageFromParent]="messageToChild()"
  (messageSentToParent)="onChildMessage($event)">
</app-child>
<p>Child said: {{ messageFromChild() }}</p>
```

### Signal vs Regular Variable for Component State

```typescript
// ❌ Regular variable — template may not react to changes deep in component trees
count = 0;

// ✅ Signal — template auto-updates; Angular knows exactly what changed
count = signal(0);

increment() {
  this.count.set(this.count() + 1);   // .set() replaces value
  // or: this.count.update(v => v + 1);
}
```

> **Key insight**: Signals eliminate the need for Zone.js to traverse the entire component tree. Angular knows **exactly** which components to update.

---

## 6. `@ViewChild` — Parent Controls Child

`@ViewChild` gives a parent component **direct access** to a child component's public properties and methods.

### Setup

```typescript
// child-item.ts
import { Component } from '@angular/core';

@Component({ selector: 'app-child-item', template: '<p>Counter: {{ counter }}</p>' })
export class ChildItemComponent {
  counter = 0;

  incrementCounter(): void { this.counter++; }
  resetCounter():     void { this.counter = 0; }

  // private method — NOT accessible from parent via @ViewChild
  private internalReset(): void { this.counter = -1; }
}
```

```typescript
// parent.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChildItemComponent } from './child-item';

@Component({
  selector: 'app-parent',
  imports:  [ChildItemComponent],
  template: `
    <app-child-item></app-child-item>
    <button (click)="incrementChild()">+ Counter</button>
    <button (click)="resetChild()">Reset</button>
  `
})
export class ParentComponent implements AfterViewInit {
  @ViewChild(ChildItemComponent) childItem!: ChildItemComponent;

  ngAfterViewInit(): void {
    // ✅ child is available here — NOT in ngOnInit
    console.log('Child component loaded:', this.childItem);
  }

  incrementChild(): void {
    this.childItem.incrementCounter();   // ✅ public method
  }

  resetChild(): void {
    this.childItem.resetCounter();       // ✅ public method
  }

  // this.childItem.internalReset()      // ❌ TypeScript error — private method
}
```

### Rules
- `@ViewChild` reference is available only **after** `ngAfterViewInit` (not in `ngOnInit`)
- Only **public** members of the child component are accessible
- `private` members in the child are **not** accessible from the parent (TypeScript enforces this)

---

## 7. Synchronous vs Asynchronous JavaScript

### JavaScript Is Single-Threaded

JavaScript runs on a **single thread** — it can only do one thing at a time.

```
Single thread: A → B → C → D → E  (one after another)
```

**By default, JavaScript is synchronous**: each line waits for the previous to complete.

### The Problem with Blocking Calls

```javascript
// Imagine this API takes 10 seconds
const data = fetchDataFromServer();   // blocks everything for 10 seconds
renderPage(data);                     // user sees a frozen page
```

This is terrible UX — the page freezes until the server responds.

### The Event Loop — How JS Becomes Async

JavaScript uses an **event loop** to handle long-running tasks without blocking:

```
Main thread (Room A):  A → B → [API call started] → D → E → F ...
                                      ↓
Event Loop (Room B):         [API call runs here separately]
                                      ↓
Callback queue:              [API response ready] → back to Room A
```

1. Long task is handed off to the event loop (Web APIs / Node.js APIs)
2. Main thread continues executing other code (non-blocking)
3. Once the task completes, its callback is queued
4. Event loop picks it up when the main thread is idle

### Ways to Handle Async in JavaScript

| Mechanism | Era | Notes |
|---|---|---|
| Callbacks | ES5 | Simple but leads to "callback hell" |
| Promises | ES6 | Cleaner, chainable with `.then()`/`.catch()` |
| `async`/`await` | ES2017 | Syntactic sugar over Promises |
| Observables (RxJS) | Angular 2+ | Stream-based, cancellable, operator-rich |
| Signals | Angular 16+ | Synchronous reactive state |

### Angular vs Node.js — Which Async Style?

| Environment | Primary Pattern | Why |
|---|---|---|
| **Angular (frontend)** | RxJS Observables | UI keeps reacting: clicks, navigation, HTTP, form changes — all are streams |
| **Node.js (backend)** | `async`/`await` | Request/response pairs — single value per call; Promises fit naturally |

> Note: You CAN use observables in Node.js and async/await in Angular — these are conventions, not strict rules.

---

## 8. RxJS — Reactive Extensions for JavaScript

### What Is RxJS?

RxJS is a **third-party library** for **reactive programming** — not a TypeScript feature, not an Angular built-in.

```json
// package.json
"dependencies": {
  "rxjs": "~7.8.0"   // ← explicit third-party library
}
```

**Full name**: Reactive Extensions for JavaScript  
**Purpose**: A powerful library for handling **asynchronous and event-based** programming using observable streams.

### Where RxJS Is Used in Angular

| Use Case | Detail |
|---|---|
| **HTTP calls** | `HttpClient.get/post/put/delete` all return `Observable<T>` |
| **Reactive Forms** | `formControl.valueChanges` is an `Observable<T>` |
| **Router events** | `router.events` is an `Observable<Event>` |
| **State management** | `BehaviorSubject` holds and shares application state |
| **Custom event streams** | Component-to-component communication |

### Promise vs Observable

| Feature | Promise | Observable |
|---|---|---|
| Values emitted | **One** (single response) | **Many** (stream of values) |
| Execution | **Eager** — executes immediately when created | **Lazy** — executes only when subscribed |
| Cancellable | No (very difficult) | Yes — call `.unsubscribe()` |
| Operators | Limited (`.then`, `.catch`, `.finally`) | Rich operator library (`map`, `filter`, `switchMap`, `takeUntil`, `shareReplay`, etc.) |
| Best for | One-shot async operations | Continuous data streams, HTTP in Angular |

```typescript
// Promise — executes immediately (eager)
const promise = fetch('https://api.example.com/data');  // already running

// Observable — does NOT execute until subscribed (lazy)
const obs$ = this.http.get('https://api.example.com/data');  // not running yet
obs$.subscribe(data => console.log(data));                   // NOW it runs
```

---

## 9. Observable, Observer, and Subscription

### The Milk Basket Analogy

| Concept | Real-world | Code |
|---|---|---|
| **Observable** | Milk vendor / delivery stream | The data source that emits values |
| **Observer** | Household member receiving milk | The code that reacts to each emitted value |
| **Subscription** | The active subscription plan | The active "listening" connection between Observer and Observable |
| **`next()`** | Next day's milk delivery | Emitting the next value |
| **`error()`** | Milk spilled / delivery failed | Error in the data stream |
| **`complete()`** | Subscription period ended | Stream has no more values |
| **`unsubscribe()`** | Cancel the subscription | Stop receiving data, release resources |

### Observable Structure

```typescript
import { Observable } from 'rxjs';

// Creating an Observable manually (rarely done; services/HttpClient create them for you)
const milkDelivery$ = new Observable<string>(observer => {
  observer.next('April 18 — 1 packet');   // emit value
  observer.next('April 19 — 1 packet');   // emit value
  observer.next('April 20 — 1 packet');   // emit value
  observer.complete();                     // signal end of stream
});
```

### Subscribing (Observer pattern)

```typescript
const subscription = milkDelivery$.subscribe({
  next:     (value) => console.log('Received:', value),
  error:    (err)   => console.error('Error:', err),
  complete: ()      => console.log('Subscription complete'),
});

// Later, when you leave the component:
subscription.unsubscribe();
```

### Memory Leak — What Happens Without `unsubscribe()`

```
You subscribed: milk packets coming daily ✅
30-day plan ended — but you forgot to unsubscribe ❌
Result: milk keeps coming, money keeps draining
```

In Angular: if you subscribe in a component and don't unsubscribe in `ngOnDestroy`, the subscription stays alive even after the component is destroyed — **memory leak**.

### When You MUST Unsubscribe

| Scenario | Unsubscribe? |
|---|---|
| HTTP call (`HttpClient.get`) | ✅ Angular automatically completes after one response — safe not to |
| Interval / timer observable | ❗ Must unsubscribe in `ngOnDestroy` |
| `BehaviorSubject` / `Subject` | ❗ Must unsubscribe in `ngOnDestroy` |
| Stock prices, WebSocket stream | ❗ Must unsubscribe |

### Clean Unsubscription Pattern

```typescript
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService }  from './data.service';

@Component({ ... })
export class MyComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private subscription!: Subscription;
  messages: string[] = [];

  ngOnInit(): void {
    this.subscription = this.dataService.message$.subscribe(msg => {
      this.messages.push(msg);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();   // ✅ clean up
  }
}
```

---

## 10. Subject vs BehaviorSubject

Both `Subject` and `BehaviorSubject` are **Observables** — they can emit values over time and be subscribed to.

### Subject

```typescript
import { Subject } from 'rxjs';

// No initial value — starts empty
const messageSubject = new Subject<string>();

messageSubject.next('Hello');   // emit a value
```

**Key characteristics:**
- **No initial value** — new subscribers get nothing until the next `next()` call
- Does **not** replay previous values to late subscribers
- Best for: events, one-shot notifications

### BehaviorSubject

```typescript
import { BehaviorSubject } from 'rxjs';

// Requires an initial value
const messageSubject = new BehaviorSubject<string>('');  // ← must provide default

messageSubject.next('First message');
messageSubject.next('Second message');

// Late subscriber immediately gets the LAST emitted value
messageSubject.subscribe(val => console.log(val));  // logs: 'Second message'
```

**Key characteristics:**
- **Requires an initial value**
- **Replays the last emitted value** to every new subscriber (only the most recent one, not all history)
- Has a `.value` property to read the current value synchronously
- Best for: shared state (current user, auth status, cart contents)

### Subject vs BehaviorSubject — Comparison

| Feature | Subject | BehaviorSubject |
|---|---|---|
| Initial value required | No | Yes |
| Replays to late subscribers | No | Yes (last value only) |
| `.value` property | No | Yes |
| Best for | Event streams | State / current value |

### Real-World Pattern — Private Subject, Public Observable

```typescript
// data.service.ts
import { Injectable }         from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {

  // ✅ Private: only this service can emit new values
  private messageSubject = new BehaviorSubject<string>('');

  // ✅ Public Observable: components subscribe to this (read-only view)
  message$ = this.messageSubject.asObservable();

  sendMessage(msg: string): void {
    this.messageSubject.next(msg);    // only callable from inside the service
  }
}
```

**Why keep the Subject private?**
- If `messageSubject` were public, any component could call `.next()` directly and push arbitrary data
- Keeping it private means **all writes go through the service's controlled methods**
- Components only subscribe to `message$` (the read-only Observable view)

### Component Using the Service

```typescript
// subject-demo.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DataService }  from '../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector:    'app-subject-demo',
  templateUrl: './subject-demo.html',
})
export class SubjectDemoComponent implements OnInit, OnDestroy {
  private dataService  = inject(DataService);
  private subscription!: Subscription;
  messages: string[] = [];

  ngOnInit(): void {
    // Subscribe — will receive every new value pushed to the BehaviorSubject
    this.subscription = this.dataService.message$.subscribe(msg => {
      if (msg) this.messages.push(msg);
    });
  }

  sendMessage(text: string): void {
    this.dataService.sendMessage(text);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();   // prevent memory leak
  }
}
```

```html
<!-- subject-demo.html -->
<input #msgInput placeholder="Type a message...">
<button (click)="sendMessage(msgInput.value)">Send</button>

<ul>
  @for (msg of messages; track $index) {
    <li>{{ msg }}</li>
  } @empty {
    <li>No messages yet.</li>
  }
</ul>
```

---

## 11. HTTP Interceptors

### What Is an HTTP Interceptor?

An interceptor is a function that runs **before every outgoing HTTP request** and/or **after every incoming HTTP response**. It is the right place for:

| Use Case | Example |
|---|---|
| **Authentication** | Attach JWT `Authorization` header to every request |
| **Request IDs** | Add a unique `X-Request-ID` to every request |
| **Loading spinners** | Show spinner before request, hide after response |
| **Error handling** | Handle 401/403/500 globally |
| **Logging** | Log every API call and response time |

### Real-World Example: JWT Token Interceptor

```typescript
// auth.interceptor.ts — Functional interceptor (Angular 17+ style)
import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Read JWT token from localStorage (or an AuthService)
  const token = localStorage.getItem('auth_token');

  if (token) {
    // Clone the request and add the Authorization header
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);   // send the modified request
  }

  return next(req);   // send original if no token
};
```

### Loading Spinner Interceptor

```typescript
// loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { finalize }          from 'rxjs/operators';
import { LoadingService }    from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.show();   // show spinner before request

  return next(req).pipe(
    finalize(() => loadingService.hide())   // hide spinner when done (success or error)
  );
};
```

### Registering Interceptors in `app.config.ts`

```typescript
// app.config.ts
import { ApplicationConfig }  from '@angular/core';
import { provideRouter }      from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor }    from './interceptors/auth.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { routes }             from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, loadingInterceptor])   // ← register here
    )
  ]
};
```

### Angular 16 vs Angular 17+ Interceptors

| | Angular ≤ 16 | Angular 17+ |
|---|---|---|
| Style | Class-based (`Injectable` + `HttpInterceptor`) | **Functional** (`HttpInterceptorFn`) |
| Registration | `HTTP_INTERCEPTORS` multi-provider in `NgModule` | `withInterceptors([...])` in `provideHttpClient` |

---

## 12. HttpClient — CRUD Operations

### Setup: Provide `HttpClient` in `app.config.ts`

```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch())   // ← required in standalone apps
  ]
};
```

### Define the Data Interface

```typescript
// post.model.ts
export interface Post {
  id:     number;
  userId: number;
  title:  string;
  body:   string;
}
```

> **Why define an interface?** TypeScript will immediately catch a type mismatch between your interface and the API response. This prevents bugs before runtime.

### Post Service — All CRUD Methods

```typescript
// post.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';
import { Post }               from './post.model';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);

  // READ ALL — GET /posts
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(API_URL);
  }

  // READ ONE — GET /posts/:id
  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${API_URL}/${id}`);
  }

  // CREATE — POST /posts
  createPost(post: Omit<Post, 'id'>): Observable<Post> {
    return this.http.post<Post>(API_URL, post);
  }

  // UPDATE — PUT /posts/:id  (full replacement)
  updatePost(id: number, post: Post): Observable<Post> {
    return this.http.put<Post>(`${API_URL}/${id}`, post);
  }

  // DELETE — DELETE /posts/:id
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
```

### Component — Using Signals + HttpClient (Angular 21 Style)

```typescript
// post-list.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { PostService } from '../services/post.service';
import { Post }        from '../models/post.model';

@Component({
  selector:    'app-post-list',
  templateUrl: './post-list.html',
})
export class PostListComponent implements OnInit {
  private postService = inject(PostService);

  // All state as signals (Angular 21 recommended pattern)
  posts   = signal<Post[]>([]);
  loading = signal(false);
  error   = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.postService.getPosts().subscribe({
      next:     (data) => { this.posts.set(data); this.loading.set(false); },
      error:    (err)  => { this.error.set('Failed to load posts'); this.loading.set(false); },
    });
  }

  fetchById(id: number): void {
    this.postService.getPostById(id).subscribe({
      next: (post) => console.log('Post:', post),
    });
  }

  createPost(): void {
    const newPost = { userId: 1, title: 'New Post', body: 'Post body text' };
    this.postService.createPost(newPost).subscribe({
      next: (created) => {
        console.log('Created:', created);   // API returns 201 Created
      }
    });
  }

  deletePost(id: number): void {
    this.postService.deletePost(id).subscribe({
      next: () => {
        // Remove from local signal state
        this.posts.update(current => current.filter(p => p.id !== id));
      }
    });
  }
}
```

```html
<!-- post-list.html -->
@if (loading()) {
  <p>Loading...</p>
}

@if (error()) {
  <p style="color: red">{{ error() }}</p>
}

@if (!loading() && !error()) {
  <table>
    <thead>
      <tr><th>ID</th><th>Title</th><th>Actions</th></tr>
    </thead>
    <tbody>
      @for (post of posts(); track post.id) {
        <tr>
          <td>{{ post.id }}</td>
          <td>{{ post.title }}</td>
          <td>
            <button (click)="deletePost(post.id)">Delete</button>
          </td>
        </tr>
      } @empty {
        <tr><td colspan="3">No posts found.</td></tr>
      }
    </tbody>
  </table>
}

<button (click)="fetchPosts()">Reload</button>
<button (click)="createPost()">Add Post</button>
```

### HTTP Method Summary

| CRUD Operation | HTTP Method | `HttpClient` Method | Success Status |
|---|---|---|---|
| Read all | GET | `http.get<T[]>(url)` | 200 OK |
| Read one | GET | `http.get<T>(url/id)` | 200 OK |
| Create | POST | `http.post<T>(url, body)` | 201 Created |
| Update (full) | PUT | `http.put<T>(url/id, body)` | 200 OK |
| Update (partial) | PATCH | `http.patch<T>(url/id, partial)` | 200 OK |
| Delete | DELETE | `http.delete<void>(url/id)` | 200 OK / 204 No Content |

---

## 13. Observables Are Lazy — Must `.subscribe()`

### Demonstration Chandi Did Live

```typescript
// ❌ This does NOT trigger the HTTP call
this.postService.getPosts();  // Just creates the Observable — nothing happens

// ✅ This DOES trigger the HTTP call
this.postService.getPosts().subscribe(data => {
  console.log(data);
});
```

**Why are Observables lazy?**  
An Observable is a **description** of a computation (like a recipe), not the computation itself. You have to `.subscribe()` to say "run this now."

### Promise vs Observable Execution

```typescript
// Promise — EAGER (runs immediately)
const p = new Promise(resolve => {
  console.log('Promise running!');  // Logs immediately
  resolve('done');
});

// Observable — LAZY (does NOT run until subscribed)
const obs$ = new Observable(observer => {
  console.log('Observable running!');  // Does NOT log yet
  observer.next('done');
});
obs$.subscribe();  // NOW it logs
```

### The `async` Pipe — Subscribe Without `.subscribe()`

The Angular template `async` pipe automatically subscribes and unsubscribes:

```typescript
// component
posts$ = this.postService.getPosts();  // Observable — no subscribe()
```

```html
<!-- template — async pipe handles subscribe/unsubscribe automatically -->
@for (post of (posts$ | async) ?? []; track post.id) {
  <li>{{ post.title }}</li>
}
```

---

## 14. TypeScript Generics `<T>` in HTTP Calls

### What `<T>` Means

The angle-bracket syntax `<T>` in TypeScript is a **generic type parameter** — it tells the compiler what type of data a function works with.

```typescript
// Generic function — T is determined by the caller
function identity<T>(value: T): T {
  return value;
}

identity<string>('hello');  // T = string
identity<number>(42);       // T = number
```

### In HttpClient

```typescript
// Without generic — response is `Object`, no type safety
this.http.get('https://api.example.com/posts');

// With generic — response is strongly typed as Post[]
this.http.get<Post[]>('https://api.example.com/posts');
//             ↑↑↑↑↑
//  This is a GENERIC type parameter (not a generator)
```

The generic type:
1. Tells `http.get()` what type to deserialize the JSON into
2. Propagates to the `Observable<Post[]>` return type
3. TypeScript enforces that you use `Post[]` consistently — catches bugs at compile time

### Interface Mismatch Catches Bugs

```typescript
// If API returns: { id, userId, title, body }
// But you accidentally use the wrong interface:
this.http.get<User[]>('https://jsonplaceholder.typicode.com/posts')
  .subscribe(users => {
    console.log(users[0].email);  // ❌ TypeScript error — Post has no 'email' field
  });
```

---

## 15. Unit Testing — Brief Introduction

### Overview

Angular uses **Vitest** (this project) as the test runner. Every generated component/service comes with a `.spec.ts` file containing boilerplate tests.

### Key Building Blocks

| Concept | Description |
|---|---|
| **`TestBed`** | Angular's testing utility — sets up a mini Angular environment for each test |
| **`ComponentFixture`** | Wrapper around a component instance; gives access to the DOM and component |
| **`describe()`** | Test suite — groups related tests |
| **`it()`** | Individual test case |
| **`expect()`** | Assertion — checks that a value matches an expectation |
| **`beforeEach()`** | Runs before each `it()` block — used to set up fresh state |

### Boilerplate Structure

```typescript
// app.spec.ts — auto-generated by Angular CLI
import { TestBed }           from '@angular/core/testing';
import { AppComponent }      from './app';

describe('AppComponent', () => {           // Test suite

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],             // Add the component under test
    }).compileComponents();
  });

  it('should create the app', () => {      // Test case 1
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();              // Assertion: component exists
  });

  it('should have the correct title', () => {   // Test case 2
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('angular-v21-project');
  });
});
```

### Common `expect` Matchers

```typescript
expect(value).toBeTruthy()       // truthy (not null/undefined/false/0)
expect(value).toBeFalsy()        // falsy
expect(value).toBe(42)           // strict equality (===)
expect(value).toEqual({ a: 1 })  // deep equality
expect(value).toContain('text')  // string/array contains
expect(fn).toHaveBeenCalled()    // spy was called
expect(fn).toHaveBeenCalledWith('arg')
```

### Running Tests

```bash
# Run all tests with Vitest
npm test

# Run a specific spec file
npx vitest run src/app/app.spec.ts
```

---

## Key Takeaways from Session 4

1. **Service = `@Injectable` class** — no HTML, no styles; responsible for data operations and business logic
2. **DI principle**: Angular creates one singleton; you access it via `inject()` — no `new` keyword needed
3. **Sibling/unrelated component communication** goes through a shared service (no `@Input`/`@Output` needed)
4. **Signals improve performance** — Zone.js traverses the entire component tree; signals notify directly
5. **JavaScript is single-threaded** — the event loop enables asynchronous, non-blocking behavior
6. **RxJS is a third-party library** — not a TypeScript/Angular built-in; lives in `package.json`
7. **Observable vs Promise**: Observables are lazy (need `.subscribe()`), emit multiple values, and are cancellable
8. **Subject** = no initial value; **BehaviorSubject** = requires initial value, replays last value to new subscribers
9. **Pattern**: keep `BehaviorSubject` private in service, expose only a public `Observable` via `.asObservable()`
10. **Always unsubscribe** in `ngOnDestroy` (except HTTP calls, which auto-complete)
11. **HTTP interceptors** are the place for cross-cutting concerns: auth tokens, request IDs, spinners
12. **All HttpClient methods return `Observable<T>`** — always use generics for type safety
13. **`<T>` = TypeScript generics** (type parameters)
14. **Prefer signals for component state** in Angular 21 — use `signal()` instead of plain variables

---

## Preview: Session 5 Topics
- Reactive Forms (`FormControl`, `FormGroup`, `FormBuilder`, `Validators`)
- Signal Forms (Angular 21 — new approach)
- Angular Routing (navigation, route params, `ActivatedRoute`)
- Route Guards and `CanActivateFn`
- Additional examples and Q&A

---

*Notes compiled from Angular KT Session 4 transcript — Trainer: Chandishwar*
