import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

/*
 * ─── BehaviorSubject Deep Dive ────────────────────────────────────────────────
 *
 * This component owns its BehaviorSubject directly (not via a service) to
 * keep the demo self-contained and make each concept observable in isolation.
 *
 * Demo 1 — Requires an Initial Value
 *   BehaviorSubject must be created with an initial value.
 *   A subscriber that joins at component creation (Early Subscriber) immediately
 *   receives that initial value — without any .next() call.
 *   A subscriber that joins later (Late Subscriber) instantly receives the LAST
 *   emitted value (the current held value) at the moment it subscribes — it does
 *   NOT receive the full history, only the single most recent value.
 *
 *   Early Subscriber: subscribes in ngOnInit → receives initial + all future values.
 *   Late Subscriber:  subscribes on button click → receives only the current held
 *                     value at that moment + all future values from that point on.
 *
 * Demo 3 — Always Has a Current Value (.getValue())
 *   BehaviorSubject.getValue() returns the current held value synchronously —
 *   no subscription needed. Useful for one-time reads in click handlers or guards.
 *   ⚠️ This is a snapshot — it does NOT react to future emissions.
 */

@Component({
  selector: 'app-behavior-subject-deep-dive',
  imports: [],
  templateUrl: './behavior-subject-deep-dive.html',
  styleUrl: './behavior-subject-deep-dive.scss',
})
export class BehaviorSubjectDeepDive implements OnInit, OnDestroy {
  // Self-contained BehaviorSubject — not from a service.
  // Created with 'Initial Value' to demonstrate that no .next() call is needed
  // for an early subscriber to receive a value immediately.
  private readonly subject = new BehaviorSubject<string>('Initial Value');

  // ─── Demo 1 state ──────────────────────────────────────────────────────────
  // Early Subscriber — subscribed in ngOnInit; receives initial value + all future.
  earlyMessages: string[] = [];

  // Late Subscriber — subscribed on button click; receives only the current
  // held value at subscription time + all future values from that point.
  lateMessages: string[] = [];
  lateSubscribed = false;

  private earlySubscription!: Subscription;
  private lateSubscription?: Subscription;

  // ─── Demo 3 state ──────────────────────────────────────────────────────────
  // Populated by clicking "Read Current Value Synchronously" — synchronous snapshot
  // via getValue() without subscribing.
  currentStoredValue: string = '';

  ngOnInit(): void {
    // Early subscriber — joins immediately at component creation.
    // BehaviorSubject emits 'Initial Value' synchronously right here —
    // earlyMessages will contain ['Initial Value'] before this method returns.
    this.earlySubscription = this.subject.subscribe(value => {
      this.earlyMessages.push(value);
    });
  }

  emitValue(input: HTMLInputElement): void {
    if (input.value.trim()) {
      this.subject.next(input.value.trim());
      input.value = '';
    }
  }

  subscribeNowLate(): void {
    if (this.lateSubscribed) return;
    this.lateSubscribed = true;

    // Late subscriber — joins after emissions have already occurred.
    // BehaviorSubject immediately delivers its CURRENT held value (last emitted)
    // — not the full history, just the single most recent value.
    this.lateSubscription = this.subject.subscribe(value => {
      this.lateMessages.push(value);
    });
  }

  // Demo 3 — synchronous snapshot without subscribing
  readCurrentValue(): void {
    this.currentStoredValue = this.subject.getValue();
  }

  ngOnDestroy(): void {
    this.earlySubscription.unsubscribe();
    this.lateSubscription?.unsubscribe();
  }
}
