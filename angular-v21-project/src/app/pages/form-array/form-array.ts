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
    name:     ['', [Validators.required]],
    email:    ['', [Validators.required, Validators.email]],
    attendee: ['', [Validators.required]],
    // phoneNumbers is a FormArray of FormGroups — each entry has `number` + `type`.
    // This demonstrates a nested structure: FormArray → FormGroup → FormControl
    phoneNumbers: this.formBuilder.array([this.createPhoneNumber()]),
    skills: this.formBuilder.array([
      this.formBuilder.control('', [Validators.required, Validators.minLength(2)]),
    ]),
  });

  // 📖 Equivalent without FormBuilder (verbose — for learning)
  /* readonly skillsForm = new FormGroup({
    name:  new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    attendee: new FormControl('', [Validators.required]),
    phoneNumbers: new FormArray([
      new FormGroup({
        number: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
        type:   new FormControl('mobile', Validators.required),
      })
    ]),
    skills: new FormArray([
        new FormControl('', [Validators.required, Validators.minLength(2)])
    ])
  }); */

  // --- Phone Numbers (FormArray of FormGroups) ---

  // Factory method: produces a fresh FormGroup for one phone entry.
  // Called both at initialisation and whenever "+ Add Phone" is clicked.
  createPhoneNumber(): FormGroup {
    return this.formBuilder.group({
      number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      type:   ['mobile', Validators.required],
    });
  }

  get phoneNumbers(): FormArray {
    return this.skillsForm.get('phoneNumbers') as FormArray;
  }

  // Returns a typed FormGroup instead of AbstractControl so the template
  // can use [formGroup]="phoneGroup(i)" without $any() casts.
  phoneGroup(index: number): FormGroup {
    return this.phoneNumbers.at(index) as FormGroup;
  }

  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneNumber());
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  // --- Skills (FormArray of FormControls) ---

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
    this.skillsForm.patchValue({ name: 'Sagar Puneria', email: 'sagar.puneria@gmail.com', attendee: 'Sagar Puneria' });
    this.phoneNumbers.clear();
    for (const phone of [
      { number: '8978697470', type: 'mobile' },
      { number: '8074443909', type: 'work' },
    ]) {
      const group = this.createPhoneNumber();
      group.patchValue(phone);
      this.phoneNumbers.push(group);
    }
    this.skills.clear();
    for (const skill of ['Angular', 'TypeScript', 'RxJS']) {
      this.skills.push(this.formBuilder.control(skill, [Validators.required, Validators.minLength(2)]));
    }
  }
}
