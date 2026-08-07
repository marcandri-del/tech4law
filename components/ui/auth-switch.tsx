"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studyYear, setStudyYear] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const fromState = (location.state as any)?.from;
  const from = fromState && fromState.pathname && fromState.pathname !== "/"
    ? (fromState.pathname + (fromState.search || ''))
    : "/home";

  useEffect(() => {
    const container = document.querySelector(".auth-container");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");
    setErrorMsg(""); // Clear error on switch
  }, [isSignUp]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await login(email, '', password, false);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error && error.code === "auth/operation-not-allowed") {
        setErrorMsg("طريقة تسجيل الدخول بالبريد وكلمة المرور غير مفعلة في لوحة تحكم Firebase. يرجى الانتقال إلى وحدة تحكم Firebase (Firebase Console) -> Authentication -> Sign-in method وتفعيل 'Email/Password'.");
      } else if (error && (error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-credential")) {
        setErrorMsg("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (error && error.code === "auth/invalid-email") {
        setErrorMsg("البريد الإلكتروني المدخل غير صالح.");
      } else if (error && error.code === "auth/too-many-requests") {
        setErrorMsg("تم حظر المحاولات مؤقتاً بسبب كثرة الطلبات. يرجى المحاولة لاحقاً.");
      } else {
        setErrorMsg("فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مجدداً.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!studyYear) {
      setErrorMsg("يرجى اختيار السنة الدراسية.");
      return;
    }

    // Client-side validation: Password length
    if (password.length < 6) {
      setErrorMsg("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await login(email, name, password, true, studyYear);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error && error.code === "auth/operation-not-allowed") {
        setErrorMsg("طريقة تسجيل الدخول بالبريد وكلمة المرور غير مفعلة في لوحة تحكم Firebase. يرجى الانتقال إلى وحدة تحكم Firebase (Firebase Console) -> Authentication -> Sign-in method وتفعيل 'Email/Password'.");
      } else if (error && error.code === "auth/weak-password") {
        setErrorMsg("كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.");
      } else if (error && error.code === "auth/email-already-in-use") {
        setErrorMsg("البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.");
      } else if (error && error.code === "auth/invalid-email") {
        setErrorMsg("البريد الإلكتروني المدخل غير صالح.");
      } else {
        setErrorMsg("فشل إنشاء الحساب. يرجى التحقق من المدخلات والمحاولة مجدداً.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");
    loginWithGoogle()
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch((error: any) => {
        console.error("Google login failed", error);
        if (error && error.code === "auth/operation-not-allowed") {
          setErrorMsg("تسجيل الدخول عبر Google غير مفعل في لوحة تحكم Firebase. يرجى الانتقال إلى وحدة تحكم Firebase (Firebase Console) -> Authentication -> Sign-in method وتفعيل موفر 'Google'.");
        } else if (error && (error.code === "auth/popup-blocked" || error.message?.includes("popup-blocked"))) {
          setErrorMsg("تم حظر النافذة المنبثقة من قبل المتصفح. يرجى تفعيل السماح بالنوافذ المنبثقة (Popups) من شريط عنوان المتصفح بجوار رابط الموقع والمحاولة مجدداً.");
        } else {
          setErrorMsg("فشل تسجيل الدخول عبر جوجل. يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="auth-wrapper" dir="ltr">
      <style>{`
        .auth-wrapper {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          width: 100%;
        }

        .auth-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 550px;
          background: #000000;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .auth-form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-form.sign-in-form {
          z-index: 2;
        }

        .auth-title {
          font-size: 2.2rem;
          color: #6366f1;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #1a1a1a;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
        }

        .input-field:focus-within {
          background-color: #2a2a2a;
          box-shadow: 0 0 0 2px #4338ca;
        }

        .input-field i {
          text-align: center;
          line-height: 55px;
          color: #888888;
          transition: 0.5s;
          font-size: 1.1rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #ffffff;
          width: 100%;
        }

        .input-field input::placeholder {
          color: #aaa;
          font-weight: 400;
        }

        .auth-btn {
          width: 150px;
          background-color: #4338ca;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.9rem;
        }

        .auth-btn:hover {
          background-color: #3730a3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(67, 56, 202, 0.4);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
        }

        .auth-btn.transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .auth-btn.transparent:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .auth-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-container.sign-up-mode .auth-form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-container.sign-up-mode .auth-form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #4338ca 0%, #6366f1 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .social-text {
          padding: 0.7rem 0;
          font-size: 1rem;
          color: #cccccc;
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .social-icon {
          height: 46px;
          width: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #333333;
          border-radius: 50%;
          color: #4338ca;
          font-size: 1.2rem;
          transition: 0.3s;
          cursor: pointer;
        }

        .social-icon:hover {
          border-color: #6366f1;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .social-icon svg {
          transition: 0.3s;
        }

        @media (max-width: 870px) {
          .auth-container {
            min-height: 800px;
            height: 100vh;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.2rem;
          }
          .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }
          .auth-btn.transparent {
            width: 110px;
            height: 35px;
            font-size: 0.7rem;
          }
          .auth-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-form {
            padding: 0 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form className="auth-form sign-in-form" onSubmit={handleSignIn} dir="rtl">
              <h2 className="auth-title">تسجيل الدخول</h2>
              {errorMsg && !isSignUp && <div className="text-red-500 mb-4 text-sm font-bold">{errorMsg}</div>}
              <div className="input-field">
                <i><Mail className="w-5 h-5" /></i>
                <input type="email" placeholder="البريد الإلكتروني" required disabled={isSubmitting} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <i><Lock className="w-5 h-5" /></i>
                <input type="password" placeholder="كلمة المرور" required disabled={isSubmitting} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={isSubmitting} className="auth-btn flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري...</span>
                  </>
                ) : (
                  <span>دخول</span>
                )}
              </button>
              <p className="social-text">أو سجل دخولك عبر جوجل</p>
              {/* Social Icons */}
              <div className="social-media">
                <SocialIcons onGoogleClick={handleGoogleLogin} disabled={isSubmitting} />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center max-w-[280px]">
                ملاحظة: يتطلب تسجيل الدخول عبر جوجل السماح بالنوافذ المنبثقة (Popups) في إعدادات متصفحك.
              </p>
            </form>

            {/* Sign Up Form */}
            <form className="auth-form sign-up-form" onSubmit={handleSignUp} dir="rtl">
              <h2 className="auth-title">إنشاء حساب</h2>
              {errorMsg && isSignUp && <div className="text-red-500 mb-4 text-sm font-bold">{errorMsg}</div>}
              <div className="input-field">
                <i><User className="w-5 h-5" /></i>
                <input type="text" placeholder="اسم المستخدم" required disabled={isSubmitting} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="input-field" style={{ display: 'grid', gridTemplateColumns: '15% 85%', alignItems: 'center' }}>
                <i>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </i>
                <select
                  required
                  disabled={isSubmitting}
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                  style={{
                    background: 'none',
                    outline: 'none',
                    border: 'none',
                    color: studyYear ? '#ffffff' : '#aaaaaa',
                    fontSize: '1rem',
                    fontWeight: 500,
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" disabled style={{ background: '#1a1a1a', color: '#aaa' }}>السنة الدراسية</option>
                  <option value="1" style={{ background: '#1a1a1a', color: '#ffffff' }}>L1 — السنة الأولى</option>
                  <option value="2" style={{ background: '#1a1a1a', color: '#ffffff' }}>L2 — السنة الثانية</option>
                  <option value="3" style={{ background: '#1a1a1a', color: '#ffffff' }}>L3 — السنة الثالثة</option>
                </select>
              </div>
              <div className="input-field">
                <i><Mail className="w-5 h-5" /></i>
                <input type="email" placeholder="البريد الإلكتروني" required disabled={isSubmitting} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <i><Lock className="w-5 h-5" /></i>
                <input type="password" placeholder="كلمة المرور" required disabled={isSubmitting} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={isSubmitting} className="auth-btn flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري...</span>
                  </>
                ) : (
                  <span>تسجيل</span>
                )}
              </button>
              <p className="social-text">أو أنشئ حساباً عبر جوجل</p>
              {/* Social Icons */}
              <div className="social-media">
                <SocialIcons onGoogleClick={handleGoogleLogin} disabled={isSubmitting} />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center max-w-[280px]">
                ملاحظة: يتطلب تسجيل الدخول عبر جوجل السماح بالنوافذ المنبثقة (Popups) في إعدادات متصفحك.
              </p>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content" dir="rtl">
              <h3>طالب حقوق أو محامي؟</h3>
              <p>انضم إلى منصة DZLAW HUB، دليلك الشامل للمحاضرات، الاختبارات، والبحوث القانونية في الجزائر.</p>
              <button type="button" disabled={isSubmitting} className="auth-btn transparent" onClick={() => setIsSignUp(true)}>
                إنشاء حساب
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content" dir="rtl">
              <h3>عضو في المنصة؟</h3>
              <p>مرحباً بك مجدداً في مجتمعك القانوني. سجل دخولك لمواصلة المراجعة والتحضير للامتحانات.</p>
              <button type="button" disabled={isSubmitting} className="auth-btn transparent" onClick={() => setIsSignUp(false)}>
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIcons({ onGoogleClick, disabled }: { onGoogleClick: () => void; disabled?: boolean }) {
  return (
    <button 
      type="button"
      disabled={disabled}
      onClick={onGoogleClick}
      className="flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#1a1a1a] border border-[#333333] hover:border-[#6366f1] px-6 py-2.5 text-white font-medium transition-all duration-300 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
      aria-label="تسجيل الدخول عبر جوجل"
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
      <span className="text-sm font-semibold tracking-wide font-sans">Google</span>
    </button>
  );
}
