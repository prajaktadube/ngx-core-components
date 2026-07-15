import { Component, inject } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NotificationContainerComponent, NotificationService } from './notification.service';

@Component({
  selector: 'ngx-notification-story-wrapper',
  standalone: true,
  template: `
    <div style="display: flex; gap: 12px; padding: 20px; font-family: sans-serif;">
      <button (click)="success()" style="padding: 10px 16px; border: none; background: #27ae60; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Success Notification</button>
      <button (click)="error()" style="padding: 10px 16px; border: none; background: #e74c3c; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Error Notification</button>
      <button (click)="warning()" style="padding: 10px 16px; border: none; background: #f39c12; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Warning Notification</button>
      <button (click)="info()" style="padding: 10px 16px; border: none; background: #1a73e8; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Info Notification</button>
    </div>
  `
})
class NotificationStoryWrapperComponent {
  private notifService = inject(NotificationService);

  success() {
    this.notifService.success('Your preferences have been saved successfully!', 'Action Successful');
  }
  error() {
    this.notifService.error('An error occurred while connecting to the server.', 'Connection Failed');
  }
  warning() {
    this.notifService.warning('Please double check the entered details.', 'Verification Required');
  }
  info() {
    this.notifService.info('A new application version is ready to install.', 'Update Available');
  }
}

const meta: Meta<NotificationStoryWrapperComponent> = {
  title: 'Feedback/Feedback & Progress/Notification',
  component: NotificationStoryWrapperComponent,
  decorators: [
    moduleMetadata({
      imports: [NotificationContainerComponent, NotificationStoryWrapperComponent],
      providers: [NotificationService],
    }),
  ],
};

export default meta;
type Story = StoryObj<NotificationStoryWrapperComponent>;

export const Interactive: Story = {};
