import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogIn, Loader2 } from 'lucide-react';

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
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border">
        <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">SmartSched</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          直覺、高效、跨裝置的<br />個人與團隊排程專家
        </p>
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-white border-2 border-slate-200 hover:border-primary/50 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoggingIn ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              使用 Google 帳號登入
            </>
          )}
        </button>
        
        <p className="mt-8 text-xs text-muted-foreground">
          登入即表示您同意我們的服務條款與隱私權政策
        </p>
      </div>
    </div>
  );
};
