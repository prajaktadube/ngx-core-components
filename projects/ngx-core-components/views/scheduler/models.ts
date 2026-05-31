export interface SchedulerEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: 'meeting' | 'task' | 'milestone' | 'personal' | 'important';
  color?: string; // custom hex color override
}

export interface SchedulerSlotClickEvent {
  date: Date;
  hour: number;
}

export interface SchedulerEventChangeEvent {
  event: SchedulerEvent;
  start: Date;
  end: Date;
}
