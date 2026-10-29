/**
 * MISI SAHABAT RUKUN - Petualangan Hidup Rukun di Sekolah
 * Main Application Orchestrator
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SchoolMap } from './components/SchoolMap';
import { TamanPancasilaLevel } from './components/levels/TamanPancasilaLevel';
import { PerpustakaanCeriaLevel } from './components/levels/PerpustakaanCeriaLevel';
import { KantinPintarLevel } from './components/levels/KantinPintarLevel';
import { StudioKreatifLevel } from './components/levels/StudioKreatifLevel';
import { LapanganPersahabatanLevel } from './components/levels/LapanganPersahabatanLevel';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherGoogleLoginModal } from './components/TeacherGoogleLoginModal';
import { StudentLogin } from './components/StudentLogin';
import { GuideDocModal } from './components/GuideDocModal';
import { ScreenPrivacyShield } from './components/anticheat/ScreenPrivacyShield';
import { AntiCheatModal } from './components/anticheat/AntiCheatModal';
import { antiCheatService, AntiCheatAlertEvent } from './services/antiCheat';
import { gameDb } from './services/db';
import { cloudDb, auth, onAuthTeacherChanged, signOutTeacher } from './services/firebase';
import { User } from 'firebase/auth';
import { StudentProfile, LevelProgress } from './types/game';
import { soundManager } from './utils/audio';
import { TeacherEncouragementToast } from './components/TeacherEncouragementToast';
import { motion, AnimatePresence } from 'motion/react';
import { LevelTransitionOverlay } from './components/transitions/LevelTransitionOverlay';
import { StudentLeaderboardModal } from './components/StudentLeaderboardModal';

type AppView =
  | 'welcome'
  | 'map'
  | 'level_taman_pancasila'
  | 'level_perpustakaan_ceria'
  | 'level_kantin_pintar'
  | 'level_studio_kreatif'
  | 'level_lapangan_persahabatan'
  | 'teacher';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(gameDb.getCurrentStudent());
  const [levelProgress, setLevelProgress] = useState<Record<string, LevelProgress>>({});
  const [levelUnlocks, setLevelUnlocks] = useState<Record<string, boolean>>(gameDb.getLevelUnlockSettings());
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [teacherUser, setTeacherUser] = useState<User | null>(auth.currentUser);
  const [isTeacherLoginModalOpen, setIsTeacherLoginModalOpen] = useState(false);
  const [globalCheatAlert, setGlobalCheatAlert] = useState<AntiCheatAlertEvent | null>(null);

  // Portal Animasi Transisi Halus antar Level dan Peta
  const [transitionPortal, setTransitionPortal] = useState<{
    isOpen: boolean;
    targetView: AppView;
    title: string;
    subtitle: string;
    icon: string;
  }>({
    isOpen: false,
    targetView: 'welcome',
    title: '',
    subtitle: '',
    icon: '✨',
  });

  const triggerViewTransition = (
    targetView: AppView,
    title: string,
    subtitle = 'Petualangan Hidup Rukun di Sekolah',
    icon = '✨'
  ) => {
    setTransitionPortal({
      isOpen: true,
      targetView,
      title,
      subtitle,
      icon,
    });
  };

  const handleTransitionComplete = () => {
    setCurrentView(transitionPortal.targetView);
    setTransitionPortal((prev) => ({ ...prev, isOpen: false }));
  };

  // Pengawasan Anti-Kecurangan: HANYA Aktif Saat Siswa Mengerjakan Misi Kuis / Ujian (level_*)
  // Halaman Muka (welcome), Peta (map), dan Dashboard Guru bebas dari pengawas ujian
  useEffect(() => {
    const isExamMission = currentView.startsWith('level_');
    if (isExamMission && currentStudent) {
      antiCheatService.startSupervision({
        studentId: currentStudent.id,
        studentName: currentStudent.displayName || 'Sahabat Siswa',
        classCode: currentStudent.classCode || '2A',
        levelId: currentView,
      });

      const unsubAlert = antiCheatService.subscribeAlert((alert) => {
        setGlobalCheatAlert(alert);
      });

      return () => {
        unsubAlert();
        antiCheatService.stopSupervision(true);
      };
    } else {
      // Nonaktifkan total pengawas ujian dan pastikan layar tidak tertutup saat di Halaman Muka atau Peta
      antiCheatService.stopSupervision(true);
      antiCheatService.dismissObscure();
      setGlobalCheatAlert(null);
    }
  }, [currentView, currentStudent]);

  // Initial Cloud Sync and Real-time Level Unlocks with Firebase
  useEffect(() => {
    gameDb.syncFromCloud().then(() => {
      const student = gameDb.getCurrentStudent();
      if (student) {
        setCurrentStudent(student);
        const progress = gameDb.getLevelProgress(student.id);
        setLevelProgress(progress);
      }
      setLevelUnlocks(gameDb.getLevelUnlockSettings());
    });

    const unsubUnlocks = cloudDb.subscribeToLevelUnlocks((unlocks) => {
      if (unlocks) {
        // Terapkan ke local storage & React state tanpa looping write balik
        const updated = gameDb.applyCloudLevelUnlocks(unlocks);
        setLevelUnlocks((prev) => {
          const isSame =
            Object.keys(updated).length === Object.keys(prev).length &&
            Object.keys(updated).every((k) => prev[k] === updated[k]);
          return isSame ? prev : updated;
        });
      }
    });

    const unsubSecurity = cloudDb.subscribeToSecuritySettings((sec) => {
      if (sec && sec.teacherPin) {
        gameDb.setTeacherPinLocalOnly(sec.teacherPin);
      }
      if (sec && Array.isArray(sec.authorizedEmails)) {
        localStorage.setItem('msr_authorized_teacher_emails', JSON.stringify(sec.authorizedEmails));
      }
    });

    const unsubAuth = onAuthTeacherChanged((u) => {
      setTeacherUser(u);
    });

    return () => {
      unsubUnlocks();
      unsubSecurity();
      unsubAuth();
    };
  }, []);

  // Load progress when student changes
  useEffect(() => {
    if (currentStudent) {
      const progress = gameDb.getLevelProgress(currentStudent.id);
      setLevelProgress(progress);
    }
  }, [currentStudent]);

  const [hasExplicitlyExited, setHasExplicitlyExited] = useState(false);

  // Real-time Student Presence & Activity Tracking Heartbeat
  // Hanya aktif saat siswa sedang berada di dalam game (peta atau level kuis)
  useEffect(() => {
    // Jangan menimpa status jika di halaman muka, di dashboard guru, atau siswa sudah keluar game
    if (!currentStudent || currentView === 'welcome' || currentView === 'teacher' || hasExplicitlyExited) return;

    const getActivityLabel = (view: AppView): string => {
      switch (view) {
        case 'map':
          return '🗺️ Di Peta Sekolah SD INDONESIA EMAS';
        case 'level_taman_pancasila':
          return '⭐ Misi 1: Taman Pancasila (PPKn)';
        case 'level_perpustakaan_ceria':
          return '⭐ Misi 2: Perpustakaan Ceria (B. Indonesia)';
        case 'level_kantin_pintar':
          return '⭐ Misi 3: Kantin Pintar (Matematika)';
        case 'level_studio_kreatif':
          return '⭐ Misi 4: Studio Kreatif (SBdP)';
        case 'level_lapangan_persahabatan':
          return '⭐ Misi 5: Lapangan Persahabatan (PJOK)';
        default:
          return 'Sedang Bermain';
      }
    };

    const activity = getActivityLabel(currentView);

    // Otomatis tandai siswa Online begitu masuk ke peta atau level game
    gameDb.updateStudentPresence(currentStudent.id, true, activity);

    // Periodic heartbeat setiap 10 detik agar status tetap aktif segar
    const heartbeatTimer = setInterval(() => {
      if (currentStudent && !hasExplicitlyExited) {
        gameDb.updateStudentPresence(currentStudent.id, true, activity);
      }
    }, 10000);

    // Saat tab ditutup atau pengguna meninggalkan halaman
    const handleBeforeUnload = () => {
      if (currentStudent) {
        gameDb.updateStudentPresence(currentStudent.id, false, '⚪ Offline (Tutup Game)');
      }
    };

    const handleVisibilityChange = () => {
      if (!currentStudent || hasExplicitlyExited) return;
      if (document.visibilityState === 'visible') {
        gameDb.updateStudentPresence(currentStudent.id, true, activity);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStudent, currentView, hasExplicitlyExited]);

  const handleStudentLogin = (student: StudentProfile) => {
    setHasExplicitlyExited(false);
    setCurrentStudent(student);
    const progress = gameDb.getLevelProgress(student.id);
    setLevelProgress(progress);
    gameDb.updateStudentPresence(student.id, true, '🗺️ Di Peta Sekolah SD INDONESIA EMAS');
    triggerViewTransition(
      'map',
      `Selamat Datang, ${student.nickname}!`,
      'Membuka Peta Petualangan Hidup Rukun di Sekolah...',
      '🏫'
    );
  };

  const handleExitGame = () => {
    soundManager.playClick();
    if (currentStudent) {
      gameDb.updateStudentPresence(currentStudent.id, false, '⚪ Offline (Keluar Game)');
      gameDb.setCurrentStudent(null);
    }
    antiCheatService.stopSupervision(true);
    antiCheatService.dismissObscure();
    setGlobalCheatAlert(null);
    setHasExplicitlyExited(true);
    setCurrentStudent(null);
    setCurrentView('welcome');
  };

  const handleRequestTeacherAccess = () => {
    if (teacherUser && gameDb.isAuthorizedTeacherEmail(teacherUser.email)) {
      setCurrentView('teacher');
    } else {
      setIsTeacherLoginModalOpen(true);
    }
  };

  const handleUpdateLevelUnlocks = useCallback((newUnlocks: Record<string, boolean>) => {
    setLevelUnlocks((prev) => {
      const isSame =
        Object.keys(newUnlocks).length === Object.keys(prev).length &&
        Object.keys(newUnlocks).every((k) => prev[k] === newUnlocks[k]);
      return isSame ? prev : newUnlocks;
    });
  }, []);

  const handleSelectLevel = (levelId: string) => {
    // Pastikan level diizinkan oleh Guru (cek state reaktif & gameDb)
    const isAllowed = levelUnlocks[levelId] ?? gameDb.isLevelUnlocked(levelId);
    if (!isAllowed) {
      return;
    }

    const missionMeta: Record<string, { view: AppView; title: string; subtitle: string; icon: string }> = {
      'taman-pancasila': {
        view: 'level_taman_pancasila',
        title: 'Misi 1: Taman Pancasila (PPKn)',
        subtitle: 'Mengenal simbol sila Pancasila dan hidup rukun bersama teman',
        icon: '⭐',
      },
      'perpustakaan-ceria': {
        view: 'level_perpustakaan_ceria',
        title: 'Misi 2: Perpustakaan Ceria (B. Indonesia)',
        subtitle: 'Belajar kalimat santun, ajakan, dan saling menghargai',
        icon: '📖',
      },
      'kantin-pintar': {
        view: 'level_kantin_pintar',
        title: 'Misi 3: Kantin Pintar (Matematika)',
        subtitle: 'Penjumlahan, pengurangan sehat & tertib antre',
        icon: '🍎',
      },
      'studio-kreatif': {
        view: 'level_studio_kreatif',
        title: 'Misi 4: Studio Kreatif (SBdP)',
        subtitle: 'Karya seni imajinatif indahnya keberagaman sekolah',
        icon: '🎨',
      },
      'lapangan-persahabatan': {
        view: 'level_lapangan_persahabatan',
        title: 'Misi 5: Lapangan Persahabatan (PJOK)',
        subtitle: 'Gerak lokomotor lincah & sportivitas dalam permainan',
        icon: '⚽',
      },
    };

    const target = missionMeta[levelId];
    if (target) {
      if (currentStudent) {
        gameDb.updateStudentPresence(currentStudent.id, true, target.title);
      }
      triggerViewTransition(target.view, target.title, target.subtitle, target.icon);
    }
  };

  const handleBackToMap = () => {
    triggerViewTransition(
      'map',
      'Peta Sekolah SD INDONESIA EMAS',
      'Kembali menjelajahi petualangan hidup rukun bersama Uciel!',
      '🗺️'
    );
  };

  const handleCompleteLevel = (levelId: string, result: { stars: number; score: number; xp: number }) => {
    if (currentStudent) {
      gameDb.saveLevelProgress(currentStudent.id, levelId, {
        starsEarned: result.stars,
        score: result.score,
        xpEarned: result.xp,
        status: 'completed',
      });

      const levelNames: Record<string, string> = {
        'taman-pancasila': 'Misi Taman Pancasila (PPKn)',
        'perpustakaan-ceria': 'Misi Perpustakaan Ceria (B. Indonesia)',
        'kantin-pintar': 'Misi Kantin Pintar (Matematika)',
        'studio-kreatif': 'Misi Studio Kreatif (SBdP)',
        'lapangan-persahabatan': 'Misi Lapangan Persahabatan (PJOK)',
      };

      // Log attempt into teacher monitoring database
      gameDb.logAttempt({
        studentId: currentStudent.id,
        studentName: currentStudent.displayName,
        classCode: currentStudent.classCode,
        levelId,
        questionId: `misi-${levelId}-selesai`,
        questionText: `Penyelesaian ${levelNames[levelId] || levelId}`,
        selectedAnswer: `${result.stars} Bintang (${result.score} Poin)`,
        isCorrect: result.stars >= 1,
        scoreAwarded: result.score,
        attemptNumber: 1,
      });

      // Update local state
      const updated = gameDb.getLevelProgress(currentStudent.id);
      setLevelProgress(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none antialiased text-gray-900">
      {/* Top Navbar rendered in map and level view */}
      {currentView !== 'welcome' && currentView !== 'teacher' && currentStudent && (
        <Navbar
          currentStudent={currentStudent}
          currentView={currentView === 'map' ? 'map' : 'level'}
          onNavigateMap={handleBackToMap}
          onNavigateTeacher={handleRequestTeacherAccess}
          onExitGame={handleExitGame}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* Screen Views dengan Animasi Transisi Halus */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {currentView === 'welcome' && (
              <StudentLogin
                onStudentLogin={handleStudentLogin}
                onTeacherLogin={handleRequestTeacherAccess}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            )}

            {currentView === 'map' && currentStudent && (
              <SchoolMap
                currentStudent={currentStudent}
                levelProgress={levelProgress}
                levelUnlocks={levelUnlocks}
                onSelectLevel={handleSelectLevel}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
                onExitGame={handleExitGame}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              />
            )}

            {/* Level 1: Taman Pancasila (PPKn) */}
            {currentView === 'level_taman_pancasila' && (
              <TamanPancasilaLevel
                student={currentStudent}
                studentName={currentStudent?.nickname || 'Sahabat Juara'}
                onCompleteLevel={(res) => handleCompleteLevel('taman-pancasila', res)}
                onBackToMap={handleBackToMap}
              />
            )}

            {/* Level 2: Perpustakaan Ceria (B. Indonesia) */}
            {currentView === 'level_perpustakaan_ceria' && (
              <PerpustakaanCeriaLevel
                student={currentStudent}
                studentName={currentStudent?.nickname || 'Sahabat Juara'}
                onCompleteLevel={(res) => handleCompleteLevel('perpustakaan-ceria', res)}
                onBackToMap={handleBackToMap}
              />
            )}

            {/* Level 3: Kantin Pintar (Matematika) */}
            {currentView === 'level_kantin_pintar' && (
              <KantinPintarLevel
                student={currentStudent}
                studentName={currentStudent?.nickname || 'Sahabat Juara'}
                onCompleteLevel={(res) => handleCompleteLevel('kantin-pintar', res)}
                onBackToMap={handleBackToMap}
              />
            )}

            {/* Level 4: Studio Kreatif (SBdP) */}
            {currentView === 'level_studio_kreatif' && (
              <StudioKreatifLevel
                student={currentStudent}
                studentName={currentStudent?.nickname || 'Sahabat Juara'}
                onCompleteLevel={(res) => handleCompleteLevel('studio-kreatif', res)}
                onBackToMap={handleBackToMap}
              />
            )}

            {/* Level 5: Lapangan Persahabatan (PJOK) */}
            {currentView === 'level_lapangan_persahabatan' && (
              <LapanganPersahabatanLevel
                student={currentStudent}
                studentName={currentStudent?.nickname || 'Sahabat Juara'}
                onCompleteLevel={(res) => handleCompleteLevel('lapangan-persahabatan', res)}
                onBackToMap={handleBackToMap}
              />
            )}

            {/* Teacher Dashboard */}
            {currentView === 'teacher' && (
              <TeacherDashboard
                levelUnlocks={levelUnlocks}
                onUpdateLevelUnlocks={handleUpdateLevelUnlocks}
                onBackToGame={() => setCurrentView('map')}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
                teacherEmail={teacherUser?.email}
                teacherName={teacherUser?.displayName}
                teacherPhoto={teacherUser?.photoURL}
                onLogout={async () => {
                  await signOutTeacher();
                  setTeacherUser(null);
                  setCurrentView('welcome');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Papan Peringkat Siswa SD INDONESIA EMAS */}
      <StudentLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentStudent={currentStudent}
      />

      {/* Portal Animasi Transisi Halus antar Level & Peta */}
      <LevelTransitionOverlay
        isVisible={transitionPortal.isOpen}
        destinationTitle={transitionPortal.title}
        destinationSubtitle={transitionPortal.subtitle}
        destinationIcon={transitionPortal.icon}
        onAnimationComplete={handleTransitionComplete}
      />

      {/* Modal Login Khusus Akun Google Guru (Firebase Authentication) */}
      <TeacherGoogleLoginModal
        isOpen={isTeacherLoginModalOpen}
        onClose={() => setIsTeacherLoginModalOpen(false)}
        onSuccess={() => {
          setIsTeacherLoginModalOpen(false);
          setCurrentView('teacher');
        }}
      />

      {/* Developer & Teacher Character Guide Documentation Modal */}
      <GuideDocModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Screen Privacy Blinding Shield saat screenshot atau jendela diminimalkan (HANYA Aktif Saat Misi Kuis) */}
      {currentView.startsWith('level_') && (
        <ScreenPrivacyShield />
      )}

      {/* Live Teacher Encouragement Cheering Toast for Students */}
      {currentView !== 'teacher' && (
        <TeacherEncouragementToast currentStudent={currentStudent} />
      )}
    </div>
  );
}
