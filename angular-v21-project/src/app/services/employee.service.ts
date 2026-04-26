import { Injectable } from '@angular/core';

export interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  email: string;
  salary: number;
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', role: 'Senior Developer', email: 'alice@company.com', salary: 95000, status: 'Active' },
    { id: 2, name: 'Bob Smith', department: 'Design', role: 'UI/UX Designer', email: 'bob@company.com', salary: 78000, status: 'Active' },
    { id: 3, name: 'Carol White', department: 'Engineering', role: 'Tech Lead', email: 'carol@company.com', salary: 115000, status: 'Active' },
    { id: 4, name: 'David Brown', department: 'Marketing', role: 'Marketing Manager', email: 'david@company.com', salary: 82000, status: 'Inactive' },
    { id: 5, name: 'Eva Martinez', department: 'HR', role: 'HR Specialist', email: 'eva@company.com', salary: 68000, status: 'Active' },
    { id: 6, name: 'Frank Lee', department: 'Engineering', role: 'Junior Developer', email: 'frank@company.com', salary: 62000, status: 'Active' },
    { id: 7, name: 'Grace Kim', department: 'Finance', role: 'Financial Analyst', email: 'grace@company.com', salary: 88000, status: 'Active' },
    { id: 8, name: 'Henry Wilson', department: 'Marketing', role: 'Content Strategist', email: 'henry@company.com', salary: 71000, status: 'Inactive' },
  ];

  getEmployees(): Employee[] {
    return this.employees;
  }
}
