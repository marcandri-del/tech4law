import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

interface AuthContextType {
  user: { name: string; email: string; uid: string; role?: string; studyYear?: string } | null;
  login: (email: string, name: string, password?: string, isSignUp?: boolean, studyYear?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthReady: boolean;
  needsYearSelection: boolean;
  setUserStudyYear: (year: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; uid: string; role?: string; studyYear?: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [needsYearSelection, setNeedsYearSelection] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'student';
        let studyYear = '';
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            role = userDoc.data().role || 'student';
            studyYear = userDoc.data().studyYear || '';
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        setUser({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          uid: firebaseUser.uid,
          role,
          studyYear,
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, name: string, password?: string, isSignUp?: boolean, studyYear?: string) => {
    if (!password) return; // Need password for email auth
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create user document in Firestore
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            name: name,
            email: email,
            role: 'student',
            studyYear: studyYear || '',
            createdAt: new Date()
          });
        } catch (error) {
           handleFirestoreError(error, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
        setUser({
          name,
          email,
          uid: userCredential.user.uid,
          role: 'student',
          studyYear: studyYear || '',
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Auth error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      let role = 'student';
      let studyYear = '';
      if (!userDoc.exists()) {
        const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || '',
          role: 'student',
          studyYear: '',
          createdAt: new Date()
        });
        // Flag that this Google user needs to select their year
        setUser({
          name,
          email: firebaseUser.email || '',
          uid: firebaseUser.uid,
          role: 'student',
          studyYear: '',
        });
        setNeedsYearSelection(true);
        setIsAuthReady(true);
        return;
      } else {
        role = userDoc.data()?.role || 'student';
        studyYear = userDoc.data()?.studyYear || '';
      }
      setUser({
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        uid: firebaseUser.uid,
        role,
        studyYear,
      });
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const setUserStudyYear = async (year: string) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { studyYear: year });
      setUser(prev => prev ? { ...prev, studyYear: year } : prev);
      setNeedsYearSelection(false);
    } catch (error) {
      console.error('setUserStudyYear error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isAuthReady, needsYearSelection, setUserStudyYear }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
