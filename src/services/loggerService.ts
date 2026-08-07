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
    this.logs = [newEntry, ...this.logs].slice(0, 200);
    this.notify();
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.addLog('info', 'Logs cleared.');
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
