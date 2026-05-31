import { AfterViewInit, Component, ElementRef, ViewChild, input, output, signal } from '@angular/core';

@Component({
  selector: 'ngx-signature-pad',
  standalone: true,
  template: `
    <div class="ngx-signature-pad">
      <canvas
        #canvas
        [style.width.px]="width()"
        [style.height.px]="height()"
        (pointerdown)="startDrawing($event)"
        (pointermove)="draw($event)"
        (pointerup)="stopDrawing()"
        (pointerleave)="stopDrawing()"
      ></canvas>
      <div class="signature-actions">
        <button type="button" (click)="clear()">Clear</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-signature-pad { display: grid; gap: 8px; font-family: var(--ngx-font-family, inherit); }
    canvas { display: block; max-width: 100%; border: 1px solid var(--ngx-input-border, #cbd5e1); border-radius: var(--ngx-input-radius, 8px); background: var(--ngx-signature-bg, #ffffff); touch-action: none; cursor: crosshair; }
    .signature-actions { display: flex; justify-content: flex-end; }
    .signature-actions button { border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; background: var(--bg-secondary, #ffffff); color: var(--text-primary, #0f172a); cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; padding: 6px 11px; }
    .signature-actions button:hover, .signature-actions button:focus-visible { border-color: var(--primary-color, #4f46e5); outline: none; }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  width = input(520);
  height = input(180);
  strokeColor = input('#111827');
  strokeWidth = input(2);
  backgroundColor = input('#ffffff');

  signatureChange = output<string>();
  cleared = output<void>();

  private drawing = signal(false);
  private context: CanvasRenderingContext2D | null = null;

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.clear(false);
  }

  startDrawing(event: PointerEvent): void {
    const context = this.context;
    if (!context) return;

    const point = this.pointerPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    this.drawing.set(true);
    this.canvasRef.nativeElement.setPointerCapture(event.pointerId);
  }

  draw(event: PointerEvent): void {
    const context = this.context;
    if (!context || !this.drawing()) return;

    const point = this.pointerPoint(event);
    context.lineTo(point.x, point.y);
    context.strokeStyle = this.strokeColor();
    context.lineWidth = this.strokeWidth();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  }

  stopDrawing(): void {
    if (!this.drawing()) return;
    this.drawing.set(false);
    this.signatureChange.emit(this.toDataUrl());
  }

  clear(emit = true): void {
    const canvas = this.canvasRef.nativeElement;
    const context = this.context;
    if (!context) return;

    context.save();
    context.fillStyle = this.backgroundColor();
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    if (emit) {
      this.cleared.emit();
      this.signatureChange.emit(this.toDataUrl());
    }
  }

  toDataUrl(): string {
    return this.canvasRef.nativeElement.toDataURL('image/png');
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = this.width() * ratio;
    canvas.height = this.height() * ratio;
    this.context = canvas.getContext('2d');
    this.context?.scale(ratio, ratio);
  }

  private pointerPoint(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}
