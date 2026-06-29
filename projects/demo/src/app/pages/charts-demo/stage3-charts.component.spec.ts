import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RenkoChartComponent } from 'ngx-core-components/charts';
import { KagiChartComponent } from 'ngx-core-components/charts';
import { PointFigureChartComponent } from 'ngx-core-components/charts';
import { WindRoseChartComponent, WindRoseItem } from 'ngx-core-components/charts';

describe('Stage 3 Chart Components', () => {

  // 1. Renko Chart tests
  describe('RenkoChartComponent', () => {
    let component: RenkoChartComponent;
    let fixture: ComponentFixture<RenkoChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [RenkoChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(RenkoChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render bricks based on price movements exceeding boxSize', () => {
      const mockPrices = [100, 102, 106, 101, 95];
      fixture.componentRef.setInput('data', mockPrices);
      fixture.componentRef.setInput('boxSize', 5);
      fixture.detectChanges();

      const bricks = fixture.nativeElement.querySelectorAll('.renko-brick');
      // From 100 -> 106 (rose to 105, 1 brick up) -> 95 (fell to 100, then 95, 2 bricks down)
      // Total 3 bricks
      expect(bricks.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 2. Kagi Chart tests
  describe('KagiChartComponent', () => {
    let component: KagiChartComponent;
    let fixture: ComponentFixture<KagiChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [KagiChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(KagiChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should calculate and render Kagi segments', () => {
      const mockPrices = [100, 115, 130, 110, 125];
      fixture.componentRef.setInput('data', mockPrices);
      fixture.componentRef.setInput('reversalAmount', 15);
      fixture.detectChanges();

      const lines = fixture.nativeElement.querySelectorAll('.kagi-line');
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });
  });

  // 3. Point & Figure Chart tests
  describe('PointFigureChartComponent', () => {
    let component: PointFigureChartComponent;
    let fixture: ComponentFixture<PointFigureChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PointFigureChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(PointFigureChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render shape elements', () => {
      const mockPrices = [100, 112, 124, 108, 120];
      fixture.componentRef.setInput('data', mockPrices);
      fixture.componentRef.setInput('boxSize', 4);
      fixture.componentRef.setInput('reversal', 3);
      fixture.detectChanges();

      const cells = fixture.nativeElement.querySelectorAll('.pf-cell-group');
      expect(cells.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 4. Wind Rose Chart tests
  describe('WindRoseChartComponent', () => {
    let component: WindRoseChartComponent;
    let fixture: ComponentFixture<WindRoseChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [WindRoseChartComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(WindRoseChartComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render polar sector wedges', () => {
      const mockData: WindRoseItem[] = [
        { direction: 'N', speedBins: [{ label: 'Light', value: 10 }, { label: 'Strong', value: 15 }] },
        { direction: 'E', speedBins: [{ label: 'Light', value: 5 }, { label: 'Strong', value: 10 }] }
      ];
      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      const wedges = fixture.nativeElement.querySelectorAll('.rose-wedge');
      // 2 directions * 2 bins = 4 wedge segments
      expect(wedges.length).toBe(4);
    });
  });
});
