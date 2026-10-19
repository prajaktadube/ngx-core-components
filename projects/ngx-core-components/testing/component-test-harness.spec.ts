import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxComponentTestHarness } from './component-test-harness';

@Component({
  standalone: true,
  template: '<span>{{ label() }}</span>',
})
class HarnessFixtureComponent {
  label = input('default');
}

describe('NgxComponentTestHarness', () => {
  it('sets signal inputs, detects changes, and queries rendered elements', () => {
    const fixture = TestBed.createComponent(HarnessFixtureComponent);
    const harness = new NgxComponentTestHarness(fixture);
    harness.setInput('label', 'Updated');
    harness.detectChanges();

    expect(harness.instance).toBe(fixture.componentInstance);
    expect(harness.query('span')?.textContent).toBe('Updated');
    expect(harness.queryAll('span').length).toBe(1);
  });
});
