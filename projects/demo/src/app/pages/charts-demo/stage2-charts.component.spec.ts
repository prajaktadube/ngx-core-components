import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ChordDiagramComponent } from 'ngx-core-components/charts';
import { DependencyWheelComponent } from 'ngx-core-components/charts';
import { AdjacencyMatrixComponent } from 'ngx-core-components/charts';
import { BiplotComponent, BiplotPoint, BiplotVector } from 'ngx-core-components/charts';

describe('Stage 2 Chart Components', () => {

  // 1. Chord Diagram tests
  describe('ChordDiagramComponent', () => {
    let component: ChordDiagramComponent;
    let fixture: ComponentFixture<ChordDiagramComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChordDiagramComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(ChordDiagramComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render correct number of nodes and ribbons', () => {
      const mockLabels = ['A', 'B', 'C'];
      const mockMatrix = [
        [0, 10, 20],
        [5, 0, 15],
        [30, 2, 0]
      ];
      fixture.componentRef.setInput('labels', mockLabels);
      fixture.componentRef.setInput('matrix', mockMatrix);
      fixture.detectChanges();

      // Check node arc paths
      const arcs = fixture.nativeElement.querySelectorAll('.node-arc');
      expect(arcs.length).toBe(3);

      // Check ribbons (chords)
      const ribbons = fixture.nativeElement.querySelectorAll('.chord-ribbon');
      // For 3 nodes, possible connections: (0,0), (0,1), (0,2), (1,1), (1,2), (2,2)
      // Since i=j self flows are included in totalFlow check:
      // (0,1)->15, (0,2)->50, (1,2)->17. Self flows are 0. So 3 ribbons.
      expect(ribbons.length).toBe(3);
    });
  });

  // 2. Dependency Wheel tests
  describe('DependencyWheelComponent', () => {
    let component: DependencyWheelComponent;
    let fixture: ComponentFixture<DependencyWheelComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DependencyWheelComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(DependencyWheelComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render directed dependency ribbons', () => {
      const mockLabels = ['A', 'B', 'C'];
      const mockMatrix = [
        [0, 10, 20],
        [5, 0, 15],
        [30, 2, 0]
      ];
      fixture.componentRef.setInput('labels', mockLabels);
      fixture.componentRef.setInput('matrix', mockMatrix);
      fixture.detectChanges();

      const arcs = fixture.nativeElement.querySelectorAll('.node-arc');
      expect(arcs.length).toBe(3);

      const ribbons = fixture.nativeElement.querySelectorAll('.dependency-ribbon');
      // Outbound connections (excluding self): (0->1), (0->2), (1->0), (1->2), (2->0), (2->1). All non-zero.
      // Total should be 6 directed ribbons.
      expect(ribbons.length).toBe(6);
    });
  });

  // 3. Adjacency Matrix tests
  describe('AdjacencyMatrixComponent', () => {
    let component: AdjacencyMatrixComponent;
    let fixture: ComponentFixture<AdjacencyMatrixComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AdjacencyMatrixComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(AdjacencyMatrixComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render grid of cell weight rects', () => {
      const mockLabels = ['A', 'B', 'C'];
      const mockMatrix = [
        [0, 10, 20],
        [5, 0, 15],
        [30, 2, 0]
      ];
      fixture.componentRef.setInput('labels', mockLabels);
      fixture.componentRef.setInput('matrix', mockMatrix);
      fixture.detectChanges();

      const cells = fixture.nativeElement.querySelectorAll('.matrix-cell');
      // 3x3 matrix should render exactly 9 cells
      expect(cells.length).toBe(9);
    });
  });

  // 4. Biplot / PCA Plot tests
  describe('BiplotComponent', () => {
    let component: BiplotComponent;
    let fixture: ComponentFixture<BiplotComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BiplotComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(BiplotComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should map points and draw load vectors', () => {
      const mockPoints: BiplotPoint[] = [
        { x: -1, y: 1, label: 'P1', group: 'A' },
        { x: 1, y: -1, label: 'P2', group: 'B' }
      ];
      const mockVectors: BiplotVector[] = [
        { x: 0.5, y: 0.5, label: 'V1' }
      ];
      fixture.componentRef.setInput('points', mockPoints);
      fixture.componentRef.setInput('vectors', mockVectors);
      fixture.detectChanges();

      // Check points rendered
      const points = fixture.nativeElement.querySelectorAll('.biplot-point');
      expect(points.length).toBe(2);

      // Check vectors drawn
      const vectors = fixture.nativeElement.querySelectorAll('.vector-line');
      expect(vectors.length).toBe(1);

      // Check axis lines are present (2 lines passing through origin)
      const axes = fixture.nativeElement.querySelectorAll('.origin-axis');
      expect(axes.length).toBe(2);
    });
  });
});
