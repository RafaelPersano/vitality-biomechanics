import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Bolt, Award, ArrowRight,
  TrendingUp, Activity, Sparkles, Hourglass
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResumoTreinoProps {
  avgRpe: number;
  completedSeconds: number;
  onGoBack: () => void;
}

export default function ResumoTreino({ avgRpe, completedSeconds, onGoBack }: ResumoTreinoProps) {
  const [metabolicImpact, setMetabolicImpact] = useState(0);

  // Animate the metabolic progress counter on mount!
  useEffect(() => {
    let current = 0;
    const target = 94; // Premium metabolic impact score
    const interval = setInterval(() => {
      if (current >= target) {
        clearInterval(interval);
        setMetabolicImpact(target);
      } else {
        current += 2;
        setMetabolicImpact(Math.min(current, target));
      }
    }, 15);
    return () => clearInterval(interval);
  }, []);

  // Format completed time string (m:s)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder > 0 ? remainder + 's' : ''}`;
  };

  // Convert RPE rating to verbal feedback descriptor
  const getRpeDescriptor = (rpe: number) => {
    if (rpe >= 10) return { title: 'Máximo', subtitle: 'Exaustão Total' };
    if (rpe >= 9) return { title: 'Vigoroso', subtitle: 'Limiar Anaeróbico' };
    if (rpe >= 8) return { title: 'Vigoroso', subtitle: 'Esforço Controlado' };
    if (rpe >= 7) return { title: 'Moderado', subtitle: 'Confortável Ativo' };
    return { title: 'Leve', subtitle: 'Estímulo de Recuperação' };
  };

  const rpeInfo = getRpeDescriptor(avgRpe);

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between max-w-xl mx-auto z-10 pb-8 pt-4">
      
      {/* Background hero design elements */}
      <div className="absolute inset-x-0 top-0 h-[280px] overflow-hidden rounded-2xl opacity-20 pointer-events-none z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGqQG6L53WTYRBebkhMT6H1Q_kNGrL2vGv6tFKjNsE3lr5thN5vc_YUmFOB031W2DFTC3X90abX4bNHdoXGadJGC7GEPhbx6DW2y3nu_Pqt0E0pL2NEN34vQR8JimeqLndpXrmPohL6EPe68yvPMXOvENjV0CBH3RIEO2dYrbNEXrv_-vNqDmUtHCsBkPRIBpZxuY_7ee1KKog3FZ4O4HOoKDp60yMbFGEgryqe4807GcKdcKfX8Tp0DunBa898TSUSWEh_N3NHr8T" 
          alt="Athlete resting" 
          className="w-full h-full object-cover filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/10 to-[#131313]"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header Celebration badge */}
        <div className="text-center pt-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-12 h-12 bg-[#ff6b00]/10 rounded-full mb-3"
          >
            <Sparkles className="text-[#ff6b00] w-6 h-6" />
          </motion.div>
          <p className="text-xs text-[#ffb693] uppercase font-bold tracking-widest font-mono">Treino Finalizado</p>
          <h2 id="workout-celebration-title" className="text-3xl font-black font-sans text-white tracking-tight leading-none mt-1">Treino Concluído!</h2>
          <p className="text-xs text-[#e2bfb0] mt-2 max-w-xs mx-auto leading-relaxed">
            Sua precisão biomecânica hoje pavimentou mais um passo crucial em direção à sua longevidade celular funcional.
          </p>
        </div>

        {/* Bento grid visual cards */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Metabolic impact card */}
          <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#5a4136]/20 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-[#e2bfb0] uppercase font-bold tracking-wider font-sans">Impacto Metabólico</span>
              <Bolt className="text-[#ffb693] w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-sans">
                <span className="text-4xl font-extrabold text-[#ffb693] font-mono leading-none">{metabolicImpact}</span>
                <span className="text-xs text-[#e2bfb0]">%</span>
              </div>
              <p className="text-[10px] text-[#e2bfb0]/70 leading-relaxed mt-2">
                Eficiência otimizada na quebra de depósitos lipídicos e estímulo de densidade mitocondrial ativa em 15 minutos.
              </p>
            </div>
          </div>

          {/* Hormonal stimulation estimation */}
          <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#5a4136]/20 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-[#e2bfb0] uppercase font-bold tracking-wider font-sans">Estimativa Hormonal</span>
              <Activity className="text-[#89ceff] w-4 h-4 font-bold" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline font-mono text-[10px]">
                <span className="text-[#e2bfb0]/80">Eixo Testo / GH</span>
                <span className="text-[#ff6b00] font-bold">+12%</span>
              </div>
              <div className="w-full bg-[#353534] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#89ceff] to-[#ff6b00] rounded-full w-[85%]"></div>
              </div>
              <p className="text-[9px] text-[#e2bfb0]/60 leading-normal">
                Recrutamento de fibras Tipo II ativou picos endócrinos anabólicos saudáveis.
              </p>
            </div>
          </div>

          {/* Effort Summary Load Tracker */}
          <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#5a4136]/20 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] text-[#e2bfb0] uppercase font-bold tracking-wider block mb-1">Volume Total Estimado</span>
            <div>
              <span className="text-2xl font-mono font-bold text-white tracking-tight">4.850<span className="text-xs font-normal text-[#e2bfb0]/65 ml-0.5 font-sans">kg</span></span>
              <div className="flex items-center text-[#ff6b00] font-mono text-[9px] gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+8% acima da sua média</span>
              </div>
            </div>
          </div>

          {/* Custom RPE tracker */}
          <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#5a4136]/20 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] text-[#e2bfb0] uppercase font-bold tracking-wider block mb-1.5">Percepção RPE Ativa</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00] text-sm font-extrabold font-mono border border-[#ff6b00]/20">
                {avgRpe}
              </div>
              <div>
                <span className="text-xs font-bold font-sans text-white block leading-none">{rpeInfo.title}</span>
                <span className="text-[9px] text-[#e2bfb0] font-sans block mt-0.5">{rpeInfo.subtitle}</span>
              </div>
            </div>
          </div>

          {/* Premium Longevity score multiplier */}
          <div className="col-span-2 bg-[#ff6b00] text-[#131313] p-4 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl">
            {/* Hourglass graphic background watermark */}
            <div className="absolute right-2 -bottom-1 text-[#131313] opacity-5 pointer-events-none">
              <Hourglass className="w-24 h-24 stroke-[3]" />
            </div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-75">Progresso de Longevidade</span>
                <h3 className="text-2xl font-sans font-black tracking-tighter mt-1">+1 Dia Ativo</h3>
                <p className="text-[11px] font-sans font-semibold mt-1 opacity-90 leading-snug max-w-sm">
                  Adicionado com sucesso ao seu plano estratégico "20 Anos de Performance Funcional".
                </p>
              </div>
              <div className="bg-[#131313]/10 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-[#131313]/10">
                Reserva: 42%
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Navigation Reset CTA inside a global padded block */}
      <div className="relative z-10 pt-2 pb-14 md:pb-2">
        <button
          onClick={onGoBack}
          className="w-full bg-[#ff6b00] text-black font-sans font-bold h-12 rounded-full hover:bg-[#ff8c33] active:scale-[0.98] transition shadow-lg shadow-[#ff6b00]/20 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
        >
          Retornar ao Cockpit Dashboard
          <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
        </button>
      </div>

    </div>
  );
}
