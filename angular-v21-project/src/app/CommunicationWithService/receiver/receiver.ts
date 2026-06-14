import { Component, inject, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-receiver',
  imports: [AsyncPipe],
  templateUrl: './receiver.html',
})
export class Receiver implements OnDestroy {

  // ─── Approach 1: Non-reactive approach (one-time snapshot) ────────────────────────────────────
  // Assigned once in ngOnInit — does NOT update when Sender sends a new message.
  message: string = 'working or not working';

  ngOnInit() {
    // ⚠️ Non-reactive assignment — reads the service value exactly once at init time.
    // If Sender later updates messageService.currentMessage, this.message will NOT update —
    // it holds a snapshot of whatever the value was when the component was created.
    //
    // This demonstrates the limitation of plain property assignment for shared state.
    // The fix is reactive programming: expose currentMessage as an Observable (Subject /
    // BehaviorSubject) in the service, then subscribe here (or use the async pipe in the
    // template) so the view automatically reflects every future change.
    this.message = this.messageService.currentMessage;
  }

  // ─── Approach 2: Reactive approach (live updates via BehaviorSubject) ──────────────────────────
  messageService = inject(MessageService);
  // Updated automatically every time Sender calls messageService.updateMessage().
  reactiveMessage: string = '';

  // ✅ Field initializer — works because:
  //    1. messageService is declared above (inject() runs before this line).
  //    2. reactiveMessage is declared above (BehaviorSubject replays the current value immediately on subscribe(Here subscribe asynchronous function),
  //       then emits its current value synchronously(live updates) pushed via next() — reactiveMessage must already exist as a field).
  //    Declaration order in the class body = initialization order at runtime.
  // Stored so we can unsubscribe in ngOnDestroy and prevent memory leaks.
  private readonly subscription: Subscription = this.messageService.currentMessage$.subscribe(
    msg => {
      this.reactiveMessage = msg;
    },
  );

  // constructor is no longer needed for the subscription.

  ngOnDestroy(): void {
    // Always unsubscribe when the component is destroyed to avoid memory leaks.
    this.subscription.unsubscribe();
  }

  // ─── Approach 3: Async pipe approach — expose Observable directly to the template ────
  // No subscribe(), no unsubscribe(), no extra field.
  // Angular's async pipe handles the subscription lifecycle automatically.
  // ✅ async pipe — no OnDestroy needed
  readonly currentMessage$ = this.messageService.currentMessage$;
}