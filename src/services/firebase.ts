import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentProfile, LevelProgress, StudentAttemptLog } from '../types/game';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection validation
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline fallback active. Check your network or Firebase configuration.');
      return false;
    }
    // Test doc might not exist which is fine, as long as it reached the server
    return true;
  }
}

export interface GoogleAuthResult {
  user?: User;
  error?: {
    code: string;
    message: string;
    domain: string;
  };
}

// Teacher Authentication via Google with detailed error diagnostic
export async function signInTeacherWithGoogle(): Promise<GoogleAuthResult> {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (err: any) {
    console.error('Google Sign-in failed:', err);
    return {
      error: {
        code: err?.code || 'auth/unknown',
        message: err?.message || 'Login Google gagal.',
        domain: currentDomain,
      },
    };
  }
}

export async function signOutTeacher(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out failed:', err);
  }
}

export function onAuthTeacherChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Firestore operations for Game Data
export const cloudDb = {
  // Level Unlocks
  async getLevelUnlocks(): Promise<Record<string, boolean> | null> {
    const path = 'settings/levelUnlocks';
    try {
      const snap = await getDoc(doc(db, 'settings', 'levelUnlocks'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          'taman-pancasila':
            data.tamanPancasila !== undefined
              ? Boolean(data.tamanPancasila)
              : (data['taman-pancasila'] !== undefined ? Boolean(data['taman-pancasila']) : true),
          'perpustakaan-ceria':
            data.perpustakaanCeria !== undefined
              ? Boolean(data.perpustakaanCeria)
              : Boolean(data['perpustakaan-ceria']),
          'kantin-pintar':
            data.kantinPintar !== undefined
              ? Boolean(data.kantinPintar)
              : Boolean(data['kantin-pintar']),
          'studio-kreatif':
            data.studioKreatif !== undefined
              ? Boolean(data.studioKreatif)
              : Boolean(data['studio-kreatif']),
          'lapangan-persahabatan':
            data.lapanganPersahabatan !== undefined
              ? Boolean(data.lapanganPersahabatan)
              : Boolean(data['lapangan-persahabatan']),
        };
      }
      return null;
    } catch (error) {
      console.warn('getLevelUnlocks error, falling back to local:', error);
      return null;
    }
  },

  async saveLevelUnlocks(settings: Record<string, boolean>): Promise<void> {
    try {
      await setDoc(
        doc(db, 'settings', 'levelUnlocks'),
        {
          tamanPancasila: Boolean(settings['taman-pancasila']),
          perpustakaanCeria: Boolean(settings['perpustakaan-ceria']),
          kantinPintar: Boolean(settings['kantin-pintar']),
          studioKreatif: Boolean(settings['studio-kreatif']),
          lapanganPersahabatan: Boolean(settings['lapangan-persahabatan']),
          'taman-pancasila': Boolean(settings['taman-pancasila']),
          'perpustakaan-ceria': Boolean(settings['perpustakaan-ceria']),
          'kantin-pintar': Boolean(settings['kantin-pintar']),
          'studio-kreatif': Boolean(settings['studio-kreatif']),
          'lapangan-persahabatan': Boolean(settings['lapangan-persahabatan']),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('saveLevelUnlocks error, settings saved locally:', error);
    }
  },

  // Students
  async getStudents(): Promise<StudentProfile[]> {
    const path = 'students';
    try {
      const snap = await getDocs(collection(db, path));
      const list: StudentProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as StudentProfile);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveStudent(student: StudentProfile): Promise<void> {
    const path = `students/${student.id}`;
    try {
      await setDoc(doc(db, 'students', student.id), student, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteStudent(studentId: string): Promise<void> {
    const path = `students/${studentId}`;
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Level Progress
  async getStudentProgress(studentId: string): Promise<Record<string, LevelProgress> | null> {
    const path = 'progress';
    try {
      const q = query(collection(db, path));
      const snap = await getDocs(q);
      const result: Record<string, LevelProgress> = {};
      snap.forEach((d) => {
        const data = d.data() as LevelProgress & { studentId?: string };
        if (data.studentId === studentId) {
          result[data.levelId] = data;
        }
      });
      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveProgress(studentId: string, progress: LevelProgress): Promise<void> {
    const docId = `${studentId}_${progress.levelId}`;
    const path = `progress/${docId}`;
    try {
      await setDoc(doc(db, 'progress', docId), { ...progress, studentId }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Attempt Logs
  async getAttemptLogs(): Promise<StudentAttemptLog[]> {
    const path = 'attemptLogs';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(150));
      const snap = await getDocs(q);
      const list: StudentAttemptLog[] = [];
      snap.forEach((d) => {
        list.push(d.data() as StudentAttemptLog);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveAttemptLog(log: StudentAttemptLog): Promise<void> {
    const path = `attemptLogs/${log.id}`;
    try {
      await setDoc(doc(db, 'attemptLogs', log.id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async clearAllAttemptLogs(): Promise<void> {
    const path = 'attemptLogs';
    try {
      const snap = await getDocs(collection(db, path));
      const batch = writeBatch(db);
      snap.docs.forEach((docRef) => {
        batch.delete(docRef.ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Real-time Listeners for Teacher Dashboard & Live Student Sync
  subscribeToAttemptLogs(callback: (logs: StudentAttemptLog[]) => void): () => void {
    const path = 'attemptLogs';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(150));
      return onSnapshot(
        q,
        (snap) => {
          const list: StudentAttemptLog[] = [];
          snap.forEach((d) => list.push(d.data() as StudentAttemptLog));
          callback(list);
        },
        (error) => {
          console.warn('Realtime attemptLogs listener error:', error.message);
        }
      );
    } catch (e) {
      console.warn('Could not establish attemptLogs listener:', e);
      return () => {};
    }
  },

  subscribeToStudents(callback: (students: StudentProfile[]) => void): () => void {
    const path = 'students';
    try {
      const q = query(collection(db, path));
      return onSnapshot(
        q,
        (snap) => {
          const list: StudentProfile[] = [];
          snap.forEach((d) => list.push(d.data() as StudentProfile));
          callback(list);
        },
        (error) => {
          console.warn('Realtime students listener error:', error.message);
        }
      );
    } catch (e) {
      console.warn('Could not establish students listener:', e);
      return () => {};
    }
  },

  subscribeToLevelUnlocks(callback: (settings: Record<string, boolean>) => void): () => void {
    try {
      return onSnapshot(
        doc(db, 'settings', 'levelUnlocks'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            callback({
              'taman-pancasila':
                data.tamanPancasila !== undefined
                  ? Boolean(data.tamanPancasila)
                  : (data['taman-pancasila'] !== undefined ? Boolean(data['taman-pancasila']) : true),
              'perpustakaan-ceria':
                data.perpustakaanCeria !== undefined
                  ? Boolean(data.perpustakaanCeria)
                  : Boolean(data['perpustakaan-ceria']),
              'kantin-pintar':
                data.kantinPintar !== undefined
                  ? Boolean(data.kantinPintar)
                  : Boolean(data['kantin-pintar']),
              'studio-kreatif':
                data.studioKreatif !== undefined
                  ? Boolean(data.studioKreatif)
                  : Boolean(data['studio-kreatif']),
              'lapangan-persahabatan':
                data.lapanganPersahabatan !== undefined
                  ? Boolean(data.lapanganPersahabatan)
                  : Boolean(data['lapangan-persahabatan']),
            });
          }
        },
        (error) => {
          console.warn('Realtime levelUnlocks listener error:', error.message);
        }
      );
    } catch (e) {
      console.warn('Could not establish levelUnlocks listener:', e);
      return () => {};
    }
  },

  // Security Settings (Teacher PIN & Authorized Google Emails)
  async getSecuritySettings(): Promise<{ teacherPin: string; authorizedEmails?: string[] } | null> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'security'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          teacherPin: typeof data.teacherPin === 'string' ? data.teacherPin : '1234',
          authorizedEmails: Array.isArray(data.authorizedEmails) ? data.authorizedEmails : undefined,
        };
      }
      return null;
    } catch (e: any) {
      console.warn('Read settings/security failed:', e?.message);
      return null;
    }
  },

  async saveSecuritySettings(settings: { teacherPin: string; authorizedEmails?: string[] }): Promise<void> {
    const path = 'settings/security';
    try {
      await setDoc(
        doc(db, 'settings', 'security'),
        {
          teacherPin: String(settings.teacherPin).trim(),
          ...(settings.authorizedEmails ? { authorizedEmails: settings.authorizedEmails } : {}),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  subscribeToSecuritySettings(callback: (settings: { teacherPin: string; authorizedEmails?: string[] }) => void): () => void {
    try {
      return onSnapshot(
        doc(db, 'settings', 'security'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            callback({
              teacherPin: typeof data.teacherPin === 'string' ? data.teacherPin : '1234',
              authorizedEmails: Array.isArray(data.authorizedEmails) ? data.authorizedEmails : undefined,
            });
          }
        },
        (error) => {
          console.warn('Realtime security listener error:', error.message);
        }
      );
    } catch (e) {
      console.warn('Could not establish security listener:', e);
      return () => {};
    }
  },
};

// Perform initial connection test
testConnection();
