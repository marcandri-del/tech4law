import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

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
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;