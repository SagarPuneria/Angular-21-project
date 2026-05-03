import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MessageService {
  currentMessage: string = '';

  updateMessage(msg: string): void {
    this.currentMessage = msg;
  }
}
