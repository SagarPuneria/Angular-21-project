import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignalChild } from '../signal-child/signal-child';

/*
 * ─── Why signal-based input() / output() matters — Performance & Reactivity ──
 *
 * 1. Classic change detection (zone.js era)
 *    ────────────────────────────────────────
 *    Angular used zone.js to monkey-patch browser async APIs (click, HTTP,
 *    setTimeout, etc.). Every event triggered change detection from the ROOT
 *    component all the way down through every child — even components unrelated
 *    to the change. If your component tree is 10 levels deep and something
 *    changes at level 10, Angular still walks from level 0 → 1 → 2 → ... → 10,
 *    calling ngDoCheck at each level.
 *
 * 2. Signal-based change detection (Angular 17+)
 *    ──────────────────────────────────────────────
 *    When a signal() value changes, Angular already knows which specific template
 *    bindings depend on it (tracked at subscription time). It marks only those
 *    views dirty and re-renders them directly — no tree walk, no intermediate
 *    ngDoCheck calls. The 10th-level component is updated in isolation.
 *    → Fewer change detection cycles → better performance.
 *
 * 3. Reactivity — signal vs plain property
 *    ──────────────────────────────────────
 *    Plain property (non-reactive):
 *      message = 'hello';          // assigned once; HTML never auto-updates
 *
 *    Signal (reactive):
 *      message = signal('hello');  // whenever .set() is called anywhere,
 *                                  // every template reading message() updates immediately.
 *
 * 4. Where signals help beyond inputs/outputs
 *    ──────────────────────────────────────────
 *    - Component-level state that changes from multiple places → use signal()
 *    - Derived/computed values → use computed()
 *    - Side effects on state change → use effect()
 *    - Forms → Signal Forms (no FormGroup/FormControl) — see signal-form component
 *    - Service shared state → BehaviorSubject can be replaced by signal() + toSignal()
 *
 * 5. Angular's direction
 *    ─────────────────────
 *    Angular is actively encouraging signal-based input() / output() over
 *    @Input() / @Output() decorators because they integrate with the signal graph,
 *    reducing change detection cycles and making reactivity explicit and traceable.
 */

@Component({
  selector: 'app-signal-parent',
  imports: [FormsModule, SignalChild],
  templateUrl: './signal-parent.html',
  styleUrl: './signal-parent.scss',
})
export class SignalParent {
  // ─── Signal to pass down to child ────────────────────────────────────────
  // signal() makes this reactive — when set(), the child's input() signal
  // updates automatically and Angular re-renders only the affected subtree.
  readonly messageToChild = signal('Hello from Parent!');

  // ─── Signal to receive from child ────────────────────────────────────────
  // Updated by handleChildMessage() when the child emits via output().
  readonly messageFromChild = signal('No message received yet');

  // Temporary buffer for the input field — plain string, not a signal,
  // because it's local UI state that doesn't need to be shared reactively.
  inputValue = '';

  // ─── Methods ─────────────────────────────────────────────────────────────
  sendMessageToChild(): void {
    if (this.inputValue.trim()) {
      this.messageToChild.set(this.inputValue);
      this.inputValue = '';
    }
  }

  // Called when child emits childMessageEvent — updates the signal.
  handleChildMessage(message: string): void {
    this.messageFromChild.set(message);
  }
}
