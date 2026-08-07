import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface TrackingData {
  completedChapters: Record<string, number[]>;
  bookmarkedLessons: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
}

export async function loadTracking(uid: string): Promise<TrackingData> {
  if (!uid) {
    return {
      completedChapters: {},
      bookmarkedLessons: [],
      quizScores: {},
    };
  }

  try {
    const docRef = doc(db, 'users', uid, 'tracking', 'data');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as TrackingData;
      return {
        completedChapters: data.completedChapters || {},
        bookmarkedLessons: data.bookmarkedLessons || [],
        quizScores: data.quizScores || {},
      };
    } else {
      // Fetch from localStorage if available
      let localCompleted: Record<string, number[]> = {};
      let localBookmarks: string[] = [];
      try {
        const comp = localStorage.getItem('completed_chapters');
        if (comp) localCompleted = JSON.parse(comp);
      } catch (e) {
        console.error('Error reading completed_chapters from localStorage:', e);
      }

      try {
        const bookmarks = localStorage.getItem('bookmarked_lessons');
        if (bookmarks) localBookmarks = JSON.parse(bookmarks);
      } catch (e) {
        console.error('Error reading bookmarked_lessons from localStorage:', e);
      }

      const initialData: TrackingData = {
        completedChapters: localCompleted,
        bookmarkedLessons: localBookmarks,
        quizScores: {},
      };

      // Save initial data to Firestore
      await setDoc(docRef, initialData);
      return initialData;
    }
  } catch (error) {
    console.error('Error loading tracking data:', error);
    return {
      completedChapters: {},
      bookmarkedLessons: [],
      quizScores: {},
    };
  }
}

export async function saveTracking(uid: string, data: Partial<TrackingData>): Promise<void> {
  if (!uid) return;

  try {
    const docRef = doc(db, 'users', uid, 'tracking', 'data');
    const docSnap = await getDoc(docRef);
    let mergedData: TrackingData = {
      completedChapters: {},
      bookmarkedLessons: [],
      quizScores: {},
    };

    if (docSnap.exists()) {
      const current = docSnap.data() as TrackingData;
      mergedData = {
        completedChapters: { ...current.completedChapters, ...data.completedChapters },
        bookmarkedLessons: data.bookmarkedLessons !== undefined ? data.bookmarkedLessons : (current.bookmarkedLessons || []),
        quizScores: { ...current.quizScores, ...data.quizScores },
      };
    } else {
      mergedData = {
        completedChapters: data.completedChapters || {},
        bookmarkedLessons: data.bookmarkedLessons || [],
        quizScores: data.quizScores || {},
      };
    }

    await setDoc(docRef, mergedData);

    // Sync to localStorage
    if (mergedData.completedChapters) {
      localStorage.setItem('completed_chapters', JSON.stringify(mergedData.completedChapters));
    }
    if (mergedData.bookmarkedLessons) {
      localStorage.setItem('bookmarked_lessons', JSON.stringify(mergedData.bookmarkedLessons));
    }
  } catch (error) {
    console.error('Error saving tracking data:', error);
  }
}
