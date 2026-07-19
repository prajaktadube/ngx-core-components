import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GaugeChartComponent, GaugeThreshold } from './gauge-chart.component';

describe('GaugeChartComponent', () => {
  let component: GaugeChartComponent;
  let fixture: ComponentFixture<GaugeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GaugeChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(GaugeChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 65);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render SVG canvas', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should render the progress arc', () => {
    const paths = fixture.nativeElement.querySelectorAll('.progress-arc');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should display the value in the center badge', () => {
    const badge = fixture.nativeElement.querySelector('.gauge-value');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('65');
  });

  it('should display label when provided', () => {
    fixture.componentRef.setInput('label', 'CPU Usage');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.gauge-label');
    expect(label).toBeTruthy();
    expect(label.textContent).toContain('CPU Usage');
  });

  it('should not display label when not provided', () => {
    expect(fixture.nativeElement.querySelector('.gauge-label')).toBeNull();
  });

  it('should render needle when showNeedle is true', fakeAsync(() => {
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    const needle = fixture.nativeElement.querySelector('.gauge-needle-group');
    expect(needle).toBeTruthy();
  }));

  it('should hide needle when showNeedle is false', () => {
    fixture.componentRef.setInput('showNeedle', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.gauge-needle-group')).toBeNull();
  });

  it('should apply correct gauge color from thresholds', () => {
    const thresholds: GaugeThreshold[] = [
      { value: 30, color: '#22c55e' },
      { value: 70, color: '#eab308' },
      { value: 100, color: '#ef4444' },
    ];
    fixture.componentRef.setInput('thresholds', thresholds);
    fixture.componentRef.setInput('value', 65);
    fixture.detectChanges();
    // 65 falls in the 70 threshold bracket → yellow
    expect(component.gaugeColor()).toBe('#eab308');
  });

  it('should show tooltip on hover', () => {
    const wrapper = fixture.nativeElement.querySelector('.ngx-gauge-wrapper');
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(component.hovered()).toBe(true);
    const tooltip = fixture.nativeElement.querySelector('.chart-tooltip');
    expect(tooltip).toBeTruthy();
  });

  it('should hide tooltip on mouseleave', () => {
    component.hovered.set(true);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.ngx-gauge-wrapper');
    wrapper.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(component.hovered()).toBe(false);
  });
});
