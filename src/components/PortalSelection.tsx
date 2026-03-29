
import React from 'react';
import { AppLanguage } from '@/types';
import { translations } from '@/translations';

interface PortalSelectionProps {
  language: AppLanguage;
  onSelect: (portal: 'admin' | 'user') => void;
}

const PortalSelection: React.FC<PortalSelectionProps> = ({ language, onSelect }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <i className="fas fa-city text-[40rem] text-green-600 absolute -bottom-20 -right-20 rotate-12"></i>
      </div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className="text-center md:col-span-2 mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-[32px] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl shadow-green-200 rotate-6">Z</div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase">{t.appName}</h1>
          <p className="text-sm font-black text-green-600 uppercase tracking-[0.4em] mt-4">{t.visionDesc}</p>
        </div>

        <button 
          onClick={() => onSelect('user')}
          className="group bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 hover:border-green-500 hover:scale-[1.02] transition-all text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] group-hover:bg-green-600 transition-colors flex items-center justify-center">
            <i className="fas fa-user text-3xl text-green-600 group-hover:text-white transition-colors"></i>
          </div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 uppercase">{t.clientPortal}</h3>
          <p className="text-gray-400 font-medium leading-relaxed">{t.clientPortalDesc}</p>
          <div className="mt-10 flex items-center gap-4 text-green-600 font-black text-xs uppercase tracking-widest">
            {t.enterPortal} <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </div>
        </button>

        <button 
          onClick={() => onSelect('admin')}
          className="group bg-black p-12 rounded-[60px] shadow-2xl border border-gray-800 hover:border-blue-500 hover:scale-[1.02] transition-all text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900 rounded-bl-[100px] group-hover:bg-blue-600 transition-colors flex items-center justify-center">
            <i className="fas fa-user-shield text-3xl text-gray-400 group-hover:text-white transition-colors"></i>
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">{t.adminPortal}</h3>
          <p className="text-gray-500 font-medium leading-relaxed">{t.adminPortalDesc}</p>
          <div className="mt-10 flex items-center gap-4 text-blue-500 font-black text-xs uppercase tracking-widest">
            {t.enterPortal} <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PortalSelection;
