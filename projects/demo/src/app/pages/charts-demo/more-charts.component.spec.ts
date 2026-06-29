import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import {
  DumbbellChartComponent, LollipopChartComponent, SlopeChartComponent, SankeyChartComponent,
  DumbbellItem, ChartDataPoint, SlopeDataPoint, SankeyNode, SankeyLink
} from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [
    DumbbellChartComponent, LollipopChartComponent, SlopeChartComponent, SankeyChartComponent
  ],
  template: `
    <ngx-dumbbell-chart
      [data]="dumbbellData()"
      [height]="300"
    />
    <ngx-lollipop-chart
      [data]="lollipopData()"
      [orientation]="orientation()"
      [height]="300"
    />
    <ngx-slope-chart
      [data]="slopeData()"
      [height]="300"
    />
    <ngx-sankey-chart
      [nodes]="sankeyNodes()"
      [links]="sankeyLinks()"
      [height]="300"
    />
  `
})
class TestMoreChartsWrapperComponent {
  dumbbellData = signal<DumbbellItem[]>([
    { label: 'A', startValue: 10, endValue: 40 },
    { label: 'B', startValue: 20, endValue: 60 }
  ]);

  lollipopData = signal<ChartDataPoint[]>([
    { label: 'X', value: 50 },
    { label: 'Y', value: 80 }
  ]);
  orientation = signal<'horizontal' | 'vertical'>('horizontal');

  slopeData = signal<SlopeDataPoint[]>([
    { label: 'Alpha', startValue: 40, endValue: 80 },
    { label: 'Beta', startValue: 70, endValue: 30 }
  ]);

  sankeyNodes = signal<SankeyNode[]>([
    { id: 'n1', label: 'Source' },
    { id: 'n2', label: 'Sink' }
  ]);
  sankeyLinks = signal<SankeyLink[]>([
    { source: 'n1', target: 'n2', value: 100 }
  ]);
}

describe('More Chart Components (Dumbbell, Lollipop, Slope, Sankey)', () => {
  let fixture: ComponentFixture<TestMoreChartsWrapperComponent>;
  let hostComponent: TestMoreChartsWrapperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestMoreChartsWrapperComponent,
        DumbbellChartComponent, LollipopChartComponent, SlopeChartComponent, SankeyChartComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestMoreChartsWrapperComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('DumbbellChartComponent', () => {
    it('should create dumbbell chart component', () => {
      const dumbbell = fixture.debugElement.query(By.directive(DumbbellChartComponent));
      expect(dumbbell).toBeTruthy();
    });

    it('should render the correct number of dumbbell rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('.dumbbell-row'));
      expect(rows.length).toBe(2);
    });

    it('should render connecting horizontal lines', () => {
      const bars = fixture.debugElement.queryAll(By.css('.connecting-bar'));
      expect(bars.length).toBe(2);
      expect(bars[0].name).toBe('line');
    });

    it('should render start and end endpoint dots', () => {
      const startDots = fixture.debugElement.queryAll(By.css('.start-dot'));
      const endDots = fixture.debugElement.queryAll(By.css('.end-dot'));
      expect(startDots.length).toBe(2);
      expect(endDots.length).toBe(2);
    });
  });

  describe('LollipopChartComponent', () => {
    it('should create lollipop chart component', () => {
      const lollipop = fixture.debugElement.query(By.directive(LollipopChartComponent));
      expect(lollipop).toBeTruthy();
    });

    it('should render the correct number of lollipops', () => {
      const rows = fixture.debugElement.queryAll(By.css('.lollipop-row'));
      expect(rows.length).toBe(2);
    });

    it('should render lollipop stems and candy dots', () => {
      const stems = fixture.debugElement.queryAll(By.css('.lollipop-stem'));
      const candies = fixture.debugElement.queryAll(By.css('.lollipop-candy'));
      expect(stems.length).toBe(2);
      expect(candies.length).toBe(2);
    });
  });

  describe('SlopeChartComponent', () => {
    it('should create slope chart component', () => {
      const slope = fixture.debugElement.query(By.directive(SlopeChartComponent));
      expect(slope).toBeTruthy();
    });

    it('should render left and right vertical axes lines', () => {
      const axes = fixture.debugElement.queryAll(By.css('.axis-line'));
      // Expect at least two axis lines (left and right)
      expect(axes.length).toBeGreaterThanOrEqual(2);
    });

    it('should render slope lines connecting the stages', () => {
      const lines = fixture.debugElement.queryAll(By.css('.slope-line'));
      expect(lines.length).toBe(2);
    });
  });

  describe('SankeyChartComponent', () => {
    it('should create sankey diagram component', () => {
      const sankey = fixture.debugElement.query(By.directive(SankeyChartComponent));
      expect(sankey).toBeTruthy();
    });

    it('should render node rectangle blocks', () => {
      const nodes = fixture.debugElement.queryAll(By.css('.sankey-node'));
      expect(nodes.length).toBe(2);
      expect(nodes[0].name).toBe('rect');
    });

    it('should render curved link path elements', () => {
      const links = fixture.debugElement.queryAll(By.css('.sankey-link'));
      expect(links.length).toBe(1);
      expect(links[0].name).toBe('path');
    });
  });
});
