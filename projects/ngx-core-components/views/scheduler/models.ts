export interface SchedulerEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: 'meeting' | 'task' | 'milestone' | 'personal' | 'important' | 'warning';
  color?: string; // custom hex color override
  recurrence?: SchedulerRecurrence;
}

export interface SchedulerRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  count?: number;
  until?: Date;
  daysOfWeek?: number[];
}

export interface SchedulerSlotClickEvent {
  date: Date;
  hour: number;
  minute?: number;
}

export interface SchedulerEventChangeEvent {
  event: SchedulerEvent;
  start: Date;
  end: Date;
  occurrenceStart?: Date;
  occurrenceEnd?: Date;
}
