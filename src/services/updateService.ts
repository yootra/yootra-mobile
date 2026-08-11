import { App as CapacitorApp } from '@capacitor/app';
import packageJson from '../../package.json';

export interface UpdateInfo {
  updateAvailable: boolean;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  releaseUrl: string;
}

export const APP_VERSION = packageJson.version;

export class UpdateService {
  private static REPO_OWNER = 'yootra';
  private static REPO_NAME = 'yootra-mobile';

  static async getCurrentVersion(): Promise<string> {
    try {
      const info = await CapacitorApp.getInfo();
      if (info && info.version) {
        return info.version;
      }
    } catch {
    }
    return APP_VERSION;
  }

  static async checkForUpdates(currentVersion?: string): Promise<UpdateInfo> {
    const activeVersion = currentVersion || await this.getCurrentVersion();
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/releases/latest`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        return {
          updateAvailable: false,
          latestVersion: activeVersion,
          releaseNotes: '',
          downloadUrl: '',
          releaseUrl: ''
        };
      }

      const data = await response.json();
      const rawTag = (data.tag_name || '').trim();
      const releaseUrl = data.html_url || `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/releases`;
      const releaseNotes = data.body || '';

      let downloadUrl = releaseUrl;
      if (Array.isArray(data.assets) && data.assets.length > 0) {
        const apkAsset = data.assets.find((asset: any) =>
          asset.name?.endsWith('.apk') && asset.name?.includes('arm64-v8a')
        ) || data.assets.find((asset: any) => asset.name?.endsWith('.apk'));

        if (apkAsset?.browser_download_url) {
          downloadUrl = apkAsset.browser_download_url;
        }
      }

      const updateAvailable = this.compareVersions(rawTag, activeVersion) > 0;

      return {
        updateAvailable,
        latestVersion: this.cleanVersion(rawTag),
        releaseNotes,
        downloadUrl,
        releaseUrl
      };
    } catch {
      return {
        updateAvailable: false,
        latestVersion: activeVersion,
        releaseNotes: '',
        downloadUrl: '',
        releaseUrl: ''
      };
    }
  }

  public static cleanVersion(v: string): string {
    if (!v) return '0.0.0';
    const match = v.match(/\d+(\.\d+)*/);
    return match ? match[0] : '0.0.0';
  }

  public static compareVersions(v1: string, v2: string): number {
    const s1 = this.cleanVersion(v1);
    const s2 = this.cleanVersion(v2);

    const p1 = s1.split('.').map((n) => parseInt(n, 10) || 0);
    const p2 = s2.split('.').map((n) => parseInt(n, 10) || 0);
    const len = Math.max(p1.length, p2.length);

    for (let i = 0; i < len; i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }
}
