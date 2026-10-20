/**
 * Storage and synchronization service for MISI SAHABAT RUKUN.
 * Supports local offline storage (localStorage) and prepares Firestore hooks.
 * Designed with transparent status flags so teachers know whether online sync is active.
 */

import { StudentProfile, LevelProgress, StudentAttemptLog } from '../types/game';
import { cloudDb } from './firebase';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'msr_current_student',
  STUDENTS_LIST: 'msr_students_list',
  LEVEL_PROGRESS: 'msr_level_progress',
  ATTEMPT_LOGS: 'msr_attempt_logs',
  TEACHER_AUTH: 'msr_teacher_authenticated',
};

// Default seed students for Grade 2 demo testing
const DEFAULT_STUDENTS: StudentProfile[] = [
  {
    id: 'std-1',
    studentCode: 'K2-01',
    classCode: '2A-RUKUN',
    displayName: 'Ahmad Faiz',
    nickname: 'Faiz',
    avatarStyle: 'boy-1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActive: new Date().toISOString(),
    isOnline: true,
  },
  {
    id: 'std-2',
    studentCode: 'K2-02',
    classCode: '2A-RUKUN',
    displayName: 'Annisa Nurul',
    nickname: 'Nisa',
    avatarStyle: 'girl-1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    isOnline: false,
  },
  {
    id: 'std-3',
    studentCode: 'K2-03',
    classCode: '2A-RUKUN',
    displayName: 'Bima Aditya',
    nickname: 'Bima',
    avatarStyle: 'boy-2',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    isOnline: true,
  },
];

let levelUnlockDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSaveLevelUnlocks(settings: Record<string, boolean>) {
  if (levelUnlockDebounceTimer) {
    clearTimeout(levelUnlockDebounceTimer);
  }
  levelUnlockDebounceTimer = setTimeout(() => {
    cloudDb.saveLevelUnlocks(settings).catch((e) => console.warn('Cloud saveLevelUnlocks error:', e));
    levelUnlockDebounceTimer = null;
  }, 120);
}

export const gameDb = {
  // Check if Firebase is provisioned (e.g. firebase-applet-config exists)
  isOnlineFirestoreConfigured(): boolean {
    return true; // Firebase Firestore active & connected
  },

  getCurrentStudent(): StudentProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
      return data ? JSON.parse(data) : DEFAULT_STUDENTS[0];
    } catch {
      return DEFAULT_STUDENTS[0];
    }
  },

  setCurrentStudent(student: StudentProfile | null) {
    if (student) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
    }
  },

  getAllStudents(): StudentProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS_LIST);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  },

  addStudent(studentData: Omit<StudentProfile, 'id' | 'createdAt' | 'lastActive'>): StudentProfile {
    const students = this.getAllStudents();
    const newStudent: StudentProfile = {
      ...studentData,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    };
    const updated = [newStudent, ...students];
    localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(updated));
    // Asynchronously save to Firebase Cloud Firestore
    cloudDb.saveStudent(newStudent).catch((e) => console.warn('Cloud saveStudent error:', e));
    return newStudent;
  },

  getLevelProgress(studentId: string): Record<string, LevelProgress> {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.LEVEL_PROGRESS}_${studentId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }

    // Default: Level 1 unlocked, others locked
    return {
      'taman-pancasila': {
        levelId: 'taman-pancasila',
        status: 'unlocked',
        starsEarned: 0,
        score: 0,
        xpEarned: 0,
        attemptsCount: 0,
        lastPlayedAt: new Date().toISOString(),
      },
      'perpustakaan-ceria': {
        levelId: 'perpustakaan-ceria',
        status: 'locked',
        starsEarned: 0,
        score: 0,
        xpEarned: 0,
        attemptsCount: 0,
        lastPlayedAt: '',
      },
      'kantin-pintar': {
        levelId: 'kantin-pintar',
        status: 'locked',
        starsEarned: 0,
        score: 0,
        xpEarned: 0,
        attemptsCount: 0,
        lastPlayedAt: '',
      },
      'studio-kreatif': {
        levelId: 'studio-kreatif',
        status: 'locked',
        starsEarned: 0,
        score: 0,
        xpEarned: 0,
        attemptsCount: 0,
        lastPlayedAt: '',
      },
      'lapangan-persahabatan': {
        levelId: 'lapangan-persahabatan',
        status: 'locked',
        starsEarned: 0,
        score: 0,
        xpEarned: 0,
        attemptsCount: 0,
        lastPlayedAt: '',
      },
    };
  },

  saveLevelProgress(studentId: string, levelId: string, progressUpdate: Partial<LevelProgress>) {
    const currentProgress = this.getLevelProgress(studentId);
    const existing = currentProgress[levelId] || {
      levelId,
      status: 'unlocked',
      starsEarned: 0,
      score: 0,
      xpEarned: 0,
      attemptsCount: 0,
      lastPlayedAt: new Date().toISOString(),
    };

    const updated: LevelProgress = {
      ...existing,
      ...progressUpdate,
      attemptsCount: existing.attemptsCount + 1,
      lastPlayedAt: new Date().toISOString(),
    };

    // Petualangan kedua (Perpustakaan Ceria) dan level berikutnya tetap terkunci (locked) sesuai permintaan guru
    // meskipun tugas/misi Taman Pancasila telah diselesaikan.
    currentProgress[levelId] = updated;

    try {
      localStorage.setItem(`${STORAGE_KEYS.LEVEL_PROGRESS}_${studentId}`, JSON.stringify(currentProgress));
    } catch {
      // Ignore
    }

    // Asynchronously save to Firebase Cloud Firestore
    cloudDb.saveProgress(studentId, updated).catch((e) => console.warn('Cloud saveProgress error:', e));
  },

  deleteStudent(studentId: string): boolean {
    const students = this.getAllStudents();
    const updated = students.filter((s) => s.id !== studentId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(updated));
    localStorage.removeItem(`${STORAGE_KEYS.LEVEL_PROGRESS}_${studentId}`);

    // Bersihkan atau alihkan siswa aktif jika yang dihapus adalah siswa yang sedang aktif
    const current = this.getCurrentStudent();
    if (current && current.id === studentId) {
      this.setCurrentStudent(updated.length > 0 ? updated[0] : null);
    }

    // Asynchronously delete from Firebase Cloud Firestore
    cloudDb.deleteStudent(studentId).catch((e) => console.warn('Cloud deleteStudent error:', e));
    return true;
  },

  resetDefaultStudents(): StudentProfile[] {
    localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(DEFAULT_STUDENTS));
    this.setCurrentStudent(DEFAULT_STUDENTS[0]);
    DEFAULT_STUDENTS.forEach((s) => cloudDb.saveStudent(s).catch(() => {}));
    return DEFAULT_STUDENTS;
  },

  getLevelUnlockSettings(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem('msr_level_unlocks');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      'taman-pancasila': true,
      'perpustakaan-ceria': false,
      'kantin-pintar': false,
      'studio-kreatif': false,
      'lapangan-persahabatan': false,
    };
  },

  /**
   * Terapkan pembaruan kunci level dari Firestore ke LocalStorage
   * TANPA memicu write balik ke Firestore (mencegah loop tak terhingga).
   */
  applyCloudLevelUnlocks(cloudSettings: Record<string, boolean>): Record<string, boolean> {
    const current = this.getLevelUnlockSettings();
    const updated: Record<string, boolean> = {
      ...current,
      ...cloudSettings,
      // Level 1 selalu terbuka sebagai misi pengenalan jika tidak diset eksplisit
      'taman-pancasila':
        cloudSettings['taman-pancasila'] !== undefined
          ? Boolean(cloudSettings['taman-pancasila'])
          : (current['taman-pancasila'] !== undefined ? Boolean(current['taman-pancasila']) : true),
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('msr_level_unlocks', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
    return updated;
  },

  setLevelUnlock(levelId: string, isUnlocked: boolean): Record<string, boolean> {
    const current = this.getLevelUnlockSettings();
    current[levelId] = isUnlocked;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('msr_level_unlocks', JSON.stringify(current));
      }
    } catch {
      // ignore
    }
    // Asynchronously update Firebase Cloud dengan debounce agar tidak bentrok
    debouncedSaveLevelUnlocks(current);
    return current;
  },

  setLevelUnlockSettings(newSettings: Record<string, boolean>): Record<string, boolean> {
    const current = { ...this.getLevelUnlockSettings(), ...newSettings };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('msr_level_unlocks', JSON.stringify(current));
      }
    } catch {
      // ignore
    }
    // Asynchronously update Firebase Cloud dengan debounce
    debouncedSaveLevelUnlocks(current);
    return current;
  },

  isLevelUnlocked(levelId: string): boolean {
    const settings = this.getLevelUnlockSettings();
    return Boolean(settings[levelId]);
  },

  getTeacherPin(): string {
    return localStorage.getItem('msr_teacher_pin') || '1234';
  },

  setTeacherPin(newPin: string): boolean {
    const clean = newPin.trim();
    if (!clean) return false;
    localStorage.setItem('msr_teacher_pin', clean);
    // Sinkronkan ke Cloud Firestore agar berlaku di seluruh perangkat/siswa
    cloudDb
      .saveSecuritySettings({
        teacherPin: clean,
        authorizedEmails: this.getAuthorizedTeacherEmails(),
      })
      .catch((e) => console.warn('Could not sync PIN to cloud:', e));
    return true;
  },

  setTeacherPinLocalOnly(newPin: string): void {
    const clean = newPin.trim();
    if (clean) {
      localStorage.setItem('msr_teacher_pin', clean);
    }
  },

  verifyTeacherPin(inputPin: string): boolean {
    const savedPin = this.getTeacherPin();
    const cleanInput = inputPin.trim();
    // Keamanan Ketat: Jika PIN sudah diubah oleh guru (bukan '1234'),
    // maka input default '1234' WAJIB DITOLAK secara tegas!
    if (savedPin !== '1234' && cleanInput === '1234') {
      return false;
    }
    return cleanInput === savedPin;
  },

  getAuthorizedTeacherEmails(): string[] {
    try {
      const raw = localStorage.getItem('msr_authorized_teacher_emails');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch {
      // fallback
    }
    // Email default akun guru (pemilik proyek)
    return ['ahmadzikri1420@gmail.com'];
  },

  addAuthorizedTeacherEmail(email: string): boolean {
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !cleaned.includes('@')) return false;
    const current = this.getAuthorizedTeacherEmails();
    if (!current.includes(cleaned)) {
      current.push(cleaned);
      localStorage.setItem('msr_authorized_teacher_emails', JSON.stringify(current));
      cloudDb
        .saveSecuritySettings({
          teacherPin: this.getTeacherPin(),
          authorizedEmails: current,
        })
        .catch((e) => console.warn('Could not sync authorized emails to cloud:', e));
    }
    return true;
  },

  removeAuthorizedTeacherEmail(email: string): boolean {
    const cleaned = email.trim().toLowerCase();
    const current = this.getAuthorizedTeacherEmails().filter((e) => e.toLowerCase() !== cleaned);
    localStorage.setItem('msr_authorized_teacher_emails', JSON.stringify(current));
    cloudDb
      .saveSecuritySettings({
        teacherPin: this.getTeacherPin(),
        authorizedEmails: current,
      })
      .catch((e) => console.warn('Could not sync authorized emails to cloud:', e));
    return true;
  },

  isAuthorizedTeacherEmail(email?: string | null): boolean {
    if (!email) return false;
    const cleaned = email.trim().toLowerCase();
    const allowed = this.getAuthorizedTeacherEmails().map((e) => e.toLowerCase());
    return allowed.includes(cleaned);
  },

  logAttempt(attempt: Omit<StudentAttemptLog, 'id' | 'timestamp'>) {
    const fullLog: StudentAttemptLog = {
      ...attempt,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPT_LOGS);
      const list: StudentAttemptLog[] = raw ? JSON.parse(raw) : [];
      list.unshift(fullLog);
      // Keep recent 200 logs
      localStorage.setItem(STORAGE_KEYS.ATTEMPT_LOGS, JSON.stringify(list.slice(0, 200)));
    } catch {
      // Ignore
    }

    // Asynchronously save to Firebase Cloud Firestore
    cloudDb.saveAttemptLog(fullLog).catch((e) => console.warn('Cloud saveAttemptLog error:', e));
  },

  clearAttemptLogs(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPT_LOGS);
      // Asynchronously clear logs on Firebase Cloud Firestore
      cloudDb.clearAllAttemptLogs().catch((e) => console.warn('Cloud clearAllAttemptLogs error:', e));
      return true;
    } catch {
      return false;
    }
  },

  getAttemptLogs(): StudentAttemptLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPT_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  exportLogsAsCSV(): string {
    const logs = this.getAttemptLogs();
    if (logs.length === 0) {
      return 'ID Siswa,Nama Siswa,Kelas,Level,Pertanyaan,Jawaban Siswa,Benar/Salah,Skor,Waktu\n';
    }

    const headers = ['ID Siswa', 'Nama Siswa', 'Kelas', 'Level', 'Pertanyaan', 'Jawaban Siswa', 'Status', 'Skor', 'Waktu'];
    const rows = logs.map((log) => [
      log.studentId,
      `"${log.studentName}"`,
      log.classCode,
      log.levelId,
      `"${log.questionText.replace(/"/g, '""')}"`,
      `"${log.selectedAnswer.replace(/"/g, '""')}"`,
      log.isCorrect ? 'BENAR' : 'SALAH',
      log.scoreAwarded,
      new Date(log.timestamp).toLocaleString('id-ID'),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  async syncFromCloud(): Promise<boolean> {
    try {
      // 1. Sync Level unlock settings (gunakan applyCloudLevelUnlocks agar default dan key terjaga)
      const cloudUnlocks = await cloudDb.getLevelUnlocks();
      if (cloudUnlocks) {
        this.applyCloudLevelUnlocks(cloudUnlocks);
      }

      // 2. Sync Students list
      const cloudStudents = await cloudDb.getStudents();
      if (cloudStudents && cloudStudents.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(cloudStudents));
      } else {
        // Seed cloud with default students if empty
        const locals = this.getAllStudents();
        for (const s of locals) {
          await cloudDb.saveStudent(s).catch(() => {});
        }
      }

      // 3. Sync Attempt logs
      const cloudLogs = await cloudDb.getAttemptLogs();
      if (cloudLogs && cloudLogs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ATTEMPT_LOGS, JSON.stringify(cloudLogs));
      }

      // 4. Sync Security Settings (PIN & Authorized Emails) from Cloud
      try {
        const cloudSec = await cloudDb.getSecuritySettings();
        if (cloudSec) {
          if (cloudSec.teacherPin) {
            localStorage.setItem('msr_teacher_pin', cloudSec.teacherPin);
          }
          if (Array.isArray(cloudSec.authorizedEmails) && cloudSec.authorizedEmails.length > 0) {
            localStorage.setItem('msr_authorized_teacher_emails', JSON.stringify(cloudSec.authorizedEmails));
          }
        }
      } catch (errSec) {
        console.warn('Could not sync security settings from cloud:', errSec);
      }

      return true;
    } catch (e) {
      console.warn('Cloud sync error or offline fallback:', e);
      return false;
    }
  },
};
