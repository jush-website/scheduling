import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      alert("登入失敗，請稍後再試。");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-white">
        <div className="bg-indigo-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Calendar className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900">SmartSched</h1>
        <p className="text-slate-400 font-bold mb-10 text-lg leading-relaxed">
          簡約、高效、直覺的<br />個人排程管理專家
        </p>
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-slate-50 text-slate-700 font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          {isLoggingIn ? (
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              使用 Google 帳號登入
            </>
          )}
        </button>
        
        <p className="mt-10 text-[10px] text-slate-300 font-black uppercase tracking-widest">
          安全雲端工作空間
        </p>
      </div>
    </div>
  );
};
