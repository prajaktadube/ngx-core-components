import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TooltipDirective } from './tooltip.directive';

@Component({
  template: '<div [ngxTooltip]></div>',
  standalone: true,
  imports: [TooltipDirective]
})
class TestComponent {}

describe('TooltipDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, TooltipDirective]
    }).compileComponents();
  });

  it('should create test component', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture).toBeTruthy();
  });
});
