
import React, { useState } from 'react';
import { User, Project, RoomConfig, BuildingType, PlotDetails, AppLanguage, FeedbackLevel } from '@/types';
import { BUILDING_TYPES, BUILDING_STYLES, COLOR_SHADES, LOCATION_TYPES } from '@/constants';
import { generateMainBuildingImages, generateRoomVisuals, generateProjectSummary, extractFurnitureDetails } from '@/services/geminiService';
import Modal from './Modal';
import { translations } from '@/translations';

interface ClientDashboardProps {
  user: User;
  language: AppLanguage;
  onAddProject: (project: Project) => void;
  onSetFeedback: (projectId: string, feedback: FeedbackLevel) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, language, onAddProject, onSetFeedback }) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [step, setStep] = useState(1);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
  
  const [plot, setPlot] = useState<PlotDetails>({ length: 0, breadth: 0, totalArea: 0 });
  const [type, setType] = useState<BuildingType>(BuildingType.RESIDENTIAL);
  const [style, setStyle] = useState(BUILDING_STYLES[0]);
  const [floors, setFloors] = useState(1);
  const [rooms, setRooms] = useState<RoomConfig[]>([]);
  const [colors, setColors] = useState({ primary: '', shade: COLOR_SHADES[0] });

  const FEEDBACK_OPTIONS: FeedbackLevel[] = ['Average', 'Good', 'Very Good', 'Excellent', 'Outstanding'];

  const addRoom = () => {
    const newRoom: RoomConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Room ${rooms.length + 1}`,
      color: 'Soft White',
      furnitureItems: []
    };
    setRooms([...rooms, newRoom]);
  };

  const deleteRoom = (id: string) => setRooms(rooms.filter(r => r.id !== id));

  const handleGenerate = async () => {
    if (rooms.length === 0) {
      setLoadingMsg(t.addRoomError);
      setTimeout(() => setLoadingMsg(""), 3000);
      return;
    }
    setLoading(true);
    setLoadingMsg(t.designingExterior);
    try {
      const project: Project = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        plot,
        type,
        style,
        floors,
        rooms: [],
        location: LOCATION_TYPES[0],
        budgetPreference: '',
        colors,
        mainImages: { before: '', after: '' },
        summary: '',
        totalEstimatedBudget: 0
      };

      const mainImgs = await generateMainBuildingImages(project);
      project.mainImages = mainImgs;

      let runningBudget = (plot.totalArea * 2100 * floors);

      // SEQUENTIAL PROCESSING to avoid hitting 429 quota errors
      const processedRooms: RoomConfig[] = [];
      for (let i = 0; i < rooms.length; i++) {
        const r = rooms[i];
        setLoadingMsg(t.furnishingRoom.replace('{roomName}', r.name).replace('{current}', (i + 1).toString()).replace('{total}', rooms.length.toString()));
        const visuals = await generateRoomVisuals(r, style);
        const furniture = await extractFurnitureDetails(r, project.type);
        const furnTotal = furniture.reduce((sum, item) => sum + item.rate, 0);
        const interiorCost = 65000;
        runningBudget += furnTotal + interiorCost;
        
        processedRooms.push({ 
          ...r, 
          images: visuals, 
          furnitureItems: furniture,
          budgetAnalysis: { interior: interiorCost, furnitureTotal: furnTotal }
        });
      }

      project.rooms = processedRooms;
      project.totalEstimatedBudget = runningBudget;
      
      setLoadingMsg(t.generatingSummary);
      project.summary = await generateProjectSummary(project, language);

      onAddProject(project);
      setStep(1);
      setRooms([]);
    } catch (e: any) {
      console.error(e);
      const isQuota = e?.message?.includes('429') || e?.status === 429;
      setModal({
        isOpen: true,
        title: t.error,
        message: isQuota ? t.busy : t.generationFailed
      });
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 gap-12 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-5 bg-white p-10 rounded-[48px] shadow-2xl h-fit border border-gray-100 sticky top-28">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">{step === 1 ? t.plotSetup : t.manageRooms}</h2>
          <div className="flex gap-2">
            {[1, 2].map(s => <div key={s} className={`w-3 h-3 rounded-full ${step === s ? 'bg-green-600 w-8' : 'bg-gray-200'} transition-all`}></div>)}
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder={t.length} className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setPlot({...plot, length: +e.target.value, totalArea: +e.target.value * plot.breadth})} />
              <input type="number" placeholder={t.breadth} className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setPlot({...plot, breadth: +e.target.value, totalArea: +e.target.value * plot.length})} />
            </div>
            <div className="p-4 bg-green-600 text-white rounded-2xl font-black text-center shadow-lg">{plot.totalArea || 0} {t.sqft}</div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.buildingType}</label>
              <select 
                className="input-field" 
                value={type} 
                onChange={e => setType(e.target.value as BuildingType)}
              >
                {BUILDING_TYPES.map(bt => (
                  <option key={bt} value={bt}>
                    {t.buildingTypes[bt as keyof typeof t.buildingTypes] || bt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.archStyle}</label>
              <select 
                className="input-field" 
                value={style} 
                onChange={e => setStyle(e.target.value)}
              >
                {BUILDING_STYLES.map(bs => (
                  <option key={bs} value={bs}>
                    {t.buildingStyles[bs as keyof typeof t.buildingStyles] || bs}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t.floors}</label>
              <input type="number" placeholder="Floors" className="input-field" value={floors} onChange={e => setFloors(+e.target.value)} />
            </div>
            <button onClick={() => setStep(2)} className="w-full btn-primary">{t.next}</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-gray-400 uppercase">{t.roomMgmt}</span>
              <button onClick={addRoom} className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-xs font-black">{t.addRoom}</button>
            </div>
            <div className="max-h-[350px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {rooms.map((r, i) => (
                <div key={r.id} className="p-5 bg-gray-50 rounded-3xl relative border border-transparent hover:border-green-200 group">
                  <button onClick={() => deleteRoom(r.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><i className="fas fa-times-circle"></i></button>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t.roomName}</label>
                      <input className="w-full bg-white p-3 rounded-xl font-bold text-sm outline-none border focus:border-green-600" value={r.name} onChange={e => { const n = [...rooms]; n[i].name = e.target.value; setRooms(n); }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t.themeColor}</label>
                      <input className="w-full bg-white p-3 rounded-xl font-bold text-sm outline-none border focus:border-green-600" value={r.color} onChange={e => { const n = [...rooms]; n[i].color = e.target.value; setRooms(n); }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <input type="text" placeholder={t.buildingColor} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" onChange={e => setColors({...colors, primary: e.target.value})} />
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-500 font-black py-5 rounded-2xl">{t.back}</button>
              <button disabled={loading} onClick={handleGenerate} className="flex-[2] bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-100 disabled:bg-gray-300">
                {loading ? <i className="fas fa-spinner fa-spin"></i> : t.generate}
              </button>
            </div>
            {loading && (
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-center animate-pulse">
                <p className="text-xs font-black text-green-700 uppercase">{loadingMsg}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-7 space-y-12">
        {user.projects.length === 0 ? (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[60px] border-4 border-dashed border-gray-100 p-12 text-center">
            <i className="fas fa-city text-6xl text-gray-200 mb-6"></i>
            <h3 className="text-3xl font-black text-gray-300 tracking-tighter">{t.visionStart}</h3>
            <p className="text-gray-400 font-medium max-w-xs mt-4">{t.visionDesc}</p>
          </div>
        ) : (
          user.projects.map(p => (
            <div key={p.id} className="bg-white rounded-[56px] shadow-2xl border border-gray-100 overflow-hidden relative">
              <div className="p-10 bg-black text-white flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">
                    {t.buildingStyles[p.style as keyof typeof t.buildingStyles] || p.style} {t.buildingTypes[p.type as keyof typeof t.buildingTypes] || p.type}
                  </h2>
                  <p className="text-xs text-green-500 font-black uppercase mt-1">{t.totalEst}: ₹{p.totalEstimatedBudget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.projectId}</p>
                  <p className="font-bold">{p.id}</p>
                </div>
              </div>

              <div className="p-10 space-y-12">
                {/* Feedback Section */}
                <div className="bg-green-50 p-8 rounded-[40px] border border-green-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-black text-green-900">{t.satisfaction}</h4>
                    <p className="text-xs font-bold text-green-700">{t.rateVis}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {FEEDBACK_OPTIONS.map(level => (
                      <button 
                        key={level}
                        onClick={() => onSetFeedback(p.id, level)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${p.feedback === level ? 'bg-green-600 text-white scale-110 shadow-lg' : 'bg-white text-green-600 border border-green-200 hover:bg-green-100'}`}
                      >
                        {t[level.toLowerCase() as keyof typeof t] || level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-2xl space-y-2 text-center">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t.completedVision}</p>
                    <img src={p.mainImages.after} className="aspect-video w-full bg-gray-50 rounded-[40px] object-cover border-8 border-green-500 shadow-2xl" />
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[40px] text-sm text-gray-700 leading-relaxed font-medium relative">
                  <div className="absolute -top-4 left-10 bg-black text-white px-4 py-1 rounded-full text-[10px] font-black">{t.summary}</div>
                  {p.summary}
                </div>

                <div className="space-y-10">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <i className="fas fa-couch text-green-600"></i> {t.interiorDetails}
                  </h3>
                  {p.rooms.map(room => (
                    <div key={room.id} className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 space-y-8">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{room.name}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase">{t.interiorTheme}: {room.color}</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-gray-50 px-4 py-2 rounded-2xl border text-center">
                            <p className="text-[10px] font-black text-gray-400">{t.interior}</p>
                            <p className="font-black text-gray-800">₹{room.budgetAnalysis?.interior.toLocaleString()}</p>
                          </div>
                          <div className="bg-green-600 text-white px-4 py-2 rounded-2xl font-black text-center shadow-lg">
                            <p className="text-[10px] opacity-70">{t.furniture}</p>
                            <p>₹{room.budgetAnalysis?.furnitureTotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="w-full max-w-xl space-y-2">
                           <p className="text-[10px] font-black text-center text-green-600 uppercase tracking-widest">{t.aiFurnishedVision}</p>
                           <img src={room.images?.after} className="aspect-video w-full bg-gray-50 rounded-3xl object-cover border-4 border-green-100 shadow-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {room.furnitureItems.map((item, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            <p className="text-[10px] font-black text-green-600 uppercase mb-1">{item.type}</p>
                            <p className="font-black text-gray-900 text-sm h-10 overflow-hidden">{item.name}</p>
                            <p className="text-gray-500 font-bold mb-3 text-xs">{t.rate}: ₹{item.rate.toLocaleString()}</p>
                            <a href={item.shopLink} target="_blank" rel="noopener noreferrer" className="w-full block bg-blue-600 text-white text-center py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-colors uppercase tracking-widest">{t.buyFlipkart}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Modal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
};

export default ClientDashboard;
