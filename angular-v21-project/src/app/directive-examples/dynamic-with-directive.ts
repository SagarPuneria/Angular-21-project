import {
  Component,
  ComponentRef,
  ViewChild,
  signal,
  OnDestroy,
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ComponentHostDirective } from './component-host.directive';
import { SignalChild } from '../signal-parent-child/signal-child/signal-child';

/*
 * ─── Dynamic Component Creation via Attribute Directive ──────────────────────
 *
 * Pattern:
 *   1. Apply @ViewChild(ComponentHostDirective) to access the directive instance
 *   2. Access directive.vcr (ViewContainerRef) to call createComponent()
 *   3. The directive simply marks where components should be inserted — it doesn't
 *      do the insertion; the component code does.
 *
 * Benefit over direct <ng-container #outlet>:
 *   - Reusable marker pattern; any component can apply the directive
 *   - Clearly indicates "this is a host for dynamic components"
 *   - Encapsulates the ViewContainerRef in a typed directive reference
 */

@Component({
  selector: 'app-dynamic-with-directive',
  imports: [FormsModule, ComponentHostDirective],
  templateUrl: './dynamic-with-directive.html',
  styleUrl: './dynamic-with-directive.scss',
})
export class DynamicWithDirective implements OnDestroy {
  // Access the directive instance to get its ViewContainerRef
  @ViewChild(ComponentHostDirective) host!: ComponentHostDirective;

  isCreated = signal(false);
  messageToChild = signal('Hello from Directive Host!');
  messagesFromChild = signal<string[]>([]);
  inputValue = '';

  private componentRef: ComponentRef<SignalChild> | null = null;
  private subscription: any = null;

  createChild(): void {
    if (this.isCreated() || !this.host) return;

    // Use the directive's ViewContainerRef to create the component
    this.componentRef = this.host.vcr.createComponent(SignalChild);
    this.componentRef.setInput('parentMessage', this.messageToChild());

    this.subscription = outputToObservable(
      this.componentRef.instance.childMessageEvent
    ).subscribe((message: string) => {
      this.messagesFromChild.update((msgs) => [...msgs, message]);
    });

    this.isCreated.set(true);
  }

  sendToChild(): void {
    if (!this.inputValue.trim() || !this.componentRef) return;
    this.messageToChild.set(this.inputValue);
    this.componentRef.setInput('parentMessage', this.inputValue);
    this.inputValue = '';
  }

  destroyChild(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.componentRef?.destroy();
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
