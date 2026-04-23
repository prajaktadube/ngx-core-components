import { GanttTask, GanttDependency, DependencyType } from 'ngx-core-components';

/**
 * Transport/logistics Gantt data.
 * Each vehicle is a row. Each voyage on that row has 7 subtask phases:
 *   Station Start → Transit → Hub1 → Transit → Hub2 → Transit → Station End
 * Multiple voyages share the same rowId so they appear side-by-side on one row.
 */
export function getTransportTasks(): GanttTask[] {
  const base = new Date();
  base.setHours(6, 0, 0, 0); // start at 06:00 today

  const h = (hours: number): Date => new Date(base.getTime() + hours * 3600000);

  const colors = {
    station: '#10b981', // emerald green — station start / end
    transit: '#3b82f6', // vivid blue    — in-transit legs
    hub:     '#f59e0b', // amber gold    — hub stops
  };

  const vehicles = [
    { id: 'vehicle-1', name: 'Vehicle TRK-1001' },
    { id: 'vehicle-2', name: 'Vehicle TRK-1002' },
    { id: 'vehicle-3', name: 'Vehicle TRK-1003' },
    { id: 'vehicle-4', name: 'Vehicle TRK-1004' },
    { id: 'vehicle-5', name: 'Vehicle TRK-1005' },
    { id: 'vehicle-6', name: 'Vehicle TRK-1006' },
    { id: 'vehicle-7', name: 'Vehicle TRK-1007' },
    { id: 'vehicle-8', name: 'Vehicle TRK-1008' },
    { id: 'vehicle-9', name: 'Vehicle TRK-1009' },
    { id: 'vehicle-10', name: 'Vehicle TRK-1010' },
  ];

  // Each voyage: { start (hour offset), stations: [4 stops], durations: [7 phase durations] }
  // Phases: Station Start, Transit1, Hub1, Transit2, Hub2, Transit3, Station End
  const voyages: { start: number; stations: string[]; durations: number[] }[][] = [
    [ // Vehicle 1
      { start: 0,  stations: ['Mumbai Stn', 'Delhi Hub', 'Jaipur Hub', 'Ahmedabad Stn'], durations: [1, 4, 1, 3, 1, 3.5, 1] },
      { start: 16, stations: ['Ahmedabad Stn', 'Surat Hub', 'Pune Hub', 'Mumbai Stn'],   durations: [1, 3, 1, 2.5, 1, 3, 1] },
      { start: 30, stations: ['Mumbai Stn', 'Nashik Hub', 'Indore Hub', 'Delhi Stn'],     durations: [1, 3.5, 1, 3, 1, 4, 1] },
    ],
    [ // Vehicle 2
      { start: 1,  stations: ['Chennai Stn', 'Bangalore Hub', 'Hyderabad Hub', 'Vizag Stn'],       durations: [1, 3.5, 1, 3, 1, 3, 1] },
      { start: 15, stations: ['Vizag Stn', 'Bhubaneswar Hub', 'Raipur Hub', 'Chennai Stn'],        durations: [1, 3, 1, 2.5, 1, 3.5, 1] },
      { start: 29, stations: ['Chennai Stn', 'Coimbatore Hub', 'Kochi Hub', 'Trivandrum Stn'],     durations: [1, 2.5, 1, 2, 1, 2.5, 1] },
    ],
    [ // Vehicle 3
      { start: 2,  stations: ['Kolkata Stn', 'Patna Hub', 'Lucknow Hub', 'Kanpur Stn'],    durations: [1, 4, 1, 3.5, 1, 3, 1] },
      { start: 18, stations: ['Kanpur Stn', 'Agra Hub', 'Jaipur Hub', 'Kolkata Stn'],      durations: [1, 3, 1, 3, 1, 4, 1] },
      { start: 34, stations: ['Kolkata Stn', 'Ranchi Hub', 'Varanasi Hub', 'Lucknow Stn'], durations: [1, 3.5, 1, 3, 1, 3, 1] },
    ],
    [ // Vehicle 4
      { start: 0.5, stations: ['Pune Stn', 'Nagpur Hub', 'Bhopal Hub', 'Jaipur Stn'],        durations: [1, 3.5, 1, 3, 1, 3.5, 1] },
      { start: 15,  stations: ['Jaipur Stn', 'Udaipur Hub', 'Ahmedabad Hub', 'Pune Stn'],    durations: [1, 3, 1, 2.5, 1, 3, 1] },
      { start: 28,  stations: ['Pune Stn', 'Solapur Hub', 'Gulbarga Hub', 'Hyderabad Stn'],  durations: [1, 3, 1, 2.5, 1, 3, 1] },
    ],
    [ // Vehicle 5
      { start: 1.5, stations: ['Delhi Stn', 'Chandigarh Hub', 'Amritsar Hub', 'Jammu Stn'],     durations: [1, 3, 1, 2.5, 1, 3, 1] },
      { start: 14,  stations: ['Jammu Stn', 'Ludhiana Hub', 'Dehradun Hub', 'Delhi Stn'],       durations: [1, 3.5, 1, 3, 1, 3.5, 1] },
      { start: 30,  stations: ['Delhi Stn', 'Agra Hub', 'Gwalior Hub', 'Bhopal Stn'],           durations: [1, 3, 1, 3, 1, 3.5, 1] },
    ],
    [ // Vehicle 6
      { start: 2.5, stations: ['Hyderabad Stn', 'Warangal Hub', 'Nagpur Hub', 'Raipur Stn'],   durations: [1, 3.5, 1, 3.5, 1, 3, 1] },
      { start: 17,  stations: ['Raipur Stn', 'Bilaspur Hub', 'Jabalpur Hub', 'Hyderabad Stn'], durations: [1, 3, 1, 3, 1, 4, 1] },
      { start: 32,  stations: ['Hyderabad Stn', 'Vijayawada Hub', 'Guntur Hub', 'Chennai Stn'],durations: [1, 3, 1, 2.5, 1, 3, 1] },
    ],
    [ // Vehicle 7
      { start: 0,  stations: ['Bangalore Stn', 'Mysore Hub', 'Mangalore Hub', 'Goa Stn'],     durations: [1, 2.5, 1, 3, 1, 3, 1] },
      { start: 13, stations: ['Goa Stn', 'Belgaum Hub', 'Kolhapur Hub', 'Bangalore Stn'],     durations: [1, 3, 1, 2.5, 1, 3.5, 1] },
      { start: 27, stations: ['Bangalore Stn', 'Salem Hub', 'Madurai Hub', 'Kochi Stn'],      durations: [1, 3, 1, 3, 1, 3, 1] },
    ],
    [ // Vehicle 8
      { start: 3,  stations: ['Lucknow Stn', 'Varanasi Hub', 'Patna Hub', 'Ranchi Stn'],      durations: [1, 3.5, 1, 3, 1, 3.5, 1] },
      { start: 18, stations: ['Ranchi Stn', 'Jamshedpur Hub', 'Kolkata Hub', 'Lucknow Stn'],  durations: [1, 3, 1, 3.5, 1, 3, 1] },
      { start: 32, stations: ['Lucknow Stn', 'Allahabad Hub', 'Kanpur Hub', 'Agra Stn'],      durations: [1, 2.5, 1, 2, 1, 2.5, 1] },
    ],
    [ // Vehicle 9
      { start: 1,  stations: ['Ahmedabad Stn', 'Vadodara Hub', 'Surat Hub', 'Mumbai Stn'],    durations: [1, 2.5, 1, 2, 1, 3, 1] },
      { start: 12, stations: ['Mumbai Stn', 'Thane Hub', 'Nashik Hub', 'Ahmedabad Stn'],      durations: [1, 2, 1, 3, 1, 3.5, 1] },
      { start: 25, stations: ['Ahmedabad Stn', 'Rajkot Hub', 'Jamnagar Hub', 'Dwarka Stn'],   durations: [1, 3, 1, 2.5, 1, 3, 1] },
    ],
    [ // Vehicle 10
      { start: 2,  stations: ['Bhopal Stn', 'Indore Hub', 'Ujjain Hub', 'Udaipur Stn'],       durations: [1, 3, 1, 2.5, 1, 3.5, 1] },
      { start: 16, stations: ['Udaipur Stn', 'Jodhpur Hub', 'Bikaner Hub', 'Jaipur Stn'],     durations: [1, 3.5, 1, 3, 1, 3, 1] },
      { start: 30, stations: ['Jaipur Stn', 'Ajmer Hub', 'Kota Hub', 'Bhopal Stn'],           durations: [1, 2.5, 1, 3, 1, 3, 1] },
    ],
  ];

  const tasks: GanttTask[] = [];

  vehicles.forEach((vehicle, vi) => {
    voyages[vi].forEach((voyage, vyi) => {
      const voyageId = `${vehicle.id}-voyage-${vyi + 1}`;
      const { start: startH, stations, durations } = voyage;
      const totalH = durations.reduce((a, b) => a + b, 0);
      const progress = vyi === 0 ? 100 : vyi === 1 ? 45 : 0;

      // Build 7 phases: Stn Start, Transit, Hub1, Transit, Hub2, Transit, Stn End
      const phaseLabels: { name: string; color: string; desc: string; css?: string }[] = [
        { name: stations[0], color: colors.station, desc: `Departure: ${stations[0]}`, css: 'station-pill' },
        { name: 'Transit',   color: colors.transit, desc: `${stations[0]} → ${stations[1]}`, css: 'transit-arrow' },
        { name: stations[1], color: colors.hub,     desc: `Stop: ${stations[1]}`, css: 'hub-badge' },
        { name: 'Transit',   color: colors.transit, desc: `${stations[1]} → ${stations[2]}`, css: 'transit-arrow' },
        { name: stations[2], color: colors.hub,     desc: `Stop: ${stations[2]}`, css: 'hub-badge' },
        { name: 'Transit',   color: colors.transit, desc: `${stations[2]} → ${stations[3]}`, css: 'transit-arrow' },
        { name: stations[3], color: colors.station, desc: `Arrival: ${stations[3]}`, css: 'station-pill' },
      ];

      let cursor = startH;
      const subtasks = phaseLabels.map((p, pi) => {
        const s = cursor;
        cursor += durations[pi];
        return {
          id: `${voyageId}-phase-${pi}`,
          name: p.name,
          start: h(s),
          end: h(cursor),
          color: p.color,
          description: p.desc,
          progress: vyi === 0 ? 100 : vyi === 1 && pi <= 3 ? 100 : vyi === 1 && pi === 4 ? 50 : 0,
          ...(p.css ? { cssClass: p.css } : {}),
        };
      });

      tasks.push({
        id: voyageId,
        name: vehicle.name,
        start: h(startH),
        end: h(startH + totalH),
        progress,
        parentId: null,
        collapsed: false,
        isMilestone: false,
        rowId: vehicle.id,
        color: '#f1f3f5',
        meta: {
          vehicle: vehicle.name,
          voyageNo: vyi + 1,
          origin: stations[0],
          destination: stations[stations.length - 1],
          route: stations.join(' → '),
        },
        subtasks,
      });
    });
  });

  return tasks;
}

/** No inter-voyage dependencies — transit arrows visually connect the phases. */
export function getTransportDependencies(): GanttDependency[] {
  return [];
}

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
