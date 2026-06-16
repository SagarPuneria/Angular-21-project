import {
  AfterViewInit,
  Component,
  ComponentRef,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  signal,
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SignalChild } from '../signal-parent-child/signal-child/signal-child';

/*
 * ─── Dynamic Component Creation: createComponent() + outputToObservable() ───
 *
 * PROBLEM with template binding:
 *   When a child component is known at compile time, the template approach works:
 *     <app-signal-child
 *       [parentMessage]="value"
 *       (childMessageEvent)="handler($event)"
 *     />
 *   But when the component is chosen at RUNTIME (wizard steps, plugin slots,
 *   feature flags), there is no template to write — the component type is a
 *   variable, not a fixed element.
 *
 * SOLUTION — createComponent() + outputToObservable():
 *
 *   Step 1 — Create the component programmatically:
 *     const ref = viewContainerRef.createComponent(SignalChild);
 *     // Angular allocates, renders, and attaches it to the DOM at the outlet.
 *
 *   Step 2 — Set inputs programmatically (replaces [parentMessage]="..."):
 *     ref.setInput('parentMessage', 'Hello!');
 *     // Type-safe: Angular throws if the input name doesn't exist.
 *
 *   Step 3 — Subscribe to outputs programmatically (replaces (childMessageEvent)="..."):
 *     outputToObservable(ref.instance.childMessageEvent)
 *       .subscribe(msg => { ... });
 *     // outputToObservable() converts OutputEmitterRef<T> → Observable<T>
 *     // so any RxJS operators (map, filter, debounceTime) can be chained.
 *
 *   Step 4 — Destroy when done:
 *     subscription.unsubscribe();   // stop listening to output
 *     ref.destroy();                // remove from DOM + run ngOnDestroy
 *
 * ─── Why outputToObservable()? ───────────────────────────────────────────────
 *   output() returns an OutputEmitterRef<T>, not a plain Observable.
 *   OutputEmitterRef has an .emit() method but no .subscribe().
 *   outputToObservable() wraps it as an Observable, unlocking the full RxJS API:
 *     outputToObservable(ref.instance.someOutput)
 *       .pipe(debounceTime(300), filter(v => !!v))
 *       .subscribe(handler);
 *
 * ─── @ViewChild vs viewChild() signal API ────────────────────────────────────
 *   viewChild<T>(locator) is the Angular 17+ signal-based equivalent of @ViewChild,
 *   and works well when you need a plain ElementRef or a component instance.
 *   However, viewChild() does NOT support the 'read' option — its options type
 *   only accepts 'debugName'. When you need to read a DIFFERENT token from a
 *   template ref (e.g. ViewContainerRef from an <ng-container #outlet>), use
 *   the @ViewChild decorator which fully supports { read: Token }.
 * Note: viewChild() signal API does not support the 'read' option — use @ViewChild
 * when you need to read a different token (e.g. ViewContainerRef) from a template ref.
 */

@Component({
  selector: 'app-dynamic-host',
  imports: [FormsModule],
  templateUrl: './dynamic-host.html',
  styleUrl: './dynamic-host.scss',
})
export class DynamicHost implements AfterViewInit, OnDestroy {
  // ─── ViewContainerRef at the outlet marker ────────────────────────────────
  // @ViewChild with read: ViewContainerRef gives a direct insertion point for
  // createComponent(). viewChild() signal API does not support 'read', so
  // @ViewChild is the correct choice here.
  @ViewChild('outlet', { read: ViewContainerRef })
  private outlet!: ViewContainerRef;

  // ─── Component state (all signals) ───────────────────────────────────────
  isCreated = signal(false);
  messageToChild = signal('Hello from Dynamic Host!');
  messagesFromChild = signal<string[]>([]);

  // Temporary input buffer — plain string, not a signal (local UI state only).
  inputValue = '';

  // ─── Runtime refs — not signals (imperative, not reactive) ───────────────
  private componentRef: ComponentRef<SignalChild> | null = null;
  private subscription: Subscription | null = null;

  // AfterViewInit guarantees @ViewChild is resolved before any button can call createChild().
  ngAfterViewInit(): void {}

  // ─── Create ───────────────────────────────────────────────────────────────
  createChild(): void {
    if (this.isCreated()) return;

    // Step 1 — Create the component at runtime; Angular mounts it at #outlet.
    this.componentRef = this.outlet.createComponent(SignalChild);

    // Step 2 — Set the input programmatically (no [parentMessage] in template).
    this.componentRef.setInput('parentMessage', this.messageToChild());

    // Step 3 — Subscribe to the output via outputToObservable().
    //   outputToObservable converts OutputEmitterRef<string> → Observable<string>
    //   enabling RxJS operators if needed (pipe, debounce, filter, etc.)
    this.subscription = outputToObservable(
      this.componentRef.instance.childMessageEvent
    ).subscribe((message: string) => {
      this.messagesFromChild.update((msgs) => [...msgs, message]);
    });

    this.isCreated.set(true);
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  sendToChild(): void {
    if (!this.inputValue.trim() || !this.componentRef) return;
    // Update our state signal and push the new value into the dynamic component.
    this.messageToChild.set(this.inputValue);
    this.componentRef.setInput('parentMessage', this.inputValue);
    this.inputValue = '';
  }

  // ─── Destroy ──────────────────────────────────────────────────────────────
  destroyChild(): void {
    this.subscription?.unsubscribe(); // stop listening to child output
    this.subscription = null;
    this.componentRef?.destroy();     // remove from DOM + trigger ngOnDestroy on child
    this.componentRef = null;
    this.isCreated.set(false);
  }

  clearMessages(): void {
    this.messagesFromChild.set([]);
  }

  ngOnDestroy(): void {
    this.destroyChild();
  }
}
