import { Component, inject } from '@angular/core';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-receiver',
  imports: [],
  templateUrl: './receiver.html',
})
export class Receiver {
  messageService = inject(MessageService);
}
