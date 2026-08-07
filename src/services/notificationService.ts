import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        const res = await LocalNotifications.requestPermissions();
        return res.display === 'granted';
      }
      return true;
    } catch {
      if ('Notification' in window && Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return true;
    }
  }

  static async sendDownloadCompletedNotification(title: string, qualityLabel: string, ext: string, fileSizeText?: string) {
    const notifTitle = 'Download completed';
    const notifBody = title;
    const extraDetails = `${qualityLabel} • ${fileSizeText || ''} • ${ext.toUpperCase()}`.trim();

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title: notifTitle,
            body: extraDetails ? `${notifBody}\n${extraDetails}` : notifBody,
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notifTitle, {
          body: extraDetails ? `${notifBody}\n${extraDetails}` : notifBody,
          icon: '/favicon.ico'
        });
      }
    }
  }
}
