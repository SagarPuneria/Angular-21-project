import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChildItem } from './child-item/child-item';

/*
 * ─── @ViewChild — What it is and why it exists ────────────────────────────────
 *
 * @ViewChild gives a parent component a direct TypeScript reference to a child
 * component instance rendered in its template. Once you have that reference, you
 * can read the child's public properties and call its public methods imperatively.
 *
 * How it works:
 *   1. Angular renders the parent template (creates the child component instance).
 *   2. After the view is fully initialized, Angular resolves the @ViewChild query
 *      and assigns the child instance to the decorated property.
 *   3. The earliest safe point to use the reference is ngAfterViewInit().
 *      Reading it before that (e.g. in ngOnInit) returns undefined.
 *
 * Syntax:
 *   @ViewChild(ChildItem) childComponent!: ChildItem;
 *   //          ↑ token              ↑ non-null assertion (safe after AfterViewInit)
 *
 * Token options:
 *   @ViewChild(ChildItem)        — matches by component/directive class
 *   @ViewChild('myRef')          — matches by template reference variable (#myRef)
 *   @ViewChild(ElementRef)       — matches the host element
 *
 * When to use @ViewChild vs input()/output():
 *   input() / output()  — for planned, declarative parent ↔ child communication.
 *   @ViewChild          — for imperative access: calling child methods, reading
 *                         child state, or integrating with third-party child components
 *                         that don't expose inputs/outputs for everything you need.
 *
 * Modern alternative — viewChild() signal query (Angular 17+):
 *   readonly childComponent = viewChild(ChildItem); // Signal<ChildItem | undefined>
 *   readonly childComponentReq = viewChild.required(ChildItem); // Signal<ChildItem>
 *   Both are available in Angular 21 via import { viewChild } from '@angular/core'.
 *   The signal-based query integrates with the signal graph; @ViewChild does not.
 */

@Component({
  selector: 'app-view-child-example',
  imports: [ChildItem],
  templateUrl: './view-child-example.html',
  styleUrl: './view-child-example.scss',
})
export class ViewChildExample implements AfterViewInit {
  // @ViewChild query — resolved after the view is initialized.
  // The '!' (definite assignment assertion) tells TypeScript this will be set by Angular.
  @ViewChild(ChildItem) childComponent!: ChildItem;

  // Stores results of imperative reads from the child — displayed in the template.
  parentMessage: string = '';
  childInfo: string = '';

  ngAfterViewInit(): void {
    // Safe to access childComponent here — Angular has already rendered the child.
    console.log('Child component loaded:', this.childComponent);
    console.log('Initial child message:', this.childComponent.childMessage);
  }

  // ─── Parent-triggered child operations ──────────────────────────────────
  // Each method guards with `if (this.childComponent)` in case the view hasn't
  // rendered yet (e.g. if the child is inside an @if that starts as false).

  incrementChildCounter(): void {
    if (this.childComponent) {
      this.childComponent.incrementCounter();
    }
  }

  resetChildCounter(): void {
    if (this.childComponent) {
      this.childComponent.resetCounter();
    }
  }

  readChildMessage(): void {
    if (this.childComponent) {
      this.parentMessage = this.childComponent.childMessage;
    }
  }

  getChildInfo(): void {
    if (this.childComponent) {
      this.childInfo = this.childComponent.getChildInfo();
    }
  }
}
