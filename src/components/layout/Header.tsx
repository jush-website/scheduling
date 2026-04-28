import React from 'react';
import { Calendar, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm hidden md:block">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
              SmartSched
            </h1>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-80">工作空間</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-slate-800 leading-none">
                {user.displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                專業帳號
              </span>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <button
              onClick={logout}
              className="ml-2 p-2.5 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all duration-300"
              title="登出系統"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
