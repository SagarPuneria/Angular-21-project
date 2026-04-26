import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { EmployeeService, Employee } from '../services/employee.service';

@Component({
  selector: 'app-data-binding',
  imports: [CurrencyPipe],
  templateUrl: './data-binding.html',
  styleUrl: './data-binding.scss',
})
export class DataBinding implements OnInit {

  /* // Old approach(Before Angular 14) — constructor required
  constructor(private employeeService: EmployeeService) {} */

  // Modern approach(Angular 14+) — no constructor needed
  private employeeService = inject(EmployeeService);

  employees: Employee[] = [];

  ngOnInit(): void {
    this.employees = this.employeeService.getEmployees();
  }
}
