import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
}
