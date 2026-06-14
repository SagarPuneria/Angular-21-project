import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../message.service';

/*
 * ─── Observer object pattern: { next, error, complete } ──────────────────────
 *
 * subscribe() accepts either a shorthand callback or a full Observer object.
 *
 * Shorthand (callback only — handles next emissions):
 *   this.service.data$.subscribe(value => { ... });
 *
 * Full Observer object (handles all three notification channels):
 *   this.service.data$.subscribe({
 *     next:     (value) => { ... },          // called on every emitted value
 *     error:    (err)   => console.error(),  // called once if stream errors; stream ends
 *     complete: ()      => console.log(),    // called once when stream completes normally
 *   });
 *
 * When to use full Observer:
 *   - When you need to handle errors (e.g. HTTP failures, custom Subject errors)
 *   - When you need to react to stream completion (e.g. finalize UI state)
 *   - For production code where silent errors are unacceptable
 *
 * error vs complete:
 *   error()    — abnormal termination; stream is dead, no more next() or complete()
 *   complete() — normal termination; stream is done, no more next() or error()
 *   After either, the subscription is automatically closed — no need to unsubscribe.
 *
 * ─── BehaviorSubject value history ───────────────────────────────────────────
 *
 * BehaviorSubject is often explained as "holds current value", but it also emits
 * every subsequent value via next() — just like Subject. The difference is only
 * at subscription time (BehaviorSubject replays once; Subject does not).
 *
 * By pushing every emission into an array, the component accumulates a full
 * history of all values emitted since it was created — demonstrating that
 * BehaviorSubject is a full Observable stream, not just a value container.
 */

@Component({
  selector: 'app-behavior-subject-example',
  imports: [],
  templateUrl: './behavior-subject-example.html',
  styleUrl: './behavior-subject-example.scss',
})
export class BehaviorSubjectExample implements OnInit, OnDestroy {
  private readonly messageService = inject(MessageService);

  // Updated reactively on every emission — reflects the live current value.
  currentValue: string = '';

  // Accumulates every emitted value since the component was created.
  // BehaviorSubject emits the initial value on subscribe, so this starts
  // pre-populated with 'No message yet' — unlike Subject which starts empty.
  valueHistory: string[] = [];

  // Populated only when "Get Current Value" is clicked — a synchronous snapshot
  // via BehaviorSubject.getValue() without subscribing.
  snapshotValue: string = '';

  private subscription!: Subscription;

  ngOnInit(): void {
    // Full Observer object — handles next, error, and complete separately.
    // This is the recommended pattern for production code.
    //
    // ─── Why subscribe() here instead of async pipe ───────────────────────────
    // async pipe works perfectly for displaying the latest single value in the template:
    //   {{ messageService.currentMessage$ | async }}
    // Angular handles subscription and unsubscribe automatically — no OnDestroy needed.
    //
    // However, async pipe CANNOT accumulate history into an array.
    // It only unwraps the latest emission — previous values are discarded.
    // valueHistory.push(value) requires a subscribe() callback to capture each emission.
    //
    // Since valueHistory accumulation already requires subscribe() + ngOnDestroy,
    // keeping a single subscription for both currentValue and valueHistory is cleaner
    // than splitting into async pipe (currentValue) + subscribe (history).
    //
    // Rule of thumb:
    //   async pipe  → display latest value in template only (no transformation needed)
    //   subscribe() → accumulate, transform, or derive state from emissions
    this.subscription = this.messageService.currentMessage$.subscribe({
      next: (value) => {
        this.currentValue = value;         // reactive current value
        this.valueHistory.push(value);     // accumulate full history
      },
      error: (err) => console.error('BehaviorSubject error:', err),
      complete: () => console.log('BehaviorSubject stream completed'),
    });
  }

  updateValue(input: HTMLInputElement): void {
    if (input.value.trim()) {
      this.messageService.updateMessage(input.value);
      input.value = '';
    }
  }

  // Reads the current held value synchronously via getValue() — no subscription needed.
  // Triggered imperatively from a button click — demonstrates on-demand snapshot access.
  getCurrentValue(): void {
    this.snapshotValue = this.messageService.getCurrentMessage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
