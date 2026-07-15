import type { Meta, StoryObj } from '@storybook/angular';
import { DataGridComponent, type GridColumnDef } from './data-grid.component';

const sampleColumns: GridColumnDef[] = [
  { field: 'id', title: 'ID', width: 70, sortable: true, filterable: true, align: 'center' },
  { field: 'name', title: 'Full Name', width: 180, sortable: true, filterable: true, editable: true },
  { field: 'email', title: 'Email', width: 240, sortable: true, filterable: true, editable: true },
  { field: 'department', title: 'Department', width: 150, sortable: true, filterable: true, groupable: true },
  { field: 'role', title: 'Role', width: 150, sortable: true, filterable: true },
  { field: 'salary', title: 'Salary', width: 120, sortable: true, align: 'right', aggregation: 'sum' },
  { field: 'startDate', title: 'Start Date', width: 130, sortable: true },
];

const sampleData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@acme.com', department: 'Engineering', role: 'Senior Engineer', salary: 125000, startDate: '2020-03-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@acme.com', department: 'Engineering', role: 'Tech Lead', salary: 145000, startDate: '2018-07-01' },
  { id: 3, name: 'Carol Williams', email: 'carol@acme.com', department: 'Design', role: 'UX Designer', salary: 95000, startDate: '2021-01-10' },
  { id: 4, name: 'David Brown', email: 'david@acme.com', department: 'Marketing', role: 'Marketing Manager', salary: 110000, startDate: '2019-11-20' },
  { id: 5, name: 'Eva Martinez', email: 'eva@acme.com', department: 'Engineering', role: 'Frontend Dev', salary: 105000, startDate: '2022-06-01' },
  { id: 6, name: 'Frank Lee', email: 'frank@acme.com', department: 'Sales', role: 'Account Executive', salary: 88000, startDate: '2021-09-14' },
  { id: 7, name: 'Grace Kim', email: 'grace@acme.com', department: 'Design', role: 'Visual Designer', salary: 90000, startDate: '2023-02-28' },
  { id: 8, name: 'Hank Davis', email: 'hank@acme.com', department: 'Sales', role: 'Sales Director', salary: 135000, startDate: '2017-04-10' },
  { id: 9, name: 'Ivy Chen', email: 'ivy@acme.com', department: 'Engineering', role: 'Backend Dev', salary: 115000, startDate: '2020-08-22' },
  { id: 10, name: 'Jack Wilson', email: 'jack@acme.com', department: 'Marketing', role: 'Content Writer', salary: 72000, startDate: '2023-05-15' },
  { id: 11, name: 'Karen Taylor', email: 'karen@acme.com', department: 'Engineering', role: 'DevOps Engineer', salary: 128000, startDate: '2019-12-01' },
  { id: 12, name: 'Leo Garcia', email: 'leo@acme.com', department: 'Design', role: 'Product Designer', salary: 102000, startDate: '2022-03-07' },
];

const meta: Meta<DataGridComponent> = {
  title: 'Data Presentation/Data Grid Enterprise/DataGrid',
  component: DataGridComponent,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Array of row data objects' },
    columns: { control: 'object', description: 'Column definitions (GridColumnDef[])' },
    pageSize: { control: { type: 'number', min: 5, max: 100 }, description: 'Rows per page' },
    striped: { control: 'boolean', description: 'Alternate row striping' },
    selectable: { control: 'boolean', description: 'Enable row selection checkboxes' },
    editable: { control: 'boolean', description: 'Enable inline editing with Edit/Save/Cancel' },
    loading: { control: 'boolean', description: 'Show loading spinner overlay' },
    showGlobalSearch: { control: 'boolean', description: 'Show global search input in toolbar' },
    reorderable: { control: 'boolean', description: 'Allow column drag-reordering' },
    showColumnChooser: { control: 'boolean', description: 'Show column visibility chooser' },
  },
};

export default meta;
type Story = StoryObj<DataGridComponent>;

// ── Default: Employee directory ──
export const Default: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    pageSize: 10,
    striped: true,
  },
};

// ── Sortable & Filterable: Interactive data exploration ──
export const SortableAndFilterable: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    pageSize: 10,
    striped: true,
    showGlobalSearch: true,
  },
};

// ── Editable: Inline row editing ──
export const Editable: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns.map(c => ({ ...c, editable: ['name', 'email', 'role'].includes(c.field) ? true : c.editable })),
    pageSize: 10,
    striped: true,
    editable: true,
  },
};

// ── Selectable: Checkbox selection with search ──
export const Selectable: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    pageSize: 10,
    striped: true,
    selectable: true,
    showGlobalSearch: true,
    showColumnChooser: true,
  },
};

// ── Loading: Skeleton loading state ──
export const Loading: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    pageSize: 10,
    loading: true,
  },
};

// ── SmallPageSize: Paginated with 5 items per page ──
export const SmallPageSize: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    pageSize: 5,
    striped: true,
    selectable: true,
  },
};
