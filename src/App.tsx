
import React, { useState, useEffect } from 'react';
import { User, UserRole, Project, AppLanguage, FeedbackLevel } from '@/types';
import UserLogin from '@/components/UserLogin';
import AdminLogin from '@/components/AdminLogin';
import PortalSelection from '@/components/PortalSelection';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import Chatbot from '@/components/Chatbot';
import Modal from '@/components/Modal';

import { translations } from '@/translations';
import { getUsersFromDB, saveUsersToDB } from '@/lib/db';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [language, setLanguage] = useState<AppLanguage>(AppLanguage.EN);
  const t = translations[language];
  const [showChat, setShowChat] = useState(false);
  const [portalView, setPortalView] = useState<'selection' | 'admin' | 'user'>('selection');
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getUsersFromDB();
        if (saved && saved.length > 0) {
          setUsers(saved);
        } else {
          // Fallback to localStorage for migration
          const legacy = localStorage.getItem('zb_users_final');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            setUsers(parsed);
            await saveUsersToDB(parsed);
            localStorage.removeItem('zb_users_final');
          }
        }
      } catch (e) {
        console.error('Failed to load users from DB', e);
      }
    };
    loadData();
  }, []);

  const saveUsers = async (newUsers: User[]) => {
    setUsers(newUsers);
    try {
      await saveUsersToDB(newUsers);
    } catch (e) {
      console.error('Failed to save users to DB', e);
      showAlert('Storage Error', 'Failed to save your projects. Your browser storage might be full.');
    }
  };

  const showAlert = (title: string, message: string) => {
    setModal({ isOpen: true, title, message });
  };

  const handleLogin = (email: string, pass: string, role: UserRole, isSignUp: boolean) => {
    if (role === UserRole.ADMIN) {
      if (email === 'admin@zerobuild.ai' && pass === 'admin123') {
        setUser({ id: 'admin', email, role, projects: [], createdAt: Date.now(), lastLogin: Date.now() });
      } else {
        showAlert(t.accessDenied, t.invalidDevCreds);
      }
      return;
    }

    if (isSignUp) {
      if (users.find(u => u.email === email)) {
        showAlert(t.accountExists, t.accountExistsMsg);
      } else {
        const newUser: User = { id: Math.random().toString(), email, password: pass, role: UserRole.CLIENT, projects: [], createdAt: Date.now(), lastLogin: Date.now() };
        saveUsers([...users, newUser]);
        setUser(newUser);
      }
    } else {
      const u = users.find(x => x.email === email && x.password === pass);
      if (u) {
        const updated = { ...u, lastLogin: Date.now() };
        setUser(updated);
        saveUsers(users.map(x => x.id === u.id ? updated : x));
      } else {
        showAlert(t.loginFailed, t.invalidCreds);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPortalView('selection');
  };

  const handleDeleteProject = (userId: string, projectId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, projects: u.projects.filter(p => p.id !== projectId) };
      }
      return u;
    });
    saveUsers(updatedUsers);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
  };

  const handleSetFeedback = (projectId: string, feedback: FeedbackLevel) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      projects: user.projects.map(p => p.id === projectId ? { ...p, feedback } : p)
    };
    setUser(updatedUser);
    saveUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {!user ? (
        <>
          {portalView === 'selection' && <PortalSelection language={language} onSelect={setPortalView} />}
          {portalView === 'admin' && <AdminLogin language={language} onLogin={handleLogin} onBack={() => setPortalView('selection')} />}
          {portalView === 'user' && <UserLogin language={language} onLogin={handleLogin} onBack={() => setPortalView('selection')} />}
        </>
      ) : (
        <>
          <nav className="bg-white/90 backdrop-blur-xl px-12 py-6 flex justify-between items-center border-b border-gray-100 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-green-100 rotate-3 transition-transform hover:rotate-0">Z</div>
              <div>
                <span className="font-black text-2xl text-gray-900 tracking-tighter">{t.appName.toUpperCase()}</span>
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">{t.visionDesc}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl shadow-inner">
                 {[AppLanguage.EN, AppLanguage.TE, AppLanguage.HI].map(l => (
                    <button key={l} onClick={() => setLanguage(l)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${language === l ? 'bg-white shadow-lg text-green-600' : 'text-gray-400'}`}>
                      <i className="fas fa-language text-lg"></i> {l.toUpperCase()}
                    </button>
                  ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.role === UserRole.ADMIN ? t.admin : t.client}</p>
                  <p className="text-sm font-bold text-gray-700">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                  <i className="fas fa-power-off"></i>
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-grow">
            {user.role === UserRole.ADMIN ? (
              <AdminDashboard language={language} users={users} onDeleteProject={handleDeleteProject} onDeleteUser={handleDeleteUser} />
            ) : (
              <ClientDashboard 
                language={language} 
                user={user} 
                onAddProject={(p) => {
                  const updated = { ...user, projects: [p, ...user.projects] };
                  setUser(updated);
                  saveUsers(users.map(u => u.id === user.id ? updated : u));
                }} 
                onSetFeedback={handleSetFeedback}
              />
            )}
          </main>

          <button onClick={() => setShowChat(!showChat)} className="fixed bottom-12 right-12 w-20 h-20 bg-green-600 text-white rounded-[32px] shadow-[0_20px_50px_rgba(22,163,74,0.3)] z-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className={`fas ${showChat ? 'fa-times' : 'fa-comment-alt-lines'} text-3xl`}></i>
          </button>

          {showChat && (
            <div className="fixed bottom-36 right-12 w-[450px] h-[700px] rounded-[56px] overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.2)] z-50 border border-white/50 backdrop-blur-3xl animate-in slide-in-from-bottom-10">
              <Chatbot language={language} />
            </div>
          )}
        </>
      )}
      <Modal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
};

export default App;
