import { VectorPlotComponent } from './vector-plot.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/VectorPlot',
  component: VectorPlotComponent,
  tags: ['autodocs'],
};

export default meta;

export const VortexField = {
  args: {
    data: [
      { x: -2, y: 2, vx: -1, vy: -1 },
      { x: -1, y: 2, vx: -1, vy: 0 },
      { x: 0, y: 2, vx: -1, vy: 1 },
      { x: 1, y: 2, vx: 0, vy: 1 },
      { x: 2, y: 2, vx: 1, vy: 1 },
      
      { x: -2, y: 1, vx: -1, vy: -1 },
      { x: -1, y: 1, vx: -0.5, vy: -0.5 },
      { x: 0, y: 1, vx: -0.5, vy: 0.5 },
      { x: 1, y: 1, vx: 0.5, vy: 0.5 },
      { x: 2, y: 1, vx: 1, vy: 1 },
      
      { x: -2, y: 0, vx: 0, vy: -1 },
      { x: -1, y: 0, vx: 0, vy: -0.5 },
      { x: 0, y: 0, vx: 0, vy: 0 },
      { x: 1, y: 0, vx: 0, vy: 0.5 },
      { x: 2, y: 0, vx: 0, vy: 1 },
      
      { x: -2, y: -1, vx: 1, vy: -1 },
      { x: -1, y: -1, vx: 0.5, vy: -0.5 },
      { x: 0, y: -1, vx: 0.5, vy: 0.5 },
      { x: 1, y: -1, vx: 0.5, vy: -0.5 },
      { x: 2, y: -1, vx: 1, vy: -1 },
      
      { x: -2, y: -2, vx: 1, vy: -1 },
      { x: -1, y: -2, vx: 1, vy: 0 },
      { x: 0, y: -2, vx: 1, vy: 1 },
      { x: 1, y: -2, vx: 0, vy: 1 },
      { x: 2, y: -2, vx: -1, vy: 1 }
    ],
    height: 360,
    showGrid: true,
    showExport: true
  },
};

export const CustomColors = {
  args: {
    ...VortexField.args,
    colors: ['#e74c3c'],
  },
};
