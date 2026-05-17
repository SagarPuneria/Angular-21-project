import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enroll',
  imports: [FormsModule],
  templateUrl: './enroll.html',
  styleUrl: './enroll.scss',
})
export class Enroll {
  name = signal('');
  email = signal('');
  course = signal('');
  submitted = signal(false);

  submit(): void {
    if (this.name() && this.email() && this.course()) {
      this.submitted.set(true);
    }
  }

  reset(): void {
    this.name.set('');
    this.email.set('');
    this.course.set('');
    this.submitted.set(false);
  }
}
