/**
 * Data structures for MISI SAHABAT RUKUN
 * Designed for elementary school Grade 2 thematic curriculum & teacher monitoring
 */

export type EmotionState = 'idle' | 'talking' | 'happy' | 'encouraging' | 'thinking';

export interface GuideDialogue {
  id: string;
  text: string;
  emotion: EmotionState;
  speaker: string;
  soundCue?: 'pop' | 'success' | 'encourage' | 'celebrate';
}

export interface CharacterGuide {
  id: string;
  name: string;
  nickname: string;
  role: string;
  locationId: string;
  locationName: string;
  subject: string;
  themeColor: {
    primary: string;
    secondary: string;
    accent: string;
    light: string;
    border: string;
  };
  avatarUrl: string;
  welcomeDialogue: GuideDialogue[];
  tapGreetings: string[];
  hintPhrases: string[];
  celebrationPhrases: string[];
  encouragingPhrases: string[];
}

export interface PancasilaSymbolMatch {
  silaNumber: number;
  symbolName: string;
  silaText: string;
  iconName: string; // for icon rendering
  description: string;
  exampleAction: string;
}

export interface ScenarioQuestion {
  id: string;
  levelId: string;
  competency: string;
  situation: string;
  illustrationNote?: string;
  questionText: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
  scoreWeight: number;
}

export interface StudentProfile {
  id: string;
  studentCode: string; // e.g. "SISWA-01"
  classCode: string;   // e.g. "KLS2A"
  displayName: string; // e.g. "Budi Santoso"
  nickname: string;    // e.g. "Budi"
  avatarStyle: string;
  createdAt: string;
  lastActive: string;
  isOnline?: boolean;
}

export interface LevelProgress {
  levelId: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'needs_practice';
  starsEarned: number; // 0 - 3
  score: number; // 0 - 100
  xpEarned: number;
  attemptsCount: number;
  completedAt?: string;
  lastPlayedAt: string;
}

export interface StudentAttemptLog {
  id: string;
  studentId: string;
  studentName: string;
  classCode: string;
  levelId: string;
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
  scoreAwarded: number;
  attemptNumber: number;
  timestamp: string;
}

export interface StudentTotalState {
  profile: StudentProfile;
  totalStars: number;
  totalXP: number;
  levelProgress: Record<string, LevelProgress>;
  badges: string[];
}
