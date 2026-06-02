import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-controls-demo',
  imports: [ReactiveFormsModule],
  templateUrl: './controls-demo.html',
  styleUrl: './controls-demo.scss',
})
export class ControlsDemo {
  private readonly formBuilder = inject(FormBuilder);

  // --- Section 1: FormGroup Example ---
  // Uses `new FormGroup` / `new FormControl` directly (instead of FormBuilder)
  // to demonstrate the `nonNullable` option and explicit generic typing.
  //
  // nonNullable: true  → reset() restores the initial value instead of setting null.
  // FormControl<number | null> → explicit generic keeps the type honest when the field is empty.
  readonly profileForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(120),
    ]),
  });

  profileResult: { firstName: string; age: number | null } | null = null;

  submitProfileForm(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.profileResult = this.profileForm.getRawValue();
  }

  // --- Section 2: Standalone FormControl Example ---
  // A FormControl used outside any FormGroup — bound with [formControl] in the template.
  // nonNullable: true ensures reset() goes back to '' rather than null.
  readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  emailResult = '';

  submitEmail(): void {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    this.emailResult = this.emailControl.value;
  }

  // --- Section 3: FormControl state tracking (existing demo) ---
  readonly controlsForm = this.formBuilder.group({
    topic: ['Angular Routing', [Validators.required]],
    level: ['Beginner', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  // ⚠️ computed() does NOT work here because controlsForm.valid/dirty/touched are plain
  //    class properties — not signals. computed() only re-runs when signals change.
  //
  // ✅ Fix: toSignal() + controlsForm.events (Angular 18+ API) converts the observable
  //    stream of ALL control events (TouchedChangeEvent, DirtyChangeEvent, StatusChangeEvent…)
  //    into a signal, so the view updates on every interaction.
  readonly state = toSignal(
    this.controlsForm.events.pipe(
      map(() => ({
        valid: this.controlsForm.valid,
        dirty: this.controlsForm.dirty,
        touched: this.controlsForm.touched,
      }))
    ),
    {
      initialValue: {
        valid: this.controlsForm.valid,
        dirty: this.controlsForm.dirty,
        touched: this.controlsForm.touched,
      },
    }
  );
}
