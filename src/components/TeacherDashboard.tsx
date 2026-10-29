import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  LogOut,
  HelpCircle,
  Database,
  Info,
  Trash2,
  AlertTriangle,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Save,
  Check,
  BookOpen,
  Sliders,
  Cloud,
  Send,
  Heart,
  MessageSquareHeart,
  MessageCircle,
} from 'lucide-react';
import { gameDb } from '../services/db';
import { cloudDb } from '../services/firebase';
import { antiCheatService, CheatViolationLog } from '../services/antiCheat';
import { StudentProfile, StudentAttemptLog, TeacherEncouragement } from '../types/game';
import { soundManager } from '../utils/audio';
import { UCIEL_AVATAR } from '../data/characters';
import { createSafeImageErrorHandler } from '../utils/assets';

interface TeacherDashboardProps {
  levelUnlocks?: Record<string, boolean>;
  onUpdateLevelUnlocks?: (newUnlocks: Record<string, boolean>) => void;
  onBackToGame: () => void;
  onOpenGuideModal: () => void;
  teacherEmail?: string | null;
  teacherName?: string | null;
  teacherPhoto?: string | null;
  onLogout?: () => void;
}

const MISSION_CONFIGS = [
  {
    id: 'taman-pancasila',
    number: 1,
    name: 'Taman Pancasila',
    subject: 'PPKn',
    color: 'from-red-500 to-rose-600',
    borderColor: 'border-red-500/40',
    bgBadge: 'bg-red-500/20 text-red-300',
    icon: '⭐',
    description: 'Mengenal simbol sila ke-1 sampai ke-5 Pancasila dan perilaku hidup rukun di lingkungan sekolah.',
    topics: ['Simbol Bintang, Rantai, Beringin, Banteng, Padi Kapas', 'Berbagi alat tulis', 'Gotong royong'],
  },
  {
    id: 'perpustakaan-ceria',
    number: 2,
    name: 'Perpustakaan Ceria',
    subject: 'Bahasa Indonesia',
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/40',
    bgBadge: 'bg-blue-500/20 text-blue-300',
    icon: '📖',
    description: 'Mengenal ungkapan ramah, kalimat ajakan (Ayo, Mari), perintah santun (Tolong), dan penolakan sopan (Maaf).',
    topics: ['Kalimat Ajakan berteman', 'Kalimat Perintah sopan', 'Kalimat Penolakan santun'],
  },
  {
    id: 'kantin-pintar',
    number: 3,
    name: 'Kantin Pintar',
    subject: 'Matematika',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40',
    bgBadge: 'bg-emerald-500/20 text-emerald-300',
    icon: '🍎',
    description: 'Penjumlahan dan pengurangan bilangan cacah dalam konteks berbagi makanan sehat dan kantin kejujuran.',
    topics: ['Penjumlahan & Pengurangan', 'Menghitung sisa jajanan sehat', 'Kejujuran membayar & kembalian'],
  },
  {
    id: 'studio-kreatif',
    number: 4,
    name: 'Studio Kreatif',
    subject: 'SBdP',
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/40',
    bgBadge: 'bg-purple-500/20 text-purple-300',
    icon: '🎨',
    description: 'Memahami karya seni rupa imajinatif 2 dimensi dan 3 dimensi serta apresiasi karya tanpa mengejek.',
    topics: ['Karya 2D (panjang & lebar)', 'Karya 3D (bervolume & ruang)', 'Bahan alami (biji & dedaunan)'],
  },
  {
    id: 'lapangan-persahabatan',
    number: 5,
    name: 'Lapangan Persahabatan',
    subject: 'PJOK',
    color: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-500/40',
    bgBadge: 'bg-orange-500/20 text-orange-300',
    icon: '⚽',
    description: 'Mengenali variasi gerak dasar lokomotor (berlari, melompat) serta sportivitas tidak membeda-bedakan kawan.',
    topics: ['Gerak lokomotor berpindah tempat', 'Sportivitas regu & tolong kawan jatuh', 'Pemanasan sebelum olahraga'],
  },
];

const PRESET_MESSAGES = [
  { icon: '⭐', text: 'Hebat sekali! Terus semangat ya, kamu pasti bisa menjadi Sahabat Rukun sejati!' },
  { icon: '💪', text: 'Luar biasa! Sedikit lagi bintang kerukunan akan terkumpul penuh!' },
  { icon: '🏆', text: 'Keren! Fokus dan teliti ya saat menjawab tantangan petualangan!' },
  { icon: '🌟', text: 'Uciel dan Ibu/Bapak Guru sangat bangga dengan kerja keras dan kejujuranmu!' },
  { icon: '🎉', text: 'Tetap semangat, jangan menyerah, dan selalu rukun bersama teman-teman!' },
  { icon: '❤️', text: 'Tarik napas dan baca pelan-pelan ya sahabat juara, kamu pasti bisa!' },
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  levelUnlocks: parentLevelUnlocks,
  onUpdateLevelUnlocks,
  onBackToGame,
  onOpenGuideModal,
  teacherEmail,
  teacherName,
  teacherPhoto,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'levels' | 'students' | 'attempts' | 'anticheat' | 'messages' | 'security' | 'guides'>('overview');
  const [students, setStudents] = useState<StudentProfile[]>(gameDb.getAllStudents());
  const [attemptLogs, setAttemptLogs] = useState<StudentAttemptLog[]>(gameDb.getAttemptLogs());
  const [cheatLogs, setCheatLogs] = useState<CheatViolationLog[]>(() => antiCheatService.getAllViolationLogs());
  const [encouragements, setEncouragements] = useState<TeacherEncouragement[]>(gameDb.getAllEncouragements());
  const [targetStudentId, setTargetStudentId] = useState<string>('all');
  const [customEncouragementText, setCustomEncouragementText] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('⭐');
  const [isSendingMsg, setIsSendingMsg] = useState<boolean>(false);
  const [msgSuccessNotice, setMsgSuccessNotice] = useState<string | null>(null);
  const [isClearMessagesModalOpen, setIsClearMessagesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time synchronization of anti-cheat logs from Firebase Cloud
  useEffect(() => {
    const unsubCheat = cloudDb.subscribeToCheatViolations?.((logs) => {
      setCheatLogs(logs || []);
    });
    const unsubMsg = gameDb.subscribeToEncouragements((msgs) => {
      setEncouragements(msgs || []);
    });
    return () => {
      unsubCheat?.();
      unsubMsg?.();
    };
  }, []);

  // Level unlock settings controlled by Teacher
  const [levelUnlocks, setLevelUnlocks] = useState<Record<string, boolean>>(
    parentLevelUnlocks || gameDb.getLevelUnlockSettings()
  );

  // Synchronize state when parent levelUnlocks changes (with equality check to prevent infinite loops)
  useEffect(() => {
    if (parentLevelUnlocks) {
      setLevelUnlocks((prev) => {
        const isSame =
          Object.keys(parentLevelUnlocks).length === Object.keys(prev).length &&
          Object.keys(parentLevelUnlocks).every((k) => prev[k] === parentLevelUnlocks[k]);
        return isSame ? prev : parentLevelUnlocks;
      });
    }
  }, [parentLevelUnlocks]);

  // Security PIN states
  const [currentPin, setCurrentPin] = useState(gameDb.getTeacherPin());
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete student confirmation state
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);

  // Clear all logs confirmation modal state
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false);

  // Permanent Clear/Reset Cheat Logs Modal states
  const [isResetCheatModalOpen, setIsResetCheatModalOpen] = useState(false);
  const [selectedStudentForCheatReset, setSelectedStudentForCheatReset] = useState<StudentProfile | null>(null);

  // Add student form modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newClassCode, setNewClassCode] = useState('2A-RUKUN');

  // Status filter state for Data Siswa tab: 'all' | 'online' | 'offline'
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Format waktu aktif terakhir secara ramah dan mudah dibaca guru
  const formatLastActive = (dateStr?: string): string => {
    if (!dateStr) return 'Belum pernah aktif';
    try {
      const time = new Date(dateStr).getTime();
      if (isNaN(time)) return 'Baru saja';
      const diff = Math.floor((Date.now() - time) / 1000);
      if (diff < 45) return 'Baru saja';
      if (diff < 60) return `${diff} dtk lalu`;
      if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return 'Baru saja';
    }
  };

  // Cek apakah siswa sedang aktif bermain (berdasarkan flag isOnline & aktivitas/heartbeat dalam 2 menit terakhir)
  const isStudentActiveNow = (s?: StudentProfile | null): boolean => {
    if (!s || typeof s !== 'object') return false;
    if (s.isOnline === false) return false;
    if (!s.lastActive) return false;
    const lastActiveTime = new Date(s.lastActive).getTime();
    if (isNaN(lastActiveTime)) return false;
    const diff = Date.now() - lastActiveTime;
    // Siswa dianggap aktif jika flag online aktif dan detak aktivitas (heartbeat) diterima dalam 2 menit (120.000 ms)
    return Boolean(s.isOnline && diff < 120000);
  };

  // Stats calculation
  const totalStudents = (students || []).filter(Boolean).length;
  const activeStudents = (students || []).filter(isStudentActiveNow).length;
  const offlineStudents = Math.max(0, totalStudents - activeStudents);
  const totalAttempts = attemptLogs.length;
  const correctAttempts = attemptLogs.filter((a) => a.isCorrect).length;
  const classAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;

  // Toggle status kehadiran siswa secara manual oleh Guru (untuk simulasi atau kehadiran riil)
  const handleTogglePresence = (studentId: string) => {
    soundManager.playClick();
    const newStatus = gameDb.toggleStudentOnlineStatus(studentId);
    setStudents(gameDb.getAllStudents());
    setSyncSuccessMsg(newStatus ? 'Status siswa beralih: 🟢 ONLINE' : 'Status siswa beralih: ⚪ OFFLINE');
    soundManager.playSuccess();
    setTimeout(() => setSyncSuccessMsg(null), 2500);
  };

  // Cloud Sync state
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [lockStatusMsg, setLockStatusMsg] = useState<string | null>(null);

  const showLockNotification = (msg: string) => {
    setLockStatusMsg(msg);
    setTimeout(() => {
      setLockStatusMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Automatic Real-time Firestore Updates (Logs & Roster) + Cross-tab & Intra-window Sync
  useEffect(() => {
    // 1. Subscribe to Live Student Attempt Logs
    const unsubLogs = cloudDb.subscribeToAttemptLogs((logs) => {
      setAttemptLogs(logs || []);
    });

    // 2. Subscribe to Live Student Roster & Presence from Firestore Cloud
    const unsubStudents = cloudDb.subscribeToStudents((cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    });

    // 3. Multi-tab synchronization (StorageEvent fires across different browser tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'msr_students_list' || e.key === 'msr_current_student') {
        setStudents(gameDb.getAllStudents());
      }
      if (e.key === 'msr_attempt_logs') {
        setAttemptLogs(gameDb.getAttemptLogs());
      }
      if (e.key === 'msr_cheat_logs' || e.key === 'msr_anti_cheat_logs') {
        setCheatLogs(antiCheatService.getAllViolationLogs());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Same-tab custom event for instantaneous UI updates
    const handlePresenceEvent = () => {
      setStudents(gameDb.getAllStudents());
    };
    window.addEventListener('msr_presence_updated', handlePresenceEvent);

    // 5. Periodic tick every 5 seconds to re-evaluate active statuses & relative time displays
    const tickTimer = setInterval(() => {
      setStudents(gameDb.getAllStudents());
    }, 5000);

    return () => {
      unsubLogs();
      unsubStudents();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('msr_presence_updated', handlePresenceEvent);
      clearInterval(tickTimer);
    };
  }, []);

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    soundManager.playClick();
    const ok = await gameDb.syncFromCloud();
    if (ok) {
      setStudents(gameDb.getAllStudents());
      const freshUnlocks = gameDb.getLevelUnlockSettings();
      setLevelUnlocks(freshUnlocks);
      onUpdateLevelUnlocks?.(freshUnlocks);
      setAttemptLogs(gameDb.getAttemptLogs());
      setSyncSuccessMsg('Tersinkron!');
      soundManager.playSuccess();
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }
    setIsSyncingCloud(false);
  };

  const handleDownloadCSV = () => {
    soundManager.playClick();
    const csvContent = gameDb.exportLogsAsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Misi_Sahabat_Rukun_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCheatCSV = () => {
    soundManager.playClick();
    if (cheatLogs.length === 0) return;
    const headers = ['ID Pelanggaran', 'ID Siswa', 'Nama Siswa', 'Kelas', 'Misi', 'Jenis Pelanggaran', 'Detail', 'Waktu'];
    const rows = cheatLogs.map((log) => [
      log.id,
      log.studentId,
      `"${log.studentName}"`,
      log.classCode,
      log.levelId,
      log.violationType,
      `"${log.details.replace(/"/g, '""')}"`,
      new Date(log.timestamp).toLocaleString('id-ID'),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Kejujuran_Ujian_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearCheatLogs = (student?: StudentProfile) => {
    soundManager.playClick();
    setSelectedStudentForCheatReset(student || null);
    setIsResetCheatModalOpen(true);
  };

  const handleConfirmClearCheatLogs = async () => {
    soundManager.playClick();
    try {
      if (selectedStudentForCheatReset) {
        await antiCheatService.clearStudentViolations(selectedStudentForCheatReset.id);
        setCheatLogs((prev) => prev.filter((c) => c.studentId !== selectedStudentForCheatReset.id));
        setSyncSuccessMsg(`Catatan integritas ${selectedStudentForCheatReset.displayName} berhasil direset permanen!`);
        setSelectedStudentForCheatReset(null);
      } else {
        await antiCheatService.clearAllViolationLogs();
        setCheatLogs([]);
        setSyncSuccessMsg('Semua catatan kecurangan & bar pengawas berhasil dihapus permanen!');
      }
      soundManager.playSuccess();
      setIsResetCheatModalOpen(false);
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    } catch (e) {
      console.warn('Gagal menghapus log kecurangan:', e);
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    soundManager.playSuccess();
    const studentCode = `K2-${String(students.length + 1).padStart(2, '0')}`;
    const created = gameDb.addStudent({
      displayName: newStudentName.trim(),
      nickname: newNickname.trim() || newStudentName.trim().split(' ')[0],
      studentCode,
      classCode: newClassCode.trim() || '2A-RUKUN',
      avatarStyle: 'boy-1',
    });

    setStudents([created, ...students]);
    setNewStudentName('');
    setNewNickname('');
    setIsAddModalOpen(false);
  };

  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    soundManager.playClick();
    gameDb.deleteStudent(studentToDelete.id);
    const updated = gameDb.getAllStudents();
    setStudents(updated);
    setStudentToDelete(null);
  };

  const handleClearAllLogs = () => {
    soundManager.playClick();
    gameDb.clearAttemptLogs();
    setAttemptLogs([]);
    setIsClearLogsModalOpen(false);
  };

  const handleSendEncouragement = async (presetText?: string, presetIcon?: string) => {
    const textToSend = (presetText || customEncouragementText).trim();
    if (!textToSend) return;

    setIsSendingMsg(true);
    soundManager.playClick();

    let targetName = 'Semua Siswa Online';
    if (targetStudentId !== 'all') {
      const target = students.find((s) => s.id === targetStudentId);
      if (target) {
        targetName = target.displayName;
      }
    }

    const iconToSend = presetIcon || selectedEmoji;
    const sender = teacherName || (teacherEmail ? teacherEmail.split('@')[0] : 'Ibu/Bapak Guru');

    try {
      await gameDb.sendEncouragement(
        targetStudentId,
        targetName,
        textToSend,
        iconToSend,
        sender
      );
      if (!presetText) {
        setCustomEncouragementText('');
      }
      soundManager.playCelebration();
      setMsgSuccessNotice(`Pesan berhasil dikirim ke ${targetName}!`);
      setTimeout(() => setMsgSuccessNotice(null), 3500);
    } catch (err) {
      console.warn('Gagal kirim pesan:', err);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleDeleteEncouragement = async (id: string) => {
    soundManager.playClick();
    await gameDb.deleteEncouragement(id);
  };

  const handleClearAllEncouragements = async () => {
    soundManager.playClick();
    await gameDb.clearAllEncouragements();
    setIsClearMessagesModalOpen(false);
  };

  const handleResetDefaultStudents = () => {
    soundManager.playSuccess();
    const defaults = gameDb.resetDefaultStudents();
    setStudents(defaults);
  };

  // Toggle single level lock
  const handleToggleLevel = (levelId: string) => {
    soundManager.playClick();
    const currentVal = Boolean(levelUnlocks[levelId]);
    const newVal = !currentVal;
    const missionName = MISSION_CONFIGS.find((m) => m.id === levelId)?.name || 'Misi';

    // 1. Pembaruan instan pada tampilan (Optimistic UI) & prop induk
    const updated = { ...levelUnlocks, [levelId]: newVal };
    setLevelUnlocks(updated);
    onUpdateLevelUnlocks?.(updated);

    // 2. Simpan lokal & kirim ke Firebase Cloud
    gameDb.setLevelUnlock(levelId, newVal);

    // 3. Tampilkan notifikasi konfirmasi yang sangat jelas
    showLockNotification(
      `${missionName}: Status berhasil diubah menjadi ${newVal ? '🟢 DIBUKA (Siswa dapat masuk)' : '🔒 DIKUNCI (Siswa tidak dapat masuk)'}`
    );
  };

  // Unlock all levels (Panggilan batch tunggal tanpa 5x request terpisah)
  const handleUnlockAll = () => {
    soundManager.playSuccess();
    const allUnlocked: Record<string, boolean> = {};
    MISSION_CONFIGS.forEach((m) => {
      allUnlocked[m.id] = true;
    });
    setLevelUnlocks(allUnlocked);
    onUpdateLevelUnlocks?.(allUnlocked);
    gameDb.setLevelUnlockSettings(allUnlocked);
    showLockNotification('Semua 5 misi petualangan berhasil DIBUKA untuk seluruh siswa!');
  };

  // Lock all levels except Level 1
  const handleLockAllExceptLevel1 = () => {
    soundManager.playClick();
    const lockedExceptLvl1: Record<string, boolean> = {};
    MISSION_CONFIGS.forEach((m) => {
      lockedExceptLvl1[m.id] = m.id === 'taman-pancasila';
    });
    setLevelUnlocks(lockedExceptLvl1);
    onUpdateLevelUnlocks?.(lockedExceptLvl1);
    gameDb.setLevelUnlockSettings(lockedExceptLvl1);
    showLockNotification('Misi Level 2–5 DIKUNCI. Hanya Misi 1 (Taman Pancasila) yang terbuka.');
  };

  // Change PIN handler
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeMsg({ type: 'error', text: 'PIN harus terdiri dari minimal 4 angka / karakter!' });
      return;
    }
    gameDb.setTeacherPin(newPinInput.trim());
    setCurrentPin(newPinInput.trim());
    setNewPinInput('');
    setPinChangeMsg({
      type: 'success',
      text: 'PIN Guru berhasil diperbarui & disinkronkan ke Cloud Firestore! PIN 1234 kini otomatis ditolak.',
    });
    soundManager.playSuccess();
  };

  // Teacher Google Emails Management
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(gameDb.getAuthorizedTeacherEmails());
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setEmailMsg({ type: 'error', text: 'Format email tidak valid!' });
      return;
    }
    if (authorizedEmails.includes(email)) {
      setEmailMsg({ type: 'error', text: 'Email ini sudah terdaftar!' });
      return;
    }
    gameDb.addAuthorizedTeacherEmail(email);
    setAuthorizedEmails(gameDb.getAuthorizedTeacherEmails());
    setNewEmailInput('');
    setEmailMsg({ type: 'success', text: `Email ${email} berhasil diizinkan sebagai Guru.` });
    soundManager.playSuccess();
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (authorizedEmails.length <= 1) {
      setEmailMsg({ type: 'error', text: 'Harus ada minimal satu email Guru terdaftar!' });
      return;
    }
    soundManager.playClick();
    gameDb.removeAuthorizedTeacherEmail(emailToRemove);
    setAuthorizedEmails(gameDb.getAuthorizedTeacherEmails());
    setEmailMsg({ type: 'success', text: `Email ${emailToRemove} telah dihapus.` });
  };

  const filteredStudents = (students || []).filter((s) => {
    if (!s) return false;
    const isOnline = isStudentActiveNow(s);
    if (statusFilter === 'online' && !isOnline) return false;
    if (statusFilter === 'offline' && isOnline) return false;

    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    const name = String(s.displayName || '').toLowerCase();
    const code = String(s.studentCode || '').toLowerCase();
    const nick = String(s.nickname || '').toLowerCase();
    const cls = String(s.classCode || '').toLowerCase();
    return name.includes(q) || code.includes(q) || nick.includes(q) || cls.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Teacher Top Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 flex items-center justify-center font-black text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  Dashboard Guru: MISI SAHABAT RUKUN • SD INDONESIA EMAS
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Kelas 2 SD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kendali Buka/Kunci 5 Petualangan, Pemantauan Siswa, & Sistem Keamanan Guru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Real-Time</span>
            </div>

            <button
              type="button"
              onClick={handleManualCloudSync}
              disabled={isSyncingCloud}
              title="Sinkronkan data dengan Firebase Firestore Cloud"
              className="px-3 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-sky-300' : 'text-sky-400'}`} />
              <span>{isSyncingCloud ? 'Menyinkronkan...' : (syncSuccessMsg || 'Sinkron Cloud')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border border-slate-600 shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>

            {teacherEmail && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">
                {teacherPhoto ? (
                  <img src={teacherPhoto} alt={teacherName || 'Guru'} className="w-5 h-5 rounded-full border border-amber-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    G
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <div className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px]">{teacherName || 'Guru'}</div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">{teacherEmail}</div>
                </div>
              </div>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar dari akun Google"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 hover:border-rose-500/40"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar Akun</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToGame}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
            >
              <span>Kembali ke Game</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-800/60 border-b border-slate-700 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            📊 Ringkasan Kelas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'levels'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            🔓 Kendali Buka/Kunci Misi (5 Lokasi)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            👥 Data Siswa ({students.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attempts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'attempts'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            📝 Log Jawaban Siswa
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anticheat')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'anticheat'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {cheatLogs.length > 0 ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>Pengawas & Integritas</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                cheatLogs.length > 0
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {cheatLogs.length > 0 ? `${cheatLogs.length} Insiden` : '0 Bersih'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4 text-rose-400" />
            <span>Pesan Penyemangat Live</span>
            {encouragements.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {encouragements.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            ⚙️ Pengaturan & Cloud
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'guides'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            🐣 Pemandu Karakter Uciel
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="text-xs font-bold text-slate-400">Total Siswa Terdaftar</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalStudents} Siswa</div>
                <div className="text-[11px] text-amber-400 mt-1 font-semibold">Kelas 2 SD Indonesia Emas</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-emerald-500/40 shadow-md">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Siswa Online</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {activeStudents} Online
                </div>
                <div className="text-[11px] text-emerald-300 mt-1 font-semibold">Sedang Aktif / Bermain</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Siswa Offline</span>
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-1">
                  {offlineStudents} Offline
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-semibold">Belum Masuk / Istirahat</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                <div className="text-xs font-bold text-slate-400">Rata-rata Ketuntasan</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{classAccuracy}%</div>
                <div className="text-[11px] text-amber-300/80 mt-1 font-semibold">Target Kurikulum: ≥75%</div>
              </div>
            </div>

            {/* Radar Kehadiran & Aktivitas Siswa Saat Ini (Real-Time) */}
            <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Radar Status Kehadiran Siswa Real-Time
                    </h3>
                    <p className="text-xs text-slate-300">
                      Membedakan siswa yang sedang aktif bermain ({activeStudents}) dan yang sedang offline ({offlineStudents}).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                    🟢 {activeStudents} Siswa Online
                  </span>
                  <span className="text-[11px] text-slate-300 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                    ⚪ {offlineStudents} Siswa Offline
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Bagian Siswa Online */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      SEDANG ONLINE & BERMAIN ({activeStudents} SISWA)
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Sinkron otomatis tiap 20 detik</span>
                  </div>

                  {students.filter(isStudentActiveNow).length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-center text-slate-400 text-xs">
                      Saat ini belum ada siswa yang sedang online. Siswa yang membuka web akan otomatis muncul di sini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {students.filter(isStudentActiveNow).map((std) => (
                        <div
                          key={std.id}
                          className="p-3.5 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-between gap-2.5 shadow-sm hover:border-emerald-400 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-sm flex-shrink-0">
                              {std.nickname ? std.nickname[0] : 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                                <span>{std.displayName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold">
                                  {std.classCode}
                                </span>
                              </div>
                              <div className="text-[11px] text-emerald-400 font-bold truncate mt-0.5">
                                {std.currentActivity || 'Sedang Bermain'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Aktif: {formatLastActive(std.lastActive)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTogglePresence(std.id)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                            title="Tandai Offline"
                          >
                            Set Offline
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Bagian Siswa Offline */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      SEDANG OFFLINE / BELUM MASUK ({offlineStudents} SISWA)
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">Siswa yang tidak membuka game</span>
                  </div>

                  {students.filter((s) => !isStudentActiveNow(s)).length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-center text-emerald-400 text-xs font-bold">
                      Semua siswa terdaftar sedang hadir dan bermain online!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {students.filter((s) => !isStudentActiveNow(s)).map((std) => (
                        <div
                          key={std.id}
                          className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-between gap-2.5 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                              {std.nickname ? std.nickname[0] : 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-300 truncate flex items-center gap-1">
                                <span>{std.displayName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({std.classCode})</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Terakhir: {formatLastActive(std.lastActive)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTogglePresence(std.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold border border-emerald-500/30 transition-colors whitespace-nowrap cursor-pointer"
                            title="Tandai siswa ini sedang Online"
                          >
                            Set Online
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Level Status & Unlock Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-400" />
                    <span>Kendali Cepat: Status Buka / Kunci 5 Misi Petualangan</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Guru bebas membuka atau mengunci materi manapun sesuai jadwal pelajaran tematik hari ini.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleUnlockAll}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Semua (5/5)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLockAllExceptLevel1}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-600"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kunci Level 2-5</span>
                  </button>
                </div>
              </div>

              {/* Status Update Banner */}
              {lockStatusMsg && (
                <div className="p-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{lockStatusMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                {MISSION_CONFIGS.map((m) => {
                  const isUnlocked = Boolean(levelUnlocks[m.id]);
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl bg-slate-900 border transition-all ${
                        isUnlocked ? 'border-emerald-500/50 bg-slate-900/90' : 'border-slate-700 bg-slate-900/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{m.icon}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isUnlocked
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isUnlocked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          <span>{isUnlocked ? 'TERBUKA' : 'TERKUNCI'}</span>
                        </span>
                      </div>
                      <div className="mt-2 font-black text-xs text-white truncate">{m.name}</div>
                      <div className="text-[11px] text-amber-400 font-bold">{m.subject}</div>

                      <button
                        type="button"
                        onClick={() => handleToggleLevel(m.id)}
                        title={isUnlocked ? `Klik untuk mengunci ${m.name}` : `Klik untuk membuka ${m.name}`}
                        className={`w-full mt-3 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                          isUnlocked
                            ? 'bg-rose-600/90 hover:bg-rose-600 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Kunci Misi</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Buka Misi</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mascot & Security Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mascot Spotlight */}
              <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 bg-amber-100 shadow-md">
                  <img
                    src={UCIEL_AVATAR}
                    alt="Uciel si Garuda Cilik"
                    referrerPolicy="no-referrer"
                    onError={createSafeImageErrorHandler('uciel')}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      Pemandu Utama
                    </span>
                    <span className="text-xs text-slate-400 font-bold">Semua 5 Petualangan</span>
                  </div>
                  <h3 className="text-base font-black text-white">Uciel si Burung Garuda Cilik</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Menemani siswa di seluruh zona dengan suara TTS, animasi emosi, petunjuk ramah, dan apresiasi bintang kerukunan.
                  </p>
                </div>
              </div>

              {/* Security Protection Spotlight */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-800 to-slate-800 border border-emerald-500/30 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Akses Langsung Dashboard Guru</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-300 bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    🟢 Bebas Sandi
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dashboard Guru kini dapat diakses langsung dengan sekali klik tombol Guru tanpa perlu memasukkan PIN atau kata sandi. Pengaturan kunci misi dan nilai siswa tetap tersimpan rapi di Cloud Firestore.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Buka Tab Pengaturan & Cloud →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEVELS CONTROL */}
        {activeTab === 'levels' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-emerald-400" />
                  <span>Kendali Penuh Kunci Misi (5 Lokasi Pembelajaran)</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Sebagai guru, Anda memiliki hak penuh membuka level manapun secara bebas untuk siswa tanpa harus menyelesaikan level sebelumnya jika diperlukan dalam pembelajaran.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <button
                  type="button"
                  onClick={handleUnlockAll}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Buka Semua Level (1–5)</span>
                </button>
                <button
                  type="button"
                  onClick={handleLockAllExceptLevel1}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-600 transition-all"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Kunci Kembali (Hanya Level 1)</span>
                </button>
              </div>
            </div>

            {/* Status Update Banner */}
            {lockStatusMsg && (
              <div className="p-3 px-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-black flex items-center gap-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                <span>{lockStatusMsg}</span>
              </div>
            )}

            {/* 5 Missions Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MISSION_CONFIGS.map((m) => {
                const isUnlocked = Boolean(levelUnlocks[m.id]);
                return (
                  <div
                    key={m.id}
                    className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                      isUnlocked
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-emerald-950/20'
                        : 'bg-slate-900/90 border-slate-700 opacity-90'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <span className="text-[11px] font-bold text-amber-400 block">
                              Misi {m.number} • {m.subject}
                            </span>
                            <h3 className="text-base font-black text-white">{m.name}</h3>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                            isUnlocked
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{isUnlocked ? 'TERBUKA UNTUK SISWA' : 'TERKUNCI DARI SISWA'}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>

                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 block">Topik Pembelajaran:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.topics.map((top, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                            >
                              • {top}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => handleToggleLevel(m.id)}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                          isUnlocked
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Kunci Petualangan Ini (Tutup Akses Siswa)</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            <span>Buka Petualangan Ini (Izinkan Siswa Masuk)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau kode siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Filter Buttons: Semua | 🟢 Online | ⚪ Offline */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Semua ({totalStudents})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('online')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'online'
                      ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-sm'
                      : 'bg-slate-900 text-emerald-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>🟢 Online ({activeStudents})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('offline')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'offline'
                      ? 'bg-slate-300 text-slate-950 font-black border-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>⚪ Offline ({offlineStudents})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleResetDefaultStudents}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-600 cursor-pointer"
                  title="Kembalikan data siswa contoh"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset Sampel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Kode Siswa</th>
                      <th className="px-4 py-3">Nama Lengkap</th>
                      <th className="px-4 py-3">Status & Aktivitas Siswa</th>
                      <th className="px-4 py-3">Kelas</th>
                      <th className="px-4 py-3">Progres Misi</th>
                      <th className="px-4 py-3">Integritas Siswa</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          {statusFilter === 'online'
                            ? 'Tidak ada siswa yang sedang online saat ini.'
                            : statusFilter === 'offline'
                            ? 'Semua siswa sedang online!'
                            : 'Tidak ada data siswa ditemukan.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std) => {
                        const progress = gameDb.getLevelProgress(std.id);
                        const starsTotal = Object.values(progress).reduce((acc, curr) => acc + (curr.starsEarned || 0), 0);
                        const studentViolations = cheatLogs.filter((c) => c.studentId === std.id).length;
                        const isLive = isStudentActiveNow(std);

                        return (
                          <tr key={std.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="px-4 py-3 font-mono font-black text-amber-400 whitespace-nowrap">{std.studentCode}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-white leading-tight">{std.displayName}</div>
                              <div className="text-[11px] text-slate-400">Panggilan: {std.nickname}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isLive ? (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 w-fit">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
                                    ONLINE • SEDANG BERMAIN
                                  </span>
                                  <span className="text-xs font-bold text-white truncate max-w-[220px]" title={std.currentActivity}>
                                    {std.currentActivity || 'Sedang Bermain'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Aktif: <strong className="text-emerald-400">{formatLastActive(std.lastActive)}</strong>
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 w-fit">
                                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                                    OFFLINE
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    Terakhir: {formatLastActive(std.lastActive)}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[11px] font-bold border border-slate-700">
                                {std.classCode}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 whitespace-nowrap">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                <span>{starsTotal} / 15 ⭐</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {studentViolations === 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Bersih
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {studentViolations}x Catatan
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleClearCheatLogs(std)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black transition-all cursor-pointer shadow-xs active:scale-95"
                                    title="Hapus permanen catatan pelanggaran siswa ini dan kembalikan ke 100% Bersih"
                                  >
                                    Reset
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePresence(std.id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap cursor-pointer active:scale-95 ${
                                    isLive
                                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                      : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                                  }`}
                                  title={isLive ? 'Alihkan siswa ke status Offline' : 'Tandai siswa ini sedang Online'}
                                >
                                  {isLive ? 'Set Offline' : 'Set Online'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentToDelete(std)}
                                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTEMPT LOGS */}
        {activeTab === 'attempts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">Log Aktivitas & Riwayat Jawaban Soal</h3>
                <p className="text-xs text-slate-400">
                  Data jawaban tersimpan secara instan saat siswa memilih pilihan di setiap misi petualangan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {attemptLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsClearLogsModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Hapus Semua Riwayat Jawaban"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Log</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">Zona Misi</th>
                      <th className="px-4 py-3">Pertanyaan</th>
                      <th className="px-4 py-3">Jawaban Dipilih</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {attemptLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          Belum ada log jawaban tersimpan. Siswa yang bermain akan otomatis tercatat di sini.
                        </td>
                      </tr>
                    ) : (
                      attemptLogs.slice(0, 50).map((log) => (
                        <tr key={log.id} className="hover:bg-slate-700/40 transition-colors">
                          <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{log.studentName}</td>
                          <td className="px-4 py-3 text-amber-400 text-xs font-semibold whitespace-nowrap">
                            {log.levelId}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-xs truncate text-slate-300" title={log.questionText}>
                            {log.questionText}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-xs truncate text-slate-200" title={log.selectedAnswer}>
                            {log.selectedAnswer}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {log.isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs">
                                <XCircle className="w-3.5 h-3.5" /> Perlu Latihan
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PENGAWAS UJIAN & ANTI-KECURANGAN */}
        {activeTab === 'anticheat' && (
          <div className="space-y-6">
            {/* Header section with Stats & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-white">
                    Pengawas Ujian & Integritas Siswa
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sistem pengawas otomatis mendeteksi pindah tab, tangkap layar (screenshot), dan salin teks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {cheatLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleClearCheatLogs()}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Hapus Permanen Semua Log ({cheatLogs.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadCheatCSV}
                  disabled={cheatLogs.length === 0}
                  className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                    cheatLogs.length > 0
                      ? 'bg-amber-600 hover:bg-amber-500 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV Integritas</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Total Insiden
                </span>
                <div className="text-2xl font-black text-amber-400 flex items-center justify-between">
                  <span>{cheatLogs.length}</span>
                  <ShieldAlert className="w-6 h-6 text-amber-500/50" />
                </div>
                <p className="text-[11px] text-slate-400">Peringatan tercatat selama sesi</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Siswa Bersih 100%
                </span>
                <div className="text-2xl font-black text-emerald-400 flex items-center justify-between">
                  <span>
                    {students.filter((s) => cheatLogs.filter((c) => c.studentId === s.id).length === 0).length} / {students.length}
                  </span>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
                </div>
                <p className="text-[11px] text-slate-400">Siswa tanpa catatan pelanggaran</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Proteksi Screenshot
                </span>
                <div className="text-sm font-black text-white flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AKTIF & DIBLOKIR
                  </span>
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">PrintScreen, Snipping Tool, & Cmd+Shift dicegah</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Watermark Nama Siswa
                </span>
                <div className="text-sm font-black text-white flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    TERPASANG
                  </span>
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-400">Mencegah foto eksternal dengan kamera HP</p>
              </div>
            </div>

            {/* Incident Log Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-md">
              <div className="p-4 bg-slate-900/60 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Daftar Riwayat Pelanggaran & Peringatan Kejujuran</span>
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  Menampilkan {cheatLogs.length} kejadian
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">Kelas</th>
                      <th className="px-4 py-3">Zona Misi</th>
                      <th className="px-4 py-3">Jenis Peringatan</th>
                      <th className="px-4 py-3">Detail Kejadian</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {cheatLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <span className="text-3xl">⭐</span>
                            <span className="font-extrabold text-white text-sm">
                              Alhamdulillah! Belum Ada Pelanggaran Terdeteksi
                            </span>
                            <span className="text-xs text-slate-400 max-w-sm">
                              Seluruh siswa SD INDONESIA EMAS mengikuti kuis dengan jujur dan mandiri di dalam jendela ujian.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      cheatLogs.map((log) => {
                        let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                        let typeLabel = 'Pindah Tab / Keluar Layar';

                        if (log.violationType === 'screenshot_attempt') {
                          badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                          typeLabel = '📸 Tangkap Layar (Screenshot)';
                        } else if (log.violationType === 'copy_attempt') {
                          badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                          typeLabel = '📋 Salin Teks Soal';
                        } else if (log.violationType === 'dev_tools') {
                          badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';
                          typeLabel = '🛠️ Developer Tools / Inspect';
                        } else if (log.violationType === 'exit_fullscreen') {
                          badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                          typeLabel = '🖥️ Keluar Layar Penuh';
                        }

                        return (
                          <tr key={log.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                              {log.studentName}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                              {log.classCode}
                            </td>
                            <td className="px-4 py-3 text-amber-300 text-xs font-semibold whitespace-nowrap">
                              {log.levelId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-lg border text-[11px] font-black inline-flex items-center gap-1 ${badgeColor}`}
                              >
                                {typeLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300 max-w-sm truncate" title={log.details}>
                              {log.details}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  const studentObj = students.find((s) => s.id === log.studentId) || ({
                                    id: log.studentId,
                                    displayName: log.studentName,
                                    studentCode: log.classCode,
                                  } as any);
                                  handleClearCheatLogs(studentObj);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-black border border-rose-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
                                title="Reset catatan pelanggaran siswa ini"
                              >
                                Reset Siswa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LIVE TEACHER ENCOURAGEMENT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6 max-w-5xl">
            {/* Header Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <MessageSquareHeart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-white">
                        Pesan Penyemangat Live (Real-Time)
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Tersinkronisasi Otomatis
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Kirimkan motivasi, pujian, dan dorongan semangat belajar langsung ke layar siswa yang sedang bermain.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-bold">
                    Siswa Online:{' '}
                    <span className="text-emerald-400 font-black">
                      {students.filter(isStudentActiveNow).length}
                    </span>
                  </div>
                </div>
              </div>

              {msgSuccessNotice && (
                <div className="mt-4 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{msgSuccessNotice}</span>
                </div>
              )}
            </div>

            {/* Quick Composer Form */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-5">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Kirim Pesan Penyemangat Baru</span>
              </h3>

              {/* 1. Recipient Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  1. Pilih Penerima Pesan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStudentId('all')}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      targetStudentId === 'all'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-black shadow-md'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">📢</span>
                      <div className="truncate">
                        <div className="text-xs font-black">Semua Siswa Online</div>
                        <div className="text-[10px] text-slate-400">Kirim serentak ke semua yang aktif</div>
                      </div>
                    </div>
                    {targetStudentId === 'all' && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </button>

                  {students
                    .filter(isStudentActiveNow)
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTargetStudentId(s.id)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                          targetStudentId === s.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-white font-black shadow-md'
                            : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-black truncate">{s.displayName}</div>
                            <div className="text-[10px] text-emerald-400 truncate">
                              {s.currentActivity || 'Online'}
                            </div>
                          </div>
                        </div>
                        {targetStudentId === s.id && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* 2. Quick Preset Templates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    2. Pilihan Cepat Kalimat Motivasi (Klik untuk Langsung Kirim):
                  </label>
                  <span className="text-[11px] text-slate-400">Disukai anak kelas 2 SD</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PRESET_MESSAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSendingMsg}
                      onClick={() => handleSendEncouragement(preset.text, preset.icon)}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 hover:bg-slate-900 transition-all text-left flex items-start gap-2.5 group cursor-pointer disabled:opacity-50"
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform shrink-0">
                        {preset.icon}
                      </span>
                      <div className="text-xs text-slate-200 group-hover:text-amber-200 leading-snug">
                        {preset.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Custom Message Textarea */}
              <div className="pt-2 border-t border-slate-700/60 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  3. Atau Tulis Pesan Khusus Sendiri:
                </label>

                {/* Emoji Selection */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Ikon:</span>
                  {['⭐', '💪', '🏆', '🌟', '🎉', '❤️', '🐥', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-amber-500/30 border-2 border-amber-400 scale-110'
                          : 'bg-slate-900 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={280}
                    value={customEncouragementText}
                    onChange={(e) => setCustomEncouragementText(e.target.value)}
                    placeholder="Contoh: Hebat sekali Faiz! Terus konsentrasi dan raih 3 bintang kerukunan ya! ✨"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
                  />
                  <div className="text-[10px] text-slate-500 text-right mt-1">
                    {customEncouragementText.length} / 280 karakter
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <p className="text-[11px] text-slate-400">
                    💡 Pesan akan muncul sebagai popup animasi di layar siswa dan dapat dibacakan otomatis oleh Uciel.
                  </p>
                  <button
                    type="button"
                    disabled={isSendingMsg || !customEncouragementText.trim()}
                    onClick={() => handleSendEncouragement()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className={`w-4 h-4 ${isSendingMsg ? 'animate-spin' : ''}`} />
                    <span>{isSendingMsg ? 'Mengirim...' : 'Kirim Pesan Sekarang'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Riwayat Pesan Terkirim */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <MessageSquareHeart className="w-4 h-4 text-rose-400" />
                    <span>Riwayat Pesan Terkirim ({encouragements.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Daftar pesan motivasi yang telah dikirim ke siswa</p>
                </div>

                {encouragements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsClearMessagesModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bersihkan Riwayat</span>
                  </button>
                )}
              </div>

              {encouragements.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-700 text-center text-slate-400 text-xs space-y-2">
                  <div className="text-2xl">💌</div>
                  <p className="font-bold text-slate-300">Belum ada pesan penyemangat yang dikirim.</p>
                  <p className="text-slate-400">
                    Pilih salah satu tombol kalimat motivasi di atas untuk mulai menyemangati siswa yang sedang online!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {encouragements.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl shrink-0 mt-0.5">{msg.icon || '⭐'}</span>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-amber-300">
                              {msg.targetStudentName}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Oleh: {msg.senderName}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-200 leading-relaxed">
                            "{msg.text}"
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEncouragement(msg.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                        title="Hapus pesan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: ACCESS & CLOUD SETTINGS */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Autentikasi Google Guru & Pengaturan Cloud
                  </h2>
                  <p className="text-xs text-slate-300">
                    Dashboard Guru dilindungi oleh autentikasi akun Google (Firebase Auth) tanpa perlu mengingat PIN/sandi.
                  </p>
                </div>
              </div>

              {/* Google Auth Status Box */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1.5 flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Status Login Google:</span>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Terverifikasi (Firebase Auth)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Akun aktif: <strong className="text-amber-300 font-mono">{teacherEmail || 'ahmadzikri1420@gmail.com'}</strong>. Siswa tidak dapat masuk ke dashboard ini tanpa login Google guru resmi.
                  </p>
                </div>
              </div>
              {/* Google Teacher Email Whitelist Manager */}
              <div className="pt-4 border-t border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-emerald-400">🛡️</span> Email Google Guru yang Diizinkan (Whitelist)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Akun Google Guru yang diakui untuk sinkronisasi data Cloud Firestore.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {authorizedEmails.map((email) => (
                      <div
                        key={email}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300"
                      >
                        <span>{email}</span>
                        {authorizedEmails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            title="Hapus izin email ini"
                            className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddEmail} className="flex gap-2 pt-1 max-w-lg">
                    <input
                      type="email"
                      placeholder="Tambah email guru baru, misal: bu.guru@sekolah.sch.id"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Guru</span>
                    </button>
                  </form>

                  {emailMsg && (
                    <div
                      className={`text-xs font-bold p-2.5 rounded-xl flex items-center gap-1.5 max-w-lg ${
                        emailMsg.type === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      <span>{emailMsg.text}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step-by-Step Free Firebase Configuration & Security Guide */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-emerald-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Panduan Konfigurasi Database Online (100% Gratis - Tanpa Kartu Kredit)
                    </h3>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      Mode Paket Spark Firebase: Kuota Gratis Permanen untuk Sekolah Dasar
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Firebase Firestore Terintegrasi
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>💡</span> Status Integrasi Saat Ini:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    <li>
                      <strong>Cloud Firestore:</strong> Database online telah siap digunakan untuk menyimpan data profil siswa, kode kelas, nilai, dan log jawaban secara langsung di cloud.
                    </li>
                    <li>
                      <strong>Real-Time Sync:</strong> Setiap kali siswa menjawab pertanyaan atau menyelesaikan petualangan, dashboard guru ini menerima data otomatis dalam hitungan detik.
                    </li>
                    <li>
                      <strong>Bebas Biaya (Spark Plan):</strong> Anda <u>tidak perlu mengaktifkan penagihan berbayar (Blaze)</u> dan <u>tidak perlu memasukkan kartu kredit</u>. Kuota gratis harian mencakup 50.000 bacaan dan 20.000 tulisan per hari.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                    <span className="font-bold text-sky-400 block">Langkah 1: Siswa Bermain</span>
                    <p className="text-[11px] text-slate-400">
                      Siswa cukup memilih nama mereka dari daftar atau memasukkan kode kelas (<code className="text-amber-300">2A-RUKUN</code>). Tidak butuh akun Google untuk siswa.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                    <span className="font-bold text-sky-400 block">Langkah 2: Guru Mengontrol</span>
                    <p className="text-[11px] text-slate-400">
                      Guru dapat login dengan <strong>Akun Google</strong> atau cukup dengan <strong>PIN Guru</strong>. Guru bebas mengunci atau membuka kelima petualangan.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                    <span className="font-bold text-sky-400 block">Langkah 3: Pantau & Ekspor</span>
                    <p className="text-[11px] text-slate-400">
                      Nilai, akurasi, dan riwayat waktu pengerjaan terekam rapi. Guru dapat mengunduh laporan nilai kapan saja lewat tombol <strong>Ekspor CSV</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GUIDES INFO & CURRICULUM */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 bg-amber-100 shadow-md">
                  <img
                    src={UCIEL_AVATAR}
                    alt="Uciel si Garuda Cilik"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Pemandu Tunggal: Uciel si Burung Garuda Cilik 🐣
                  </h3>
                  <p className="text-xs text-slate-300">
                    Karakter ramah anak kelas 2 SD yang memandu seluruh 5 petualangan tematik dengan suara, animasi, dan keceriaan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenGuideModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md flex-shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>Dokumentasi Koding Karakter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MISSION_CONFIGS.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                      {m.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">{m.name}</h4>
                      <span className="text-xs text-amber-400 font-bold">{m.subject}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>
                  <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Pemandu: Uciel</span>
                    <span className={`font-bold ${levelUnlocks[m.id] ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {levelUnlocks[m.id] ? '🟢 Terbuka' : '🔒 Terkunci'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Tambah Siswa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 border-2 border-amber-500/50 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-black text-white">Tambah Siswa Baru</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Citra Kirana"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Panggilan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Citra"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kode Kelas:</label>
                <input
                  type="text"
                  required
                  placeholder="2A-RUKUN"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Semua Log Jawaban */}
      {isClearLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl p-6 border-2 border-rose-500/50 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Hapus Semua Log Jawaban?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Seluruh {attemptLogs.length} riwayat log jawaban siswa akan dibersihkan dari penyimpanan. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearLogsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearAllLogs}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md"
              >
                Ya, Bersihkan Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Siswa */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl p-6 border-2 border-rose-500/50 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Hapus Siswa?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Data <strong>{studentToDelete.displayName}</strong> ({studentToDelete.studentCode}) dan riwayat progresnya akan dihapus.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Permanen Catatan Kecurangan */}
      {isResetCheatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 border-2 border-rose-500/50 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-white">
                {selectedStudentForCheatReset
                  ? `Hapus Permanen Catatan: ${selectedStudentForCheatReset.displayName}?`
                  : 'Hapus Permanen Seluruh Catatan Kecurangan?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedStudentForCheatReset
                  ? `Catatan kecurangan siswa ${selectedStudentForCheatReset.displayName} (${selectedStudentForCheatReset.studentCode}) akan dihapus secara permanen dari Cloud Firestore dan memori perangkat. Status integritas siswa ini akan langsung pulih menjadi 100% Bersih.`
                  : `Semua ${cheatLogs.length} catatan pelanggaran pada Pengawas Ujian akan dihapus secara permanen dari Cloud Firestore dan memori perangkat. Bar pengawas akan kembali ke 0 Bersih dan integritas seluruh siswa kembali 100% Bersih.`}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>Data yang dihapus permanen tidak dapat dipulihkan kembali.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetCheatModalOpen(false);
                  setSelectedStudentForCheatReset(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearCheatLogs}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Ya, Hapus Permanen Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
