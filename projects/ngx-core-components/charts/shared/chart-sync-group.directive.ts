import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[ngxChartSyncGroup]',
  standalone: true
})
export class ChartSyncGroupDirective implements OnInit, OnDestroy {
  @Input('ngxChartSyncGroup') groupName: string = '';

  private static groups = new Map<string, Set<ElementRef>>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (!this.groupName) return;
    if (!ChartSyncGroupDirective.groups.has(this.groupName)) {
      ChartSyncGroupDirective.groups.set(this.groupName, new Set());
    }
    ChartSyncGroupDirective.groups.get(this.groupName)!.add(this.el);
  }

  ngOnDestroy() {
    if (this.groupName && ChartSyncGroupDirective.groups.has(this.groupName)) {
      ChartSyncGroupDirective.groups.get(this.groupName)!.delete(this.el);
      if (ChartSyncGroupDirective.groups.get(this.groupName)!.size === 0) {
        ChartSyncGroupDirective.groups.delete(this.groupName);
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.groupName) return;
    
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const normalizedX = x / rect.width;

    const group = ChartSyncGroupDirective.groups.get(this.groupName);
    if (group) {
      group.forEach(chartEl => {
        if (chartEl !== this.el) {
          const syncEvent = new CustomEvent('chart-sync-hover', {
            detail: { normalizedX }
          });
          chartEl.nativeElement.dispatchEvent(syncEvent);
        }
      });
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (!this.groupName) return;

    const group = ChartSyncGroupDirective.groups.get(this.groupName);
    if (group) {
      group.forEach(chartEl => {
        if (chartEl !== this.el) {
          const syncEvent = new CustomEvent('chart-sync-clear');
          chartEl.nativeElement.dispatchEvent(syncEvent);
        }
      });
    }
  }
}
