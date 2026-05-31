import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComboChartComponent, ScatterPlotComponent, ChartSeries, ScatterPoint } from 'ngx-core-components';
import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [ComboChartComponent, ScatterPlotComponent],
  template: `
    <ngx-combo-chart
      [barSeries]="barSeries()"
      [lineSeries]="lineSeries()"
      [categories]="categories()"
    />
    <ngx-scatter-plot
      [data]="scatterData()"
    />
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
}

describe('Advanced Chart Components', () => {
  let fixture: ComponentFixture<TestChartsWrapperComponent>;
  let comboComponent: ComboChartComponent;
  let scatterComponent: ScatterPlotComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestChartsWrapperComponent, ComboChartComponent, ScatterPlotComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestChartsWrapperComponent);
    fixture.detectChanges();

    comboComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof ComboChartComponent
    ).componentInstance as ComboChartComponent;

    scatterComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof ScatterPlotComponent
    ).componentInstance as ScatterPlotComponent;
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
});
