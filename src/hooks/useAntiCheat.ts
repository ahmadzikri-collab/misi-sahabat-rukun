import { useState, useEffect, useCallback } from 'react';
import { antiCheatService, AntiCheatAlertEvent } from '../services/antiCheat';

interface UseAntiCheatOptions {
  studentId?: string;
  studentName?: string;
  classCode?: string;
  levelId: string;
  enabled?: boolean;
}

export function useAntiCheat({
  studentId = 'std-guest',
  studentName = 'Sahabat Juara',
  classCode = '2A',
  levelId,
  enabled = true,
}: UseAntiCheatOptions) {
  const [violationCount, setViolationCount] = useState<number>(() =>
    antiCheatService.getStudentViolationCount(studentId)
  );
  const [activeAlert, setActiveAlert] = useState<AntiCheatAlertEvent | null>(null);

  useEffect(() => {
    if (!enabled) return;

    antiCheatService.startSupervision({
      studentId,
      studentName,
      classCode,
      levelId,
    });

    const unsub = antiCheatService.subscribeAlert((alert) => {
      setViolationCount(alert.count);
      setActiveAlert(alert);
    });

    return () => {
      unsub();
      antiCheatService.stopSupervision();
    };
  }, [studentId, studentName, classCode, levelId, enabled]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return {
    violationCount,
    activeAlert,
    dismissAlert,
    toggleFullscreen: () => antiCheatService.toggleFullscreen(),
    isFullscreen: () => antiCheatService.isFullscreen(),
  };
}
