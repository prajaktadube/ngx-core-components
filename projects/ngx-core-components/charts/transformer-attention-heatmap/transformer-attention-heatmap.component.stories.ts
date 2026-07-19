import type { Meta, StoryObj } from '@storybook/angular';
import { TransformerAttentionHeatmapComponent } from './transformer-attention-heatmap.component';

// Mock tokens
const tokensY = ['The', 'agent', 'solved', 'the', 'task', 'successfully', '.'];
const tokensX = ['Antigravity', 'completed', 'the', 'development', 'plan', 'and', 'build', '.'];

// Helper to generate mock attention matrix (rows x cols)
// Ensure some strong weights for logical connections: e.g. "agent" connects to "Antigravity", "solved" connects to "completed" / "development"
const generateMockWeights = (): number[][] => {
  const matrix: number[][] = [];
  
  // 'The' connects to 'the'
  matrix.push([0.1, 0.1, 0.6, 0.1, 0.05, 0.02, 0.02, 0.01]);
  // 'agent' connects to 'Antigravity' / 'completed'
  matrix.push([0.7, 0.15, 0.05, 0.03, 0.02, 0.02, 0.02, 0.01]);
  // 'solved' connects to 'completed' / 'development'
  matrix.push([0.05, 0.5, 0.05, 0.3, 0.04, 0.02, 0.02, 0.02]);
  // 'the' connects to 'the'
  matrix.push([0.05, 0.05, 0.7, 0.05, 0.05, 0.04, 0.04, 0.02]);
  // 'task' connects to 'plan' / 'development'
  matrix.push([0.02, 0.1, 0.08, 0.2, 0.55, 0.02, 0.02, 0.01]);
  // 'successfully' connects to 'completed' / 'build'
  matrix.push([0.01, 0.25, 0.02, 0.02, 0.1, 0.1, 0.45, 0.05]);
  // '.' connects to '.'
  matrix.push([0.01, 0.01, 0.01, 0.01, 0.01, 0.05, 0.05, 0.85]);

  return matrix;
};

const meta: Meta<TransformerAttentionHeatmapComponent> = {
  title: 'Visualizations/Charts & Graphs/Transformer Attention Heatmap',
  component: TransformerAttentionHeatmapComponent,
  tags: ['autodocs'],
  argTypes: {
    height: { control: 'number' },
    showExport: { control: 'boolean' }
  }
};

export default meta;
type Story = StoryObj<TransformerAttentionHeatmapComponent>;

export const Default: Story = {
  args: {
    tokensX,
    tokensY,
    weights: generateMockWeights(),
    height: 350,
    showExport: true
  }
};
