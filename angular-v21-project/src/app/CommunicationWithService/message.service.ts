import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

/*
 * ─── Observable Emission Timing — Sync vs Async ──────────────────────────────
 *
 * subscribe() itself always runs synchronously — it registers the observer on
 * the same call stack. Whether the CALLBACK fires sync or async depends entirely
 * on the Observable SOURCE, not on subscribe().
 *
 * Synchronous sources — callback fires on the same call stack as subscribe() / next():
 *   BehaviorSubject   → emits current held value synchronously inside _subscribe()
 *   Subject           → callback fires synchronously when .next() is called
 *   of(), from()      → emit all values synchronously before moving to the next line
 *
 * Asynchronous sources — callback fires later, off the current call stack:
 *   HttpClient        → HTTP response arrives via microtask / macrotask
 *   timer(),interval()→ scheduled via setTimeout / setInterval
 *   fromEvent()       → fires when a DOM event occurs (user interaction)
 *
 * ┌──────────────────────────┬─────────────────┐
 * │ Observable source        │ Emission timing │
 * ├──────────────────────────┼─────────────────┤
 * │ BehaviorSubject          │ ✅ Sync          │
 * │ Subject                  │ ✅ Sync          │
 * │ of(), from()             │ ✅ Sync          │
 * │ HttpClient               │ ⏳ Async         │
 * │ timer(), interval()      │ ⏳ Async         │
 * │ fromEvent() (DOM events) │ ⏳ Async         │
 * └──────────────────────────┴─────────────────┘
 * NOTE: The subscribe() call itself is always synchronous — it's the source that decides when the callback runs.
 */

/*
 * ─── Why Subject/BehaviorSubject is private + exposed as Observable ───────────
 *
 * The pattern in this service:
 *   private readonly _messageSubject  = new Subject<string>();   // write access
 *   readonly         message$         = _messageSubject.asObservable(); // read access
 *
 * Flow:
 *   Component calls sendSubjectMessage(value)
 *     → service calls _messageSubject.next(value)   ← PUSH happens on the Subject
 *     → subscribers receive via message$             ← RETRIEVE happens on the Observable
 *
 * Why keep the Subject private?
 *   Subject exposes three dangerous methods to anyone who holds a reference:
 *     .next(value)    — push a new value (intended only for the service)
 *     .error(err)     — terminate the stream with an error
 *     .complete()     — close the stream permanently; no further emissions possible
 *
 *   If Subject were public, any component anywhere in the app could call
 *   .error() or .complete() and silently break every other subscriber.
 *   Predictability and control would be lost.
 *
 * Why expose as Observable?
 *   Observable is read-only by design — it has no .next(), .error(), .complete().
 *   Subscribers can only LISTEN; they cannot push values or kill the stream.
 *   This enforces a single source of truth: all writes go through the service methods,
 *   giving the service full control over when, what, and how values are emitted.
 *
 * General principle: keep mutable state (Subject) private; expose immutable
 * read surfaces (Observable) publicly. All mutations happen through explicit
 * service methods — one place, full control.
 */

/*
 * ─── State Management: BehaviorSubject vs Subject ────────────────────────────
 *
 * "For state management, BehaviorSubject is better than Subject" — PARTIALLY TRUE.
 *
 * ✅ True for RxJS-based shared state:
 *   BehaviorSubject guarantees that any late subscriber immediately receives the
 *   current value. Subject has no memory — a late subscriber gets nothing and
 *   misses whatever state was emitted before it subscribed.
 *
 * ❌ Wrong for events / commands:
 *   Subject is the CORRECT tool when there is no meaningful "current value":
 *     "file saved" notification  → past saves are irrelevant to new subscribers
 *     button click stream        → there is no "current click" to replay
 *   Using BehaviorSubject here forces a dummy initial value (null / false) that
 *   every new subscriber fires on unnecessarily.
 *
 * ⚡ Angular 21 recommendation — prefer signal() for state:
 *   signal() has no boilerplate, is always synchronous, composes with computed(),
 *   and never needs unsubscription. Reach for BehaviorSubject only when you need
 *   RxJS operators (switchMap, combineLatest, debounceTime, etc.).
 *
 * ┌─────────────────────────────┬──────────────────────┬───────────────────┐
 * │ Use case                    │ Correct tool         │ Reason            │
 * ├─────────────────────────────┼──────────────────────┼───────────────────┤
 * │ Current user / auth state   │ signal() / BS        │ New component     │
 * │ Loading / error state       │ signal() / BS        │ needs current     │
 * │ Selected item in a list     │ signal() / BS        │ value on init     │
 * ├─────────────────────────────┼──────────────────────┼───────────────────┤
 * │ "Save succeeded" toast      │ Subject              │ No meaningful     │
 * │ Button click stream         │ Subject              │ current value     │
 * │ One-off HTTP trigger        │ Subject              │ to replay         │
 * └─────────────────────────────┴──────────────────────┴───────────────────┘
 * BS = BehaviorSubject
 */

/*
 * ─── Current Value: BehaviorSubject vs Subject ───────────────────────────────
 *
 * BehaviorSubject — always holds a current value
 *   private readonly _currentMessage = new BehaviorSubject<string>('No message yet');
 *   Timeline:
 *   t=0  BehaviorSubject created  → stores 'No message yet'
 *   t=1  .next('Hello')           → stores 'Hello', notifies subscriber A
 *   t=2  Component B subscribes   → immediately gets 'Hello' (emits current held value)
 *   t=3  .next('World')           → stores 'World', notifies A and B
 *
 * Subject — no current value, no memory
 *   private readonly _messageSubject = new Subject<string>();
 *   Timeline:
 *   t=0  Subject created           → empty, nothing stored
 *   t=1  .next('Hello')            → notifies subscriber A only
 *   t=2  Component B subscribes    → gets nothing (missed 'Hello')
 *   t=3  .next('World')            → notifies A and B
 */

@Injectable({ providedIn: 'root' })
export class MessageService {

  // ─── Non-reactive (kept for comparison) ──────────────────────────────────
  // Plain property — components that read this get a one-time snapshot; no updates after init.
  currentMessage: string = 'No message yet';

  // ─── Reactive approach ────────────────────────────────────────────────────
  // BehaviorSubject holds the current value AND emits it to any new subscriber
  // immediately (unlike plain Subject which only emits future values).
  // Private: only this service can push new values via next().
  private readonly _currentMessage = new BehaviorSubject<string>('No message yet');

  // Public read-only Observable — components subscribe to this, never to the subject directly.
  readonly currentMessage$ = this._currentMessage.asObservable();

  updateMessage(msg: string): void {
    this.currentMessage = msg;           // non-reactive plain property (old approach)
    this._currentMessage.next(msg);      // reactive: notifies all active subscribers
  }

  // Returns the current held value of the BehaviorSubject synchronously.
  // Useful when a component needs a one-time snapshot without subscribing —
  // e.g. reading the value in a click handler or on ngOnInit without setting up
  // a full subscription.
  // ⚠️ This is a snapshot — it does NOT update automatically. For live updates,
  // subscribe to currentMessage$ instead.
  getCurrentMessage(): string {
    return this._currentMessage.getValue();
  }

  // ─── Subject (no initial value, no replay) ────────────────────────────────
  // Subject only forwards future emissions to current subscribers.
  // Unlike BehaviorSubject it does NOT hold a current value and does NOT replay
  // to new subscribers — a late subscriber misses all previous emissions.
  //
  // Pattern here: each emission is pushed into an array so the UI accumulates
  // a history of all messages sent during the component's lifetime.
  private readonly _messageSubject = new Subject<string>();

  // Public Observable surface — components subscribe to this.
  readonly message$ = this._messageSubject.asObservable();

  sendSubjectMessage(msg: string): void {
    this._messageSubject.next(msg);
  }
}
