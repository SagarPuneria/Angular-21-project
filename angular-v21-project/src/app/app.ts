import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataBindingDemo } from "./data-binding-demo/data-binding-demo";
import { Child } from './child/child';
import { DataBinding } from './data-binding/data-binding';

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [DataBindingDemo, Child, DataBinding]
})
export class App {
  protected readonly title = signal('angular-v21-project');

  messageToChild = 'Hello from Parent!';
  messageFromChild = '';

  onChildEvent(message: string): void {
    this.messageFromChild = message;
  }
}
