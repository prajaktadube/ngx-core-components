import { TiledWebMapComponent } from './tiled-web-map.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/TiledWebMap',
  component: TiledWebMapComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    title: 'Global Operations Map',
    defaultCenter: { lat: 25, lng: 0 },
    defaultZoom: 2,
    markers: [
      { lat: 40.7484, lng: -73.9857, label: 'New York Office (Empire State Building)' },
      { lat: 51.5007, lng: -0.1246, label: 'London Hub (Big Ben Area)' },
      { lat: 48.8584, lng: 2.2945, label: 'Paris Logistics Terminal (Eiffel Tower)' },
      { lat: 35.6762, lng: 139.6503, label: 'Tokyo HQ' },
      { lat: -33.8568, lng: 151.2153, label: 'Sydney Support Center' }
    ],
    height: 450,
    theme: 'light',
    showExport: true
  },
};

export const LondonZoomedIn = {
  args: {
    title: 'London Hub Locations',
    defaultCenter: { lat: 51.505, lng: -0.12 },
    defaultZoom: 13,
    markers: [
      { lat: 51.5007, lng: -0.1246, label: 'Big Ben Office' },
      { lat: 51.5033, lng: -0.1195, label: 'London Eye Hub' },
      { lat: 51.5115, lng: -0.1160, label: 'Kings College Branch' }
    ],
    height: 450,
    theme: 'light',
    showExport: true
  }
};

export const DarkMode = {
  args: {
    ...Default.args,
    theme: 'dark'
  }
};
