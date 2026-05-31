export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  swimlaneId?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  assignee?: {
    name: string;
    avatarUrl?: string;
    initials: string;
  };
  dueDate?: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string; // Border accent color (e.g. hex or CSS variable)
  wipLimit?: number;
}

export interface KanbanSwimlane {
  id: string;
  title: string;
  description?: string;
}

export interface KanbanCardMoveEvent {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  fromSwimlaneId?: string;
  toSwimlaneId?: string;
  fromIndex: number;
  toIndex: number;
}

export interface KanbanMoveRejectedEvent {
  cardId: string;
  toColumnId: string;
  reason: 'wip-limit';
}
