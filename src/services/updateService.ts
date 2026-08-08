export interface UpdateInfo {
  updateAvailable: boolean;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  releaseUrl: string;
}

export const APP_VERSION = '1.0.0';

export class UpdateService {
  private static REPO_OWNER = 'yootra';
  private static REPO_NAME = 'yootra-mobile';

  static async checkForUpdates(currentVersion = APP_VERSION): Promise<UpdateInfo> {
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
          latestVersion: currentVersion,
          releaseNotes: '',
          downloadUrl: '',
          releaseUrl: ''
        };
      }

      const data = await response.json();
      const rawTag = (data.tag_name || '').replace(/^v/i, '').trim();
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

      const updateAvailable = this.compareVersions(rawTag, currentVersion) > 0;

      return {
        updateAvailable,
        latestVersion: rawTag,
        releaseNotes,
        downloadUrl,
        releaseUrl
      };
    } catch {
      return {
        updateAvailable: false,
        latestVersion: currentVersion,
        releaseNotes: '',
        downloadUrl: '',
        releaseUrl: ''
      };
    }
  }

  private static compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
    const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
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
