import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/*
 * ─── Custom Structural Directive ────────────────────────────────────────────
 *
 * A structural directive modifies the DOM structure by:
 *   1. Accepting a TemplateRef — metadata about the template content
 *   2. Using ViewContainerRef to stamp it into the DOM (createEmbeddedView)
 *      or clear it (clear)
 *
 * Syntax:
 *   <ng-template appMyStructural [appMyStructural]="condition">
 *     Content to show/hide
 *   </ng-template>
 *
 * How it works:
 *   - Angular automatically wraps the content in <ng-template>
 *   - The directive receives TemplateRef and ViewContainerRef via constructor
 *   - The @Input property appMyStructural receives the condition
 *   - When condition is true, createEmbeddedView(tpl) stamps it
 *   - When condition is false, clear() removes it from DOM
 *
 * Compare to *ngIf:
 *   *ngIf is syntactic sugar for the same pattern:
 *     <div *ngIf="condition">...</div>
 *   is equivalent to:
 *     <ng-template [ngIf]="condition"><div>...</div></ng-template>
 */

@Directive({
  selector: '[appMyStructural]',
  standalone: true,
})
export class MyStructuralDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private vcr: ViewContainerRef
  ) {}

  @Input() set appMyStructural(condition: boolean) {
    if (condition && !this.hasView) {
      // Condition became true — stamp the template into the DOM
      this.vcr.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!condition && this.hasView) {
      // Condition became false — remove from DOM
      this.vcr.clear();
      this.hasView = false;
    }
  }
}
