import { StatusBar, Style } from '@capacitor/status-bar';

export class StatusBarService {
  static async updateTheme(isDark: boolean, hexColor: string = '#FFFFFF') {
    try {
      await StatusBar.setBackgroundColor({ color: hexColor });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } catch {}
  }
}
