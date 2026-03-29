
import React, { useState } from 'react';
import { UserRole } from '@/types';

interface LoginProps {
  onLogin: (email: string, password: string, role: UserRole, isSignUp: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role, isSignUp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 via-white to-blue-50 px-4">
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3 mb-6">
            <i className="fas fa-cubes text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Zero-Build AI</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Visualization Hub</p>
        </div>

        <div className="flex p-1 bg-gray-100/50 rounded-2xl mb-8">
          <button 
            onClick={() => setRole(UserRole.CLIENT)}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${role === UserRole.CLIENT ? 'bg-white shadow-lg text-green-600' : 'text-gray-400'}`}
          >
            CLIENT
          </button>
          <button 
            onClick={() => setRole(UserRole.ADMIN)}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${role === UserRole.ADMIN ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400'}`}
          >
            ADMIN / DEV
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 text-white tracking-widest text-sm ${role === UserRole.CLIENT ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSignUp ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
          </button>
        </form>

        {role === UserRole.CLIENT && (
          <div className="mt-8 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-black text-green-600 hover:underline">
              {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
            </button>
          </div>
        )}

        {role === UserRole.ADMIN && (
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-400 font-bold text-center leading-relaxed">
              DEV ACCESS: <br/>
              <b>admin@zerobuild.ai</b> / <b>admin123</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
