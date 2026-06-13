import { Component } from '@angular/core';

@Component({
  selector: 'app-child-item',
  imports: [],
  templateUrl: './child-item.html',
  styleUrl: './child-item.scss',
})
export class ChildItem {
  // Properties accessible by the parent via @ViewChild
  childMessage: string = 'Hello from Child Component!';
  counter: number = 0;

  incrementCounter(): void {
    this.counter++;
    console.log('Counter incremented in child:', this.counter);
  }

  resetCounter(): void {
    this.counter = 0;
    console.log('Counter reset in child');
  }

  // Returns a summary string — parent can call this via @ViewChild reference
  getChildInfo(): string {
    return `Child Component — Counter: ${this.counter}, Message: ${this.childMessage}`;
  }
}
