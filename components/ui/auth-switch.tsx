"use client";

import React, { useState, useEffect } from "react";
import { Chrome, Facebook, Twitter, Linkedin, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const container = document.querySelector(".auth-container");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");
  }, [isSignUp]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const userName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    login(email, userName);
    navigate('/home');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, name || email.split('@')[0]);
    navigate('/home');
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
              <div className="input-field">
                <i><Mail className="w-5 h-5" /></i>
                <input type="email" placeholder="البريد الإلكتروني" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <i><Lock className="w-5 h-5" /></i>
                <input type="password" placeholder="كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <input type="submit" value="دخول" className="auth-btn solid" />
              <p className="social-text">أو سجل دخولك عبر المنصات الاجتماعية</p>
              {/* Social Icons */}
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>

            {/* Sign Up Form */}
            <form className="auth-form sign-up-form" onSubmit={handleSignUp} dir="rtl">
              <h2 className="auth-title">إنشاء حساب</h2>
              <div className="input-field">
                <i><User className="w-5 h-5" /></i>
                <input type="text" placeholder="اسم المستخدم" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="input-field">
                <i><Mail className="w-5 h-5" /></i>
                <input type="email" placeholder="البريد الإلكتروني" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <i><Lock className="w-5 h-5" /></i>
                <input type="password" placeholder="كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <input type="submit" value="تسجيل" className="auth-btn" />
              <p className="social-text">أو أنشئ حساباً عبر المنصات الاجتماعية</p>
              {/* Social Icons */}
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content" dir="rtl">
              <h3>طالب حقوق أو محامي؟</h3>
              <p>انضم إلى منصة DZ LAW HUB، دليلك الشامل للمحاضرات، الاختبارات، والبحوث القانونية في الجزائر.</p>
              <button type="button" className="auth-btn transparent" onClick={() => setIsSignUp(true)}>
                إنشاء حساب
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content" dir="rtl">
              <h3>عضو في المنصة؟</h3>
              <p>مرحباً بك مجدداً في مجتمعك القانوني. سجل دخولك لمواصلة المراجعة والتحضير للامتحانات.</p>
              <button type="button" className="auth-btn transparent" onClick={() => setIsSignUp(false)}>
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIcons() {
  return (
    <>
      <a href="#" className="social-icon">
        <Chrome className="w-5 h-5" />
      </a>
      <a href="#" className="social-icon">
        <Facebook className="w-5 h-5" />
      </a>
      <a href="#" className="social-icon">
        <Twitter className="w-5 h-5" />
      </a>
      <a href="#" className="social-icon">
        <Linkedin className="w-5 h-5" />
      </a>
    </>
  );
}
