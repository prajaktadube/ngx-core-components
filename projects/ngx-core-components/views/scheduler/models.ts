export interface SchedulerEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: 'meeting' | 'task' | 'milestone' | 'personal' | 'important' | 'warning';
  color?: string; // custom hex color override
  recurrence?: SchedulerRecurrence;
  resourceId?: string; // resource key association
  isAllDay?: boolean; // spans the entire day
  completed?: boolean; // completed status (for task/checklist categories)
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
  resourceId?: string;
}

export interface SchedulerEventChangeEvent {
  event: SchedulerEvent;
  start: Date;
  end: Date;
  occurrenceStart?: Date;
  occurrenceEnd?: Date;
}

export interface SchedulerResource {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: string;
  description?: string;
}

export interface SchedulerSlotRangeSelectEvent {
  start: Date;
  end: Date;
  resourceId?: string;
}
