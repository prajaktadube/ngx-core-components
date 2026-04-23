import { Injectable } from '@angular/core';
import { ZoomLevel } from '../models';
import {
  diffDays, diffHours, startOfDay, startOfHour, startOfWeek, startOfMonth,
  startOfQuarter, startOfYear, addDays, addHours, snapToDay, daysInMonth,
} from '../utils/date-utils';

@Injectable()
export class GanttScaleService {
  dateToX(date: Date, startDate: Date, columnWidth: number, zoomLevel: ZoomLevel): number {
    switch (zoomLevel) {
      case ZoomLevel.Hour: {
        const hours = diffHours(date, startOfHour(startDate));
        return hours * columnWidth;
      }
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
        const dim = daysInMonth(date);
        return (months + dayInMonth / dim) * columnWidth;
      }
      case ZoomLevel.Quarter: {
        const start = startOfQuarter(startDate);
        const startQ = start.getFullYear() * 4 + Math.floor(start.getMonth() / 3);
        const dateQ = date.getFullYear() * 4 + Math.floor(date.getMonth() / 3);
        const qDiff = dateQ - startQ;
        // Fraction within the quarter
        const qStart = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
        const qEnd = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 1);
        const qDays = (qEnd.getTime() - qStart.getTime()) / 86400000;
        const dayInQ = (date.getTime() - qStart.getTime()) / 86400000;
        return (qDiff + dayInQ / qDays) * columnWidth;
      }
      case ZoomLevel.Year: {
        const start = startOfYear(startDate);
        const yearDiff = date.getFullYear() - start.getFullYear();
        const yearStart = new Date(date.getFullYear(), 0, 1);
        const yearEnd = new Date(date.getFullYear() + 1, 0, 1);
        const yDays = (yearEnd.getTime() - yearStart.getTime()) / 86400000;
        const dayInY = (date.getTime() - yearStart.getTime()) / 86400000;
        return (yearDiff + dayInY / yDays) * columnWidth;
      }
    }
  }

  xToDate(x: number, startDate: Date, columnWidth: number, zoomLevel: ZoomLevel): Date {
    switch (zoomLevel) {
      case ZoomLevel.Hour: {
        const hours = x / columnWidth;
        return addHours(startOfHour(startDate), Math.round(hours));
      }
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
        const dim = daysInMonth(result);
        result.setDate(1 + Math.round(fraction * dim));
        return result;
      }
      case ZoomLevel.Quarter: {
        const quarters = x / columnWidth;
        const start = startOfQuarter(startDate);
        const result = new Date(start);
        result.setMonth(result.getMonth() + Math.floor(quarters) * 3);
        const fraction = quarters - Math.floor(quarters);
        const qStart = new Date(result.getFullYear(), Math.floor(result.getMonth() / 3) * 3, 1);
        const qEnd = new Date(result.getFullYear(), Math.floor(result.getMonth() / 3) * 3 + 3, 1);
        const qDays = (qEnd.getTime() - qStart.getTime()) / 86400000;
        return new Date(qStart.getTime() + Math.round(fraction * qDays) * 86400000);
      }
      case ZoomLevel.Year: {
        const years = x / columnWidth;
        const start = startOfYear(startDate);
        const result = new Date(start);
        result.setFullYear(result.getFullYear() + Math.floor(years));
        const fraction = years - Math.floor(years);
        const yearStart = new Date(result.getFullYear(), 0, 1);
        const yearEnd = new Date(result.getFullYear() + 1, 0, 1);
        const yDays = (yearEnd.getTime() - yearStart.getTime()) / 86400000;
        return new Date(yearStart.getTime() + Math.round(fraction * yDays) * 86400000);
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
