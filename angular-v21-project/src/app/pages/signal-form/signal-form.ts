import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-signal-form',
  imports: [],
  templateUrl: './signal-form.html',
  styleUrl: './signal-form.scss',
})
export class SignalForm {
  // ─── Form field signals ───────────────────────────────────────────────────
  // Each field is a plain signal — no FormControl, no FormGroup, no DI needed.
  // Angular's change detection only runs when a signal value actually changes.
  readonly name     = signal('');
  readonly email    = signal('');
  readonly password = signal('');

  // Tracks which fields the user has interacted with (blur = touched).
  // Grouped in a single object signal to avoid three separate signals.
  readonly touched = signal({ name: false, email: false, password: false });

  // ─── Validation signals (computed) ───────────────────────────────────────
  // computed() re-evaluates automatically whenever the signal it reads changes.
  // Returns a string error message or null (valid).

  readonly nameError = computed(() => {
    const v = this.name().trim();
    if (!v) return 'Name is required.';
    if (v.length < 2) return 'Name must be at least 2 characters.';
    return null;
  });

  readonly emailError = computed(() => {
    const v = this.email().trim();
    if (!v) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return null;
  });

  readonly passwordError = computed(() => {
    const v = this.password();
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    return null;
  });

  // ─── Derived form state ───────────────────────────────────────────────────
  // formValid reads three computed signals — re-evaluates only when any changes.
  readonly formValid = computed(
    () => !this.nameError() && !this.emailError() && !this.passwordError(),
  );

  // passwordStrength: 0 (empty) → 4 (strong), based on four criteria.
  readonly passwordStrength = computed(() => {
    const v = this.password();
    if (!v) return 0;
    let score = 0;
    if (v.length >= 8)           score++; // length
    if (/[A-Z]/.test(v))         score++; // uppercase
    if (/[0-9]/.test(v))         score++; // digit
    if (/[^A-Za-z0-9]/.test(v)) score++; // special char
    return score;
  });

  readonly passwordStrengthLabel = computed(() => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;
    return labels[this.passwordStrength()];
  });

  // ─── Submission state ─────────────────────────────────────────────────────
  readonly submitted    = signal(false);
  readonly submittedData = signal<{ name: string; email: string; password: string } | null>(null);

  // ─── Methods ──────────────────────────────────────────────────────────────
  // Each (input) handler extracts the value and sets the corresponding signal.
  updateName(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  updateEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  updatePassword(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  // Called on (blur) — marks a field as touched so errors become visible.
  markTouched(field: 'name' | 'email' | 'password'): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  onSubmit(): void {
    // Mark all fields touched so all errors surface on submit attempt.
    this.touched.set({ name: true, email: true, password: true });
    if (!this.formValid()) return;

    this.submittedData.set({
      name:     this.name(),
      email:    this.email(),
      password: this.password(),
    });
    this.submitted.set(true);
  }

  reset(): void {
    this.name.set('');
    this.email.set('');
    this.password.set('');
    this.touched.set({ name: false, email: false, password: false });
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
