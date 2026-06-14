import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-receiver',
  imports: [AsyncPipe],
  templateUrl: './receiver.html',
})
export class Receiver implements OnInit, OnDestroy {

  // ─── Shared service injection ─────────────────────────────────────────────
  messageService = inject(MessageService);

  // ─── Approach 1: Non-reactive approach (one-time snapshot) ────────────────────────────────────
  // Assigned once in ngOnInit — does NOT update when Sender sends a new message.
  message: string = 'working or not working';

  ngOnInit() {
    // ⚠️ Non-reactive assignment — reads the current held value of the BehaviorSubject exactly once at init time.
    // If Sender later updates messageService.currentMessage OR calls updateMessage(), this.message will NOT update —
    // it holds a snapshot of whatever the value was when the component was created.
    //
    // This demonstrates the limitation of plain property assignment for shared state.
    // The fix is reactive programming: expose currentMessage as an Observable (Subject /
    // BehaviorSubject) in the service, then subscribe here (or use the async pipe in the
    // template) so the view automatically reflects every future change.
    this.message = this.messageService.currentMessage;
    // OR
    // getCurrentMessage() internally calls BehaviorSubject.getValue() —
    // the encapsulated, service-controlled alternative to reading the plain
    // currentMessage property directly.
    // this.message = this.messageService.getCurrentMessage();
  }

  // ─── Approach 2: Reactive approach (live updates via BehaviorSubject) ──────────────────────────
  // Updated automatically every time Sender calls messageService.updateMessage().
  reactiveMessage: string = '';

  // ✅ Field initializer — works because:
  //    1. messageService is declared above (inject() runs before this line).
  //    2. reactiveMessage is declared above — BehaviorSubject emits its current held value
  //       synchronously inside _subscribe() the moment .subscribe() is called.
  //       Subsequent values arrive synchronously whenever .next(newValue) is called.
  //       reactiveMessage must already exist as a field before the subscription runs.
  //    Declaration order in the class body = initialization order at runtime.
  //    Note: ngOnInit also works fine with BehaviorSubject — both produce identical behavior.
  // subscribe() always registers the observer synchronously — but whether the callback fires sync or async depends entirely on what creates the Observable.
  private readonly subscription: Subscription = this.messageService.currentMessage$.subscribe(
    msg => {
      this.reactiveMessage = msg;
    },
  );

  // constructor is no longer needed for the subscription, since we are using field initializers.

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