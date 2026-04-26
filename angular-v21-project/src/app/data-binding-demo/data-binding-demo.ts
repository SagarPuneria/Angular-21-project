import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterViewInit,
  AfterContentInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-binding-demo',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-binding-demo.html',
  styleUrl: './data-binding-demo.scss',
})
export class DataBindingDemo 
  implements OnInit, OnDestroy, OnChanges, AfterViewInit, AfterContentInit
{
  // Properties for Interpolation
  title = 'Angular Data Binding Demo';
  userName = 'John Doe';
  currentDate = new Date();

  // Properties for Property Binding
  imageUrl = 'https://angular.io/assets/images/logos/angular/angular.png';
  imageAlt = 'Angular red shield icon';
  isButtonDisabled = false;
  dynamicClass = 'highlight';
  dynamicStyles = { color: 'blue', fontSize: '18px' };

  // Properties for Event Binding
  clickCount = 0;
  mousePosition = { x: 0, y: 0 };
  inputValue = 'abc';

  // Properties for Two-way Data Binding
  userInput = 'Initial text123';
  selectedOption = 'option1';
  isChecked = false;

  // Arrays for demonstration
  fruits = ['Apple', 'Banana', 'Orange', 'Mango'];
  users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
    { id: 2, name: 'Bob', email: 'bob@example.com', active: false },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', active: true },
  ];

  // Lifecycle hook demonstrations
  lifecycleEvents: string[] = [];

  constructor() {
    this.addLifecycleEvent('Constructor called');
  }

  // Lifecycle Hooks
  ngOnInit(): void {
    this.addLifecycleEvent('ngOnInit: Component initialized');
    console.log('DataBindingDemo: ngOnInit called');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.addLifecycleEvent('ngOnChanges: Input properties changed');
    console.log('DataBindingDemo: ngOnChanges called', changes);
  }

  ngAfterContentInit(): void {
    this.addLifecycleEvent('ngAfterContentInit: Content initialized');
    console.log('DataBindingDemo: ngAfterContentInit called');
  }

  ngAfterViewInit(): void {
    this.addLifecycleEvent('ngAfterViewInit: View initialized');
    console.log('DataBindingDemo: ngAfterViewInit called');
  }

  ngOnDestroy(): void {
    this.addLifecycleEvent('ngOnDestroy: Component destroyed');
    console.log('DataBindingDemo: ngOnDestroy called');
  }

  // Event handler methods for Event Binding
  onButtonClick(): void {
    this.clickCount++;
    this.addLifecycleEvent(`Button clicked ${this.clickCount} times`);
  }

  onMouseMove(event: MouseEvent): void {
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    // this.inputValue = target.value;
  }

  onKeyUp(event: KeyboardEvent): void {
    console.log('Key pressed:', event.key);
  }

  onFocus(): void {
    console.log('Input focused');
  }

  onBlur(): void {
    console.log('Input blurred');
  }

  // Methods for demonstration
  toggleButtonState(): void {
    this.isButtonDisabled = !this.isButtonDisabled;
  }

  changeStyle(): void {
    this.dynamicStyles = {
      color: this.dynamicStyles.color === 'blue' ? 'red' : 'blue',
      fontSize: this.dynamicStyles.fontSize === '18px' ? '24px' : '18px',
    };
  }

  addUser(): void {
    const newUser = {
      id: this.users.length + 1,
      name: `User ${this.users.length + 1}`,
      email: `user${this.users.length + 1}@example.com`,
      active: true,
    };
    this.users.push(newUser);
  }

  removeUser(id: number): void {
    this.users = this.users.filter((user) => user.id !== id);
    /* const excludeById = (user: { id: number }) => user.id !== id;
    this.users = this.users.filter(excludeById); */
  }

  toggleUserStatus(user: any): void {
    user.active = !user.active;
  }

  // Helper methods
  addLifecycleEvent(event: string): void {
    this.lifecycleEvents.push(`${new Date().toLocaleTimeString()}: ${event}`);
  }

  clearLifecycleEvents(): void {
    this.lifecycleEvents = [];
  }

  // Method for interpolation demonstration
  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  // Method for calculating values
  getMultipliedValue(value: number, multiplier: number): number {
    return value * multiplier;
  }

  // Conditional methods
  isEven(num: number): boolean {
    return num % 2 === 0;
  }

  // TrackBy function for ngFor performance
  trackByUserId(index: number, user: any): number {
    return user.id;
  }
}
