import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationData, RegistrationDataService } from '../../services/registration-data.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly registrationDataService = inject(RegistrationDataService);

  readonly attendanceModes = ['In-Person', 'Online', 'Hybrid'] as const;

  readonly registrationForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    city: ['', [Validators.required]],
    attendanceMode: ['', [Validators.required]],
  });

  showError(controlName: 'fullName' | 'email' | 'city' | 'attendanceMode'): boolean {
    const control = this.registrationForm.controls[controlName];
    return !!(control.invalid && (control.dirty || control.touched));
  }

  loadDemoData(): void {
    this.registrationForm.patchValue({
      fullName: 'Chandishwar Chittimalla',
      email: 'ccchandishwar@gmail.com',
      city: 'Hyderabad',
      attendanceMode: 'Online',
    });
  }

  submit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.registrationForm.getRawValue() as RegistrationData;
    this.registrationDataService.setData(formValue);
    void this.router.navigate(['/summary']);
  }
}