import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, Trash2, Download, Copy, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { logger } from '../services/loggerService';
import type { LogEntry } from '../services/loggerService';

interface LogViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLogs(logger.getLogs());
      const unsubscribe = logger.subscribe((updatedLogs) => {
        setLogs([...updatedLogs]);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  const getLevelBadgeClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-error/20 text-error border-error/30';
      case 'warn':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'success':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-info/20 text-info border-info/30';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="p-0 overflow-hidden max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-base-200 border-b border-base-300 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-base-content">
              {t('logViewer.title')}
            </h2>
            <p className="text-xs text-base-content/50 font-mono">
              {logs.length} {t('logViewer.entries')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => logger.copyLogsToClipboard()}
            title={t('logViewer.copy')}
            className="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-base-content"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => logger.saveLogsToFile()}
            title={t('logViewer.save')}
            className="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-base-content"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => logger.clearLogs()}
            title={t('logViewer.clear')}
            className="btn btn-sm btn-ghost btn-circle text-error/80 hover:text-error hover:bg-error/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-base-content/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logs View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-base-300/40 font-mono text-xs custom-scrollbar dir-ltr text-left">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-base-content/40 font-sans">
            {t('logViewer.empty')}
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-base-100 border border-base-300/60 shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded-md font-semibold border uppercase ${getLevelBadgeClass(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-base-content/40">{log.timestamp}</span>
              </div>
              <div className="text-base-content/90 break-words whitespace-pre-wrap leading-relaxed">
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-base-200 border-t border-base-300 flex items-center justify-between shrink-0 text-xs">
        <button
          type="button"
          onClick={() => logger.saveLogsToFile()}
          className="btn btn-sm btn-outline gap-1.5 rounded-xl"
        >
          <Download className="w-4 h-4" />
          {t('logViewer.saveToFile')}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-primary rounded-xl"
        >
          {t('logViewer.close')}
        </button>
      </div>
    </Modal>
  );
};
