
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scale, BookOpen, Brain, LayoutDashboard, Menu, X, GraduationCap, Moon, Sun, Layers, Search, Library, CreditCard, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BackgroundShapes } from './ui/shape-landing-hero';

interface LayoutProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  isDark: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme, isDark }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path 
    ? 'text-primary bg-primary/5 dark:bg-primary/20 font-bold' 
    : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-surface dark:bg-slate-950 relative overflow-hidden">
      <BackgroundShapes />
      {/* Navbar - Modern Clean EdTech Style */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-18 py-3">
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-primary to-primary-light text-white p-2 rounded-xl shadow-lg shadow-primary/30 transform group-hover:scale-105 transition-transform duration-300">
                 <Scale className="w-6 h-6" />
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mx-4">
               <NavLink to="/lessons" label="الدروس" icon={<Library className="w-4 h-4"/>} active={location.pathname === '/lessons'} />
               <NavLink to="/quizzes" label="تمارين" icon={<GraduationCap className="w-4 h-4"/>} active={location.pathname === '/quizzes'} />
               <NavLink to="/flashcards" label="مراجعة" icon={<Layers className="w-4 h-4"/>} active={location.pathname === '/flashcards'} />
               <NavLink to="/research" label="بحث" icon={<Search className="w-4 h-4"/>} active={location.pathname === '/research'} />
               <NavLink to="/pricing" label="الاشتراكات" icon={<CreditCard className="w-4 h-4"/>} active={location.pathname === '/pricing'} />
            </div>

            <div className="hidden md:flex items-center gap-3">
               <Link to="/ai" className="bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/30 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
                  <Brain className="w-4 h-4" />
                  المساعد الذكي
               </Link>
               
               {user ? (
                 <>
                   <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-sm px-3 py-2 rounded-xl">
                     <User className="w-4 h-4" />
                     {user.name}
                   </div>
                   <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm px-3 py-2 rounded-xl transition">
                     <LogOut className="w-4 h-4" />
                     خروج
                   </button>
                 </>
               ) : (
                 <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-bold text-sm px-3 py-2 rounded-xl transition">
                    <LogIn className="w-4 h-4" />
                    دخول
                 </Link>
               )}

               <Link to="/dashboard" className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  <LayoutDashboard className="w-5 h-5" />
               </Link>

              <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 hover:text-yellow-500">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2 shadow-xl absolute w-full z-50">
            <MobileLink to="/ai" icon={<Brain/>} label="المساعد الذكي" onClick={() => setIsMenuOpen(false)} />
            <MobileLink to="/lessons" icon={<BookOpen/>} label="الدروس والمحاضرات" onClick={() => setIsMenuOpen(false)} />
            <MobileLink to="/flashcards" icon={<Layers/>} label="بطاقات المراجعة" onClick={() => setIsMenuOpen(false)} />
            <MobileLink to="/quizzes" icon={<GraduationCap/>} label="الاختبارات" onClick={() => setIsMenuOpen(false)} />
            <MobileLink to="/research" icon={<Search/>} label="البحوث" onClick={() => setIsMenuOpen(false)} />
            <MobileLink to="/pricing" icon={<CreditCard/>} label="الاشتراكات" onClick={() => setIsMenuOpen(false)} />
            <MobileLink to="/dashboard" icon={<LayoutDashboard/>} label="لوحة التحكم" onClick={() => setIsMenuOpen(false)} />
            
            <div className="border-t dark:border-slate-800 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 font-bold">
                      <User className="w-5 h-5" />
                      <span>{user.name}</span>
                    </div>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-bold w-full text-right">
                      <LogOut className="w-5 h-5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <MobileLink to="/" icon={<LogIn/>} label="تسجيل الدخول" onClick={() => setIsMenuOpen(false)} />
                )}
                <button onClick={toggleTheme} className="flex items-center gap-3 p-3 w-full text-slate-600 dark:text-slate-300">
                    {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    <span>تغيير المظهر</span>
                </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow transition-colors duration-300 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-50 dark:bg-slate-900 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
             <div className="flex items-center gap-2">
                 <div className="bg-primary/10 p-2 rounded-lg">
                    <Scale className="w-6 h-6 text-primary" />
                 </div>
             </div>
             <div className="flex gap-6 text-slate-500 text-sm font-medium">
                <Link to="/lessons" className="hover:text-primary transition">المكتبة</Link>
                <Link to="/pricing" className="hover:text-primary transition">الاشتراكات</Link>
                <Link to="/tech4law" className="hover:text-primary transition font-bold text-primary">مجتمع Tech4Law</Link>
                <Link to="/contact" className="hover:text-primary transition">اتصل بنا</Link>
             </div>
          </div>
          <div className="text-center text-slate-400 text-sm">
            <p>© {new Date().getFullYear()} DZ LAW HUB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{to: string, label: string, icon: React.ReactNode, active: boolean}> = ({to, label, icon, active}) => (
    <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>
        {icon}
        {label}
    </Link>
);

const MobileLink: React.FC<{to: string, icon: React.ReactNode, label: string, onClick: () => void}> = ({to, icon, label, onClick}) => (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary rounded-xl transition font-bold">
        <span className="w-5 h-5">{icon}</span>
        <span>{label}</span>
    </Link>
);

export default Layout;
