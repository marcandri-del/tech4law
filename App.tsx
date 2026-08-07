import React, { useState, useEffect, ErrorInfo, ReactNode, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AIAssistant from './pages/AIAssistant';
import Lessons from './pages/Lessons';
import Flashcards from './pages/Flashcards';
import Quizzes from './pages/Quizzes';
import Research from './pages/Research';
import Dashboard from './pages/Dashboard';
import Tech4Law from './pages/Tech4Law';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthReady, needsYearSelection, setUserStudyYear } = useAuth();
  const location = useLocation();
  
  if (!isAuthReady) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">جاري التحميل...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (needsYearSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950" dir="rtl">
        <div className="bg-slate-900 rounded-3xl p-8 max-w-sm w-full mx-4 border border-slate-800 text-center animate-scaleIn">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-xl font-black text-white mb-2">مرحباً بك في DZLAW HUB</h2>
          <p className="text-slate-400 text-sm mb-6">اختر سنتك الدراسية لتخصيص المحتوى</p>
          <div className="space-y-3">
            {[{ value: '1', label: 'L1 — السنة الأولى' }, { value: '2', label: 'L2 — السنة الثانية' }, { value: '3', label: 'L3 — السنة الثالثة' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setUserStudyYear(opt.value)}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, {hasError: boolean, error: Error | null}> {
  state = { hasError: false, error: null as Error | null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null as Error | null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "حدث خطأ غير متوقع.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center" dir="rtl">
          <h1 className="text-3xl font-bold text-red-500 mb-4">عذراً، حدث خطأ!</h1>
          <p className="text-slate-300 mb-6 max-w-md">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-primary hover:bg-primary-light rounded-xl text-white font-bold transition"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const AppContent: React.FC = () => {
  // Theme management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout toggleTheme={toggleTheme} isDark={isDark}>
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="lessons" element={<Lessons />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="research" element={<Research />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tech4law" element={<Tech4Law />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="contact" element={<Contact />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;