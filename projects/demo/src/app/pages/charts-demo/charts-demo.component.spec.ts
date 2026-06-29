import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  ComboChartComponent, ScatterPlotComponent, BarChartComponent,
  LineChartComponent, PieChartComponent, BubbleChartComponent, SunburstChartComponent,
  ChartSeries, ScatterPoint, ChartDataPoint, BubblePoint, SunburstNode
} from 'ngx-core-components';
import { Component, signal, TemplateRef } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [
    ComboChartComponent, ScatterPlotComponent,
    BarChartComponent, LineChartComponent, PieChartComponent,
    BubbleChartComponent, SunburstChartComponent
  ],
  template: `
    <ngx-combo-chart
      [barSeries]="barSeries()"
      [lineSeries]="lineSeries()"
      [categories]="categories()"
    />
    <ngx-scatter-plot
      [data]="scatterData()"
    />
    <ngx-bar-chart
      [series]="barSeries()"
      [categories]="categories()"
      [showExport]="showExport()"
      [referenceLines]="referenceLines()"
      [labelFormatter]="labelFormatter()"
      [tooltipTemplate]="customTooltip"
      (barClick)="onBarClick($event)"
    />
    <ngx-line-chart
      [series]="lineSeries()"
      [categories]="categories()"
      [showExport]="showExport()"
      [referenceLines]="referenceLines()"
      [labelFormatter]="labelFormatter()"
      [tooltipTemplate]="customTooltip"
      (pointClick)="onPointClick($event)"
    />
    <ngx-pie-chart
      [data]="pieData()"
      [showExport]="showExport()"
    />
    <ngx-bubble-chart
      [data]="bubbleData()"
      [showExport]="showExport()"
    />
    <ngx-sunburst-chart
      [data]="sunburstData()"
      [showExport]="showExport()"
    />

    <ng-template #customTooltip let-t>
      <div class="custom-test-tooltip">
        <span class="custom-test-cat">{{ t.cat }}</span>
      </div>
    </ng-template>
  `
})
class TestChartsWrapperComponent {
  barSeries = signal<ChartSeries[]>([
    { name: 'Revenue', data: [100, 200] }
  ]);
  lineSeries = signal<ChartSeries[]>([
    { name: 'Margin', data: [10, 20] }
  ]);
  categories = signal<string[]>(['Jan', 'Feb']);

  scatterData = signal<ScatterPoint[]>([
    { x: 10, y: 50, label: 'A', group: 'G1' },
    { x: 20, y: 100, label: 'B', group: 'G2' }
  ]);

  pieData = signal<ChartDataPoint[]>([
    { label: 'A', value: 30 },
    { label: 'B', value: 70 }
  ]);

  bubbleData = signal<BubblePoint[]>([
    { x: 10, y: 30, z: 150, label: 'App A', group: 'Tech' },
    { x: 25, y: 45, z: 280, label: 'App B', group: 'Tech' }
  ]);

  sunburstData = signal<SunburstNode[]>([
    {
      label: 'North America',
      children: [
        { label: 'USA', value: 100 }
      ]
    }
  ]);

  showExport = signal(true);

  referenceLines = signal<any[]>([
    { value: 150, label: 'Target', color: '#10b981' }
  ]);
  labelFormatter = signal<(v: number) => string>((v: number) => `Formatted:${v}`);
  
  clickedEvent = signal<any>(null);
  onBarClick(event: any) {
    this.clickedEvent.set(event);
  }
  onPointClick(event: any) {
    this.clickedEvent.set(event);
  }
}

describe('Advanced Chart Components', () => {
  let fixture: ComponentFixture<TestChartsWrapperComponent>;
  let comboComponent: ComboChartComponent;
  let scatterComponent: ScatterPlotComponent;
  let barComponent: BarChartComponent;
  let lineComponent: LineChartComponent;
  let pieComponent: PieChartComponent;
  let bubbleComponent: BubbleChartComponent;
  let sunburstComponent: SunburstChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestChartsWrapperComponent, ComboChartComponent, ScatterPlotComponent,
        BarChartComponent, LineChartComponent, PieChartComponent,
        BubbleChartComponent, SunburstChartComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestChartsWrapperComponent);
    fixture.detectChanges();

    comboComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof ComboChartComponent
    ).componentInstance as ComboChartComponent;

    scatterComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof ScatterPlotComponent
    ).componentInstance as ScatterPlotComponent;

    barComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof BarChartComponent
    ).componentInstance as BarChartComponent;

    lineComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof LineChartComponent
    ).componentInstance as LineChartComponent;

    pieComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof PieChartComponent
    ).componentInstance as PieChartComponent;

    bubbleComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof BubbleChartComponent
    ).componentInstance as BubbleChartComponent;

    sunburstComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof SunburstChartComponent
    ).componentInstance as SunburstChartComponent;
  });

  it('should render combo chart categories and scales', () => {
    expect(comboComponent.categories()).toEqual(['Jan', 'Feb']);
    expect(comboComponent.barSeries()[0].name).toBe('Revenue');
    expect(comboComponent.lineSeries()[0].name).toBe('Margin');
  });

  it('should scale scatter plot points and compute bounds correctly', () => {
    expect(scatterComponent.data().length).toBe(2);
    expect(scatterComponent.xTicks().length).toBeGreaterThan(0);
    expect(scatterComponent.yTicks().length).toBeGreaterThan(0);
  });

  it('should render bar chart and toggle export menu', () => {
    const barDe = fixture.debugElement.query(By.css('ngx-bar-chart'));
    const exportTrigger = barDe.query(By.css('.export-trigger'));
    expect(exportTrigger).toBeTruthy();

    // Toggle menu
    expect(barComponent.exportMenuOpen()).toBeFalse();
    exportTrigger.nativeElement.click();
    fixture.detectChanges();
    expect(barComponent.exportMenuOpen()).toBeTrue();

    // Check menu options exist
    const jsonBtn = barDe.query(By.css('.export-dropdown button:nth-child(1)'));
    const csvBtn = barDe.query(By.css('.export-dropdown button:nth-child(2)'));
    const svgBtn = barDe.query(By.css('.export-dropdown button:nth-child(3)'));
    expect(jsonBtn).toBeTruthy();
    expect(csvBtn).toBeTruthy();
    expect(svgBtn).toBeTruthy();

    // Spy on onExport method
    spyOn(barComponent, 'onExport').and.callThrough();
    spyOn(barComponent, 'exportToJson');
    spyOn(barComponent, 'exportToCsv');
    spyOn(barComponent, 'exportToSvg');

    jsonBtn.nativeElement.click();
    expect(barComponent.onExport).toHaveBeenCalledWith('json');
    expect(barComponent.exportToJson).toHaveBeenCalled();

    csvBtn.nativeElement.click();
    expect(barComponent.onExport).toHaveBeenCalledWith('csv');
    expect(barComponent.exportToCsv).toHaveBeenCalled();

    svgBtn.nativeElement.click();
    expect(barComponent.onExport).toHaveBeenCalledWith('svg');
    expect(barComponent.exportToSvg).toHaveBeenCalled();
  });

  it('should track hover category index and show grouped tooltip in bar chart', () => {
    const barDe = fixture.debugElement.query(By.css('ngx-bar-chart'));
    const chartArea = barDe.query(By.css('.ngx-bar-chart'));

    // Dispatch mousemove event over the chart area
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100
    });
    // Stub getBoundingClientRect on the container so the calculations works
    spyOn(chartArea.nativeElement, 'getBoundingClientRect').and.returnValue({
      left: 10,
      top: 10,
      width: 600,
      height: 240
    } as DOMRect);

    chartArea.nativeElement.dispatchEvent(mouseEvent);
    fixture.detectChanges();

    // Category tracking index should update
    expect(barComponent.activeColumnIndex()).not.toBeNull();
    // Tooltip should be shown
    expect(barComponent.tooltip()).not.toBeNull();
    expect(barDe.query(By.css('.chart-tooltip'))).toBeTruthy();

    // Mouse leave resets focus
    chartArea.triggerEventHandler('mouseleave', null);
    fixture.detectChanges();
    expect(barComponent.activeColumnIndex()).toBeNull();
    expect(barComponent.tooltip()).toBeNull();
  });

  it('should render line-draw classes on line chart paths', () => {
    const lineDe = fixture.debugElement.query(By.css('ngx-line-chart'));
    const paths = lineDe.queryAll(By.css('.line-path'));
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should render slices and support hover and export on pie chart', () => {
    const pieDe = fixture.debugElement.query(By.css('ngx-pie-chart'));
    const slices = pieDe.queryAll(By.css('.pie-slice'));
    expect(slices.length).toBe(2);

    // Spy on hover
    expect(pieComponent.hovered()).toBe(-1);
    slices[0].nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(pieComponent.hovered()).toBe(0);

    slices[0].nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(pieComponent.hovered()).toBe(-1);

    // Toggle export menu
    const exportTrigger = pieDe.query(By.css('.export-trigger'));
    expect(exportTrigger).toBeTruthy();
    exportTrigger.nativeElement.click();
    fixture.detectChanges();
    expect(pieComponent.exportMenuOpen()).toBeTrue();
  });

  it('should render bubbles and handle hover events in bubble chart', () => {
    const bubbleDe = fixture.debugElement.query(By.css('ngx-bubble-chart'));
    const circles = bubbleDe.queryAll(By.css('.bubble-point'));
    expect(circles.length).toBe(2);

    expect(bubbleComponent.hoveredPointIndex()).toBeNull();
    circles[0].nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(bubbleComponent.hoveredPointIndex()).toBe(0);

    circles[0].nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(bubbleComponent.hoveredPointIndex()).toBeNull();
  });

  it('should render paths and compute hierarchy depths in sunburst chart', () => {
    const sunburstDe = fixture.debugElement.query(By.css('ngx-sunburst-chart'));
    const slices = sunburstDe.queryAll(By.css('.sunburst-slice'));
    // 1 root node + 1 child node = 2 slices total
    expect(slices.length).toBe(2);
    expect(sunburstComponent.maxDepth()).toBe(1);

    expect(sunburstComponent.hoveredSliceId()).toBeNull();
    slices[0].nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(sunburstComponent.hoveredSliceId()).not.toBeNull();

    slices[0].nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(sunburstComponent.hoveredSliceId()).toBeNull();
  });

  it('should render reference lines in bar and line charts', () => {
    const barDe = fixture.debugElement.query(By.css('ngx-bar-chart'));
    expect(barComponent.referenceLines().length).toBe(1);
    expect(barComponent.referenceLines()[0].label).toBe('Target');

    const lineDe = fixture.debugElement.query(By.css('ngx-line-chart'));
    expect(lineComponent.referenceLines().length).toBe(1);
    expect(lineComponent.referenceLines()[0].label).toBe('Target');
  });

  it('should format data labels using custom formatter in bar chart', () => {
    expect(barComponent.labelFormatter()).toBeTruthy();
    const formatted = barComponent.labelFormatter()!(100);
    expect(formatted).toBe('Formatted:100');
  });

  it('should trigger click outputs on bar and point clicks', () => {
    const wrapper = fixture.componentInstance;
    wrapper.clickedEvent.set(null);
    
    barComponent.onBarClick(0, 0, 100);
    expect(wrapper.clickedEvent()).toEqual({
      category: 'Jan',
      value: 100,
      seriesName: 'Revenue'
    });

    wrapper.clickedEvent.set(null);
    lineComponent.onPointClick(0, 0, 10);
    expect(wrapper.clickedEvent()).toEqual({
      category: 'Jan',
      value: 10,
      seriesName: 'Margin'
    });
  });
});
