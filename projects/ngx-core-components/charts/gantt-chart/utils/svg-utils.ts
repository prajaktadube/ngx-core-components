import { DependencyType } from '../models';

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
  offset = 12
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

  const midX = startX + offset;

  if (type === DependencyType.FinishToStart && endX > startX + offset * 2) {
    const mx = (startX + endX) / 2;
    return `M ${startX} ${startY} H ${mx} V ${endY} H ${endX}`;
  }

  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
}
