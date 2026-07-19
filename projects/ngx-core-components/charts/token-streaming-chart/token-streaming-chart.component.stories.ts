import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TokenStreamingChartComponent } from './token-streaming-chart.component';
import { Component, OnInit, OnDestroy, viewChild } from '@angular/core';

@Component({
  selector: 'ngx-token-stream-sim',
  standalone: true,
  imports: [TokenStreamingChartComponent],
  template: `
    <div style="padding: 20px; max-width: 750px; background: var(--bg-primary, #f8fafc); border-radius: 12px;">
      <ngx-token-streaming-chart
        #chart
        [title]="title"
        [windowSize]="windowSize"
        [height]="height"
        [showExport]="showExport"
      />
    </div>
  `
})
class TokenStreamSimComponent implements OnInit, OnDestroy {
  chart = viewChild<TokenStreamingChartComponent>('chart');
  title = 'Live Agent Token Stream Speed (ms/token)';
  windowSize = 40;
  height = 240;
  showExport = true;
  private timer: any;

  ngOnInit() {
    // Generate some initial historical coordinates
    setTimeout(() => {
      const chartEl = this.chart();
      if (chartEl) {
        // Appends points dynamically
        this.timer = setInterval(() => {
          const isAnomaly = Math.random() > 0.92;
          const val = isAnomaly 
            ? (90 + Math.random() * 60) // Anomaly spikes
            : (15 + Math.random() * 25); // Standard generation speeds
          chartEl.appendPoint(val);
        }, 120);
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

const meta: Meta<TokenStreamingChartComponent> = {
  title: 'Visualizations/Charts & Graphs/Token Streaming Chart',
  component: TokenStreamingChartComponent,
  decorators: [
    moduleMetadata({
      imports: [TokenStreamSimComponent, TokenStreamingChartComponent]
    })
  ],
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    windowSize: { control: 'number' },
    height: { control: 'number' },
    showExport: { control: 'boolean' }
  }
};

export default meta;
type Story = StoryObj<TokenStreamingChartComponent>;

export const Default: Story = {
  args: {
    title: 'LLM Response Latency (ms)',
    windowSize: 35,
    height: 250,
    showExport: true
  }
};

export const LiveSimulation: Story = {
  render: () => ({
    template: `<ngx-token-stream-sim />`
  })
};
