
import React, { useState } from 'react';
import { UserRole, AppLanguage } from '@/types';
import { translations } from '@/translations';

interface LoginProps {
  language: AppLanguage;
  onLogin: (email: string, pass: string, role: UserRole, isSignUp: boolean) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<LoginProps> = ({ language, onLogin, onBack }) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, UserRole.ADMIN, false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="w-full max-w-md bg-white p-12 rounded-[48px] shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        
        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl shadow-blue-100 rotate-6">D</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{t.devLogin}</h2>
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-2">{t.devAuth}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.devEmail}</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              placeholder="admin@zerobuild.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.accessKey}</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {t.authDev}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-600"></i> {t.defaultCredentials}
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase">{t.email}</span>
                <code className="bg-white px-3 py-1 rounded-lg text-xs font-mono text-blue-600 border border-gray-100">admin@zerobuild.ai</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase">{t.accessKey}</span>
                <code className="bg-white px-3 py-1 rounded-lg text-xs font-mono text-blue-600 border border-gray-100">admin123</code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{t.devAuth}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
