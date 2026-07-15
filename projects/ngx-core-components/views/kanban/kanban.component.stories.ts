import { KanbanComponent } from './kanban.component';

const meta = {
  title: 'Data Presentation/Kanban Board/Kanban',
  component: KanbanComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    columns: null,
    cards: null,
    swimlanes: null,
    optimisticUpdates: true,
    dragHandleOnly: false,
    allowSameColumnReorder: true,
  },
};
