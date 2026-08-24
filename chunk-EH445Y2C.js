import{Ma as i,Pb as n,Qb as a,_a as d,ub as e,vb as t}from"./chunk-5NA2GCAU.js";var m=class r{importCode=`import { Component } from '@angular/core';
import {
  GanttChartComponent,
  GanttTask,
  GanttDependency,
  GanttConfig,
  ZoomLevel,
  GanttTaskChangeEvent,
} from 'ngx-core-components';

@Component({
  selector: 'app-my-gantt',
  standalone: true,
  imports: [GanttChartComponent],
  template: \`<ngx-gantt-chart [tasks]="tasks" [config]="config" />\`,
})
export class MyGanttComponent {
  tasks: GanttTask[] = [ /* ... */ ];
  config: Partial<GanttConfig> = { zoomLevel: ZoomLevel.Day };
}`;templateCode=`<ngx-gantt-chart
  [tasks]="tasks"
  [dependencies]="dependencies"
  [config]="config"
  (taskChange)="onTaskChange($event)"
  (taskClick)="onTaskClick($event)"
/>`;dataCode=`tasks: GanttTask[] = [
  {
    id: '1',
    name: 'Requirements',
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 10),
    progress: 100,
    parentId: null,
    collapsed: false,
    isMilestone: false,
  },
  {
    id: '2',
    name: 'Design',
    start: new Date(2025, 0, 10),
    end: new Date(2025, 0, 20),
    progress: 60,
    parentId: null,
    collapsed: false,
    isMilestone: false,
    color: '#8e44ad',
  },
];

dependencies: GanttDependency[] = [
  { fromId: '1', toId: '2', type: DependencyType.FinishToStart },
];`;configCode=`config: Partial<GanttConfig> = {
  zoomLevel: ZoomLevel.Day,  // Day | Week | Month
  rowHeight: 36,
  columnWidth: 36,
  headerHeight: 56,
  sidebarWidth: 350,
  showTodayMarker: true,
  showGrid: true,
  snapTo: 'day',       // 'day' | 'none'
  collapsible: true,
  locale: 'en-US',
};`;themingCode=`/* In your component or global styles */
ngx-gantt-chart {
  --ngx-gantt-bar-bg: #0077cc;
  --ngx-gantt-bar-progress-bg: #005fa3;
  --ngx-gantt-today-color: #e74c3c;
}`;cssVarsCode=`--ngx-gantt-bg              /* Background color */
--ngx-gantt-alt-bg           /* Alternate row color */
--ngx-gantt-border           /* Border color */
--ngx-gantt-grid-line        /* Grid line color */
--ngx-gantt-weekend-bg       /* Weekend column background */
--ngx-gantt-header-bg        /* Header background */
--ngx-gantt-header-text      /* Header text color */
--ngx-gantt-text             /* Primary text color */
--ngx-gantt-text-secondary   /* Secondary text color */
--ngx-gantt-bar-bg           /* Task bar background */
--ngx-gantt-bar-progress-bg  /* Progress fill color */
--ngx-gantt-bar-text         /* Task bar text color */
--ngx-gantt-summary-color    /* Summary bar color */
--ngx-gantt-milestone-color  /* Milestone diamond color */
--ngx-gantt-arrow-color      /* Dependency arrow color */
--ngx-gantt-today-color      /* Today marker color */
--ngx-gantt-hover-bg         /* Row hover background */
--ngx-gantt-selected-bg      /* Selected row background */
--ngx-gantt-focus-ring       /* Focus outline color */`;taskModelCode=`interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;          // 0-100
  parentId: string | null;   // null for root tasks
  collapsed: boolean;
  isMilestone: boolean;
  color?: string;            // Custom bar color
  draggable?: boolean;       // Default: true
  cssClass?: string;
  meta?: Record<string, unknown>;
}`;depModelCode=`enum DependencyType {
  FinishToStart = 'FS',
  StartToStart = 'SS',
  FinishToFinish = 'FF',
  StartToFinish = 'SF',
}

interface GanttDependency {
  fromId: string;
  toId: string;
  type: DependencyType;
  color?: string;
  cssClass?: string;
}`;inputsExampleCode=`import { Component, signal } from '@angular/core';
import { NumericTextBoxComponent, TimePickerComponent } from 'ngx-core-components/inputs';

@Component({
  standalone: true,
  imports: [NumericTextBoxComponent, TimePickerComponent],
  template: \`
    <ngx-numeric-textbox
      [value]="quantity()"
      label="Quantity"
      [min]="0"
      [max]="50"
      [step]="1"
      (valueChange)="quantity.set($event)"
    />

    <ngx-time-picker
      [value]="meetingTime()"
      label="Meeting Time"
      [use12h]="true"
      (timeChange)="meetingTime.set($event)"
    />
  \`,
})
export class MyInputsComponent {
  quantity = signal(3);
  meetingTime = signal('14:30');
}`;dataGridExampleCode=`import {
  Component,
  signal,
} from '@angular/core';
import {
  DataGridComponent,
  GridColumnDef,
  GridDataStateChangeEvent,
  GridGroupState,
} from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [DataGridComponent],
  template: \`
    <ngx-data-grid
      [data]="rows()"
      [columns]="columns"
      [page]="page()"
      [pageSize]="10"
      [total]="total()"
      [sortMode]="'server'"
      [filterMode]="'server'"
      [groupMode]="'server'"
      [pagingMode]="'server'"
      [groupBy]="group()"
      [groupedData]="groupedRows()"
      [editable]="true"
      (dataStateChange)="onDataStateChange($event)"
      (rowUpdate)="onRowUpdate($event)"
    />
  \`,
})
export class MyGridComponent {
  page = signal(1);
  total = signal(0);
  rows = signal<any[]>([]);
  groupedRows = signal<any[]>([]);
  group = signal<GridGroupState | null>({ field: 'department', dir: 'asc' });

  columns: GridColumnDef[] = [
    { field: 'name', title: 'Name', sortable: true, filterable: true, editable: true },
    { field: 'department', title: 'Department', sortable: true, filterable: true, groupable: true },
    { field: 'salary', title: 'Salary', sortable: true, align: 'right', editable: true },
  ];

  onDataStateChange(state: GridDataStateChangeEvent): void {
    // Call backend with state.page/state.sort/state.filters/state.group
  }

  onRowUpdate(event: any): void {
    // Save inline edits
  }
}`;static \u0275fac=function(l){return new(l||r)};static \u0275cmp=d({type:r,selectors:[["app-getting-started"]],decls:252,vars:10,consts:[[1,"docs-page"],[1,"docs-content"],[1,"doc-section"],[1,"code-block"],[1,"prop-table"]],template:function(l,o){l&1&&(e(0,"div",0)(1,"div",1)(2,"h1"),n(3,"How to Use ngx-core-components"),t(),e(4,"section",2)(5,"h2"),n(6,"1. Installation"),t(),e(7,"pre",3)(8,"code"),n(9,"npm install ngx-core-components"),t()()(),e(10,"section",2)(11,"h2"),n(12,"2. Import the Component"),t(),e(13,"pre",3)(14,"code"),n(15),t()()(),e(16,"section",2)(17,"h2"),n(18,"3. Basic Usage"),t(),e(19,"p"),n(20,"Add the Gantt chart to your template:"),t(),e(21,"pre",3)(22,"code"),n(23),t()()(),e(24,"section",2)(25,"h2"),n(26,"4. Define Your Data"),t(),e(27,"pre",3)(28,"code"),n(29),t()()(),e(30,"section",2)(31,"h2"),n(32,"5. Configuration Options"),t(),e(33,"pre",3)(34,"code"),n(35),t()(),e(36,"table",4)(37,"thead")(38,"tr")(39,"th"),n(40,"Property"),t(),e(41,"th"),n(42,"Type"),t(),e(43,"th"),n(44,"Default"),t(),e(45,"th"),n(46,"Description"),t()()(),e(47,"tbody")(48,"tr")(49,"td"),n(50,"zoomLevel"),t(),e(51,"td"),n(52,"ZoomLevel"),t(),e(53,"td"),n(54,"Day"),t(),e(55,"td"),n(56,"Timeline zoom level (Day, Week, Month)"),t()(),e(57,"tr")(58,"td"),n(59,"rowHeight"),t(),e(60,"td"),n(61,"number"),t(),e(62,"td"),n(63,"40"),t(),e(64,"td"),n(65,"Height of each task row in pixels"),t()(),e(66,"tr")(67,"td"),n(68,"columnWidth"),t(),e(69,"td"),n(70,"number"),t(),e(71,"td"),n(72,"40"),t(),e(73,"td"),n(74,"Width of each column in pixels"),t()(),e(75,"tr")(76,"td"),n(77,"sidebarWidth"),t(),e(78,"td"),n(79,"number"),t(),e(80,"td"),n(81,"280"),t(),e(82,"td"),n(83,"Width of the left tree panel"),t()(),e(84,"tr")(85,"td"),n(86,"headerHeight"),t(),e(87,"td"),n(88,"number"),t(),e(89,"td"),n(90,"60"),t(),e(91,"td"),n(92,"Height of the timeline header"),t()(),e(93,"tr")(94,"td"),n(95,"showTodayMarker"),t(),e(96,"td"),n(97,"boolean"),t(),e(98,"td"),n(99,"true"),t(),e(100,"td"),n(101,"Show today marker line"),t()(),e(102,"tr")(103,"td"),n(104,"showGrid"),t(),e(105,"td"),n(106,"boolean"),t(),e(107,"td"),n(108,"true"),t(),e(109,"td"),n(110,"Show background grid"),t()(),e(111,"tr")(112,"td"),n(113,"snapTo"),t(),e(114,"td"),n(115,"'day' | 'none'"),t(),e(116,"td"),n(117,"'day'"),t(),e(118,"td"),n(119,"Snap mode for drag operations"),t()(),e(120,"tr")(121,"td"),n(122,"collapsible"),t(),e(123,"td"),n(124,"boolean"),t(),e(125,"td"),n(126,"true"),t(),e(127,"td"),n(128,"Allow collapsing parent tasks"),t()(),e(129,"tr")(130,"td"),n(131,"locale"),t(),e(132,"td"),n(133,"string"),t(),e(134,"td"),n(135,"'en-US'"),t(),e(136,"td"),n(137,"Date format locale"),t()()()()(),e(138,"section",2)(139,"h2"),n(140,"6. Events"),t(),e(141,"table",4)(142,"thead")(143,"tr")(144,"th"),n(145,"Event"),t(),e(146,"th"),n(147,"Payload"),t(),e(148,"th"),n(149,"Description"),t()()(),e(150,"tbody")(151,"tr")(152,"td"),n(153,"(taskChange)"),t(),e(154,"td"),n(155,"GanttTaskChangeEvent"),t(),e(156,"td"),n(157,"Fired when a task is dragged or resized"),t()(),e(158,"tr")(159,"td"),n(160,"(taskClick)"),t(),e(161,"td"),n(162,"GanttTaskClickEvent"),t(),e(163,"td"),n(164,"Fired when a task is clicked"),t()(),e(165,"tr")(166,"td"),n(167,"(taskDblClick)"),t(),e(168,"td"),n(169,"GanttTaskClickEvent"),t(),e(170,"td"),n(171,"Fired on double-click"),t()(),e(172,"tr")(173,"td"),n(174,"(dependencyClick)"),t(),e(175,"td"),n(176,"GanttDependencyClickEvent"),t(),e(177,"td"),n(178,"Fired when a dependency line is clicked"),t()(),e(179,"tr")(180,"td"),n(181,"(zoomChange)"),t(),e(182,"td"),n(183,"ZoomLevel"),t(),e(184,"td"),n(185,"Fired when zoom level changes"),t()()()()(),e(186,"section",2)(187,"h2"),n(188,"7. Public Methods"),t(),e(189,"table",4)(190,"thead")(191,"tr")(192,"th"),n(193,"Method"),t(),e(194,"th"),n(195,"Description"),t()()(),e(196,"tbody")(197,"tr")(198,"td"),n(199,"scrollToDate(date)"),t(),e(200,"td"),n(201,"Scroll the timeline to a specific date"),t()(),e(202,"tr")(203,"td"),n(204,"scrollToTask(taskId)"),t(),e(205,"td"),n(206,"Scroll vertically to a specific task"),t()(),e(207,"tr")(208,"td"),n(209,"expandAll()"),t(),e(210,"td"),n(211,"Expand all collapsed parent tasks"),t()(),e(212,"tr")(213,"td"),n(214,"collapseAll()"),t(),e(215,"td"),n(216,"Collapse all parent tasks"),t()()()()(),e(217,"section",2)(218,"h2"),n(219,"8. Theming with CSS Custom Properties"),t(),e(220,"pre",3)(221,"code"),n(222),t()(),e(223,"p"),n(224,"Available CSS variables:"),t(),e(225,"pre",3)(226,"code"),n(227),t()()(),e(228,"section",2)(229,"h2"),n(230,"9. Task Model"),t(),e(231,"pre",3)(232,"code"),n(233),t()()(),e(234,"section",2)(235,"h2"),n(236,"10. Dependency Model"),t(),e(237,"pre",3)(238,"code"),n(239),t()()(),e(240,"section",2)(241,"h2"),n(242,"11. Structured Inputs Example"),t(),e(243,"pre",3)(244,"code"),n(245),t()()(),e(246,"section",2)(247,"h2"),n(248,"12. Data Grid Enterprise Example"),t(),e(249,"pre",3)(250,"code"),n(251),t()()()()()),l&2&&(i(15),a(o.importCode),i(8),a(o.templateCode),i(6),a(o.dataCode),i(6),a(o.configCode),i(187),a(o.themingCode),i(5),a(o.cssVarsCode),i(6),a(o.taskModelCode),i(6),a(o.depModelCode),i(6),a(o.inputsExampleCode),i(6),a(o.dataGridExampleCode))},styles:["[_nghost-%COMP%]{display:block;height:100%;overflow-y:auto}.docs-page[_ngcontent-%COMP%]{padding:24px 32px;max-width:900px}.docs-content[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:24px;font-weight:700;margin:0 0 24px;color:#212529}.doc-section[_ngcontent-%COMP%]{margin-bottom:28px}.doc-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:16px;font-weight:600;color:#212529;margin:0 0 8px}.doc-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:14px;color:#495057;margin:4px 0 8px}.code-block[_ngcontent-%COMP%]{background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:6px;font-size:13px;font-family:SF Mono,Monaco,Consolas,monospace;overflow-x:auto;white-space:pre;line-height:1.5}.prop-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}.prop-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{text-align:left;padding:8px 12px;background:#f1f3f5;border:1px solid #dee2e6;font-weight:600;color:#495057}.prop-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:8px 12px;border:1px solid #dee2e6;color:#212529}.prop-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:first-child{font-family:monospace;color:#e74c3c}"]})};export{m as GettingStartedComponent};
