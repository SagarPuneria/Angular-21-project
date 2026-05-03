import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-sender',
  imports: [FormsModule],
  templateUrl: './sender.html',
})
export class Sender {
  messageService = inject(MessageService);
  message: string = '';

  sendMessage(): void {
    this.messageService.updateMessage(this.message);
    this.message = '';
  }
}
