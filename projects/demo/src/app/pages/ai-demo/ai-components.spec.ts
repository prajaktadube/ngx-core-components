import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  AIChatComponent,
  AICodeEditorComponent,
  AIAudioWaveComponent,
  AIRagInspectorComponent,
  RAGSource,
  AIMessage
} from 'ngx-core-components/ai';

@Component({
  standalone: true,
  imports: [
    AIChatComponent,
    AICodeEditorComponent,
    AIAudioWaveComponent,
    AIRagInspectorComponent
  ],
  template: `
    <!-- RAG Inspector -->
    <ngx-ai-rag-inspector
      #ragInspector
      [sources]="sources()"
      [theme]="theme()"
      (sourceFeedback)="onSourceFeedback($event)"
      (sourceClick)="onSourceClick($event)"
    />

    <!-- AI Chat Component -->
    <ngx-ai-chat
      #aiChat
      [messages]="messages()"
      (messageFeedback)="onMessageFeedback($event)"
      (messageSent)="onMessageSent($event)"
    />

    <!-- AI Code Editor -->
    <ngx-ai-code-editor
      #codeEditor
      [code]="code()"
      (codeChange)="code.set($event)"
      [suggestions]="suggestions()"
    />

    <!-- AI Audio Wave -->
    <ngx-ai-audio-wave
      #audioWave
      [state]="audioState()"
      [autoCapture]="autoCapture()"
    />
  `
})
class TestAIWrapperComponent {
  theme = signal<'light' | 'dark'>('light');

  // RAG Sources
  sources = signal<RAGSource[]>([
    {
      id: 'rag-1',
      title: 'Angular Signals.pdf',
      sourceType: 'pdf',
      score: 0.9,
      snippet: 'Signals are reactive primitives tracking values and execution contexts.'
    },
    {
      id: 'rag-2',
      title: 'RAG Architecture.docx',
      sourceType: 'docx',
      score: 0.75,
      snippet: 'RAG feeds context chunks to large language models.'
    }
  ]);
  lastSourceFeedback: any = null;
  onSourceFeedback(event: any) { this.lastSourceFeedback = event; }
  lastSourceClicked: any = null;
  onSourceClick(src: any) { this.lastSourceClicked = src; }

  // Chat
  messages = signal<AIMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello World code: ```typescript\nconst x = 5;\n```',
      timestamp: new Date()
    }
  ]);
  lastMessageFeedback: any = null;
  onMessageFeedback(event: any) { this.lastMessageFeedback = event; }
  lastMessageSent: any = null;
  onMessageSent(event: any) { this.lastMessageSent = event; }

  // Code Editor
  code = signal('function test() {');
  suggestions = signal(['\n  console.log("hello");\n}', '\n  return true;\n}']);

  // Audio Wave
  audioState = signal<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  autoCapture = signal(false);
}

describe('AI Components Tests', () => {
  let fixture: ComponentFixture<TestAIWrapperComponent>;
  let wrapper: TestAIWrapperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAIWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestAIWrapperComponent);
    wrapper = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('AIRagInspectorComponent', () => {
    it('should render sources list and support expand/collapse', () => {
      const cards = fixture.debugElement.queryAll(By.css('.source-card'));
      expect(cards.length).toBe(2);
      expect(cards[0].nativeElement.textContent).toContain('Angular Signals.pdf');

      // Click card to expand
      cards[0].nativeElement.click();
      fixture.detectChanges();

      expect(wrapper.lastSourceClicked?.id).toBe('rag-1');
      expect(cards[0].nativeElement.classList.contains('expanded')).toBeTrue();
    });

    it('should emit feedback when rating is clicked', () => {
      const cards = fixture.debugElement.queryAll(By.css('.source-card'));
      cards[0].nativeElement.click();
      fixture.detectChanges();

      const thumbsUp = fixture.debugElement.query(By.css('.thumbs-up'));
      expect(thumbsUp).toBeTruthy();
      thumbsUp.nativeElement.click();
      fixture.detectChanges();

      expect(wrapper.lastSourceFeedback).toEqual({ sourceId: 'rag-1', type: 'up' });
    });
  });

  describe('AIChatComponent Upgrades', () => {
    it('should render rating buttons for assistant messages and copy button inside code blocks', () => {
      const thumbsUpBtn = fixture.debugElement.query(By.css('.feedback-tiny-btn'));
      expect(thumbsUpBtn).toBeTruthy();
      thumbsUpBtn.nativeElement.click();
      fixture.detectChanges();
      expect(wrapper.lastMessageFeedback?.rating).toBe('like');

      const copyBtn = fixture.debugElement.query(By.css('.copy-code-btn'));
      expect(copyBtn).toBeTruthy();
      expect(copyBtn.nativeElement.textContent).toBe('Copy');
    });
  });

  describe('AICodeEditorComponent Upgrades', () => {
    it('should handle cycle/navigate through suggestions and support diff view toggle', () => {
      const editor = fixture.debugElement.query(By.directive(AICodeEditorComponent)).componentInstance as AICodeEditorComponent;
      expect(editor.currentSuggestion()).toBe('\n  console.log("hello");\n}');

      const arrows = fixture.debugElement.queryAll(By.css('.nav-arrow'));
      expect(arrows.length).toBe(2);
      arrows[1].nativeElement.click(); // Click right arrow
      fixture.detectChanges();
      expect(editor.currentSuggestion()).toBe('\n  return true;\n}');

      // Toggle diff view
      const diffToggle = fixture.debugElement.query(By.css('.toolbar-toggle-btn'));
      expect(diffToggle).toBeTruthy();
      diffToggle.nativeElement.click();
      fixture.detectChanges();
      expect(editor.diffMode()).toBeTrue();
      
      const diffCanvas = fixture.debugElement.query(By.css('.diff-canvas'));
      expect(diffCanvas).toBeTruthy();
    });

    it('should generate highlighted code for supported languages', () => {
      const editor = fixture.debugElement.query(By.directive(AICodeEditorComponent)).componentInstance as AICodeEditorComponent;
      
      wrapper.code.set('const a = 5;');
      fixture.detectChanges();
      
      expect(editor.highlightedCode()).toContain('<span class="hl-keyword">const</span>');
    });

    it('should insert two spaces when Tab is pressed and suggestion is inactive', fakeAsync(() => {
      const editor = fixture.debugElement.query(By.directive(AICodeEditorComponent)).componentInstance as AICodeEditorComponent;
      const textareaDe = fixture.debugElement.query(By.css('.hidden-textarea'));
      const textarea = textareaDe.nativeElement as HTMLTextAreaElement;
      
      let emittedCode = '';
      editor.codeChange.subscribe(val => emittedCode = val);

      wrapper.suggestions.set([]);
      fixture.detectChanges();
      expect(editor.hasSuggestion()).toBeFalse();
      
      textarea.value = 'function() {';
      textarea.selectionStart = textarea.selectionEnd = 12;
      
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      textarea.dispatchEvent(tabEvent);
      fixture.detectChanges();
      tick();
      
      expect(emittedCode).toBe('function() {  ');
      expect(textarea.selectionStart).toBe(14);
    }));
  });

  describe('AIAudioWaveComponent Upgrades', () => {
    it('should initialize and support microphone capture toggling', () => {
      const wave = fixture.debugElement.query(By.directive(AIAudioWaveComponent)).componentInstance as AIAudioWaveComponent;
      expect(wave.autoCapture()).toBeFalse();
      wrapper.autoCapture.set(true);
      fixture.detectChanges();
      expect(wave.autoCapture()).toBeTrue();
    });
  });
});
