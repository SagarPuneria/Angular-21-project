import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationDataService } from '../../services/registration-data.service';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  private readonly router = inject(Router);
  private readonly registrationDataService = inject(RegistrationDataService);

  readonly data = this.registrationDataService.data;
  readonly hasData = computed(() => !!this.data());

  edit(): void {
    void this.router.navigate(['/register']);
  }

  clear(): void {
    this.registrationDataService.clearData();
  }
}
