import { ZoomLevel } from '../models';

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setTime(result.getTime() + hours * 3600000);
  return result;
}

export function diffDays(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

export function diffHours(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / 3600000;
}

export function startOfHour(date: Date): Date {
  const result = new Date(date);
  result.setMinutes(0, 0, 0);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfWeek(date: Date, weekStartsOn = 1): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  result.setDate(result.getDate() - diff);
  return result;
}

export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfQuarter(date: Date): Date {
  const result = new Date(date);
  const quarter = Math.floor(result.getMonth() / 3);
  result.setMonth(quarter * 3, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addQuarters(date: Date, quarters: number): Date {
  return addMonths(date, quarters * 3);
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getDateRange(tasks: { start: Date; end: Date }[]): { start: Date; end: Date } {
  if (tasks.length === 0) {
    const today = startOfDay(new Date());
    return { start: today, end: addDays(today, 30) };
  }
  let min = tasks[0].start.getTime();
  let max = tasks[0].end.getTime();
  for (const t of tasks) {
    if (t.start.getTime() < min) min = t.start.getTime();
    if (t.end.getTime() > max) max = t.end.getTime();
  }
  return { start: addDays(new Date(min), -2), end: addDays(new Date(max), 2) };
}

export function getColumnDates(start: Date, end: Date, zoom: ZoomLevel): Date[] {
  const dates: Date[] = [];
  let current: Date;

  switch (zoom) {
    case ZoomLevel.Hour:
      current = startOfHour(start);
      while (current <= end) {
        dates.push(new Date(current));
        current = addHours(current, 1);
      }
      break;
    case ZoomLevel.Day:
      current = startOfDay(start);
      while (current <= end) {
        dates.push(new Date(current));
        current = addDays(current, 1);
      }
      break;
    case ZoomLevel.Week:
      current = startOfWeek(start);
      while (current <= end) {
        dates.push(new Date(current));
        current = addWeeks(current, 1);
      }
      break;
    case ZoomLevel.Month:
      current = startOfMonth(start);
      while (current <= end) {
        dates.push(new Date(current));
        current = addMonths(current, 1);
      }
      break;
    case ZoomLevel.Quarter:
      current = startOfQuarter(start);
      while (current <= end) {
        dates.push(new Date(current));
        current = addQuarters(current, 1);
      }
      break;
    case ZoomLevel.Year:
      current = startOfYear(start);
      while (current <= end) {
        dates.push(new Date(current));
        current = addYears(current, 1);
      }
      break;
  }
  return dates;
}

export function snapToDay(date: Date): Date {
  const result = startOfDay(date);
  if (date.getHours() >= 12) {
    return addDays(result, 1);
  }
  return result;
}
