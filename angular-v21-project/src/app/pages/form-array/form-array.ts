import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-array',
  imports: [ReactiveFormsModule],
  templateUrl: './form-array.html',
  styleUrls: ['./form-array.scss'],
})
export class FormArrayExample {
  private readonly formBuilder = inject(FormBuilder);

  // FormBuilder vs FormGroup — they are NOT the same:
  //
  // FormGroup  → the actual form MODEL (holds controls, tracks value/status).
  // FormBuilder → an injectable HELPER SERVICE that produces FormGroup/FormArray/FormControl
  //               instances with less boilerplate. It is only used at construction time;
  //               after that you interact with the FormGroup directly.
  //
  // Both approaches below produce the identical runtime result:

  // ✅ Using FormBuilder (shorthand — preferred)
  readonly skillsForm = this.formBuilder.group({
    attendee: ['', [Validators.required]],
    skills: this.formBuilder.array([
      this.formBuilder.control('', [Validators.required, Validators.minLength(2)]),
    ]),
  });

  // 📖 Equivalent without FormBuilder (verbose — for learning)
  /* readonly skillsForm = new FormGroup({
    attendee: new FormControl('', [Validators.required]),
    skills: new FormArray([
        new FormControl('', [Validators.required, Validators.minLength(2)])
    ])
  }); */

  get skills(): FormArray {
    return this.skillsForm.get('skills') as FormArray;
  }

  // AbstractControl is the base class in Angular's form system.
  // FormControl, FormGroup, and FormArray all extend AbstractControl:
  //   AbstractControl
  //   ├── FormControl  — holds a single value (string, boolean, etc.)
  //   ├── FormGroup    — holds a keyed object of controls
  //   └── FormArray    — holds an indexed array of controls
  //
  // skills.controls is typed as AbstractControl[] because the array could hold any mix.
  // Since we only push FormControl instances here, narrowing with `as FormControl` is safe.
  skillControl(index: number): FormControl {
    return this.skills.at(index) as FormControl;
  }

  addSkill(): void {
    this.skills.push(this.formBuilder.control('', [Validators.required, Validators.minLength(2)]));
  }

  removeSkill(index: number): void {
    if (this.skills.length > 1) {
      this.skills.removeAt(index);
    }
  }

  loadDemoData(): void {
    this.skillsForm.patchValue({ attendee: 'Chandishwar Chittimalla' });
    this.skills.clear();
    for (const skill of ['Angular', 'TypeScript', 'RxJS']) {
      this.skills.push(this.formBuilder.control(skill, [Validators.required, Validators.minLength(2)]));
    }
  }
}
