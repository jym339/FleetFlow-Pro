
import React from 'react';
import { Language } from '../translations';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const DashboardHeader: React.FC<HeaderProps> = ({ lang, setLang }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg md:hidden">
          <i className="fas fa-truck-moving text-white"></i>
        </div>
        <div className="relative group hidden md:block">
          <input 
            type="text" 
            placeholder="Search fleet..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('fr')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === 'fr' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            FR
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-800 leading-tight">James Henderson</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Admin</span>
          </div>
          <button className="relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-md flex items-center justify-center text-white overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=James+Henderson&background=random" alt="avatar" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
