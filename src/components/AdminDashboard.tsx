
import React, { useState } from 'react';
import { User, UserRole, Project, AppLanguage } from '@/types';
import Modal from './Modal';
import { translations } from '@/translations';

interface AdminDashboardProps {
  users: User[];
  language: AppLanguage;
  onDeleteProject: (userId: string, projectId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, language, onDeleteProject, onDeleteUser }) => {
  const t = translations[language];
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });
  
  const clients = users.filter(u => u.role === UserRole.CLIENT);
  const totalProjects = clients.reduce((acc, u) => acc + u.projects.length, 0);
  const activeClients = clients.filter(c => Date.now() - c.lastLogin < 24 * 60 * 60 * 1000).length;

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleDeleteClientEntry = (userId: string, email: string) => {
    setModal({
      isOpen: true,
      title: t.deleteClient,
      message: t.confirmDeleteClient,
      type: 'danger',
      onConfirm: () => {
        onDeleteUser(userId);
        if (selectedUserId === userId) setSelectedUserId(null);
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteProject = (projectId: string) => {
    if (!selectedUserId) return;
    setModal({
      isOpen: true,
      title: t.deleteProject,
      message: t.confirmDeleteProject,
      type: 'danger',
      onConfirm: () => {
        onDeleteProject(selectedUserId, projectId);
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getFeedbackBadgeColor = (feedback?: string) => {
    switch(feedback) {
      case 'Outstanding': return 'bg-purple-600 text-white shadow-purple-100';
      case 'Excellent': return 'bg-green-600 text-white shadow-green-100';
      case 'Very Good': return 'bg-blue-600 text-white shadow-blue-100';
      case 'Good': return 'bg-teal-500 text-white shadow-teal-100';
      case 'Average': return 'bg-orange-500 text-white shadow-orange-100';
      default: return 'bg-gray-200 text-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{t.devPortal}</h2>
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1 flex items-center gap-2">
            <i className="fas fa-microchip"></i> {t.monitorActivity}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase">{t.systemStatus}</p>
          <p className="text-sm font-bold text-green-600 flex items-center gap-2 justify-end">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {t.networkOptimal}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.totalClients}</p>
          <p className="text-4xl font-black mt-2 text-gray-800">{clients.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.activeSessions}</p>
          <p className="text-4xl font-black text-green-600 mt-2">{activeClients}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.totalProjects}</p>
          <p className="text-4xl font-black text-blue-600 mt-2">{totalProjects}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.gtvAnalytics}</p>
          <p className="text-4xl font-black text-orange-600 mt-2">₹{(totalProjects * 1.5).toFixed(1)}{t.cr}</p>
        </div>
      </div>

      <div className="bg-white rounded-[56px] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{t.clientMgmt}</h3>
          <div className="flex items-center gap-3">
            <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-gray-500 border shadow-sm uppercase">{t.fullOversight}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">{t.identity}</th>
                <th className="px-10 py-6 text-center">{t.projects}</th>
                <th className="px-10 py-6">{t.latestFeedback}</th>
                <th className="px-10 py-6">{t.registryDate}</th>
                <th className="px-10 py-6 text-right">{t.oversight}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
              {clients.map(client => {
                const latestFeedback = client.projects[0]?.feedback;
                return (
                  <tr key={client.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <span className="tracking-tight">{client.email}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black">{client.projects.length} {t.units}</span>
                    </td>
                    <td className="px-10 py-6">
                      {latestFeedback ? (
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-lg ${getFeedbackBadgeColor(latestFeedback)}`}>
                          {t[latestFeedback.toLowerCase() as keyof typeof t] || latestFeedback.toUpperCase()}
                        </span>
                      ) : <span className="text-gray-300 italic text-[10px]">{t.pendingReview}</span>}
                    </td>
                    <td className="px-10 py-6 text-gray-400 font-medium">{new Date(client.lastLogin).toLocaleDateString()}</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setSelectedUserId(client.id)} 
                          className="bg-white hover:bg-green-600 text-green-600 hover:text-white border-2 border-green-600 px-6 py-2.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-sm active:scale-95"
                        >
                          {t.reviewAudit}
                        </button>
                        <button 
                          onClick={() => handleDeleteClientEntry(client.id, client.email)}
                          className="w-11 h-11 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100 shadow-sm"
                          title={t.deleteEntry}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-[40px] md:rounded-[60px] relative shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/20 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-8 py-10 md:px-16 md:py-12 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
              <div>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">{t.auditLog}</h2>
                <p className="text-xl font-bold text-gray-400 mt-2">{t.owner}: {selectedUser.email}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                    <i className="fas fa-lock-open"></i> {t.fullDevAccess}
                  </span>
                  <span className="bg-gray-50 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {t.clientId}: {selectedUser.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">{t.totalVisProcessed}</p>
                  <p className="text-6xl font-black text-gray-900">{selectedUser.projects.length}</p>
                </div>
                <button 
                  onClick={() => setSelectedUserId(null)} 
                  className="w-14 h-14 bg-gray-100 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all text-xl shadow-sm border border-gray-200 active:scale-90"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto p-8 md:p-16 custom-scrollbar">
              <div className="space-y-24 pb-20">
                {selectedUser.projects.length === 0 && (
                  <div className="text-center py-40 bg-gray-50 rounded-[60px] border-4 border-dashed border-gray-200">
                    <i className="fas fa-layer-group text-8xl text-gray-100 mb-8"></i>
                    <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">{t.noActiveVis}</h3>
                  </div>
                )}
                
                {selectedUser.projects.map(p => (
                  <div key={p.id} className="bg-white rounded-[70px] p-10 md:p-14 space-y-16 border border-gray-100 shadow-[0_30px_100px_rgba(0,0,0,0.05)] relative group hover:border-blue-200 transition-all">
                    
                    {/* Header Row */}
                    <div className="flex flex-wrap justify-between items-center gap-8 border-b pb-12">
                      <div className="flex items-center gap-10">
                        <div>
                          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                            {t.buildingStyles[p.style as keyof typeof t.buildingStyles] || p.style} {t.buildingTypes[p.type as keyof typeof t.buildingTypes] || p.type}
                          </h3>
                          <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                            <i className="fas fa-barcode"></i> {t.projectId}: {p.id}
                          </p>
                        </div>
                        {p.feedback && (
                          <div className={`px-8 py-4 rounded-[30px] font-black text-sm uppercase shadow-2xl ${getFeedbackBadgeColor(p.feedback)} flex items-center gap-3`}>
                            <i className="fas fa-star"></i> {t.satisfaction}: {t[p.feedback.toLowerCase() as keyof typeof t] || p.feedback.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="bg-green-600 text-white px-10 py-6 rounded-[40px] font-black text-3xl shadow-2xl shadow-green-100 border-b-8 border-green-800">
                          <p className="text-[10px] opacity-70 uppercase mb-1 tracking-widest">{t.totalEst}</p>
                          ₹{p.totalEstimatedBudget.toLocaleString()}
                        </div>
                        <button 
                          onClick={() => handleDeleteProject(p.id)}
                          className="bg-red-50 text-red-500 w-20 h-20 rounded-[35px] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl border border-red-100 active:scale-90"
                          title={t.deleteProject}
                        >
                          <i className="fas fa-trash-alt text-2xl"></i>
                        </button>
                      </div>
                    </div>

                    {/* Building Visualization Comparison */}
                    <div className="space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
                        <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{t.buildingCoreVis}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4 group/img relative">
                           <div className="flex justify-between items-center px-4">
                             <p className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                               <i className="fas fa-hard-hat"></i> {t.phase01}
                             </p>
                           </div>
                           <div className="rounded-[50px] overflow-hidden border-8 border-gray-50 shadow-2xl bg-gray-100 aspect-video">
                             <img src={p.mainImages.after} className="w-full h-full object-cover" alt="Building Render" />
                           </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-12 rounded-[50px] border shadow-inner">
                         <h5 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                           <i className="fas fa-clipboard-list text-blue-500"></i> {t.aiSummary}
                         </h5>
                         <p className="text-gray-600 leading-relaxed text-lg font-medium italic">"{p.summary}"</p>
                      </div>
                    </div>

                    {/* Detailed Room Breakdown */}
                    <div className="space-y-12">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-green-600 rounded-full"></div>
                        <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{t.interiorAudit}</h4>
                      </div>
                      
                      <div className="space-y-16">
                        {p.rooms.map((r, roomIdx) => (
                          <div key={r.id} className="bg-gray-50/50 rounded-[60px] p-10 md:p-14 border border-gray-100 shadow-sm space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-8 gap-6">
                              <div>
                                <div className="flex items-center gap-4 mb-2">
                                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black">{roomIdx + 1}</span>
                                  <h5 className="text-4xl font-black text-gray-800 tracking-tighter">{r.name}</h5>
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-12">{t.interiorTheme}: {r.color}</p>
                              </div>
                              <div className="flex gap-6 ml-12 md:ml-0">
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.interior}</p>
                                  <p className="text-xl font-black text-gray-900">₹{(r.budgetAnalysis?.interior || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.furniture}</p>
                                  <p className="text-3xl font-black text-blue-600">₹{(r.budgetAnalysis?.furnitureTotal || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>

                            {/* Room Visual Comparison */}
                            <div className="flex justify-center">
                              <div className="w-full max-w-xl space-y-4">
                                 <p className="text-[10px] font-black text-center text-blue-500 uppercase tracking-widest">{t.aiFurnishedVision}</p>
                                 <div className="rounded-[40px] overflow-hidden border-4 border-white shadow-xl aspect-video bg-white ring-4 ring-blue-50">
                                   <img src={r.images?.after} className="w-full h-full object-cover" alt="Furnished room" />
                                 </div>
                              </div>
                            </div>

                            {/* Furniture Inventory */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {r.furnitureItems.map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-[35px] border border-gray-100 hover:shadow-2xl transition-all group/item">
                                  <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-sm group-hover/item:bg-green-600 group-hover/item:text-white transition-colors shadow-sm">
                                      <i className="fas fa-tag"></i>
                                    </div>
                                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{item.type}</span>
                                  </div>
                                  <h6 className="font-black text-gray-900 text-base mb-2 tracking-tight h-12 overflow-hidden">{item.name}</h6>
                                  <p className="text-green-600 font-bold text-lg mb-6 tracking-tighter">₹{item.rate.toLocaleString()}</p>
                                  <a 
                                    href={item.shopLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-600 py-3.5 rounded-2xl text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all shadow-sm"
                                  >
                                    {t.buyFlipkart} <i className="fas fa-external-link-alt text-[8px]"></i>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
      />
    </div>
  );
};

export default AdminDashboard;
