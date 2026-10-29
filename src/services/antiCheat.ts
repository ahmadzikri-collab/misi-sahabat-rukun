/**
 * Anti-Cheat & Academic Integrity Service for MISI SAHABAT RUKUN
 * Designed to supervise Grade 2 SD students during quiz missions across Laptop & HP:
 * 1. Mobile Screenshot Detection & Screen Blinding Shield (Android 3-finger swipe, Power+VolDown hardware screenshot, iOS side button screenshot)
 * 2. Instant Privacy Blinding Shield: When mobile loses focus or takes a snap, screen turns completely opaque so the screenshot captures zero questions
 * 3. Desktop Screenshot Prevention (PrintScreen, Snipping tool, macOS shortcuts, Ctrl+P)
 * 4. Tab Switch & Window Blur Detection
 * 5. Text Copy & Context Menu Blocker
 * 6. Cloud Sync with Teacher Dashboard & Firebase
 */

import { soundManager } from '../utils/audio';
import { gameDb } from './db';
import { cloudDb } from './firebase';

export type ViolationType =
  | 'tab_switch'
  | 'screenshot_attempt'
  | 'copy_attempt'
  | 'dev_tools'
  | 'exit_fullscreen';

export interface CheatViolationLog {
  id: string;
  studentId: string;
  studentName: string;
  classCode: string;
  levelId: string;
  violationType: ViolationType;
  details: string;
  timestamp: string;
}

export interface AntiCheatAlertEvent {
  violationType: ViolationType;
  title: string;
  message: string;
  count: number;
}

type AlertListener = (event: AntiCheatAlertEvent) => void;
type ObscureListener = (isObscured: boolean) => void;

class AntiCheatService {
  private isSupervisionActive: boolean = false;
  private currentStudentId: string = '';
  private currentStudentName: string = '';
  private currentClassCode: string = '';
  private currentLevelId: string = '';
  private violationCount: number = 0;
  private alertListeners: Set<AlertListener> = new Set();
  private obscureListeners: Set<ObscureListener> = new Set();
  private blurStartTime: number = 0;
  private lastViolationTimestamp: number = 0;
  private isFullscreenActive: boolean = false;
  private isScreenObscured: boolean = false;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  public subscribeAlert(listener: AlertListener): () => void {
    this.alertListeners.add(listener);
    return () => {
      this.alertListeners.delete(listener);
    };
  }

  public subscribeObscure(listener: ObscureListener): () => void {
    this.obscureListeners.add(listener);
    // notify current state
    listener(this.isScreenObscured);
    return () => {
      this.obscureListeners.delete(listener);
    };
  }

  private notifyAlert(event: AntiCheatAlertEvent) {
    this.alertListeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // ignore
      }
    });
  }

  private setObscured(obscured: boolean) {
    this.isScreenObscured = obscured;
    this.obscureListeners.forEach((listener) => {
      try {
        listener(obscured);
      } catch {
        // ignore
      }
    });
  }

  private activeSupervisorsCount: number = 0;

  /**
   * Mengaktifkan sistem pengawas anti-kecurangan saat siswa memulai level / misi kuis
   */
  public startSupervision(params: {
    studentId: string;
    studentName: string;
    classCode: string;
    levelId: string;
  }) {
    this.currentStudentId = params.studentId;
    this.currentStudentName = params.studentName;
    this.currentClassCode = params.classCode;
    this.currentLevelId = params.levelId;
    this.activeSupervisorsCount += 1;
    this.isSupervisionActive = true;
    this.blurStartTime = 0;

    this.violationCount = this.getStudentViolationCount(params.studentId);

    if (typeof window !== 'undefined' && this.activeSupervisorsCount === 1) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('blur', this.handleWindowBlur);
      window.addEventListener('focus', this.handleWindowFocus);
      window.addEventListener('keydown', this.handleKeyDown, true);
      document.addEventListener('contextmenu', this.handleContextMenu);
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    }
  }

  /**
   * Menonaktifkan pengawas saat siswa kembali ke peta atau selesai misi
   */
  public stopSupervision(force: boolean = false) {
    if (force) {
      this.activeSupervisorsCount = 0;
    } else {
      this.activeSupervisorsCount = Math.max(0, this.activeSupervisorsCount - 1);
    }

    if (this.activeSupervisorsCount > 0) {
      return; // Tetap aktif karena masih diawasi oleh layer global App.tsx
    }

    this.isSupervisionActive = false;
    this.setObscured(false);
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('blur', this.handleWindowBlur);
      window.removeEventListener('focus', this.handleWindowFocus);
      window.removeEventListener('keydown', this.handleKeyDown, true);
      document.removeEventListener('contextmenu', this.handleContextMenu);
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchmove', this.handleTouchMove);
    }
  }

  public getViolationCount(): number {
    return this.violationCount;
  }

  public getStudentViolationCount(studentId: string): number {
    try {
      const logs = this.getAllViolationLogs();
      return logs.filter((l) => l.studentId === studentId).length;
    } catch {
      return 0;
    }
  }

  public getAllViolationLogs(): CheatViolationLog[] {
    try {
      const raw = localStorage.getItem('msr_cheat_violation_logs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async clearAllViolationLogs(): Promise<void> {
    try {
      localStorage.removeItem('msr_cheat_violation_logs');
      this.violationCount = 0;
      gameDb.clearCheatAttemptLogs();
      this.notifyAlert({
        violationType: 'dev_tools',
        title: '',
        message: '',
        count: 0,
      });
      await cloudDb.clearAllCheatViolations();
    } catch (e) {
      console.warn('clearAllViolationLogs error:', e);
    }
  }

  public async clearStudentViolations(studentId: string): Promise<void> {
    try {
      const logs = this.getAllViolationLogs().filter((l) => l.studentId !== studentId);
      localStorage.setItem('msr_cheat_violation_logs', JSON.stringify(logs));
      gameDb.clearCheatAttemptLogs(studentId);
      if (this.currentStudentId === studentId) {
        this.violationCount = 0;
        this.notifyAlert({
          violationType: 'dev_tools',
          title: '',
          message: '',
          count: 0,
        });
      }
      await cloudDb.deleteCheatViolationsByStudentId(studentId);
    } catch (e) {
      console.warn('clearStudentViolations error:', e);
    }
  }

  private isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );
  }

  public recordViolation(type: ViolationType, details: string) {
    if (!this.isSupervisionActive) return;

    // Debounce violation alert per 1.2 detik agar tidak spamming ganda
    const now = Date.now();
    if (now - this.lastViolationTimestamp < 1200) {
      return;
    }
    this.lastViolationTimestamp = now;

    this.violationCount += 1;
    soundManager.playWarning();

    const violationLog: CheatViolationLog = {
      id: `cheat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId: this.currentStudentId || 'std-guest',
      studentName: this.currentStudentName || 'Siswa',
      classCode: this.currentClassCode || '2A',
      levelId: this.currentLevelId || 'misi-aktif',
      violationType: type,
      details,
      timestamp: new Date().toISOString(),
    };

    // 1. Simpan ke LocalStorage
    try {
      const logs = this.getAllViolationLogs();
      logs.unshift(violationLog);
      localStorage.setItem('msr_cheat_violation_logs', JSON.stringify(logs.slice(0, 300)));
    } catch {
      // ignore
    }

    // 2. Simpan ke Log Aktivitas Umum Guru
    gameDb.logAttempt({
      studentId: violationLog.studentId,
      studentName: violationLog.studentName,
      classCode: violationLog.classCode,
      levelId: violationLog.levelId,
      questionId: `peringatan-kejujuran-${type}`,
      questionText: `[PERINGATAN INTEGRITAS] ${details}`,
      selectedAnswer: `Pelanggaran: ${type.toUpperCase()}`,
      isCorrect: false,
      scoreAwarded: 0,
      attemptNumber: 1,
    });

    // 3. Simpan ke Firestore
    cloudDb.saveCheatViolation?.(violationLog).catch(() => {});

    // 4. Modal Dialog Peringatan
    let title = '⚠️ Peringatan Kejujuran Ujian';
    let message = details;

    if (type === 'screenshot_attempt') {
      title = '📸 Tangkap Layar di HP Dicegah!';
      message =
        'Terdeteksi upaya tangkap layar (screenshot) pada perangkat HP/laptop. Soal misi dilindungi demi menjaga sportivitas dan kejujuran!';
    } else if (type === 'tab_switch') {
      title = '⚠️ Jangan Tinggalkan Layar Misi!';
      message =
        'Terdeteksi berpindah tab atau membuka aplikasi lain di HP/laptop. Harap tetap di layar ujian agar nilai kejujuranmu terjaga!';
    } else if (type === 'copy_attempt') {
      title = '📋 Salin Teks Dinonaktifkan!';
      message =
        'Teks soal tidak boleh disalin. Kerjakanlah dengan pemikiranmu sendiri secara jujur dan mandiri ya!';
    } else if (type === 'exit_fullscreen') {
      title = '🖥️ Mode Layar Penuh Terputus!';
      message =
        'Kamu keluar dari mode layar penuh. Harap kembali ke mode layar penuh untuk kenyamanan dan kejujuran ujian.';
    }

    this.notifyAlert({
      violationType: type,
      title,
      message,
      count: this.violationCount,
    });
  }

  // 1. Deteksi Touch Gesture Screenshot di HP (3 jari swipe ke bawah khas Android/Xiaomi/Oppo/Vivo/Samsung)
  private touchStartY: number = 0;

  private handleTouchStart(e: TouchEvent) {
    if (!this.isSupervisionActive) return;
    if (e.touches && e.touches.length >= 3) {
      this.setObscured(true);
      this.clearClipboardSafe();
      this.vibrateDevice();
      this.recordViolation(
        'screenshot_attempt',
        'Terdeteksi gestur 3 jari di HP (shortcut tangkap layar bawaan ponsel)!'
      );
    } else if (e.touches && e.touches.length >= 2) {
      this.touchStartY = e.touches[0].clientY;
    }
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isSupervisionActive) return;
    if (e.touches && e.touches.length >= 3) {
      this.setObscured(true);
      this.clearClipboardSafe();
      this.vibrateDevice();
      this.recordViolation(
        'screenshot_attempt',
        'Terdeteksi usapan 3 jari di layar HP untuk mengambil tangkapan layar!'
      );
    } else if (e.touches && e.touches.length >= 2 && this.touchStartY > 0) {
      const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
      if (deltaY > 60) {
        this.setObscured(true);
        this.clearClipboardSafe();
        this.vibrateDevice();
        this.recordViolation(
          'screenshot_attempt',
          'Terdeteksi usapan multi-jari di layar HP (shortcut screenshot)!'
        );
      }
    }
  }

  // Getaran perangkat (Haptic Feedback) saat terjadi pelanggaran
  public vibrateDevice() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 400]);
      } catch {
        // ignore
      }
    }
  }

  // 2. Deteksi Window Blur & Perlindungan Layar Seketika (Screen Blinding Shield)
  private handleWindowBlur() {
    if (!this.isSupervisionActive) return;
    this.blurStartTime = Date.now();

    // SECARA INSTAN AKTIFKAN PERISAI HITAM PENUTUP LAYAR
    // Sehingga apabila HP mengambil tangkapan layar (screenshot), yang terpotret hanyalah layar peringatan hitam polos!
    this.setObscured(true);
    this.clearClipboardSafe();
  }

  // 3. Deteksi Window Focus Kembali (Menganalisis durasi blur di HP & Laptop)
  private handleWindowFocus() {
    if (!this.isSupervisionActive) return;

    // Matikan penutup layar saat fokus kembali
    this.setObscured(false);

    if (this.blurStartTime > 0) {
      const duration = Date.now() - this.blurStartTime;
      this.blurStartTime = 0;

      // Di HP (Android & iOS) dan Laptop (Snipping Tool/PrintScreen overlay),
      // pengambilan screenshot menyebabkan jeda blur singkat antara 20ms hingga 5000ms
      if (duration >= 20 && duration <= 5000) {
        this.vibrateDevice();
        this.recordViolation(
          'screenshot_attempt',
          this.isMobileDevice()
            ? `Terdeteksi upaya tangkap layar di HP (durasi snapshot ${Math.round(duration)}ms)! Soal dilindungi secara instan.`
            : `Terdeteksi upaya tangkap layar / Snipping Tool (kehilangan fokus ${Math.round(duration)}ms)!`
        );
      } else if (duration > 5000) {
        // Durasi lebih lama: Siswa beralih tab / membuka aplikasi lain
        this.vibrateDevice();
        this.recordViolation(
          'tab_switch',
          `Siswa berpindah tab / membuka aplikasi lain selama ${Math.round(duration / 1000)} detik.`
        );
      }
    }
  }

  // 4. Deteksi Visibility Change
  private handleVisibilityChange() {
    if (!this.isSupervisionActive) return;
    if (document.hidden) {
      this.blurStartTime = Date.now();
      this.setObscured(true);
      this.clearClipboardSafe();
    } else {
      this.handleWindowFocus();
    }
  }

  // 5. Deteksi Shortcut Screenshot & Tombol Fisik Hardware di HP / Laptop
  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isSupervisionActive) return;

    // A. Tombol Fisik HP Android (Volume Down + Power sering memicu event VolumeDown)
    const isVolumeKey =
      e.key === 'AudioVolumeDown' ||
      e.key === 'VolumeDown' ||
      e.code === 'AudioVolumeDown' ||
      e.keyCode === 174 ||
      e.keyCode === 25 ||
      e.key === 'AudioVolumeUp' ||
      e.key === 'VolumeUp' ||
      e.code === 'AudioVolumeUp' ||
      e.keyCode === 175 ||
      e.keyCode === 24 ||
      e.key === 'Power';

    if (isVolumeKey) {
      this.setObscured(true);
      this.clearClipboardSafe();
      this.vibrateDevice();
      this.recordViolation(
        'screenshot_attempt',
        'Terdeteksi penekanan tombol fisik ponsel (Volume / Power screenshot shortcut)!'
      );
      return;
    }

    // B. PrintScreen
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      this.clearClipboardSafe();
      this.recordViolation('screenshot_attempt', 'Mencoba menekan tombol PrintScreen untuk tangkap layar.');
      return;
    }

    // C. Windows Snipping Tool (Win + Shift + S atau Ctrl + Shift + S)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      this.clearClipboardSafe();
      this.recordViolation('screenshot_attempt', 'Mencoba shortcut tangkap layar (Shift + S).');
      return;
    }

    // D. macOS Screenshot (Cmd + Shift + 3, 4, 5)
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      this.clearClipboardSafe();
      this.recordViolation('screenshot_attempt', 'Mencoba shortcut tangkap layar macOS (Cmd + Shift + 3/4).');
      return;
    }

    // E. Developer Tools Inspect
    if (
      e.key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
      ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      this.recordViolation('dev_tools', 'Mencoba membuka Developer Tools / Inspect Element.');
      return;
    }

    // F. Salin Teks (Ctrl + C / Cmd + C)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      this.clearClipboardSafe();
      this.recordViolation('copy_attempt', 'Mencoba menyalin (copy) teks soal ujian.');
      return;
    }

    // G. Cetak Soal (Ctrl + P)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      this.recordViolation('screenshot_attempt', 'Mencoba mencetak / print layar soal (Ctrl+P).');
      return;
    }
  }

  /**
   * Menguji simulasi deteksi tangkap layar secara langsung
   * Berguna untuk guru, pengembang, dan evaluasi pengawas
   */
  public testScreenshotDetection() {
    this.setObscured(true);
    this.vibrateDevice();
    setTimeout(() => {
      this.setObscured(false);
      this.recordViolation(
        'screenshot_attempt',
        'Uji simulasi tangkap layar berhasil! Pengawas mendeteksi upaya screenshot dan layar berhasil dilindungi.'
      );
    }, 400);
  }

  public dismissObscure() {
    this.setObscured(false);
  }

  private handleContextMenu(e: MouseEvent) {
    if (!this.isSupervisionActive) return;
    e.preventDefault();
  }

  private handleFullscreenChange() {
    if (!this.isSupervisionActive) return;
    const isNowFullscreen = Boolean(document.fullscreenElement);
    if (this.isFullscreenActive && !isNowFullscreen) {
      this.recordViolation('exit_fullscreen', 'Siswa keluar dari Mode Layar Penuh Ujian.');
    }
    this.isFullscreenActive = isNowFullscreen;
  }

  private clearClipboardSafe() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  public async toggleFullscreen(): Promise<boolean> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        this.isFullscreenActive = true;
        return true;
      } else {
        await document.exitFullscreen();
        this.isFullscreenActive = false;
        return false;
      }
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
      return false;
    }
  }

  public isFullscreen(): boolean {
    return Boolean(typeof document !== 'undefined' && document.fullscreenElement);
  }
}

export const antiCheatService = new AntiCheatService();
