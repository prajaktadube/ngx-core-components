import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { PolarAreaChartComponent, BulletChartComponent, ChartDataPoint } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [PolarAreaChartComponent, BulletChartComponent],
  template: `
    <ngx-polar-area-chart
      [data]="polarData()"
      [showLegend]="showLegend()"
      [showLabels]="showLabels()"
      [height]="300"
      (sliceClick)="onSliceClick($event)"
    />
    <ngx-bullet-chart
      [value]="bulletValue()"
      [target]="bulletTarget()"
      [max]="100"
      [ranges]="[50, 85, 100]"
      [rangeColors]="['#fee2e2', '#fef3c7', '#dcfce7']"
    />
  `
})
class TestWrapperComponent {
  polarData = signal<ChartDataPoint[]>([
    { label: 'Chrome', value: 65, color: '#4f46e5' },
    { label: 'Safari', value: 20, color: '#10b981' },
    { label: 'Firefox', value: 15, color: '#f59e0b' }
  ]);
  showLegend = signal(true);
  showLabels = signal(true);

  bulletValue = signal(75);
  bulletTarget = signal(85);

  clickedSlice: ChartDataPoint | null = null;
  onSliceClick(event: ChartDataPoint) {
    this.clickedSlice = event;
  }
}

describe('New Chart Components', () => {
  let fixture: ComponentFixture<TestWrapperComponent>;
  let hostComponent: TestWrapperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent, PolarAreaChartComponent, BulletChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('PolarAreaChartComponent', () => {
    it('should create polar area chart component', () => {
      const polarChart = fixture.debugElement.query(By.directive(PolarAreaChartComponent));
      expect(polarChart).toBeTruthy();
    });

    it('should render polar area chart slices as paths', () => {
      const slices = fixture.debugElement.queryAll(By.css('.polar-slice'));
      expect(slices.length).toBe(3);
    });

    it('should render concentric circle grid lines', () => {
      const gridCircles = fixture.debugElement.queryAll(By.css('circle'));
      // Expect 4 concentric reference circles
      expect(gridCircles.length).toBe(4);
    });

    it('should emit slice click event', () => {
      const firstSlice = fixture.debugElement.query(By.css('.polar-slice'));
      firstSlice.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      
      expect(hostComponent.clickedSlice).toBeTruthy();
      expect(hostComponent.clickedSlice?.label).toBe('Chrome');
      expect(hostComponent.clickedSlice?.value).toBe(65);
    });
  });

  describe('BulletChartComponent', () => {
    it('should create bullet chart component', () => {
      const bulletChart = fixture.debugElement.query(By.directive(BulletChartComponent));
      expect(bulletChart).toBeTruthy();
    });

    it('should render 3 range backgrounds', () => {
      const ranges = fixture.debugElement.queryAll(By.css('.bullet-range'));
      expect(ranges.length).toBe(3);
      expect(ranges[0].attributes['fill']).toBe('#fee2e2');
      expect(ranges[1].attributes['fill']).toBe('#fef3c7');
      expect(ranges[2].attributes['fill']).toBe('#dcfce7');
    });

    it('should render actual value bar with correct width proportional to value', () => {
      const valueBar = fixture.debugElement.query(By.css('.bullet-value-bar'));
      expect(valueBar).toBeTruthy();
      
      const width = parseFloat(valueBar.attributes['width'] || '0');
      expect(width).toBeGreaterThan(0);
    });

    it('should render target marker line', () => {
      const targetMarker = fixture.debugElement.query(By.css('.bullet-target-marker'));
      expect(targetMarker).toBeTruthy();
      
      const x = parseFloat(targetMarker.attributes['x1'] || '0');
      expect(x).toBeGreaterThan(0);
    });
  });
});
