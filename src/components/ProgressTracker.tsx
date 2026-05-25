import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Dumbbell, Sparkles, Heart, Activity, 
  Award, BarChart4, ChevronRight, Zap, Target, Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ProgressTracker() {
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Read cached profile
    let parsedProfile: any = null;
    const cachedProfile = localStorage.getItem('vitality_profile_v2');
    if (cachedProfile) {
      try {
        parsedProfile = JSON.parse(cachedProfile);
        setProfile(parsedProfile);
      } catch (e) {
        console.error('Error parsing profile cache:', e);
      }
    }

    // Read or bootstrap completed workouts list
    const cacheDates = localStorage.getItem('vitality_completed_dates_v2');
    if (cacheDates) {
      try {
        setCompletedDates(JSON.parse(cacheDates));
      } catch (e) {
        console.error('Error parsing completed dates cache:', e);
      }
    } else {
      // Bootstrap pre-seeded consistency trend matching current completed count or default to 18
      const targetCount = parsedProfile ? parsedProfile.workoutsCompleted : 18;
      const seeded: string[] = [];
      const now = new Date();
      
      // Seed days backward with realistic workout distribution (roughly every 2-3 days)
      for (let i = 1; i <= 90; i++) {
        const d = new Date();
        d.setDate(now.getDate() - Math.round(i * 1.8));
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        if (seeded.length < (targetCount || 18)) {
          seeded.push(dateStr);
        }
      }
      setCompletedDates(seeded);
      localStorage.setItem('vitality_completed_dates_v2', JSON.stringify(seeded));
    }
  }, []);

  const handleToggleDay = (dateStr: string) => {
    let newDates = [...completedDates];
    if (newDates.includes(dateStr)) {
      newDates = newDates.filter(d => d !== dateStr);
    } else {
      newDates.push(dateStr);
    }
    setCompletedDates(newDates);
    localStorage.setItem('vitality_completed_dates_v2', JSON.stringify(newDates));

    // Keep workoutsCompleted counter in sync
    const cachedProfile = localStorage.getItem('vitality_profile_v2');
    if (cachedProfile) {
      try {
        const p = JSON.parse(cachedProfile);
        p.workoutsCompleted = newDates.length;
        localStorage.setItem('vitality_profile_v2', JSON.stringify(p));
        // Push small storage event to update background components
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Generate date parameters for the last 3 months
  const monthsData = useMemo(() => {
    const list = [];
    const now = new Date();

    // Iterate backwards: 2 months ago, 1 month ago, current month
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = d.toLocaleString('pt-BR', { month: 'long' });
      const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      const numDays = new Date(year, month + 1, 0).getDate();
      const startDay = new Date(year, month, 1).getDay(); // Sunday = 0, Monday = 1, etc.

      const days = [];
      // Week day padding before month starts
      for (let p = 0; p < startDay; p++) {
        days.push({ isPadding: true, key: `pad-${p}` });
      }

      // Add days
      for (let day = 1; day <= numDays; day++) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;

        const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
        const isWorkoutDay = completedDates.includes(dateStr);

        days.push({
          isPadding: false,
          day,
          dateStr,
          isToday,
          isWorkoutDay,
          key: dateStr
        });
      }

      list.push({
        year,
        month,
        name: `${capitalizedMonth} de ${year}`,
        days
      });
    }
    return list;
  }, [completedDates]);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      
      {/* Performance forecast projection hero card */}
      <section className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] text-[#ff6b00] uppercase font-bold tracking-widest font-mono">Trajetória de Longo Prazo</span>
          <h2 className="text-xl font-bold font-sans text-white leading-tight mt-1">20 Anos de Performance</h2>
          <p className="text-xs text-[#e2bfb0]/80 mt-2 max-w-md leading-relaxed font-sans">
            Seu índice de vitalidade atual supera <span className="text-[#ff6b00] font-bold">92%</span> de pessoas na sua faixa etária ({profile?.age || 45} anos), indicando uma capacidade de funcionalidade neuromuscular de elite projetada até os seus 65+ anos.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 text-[#ff6b00]/5 pointer-events-none">
          <TrendingUp className="w-40 h-40 stroke-[1.5]" />
        </div>
      </section>

      {/* Interactive Workout Consistency Heatmap section */}
      <section className="bg-[#1c1b1b] rounded-xl p-5 border border-[#5a4136]/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#5a4136]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="text-[#ff6b00] w-5 h-5" />
              <h3 className="text-white font-bold font-sans text-sm tracking-tight uppercase">
                Consistência de Treinos (Últimos 3 Meses)
              </h3>
            </div>
            <p className="text-[11px] text-[#e2bfb0]/70 mt-1 leading-relaxed font-sans">
              Visão histórica contínua de fidelidade ao protocolo de longevidade ativa.
            </p>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-mono">
            <div className="bg-[#201f1f] px-3 py-1.5 rounded-lg border border-[#353534]/40">
              <span className="text-[#e2bfb0]/55 block text-[9px] uppercase">Dias Ativos</span>
              <span className="text-white font-bold text-sm block">{completedDates.length} dias</span>
            </div>
            <div className="bg-[#201f1f] px-3 py-1.5 rounded-lg border border-[#353534]/40">
              <span className="text-[#e2bfb0]/55 block text-[9px] uppercase">Consistibilidade</span>
              <span className="text-[#ff6b00] font-bold text-sm block">
                {Math.round((completedDates.length / 90) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 3 months heat map grid wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {monthsData.map((m) => (
            <div key={m.name} className="bg-[#131313]/60 p-4 rounded-lg border border-[#5a4136]/5 flex flex-col justify-between">
              {/* Month Header Banner */}
              <div className="text-center font-bold font-sans text-xs text-[#ffb693] mb-3 pb-1.5 border-b border-[#353534]/30 uppercase tracking-wider">
                {m.name}
              </div>

              {/* Week Day Titles Row */}
              <div className="grid grid-cols-7 text-center font-mono text-[9px] text-[#e2bfb0]/40 font-bold mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, dIdx) => (
                  <div key={dIdx}>{day}</div>
                ))}
              </div>

              {/* Day cells matrix layout */}
              <div className="grid grid-cols-7 gap-1.5">
                {m.days.map((d) => {
                  if (d.isPadding) {
                    return <div key={d.key} className="w-7 h-7" />;
                  }
                  
                  return (
                    <motion.button
                      key={d.key}
                      onClick={() => handleToggleDay(d.dateStr!)}
                      whileTap={{ scale: 0.9 }}
                      className={`w-7 h-7 rounded-sm text-[10px] font-mono font-bold flex items-center justify-center transition-all relative group cursor-pointer ${
                        d.isWorkoutDay
                          ? 'bg-[#ff6b00] text-black shadow-[0_0_6px_rgba(255,107,0,0.45)] hover:bg-[#ff802b]'
                          : d.isToday
                          ? 'border border-dashed border-[#ff6b00] text-[#ff6b00] bg-[#201d1c]/80 hover:bg-[#35251c]'
                          : 'bg-[#201f1f] border border-[#5a4136]/10 text-[#e2bfb0]/50 hover:bg-[#2e2d2d] hover:text-[#fff]'
                      }`}
                      title={`${d.day}/${m.month + 1}/${m.year} - ${d.isWorkoutDay ? 'Treino Concluído' : 'Descanso / Off'}`}
                    >
                      {d.day}
                      
                      {/* Tooltip on Hover */}
                      <span className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-sans px-2 py-1 rounded border border-[#5a4136]/40 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 shadow-xl">
                        {d.day}/{m.month + 1} - {d.isWorkoutDay ? '🔥 Treinado' : '💤 Off'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend block at bottom */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-[#e2bfb0]/60 gap-3 border-t border-[#5a4136]/10 pt-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#ff6b00]" />
              <span>Dia Treinado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#201f1f] border border-[#5a4136]/10" />
              <span>Dia de Descanso / Off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-dashed border-[#ff6b00] bg-[#201d1c]/80" />
              <span>Hoje</span>
            </div>
          </div>
          <span className="text-[#ffb693]/70 italic font-medium">
            💡 Dica: Clique nos dias do calendário para marcar treinos retroativamente.
          </span>
        </div>
      </section>

      {/* Main dashboard body metrics layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Nivel de Disposicao layout */}
        <div id="biofeedback-chart-card" className="md:col-span-8 bg-[#1c1b1b] rounded-xl p-5 border border-[#5a4136]/10 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-[#e2bfb0] uppercase font-bold font-mono tracking-wider block">Biofeedback Diário</span>
            <div className="flex justify-between items-baseline mt-1">
              <h3 className="text-base font-bold text-white font-sans">Nível de Disposição Geral</h3>
              <p className="font-mono text-xs">
                <span className="text-2xl font-bold text-[#ff6b00]">8.4</span>
                <span className="text-[#e2bfb0]/60">/10</span>
              </p>
            </div>
          </div>

          <div className="h-40 w-full flex items-end gap-2.5 mt-4 font-mono text-[9px]">
            {[
              { label: 'SEG', val: 6 },
              { label: 'TER', val: 5 },
              { label: 'QUA', val: 9 },
              { label: 'QUI', val: 7 },
              { label: 'SEX', val: 10, highlight: true },
              { label: 'SAB', val: 7 },
              { label: 'DOM', val: 8 }
            ].map((day, ix) => (
              <div key={ix} className="flex-1 flex flex-col justify-end items-center h-full">
                <div 
                  style={{ height: `${day.val * 9}%` }} 
                  className={`w-full rounded-t-lg transition-all relative group ${day.highlight ? 'bg-[#ff6b00] shadow-[0_0_12px_rgba(255,107,0,0.4)]' : 'bg-[#2a2a2a] hover:bg-[#ffb693]/20'}`}
                >
                  {day.highlight && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-[#ff6b00]">HOJE</div>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-1.5 ${day.highlight ? 'text-[#ff6b00] font-extrabold' : 'text-[#e2bfb0]/60'}`}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Composicao corporal and weight mass status block */}
        <div className="md:col-span-4 bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/20 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-[#e2bfb0] uppercase font-bold font-mono tracking-wider block">Composição Corporal</span>
            <h3 className="text-base font-bold text-white font-sans mt-0.5">Massa Magra Ativa</h3>
          </div>

          <div className="py-4">
            <div className="flex items-baseline gap-1.5 font-sans leading-none">
              <span className="text-4xl font-extrabold text-[#ff6b00] font-mono leading-none">78.2</span>
              <span className="text-xs text-[#e2bfb0] font-mono">kg</span>
            </div>
            <div className="flex items-center text-[#89ceff] text-[10px] font-mono gap-1 mt-2.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1.4kg de miócitos este mês</span>
            </div>
          </div>

          <div className="w-full bg-[#1c1b1b] h-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#b7c8e1] to-[#ff6b00] rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Best Weight personal records tracker */}
        <div className="md:col-span-6 bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/20">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="text-[#ff6b00] w-5 h-5 fill-[#ff6b00]" />
            <h3 className="text-sm font-bold text-white font-sans">Capacidade de Sobrecarga (PRs)</h3>
          </div>

          <div className="space-y-2.5">
            {[
              { lift: 'Supino Reto Estabilizado', wt: '105 kg', badge: 'Novo Recorde' },
              { lift: 'Agachamento com Caixa (Box Squat)', wt: '140 kg', tag: 'Mantido' },
              { lift: 'Levantamento Terra RDL', wt: '165 kg', trend: '+5kg este mês' }
            ].map((item, ix) => (
              <div key={ix} className="bg-[#1c1b1b] p-3 rounded-lg flex items-center justify-between border border-[#353534]/50">
                <div>
                  <span className="text-[10px] text-[#e2bfb0]/65 block font-sans">{item.lift}</span>
                  <span className="text-sm font-black text-white font-mono mt-0.5 block">{item.wt}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
                {item.tag && (
                  <span className="text-[#e2bfb0]/50 text-[10px] font-mono font-semibold">{item.tag}</span>
                )}
                {item.trend && (
                  <span className="text-[#89ceff] text-[10px] font-mono font-semibold">{item.trend}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Qualitative indexes (Libido / Sleep) */}
        <div className="md:col-span-6 grid grid-cols-1 gap-4">
          {/* Quality of Sleep block */}
          <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#5a4136]/10 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3a4a5f]/20 flex items-center justify-center text-[#89ceff]">
                <Activity className="text-[#89ceff] w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-[#e2bfb0]/70 font-mono uppercase font-bold tracking-widest block">Qualidade de Sono</span>
                <p className="text-xs font-bold text-white mt-0.5 leading-none">Profundo & Regenerativo</p>
              </div>
            </div>
            
            <div className="flex gap-1">
              <div className="w-1.5 h-5 bg-[#89ceff] rounded-full"></div>
              <div className="w-1.5 h-5 bg-[#89ceff] rounded-full"></div>
              <div className="w-1.5 h-5 bg-[#89ceff] rounded-full"></div>
              <div className="w-1.5 h-5 bg-[#89ceff] rounded-full"></div>
              <div className="w-1.5 h-5 bg-[#353534] rounded-full"></div>
            </div>
          </div>

          {/* Libido and vitality block */}
          <div className="bg-[#1c1b1b] p-5 rounded-xl border border-[#5a4136]/10 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00]">
                <Zap className="text-[#ff6b00] w-5 h-5 fill-[#ff6b00]" />
              </div>
              <div>
                <span className="text-[9px] text-[#e2bfb0]/70 font-mono uppercase font-bold tracking-widest block">Libido & Vitalidade</span>
                <p className="text-xs font-bold text-white mt-0.5 leading-none">Otimizados (Nível Óptimo)</p>
              </div>
            </div>

            <div className="flex gap-1">
              <div className="w-1.5 h-5 bg-[#ff6b00] rounded-full shadow-[0_0_5px_rgba(255,107,0,0.3)]"></div>
              <div className="w-1.5 h-5 bg-[#ff6b00] rounded-full shadow-[0_0_5px_rgba(255,107,0,0.3)]"></div>
              <div className="w-1.5 h-5 bg-[#ff6b00] rounded-full shadow-[0_0_5px_rgba(255,107,0,0.3)]"></div>
              <div className="w-1.5 h-5 bg-[#ff6b00] rounded-full shadow-[0_0_5px_rgba(255,107,0,0.3)]"></div>
              <div className="w-1.5 h-5 bg-[#ff6b00] rounded-full shadow-[0_0_5px_rgba(255,107,0,0.3)]"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Historical clinical comparison bars */}
      <section className="bg-[#1c1b1b] rounded-xl p-5 border border-[#ff6b00]/10 shadow-lg shadow-black/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-[#ffb693] font-bold font-sans text-sm tracking-tight flex items-center gap-1">
              <Target className="w-4 h-4 text-[#ff6b00]" /> Comparativo Hormonal & Fisiológico
            </h3>
            <p className="text-[11px] text-[#e2bfb0]/70 mt-0.5 leading-relaxed font-sans">
              Dados preditivos reais comparados com a média geral de referência de idades cronológicas de 45 anos.
            </p>
          </div>

          <div className="flex gap-4 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b00]"></div>
              <span className="text-[#e2bfb0]/80">Você</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#353534]"></div>
              <span className="text-[#e2bfb0]/80">Média Populacional</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { metric: 'Capacidade Cardiovascular (VO2 Max)', label: '+35% vs Média', val: 85, pop: 60, color: 'bg-[#ff6b00]' },
            { metric: 'Densidade Mineral Óssea (Dexa)', label: '+12% vs Média', val: 78, pop: 70, color: 'bg-[#ff6b00]' },
            { metric: 'Flexibilidade & Mobilidade de Quadril', label: 'Em Alvo Estável', val: 65, pop: 65, color: 'bg-[#89ceff]' }
          ].map((item, ix) => (
            <div key={ix} className="space-y-1.5 font-sans">
              <div className="flex justify-between items-baseline font-mono text-[10px] uppercase font-semibold">
                <span className="text-[#e5e2e1]">{item.metric}</span>
                <span className={item.color === 'bg-[#ff6b00]' ? 'text-[#ff6b00] font-bold' : 'text-[#89ceff] font-bold'}>{item.label}</span>
              </div>
              <div className="w-full bg-[#131313] h-3.5 rounded-full overflow-hidden relative border border-[#5a4136]/10">
                <div 
                  style={{ width: `${item.pop}%` }} 
                  className="absolute inset-y-0 left-0 bg-[#353534] rounded-full"
                />
                <div 
                  style={{ width: `${item.val}%` }} 
                  className={`absolute inset-y-0 left-0 ${item.color} mix-blend-screen opacity-90 rounded-full transition-all duration-1000`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
