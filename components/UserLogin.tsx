
import React, { useState } from 'react';
import { UserRole, AppLanguage } from '../types';
import { translations } from '../translations';

interface LoginProps {
  language: AppLanguage;
  onLogin: (email: string, pass: string, role: UserRole, isSignUp: boolean) => void;
  onBack: () => void;
}

const UserLogin: React.FC<LoginProps> = ({ language, onLogin, onBack }) => {
  const t = translations[language];
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, UserRole.CLIENT, isSignUp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-12 rounded-[48px] shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-600"></div>
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        
        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl shadow-green-100 rotate-6">Z</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{isSignUp ? t.clientSignUp : t.clientLogin}</h2>
          <p className="text-xs font-black text-green-600 uppercase tracking-widest mt-2">{t.visionDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.email}</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.password}</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full btn-primary">
            {isSignUp ? t.signUp : t.login}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-black text-gray-400 hover:text-green-600 uppercase tracking-widest transition-colors"
          >
            {isSignUp ? t.alreadyHaveAccount : t.noAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
