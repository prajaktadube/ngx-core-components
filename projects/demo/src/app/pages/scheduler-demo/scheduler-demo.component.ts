import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulerComponent, SchedulerEvent, SchedulerSlotClickEvent, SchedulerResource, SchedulerSlotRangeSelectEvent, SchedulerEventChangeEvent } from 'ngx-core-components/views';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-scheduler-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, SchedulerComponent],
  template: `
    <div class="demo-page">
      
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Scheduler &amp; Planner</h1>
          <p>
            An enterprise-grade, signal-driven appointment scheduler for managing task slots, team members, and milestones. Supports dragging, resizing, drag-to-create selection ranges, and multi-resource Day column views.
          </p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Resource Column Day View</span>
          <span class="badge badge-blue">Drag-to-Create</span>
          <span class="badge badge-green">Enterprise Export</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO TAB ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <div class="scheduler-grid-layout">
            
            <!-- Left panel: Controls, Scheduling Form, and Logs -->
            <div class="control-panel-card">
              
              <!-- Features Toggle -->
              <h3>Scheduling Settings</h3>
              <p class="panel-desc">Configure views and toggle resource columns.</p>
              
              <div class="setting-toggle-box" style="display: flex; flex-direction: column; gap: 10px;">
                <div class="switch-row">
                  <div class="switch-label-wrap">
                    <span class="switch-title">Team Resources Mode</span>
                    <span class="switch-desc">Groups Day view by team columns</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" [checked]="useResources()" (change)="toggleResourcesMode($event)" />
                    <span class="slider round"></span>
                  </label>
                </div>

                <div class="section-divider" style="margin: 4px 0;"></div>

                <div class="switch-row">
                  <div class="switch-label-wrap">
                    <span class="switch-title">Work Hours Only</span>
                    <span class="switch-desc">Crop hourly grid to business hours</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" [checked]="showWorkHoursOnly()" (change)="toggleWorkHoursOnly($event)" />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>

              <div class="section-divider"></div>

              <!-- Quick Add Event / Range Selection Modal -->
              @if (activeFormMode(); as mode) {
                <div class="scheduler-modal-card">
                  <div class="modal-header">
                    <h4>{{ mode === 'create' ? 'Schedule Appointment' : 'Edit Appointment' }}</h4>
                    <button class="close-modal-btn" (click)="activeFormMode.set(null)">×</button>
                  </div>
                  <div class="modal-body">
                    <div class="form-group">
                      <label>Event Title</label>
                      <input type="text" class="form-control" [(ngModel)]="newEventTitle" placeholder="e.g. Sprint Review" />
                    </div>
                    <div class="form-group">
                      <label>Category</label>
                      <select class="form-control" [(ngModel)]="newEventCategory">
                        <option value="meeting">Meeting (Blue)</option>
                        <option value="task">Task (Green)</option>
                        <option value="important">Important (Red)</option>
                        <option value="warning">Warning (Orange)</option>
                        <option value="milestone">Milestone (Purple)</option>
                        <option value="personal">Personal (Teal)</option>
                      </select>
                    </div>
                    @if (useResources()) {
                      <div class="form-group">
                        <label>Assign Team Member</label>
                        <select class="form-control" [(ngModel)]="newEventResourceId">
                          <option value="">None (Unassigned)</option>
                          @for (res of mockResources; track res.id) {
                            <option [value]="res.id">{{ res.name }}</option>
                          }
                        </select>
                      </div>
                    }
                    <div class="form-group">
                      <label>Description</label>
                      <textarea class="form-control" [(ngModel)]="newEventDescription" rows="2" placeholder="Brief objectives..."></textarea>
                    </div>

                    <!-- Custom Hex Color Override -->
                    <div class="form-group">
                      <label>Custom Hex Color</label>
                      <input type="text" class="form-control" [(ngModel)]="newEventColor" placeholder="e.g. #ff007f or #8b5cf6" />
                    </div>

                    <!-- Task Completion switch (Only if task category is active) -->
                    @if (newEventCategory === 'task') {
                      <div class="form-group setting-toggle-box" style="margin-top: 4px;">
                        <div class="switch-row">
                          <div class="switch-label-wrap">
                            <span class="switch-title">Task Completed</span>
                            <span class="switch-desc">Cross-off task on planner</span>
                          </div>
                          <label class="switch">
                            <input type="checkbox" [(ngModel)]="formIsCompleted" />
                            <span class="slider round"></span>
                          </label>
                        </div>
                      </div>
                    }

                    <!-- All-Day Event Switch -->
                    <div class="form-group setting-toggle-box" style="margin-top: 4px;">
                      <div class="switch-row">
                        <div class="switch-label-wrap">
                          <span class="switch-title">All-Day Event</span>
                          <span class="switch-desc">Spans the entire day</span>
                        </div>
                        <label class="switch">
                          <input type="checkbox" [(ngModel)]="formIsAllDay" />
                          <span class="slider round"></span>
                        </label>
                      </div>
                    </div>

                    <!-- Recurrence Option Fields -->
                    <div class="form-group setting-toggle-box" style="margin-top: 4px;">
                      <div class="switch-row">
                        <div class="switch-label-wrap">
                          <span class="switch-title">Repeat Series</span>
                          <span class="switch-desc">Make this a recurring event</span>
                        </div>
                        <label class="switch">
                          <input type="checkbox" [(ngModel)]="formIsRecurring" />
                          <span class="slider round"></span>
                        </label>
                      </div>
                    </div>

                    @if (formIsRecurring) {
                      <div class="recurrence-subform" style="display: flex; flex-direction: column; gap: 8px; padding-left: 8px; border-left: 2px solid var(--primary-color, #4f46e5); margin-top: 4px;">
                        <div class="form-group">
                          <label>Frequency</label>
                          <select class="form-control" [(ngModel)]="formRecurrenceFreq">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>Interval</label>
                          <input type="number" class="form-control" [(ngModel)]="formRecurrenceInterval" min="1" />
                        </div>
                        <div class="form-group">
                          <label>End Repeat Date</label>
                          <input type="date" class="form-control" [(ngModel)]="formRecurrenceUntil" />
                        </div>
                      </div>
                    }

                    <div class="time-summary">
                      <svg class="time-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.3L11 12.9V7h1.5v5.2l3.7 2.2-.7 1.1z"/></svg>
                      <span>{{ formatTimeSummary(formStart(), formEnd()) }}</span>
                    </div>
                  </div>
                  <div class="modal-footer">
                    @if (mode === 'edit') {
                      <button class="btn btn-outline danger-btn" (click)="deleteSelectedEvent()">Delete</button>
                    }
                    <button class="btn btn-outline" (click)="activeFormMode.set(null)">Cancel</button>
                    <button class="btn btn-primary" (click)="confirmSaveEvent()">
                      {{ mode === 'create' ? 'Schedule' : 'Save' }}
                    </button>
                  </div>
                </div>
                <div class="section-divider"></div>
              }

              <!-- Event Generators and Cleanups -->
              <h3>Quick Actions</h3>
              <div class="options-group">
                <button class="action-btn primary" (click)="addMockMeeting()">
                  ➕ Schedule Team Sync
                </button>
                <button class="action-btn success" (click)="addMockMilestone()">
                  ⭐ Add Milestone Deadline
                </button>
                <button class="action-btn danger" (click)="clearAllEvents()">
                  🗑️ Clear All Events
                </button>
              </div>

              <div class="section-divider"></div>

              <!-- Activity Log Console -->
              <h3>Activity Console</h3>
              <div class="logs-box">
                @if (logs().length === 0) {
                  <span class="empty-logs">No interactions logged. Drag/resize cards, drag slots to create, or query calendars.</span>
                } @else {
                  @for (log of logs(); track $index) {
                    <div class="log-item">
                      <span class="log-time">[{{ log.time | date:'HH:mm:ss' }}]</span>
                      <span class="log-text">{{ log.text }}</span>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Right panel: Live Interactive Scheduler Component -->
            <div class="scheduler-view-card">
              <ngx-scheduler
                [events]="events()"
                [currentDate]="activeDate()"
                (currentDateChange)="activeDate.set($event)"
                [viewMode]="viewMode()"
                [theme]="theme()"
                [resources]="useResources() ? mockResources : []"
                [enableDragToCreate]="true"
                [showSearch]="true"
                [showWorkHoursOnly]="showWorkHoursOnly()"
                (eventClick)="onEventClick($event)"
                (slotClick)="onSlotClick($event)"
                (slotRangeSelect)="onSlotRangeSelect($event)"
                (eventDelete)="onEventDelete($event)"
                (eventTimeChange)="onEventTimeChange($event)"
              />
            </div>

          </div>

          <div class="section-label">How to Use &amp; Developer Guides</div>
          <div class="documentation-guide-grid">
            <div class="guide-column">
              <h4>1. Standard Integration</h4>
              <p>Import <code>SchedulerComponent</code> into your standalone component and bind the events list. Use two-way binding on <code>currentDate</code> to let the user navigate dates.</p>
              <pre class="code-block" style="margin-top: 8px;">{{ codeSnippet }}</pre>
            </div>
            <div class="guide-column flex-column" style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <h4>2. Multi-Resource Columns</h4>
                <p>Provide an array of <code>SchedulerResource</code> records. When the view mode is set to <code>'day'</code>, the grid renders resource-specific columns side-by-side. In week/month views, resource filters populate in the toolbar.</p>
              </div>
              <div>
                <h4>3. Drag-to-Create Time Ranges</h4>
                <p>Enable <code>[enableDragToCreate]="true"</code>. Users can click and drag vertically on empty slots. Upon release, <code>(slotRangeSelect)</code> emits the range bounds, letting you prompt to schedule a new event.</p>
              </div>
              <div>
                <h4>4. Task Completion Checklists</h4>
                <p>For events of category <code>'task'</code>, passing <code>completed: true</code> renders an interactive checkbox and strike-through styling. Clicking the checkbox emits the updated record over the <code>(eventTimeChange)</code> pipe.</p>
              </div>
              <div>
                <h4>5. Client-Side Export Formats</h4>
                <p>Access the scheduler instance component ref and invoke public helper methods: <code>exportToICS()</code> (standard iCal format), <code>exportToCSV()</code> (comma-separated table), or <code>exportToJSON()</code> (raw events payload).</p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ===== API REFERENCE TAB ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Scheduler Properties (ngx-scheduler)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of apiRows; track row.name) {
                  <tr>
                    <td class="api-name">{{ row.name }}</td>
                    <td class="api-type">{{ row.type }}</td>
                    <td class="api-default">{{ row.default }}</td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }

    .demo-page {
      padding: 32px 40px;
      max-width: 1300px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
    }
    .page-header-text h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 900;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.5px;
    }
    .page-header-text p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary, #64748b);
      line-height: 1.7;
      max-width: 760px;
    }

    .header-badges {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 16px;
      transition: all 0.2s ease;
    }
    .badge-purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.1); }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.1); }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.1); }

    .tab-nav {
      display: flex;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
      overflow-x: auto;
    }
    .tab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-family: inherit;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text-primary, #0f172a);
      background: rgba(79, 70, 229, 0.05);
    }
    .tab-btn.active {
      color: var(--primary-color, #4f46e5);
      border-bottom-color: var(--primary-color, #4f46e5);
      font-weight: 600;
      background: rgba(79, 70, 229, 0.04);
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Grid dashboard layout */
    .scheduler-grid-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
      align-items: stretch;
    }
    @media (max-width: 1024px) {
      .scheduler-grid-layout {
        grid-template-columns: 1fr;
      }
    }

    .control-panel-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .control-panel-card h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-primary, #0f172a);
    }
    .panel-desc {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      margin: 0 0 6px;
      line-height: 1.4;
    }

    /* Toggle Switches styling */
    .setting-toggle-box {
      border: 1px solid var(--border-light, #e2e8f0);
      background: var(--bg-primary, #f8fafc);
      padding: 10px 14px;
      border-radius: 8px;
    }
    .switch-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .switch-label-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .switch-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }
    .switch-desc {
      font-size: 10px;
      color: var(--text-secondary, #64748b);
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
      flex-shrink: 0;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: .3s;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
    }
    input:checked + .slider {
      background-color: var(--primary-color, #4f46e5);
    }
    input:checked + .slider:before {
      transform: translateX(16px);
    }
    .slider.round {
      border-radius: 20px;
    }
    .slider.round:before {
      border-radius: 50%;
    }

    /* Scheduling Form styling */
    .scheduler-modal-card {
      background: #ffffff;
      border: 1px solid var(--primary-color, #4f46e5);
      border-radius: 8px;
      padding: 14px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
      display: flex;
      flex-direction: column;
      gap: 10px;
      animation: formFade 0.2s ease-out;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light, #e2e8f0);
      padding-bottom: 6px;
    }
    .modal-header h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      color: var(--primary-color, #4f46e5);
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      color: #64748b;
      line-height: 1;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-group label {
      font-size: 10px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .form-control {
      padding: 6px 10px;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      outline: none;
      transition: border 0.15s;
    }
    .form-control:focus {
      border-color: var(--primary-color, #4f46e5);
    }
    .time-summary {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-glow, rgba(79, 70, 229, 0.04));
      border: 1px solid rgba(79, 70, 229, 0.15);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 10px;
      color: var(--primary-color, #4f46e5);
      font-weight: 700;
    }
    .time-icon-svg {
      width: 14px;
      height: 14px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 4px;
    }
    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-outline {
      border: 1px solid #cbd5e1;
      background: transparent;
      color: #475569;
    }
    .btn-outline:hover {
      background: #f1f5f9;
    }
    .btn-outline.danger-btn {
      border-color: #ef4444;
      color: #ef4444;
    }
    .btn-outline.danger-btn:hover {
      background: rgba(239, 68, 68, 0.05);
    }
    .btn-primary {
      border: none;
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #4338ca;
    }

    .options-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .action-btn {
      width: 100%;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s;
      font-family: inherit;
      text-align: left;
      background: var(--bg-secondary, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    .action-btn:hover {
      transform: translateY(-1px);
    }
    .action-btn.primary { border-color: #3b82f6; color: #3b82f6; }
    .action-btn.primary:hover { background: rgba(59, 130, 246, 0.05); }
    .action-btn.success { border-color: #10b981; color: #10b981; }
    .action-btn.success:hover { background: rgba(16, 185, 129, 0.05); }
    .action-btn.danger { border-color: #ef4444; color: #ef4444; }
    .action-btn.danger:hover { background: rgba(239, 68, 68, 0.05); }

    .section-divider {
      height: 1px;
      background: var(--border-color, #e2e8f0);
      margin: 4px 0;
    }

    /* Logs console styles */
    .logs-box {
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      padding: 12px 14px;
      background: var(--bg-primary, #f8fafc);
      min-height: 160px;
      max-height: 240px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .empty-logs {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      font-style: italic;
      line-height: 1.4;
    }
    .log-item {
      font-size: 11px;
      font-family: 'Courier New', monospace;
      color: var(--text-primary, #0f172a);
      line-height: 1.4;
      border-bottom: 1px dashed var(--border-light, #e2e8f0);
      padding-bottom: 4px;
    }
    .log-item:last-child {
      border-bottom: none;
    }
    .log-time {
      color: var(--primary-color, #4f46e5);
      margin-right: 6px;
      font-weight: 700;
    }

    .scheduler-view-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 16px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
    }

    /* Markdown Code Blocks */
    .section-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #8892a0;
      border-bottom: 2px solid var(--border-color, #cbd5e1);
      padding-bottom: 12px;
    }

    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      font-size: 12px;
      font-family: 'Cascadia Code', Consolas, monospace;
      overflow-x: auto;
      white-space: pre;
      margin: 0;
    }

    .documentation-guide-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 32px;
      margin-top: 16px;
    }
    @media (max-width: 992px) {
      .documentation-guide-grid {
        grid-template-columns: 1fr;
      }
    }
    .guide-column h4 {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }
    .guide-column p {
      margin: 0 0 16px;
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      line-height: 1.6;
    }
    .guide-column code {
      background: rgba(79, 70, 229, 0.08);
      color: var(--primary-color, #4f46e5);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    /* API Table */
    .api-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 12px;
      background: var(--bg-secondary, #ffffff);
    }
    .api-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .api-table thead tr {
      background: var(--border-light, #f8fafc);
      border-bottom: 1.5px solid var(--border-color, #cbd5e1);
    }
    .api-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--text-secondary, #475569);
    }
    .api-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-light, #e2e8f0);
      color: var(--text-primary, #0f172a);
      vertical-align: top;
    }
    .api-table tbody tr:hover td {
      background: var(--border-light, #f8fafc);
    }
    .api-table tbody tr:last-child td {
      border-bottom: none;
    }

    .api-name { color: var(--primary-color, #4f46e5) !important; font-family: monospace; font-weight: 700; }
    .api-type { color: #a855f7 !important; font-family: monospace; }
    .api-default { font-family: monospace; color: #f43f5e; font-weight: 500; }

    @keyframes formFade {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SchedulerDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  activeDate = signal<Date>(new Date());
  viewMode = signal<'day' | 'week' | 'month'>('week');
  theme = signal<'light' | 'dark'>('light');

  // Resource mode and work hours signal
  useResources = signal<boolean>(true);
  showWorkHoursOnly = signal<boolean>(true);

  // Activity events logging
  logs = signal<{ time: Date; text: string }[]>([]);

  // Form Mode State
  activeFormMode = signal<'create' | 'edit' | null>(null);
  formEventId = '';
  formStart = signal<Date>(new Date());
  formEnd = signal<Date>(new Date());

  newEventTitle = '';
  newEventCategory: 'meeting' | 'task' | 'important' | 'warning' | 'milestone' | 'personal' = 'meeting';
  newEventResourceId = '';
  newEventDescription = '';
  newEventColor = '';
  formIsCompleted = false;
  formIsAllDay = false;

  formIsRecurring = false;
  formRecurrenceFreq: 'daily' | 'weekly' | 'monthly' = 'weekly';
  formRecurrenceInterval = 1;
  formRecurrenceUntil = '';

  // Mock Resources
  mockResources: SchedulerResource[] = [
    { id: 'alice', name: 'Alice Vance', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', description: 'UX Designer' },
    { id: 'bob', name: 'Bob Smith', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', description: 'Lead Developer' },
    { id: 'charlie', name: 'Charlie Kim', description: 'Product Owner', color: 'hsl(142, 60%, 45%)' },
    { id: 'diana', name: 'Diana Rose', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', description: 'QA Architect' }
  ];

  // Base sample events
  events = signal<SchedulerEvent[]>([
    {
      id: 'all-day-1',
      title: 'Company Hackathon Day 1',
      description: 'Annual coding competition and team events.',
      start: new Date(),
      end: new Date(),
      category: 'milestone',
      isAllDay: true
    },
    {
      id: 'all-day-2',
      title: 'QA Smoke Testing Target',
      description: 'Release build verification sweeps.',
      start: new Date(),
      end: new Date(),
      category: 'task',
      resourceId: 'diana',
      isAllDay: true
    },
    {
      id: 'completed-task-1',
      title: 'Review library README',
      description: 'Ensure layout instructions match ngx standards.',
      start: (() => {
        const d = new Date();
        d.setHours(8, 0, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(9, 0, 0, 0);
        return d;
      })(),
      category: 'task',
      completed: true,
      resourceId: 'alice'
    },
    {
      id: 'custom-color-1',
      title: 'Deepmind Hackathon Planning',
      description: 'Special task with custom branding color override.',
      start: (() => {
        const d = new Date();
        d.setHours(15, 0, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(16, 30, 0, 0);
        return d;
      })(),
      category: 'personal',
      color: '#ff007f',
      resourceId: 'charlie'
    },
    {
      id: '1',
      title: 'Design Critique Session',
      description: 'Discuss team layouts and interactive feedback lines.',
      start: (() => {
        const d = new Date();
        d.setHours(9, 30, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(11, 0, 0, 0);
        return d;
      })(),
      category: 'meeting',
      resourceId: 'alice'
    },
    {
      id: '2',
      title: 'CI Pipeline Debugging',
      description: 'Fixing compilation bottlenecks and karma test hooks.',
      start: (() => {
        const d = new Date();
        d.setHours(11, 30, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(13, 0, 0, 0);
        return d;
      })(),
      category: 'task',
      resourceId: 'bob'
    },
    {
      id: '3',
      title: 'Product Backlog Refinement',
      description: 'Prioritize next sprints items.',
      start: (() => {
        const d = new Date();
        d.setHours(10, 0, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        return d;
      })(),
      category: 'meeting',
      resourceId: 'charlie'
    },
    {
      id: '4',
      title: 'Release Version 0.4.0 Testing',
      description: 'Write manual scenarios and boundary validations.',
      start: (() => {
        const d = new Date();
        d.setHours(13, 30, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(15, 30, 0, 0);
        return d;
      })(),
      category: 'important',
      resourceId: 'diana'
    },
    {
      id: '5',
      title: 'Weekly Sync Series',
      description: 'General check-in with product stack leaders.',
      start: (() => {
        const d = new Date();
        d.setHours(14, 0, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(15, 0, 0, 0);
        return d;
      })(),
      category: 'meeting',
      recurrence: {
        frequency: 'weekly',
        interval: 1
      }
    }
  ]);

  addLog(text: string) {
    this.logs.update(list => [{ time: new Date(), text }, ...list].slice(0, 30));
  }

  toggleResourcesMode(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.useResources.set(isChecked);
    
    if (isChecked) {
      this.viewMode.set('day');
      this.addLog('🛠️ Switched to Resources Column Day layout.');
    } else {
      this.viewMode.set('week');
      this.addLog('🛠️ Switched to Standard Week view.');
    }
  }

  toggleWorkHoursOnly(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.showWorkHoursOnly.set(isChecked);
    this.addLog(`🛠️ Work hours toggle: ${isChecked ? 'Business hours cropped' : 'Full 24 hours (with shading)'}`);
  }

  onEventClick(evt: SchedulerEvent) {
    const resText = evt.resourceId ? ` assigned to ${this.getResourceName(evt.resourceId)}` : '';
    this.addLog(`Opened editor for event: "${evt.title}"${resText}`);
    
    this.activeFormMode.set('edit');
    this.formEventId = evt.id;
    this.formStart.set(evt.start);
    this.formEnd.set(evt.end);
    
    this.newEventTitle = evt.title;
    this.newEventCategory = evt.category || 'meeting';
    this.newEventResourceId = evt.resourceId || '';
    this.newEventDescription = evt.description || '';
    this.newEventColor = evt.color || '';
    this.formIsCompleted = !!evt.completed;
    this.formIsAllDay = !!evt.isAllDay;
    
    this.formIsRecurring = !!evt.recurrence;
    this.formRecurrenceFreq = evt.recurrence?.frequency || 'weekly';
    this.formRecurrenceInterval = evt.recurrence?.interval || 1;
    this.formRecurrenceUntil = evt.recurrence?.until ? new Date(evt.recurrence.until).toISOString().split('T')[0] : '';
  }

  onSlotClick(event: SchedulerSlotClickEvent) {
    const timeLabel = event.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dayLabel = event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const resText = event.resourceId ? ` (${this.getResourceName(event.resourceId)})` : '';
    this.addLog(`Clicked empty slot: ${dayLabel} at ${timeLabel}${resText}`);

    const start = new Date(event.date);
    const end = new Date(event.date);
    end.setHours(end.getHours() + 1);

    this.openCreationModal(start, end, event.resourceId);
  }

  onSlotRangeSelect(event: SchedulerSlotRangeSelectEvent) {
    const startStr = event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endStr = event.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const resText = event.resourceId ? ` for ${this.getResourceName(event.resourceId)}` : '';
    
    this.addLog(`Drag selection range: ${startStr} to ${endStr}${resText}`);
    this.openCreationModal(event.start, event.end, event.resourceId);
  }

  onEventDelete(evt: SchedulerEvent) {
    this.events.update(list => list.filter(e => e.id !== evt.id));
    this.addLog(`🗑️ Deleted event: "${evt.title}"`);
    this.activeFormMode.set(null);
  }

  onEventTimeChange(event: SchedulerEventChangeEvent) {
    this.events.update(list => list.map(evt => {
      if (evt.id === event.event.id) {
        return {
          ...evt,
          start: event.start,
          end: event.end,
          resourceId: event.event.resourceId,
          completed: event.event.completed
        };
      }
      return evt;
    }));

    const isToggle = event.occurrenceStart?.getTime() === event.start.getTime() && event.occurrenceEnd?.getTime() === event.end.getTime();
    if (isToggle) {
      this.addLog(`✓ Checked task: "${event.event.title}" - Status: ${event.event.completed ? 'COMPLETED' : 'PENDING'}`);
    } else {
      const startStr = event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const resText = event.event.resourceId ? ` (${this.getResourceName(event.event.resourceId)})` : '';
      this.addLog(`🔁 Re-scheduled: "${event.event.title}" to start at ${startStr}${resText}`);
    }
    
    // Update dates in form if currently editing the moved event
    if (this.activeFormMode() === 'edit' && this.formEventId === event.event.id) {
      this.formStart.set(event.start);
      this.formEnd.set(event.end);
      this.formIsCompleted = event.event.completed || false;
    }
  }

  openCreationModal(start: Date, end: Date, resourceId?: string) {
    this.activeFormMode.set('create');
    this.formEventId = '';
    this.formStart.set(start);
    this.formEnd.set(end);
    
    this.newEventTitle = '';
    this.newEventCategory = 'meeting';
    this.newEventResourceId = resourceId || '';
    this.newEventDescription = '';
    this.newEventColor = '';
    this.formIsCompleted = false;
    this.formIsAllDay = false;
    
    this.formIsRecurring = false;
    this.formRecurrenceFreq = 'weekly';
    this.formRecurrenceInterval = 1;
    this.formRecurrenceUntil = '';
  }

  deleteSelectedEvent() {
    if (!this.formEventId) return;
    const title = this.newEventTitle;
    this.events.update(list => list.filter(e => e.id !== this.formEventId));
    this.addLog(`🗑️ Deleted event: "${title}"`);
    this.activeFormMode.set(null);
  }

  confirmSaveEvent() {
    if (!this.newEventTitle.trim()) {
      alert('Please enter an event title.');
      return;
    }

    const mode = this.activeFormMode();
    const recurrence = this.formIsRecurring ? {
      frequency: this.formRecurrenceFreq,
      interval: this.formRecurrenceInterval,
      until: this.formRecurrenceUntil ? new Date(this.formRecurrenceUntil) : undefined
    } : undefined;

    if (mode === 'create') {
      const newEvt: SchedulerEvent = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        title: this.newEventTitle,
        description: this.newEventDescription || undefined,
        start: this.formStart(),
        end: this.formEnd(),
        category: this.newEventCategory,
        resourceId: this.newEventResourceId || undefined,
        recurrence,
        isAllDay: this.formIsAllDay,
        color: this.newEventColor.trim() || undefined,
        completed: this.newEventCategory === 'task' ? this.formIsCompleted : undefined
      };
      this.events.update(list => [...list, newEvt]);
      this.addLog(`✓ Scheduled new event: "${newEvt.title}"`);
    } else {
      this.events.update(list => list.map(evt => {
        if (evt.id === this.formEventId) {
          return {
            ...evt,
            title: this.newEventTitle,
            description: this.newEventDescription || undefined,
            start: this.formStart(),
            end: this.formEnd(),
            category: this.newEventCategory,
            resourceId: this.newEventResourceId || undefined,
            recurrence,
            isAllDay: this.formIsAllDay,
            color: this.newEventColor.trim() || undefined,
            completed: this.newEventCategory === 'task' ? this.formIsCompleted : undefined
          };
        }
        return evt;
      }));
      this.addLog(`✓ Updated event details: "${this.newEventTitle}"`);
    }
    
    this.activeFormMode.set(null);
  }

  formatTimeSummary(start: Date, end: Date): string {
    const weekday = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const sStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const eStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${weekday}, ${sStr} - ${eStr}`;
  }

  getResourceName(id: string): string {
    const res = this.mockResources.find(r => r.id === id);
    return res ? res.name : id;
  }

  addMockMeeting() {
    const start = new Date();
    start.setHours(11, 0, 0, 0);
    const end = new Date();
    end.setHours(12, 30, 0, 0);

    const newMeeting: SchedulerEvent = {
      id: 'mock-' + Math.random().toString(36).substr(2, 9),
      title: 'Team Retro Sync',
      description: 'Bi-weekly retrospective review.',
      start,
      end,
      category: 'meeting',
      resourceId: 'alice'
    };

    this.events.update(list => [...list, newMeeting]);
    this.addLog(`✓ Added mock Retro Sync at 11:00 AM`);
  }

  addMockMilestone() {
    const start = new Date();
    start.setHours(15, 0, 0, 0);
    const end = new Date();
    end.setHours(16, 0, 0, 0);

    const newMilestone: SchedulerEvent = {
      id: 'mock-' + Math.random().toString(36).substr(2, 9),
      title: 'Production Deployment Release',
      description: 'Core component NPM library package updates.',
      start,
      end,
      category: 'milestone',
      resourceId: 'bob'
    };

    this.events.update(list => [...list, newMilestone]);
    this.addLog(`✓ Added mock Milestone Release at 3:00 PM`);
  }

  clearAllEvents() {
    this.events.set([]);
    this.activeFormMode.set(null);
    this.addLog('🗑️ Cleared all events from scheduler.');
  }

  codeSnippet = `import { SchedulerComponent, SchedulerEvent, SchedulerResource } from 'ngx-core-components/views';

@Component({
  imports: [SchedulerComponent],
  template: \`
    <ngx-scheduler
      [events]="myEvents"
      [resources]="myResources"
      [viewMode]="'day'"
      [enableDragToCreate]="true"
      [showSearch]="true"
      [showWorkHoursOnly]="false"
      (slotRangeSelect)="onRangeSelect($event)"
      (eventTimeChange)="onEventTimeChange($event)"
      (eventDelete)="onEventDelete($event)"
    />
  \`
})
export class MyPlannerComponent {
  myEvents: SchedulerEvent[] = [
    {
      id: '1',
      title: 'Sprint Review',
      start: new Date(2026, 5, 10, 10, 0),
      end: new Date(2026, 5, 10, 11, 30),
      category: 'task',
      completed: true,
      resourceId: 'bob'
    },
    {
      id: '2',
      title: 'Continuous Integration Deploy',
      start: new Date(2026, 5, 10, 14, 0),
      end: new Date(2026, 5, 10, 15, 0),
      category: 'important',
      color: '#ff007f'
    }
  ];

  myResources: SchedulerResource[] = [
    { id: 'alice', name: 'Alice Vance', description: 'UI Designer' },
    { id: 'bob', name: 'Bob Smith', description: 'Lead Developer' }
  ];

  onRangeSelect(event: SchedulerSlotRangeSelectEvent) {
    console.log('Selected range:', event.start, 'to', event.end, 'for resource:', event.resourceId);
  }

  onEventTimeChange(event: SchedulerEventChangeEvent) {
    console.log('Event resized/dragged:', event.event.title, 'to start at', event.start);
  }

  onEventDelete(event: SchedulerEvent) {
    console.log('Delete requested for:', event.title);
  }
}`;

  apiRows: ApiRow[] = [
    { name: 'events', type: 'SchedulerEvent[]', default: '[]', description: 'Array of scheduled calendar appointments and event markers. Supports isAllDay, completed, and color properties.' },
    { name: 'currentDate', type: 'Date', default: 'new Date()', description: 'Selected baseline date. Supports two-way databinding via currentDateChange.' },
    { name: 'viewMode', type: "'day' | 'week' | 'month'", default: "'week'", description: 'Active view grid density.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Packs theme configuration mode.' },
    { name: 'businessHoursStart', type: 'number', default: '8', description: 'Starting limit for vertical day axis (0-23).' },
    { name: 'businessHoursEnd', type: 'number', default: '20', description: 'Ending limit for vertical day axis (0-23).' },
    { name: 'resources', type: 'SchedulerResource[]', default: '[]', description: 'Enables enterprise resource-based column layout in Day view, and filter in Week/Month views.' },
    { name: 'enableDragToCreate', type: 'boolean', default: 'true', description: 'Allows clicking and dragging vertically on empty slots to choose event range.' },
    { name: 'showSearch', type: 'boolean', default: 'true', description: 'Renders keyword query filter text box in toolbar.' },
    { name: 'showWorkHoursOnly', type: 'boolean', default: 'true', description: 'If true, crops the hourly vertical grid strictly to business hours. If false, renders all 24 hours with diagonal striped shading for non-working hours.' },
    
    { name: '(eventClick)', type: 'SchedulerEvent', default: '—', description: 'Emitted when an event card is clicked.' },
    { name: '(slotClick)', type: 'SchedulerSlotClickEvent', default: '—', description: 'Emitted when an empty grid slot is clicked.' },
    { name: '(eventTimeChange)', type: 'SchedulerEventChangeEvent', default: '—', description: 'Emitted when an event is dragged, resized, or its completion checkbox is toggled.' },
    { name: '(slotRangeSelect)', type: 'SchedulerSlotRangeSelectEvent', default: '—', description: 'Emitted when a selection range is finalized via click-and-drag.' },
    { name: '(eventDelete)', type: 'SchedulerEvent', default: '—', description: 'Emitted when the card quick-delete button is triggered.' },
    { name: '(currentDateChange)', type: 'Date', default: '—', description: 'Emitted when the current baseline date is changed through toolbar navigation controls.' }
  ];
}
