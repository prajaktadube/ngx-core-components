import { DependencyType, GanttLinkLineType } from '../models';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeDependencyPath(
  from: Rect,
  to: Rect,
  type: DependencyType,
  offset = 12,
  lineType: GanttLinkLineType = GanttLinkLineType.Straight
): string {
  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  switch (type) {
    case DependencyType.FinishToStart:
      startX = from.x + from.width;
      startY = from.y + from.height / 2;
      endX = to.x;
      endY = to.y + to.height / 2;
      break;
    case DependencyType.StartToStart:
      startX = from.x;
      startY = from.y + from.height / 2;
      endX = to.x;
      endY = to.y + to.height / 2;
      break;
    case DependencyType.FinishToFinish:
      startX = from.x + from.width;
      startY = from.y + from.height / 2;
      endX = to.x + to.width;
      endY = to.y + to.height / 2;
      break;
    case DependencyType.StartToFinish:
      startX = from.x;
      startY = from.y + from.height / 2;
      endX = to.x + to.width;
      endY = to.y + to.height / 2;
      break;
  }

  if (lineType === GanttLinkLineType.Curve) {
    return computeCurvePath(startX, startY, endX, endY, type, offset);
  }

  return computeStraightPath(startX, startY, endX, endY, type, offset);
}

function computeStraightPath(
  startX: number, startY: number,
  endX: number, endY: number,
  type: DependencyType, offset: number
): string {
  const midX = startX + offset;

  if (type === DependencyType.FinishToStart && endX > startX + offset * 2) {
    const mx = (startX + endX) / 2;
    return `M ${startX} ${startY} H ${mx} V ${endY} H ${endX}`;
  }

  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
}

function computeCurvePath(
  startX: number, startY: number,
  endX: number, endY: number,
  type: DependencyType, offset: number
): string {
  const dx = endX - startX;
  const dy = endY - startY;
  const r = Math.min(Math.abs(dy) / 2, offset);

  if (type === DependencyType.FinishToStart && dx > offset * 2) {
    // Smooth S-curve
    const midX = (startX + endX) / 2;
    const cp1x = midX;
    const cp1y = startY;
    const cp2x = midX;
    const cp2y = endY;
    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  }

  // Route around: go right, down/up, then left/right to target
  const midX = startX + offset;
  const signY = dy >= 0 ? 1 : -1;

  if (Math.abs(dy) < r * 2) {
    // Very close vertically, simple curve
    return `M ${startX} ${startY} C ${midX} ${startY}, ${endX - offset} ${endY}, ${endX} ${endY}`;
  }

  return `M ${startX} ${startY} ` +
    `H ${midX - r} ` +
    `Q ${midX} ${startY}, ${midX} ${startY + signY * r} ` +
    `V ${endY - signY * r} ` +
    `Q ${midX} ${endY}, ${midX + r} ${endY} ` +
    `H ${endX}`;
}
