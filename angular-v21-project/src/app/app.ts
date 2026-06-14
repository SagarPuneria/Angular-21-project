import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataBindingDemo } from "./data-binding-demo/data-binding-demo";
import { Child } from './child/child';
import { DataBinding } from './data-binding/data-binding';
import { Sender } from './CommunicationWithService/sender/sender';
import { Receiver } from './CommunicationWithService/receiver/receiver';
import { SignalParent } from './signal-parent-child/signal-parent/signal-parent';
import { ViewChildExample } from './view-child-example/view-child-example';
import { SubjectExample } from './CommunicationWithService/subject-example/subject-example';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [DataBindingDemo, Child, DataBinding, Sender, Receiver, SignalParent, ViewChildExample, SubjectExample, RouterOutlet, RouterLink, RouterLinkActive]
})
export class App {
  protected readonly title = signal('angular-v21-project');
  auth = inject(AuthService);

  messageToChild = 'Hello from Parent!';
  messageFromChild = '';

  onChildEvent(message: string): void {
    this.messageFromChild = message;
  }
}
