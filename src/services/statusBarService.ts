import { StatusBar, Style } from '@capacitor/status-bar';

export class StatusBarService {
  static async updateTheme(isDark: boolean) {
    try {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } catch {}
  }
}
