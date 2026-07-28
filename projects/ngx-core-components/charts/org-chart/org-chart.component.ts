import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  inject,
  DestroyRef,
  ElementRef,
  viewChild,
  effect,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, generateUniqueId } from '../shared/chart-utils';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, ExportFormat } from '../shared/chart-export-menu.component';

export interface OrgNode {
  id: string;
  name: string;
  title?: string;
  department?: string;
  avatarUrl?: string;
  icon?: string;
  children?: OrgNode[];
  expanded?: boolean;
}

interface RenderNode {
  data: OrgNode;
  x: number;
  y: number;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

interface RenderLink {
  source: RenderNode;
  target: RenderNode;
  path: string;
}

@Component({
  selector: 'ngx-org-chart',
  standalone: true,
  imports: [CommonModule, ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-chart-container" #container>
      <div class="ngx-chart-header">
        <ngx-chart-export-menu *ngIf="showExport()" (exportClicked)="onExport($event)" />
      </div>

      <div class="scroll-container">
        <svg class="ngx-chart-svg" [attr.width]="svgWidth()" [attr.height]="svgHeight()">
          <g [attr.transform]="'translate(' + translateX() + ', ' + translateY() + ')'">
            <!-- Links -->
            <path *ngFor="let link of links()"
                  [attr.d]="link.path"
                  class="org-link" />
            
            <!-- Nodes -->
            <g *ngFor="let node of nodes()"
               class="org-node"
               [attr.transform]="'translate(' + node.x + ',' + node.y + ')'">
              
              <!-- Card Background -->
              <rect [attr.x]="-nodeWidth()/2" 
                    [attr.y]="-nodeHeight()/2" 
                    [attr.width]="nodeWidth()" 
                    [attr.height]="nodeHeight()" 
                    rx="8"
                    class="org-card" 
                    (click)="nodeClick.emit(node.data)" />
              
              <!-- Avatar -->
              <image *ngIf="node.data.avatarUrl"
                     [attr.href]="node.data.avatarUrl"
                     [attr.x]="-nodeWidth()/2 + 10"
                     [attr.y]="-20"
                     width="40" height="40"
                     clip-path="url(#avatar-clip)" />
              
              <clipPath id="avatar-clip">
                <circle [attr.cx]="-nodeWidth()/2 + 30" cy="0" r="20" />
              </clipPath>

              <!-- Circle fallback if no avatar -->
              <circle *ngIf="!node.data.avatarUrl"
                      [attr.cx]="-nodeWidth()/2 + 30"
                      [attr.cy]="0"
                      r="16"
                      [attr.fill]="getColor(node.depth)" />
              
              <text *ngIf="!node.data.avatarUrl"
                    [attr.x]="-nodeWidth()/2 + 30"
                    [attr.y]="4"
                    text-anchor="middle"
                    fill="#fff"
                    font-size="12"
                    font-weight="bold">
                {{ node.data.name.charAt(0) }}
              </text>

              <!-- Text Details -->
              <text [attr.x]="-nodeWidth()/2 + 60" [attr.y]="-6" class="org-name">{{ node.data.name }}</text>
              <text [attr.x]="-nodeWidth()/2 + 60" [attr.y]="12" class="org-title">{{ node.data.title || '' }}</text>

              <!-- Expand/Collapse Handle -->
              <g *ngIf="node.hasChildren"
                 class="expand-handle"
                 [attr.transform]="getHandleTransform()"
                 (click)="toggleNode(node, $event)">
                <circle cx="0" cy="0" r="10" fill="#fff" stroke="#ccc" />
                <text x="0" y="4" text-anchor="middle" font-size="14" font-weight="bold" fill="#666">
                  {{ node.expanded ? '-' : '+' }}
                </text>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .ngx-chart-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
    }
    .ngx-chart-header {
      position: absolute;
      top: 8px;
      right: 16px;
      z-index: 10;
    }
    .scroll-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    .ngx-chart-svg {
      min-width: 100%;
      min-height: 100%;
    }
    .org-link {
      fill: none;
      stroke: var(--ngx-chart-grid, #cbd5e1);
      stroke-width: 2px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .org-node {
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .org-card {
      fill: var(--ngx-chart-tooltip-bg, rgba(255, 255, 255, 0.85));
      stroke: rgba(0,0,0,0.1);
      stroke-width: 1px;
      backdrop-filter: blur(8px);
    }
    .org-node:hover .org-card {
      stroke: var(--ngx-chart-axis-text, #94a3b8);
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .org-name {
      fill: var(--ngx-chart-axis-text, #1e293b);
      font-size: 14px;
      font-weight: bold;
    }
    .org-title {
      fill: var(--ngx-chart-axis-text, #64748b);
      font-size: 12px;
    }
    .expand-handle {
      cursor: pointer;
    }
    .expand-handle:hover circle {
      fill: #f1f5f9;
    }
  `]
})
export class OrgChartComponent {
  rootNode = input.required<OrgNode>();
  height = input<number>(450);
  nodeWidth = input<number>(180);
  nodeHeight = input<number>(60);
  orientation = input<'vertical' | 'horizontal'>('vertical');
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(true);

  private exportSvc = inject(ChartExportService);
  nodeClick = output<OrgNode>();
  nodeToggle = output<OrgNode>();

  container = viewChild<ElementRef>('container');

  onExport(type: ExportFormat): void {
    const el = this.container()?.nativeElement;
    if (type === 'svg') this.exportSvc.downloadSvg(el, 'org-chart.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(el, 'Org Chart', 'org-chart.pdf');
  }
  containerWidth = signal<number>(800);
  
  expandedState = signal<Set<string>>(new Set());

  chartId = generateUniqueId('org');

  get containerEl() {
    return this.container()?.nativeElement;
  }

  private destroyRef = inject(DestroyRef);

  constructor() {
    effect((onCleanup) => {
      const el = this.container()?.nativeElement;
      if (!el) return;
      const ro = new ResizeObserver(entries => {
        if (entries[0]) {
          this.containerWidth.set(entries[0].contentRect.width || 800);
        }
      });
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    });

    effect(() => {
      const initExp = new Set<string>();
      const traverse = (n: OrgNode) => {
        if (n.expanded !== false) initExp.add(n.id);
        n.children?.forEach(traverse);
      };
      traverse(this.rootNode());
      this.expandedState.set(initExp);
    }, { allowSignalWrites: true });
  }

  getColor(depth: number): string {
    const c = this.colors();
    return c[depth % c.length];
  }

  getHandleTransform(): string {
    if (this.orientation() === 'vertical') {
      return `translate(0, ${this.nodeHeight() / 2})`;
    } else {
      return `translate(${this.nodeWidth() / 2}, 0)`;
    }
  }

  layout = computed(() => {
    const root = this.rootNode();
    const isVert = this.orientation() === 'vertical';
    const dx = isVert ? this.nodeWidth() + 40 : this.nodeWidth() + 80;
    const dy = isVert ? this.nodeHeight() + 80 : this.nodeHeight() + 40;
    
    const nodes: RenderNode[] = [];
    const links: RenderLink[] = [];
    
    const expanded = this.expandedState();

    let maxX = 0, maxY = 0, minX = 0, minY = 0;

    const traverse = (node: OrgNode, depth: number, offset: number): RenderNode => {
      const isExpanded = expanded.has(node.id);
      const hasChildren = !!(node.children && node.children.length > 0);
      
      const renderNode: RenderNode = {
        data: node, x: 0, y: 0, depth, hasChildren, expanded: isExpanded
      };

      if (hasChildren && isExpanded) {
        const childrenNodes = node.children!.map((child, i) => {
          const childOffset = offset + (i - (node.children!.length - 1) / 2) * dx;
          return traverse(child, depth + 1, childOffset);
        });

        let sum = 0;
        childrenNodes.forEach(c => sum += isVert ? c.x : c.y);
        const center = sum / childrenNodes.length;

        if (isVert) {
          renderNode.x = center;
          renderNode.y = depth * dy;
        } else {
          renderNode.x = depth * dx;
          renderNode.y = center;
        }

        childrenNodes.forEach(child => {
          links.push({
            source: renderNode, target: child,
            path: this.generatePath(renderNode, child, isVert)
          });
        });
      } else {
        if (isVert) {
          renderNode.x = offset;
          renderNode.y = depth * dy;
        } else {
          renderNode.x = depth * dx;
          renderNode.y = offset;
        }
      }

      nodes.push(renderNode);
      if (renderNode.x > maxX) maxX = renderNode.x;
      if (renderNode.y > maxY) maxY = renderNode.y;
      if (renderNode.x < minX) minX = renderNode.x;
      if (renderNode.y < minY) minY = renderNode.y;

      return renderNode;
    };

    traverse(root, 0, 0);
    return { nodes, links, bounds: { minX, maxX, minY, maxY } };
  });

  nodes = computed(() => this.layout().nodes);
  links = computed(() => this.layout().links);
  
  svgWidth = computed(() => {
    const w = this.layout().bounds.maxX - this.layout().bounds.minX + this.nodeWidth() + 100;
    return Math.max(w, this.containerWidth());
  });

  svgHeight = computed(() => {
    const h = this.layout().bounds.maxY - this.layout().bounds.minY + this.nodeHeight() + 100;
    return Math.max(h, this.height());
  });

  translateX = computed(() => -this.layout().bounds.minX + this.nodeWidth() / 2 + 50);
  translateY = computed(() => -this.layout().bounds.minY + this.nodeHeight() / 2 + 50);

  generatePath(source: RenderNode, target: RenderNode, isVertical: boolean): string {
    if (isVertical) {
      const sy = source.y + this.nodeHeight() / 2;
      const ty = target.y - this.nodeHeight() / 2;
      const midY = (sy + ty) / 2;
      return `M ${source.x} ${sy} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${ty}`;
    } else {
      const sx = source.x + this.nodeWidth() / 2;
      const tx = target.x - this.nodeWidth() / 2;
      const midX = (sx + tx) / 2;
      return `M ${sx} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${tx} ${target.y}`;
    }
  }

  toggleNode(node: RenderNode, event: MouseEvent) {
    event.stopPropagation();
    const state = new Set(this.expandedState());
    if (state.has(node.data.id)) {
      state.delete(node.data.id);
    } else {
      state.add(node.data.id);
    }
    this.expandedState.set(state);
    this.nodeToggle.emit(node.data);
  }
}
