import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

type LogListener = (logs: LogEntry[]) => void;

class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: LogListener[] = [];

  constructor() {
    this.addLog('info', 'System Logger initialized.');
  }

  addLog(level: 'info' | 'success' | 'warn' | 'error', message: string) {
    const time = new Date().toLocaleTimeString();
    const newEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      timestamp: time,
      level,
      message
    };
    this.logs = [newEntry, ...this.logs].slice(0, 500);
    this.notify();
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.addLog('info', 'Logs cleared.');
  }

  exportLogsAsString(): string {
    return this.logs
      .slice()
      .reverse()
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
  }

  async saveLogsToFile(): Promise<boolean> {
    const logText = this.exportLogsAsString();
    const filename = `yt_downloader_logs_${Date.now()}.txt`;

    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: logText,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      try {
        await Share.share({
          title: 'System Logs',
          text: 'YouTube Downloader Logs',
          url: result.uri,
          dialogTitle: 'Save or Share Logs'
        });
      } catch {
        try {
          await Toast.show({ text: `File saved: ${filename}`, duration: 'short' });
        } catch {}
      }
      return true;
    } catch (err) {
      try {
        const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      } catch (webErr) {
        console.error('Failed to save log file', webErr);
        return false;
      }
    }
  }

  async copyLogsToClipboard(): Promise<boolean> {
    const text = this.exportLogsAsString();
    try {
      await Clipboard.write({ string: text });
      try {
        await Toast.show({ text: 'Logs copied to clipboard', duration: 'short' });
      } catch {}
      return true;
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        try {
          await Toast.show({ text: 'Logs copied to clipboard', duration: 'short' });
        } catch {}
        return true;
      } catch {
        return false;
      }
    }
  }

  subscribe(listener: LogListener) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.logs));
  }
}

export const logger = new LoggerService();
