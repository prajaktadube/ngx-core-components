import { ParallelCoordinatesComponent } from './parallel-coordinates.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ParallelCoordinates',
  component: ParallelCoordinatesComponent,
  tags: ['autodocs'],
};

export default meta;

export const VehiclesDataset = {
  args: {
    data: [
      { name: 'Model S', mpg: 120, horsepower: 670, weight: 4560, acceleration: 3.1, price: 89990, class: 'Electric' },
      { name: 'Model 3', mpg: 132, horsepower: 450, weight: 4065, acceleration: 3.5, price: 47240, class: 'Electric' },
      { name: 'Mustang GT', mpg: 24, horsepower: 450, weight: 3720, acceleration: 4.4, price: 38000, class: 'Gas' },
      { name: 'Camaro SS', mpg: 22, horsepower: 455, weight: 3680, acceleration: 4.0, price: 37500, class: 'Gas' },
      { name: 'Civic Type R', mpg: 28, horsepower: 315, weight: 3180, acceleration: 5.3, price: 43790, class: 'Gas' },
      { name: 'Prius Prime', mpg: 54, horsepower: 220, weight: 3450, acceleration: 6.6, price: 32350, class: 'Hybrid' },
      { name: 'RAV4 Prime', mpg: 38, horsepower: 302, weight: 4300, acceleration: 5.7, price: 43440, class: 'Hybrid' },
      { name: 'Porsche Taycan', mpg: 79, horsepower: 530, weight: 4770, acceleration: 3.8, price: 90900, class: 'Electric' }
    ],
    dimensions: ['mpg', 'horsepower', 'weight', 'acceleration', 'price'],
    colorKey: 'class',
    height: 350,
    showExport: true
  },
};

export const CustomColors = {
  args: {
    ...VehiclesDataset.args,
    colors: ['#e74c3c', '#2ecc71', '#9b59b6'],
  },
};
