export type AnnotationType = 'line' | 'band' | 'text' | 'arrow' | 'circle';

export interface ChartAnnotation {
  type: AnnotationType;
  axis?: 'x' | 'y';
  value?: number;
  from?: number;
  to?: number;
  text?: string;
  x?: number;
  y?: number;
  fromPoint?: { x: number; y: number };
  toPoint?: { x: number; y: number };
  radius?: number;
  color?: string;
  opacity?: number;
  strokeDasharray?: string;
  fontSize?: number;
  fontWeight?: string;
}

export function renderAnnotationSvg(
  annotation: ChartAnnotation,
  xScale: (val: number) => number,
  yScale: (val: number) => number,
  innerW: number,
  innerH: number
): string {
  const color = annotation.color || '#ff0000';
  const opacity = annotation.opacity ?? 1;
  const dasharray = annotation.strokeDasharray ? `stroke-dasharray="${annotation.strokeDasharray}"` : '';

  switch (annotation.type) {
    case 'line': {
      if (annotation.axis === 'y' && annotation.value !== undefined) {
        const y = yScale(annotation.value);
        return `<line x1="0" y1="${y}" x2="${innerW}" y2="${y}" stroke="${color}" stroke-width="2" opacity="${opacity}" ${dasharray} />`;
      } else if (annotation.axis === 'x' && annotation.value !== undefined) {
        const x = xScale(annotation.value);
        return `<line x1="${x}" y1="0" x2="${x}" y2="${innerH}" stroke="${color}" stroke-width="2" opacity="${opacity}" ${dasharray} />`;
      }
      return '';
    }
    case 'band': {
      if (annotation.axis === 'y' && annotation.from !== undefined && annotation.to !== undefined) {
        const y1 = yScale(annotation.from);
        const y2 = yScale(annotation.to);
        const y = Math.min(y1, y2);
        const h = Math.abs(y1 - y2);
        return `<rect x="0" y="${y}" width="${innerW}" height="${h}" fill="${color}" opacity="${opacity}" />`;
      } else if (annotation.axis === 'x' && annotation.from !== undefined && annotation.to !== undefined) {
        const x1 = xScale(annotation.from);
        const x2 = xScale(annotation.to);
        const x = Math.min(x1, x2);
        const w = Math.abs(x1 - x2);
        return `<rect x="${x}" y="0" width="${w}" height="${innerH}" fill="${color}" opacity="${opacity}" />`;
      }
      return '';
    }
    case 'text': {
      if (annotation.text && annotation.x !== undefined && annotation.y !== undefined) {
        const x = xScale(annotation.x);
        const y = yScale(annotation.y);
        const fs = annotation.fontSize || 12;
        const fw = annotation.fontWeight || 'normal';
        return `<text x="${x}" y="${y}" fill="${color}" opacity="${opacity}" font-size="${fs}" font-weight="${fw}" dominant-baseline="middle" text-anchor="middle">${annotation.text}</text>`;
      }
      return '';
    }
    case 'arrow': {
      if (annotation.fromPoint && annotation.toPoint) {
        const fx = xScale(annotation.fromPoint.x);
        const fy = yScale(annotation.fromPoint.y);
        const tx = xScale(annotation.toPoint.x);
        const ty = yScale(annotation.toPoint.y);
        // A simple line; standard SVG would need a marker for an arrowhead.
        return `
          <g opacity="${opacity}">
            <line x1="${fx}" y1="${fy}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="2" ${dasharray} />
            <circle cx="${tx}" cy="${ty}" r="3" fill="${color}" />
          </g>`;
      }
      return '';
    }
    case 'circle': {
      if (annotation.x !== undefined && annotation.y !== undefined) {
        const x = xScale(annotation.x);
        const y = yScale(annotation.y);
        const r = annotation.radius || 5;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}" />`;
      }
      return '';
    }
  }
  return '';
}
