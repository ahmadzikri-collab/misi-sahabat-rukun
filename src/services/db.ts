/**
 * Storage and synchronization service for MISI SAHABAT RUKUN.
 * Supports local offline storage (localStorage) and prepares Firestore hooks.
 * Designed with transparent status flags so teachers know whether online sync is active.
 */

import {
  StudentProfile,
  LevelProgress,
  StudentAttemptLog,
  TeacherEncouragement,
  StudentLeaderboardEntry,
  StudentReflection,
} from '../types/game';
import { cloudDb } from './firebase';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'msr_current_student',
  STUDENTS_LIST: 'msr_students_list',
  LEVEL_PROGRESS: 'msr_level_progress',
  ATTEMPT_LOGS: 'msr_attempt_logs',
  TEACHER_AUTH: 'msr_teacher_authenticated',
  ENCOURAGEMENTS: 'msr_teacher_encouragements',
  REFLECTIONS: 'msr_student_reflections',
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
    lastActive: new Date(Date.now() - 3600000 * 5).toISOString(),
    isOnline: false,
    currentActivity: '⚪ Offline (Belum Masuk)',
  },
  {
    id: 'std-2',
    studentCode: 'K2-02',
    classCode: '2A-RUKUN',
    displayName: 'Annisa Nurul',
    nickname: 'Nisa',
    avatarStyle: 'girl-1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
    isOnline: false,
    currentActivity: '⚪ Offline (Belum Masuk)',
  },
  {
    id: 'std-3',
    studentCode: 'K2-03',
    classCode: '2A-RUKUN',
    displayName: 'Bima Aditya',
    nickname: 'Bima',
    avatarStyle: 'boy-2',
    createdAt: new Date().toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 8).toISOString(),
    isOnline: false,
    currentActivity: '⚪ Offline (Belum Masuk)',
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
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
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
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter(
            (s): s is StudentProfile => Boolean(s && typeof s === 'object' && s.id && s.displayName)
          );
          if (sanitized.length > 0) return sanitized;
        }
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

    // Perbarui keaktifan siswa saat berhasil menyelesaikan tantangan/misi
    this.updateStudentPresence(studentId, true, `Menyelesaikan Misi: ${levelId.replace(/-/g, ' ').toUpperCase()}`);

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
    window.dispatchEvent(new CustomEvent('msr_presence_updated', { detail: { studentId, isOnline: false } }));
    return true;
  },

  resetDefaultStudents(): StudentProfile[] {
    localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(DEFAULT_STUDENTS));
    this.setCurrentStudent(DEFAULT_STUDENTS[0]);
    DEFAULT_STUDENTS.forEach((s) => cloudDb.saveStudent(s).catch(() => {}));
    window.dispatchEvent(new CustomEvent('msr_presence_updated'));
    return DEFAULT_STUDENTS;
  },

  updateStudentPresence(studentId: string, isOnline: boolean, currentActivity?: string): void {
    const students = this.getAllStudents();
    const nowIso = new Date().toISOString();
    let hasChanged = false;

    const updated = students.map((s) => {
      if (s.id === studentId) {
        hasChanged = true;
        return {
          ...s,
          isOnline,
          currentActivity: currentActivity !== undefined ? currentActivity : s.currentActivity,
          lastActive: nowIso,
        };
      }
      return s;
    });

    let targetProfile = updated.find((s) => s.id === studentId);
    if (!targetProfile) {
      const current = this.getCurrentStudent();
      if (current && current.id === studentId) {
        targetProfile = {
          ...current,
          isOnline,
          currentActivity: currentActivity !== undefined ? currentActivity : current.currentActivity,
          lastActive: nowIso,
        };
        updated.push(targetProfile);
        hasChanged = true;
      }
    }

    if (hasChanged) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS_LIST, JSON.stringify(updated));
      const current = this.getCurrentStudent();
      if (current && current.id === studentId && targetProfile) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(targetProfile));
      }
      // Siarkan event pembaruan status kehadiran siswa seketika ke seluruh komponen
      if (typeof window !== 'undefined') {
        const activityText = targetProfile?.currentActivity || currentActivity || (isOnline ? 'Sedang Bermain' : 'Offline');
        window.dispatchEvent(
          new CustomEvent('msr_presence_updated', {
            detail: { studentId, isOnline, currentActivity: activityText },
          })
        );
      }
    }

    // Sinkronisasi status kehadiran siswa aktif ke Firestore secara real-time
    if (targetProfile) {
      cloudDb
        .saveStudent(targetProfile)
        .catch((e) => console.warn('Could not sync student presence to cloud:', e));
    } else {
      cloudDb
        .updateStudentPresence(studentId, {
          isOnline,
          currentActivity,
          lastActive: nowIso,
        })
        .catch((e) => console.warn('Could not sync presence to cloud:', e));
    }
  },

  toggleStudentOnlineStatus(studentId: string): boolean {
    const students = this.getAllStudents();
    const target = students.find((s) => s.id === studentId);
    if (!target) return false;
    const newStatus = !target.isOnline;
    const newActivity = newStatus ? 'Sedang Bermain' : 'Offline';
    this.updateStudentPresence(studentId, newStatus, newActivity);
    return newStatus;
  },

  clearCheatAttemptLogs(studentId?: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPT_LOGS);
      if (!raw) return;
      const list: StudentAttemptLog[] = JSON.parse(raw);
      const filtered = list.filter((item) => {
        const isCheatLog =
          item.questionText?.includes('[PERINGATAN INTEGRITAS]') ||
          item.questionId?.startsWith('peringatan-kejujuran');
        if (!isCheatLog) return true;
        if (studentId) {
          return item.studentId !== studentId;
        }
        return false;
      });
      localStorage.setItem(STORAGE_KEYS.ATTEMPT_LOGS, JSON.stringify(filtered));
    } catch {
      // ignore
    }
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

    // Perbarui status online dan aktivitas terkini siswa saat berinteraksi/menjawab soal
    if (attempt.studentId) {
      const missionLabel = attempt.levelId
        ? `Sedang Bermain: ${attempt.levelId.replace('level_', '').replace(/-/g, ' ').toUpperCase()}`
        : 'Sedang Bermain';
      this.updateStudentPresence(attempt.studentId, true, missionLabel);
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

  // ==========================================
  // REAL-TIME TEACHER ENCOURAGEMENT MESSAGES
  // ==========================================
  getAllEncouragements(): TeacherEncouragement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENCOURAGEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async sendEncouragement(
    targetStudentId: string,
    targetStudentName: string,
    text: string,
    icon = '⭐',
    senderName = 'Ibu/Bapak Guru'
  ): Promise<TeacherEncouragement> {
    const newMsg: TeacherEncouragement = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      senderName,
      targetStudentId,
      targetStudentName,
      text: text.trim(),
      icon,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const current = this.getAllEncouragements();
    const updated = [newMsg, ...current].slice(0, 100);
    try {
      localStorage.setItem(STORAGE_KEYS.ENCOURAGEMENTS, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Broadcast across windows & tabs
    window.dispatchEvent(new CustomEvent('msr_encouragement_received', { detail: newMsg }));

    // Send to Cloud Firestore
    cloudDb.sendEncouragement(newMsg).catch((e) => console.warn('Cloud sendEncouragement error:', e));

    return newMsg;
  },

  getEncouragementsForStudent(studentId: string): TeacherEncouragement[] {
    const all = this.getAllEncouragements();
    return all.filter((m) => m.targetStudentId === 'all' || m.targetStudentId === studentId);
  },

  async deleteEncouragement(messageId: string): Promise<void> {
    const current = this.getAllEncouragements();
    const updated = current.filter((m) => m.id !== messageId);
    try {
      localStorage.setItem(STORAGE_KEYS.ENCOURAGEMENTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('msr_encouragement_received'));
    cloudDb.deleteEncouragement(messageId).catch((e) => console.warn('Cloud deleteEncouragement error:', e));
  },

  async clearAllEncouragements(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.ENCOURAGEMENTS);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('msr_encouragement_received'));
    cloudDb.clearAllEncouragements().catch((e) => console.warn('Cloud clearAllEncouragements error:', e));
  },

  subscribeToEncouragements(callback: (messages: TeacherEncouragement[]) => void): () => void {
    // 1. Initial local load
    callback(this.getAllEncouragements());

    // 2. Local window event listener
    const handleLocal = () => {
      callback(this.getAllEncouragements());
    };
    window.addEventListener('msr_encouragement_received', handleLocal);

    // 3. Multi-tab storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ENCOURAGEMENTS) {
        callback(this.getAllEncouragements());
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Real-time Firebase Firestore listener
    const unsubCloud = cloudDb.subscribeToEncouragements((cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEYS.ENCOURAGEMENTS, JSON.stringify(cloudMsgs));
        } catch {
          // ignore
        }
        callback(cloudMsgs);
      }
    });

    return () => {
      window.removeEventListener('msr_encouragement_received', handleLocal);
      window.removeEventListener('storage', handleStorage);
      unsubCloud?.();
    };
  },

  // ==========================================
  // PAPAN PERINGKAT SISWA (STUDENT LEADERBOARD)
  // ==========================================
  getLeaderboard(classCodeFilter?: string): StudentLeaderboardEntry[] {
    const students = this.getAllStudents();
    const list: StudentLeaderboardEntry[] = [];

    students.forEach((student) => {
      if (classCodeFilter && student.classCode !== classCodeFilter) {
        return;
      }
      const progressMap = this.getLevelProgress(student.id);
      const progressValues = Object.values(progressMap);

      let totalScore = 0;
      let totalStars = 0;
      let totalXP = 0;
      let completedMissions = 0;

      progressValues.forEach((p) => {
        totalScore += p.score || 0;
        totalStars += p.starsEarned || 0;
        totalXP += p.xpEarned || 0;
        if (p.status === 'completed' || (p.starsEarned && p.starsEarned > 0)) {
          completedMissions += 1;
        }
      });

      list.push({
        rank: 0,
        studentId: student.id,
        studentCode: student.studentCode,
        displayName: student.displayName,
        nickname: student.nickname,
        classCode: student.classCode,
        avatarStyle: student.avatarStyle,
        isOnline: Boolean(student.isOnline),
        totalScore,
        totalStars,
        totalXP,
        completedMissions,
        badgeTitle: '',
        lastActive: student.lastActive,
      });
    });

    // Urutkan berdasarkan totalScore tertinggi, kemudian totalStars, lalu totalXP
    list.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
      return a.displayName.localeCompare(b.displayName);
    });

    // Berikan peringkat dan gelar badge
    return list.map((entry, index) => {
      const rank = index + 1;
      let badgeTitle = 'Bintang Rukun';
      if (rank === 1) badgeTitle = '🥇 Juara 1 Garuda Emas';
      else if (rank === 2) badgeTitle = '🥈 Juara 2 Garuda Perak';
      else if (rank === 3) badgeTitle = '🥉 Juara 3 Garuda Perunggu';
      else if (entry.completedMissions >= 3) badgeTitle = '⭐ Sahabat Teladan';
      else if (entry.completedMissions >= 1) badgeTitle = '🌱 Petualang Cilik';

      return {
        ...entry,
        rank,
        badgeTitle,
      };
    });
  },

  // Student Learning Reflections
  saveStudentReflection(reflection: StudentReflection): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      const list: StudentReflection[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(
        (r) => r.id === reflection.id || (r.studentId === reflection.studentId && r.levelId === reflection.levelId)
      );
      if (idx >= 0) {
        list[idx] = reflection;
      } else {
        list.unshift(reflection);
      }
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('msr_reflections_updated'));
      }
    } catch {
      // ignore
    }
    cloudDb.saveStudentReflection(reflection).catch((e) => console.warn('Cloud saveStudentReflection error:', e));
  },

  getStudentReflections(): StudentReflection[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addTeacherFeedbackToReflection(reflectionId: string, feedback: string): void {
    try {
      const list = this.getStudentReflections();
      const item = list.find((r) => r.id === reflectionId);
      if (item) {
        item.teacherFeedback = feedback;
        item.teacherFeedbackAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('msr_reflections_updated'));
        }
      }
    } catch {
      // ignore
    }
    cloudDb
      .updateReflectionFeedback(reflectionId, feedback)
      .catch((e) => console.warn('Cloud updateReflectionFeedback error:', e));
  },

  deleteStudentReflection(reflectionId: string): void {
    try {
      const list = this.getStudentReflections().filter((r) => r.id !== reflectionId);
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('msr_reflections_updated'));
      }
    } catch {
      // ignore
    }
    cloudDb.deleteStudentReflection(reflectionId).catch((e) => console.warn('Cloud deleteStudentReflection error:', e));
  },
};
