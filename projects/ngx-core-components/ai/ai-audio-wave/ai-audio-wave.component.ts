import { Component, input, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AIAudioState = 'idle' | 'listening' | 'thinking' | 'speaking';

@Component({
  selector: 'ngx-ai-audio-wave',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-wave-wrapper" [class.dark]="theme() === 'dark'">
      <!-- Status Badge & Description -->
      <div class="wave-header">
        <div class="state-indicator" [class]="state()">
          <span class="state-dot"></span>
          <span class="state-text">{{ stateLabel() }}</span>
        </div>
        <div class="amplitude-label" *ngIf="state() === 'speaking' || state() === 'listening'">
          Sensitivity: {{ volumePercent() }}%
        </div>
      </div>

      <!-- Equalizer Wave Container -->
      <div class="equalizer-container" [class.muted]="isMuted()">
        @for (bar of bars; track bar) {
          <div
            class="wave-bar"
            [class]="state()"
            [style.animation-delay]="bar.delay"
            [style.animation-duration]="barDuration()"
            [style.height.px]="bar.height"
            [style.background]="barColor()"
          ></div>
        }
      </div>

      <!-- Controls Panel -->
      <div class="controls-panel">
        <!-- Mic Toggle -->
        <button
          class="control-btn mic-btn"
          [class.active]="micEnabled() && !isMuted()"
          (click)="toggleMic()"
          [title]="micEnabled() ? 'Disable Microphone' : 'Enable Microphone'"
        >
          <!-- SVG Mic Icon -->
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (micEnabled()) {
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            } @else {
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" opacity="0.4"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" opacity="0.4"/>
              <line x1="12" y1="19" x2="12" y2="23" opacity="0.4"/>
              <line x1="10" y1="23" x2="14" y2="23" opacity="0.4"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke-width="2.5"/>
            }
          </svg>
        </button>

        <!-- Mute/Unmute audio output -->
        <button
          class="control-btn volume-btn"
          [class.muted]="isMuted()"
          (click)="toggleMute()"
          [title]="isMuted() ? 'Unmute Audio' : 'Mute Audio'"
        >
          <!-- SVG Audio Icon -->
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (!isMuted()) {
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            } @else {
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" opacity="0.4"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            }
          </svg>
        </button>

        <!-- Wave Sensitivity/Speed slider -->
        <div class="slider-container" *ngIf="state() === 'speaking' || state() === 'listening'">
          <span class="slider-label">Speed</span>
          <input
            type="range"
            min="0.3"
            max="2.0"
            step="0.1"
            [value]="speedMultiplier()"
            (input)="onSpeedChange($event)"
            class="wave-speed-slider"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .audio-wave-wrapper {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      padding: 20px;
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08));
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: background 0.3s, border-color 0.3s;
    }

    /* Header info */
    .wave-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--ngx-font-family, sans-serif);
    }

    .state-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
    }

    .state-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
      transition: background 0.3s;
    }

    .state-indicator.idle .state-dot { background: #94a3b8; }
    .state-indicator.listening .state-dot { background: #10b981; animation: blink 1.2s infinite; }
    .state-indicator.thinking .state-dot { background: #3b82f6; animation: spin-color 2s infinite; }
    .state-indicator.speaking .state-dot { background: #8b5cf6; }

    .state-indicator.idle { color: var(--text-secondary, #475569); }
    .state-indicator.listening { color: #10b981; }
    .state-indicator.thinking { color: #3b82f6; }
    .state-indicator.speaking { color: #8b5cf6; }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes spin-color {
      0% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.2); filter: brightness(1.2); }
      100% { transform: scale(1); filter: brightness(1); }
    }

    .amplitude-label {
      font-size: 11px;
      color: var(--text-secondary, #475569);
      font-weight: 500;
    }

    /* Equalizer wave container */
    .equalizer-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      height: 70px;
      padding: 0 10px;
      border-radius: var(--radius-sm, 6px);
      background: var(--border-light, #f1f5f9);
      overflow: hidden;
      transition: background 0.3s, opacity 0.3s;
    }

    .equalizer-container.muted {
      opacity: 0.5;
    }

    /* Bar Styling & Animations */
    .wave-bar {
      width: 4px;
      border-radius: 9999px;
      transition: height 0.3s, background 0.3s;
    }

    /* IDLE state */
    .wave-bar.idle {
      height: 6px !important;
      opacity: 0.4;
    }

    /* LISTENING state: pulsing heights */
    .wave-bar.listening {
      animation: listenPulse 1s ease-in-out infinite alternate;
    }

    @keyframes listenPulse {
      0% { transform: scaleY(1); }
      100% { transform: scaleY(3.5); }
    }

    /* THINKING state: flowing wave */
    .wave-bar.thinking {
      animation: thinkFlow 1.6s ease-in-out infinite;
    }

    @keyframes thinkFlow {
      0%, 100% { transform: scaleY(1.2); }
      50% { transform: scaleY(5); }
    }

    /* SPEAKING state: bouncy sound peaks */
    .wave-bar.speaking {
      animation: speakBounce 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) infinite alternate;
    }

    @keyframes speakBounce {
      0% { transform: scaleY(1); }
      100% { transform: scaleY(7.5); }
    }

    /* Controls Panel */
    .controls-panel {
      display: flex;
      align-items: center;
      gap: 12px;
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding-top: 16px;
    }

    .control-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--border-color, #e2e8f0);
      background: transparent;
      color: var(--text-secondary, #475569);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
    }

    .control-btn:hover {
      background: var(--border-light, #f1f5f9);
      color: var(--text-primary, #0f172a);
      border-color: var(--text-secondary, #475569);
    }

    .control-btn.active {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }

    .control-btn.muted {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
      background: rgba(239, 68, 68, 0.05);
    }
    .control-btn.muted:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .icon-svg {
      width: 18px;
      height: 18px;
    }

    /* Slider styling */
    .slider-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      font-family: var(--ngx-font-family, sans-serif);
      font-size: 11px;
      color: var(--text-secondary, #475569);
    }

    .wave-speed-slider {
      width: 80px;
      height: 4px;
      background: var(--border-color, #e2e8f0);
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .wave-speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-color, #4f46e5);
      transition: transform 0.15s;
    }
    .wave-speed-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    /* Dark Mode */
    .audio-wave-wrapper.dark {
      background: #0f172a;
      border-color: #1f2937;
    }
    .audio-wave-wrapper.dark .equalizer-container {
      background: #1e293b;
    }
    .audio-wave-wrapper.dark .control-btn {
      border-color: #374151;
      color: #94a3b8;
    }
    .audio-wave-wrapper.dark .control-btn:hover {
      background: #1e293b;
      color: #f8fafc;
      border-color: #94a3b8;
    }
    .audio-wave-wrapper.dark .control-btn.active {
      background: var(--primary-color, #6366f1);
      border-color: var(--primary-color, #6366f1);
      color: #ffffff;
    }
    .audio-wave-wrapper.dark .controls-panel {
      border-top-color: #1f2937;
    }
    .audio-wave-wrapper.dark .amplitude-label,
    .audio-wave-wrapper.dark .slider-label {
      color: #94a3b8;
    }
    .audio-wave-wrapper.dark .wave-speed-slider {
      background: #374151;
    }
    .audio-wave-wrapper.dark .wave-speed-slider::-webkit-slider-thumb {
      background: var(--primary-color, #6366f1);
    }
  `]
})
export class AIAudioWaveComponent {
  // Inputs
  state = input<AIAudioState>('idle');
  color = input<string>('');
  theme = input<'light' | 'dark'>('light');
  muted = input<boolean>(false);

  // Outputs
  stateChange = output<AIAudioState>();
  mutedChange = output<boolean>();
  micToggle = output<boolean>();

  // State
  micEnabled = signal<boolean>(true);
  localMuted = signal<boolean>(false);
  speedMultiplier = signal<number>(1.0);

  // Pre-configured equalizer bars representation
  bars = [
    { height: 16, delay: '0.1s' },
    { height: 28, delay: '0.3s' },
    { height: 42, delay: '0.5s' },
    { height: 50, delay: '0.2s' },
    { height: 36, delay: '0.4s' },
    { height: 22, delay: '0.6s' },
    { height: 30, delay: '0.15s' },
    { height: 48, delay: '0.35s' },
    { height: 52, delay: '0.55s' },
    { height: 38, delay: '0.25s' },
    { height: 24, delay: '0.45s' },
    { height: 14, delay: '0.05s' }
  ];

  isMuted = computed(() => this.muted() || this.localMuted() || !this.micEnabled());

  stateLabel = computed(() => {
    switch (this.state()) {
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      case 'speaking': return 'Speaking...';
      default: return 'Assistant Idle';
    }
  });

  volumePercent = computed(() => {
    if (this.isMuted()) return 0;
    if (this.state() === 'idle') return 5;
    if (this.state() === 'listening') return 45;
    if (this.state() === 'thinking') return 12;
    if (this.state() === 'speaking') return 78;
    return 0;
  });

  barDuration = computed(() => {
    const rawVal = 1.0 / this.speedMultiplier();
    return `${rawVal.toFixed(2)}s`;
  });

  barColor = computed(() => {
    if (this.color()) return this.color();

    // Context colors matching states
    if (this.isMuted()) return '#94a3b8';
    switch (this.state()) {
      case 'listening': return '#10b981'; // Green
      case 'thinking': return '#3b82f6';  // Blue
      case 'speaking': return '#8b5cf6';  // Purple
      default: return '#cbd5e1';          // Muted slate
    }
  });

  onSpeedChange(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl) {
      this.speedMultiplier.set(parseFloat(inputEl.value));
    }
  }

  toggleMic() {
    const nextVal = !this.micEnabled();
    this.micEnabled.set(nextVal);
    this.micToggle.emit(nextVal);
  }

  toggleMute() {
    const nextVal = !this.localMuted();
    this.localMuted.set(nextVal);
    this.mutedChange.emit(nextVal);
  }
}
