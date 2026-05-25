import React from 'react';
import { UserProfile, WorkoutSession } from '../types';
import { 
  Flame, Droplet, Pill, Activity, Dumbbell, 
  ChevronRight, Calendar, Heart, Zap, Play,
  Cpu, Moon, BookOpen, Pencil, Check, X
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  suggestedWorkout: WorkoutSession;
  onStartWorkout: () => void;
  onNavigate: (view: 'dashboard' | 'library' | 'longevity' | 'progress') => void;
  onUpdateHydration: (amount: number) => void;
  onUpdateProfile: (newData: Partial<UserProfile>) => void;
}

export default function Dashboard({ 
  profile, 
  suggestedWorkout, 
  onStartWorkout, 
  onNavigate,
  onUpdateHydration,
  onUpdateProfile
}: DashboardProps) {

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(profile.name);

  React.useEffect(() => {
    setEditedName(profile.name);
  }, [profile.name]);

  const handleSaveName = () => {
    if (editedName.trim() && editedName.trim() !== profile.name) {
      onUpdateProfile({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  // Generate dynamic wellness messages based on profile restrictions
  const getRestrictionDisclaimer = () => {
    if (profile.restrictions.length === 0) return 'Configuração padrão de alta intensidade segura.';
    const terms = profile.restrictions.map(r => r === 'joelho' ? 'Sensibilidade de Joelhos' : r === 'coluna' ? 'Descompressão Cervical' : 'Alívio Escapular');
    return `Protocolo ajustado para compensar: ${terms.join(', ')}.`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Greetings section */}
      <div id="dashboard-header-block" className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#e2bfb0] uppercase tracking-widest font-semibold">Hoje, 24 de Maio</p>
          {isEditingName ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input 
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-[#1c1b1b] border border-[#ff6b00] text-white font-sans font-bold text-xl rounded px-2.5 py-1 w-44 focus:outline-none focus:ring-1 focus:ring-[#ff6b00]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <button 
                onClick={handleSaveName}
                className="p-1.5 rounded bg-green-600 hover:bg-green-500 text-white cursor-pointer transition active:scale-90"
                title="Salvar"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <button 
                onClick={() => setIsEditingName(false)}
                className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer transition active:scale-90"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Bom dia, {profile.name}!</h2>
              <button 
                onClick={() => setIsEditingName(true)}
                className="p-1 text-[#e2bfb0]/50 hover:text-[#ff6b00] hover:bg-[#201f1f] rounded transition cursor-pointer"
                title="Editar Nome de Exibição"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <span className="inline-block mt-1 text-[11px] font-mono text-[#ffb693] bg-[#ff6b00]/10 px-2.5 py-0.5 rounded-full">
            {getRestrictionDisclaimer()}
          </span>
        </div>
        <div 
          onClick={() => onNavigate('progress')}
          className="w-10 h-10 rounded-full overflow-hidden border border-[#ff6b00] cursor-pointer hover:scale-105 transition active:scale-95 duration-200"
        >
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoDPxP_goy5S9tZlS9X7A6xkfww8zMfkmkvfJTKX0P9ELaCpkakwjaeqUmOVyu8TTvTzLOC2nB4KSHf3pondvZb8AY7RSXT_xJ7y1vsx9vuHPYhbei5gf3JZ0aLWogetY4I2sKuSYIjGQEhoxe7Cniv_VyTTU1CaoGEvaHHgvTup7wGLYSAWxj_cP9d7NGb6bw3gFT2YdCe-4ZX_MgnKv_yIlZI_v-ZHCeCMG3TckRQsnz5uQVanpnicLHz2mZs12BNaQoW4Dz5zDD" 
            alt="Profile Avatar"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>

      {/* Main workout spotlight card */}
      <motion.div 
        id="main-workout-hero-card"
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-xl bg-[#201f1f] border border-[#5a4136]/30 p-6 shadow-xl shadow-black/40 group border-l-4 border-l-[#ff6b00]"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnQL-mGqzhV5dPr1e4NYcDZH_6vDFbMFrU2MI-bDRg3hbuJi4VK9FbnTL3aMb5bo-l0ORQySjrLUw-SpwFXP1H2ARYLajPVjjmwqPm_BubC-bYEoUeyHkWM25FC_ZD1mUDoo0QKCUdy0q1YPKoNsrnCV267lHc7Ks6d42jXaXdS75BKbmks-L5ymVux5x84yaa8PNnR2PfXi2ekwXcOSx72emJXpx3THwQm2A60tU4DHX0cG_N9wOrBYzjDY7e3H2EFuYIUd-jf61w" 
            alt="Workout overlay" 
            className="object-cover h-full w-full grayscale"
          />
        </div>

        <div className="relative z-10">
          <span className="inline-block px-2.5 py-1 rounded-full bg-[#ff6b00] text-[#131313] text-[10px] font-bold uppercase tracking-widest mb-3">
            Sessão de Longevidade
          </span>
          <h3 className="text-xl font-bold font-sans text-[#ffb693] mb-1">{suggestedWorkout.title}</h3>
          <p className="text-xs text-[#e2bfb0]/80 max-w-md font-sans leading-relaxed mb-5">
            {suggestedWorkout.description} ({getRestrictionDisclaimer()})
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-[#e2bfb0] mb-6 font-mono">
            <span className="flex items-center gap-1">⏱ {suggestedWorkout.totalDuration} Minutos</span>
            <span className="flex items-center gap-1">🔥 {suggestedWorkout.estimatedCalories} Kcal</span>
            <span className="flex items-center gap-1">📋 {suggestedWorkout.exercises.length} Passos Adap.</span>
          </div>

          <button 
            onClick={onStartWorkout}
            className="flex items-center gap-2 bg-[#ff6b00] text-[#131313] font-bold px-6 py-3 rounded-lg hover:bg-[#ff8c33] cursor-pointer transition active:scale-95 duration-200 text-xs uppercase tracking-wider"
          >
            Começar Treino de Hoje
            <Play className="w-4 h-4 fill-[#131313] stroke-none" />
          </button>
        </div>
      </motion.div>

      {/* Quick Customization Setup Panel */}
      <div className="bg-[#1c1b1b] rounded-xl border border-[#5a4136]/20 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffb693] flex items-center gap-1.5 mb-1">
              ⚙ Ajustar Equipamento e Tempo
            </h4>
            <p className="text-[11px] text-[#e2bfb0]/70">
              Gerencie a seleção de equipamentos ativos e seu tempo limite diário (máx. 30min a 1h).
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Preferred Duration pills */}
            <span className="text-[10px] uppercase tracking-wide text-[#e2bfb0]/60 font-mono mr-1">Duração:</span>
            {[15, 30, 45, 60].map((mins) => {
              const active = (profile.preferredDuration || 30) === mins;
              return (
                <button
                  key={mins}
                  onClick={() => onUpdateProfile({ preferredDuration: mins })}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer transition active:scale-95 duration-100 ${
                    active
                      ? 'bg-[#ff6b00] text-[#131313]'
                      : 'bg-[#201f1f] text-[#e2bfb0]/80 hover:bg-[#252525] border border-[#5a4136]/20'
                  }`}
                >
                  {mins} min
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment Selector toggles */}
        <div className="border-t border-[#5a4136]/10 mt-4 pt-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-[#e2bfb0]/60 font-mono">
            Equipamentos Ativados em Casa:
          </span>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'calistenia', label: 'Calistenia (Solo)' },
              { id: 'barras', label: 'Barra Fixa' },
              { id: 'pesos_casa', label: 'Halteres & Pesos' },
            ].map((eq) => {
              const selectedEqs = profile.selectedEquipment || ['calistenia', 'barras', 'pesos_casa'];
              const active = selectedEqs.includes(eq.id);
              
              const handleToggle = () => {
                let updated: string[];
                if (active) {
                  // Don't deselect last option to avoid blank workouts
                  if (selectedEqs.length === 1) return;
                  updated = selectedEqs.filter(x => x !== eq.id);
                } else {
                  updated = [...selectedEqs, eq.id];
                }
                onUpdateProfile({ selectedEquipment: updated });
              };

              return (
                <button
                  key={eq.id}
                  onClick={handleToggle}
                  className={`flex-1 md:flex-initial text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 border transition ${
                    active
                      ? 'bg-[#ff6b00]/10 border-[#ff6b00] text-[#ffb693]'
                      : 'bg-[#1c1b1b] border-[#5a4136]/30 text-[#e2bfb0]/60'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#ff6b00]' : 'bg-gray-600'}`} />
                  {eq.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Metas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress Item: Workouts completed */}
        <div className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffb693]">Atividade Semanal</h4>
            <Calendar className="text-[#ff6b00] w-4 h-4" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-[#353534]" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                <circle 
                  className="text-[#ff6b00]" 
                  cx="28" 
                  cy="28" 
                  fill="transparent" 
                  r="24" 
                  stroke="currentColor" 
                  strokeDasharray="150" 
                  strokeDashoffset={150 - (150 * profile.workoutsCompleted) / 5} 
                  strokeLinecap="round" 
                  strokeWidth="6"
                ></circle>
              </svg>
              <Dumbbell className="absolute text-[#ff6b00] w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Treinos Completados</p>
              <p className="text-[11px] text-[#e2bfb0]/70 font-mono mt-0.5">{profile.workoutsCompleted} de 5 planejados</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('library')}
            className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#ff6b00] hover:underline cursor-pointer"
          >
            Explorar Biblioteca <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Item: Hydration */}
        <div className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffb693]">Hidratação e Viscosidade Sanguínea</h4>
            <Droplet className="text-[#89ceff] w-4 h-4" />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-[#353534]" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                <circle 
                  className="text-[#89ceff]" 
                  cx="28" 
                  cy="28" 
                  fill="transparent" 
                  r="24" 
                  stroke="currentColor" 
                  strokeDasharray="150" 
                  strokeDashoffset={150 - (150 * profile.hydrationMl) / profile.targetHydrationMl} 
                  strokeLinecap="round" 
                  strokeWidth="6"
                ></circle>
              </svg>
              <Droplet className="absolute text-[#89ceff] w-4 h-4 fill-[#89ceff]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ingeta Recente</p>
              <p className="text-[11px] text-[#e2bfb0]/70 font-mono mt-0.5">
                {(profile.hydrationMl / 1000).toFixed(1)}L de {(profile.targetHydrationMl / 1000).toFixed(1)}L recomendados
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => onUpdateHydration(250)}
              className="flex-1 text-[10px] font-sans font-bold bg-[#1c1b1b] border border-[#89ceff]/50 hover:bg-[#89ceff]/10 text-[#89ceff] py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
            >
              + 250ml
            </button>
            <button 
              onClick={() => onUpdateHydration(500)}
              className="flex-1 text-[10px] font-sans font-bold bg-[#1c1b1b] border border-[#89ceff]/50 hover:bg-[#89ceff]/10 text-[#89ceff] py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
            >
              + 500ml
            </button>
          </div>
        </div>
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Action 1 */}
        <div 
          onClick={() => onNavigate('longevity')}
          className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#5a4136]/10 p-3.5 rounded-xl flex items-center gap-3 cursor-pointer group transition duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-[#3a4a5f] flex items-center justify-center text-[#ffb693]">
            <Pill className="text-[#ffb693] w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#ffb693]">Suplementos de Hoje</p>
            <p className="text-[10px] text-[#e2bfb0]/70">Magnésio, D3 e Creatina</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#e2bfb0]/50 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Action 2 */}
        <div 
          onClick={() => onNavigate('longevity')}
          className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#5a4136]/10 p-3.5 rounded-xl flex items-center gap-3 cursor-pointer group transition duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-[#03a3e7]/10 flex items-center justify-center text-[#89ceff]">
            <Activity className="text-[#89ceff] w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">Conselho Médico 40+</p>
            <p className="text-[10px] text-[#e2bfb0]/70">Exposição solar + Despressurização</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#e2bfb0]/50 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Action 3 */}
        <div 
          onClick={() => onNavigate('longevity')}
          className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#5a4136]/10 p-3.5 rounded-xl flex items-center gap-3 cursor-pointer group transition duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00]">
            <Cpu className="text-[#ff6b00] w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">Knowledge Engine</p>
            <p className="text-[10px] text-[#e2bfb0]/70">Explore os papers sobre sarcopenia</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#e2bfb0]/50 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Biometrics & HRV Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Biofeedback details */}
        <div className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffb693]">VFC de Hoje (Variabilidade Cardíaca)</h4>
            <Heart className="text-[#ff6b00] w-4 h-4 fill-[#ff6b00]" />
          </div>

          <div className="flex items-end gap-2.5 h-32 mb-4 font-mono text-[10px]">
            {[
              { label: 'SEG', height: '40%' },
              { label: 'TER', height: '65%' },
              { label: 'QUA', height: '55%' },
              { label: 'QUI', height: '90%', highlight: true },
              { label: 'SEX', height: '35%' },
              { label: 'SAB', height: '10%', opacity: true },
            ].map((day, ix) => (
              <div key={ix} className={`flex-1 flex flex-col items-center gap-1.5 h-full justify-end ${day.opacity ? 'opacity-30' : ''}`}>
                <div 
                  style={{ height: day.height }} 
                  className={`w-full rounded-t-md transition-all ${day.highlight ? 'bg-[#ff6b00] shadow-[0_0_10px_rgba(255,107,0,0.3)]' : 'bg-[#353534] hover:bg-[#ffb693]/30'}`}
                />
                <span className={day.highlight ? 'text-[#ff6b00] font-bold' : 'text-[#e2bfb0]/70'}>{day.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#e5e2e1] leading-relaxed">
            Sua Variabilidade da Frequência Cardíaca (VFC) está <span className="text-[#ff6b00] font-bold font-mono">+12% acima</span> da sua média mensal recente. Excelente prontidão para esforço de alta intensidade adaptado!
          </p>
        </div>

        {/* Sleeping Protocol and supplements recommendation */}
        <div className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffb693]">Protocolos Circadianos</h4>
              <Moon className="text-[#89ceff] w-4 h-4 fill-[#89ceff]" />
            </div>
            
            <h3 className="text-[#e5e2e1] font-bold text-sm mb-1">Dica de Sono: Janela do Magnésio</h3>
            <p className="text-xs text-[#e2bfb0]/80 leading-relaxed mb-4">
              Ingerir 400mg de Glicinato de Magnésio de 45 a 60 minutos antes de dormir aumenta o sono profundo de ondas lentas em quase 18% em adultos acima de 40 anos.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU2KX7Atd3EXQGz0H0IVahM0KmDLjMuwdCi0Q_FZEl-tx7uML-EG_4jvLATSrJ6W0sBHAaBiNs1hS2XSzZXF0vCOui9nWT_Wm_Cb4ZsIHp-dx8i8wlq0RKZZof0E2UHXG1Ol4wnDjPq6N-L6RTzhdTP55OgVT0FrXt9Wpw1U3uA-MuMVCmiWInXmEAy9m4W9Zc8Hzr_q3gdfcjjls-Ph2cDK9QAJrpqPxeIZgUzp_6cpNtbmx5SIljMm9GiQOl4e3dngq53seUGJz3" 
              alt="Scientific research" 
              className="w-12 h-12 rounded-lg object-cover filter grayscale opacity-40 border border-[#5a4136]/40"
            />
            <button 
              onClick={() => onNavigate('longevity')}
              className="bg-[#3a4a5f] hover:bg-[#38485d] text-[#d3e4fe] font-semibold text-[11px] py-2 px-4 rounded-lg cursor-pointer transition active:scale-95"
            >
              Ler Protocolo Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
