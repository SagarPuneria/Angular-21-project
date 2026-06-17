import { Directive, ViewContainerRef } from '@angular/core';

/*
 * ─── Attribute Directive for Dynamic Component Insertion ─────────────────────
 *
 * This directive marks an insertion point where dynamic components can be
 * created at runtime via createComponent().
 *
 * Usage:
 *   <ng-container appComponentHost></ng-container>
 *   
 *   Then in component:
 *   @ViewChild(ComponentHostDirective) host!: ComponentHostDirective;
 *   
 *   const ref = this.host.vcr.createComponent(MyComponent);
 *
 * Why an attribute directive?
 *   It's a non-intrusive marker that decorates the element without
 *   consuming the template. Any element can receive it.
 *
 * Why expose vcr publicly?
 *   The component needs direct access to ViewContainerRef to call createComponent().
 *   Exposing it on the directive instance is the simplest pattern.
 */

@Directive({
  selector: '[appComponentHost]',
  standalone: true,
})
export class ComponentHostDirective {
  constructor(public vcr: ViewContainerRef) {}
}
