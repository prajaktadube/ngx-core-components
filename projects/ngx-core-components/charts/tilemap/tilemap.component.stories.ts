import { TilemapComponent } from './tilemap.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Tilemap',
  component: TilemapComponent,
  tags: ['autodocs'],
};

export default meta;

export const RectangularGrid = {
  args: {
    data: [
      { r: 0, c: 0, label: 'WA', value: 82, tooltipInfo: 'Washington State' },
      { r: 0, c: 1, label: 'ID', value: 45, tooltipInfo: 'Idaho State' },
      { r: 0, c: 2, label: 'MT', value: 38, tooltipInfo: 'Montana State' },
      { r: 0, c: 3, label: 'ND', value: 30, tooltipInfo: 'North Dakota' },
      { r: 0, c: 4, label: 'MN', value: 68, tooltipInfo: 'Minnesota' },
      
      { r: 1, c: 0, label: 'OR', value: 72, tooltipInfo: 'Oregon State' },
      { r: 1, c: 1, label: 'NV', value: 54, tooltipInfo: 'Nevada State' },
      { r: 1, c: 2, label: 'WY', value: 32, tooltipInfo: 'Wyoming State' },
      { r: 1, c: 3, label: 'SD', value: 35, tooltipInfo: 'South Dakota' },
      { r: 1, c: 4, label: 'IA', value: 58, tooltipInfo: 'Iowa' },
      
      { r: 2, c: 0, label: 'CA', value: 98, tooltipInfo: 'California' },
      { r: 2, c: 1, label: 'UT', value: 50, tooltipInfo: 'Utah State' },
      { r: 2, c: 2, label: 'CO', value: 78, tooltipInfo: 'Colorado' },
      { r: 2, c: 3, label: 'NE', value: 48, tooltipInfo: 'Nebraska' },
      { r: 2, c: 4, label: 'MO', value: 62, tooltipInfo: 'Missouri' },
      
      { r: 3, c: 0, label: 'AZ', value: 65, tooltipInfo: 'Arizona' },
      { r: 3, c: 1, label: 'NM', value: 42, tooltipInfo: 'New Mexico' },
      { r: 3, c: 2, label: 'KS', value: 52, tooltipInfo: 'Kansas' },
      { r: 3, c: 3, label: 'OK', value: 55, tooltipInfo: 'Oklahoma' },
      { r: 3, c: 4, label: 'AR', value: 48, tooltipInfo: 'Arkansas' },

      { r: 4, c: 2, label: 'TX', value: 92, tooltipInfo: 'Texas' },
      { r: 4, c: 3, label: 'LA', value: 60, tooltipInfo: 'Louisiana' }
    ],
    type: 'rect',
    height: 350,
    showLabels: true,
    showExport: true
  },
};

export const HexagonalGrid = {
  args: {
    ...RectangularGrid.args,
    type: 'hexagon',
  },
};

export const CustomColors = {
  args: {
    ...RectangularGrid.args,
    colors: ['#e67e22'],
  },
};
