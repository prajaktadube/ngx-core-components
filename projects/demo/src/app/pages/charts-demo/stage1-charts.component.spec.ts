import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ViolinPlotComponent, ViolinItem } from 'ngx-core-components/charts';
import { RidgelineChartComponent, RidgelineItem } from 'ngx-core-components/charts';
import { ParetoChartComponent, ParetoItem } from 'ngx-core-components/charts';
import { MarimekkoChartComponent, MarimekkoItem } from 'ngx-core-components/charts';

describe('Stage 1 Chart Components', () => {

  // 1. Violin Plot tests
  describe('ViolinPlotComponent', () => {
    let component: ViolinPlotComponent;
    let fixture: ComponentFixture<ViolinPlotComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ViolinPlotComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(ViolinPlotComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render correct number of violin elements', () => {
      const mockData: ViolinItem[] = [
        { label: 'Control', values: [10, 12, 11, 14, 15, 12, 13] },
        { label: 'Test', values: [15, 17, 16, 19, 20, 18, 17] }
      ];
      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      const paths = fixture.nativeElement.querySelectorAll('.violin-path');
      expect(paths.length).toBe(2);

      const whiskerLines = fixture.nativeElement.querySelectorAll('.whisker-line');
      expect(whiskerLines.length).toBe(2);

      const boxRects = fixture.nativeElement.querySelectorAll('.box-rect');
      expect(boxRects.length).toBe(2);
    });

    it('should fallback gracefully when data is empty', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();

      const paths = fixture.nativeElement.querySelectorAll('.violin-path');
      expect(paths.length).toBe(0);
    });
  });

  // 2. Ridgeline Chart tests
  describe('RidgelineChartComponent', () => {
    let component: RidgelineChartComponent;
    let fixture: ComponentFixture<RidgelineChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [RidgelineChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(RidgelineChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render stacked baseline rows and density shapes', () => {
      const mockData: RidgelineItem[] = [
        { label: 'Month 1', values: [5, 8, 7, 10, 12] },
        { label: 'Month 2', values: [7, 9, 11, 13, 15] }
      ];
      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      const baselines = fixture.nativeElement.querySelectorAll('.row-baseline');
      expect(baselines.length).toBe(2);

      const areas = fixture.nativeElement.querySelectorAll('.density-area');
      expect(areas.length).toBe(2);

      const lines = fixture.nativeElement.querySelectorAll('.density-line');
      expect(lines.length).toBe(2);
    });
  });

  // 3. Pareto Chart tests
  describe('ParetoChartComponent', () => {
    let component: ParetoChartComponent;
    let fixture: ComponentFixture<ParetoChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ParetoChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(ParetoChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should sort values descending and draw frequency bars and cumulative dots', () => {
      const mockData: ParetoItem[] = [
        { label: 'Category B', value: 40 },
        { label: 'Category A', value: 100 },
        { label: 'Category C', value: 10 }
      ];
      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      const items = component.computedItems();
      expect(items[0].label).toBe('Category A');
      expect(items[1].label).toBe('Category B');
      expect(items[2].label).toBe('Category C');

      // Check bar rect elements
      const bars = fixture.nativeElement.querySelectorAll('.pareto-bar');
      expect(bars.length).toBe(3);

      // Check cumulative line nodes
      const dots = fixture.nativeElement.querySelectorAll('.pareto-dot');
      expect(dots.length).toBe(3);
    });
  });

  // 4. Marimekko Chart tests
  describe('MarimekkoChartComponent', () => {
    let component: MarimekkoChartComponent;
    let fixture: ComponentFixture<MarimekkoChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MarimekkoChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(MarimekkoChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should scale columns by total width and segments by stacked height', () => {
      const mockData: MarimekkoItem[] = [
        {
          label: 'Market A',
          segments: [
            { name: 'Product 1', value: 50 },
            { name: 'Product 2', value: 50 }
          ]
        },
        {
          label: 'Market B',
          segments: [
            { name: 'Product 1', value: 200 },
            { name: 'Product 2', value: 100 }
          ]
        }
      ];
      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      // Market A has total 100, Market B has total 300. Grand Total = 400.
      // Market A width is 25% of container width, Market B width is 75% of container width.
      const cols = component.computedCols();
      expect(cols[0].width).toBeCloseTo(component.innerW() * 0.25, 0);
      expect(cols[1].width).toBeCloseTo(component.innerW() * 0.75, 0);

      const segments = fixture.nativeElement.querySelectorAll('.marimekko-segment');
      expect(segments.length).toBe(4);
    });
  });
});
