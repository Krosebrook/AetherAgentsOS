/**
 * @fileoverview Logging hook for system events
 * @module hooks/useLogger
 */

import { useState, useCallback } from 'react';
import { LogEntry, LogLevel } from '../types';
import { UI_CONFIG } from '../constants';
import { generateId, takeLast } from '../utils';

/**
 * Hook return type for logging
 */
export interface UseLoggerReturn {
  /** All log entries */
  logs: LogEntry[];
  /** Add a log entry */
  addLog: (level: LogEntry['level'], source: string, message: string) => void;
  /** Clear all logs */
  clearLogs: () => void;
  /** Get logs by level */
  getLogsByLevel: (level: LogLevel) => LogEntry[];
  /** Get recent logs count */
  recentCount: number;
}

/**
 * Hook for managing system logs
 *
 * @param maxEntries - Maximum number of log entries to retain
 * @returns Logging functions and state
 *
 * @example
 * ```tsx
 * const { logs, addLog, clearLogs } = useLogger();
 *
 * addLog('info', 'SYSTEM', 'Application started');
 * addLog('error', 'API', 'Request failed');
 * ```
 */
export function useLogger(maxEntries = UI_CONFIG.MAX_LOG_ENTRIES): UseLoggerReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback(
    (level: LogEntry['level'], source: string, message: string) => {
      const newLog: LogEntry = {
        id: generateId('log'),
        timestamp: Date.now(),
        level,
        source,
        message,
      };

      setLogs(prev => takeLast([...prev, newLog], maxEntries));
    },
    [maxEntries]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getLogsByLevel = useCallback(
    (level: LogLevel): LogEntry[] => {
      return logs.filter(log => log.level === level);
    },
    [logs]
  );

  return {
    logs,
    addLog,
    clearLogs,
    getLogsByLevel,
    recentCount: logs.length,
  };
}

export default useLogger;
