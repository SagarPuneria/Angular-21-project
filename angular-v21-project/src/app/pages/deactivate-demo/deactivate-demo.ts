import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { type HasUnsavedChanges } from '../../auth/can-deactivate.guard';

@Component({
  selector: 'app-deactivate-demo',
  imports: [ReactiveFormsModule],
  templateUrl: './deactivate-demo.html',
  styleUrl: './deactivate-demo.scss',
})
export class DeactivateDemo implements HasUnsavedChanges {
  private fb = inject(FormBuilder);

  form = this.fb.group({ note: [''] });

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }
}
