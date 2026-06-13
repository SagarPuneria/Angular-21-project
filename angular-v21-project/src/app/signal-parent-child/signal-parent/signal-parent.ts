import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignalChild } from '../signal-child/signal-child';

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
