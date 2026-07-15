import { AccordionComponent, AccordionItemComponent } from './accordion.component';
import { moduleMetadata } from '@storybook/angular';

const meta = {
  title: 'Layout & Overlays/Layout & Containers/Accordion',
  component: AccordionComponent,
  decorators: [
    moduleMetadata({
      imports: [AccordionComponent, AccordionItemComponent]
    })
  ],
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <ngx-accordion [multi]="multi" [items]="items">
      </ngx-accordion>
    `
  }),
  args: {
    multi: false,
    items: [
      { title: 'Project Overview', content: 'This section details the primary roadmap objectives, including deliverables and timelines.', icon: '📋' },
      { title: 'Technical Stack Specs', content: 'Angular 18, Signal inputs, SCSS modules, Jasmine/Karma unit specs, and Ivy packaging.', icon: '💻' },
      { title: 'Security & Auth Protocols', content: 'OAuth2 bearer token assertions, CSRF header handshakes, and CORS validation matrices.', icon: '🔒' }
    ]
  }
};

export const MultiExpand = {
  ...Default,
  args: {
    ...Default.args,
    multi: true
  }
};

export const ProjectedItems = {
  render: (args: any) => ({
    props: args,
    template: `
      <ngx-accordion [multi]="multi">
        <ngx-accordion-item title="Database Schema Configuration" icon="🗄️">
          <p style="margin: 0; font-size: 13px; color: #475569;">Using PostgreSQL 16 replica sets. Custom configuration variables can be loaded from the environmental parameter sheets.</p>
        </ngx-accordion-item>
        <ngx-accordion-item title="Frontend Theming System" icon="🎨">
          <p style="margin: 0; font-size: 13px; color: #475569;">Uses custom variables mapped to dark/light color sheets. Highly customizable override lists can be loaded from the themes manager.</p>
        </ngx-accordion-item>
      </ngx-accordion>
    `
  }),
  args: {
    multi: false
  }
};
