import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-controls-demo',
  imports: [ReactiveFormsModule],
  templateUrl: './controls-demo.html',
  styleUrl: './controls-demo.scss',
})
export class ControlsDemo {
  private readonly formBuilder = inject(FormBuilder);

  readonly controlsForm = this.formBuilder.group({
    topic: ['Angular Routing', [Validators.required]],
    level: ['Beginner', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  readonly state = computed(() => ({
    valid: this.controlsForm.valid,
    dirty: this.controlsForm.dirty,
    touched: this.controlsForm.touched,
  }));
}
