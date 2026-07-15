import { Injectable, signal, computed } from '@angular/core';

export interface WebLlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NgxWebLlmService {
  private engine: any = null;
  
  status = signal<string>('idle');
  progress = signal<number>(0);
  isReady = signal<boolean>(false);
  error = signal<string | null>(null);

  isGpuSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator && !!(navigator as any).gpu;
  }

  async init(
    modelId: string = 'Qwen2.5-0.5B-Instruct',
    onProgress?: (val: number, msg: string) => void
  ): Promise<void> {
    if (this.isReady()) return;

    this.status.set('loading_scripts');
    this.error.set(null);

    // If GPU is not supported, simulate model loading (useful for testing or fallback dev setups)
    if (!this.isGpuSupported()) {
      console.warn('WebGPU is not supported in this browser environment. Simulating fallback WebLLM Engine.');
      await this.simulateLoading(onProgress);
      return;
    }

    try {
      // Dynamic import of web-llm from CDN. Using type casting to bypass TS compilation lookup checks
      const webLlmModule = await import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm' as any);
      
      this.status.set('downloading_model');
      this.progress.set(0);

      const engine = await webLlmModule.CreateWebGPUEngine(
        modelId,
        {
          initProgressCallback: (report: any) => {
            const val = report.progress;
            this.progress.set(Math.round(val * 100));
            this.status.set(`loading_model: ${report.text}`);
            if (onProgress) {
              onProgress(val, report.text);
            }
          }
        }
      );

      this.engine = engine;
      this.isReady.set(true);
      this.status.set('ready');
    } catch (err: any) {
      const errMsg = err.message || String(err);
      this.status.set('error');
      this.error.set(errMsg);
      throw new Error(`WebLLM Initialization failed: ${errMsg}`);
    }
  }

  private async simulateLoading(onProgress?: (val: number, msg: string) => void): Promise<void> {
    const steps = [
      { progress: 0.1, text: 'Fetching model config...' },
      { progress: 0.3, text: 'Loading WebGPU device adapter...' },
      { progress: 0.6, text: 'Downloading model weights (simulated)...' },
      { progress: 0.9, text: 'Warming up runtime execution pipeline...' },
      { progress: 1.0, text: 'Finished warming up' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.progress.set(Math.round(step.progress * 100));
      this.status.set(`loading_model: ${step.text}`);
      if (onProgress) {
        onProgress(step.progress, step.text);
      }
    }

    this.engine = {
      chat: {
        completions: {
          create: async (params: any) => {
            // Return an async iterable stream simulator
            const responseText = `[Simulated WebLLM response to: "${params.messages[params.messages.length - 1]?.content}"] This is a locally generated streaming response using simulated model weights, as WebGPU is not supported on this device.`;
            const tokens = responseText.split(' ');
            return (async function* () {
              for (const token of tokens) {
                await new Promise(resolve => setTimeout(resolve, 40));
                yield {
                  choices: [
                    {
                      delta: {
                        content: token + ' '
                      }
                    }
                  ]
                };
              }
            })();
          }
        }
      }
    };
    this.isReady.set(true);
    this.status.set('ready');
  }

  async generate(
    messages: WebLlmMessage[],
    onToken?: (text: string) => void,
    options?: { max_tokens?: number; temperature?: number }
  ): Promise<string> {
    if (!this.engine) {
      throw new Error('WebLLM Engine is not initialized. Call init() first.');
    }

    this.status.set('generating');
    try {
      let fullText = '';
      const reply = await this.engine.chat.completions.create({
        messages,
        stream: true,
        max_tokens: options?.max_tokens ?? 1024,
        temperature: options?.temperature ?? 0.7
      });

      for await (const chunk of reply) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          if (onToken) {
            onToken(fullText);
          }
        }
      }
      this.status.set('ready');
      return fullText;
    } catch (err: any) {
      this.status.set('error');
      this.error.set(err.message || String(err));
      throw err;
    }
  }

  reset(): void {
    this.engine = null;
    this.isReady.set(false);
    this.status.set('idle');
    this.progress.set(0);
    this.error.set(null);
  }
}
