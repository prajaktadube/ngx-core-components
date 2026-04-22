import { GanttTask, GanttDependency, DependencyType } from 'ngx-core-components';

export function getSampleTasks(): GanttTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = (offset: number, duration: number = 0): { start: Date; end: Date } => {
    const start = new Date(today);
    start.setDate(start.getDate() + offset);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    return { start, end };
  };

  return [
    // Phase 1: Planning
    { id: 'phase-1', name: 'Planning Phase', ...d(-5, 10), progress: 100, parentId: null, collapsed: false, isMilestone: false },
    { id: 'task-1', name: 'Requirements Gathering', ...d(-5, 4), progress: 100, parentId: 'phase-1', collapsed: false, isMilestone: false, meta: { assignee: 'Alice', priority: 'High' },
      subtasks: [
        { id: 'sub-1a', name: 'Stakeholder Interviews', ...d(-5, 2), color: '#27ae60', description: 'Interview key stakeholders', progress: 100 },
        { id: 'sub-1b', name: 'Document Requirements', ...d(-3, 2), color: '#e67e22', description: 'Write requirements doc', progress: 100 },
      ]
    },
    { id: 'task-2', name: 'Technical Design', ...d(-1, 4), progress: 80, parentId: 'phase-1', collapsed: false, isMilestone: false, meta: { assignee: 'Bob', priority: 'High' },
      subtasks: [
        { id: 'sub-2a', name: 'Architecture', ...d(-1, 2), color: '#8e44ad', description: 'System architecture design', progress: 100 },
        { id: 'sub-2b', name: 'API Design', ...d(1, 2), color: '#2980b9', description: 'REST API specifications', progress: 60 },
      ]
    },
    { id: 'milestone-1', name: 'Design Approval', ...d(4, 0), progress: 0, parentId: 'phase-1', collapsed: false, isMilestone: true },

    // Phase 2: Development — task-3 & task-5 share a row, task-3 has subtasks
    { id: 'phase-2', name: 'Development Phase', ...d(5, 20), progress: 35, parentId: null, collapsed: false, isMilestone: false },
    { id: 'task-3', name: 'Backend API', ...d(5, 8), progress: 60, parentId: 'phase-2', collapsed: false, isMilestone: false, color: '#e9ecef', rowId: 'dev-row-1', meta: { assignee: 'Charlie', priority: 'Critical' },
      subtasks: [
        { id: 'sub-3a', name: 'Auth Service', ...d(5, 3), color: '#27ae60', description: 'JWT authentication', progress: 100 },
        { id: 'sub-3b', name: 'CRUD Endpoints', ...d(8, 3), color: '#f39c12', description: 'Core resource endpoints', progress: 50 },
        { id: 'sub-3c', name: 'Validation', ...d(11, 2), color: '#e74c3c', description: 'Input validation layer', progress: 20 },
      ]
    },
    { id: 'task-5', name: 'Database Schema', ...d(8, 5), progress: 90, parentId: 'phase-2', collapsed: false, isMilestone: false, color: '#e9ecef', rowId: 'dev-row-1', meta: { assignee: 'Diana', priority: 'High' },
      subtasks: [
        { id: 'sub-5a', name: 'Schema Design', ...d(8, 2), color: '#e67e22', description: 'ERD & table design', progress: 100 },
        { id: 'sub-5b', name: 'Migrations', ...d(10, 3), color: '#d35400', description: 'Migration scripts', progress: 80 },
      ]
    },
    { id: 'task-4', name: 'Frontend UI', ...d(8, 10), progress: 30, parentId: 'phase-2', collapsed: false, isMilestone: false, color: '#e9ecef', meta: { assignee: 'Eve', priority: 'Medium' },
      subtasks: [
        { id: 'sub-4a', name: 'Components', ...d(8, 4), color: '#8e44ad', description: 'Reusable UI components', progress: 60 },
        { id: 'sub-4b', name: 'Pages', ...d(12, 3), color: '#9b59b6', description: 'Main application pages', progress: 20 },
        { id: 'sub-4c', name: 'Styling', ...d(15, 3), color: '#6c3483', description: 'CSS and theming', progress: 0 },
      ]
    },
    { id: 'task-6', name: 'Authentication Module', ...d(10, 6), progress: 10, parentId: 'phase-2', collapsed: false, isMilestone: false, meta: { assignee: 'Frank', priority: 'Critical' } },

    // Phase 3: Testing — task-7 & task-8 share a row with subtasks
    { id: 'phase-3', name: 'Testing Phase', ...d(20, 10), progress: 0, parentId: null, collapsed: false, isMilestone: false },
    { id: 'task-7', name: 'Unit Tests', ...d(20, 5), progress: 0, parentId: 'phase-3', collapsed: false, isMilestone: false, color: '#e9ecef', rowId: 'test-row-1', meta: { assignee: 'Grace', priority: 'High' },
      subtasks: [
        { id: 'sub-7a', name: 'Backend Tests', ...d(20, 3), color: '#16a085', description: 'API unit tests', progress: 0 },
        { id: 'sub-7b', name: 'Frontend Tests', ...d(23, 2), color: '#1abc9c', description: 'Component tests', progress: 0 },
      ]
    },
    { id: 'task-8', name: 'Integration Tests', ...d(23, 5), progress: 0, parentId: 'phase-3', collapsed: false, isMilestone: false, color: '#e9ecef', rowId: 'test-row-1', meta: { assignee: 'Hank', priority: 'High' },
      subtasks: [
        { id: 'sub-8a', name: 'API Integration', ...d(23, 3), color: '#2980b9', description: 'End-to-end API tests', progress: 0 },
        { id: 'sub-8b', name: 'E2E Tests', ...d(26, 2), color: '#3498db', description: 'Browser E2E tests', progress: 0 },
      ]
    },
    { id: 'task-9', name: 'UAT', ...d(26, 4), progress: 0, parentId: 'phase-3', collapsed: false, isMilestone: false, meta: { assignee: 'Ivy', priority: 'Medium' } },
    { id: 'milestone-2', name: 'Go Live', ...d(30, 0), progress: 0, parentId: null, collapsed: false, isMilestone: true },
  ];
}

export function getSampleDependencies(): GanttDependency[] {
  return [
    { fromId: 'task-1', toId: 'task-2', type: DependencyType.FinishToStart },
    { fromId: 'task-2', toId: 'milestone-1', type: DependencyType.FinishToStart },
    { fromId: 'milestone-1', toId: 'task-3', type: DependencyType.FinishToStart },
    { fromId: 'milestone-1', toId: 'task-5', type: DependencyType.FinishToStart },
    { fromId: 'task-5', toId: 'task-3', type: DependencyType.StartToStart },
    { fromId: 'task-3', toId: 'task-4', type: DependencyType.FinishToStart },
    { fromId: 'task-3', toId: 'task-6', type: DependencyType.FinishToStart },
    { fromId: 'task-4', toId: 'task-7', type: DependencyType.FinishToStart },
    { fromId: 'task-6', toId: 'task-8', type: DependencyType.FinishToStart },
    { fromId: 'task-8', toId: 'task-9', type: DependencyType.FinishToStart },
    { fromId: 'task-9', toId: 'milestone-2', type: DependencyType.FinishToStart },
  ];
}
