import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Direct inline fallback to ensure extreme robustness against any bundler/JSON import issues
const fallbackConfig = {
  projectId: "gen-lang-client-0316271537",
  appId: "1:6550091003:web:cabc52c9c524c938616c5e",
  apiKey: "AIzaSyDlcdbKcqRb3AkTHoT6O0OPjplk1ztZ77M",
  authDomain: "gen-lang-client-0316271537.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-bceabe14-15e8-425b-854e-ef73fb4fa0de",
  storageBucket: "gen-lang-client-0316271537.firebasestorage.app",
  messagingSenderId: "6550091003",
  measurementId: ""
};

// Handle potential default wrapping by bundlers
const resolvedJSONConfig = (firebaseConfig && (firebaseConfig as any).default) ? (firebaseConfig as any).default : firebaseConfig;

const config = (resolvedJSONConfig && resolvedJSONConfig.projectId) ? resolvedJSONConfig : fallbackConfig;

console.log('Firebase Configuration resolved:', {
  projectId: config?.projectId,
  appId: config?.appId ? '***' : undefined,
  apiKey: config?.apiKey ? '***' : undefined,
  firestoreDatabaseId: config?.firestoreDatabaseId
});

if (!config || !config.projectId) {
  console.error('CRITICAL: Firebase configuration is missing projectId!', config);
}

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId);

