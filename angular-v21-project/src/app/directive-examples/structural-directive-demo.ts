import { Component, signal } from '@angular/core';
import { MyStructuralDirective } from './my-structural.directive';

/*
 * ─── Structural Directive Demo ──────────────────────────────────────────────
 *
 * Shows how to use a custom structural directive:
 *   <ng-template [appMyStructural]="condition">
 *     Content
 *   </ng-template>
 *
 * The directive handles two states:
 *   - Condition true  → calls vcr.createEmbeddedView(templateRef)  → content appears
 *   - Condition false → calls vcr.clear()                          → content removed
 *
 * Equivalent to using *ngIf:
 *   <div *ngIf="condition">Content</div>
 *
 * But this custom directive demonstrates the underlying mechanics that
 * every structural directive uses.
 */

@Component({
  selector: 'app-structural-directive-demo',
  imports: [MyStructuralDirective],
  templateUrl: './structural-directive-demo.html',
  styleUrl: './structural-directive-demo.scss',
})
export class StructuralDirectiveDemo {
  showBox1 = signal(true);
  showBox2 = signal(false);
  showBox3 = signal(true);

  toggle(signal: any): void {
    signal.update((value: boolean) => !value);
  }
}
