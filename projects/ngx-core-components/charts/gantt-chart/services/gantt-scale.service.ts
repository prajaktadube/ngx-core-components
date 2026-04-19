import { Injectable } from '@angular/core';
import { ZoomLevel } from '../models';
import { diffDays, startOfDay, startOfWeek, startOfMonth, addDays, snapToDay } from '../utils/date-utils';

@Injectable()
export class GanttScaleService {
  dateToX(date: Date, startDate: Date, columnWidth: number, zoomLevel: ZoomLevel): number {
    switch (zoomLevel) {
      case ZoomLevel.Day:
        return diffDays(startOfDay(date), startOfDay(startDate)) * columnWidth;
      case ZoomLevel.Week: {
        const totalDays = diffDays(date, startOfWeek(startDate));
        return (totalDays / 7) * columnWidth;
      }
      case ZoomLevel.Month: {
        const start = startOfMonth(startDate);
        const months =
          (date.getFullYear() - start.getFullYear()) * 12 +
          (date.getMonth() - start.getMonth());
        const dayInMonth = date.getDate() - 1;
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        return (months + dayInMonth / daysInMonth) * columnWidth;
      }
    }
  }

  xToDate(x: number, startDate: Date, columnWidth: number, zoomLevel: ZoomLevel): Date {
    switch (zoomLevel) {
      case ZoomLevel.Day: {
        const days = x / columnWidth;
        return addDays(startOfDay(startDate), Math.round(days));
      }
      case ZoomLevel.Week: {
        const weeks = x / columnWidth;
        return addDays(startOfWeek(startDate), Math.round(weeks * 7));
      }
      case ZoomLevel.Month: {
        const months = x / columnWidth;
        const start = startOfMonth(startDate);
        const result = new Date(start);
        result.setMonth(result.getMonth() + Math.floor(months));
        const fraction = months - Math.floor(months);
        const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
        result.setDate(1 + Math.round(fraction * daysInMonth));
        return result;
      }
    }
  }

  snapDate(date: Date, snapTo: 'none' | 'day' | 'hour'): Date {
    switch (snapTo) {
      case 'day':
        return snapToDay(date);
      case 'hour': {
        const result = new Date(date);
        result.setMinutes(0, 0, 0);
        return result;
      }
      default:
        return date;
    }
  }

  getBarWidth(start: Date, end: Date, startDate: Date, columnWidth: number, zoomLevel: ZoomLevel): number {
    const x1 = this.dateToX(start, startDate, columnWidth, zoomLevel);
    const x2 = this.dateToX(end, startDate, columnWidth, zoomLevel);
    return Math.max(x2 - x1, 4);
  }
}
