import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  // standalone: true  ← not needed in Angular 19+
  imports: [],
  templateUrl: './child.html',
  styles: ``,
})
export class Child {
  @Input() parentMessage: string = '';

  @Output() childEvent = new EventEmitter<string>();

  sendToParent(): void {
    this.childEvent.emit('Hello from Child Component!');
  }
}
