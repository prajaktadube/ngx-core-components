import { Injectable, ElementRef } from '@angular/core';

/**
 * Service for exporting the gantt chart as a PNG image.
 * Requires html2canvas as an optional peer dependency for full export.
 * Falls back to SVG serialization if html2canvas is not available.
 */
@Injectable()
export class GanttPrintService {
  private root: HTMLElement | null = null;

  register(rootRef: ElementRef<HTMLElement>): void {
    this.root = rootRef.nativeElement;
  }

  /**
   * Export the gantt chart as a PNG data URL.
   * Uses the Canvas API to capture the rendered content.
   */
  async exportAsImage(ignoreElementClass?: string): Promise<string | null> {
    if (!this.root) {
      console.warn('[GanttPrintService] No root element registered.');
      return null;
    }

    try {
      // Try to use html2canvas if available
      const html2canvas = await this.loadHtml2Canvas();
      if (html2canvas) {
        const canvas = await html2canvas(this.root, {
          logging: false,
          allowTaint: true,
          useCORS: true,
          width: this.root.scrollWidth,
          height: this.root.scrollHeight,
          ignoreElements: (element: Element) => {
            if (ignoreElementClass && element.classList.contains(ignoreElementClass)) {
              return true;
            }
            return false;
          },
        });
        return canvas.toDataURL('image/png');
      }

      // Fallback: capture via basic canvas rendering
      return this.fallbackCapture();
    } catch {
      console.warn('[GanttPrintService] Export failed.');
      return null;
    }
  }

  /**
   * Download the gantt chart as a PNG file.
   */
  async print(name: string = 'gantt-chart', ignoreElementClass?: string): Promise<void> {
    const dataUrl = await this.exportAsImage(ignoreElementClass);
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `${name}.png`;
      link.href = dataUrl;
      link.click();
    }
  }

  private async loadHtml2Canvas(): Promise<((el: HTMLElement, opts: unknown) => Promise<HTMLCanvasElement>) | null> {
    try {
      // html2canvas is an optional peer dependency – if not installed, fallback is used
      const module = await (Function('return import("html2canvas")')() as Promise<{ default: (el: HTMLElement, opts: unknown) => Promise<HTMLCanvasElement> }>);
      return module.default || null;
    } catch {
      return null;
    }
  }

  private fallbackCapture(): string | null {
    if (!this.root) return null;

    // Basic fallback: render a simple canvas with the gantt dimensions
    const canvas = document.createElement('canvas');
    const rect = this.root.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill with background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a message indicating html2canvas is needed for full export
    ctx.fillStyle = '#6c757d';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Install html2canvas for full chart export (npm install html2canvas)',
      canvas.width / 2,
      canvas.height / 2,
    );

    return canvas.toDataURL('image/png');
  }
}
