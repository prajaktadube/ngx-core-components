import { DialogContainerComponent } from './dialog-container.component';

const meta = {
  title: 'Layout & Overlays/Dialog Modals/DialogContainer',
  component: DialogContainerComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="height: 450px; position: relative; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #cbd5e1; display: flex; align-items: center; justify-content: center;">
        <ngx-dialog-container style="position: absolute; width: 100%; height: 100%;" [ariaLabel]="ariaLabel" [maxWidth]="maxWidth" [panelClass]="panelClass">
          <div style="padding: 24px; font-family: system-ui, sans-serif;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Delete Account</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Are you sure you want to delete your developer profile? This action is permanent and all associated repositories will be unmapped.</p>
            <div style="margin-top: 24px; display: flex; gap: 8px; justify-content: flex-end;">
              <button style="padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: #475569; font-weight: 600; cursor: pointer; font-size: 13px;">Cancel</button>
              <button style="padding: 8px 16px; border: none; border-radius: 6px; background: #ef4444; color: #fff; font-weight: 600; cursor: pointer; font-size: 13px;">Delete Profile</button>
            </div>
          </div>
        </ngx-dialog-container>
      </div>
    `
  }),
  args: {
    ariaLabel: 'Confirmation Modal',
    maxWidth: '460px',
    panelClass: ''
  }
};
