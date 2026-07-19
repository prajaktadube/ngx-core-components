import type { Meta, StoryObj } from '@storybook/angular';
import { EmbeddingSpaceProjectionComponent, type EmbeddingPoint } from './embedding-space-projection.component';

// Helper to generate clustered semantic mock dataset
const generateMockEmbeddings = (): EmbeddingPoint[] => {
  const points: EmbeddingPoint[] = [];
  
  // Cluster 1: NLP / LLM (Center: 2, 2)
  for (let i = 0; i < 200; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.5;
    points.push({
      id: `nlp_${i}`,
      x: 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 0.3,
      y: 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 0.3,
      group: 'NLP / Generative Models',
      label: `nlp-vector-${i}`
    });
  }

  // Cluster 2: Computer Vision (Center: -2, -2)
  for (let i = 0; i < 180; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.3;
    points.push({
      id: `cv_${i}`,
      x: -2 + Math.cos(angle) * r + (Math.random() - 0.5) * 0.3,
      y: -2 + Math.sin(angle) * r + (Math.random() - 0.5) * 0.3,
      group: 'Computer Vision / CNNs',
      label: `vision-vector-${i}`
    });
  }

  // Cluster 3: Audio Processing / Speech (Center: -3, 3)
  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.2;
    points.push({
      id: `audio_${i}`,
      x: -3 + Math.cos(angle) * r + (Math.random() - 0.5) * 0.2,
      y: 3 + Math.sin(angle) * r + (Math.random() - 0.5) * 0.2,
      group: 'Audio & Speech Recognition',
      label: `audio-vector-${i}`
    });
  }

  // Anomalies / Outliers (Random scattered points)
  for (let i = 0; i < 30; i++) {
    points.push({
      id: `outlier_${i}`,
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      group: 'Outliers / Noise',
      label: `outlier-vector-${i}`
    });
  }

  return points;
};

const meta: Meta<EmbeddingSpaceProjectionComponent> = {
  title: 'Visualizations/Charts & Graphs/Embedding Space Projection',
  component: EmbeddingSpaceProjectionComponent,
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'number' },
    height: { control: 'number' },
    dotRadius: { control: 'number' },
    showExport: { control: 'boolean' }
  }
};

export default meta;
type Story = StoryObj<EmbeddingSpaceProjectionComponent>;

export const Default: Story = {
  args: {
    data: generateMockEmbeddings(),
    width: 650,
    height: 400,
    dotRadius: 3.5,
    showExport: true
  }
};
