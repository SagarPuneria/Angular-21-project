import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBindingDemo } from './data-binding-demo';

describe('DataBindingDemo', () => {
  let component: DataBindingDemo;
  let fixture: ComponentFixture<DataBindingDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBindingDemo],
    }).compileComponents();

    fixture = TestBed.createComponent(DataBindingDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
