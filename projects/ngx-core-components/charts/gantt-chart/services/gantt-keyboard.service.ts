import { Injectable, signal, computed } from '@angular/core';

@Injectable()
export class GanttKeyboardService {
  readonly focusedTaskId = signal<string | null>(null);

  focusTask(taskId: string): void {
    this.focusedTaskId.set(taskId);
  }

  clearFocus(): void {
    this.focusedTaskId.set(null);
  }

  handleKeyDown(
    event: KeyboardEvent,
    visibleTaskIds: string[],
    callbacks: {
      onSelect?: (taskId: string) => void;
      onEscape?: () => void;
    }
  ): void {
    const currentId = this.focusedTaskId();
    const currentIndex = currentId ? visibleTaskIds.indexOf(currentId) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < visibleTaskIds.length - 1) {
          this.focusTask(visibleTaskIds[currentIndex + 1]);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          this.focusTask(visibleTaskIds[currentIndex - 1]);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentId && callbacks.onSelect) {
          callbacks.onSelect(currentId);
        }
        break;
      case 'Escape':
        this.clearFocus();
        callbacks.onEscape?.();
        break;
    }
  }
}
