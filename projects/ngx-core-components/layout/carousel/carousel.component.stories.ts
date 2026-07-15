import { CarouselComponent } from './carousel.component';

const meta = {
  title: 'Layout & Overlays/Carousel Slider/Carousel',
  component: CarouselComponent,
  tags: ['autodocs'],
};

export default meta;

const mockSlides = [
  { 
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60', 
    title: 'Sunny Beach Escape', 
    caption: 'Crystal clear tropical waters and fine golden sands.' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60', 
    title: 'Morning Mountain Dew', 
    caption: 'Lush valley meadows under deep evergreen peak ridges.' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=60', 
    title: 'Whispering Woods', 
    caption: 'Towering sun-drenched redwood canopies and winding forest paths.' 
  }
];

export const Default = {
  args: {
    items: mockSlides,
    autoplay: true,
    interval: 4000,
    transition: 'slide',
    theme: 'light',
    showIndicators: true,
    showControls: true
  }
};

export const FadeTransition = {
  ...Default,
  args: {
    ...Default.args,
    transition: 'fade',
    autoplay: false
  }
};

export const DarkThemeCaptions = {
  ...Default,
  args: {
    ...Default.args,
    theme: 'dark'
  }
};
