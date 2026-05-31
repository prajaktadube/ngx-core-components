/*
 * Public API Surface — secondary entry point: ngx-core-components/layout
 */

export { CardComponent } from './card/card.component';
export type { CardVariant } from './card/card.component';

export { TabStripComponent, TabComponent } from './tab-strip/tab-strip.component';

export { AccordionComponent } from './accordion/accordion.component';
export type { AccordionItem } from './accordion/accordion.component';

export { StepperComponent } from './stepper/stepper.component';
export type { StepperStep } from './stepper/stepper.component';

export { SplitterComponent } from './splitter/splitter.component';

// Dashboard Layout - Grid widget panel orchestrator
export { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
export type {
  DashboardItem,
  DashboardLayoutChangeEvent,
  DashboardPanelActionEvent,
} from './dashboard-layout/models';

// Carousel Slider
export { CarouselComponent } from './carousel/carousel.component';

// Side Drawer Container
export { DrawerComponent } from './drawer/drawer.component';


