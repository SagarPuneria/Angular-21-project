import { Injectable, signal } from '@angular/core';

export interface RegistrationData {
  fullName: string;
  email: string;
  city: string;
  attendanceMode: 'In-Person' | 'Online' | 'Hybrid' | '';
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationDataService {
  private readonly formData = signal<RegistrationData | null>(null);

  readonly data = this.formData.asReadonly();

  setData(value: RegistrationData): void {
    this.formData.set(value);
  }

  clearData(): void {
    this.formData.set(null);
  }
}
