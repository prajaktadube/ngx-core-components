import { AIAudioWaveComponent } from './ai-audio-wave.component';

const meta = {
  title: 'Intelligence/AI Chat & Agent Console/AIAudioWave',
  component: AIAudioWaveComponent,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    state: 'idle',
    color: '',
    theme: 'light',
    muted: false,
    autoCapture: false,
  },
};
