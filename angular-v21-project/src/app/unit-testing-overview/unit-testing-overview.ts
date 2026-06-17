import { Component } from '@angular/core';

/*
 * ─── Unit Testing Overview ──────────────────────────────────────────────────
 *
 * A reference component showing Vitest + Angular testing patterns.
 * Tests themselves live in *.spec.ts files (not here in the browser).
 *
 * Run all tests:          npm test
 * Run one spec file:      npx vitest run src/app/app.spec.ts
 */
@Component({
  selector: 'app-unit-testing-overview',
  imports: [],
  templateUrl: './unit-testing-overview.html',
  styleUrl: './unit-testing-overview.scss',
})
export class UnitTestingOverview {}
