import { BackToTopComponent } from './back-to-top.component';

const meta = {
  title: 'Layout & Overlays/Back to Top Indicator/BackToTop',
  component: BackToTopComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="position: relative; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff;">
        <div 
          id="scroll-container" 
          style="height: 350px; overflow-y: auto; padding: 20px; box-sizing: border-box; font-family: system-ui, sans-serif; position: relative;"
        >
          <div style="background: linear-gradient(180deg, #f8fafc, #e2e8f0); border-radius: 8px; padding: 24px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #0f172a;">Scroll Down to See Button</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 0;">Scroll down inside this box. A circular "back to top" progress ring button will slide in at the bottom-right corner when you scroll past 150px.</p>
          </div>
          
          <div style="height: 900px; padding: 20px 0;">
            <p style="color: #94a3b8; font-style: italic;">Scrolling down further...</p>
            <div style="margin-top: 300px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
              <h4 style="margin: 0; color: #475569;">Halfway Down!</h4>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Observe the circular progress ring outlining the button. It reflects your scroll depth percentage.</p>
            </div>
          </div>
          
          <ngx-back-to-top 
            [target]="'#scroll-container'" 
            [threshold]="threshold" 
            [theme]="theme" 
            [showProgress]="showProgress"
            style="position: absolute !important; bottom: 16px; right: 16px;"
          />
        </div>
      </div>
    `
  }),
  args: {
    threshold: 150,
    theme: 'light',
    showProgress: true
  }
};

export const DarkThemeProgress = {
  ...Default,
  args: {
    threshold: 150,
    theme: 'dark',
    showProgress: true
  }
};
