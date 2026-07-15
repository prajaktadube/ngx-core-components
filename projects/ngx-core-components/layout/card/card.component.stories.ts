import { CardComponent } from './card.component';

const meta = {
  title: 'Layout & Overlays/Layout & Containers/Card',
  component: CardComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <ngx-card 
        [title]="title" 
        [subtitle]="subtitle" 
        [headerIcon]="headerIcon" 
        [imageUrl]="imageUrl" 
        [imageAlt]="imageAlt" 
        [variant]="variant"
        [hoverable]="hoverable"
        [selectable]="selectable"
        [selected]="selected"
        style="max-width: 380px;"
      >
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">This card component is optimized for dashboards and content hubs. It supports customizable headers, icons, hero images, hover scales, and action templates.</p>
        
        <div cardActions>
          <button style="border: none; background: none; font-size: 14px; cursor: pointer;">💬</button>
        </div>
        
        <div cardFooter style="display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc;">
          <button style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-size: 11px; cursor: pointer; font-weight: 600;">Dismiss</button>
          <button style="padding: 6px 12px; border: none; border-radius: 6px; background: #4f46e5; color: #fff; font-size: 11px; cursor: pointer; font-weight: 600;">View Details</button>
        </div>
      </ngx-card>
    `
  }),
  args: {
    title: 'Developer Analytics',
    subtitle: 'Weekly deployment metrics summary',
    headerIcon: '📈',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    imageAlt: 'Dashboard trends graphic',
    variant: 'default',
    hoverable: true,
    selectable: false,
    selected: false,
  }
};

export const GlassTheme = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'glass',
    imageUrl: ''
  }
};

export const Elevated = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'elevated',
    hoverable: true
  }
};
