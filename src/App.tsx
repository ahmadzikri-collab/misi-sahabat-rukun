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
import { gameDb } from './services/db';
import { cloudDb, auth, onAuthTeacherChanged, signOutTeacher } from './services/firebase';
import { User } from 'firebase/auth';
import { StudentProfile, LevelProgress } from './types/game';

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
  const [teacherUser, setTeacherUser] = useState<User | null>(auth.currentUser);
  const [isTeacherLoginModalOpen, setIsTeacherLoginModalOpen] = useState(false);

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

  const handleStudentLogin = (student: StudentProfile) => {
    setCurrentStudent(student);
    const progress = gameDb.getLevelProgress(student.id);
    setLevelProgress(progress);
    setCurrentView('map');
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

    switch (levelId) {
      case 'taman-pancasila':
        setCurrentView('level_taman_pancasila');
        break;
      case 'perpustakaan-ceria':
        setCurrentView('level_perpustakaan_ceria');
        break;
      case 'kantin-pintar':
        setCurrentView('level_kantin_pintar');
        break;
      case 'studio-kreatif':
        setCurrentView('level_studio_kreatif');
        break;
      case 'lapangan-persahabatan':
        setCurrentView('level_lapangan_persahabatan');
        break;
      default:
        setCurrentView('map');
        break;
    }
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
          onNavigateMap={() => setCurrentView('map')}
          onNavigateTeacher={handleRequestTeacherAccess}
        />
      )}

      {/* Screen Views */}
      <main className="flex-1 flex flex-col">
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
          />
        )}

        {/* Level 1: Taman Pancasila (PPKn) */}
        {currentView === 'level_taman_pancasila' && (
          <TamanPancasilaLevel
            student={currentStudent}
            studentName={currentStudent?.nickname || 'Sahabat Juara'}
            onCompleteLevel={(res) => handleCompleteLevel('taman-pancasila', res)}
            onBackToMap={() => setCurrentView('map')}
          />
        )}

        {/* Level 2: Perpustakaan Ceria (B. Indonesia) */}
        {currentView === 'level_perpustakaan_ceria' && (
          <PerpustakaanCeriaLevel
            student={currentStudent}
            studentName={currentStudent?.nickname || 'Sahabat Juara'}
            onCompleteLevel={(res) => handleCompleteLevel('perpustakaan-ceria', res)}
            onBackToMap={() => setCurrentView('map')}
          />
        )}

        {/* Level 3: Kantin Pintar (Matematika) */}
        {currentView === 'level_kantin_pintar' && (
          <KantinPintarLevel
            student={currentStudent}
            studentName={currentStudent?.nickname || 'Sahabat Juara'}
            onCompleteLevel={(res) => handleCompleteLevel('kantin-pintar', res)}
            onBackToMap={() => setCurrentView('map')}
          />
        )}

        {/* Level 4: Studio Kreatif (SBdP) */}
        {currentView === 'level_studio_kreatif' && (
          <StudioKreatifLevel
            student={currentStudent}
            studentName={currentStudent?.nickname || 'Sahabat Juara'}
            onCompleteLevel={(res) => handleCompleteLevel('studio-kreatif', res)}
            onBackToMap={() => setCurrentView('map')}
          />
        )}

        {/* Level 5: Lapangan Persahabatan (PJOK) */}
        {currentView === 'level_lapangan_persahabatan' && (
          <LapanganPersahabatanLevel
            student={currentStudent}
            studentName={currentStudent?.nickname || 'Sahabat Juara'}
            onCompleteLevel={(res) => handleCompleteLevel('lapangan-persahabatan', res)}
            onBackToMap={() => setCurrentView('map')}
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
      </main>

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
    </div>
  );
}
