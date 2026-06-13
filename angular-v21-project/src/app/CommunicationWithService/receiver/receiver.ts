import { Component, inject } from '@angular/core';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-receiver',
  imports: [],
  templateUrl: './receiver.html',
})
export class Receiver {
  messageService = inject(MessageService);
  message: string = 'working or not working';

  ngOnInit() {
    // ⚠️ Non-reactive assignment — reads the service value exactly once at init time.
    // If Sender later updates messageService.currentMessage, this.message will NOT update —
    // it holds a snapshot of whatever the value was when the component was created.
    //
    // This demonstrates the limitation of plain property assignment for shared state.
    // The fix is reactive programming: expose currentMessage as an Observable (Subject /
    // BehaviorSubject) in the service, then subscribe here (or use the async pipe in the
    // template) so the view automatically reflects every future change.
    this.message = this.messageService.currentMessage;
  }
}