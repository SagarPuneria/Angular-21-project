import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../message.service';

/*
 * ─── Subject vs BehaviorSubject ─────────────────────────────────────────────
 *
 * Subject (used here)
 *   • No initial value — new subscribers receive NOTHING until the next emission.
 *   • No replay — a subscriber that joins after an emission misses it entirely.
 *   • Useful when you only care about future events (e.g. button clicks, events).
 *   • Pattern here: every emission is pushed into a `messages` array so the UI
 *     accumulates a history of everything sent since the component rendered.
 *
 * BehaviorSubject (used in MessageService for currentMessage$)
 *   • Holds the current value — new subscribers immediately get the latest value.
 *   • Replay of 1 — a subscriber that joins late still gets the current state.
 *   • Useful for shared state (e.g. auth status, selected item, last message).
 *
 * Angular standard: subscribe to both Subject and BehaviorSubject in ngOnInit.
 *   • All field initializers have already run — no declaration-order risk.
 *   • @Input() / route params are available here if the subscription depends on them.
 *   • Works identically for every Observable type — one consistent pattern.
 *   • Tear down in ngOnDestroy to prevent memory leaks.
 *
 * Field initializer subscription (e.g. `private sub = this.svc.obs$.subscribe(...)`)
 * also works for BehaviorSubject (synchronous replay), but ngOnInit is preferred
 * as the conventional, safer default.
 */

@Component({
  selector: 'app-subject-example',
  imports: [],
  templateUrl: './subject-example.html',
  styleUrl: './subject-example.scss',
})
export class SubjectExample implements OnInit, OnDestroy {
  private readonly messageService = inject(MessageService);

  // Accumulates all messages received via Subject — Subject doesn't hold state,
  // so the component maintains its own array.
  messages: string[] = [];

  private subscription!: Subscription;

  ngOnInit(): void {
    // Subscribe to the Subject's Observable stream.
    // Only emissions that occur AFTER this point are received.
    this.subscription = this.messageService.message$.subscribe((message) => {
      this.messages.push(message);
    });
  }

  sendMessage(input: HTMLInputElement): void {
    if (input.value.trim()) {
      this.messageService.sendSubjectMessage(input.value);
      input.value = '';
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks — Subject subscriptions are not
    // cleaned up automatically (unlike the async pipe).
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
