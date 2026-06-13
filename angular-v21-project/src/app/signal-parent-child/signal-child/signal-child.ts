import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-child',
  imports: [FormsModule],
  templateUrl: './signal-child.html',
  styleUrl: './signal-child.scss',
})
export class SignalChild {
  // ─── Signal-based input (Angular 17+) ────────────────────────────────────
  // input<T>() creates a read-only signal. The parent binds a value to it with
  // [parentMessage]="someValue" and the child reads it as this.parentMessage().
  // Unlike @Input(), this is tracked in the signal graph — no ngOnChanges needed.
  readonly parentMessage = input<string>('');

  // ─── Signal-based output (Angular 17+) ───────────────────────────────────
  // output<T>() replaces @Output() + EventEmitter<T>.
  // The parent listens with (childMessageEvent)="handler($event)".
  readonly childMessageEvent = output<string>();

  // Local state for the reply input field — plain string, not a signal,
  // because this is just a temporary UI buffer (not shared reactive state).
  childResponse = '';

  sendToParent(): void {
    if (this.childResponse.trim()) {
      this.childMessageEvent.emit(this.childResponse);
      this.childResponse = '';
    }
  }
}
