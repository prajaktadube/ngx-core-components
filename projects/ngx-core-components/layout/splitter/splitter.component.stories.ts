import { SplitterComponent } from './splitter.component';

const meta = {
  title: 'Layout & Overlays/Layout & Containers/Splitter',
  component: SplitterComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="height: 350px; border: 1px solid var(--ngx-splitter-divider, #dee2e6); border-radius: 8px; overflow: hidden; display: flex;">
        <ngx-splitter [orientation]="orientation" [initialSize]="initialSize" [min]="min">
          <div pane1 style="padding: 20px; background: #f8fafc; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b;">Navigation Pane</h3>
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">This left pane typically acts as a sidebar navigation container for layouts.</p>
          </div>
          <div pane2 style="padding: 20px; background: #ffffff; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b;">Main Content Workspace</h3>
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">This right pane expands to fill the remaining area. Drag the grip bar to resize.</p>
          </div>
        </ngx-splitter>
      </div>
    `
  }),
  args: {
    orientation: 'horizontal',
    initialSize: '30%',
    min: 80,
  },
};

export const VerticalSplitter = {
  ...Default,
  args: {
    orientation: 'vertical',
    initialSize: '40%',
    min: 80,
  },
};
