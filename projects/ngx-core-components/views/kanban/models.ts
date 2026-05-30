export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
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
}
