import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Zap, HelpCircle, Check, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  defaultName?: string;
}

export default function Onboarding({ onComplete, defaultName }: OnboardingProps) {
  const [role, setRole] = useState<'aluno' | 'personal' | 'admin'>('aluno');
  const [name, setName] = useState(defaultName || 'Roberto');

  useEffect(() => {
    if (defaultName) {
      setName(defaultName);
    }
  }, [defaultName]);
  const [gender, setGender] = useState<'homem' | 'mulher' | 'outro'>('homem');
  const [age, setAge] = useState(45);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Força Muscular', 'Equilíbrio Hormonal']);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [preferredDuration, setPreferredDuration] = useState<number>(30);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['calistenia', 'barras', 'pesos_casa']);

  const goalsList = [
    { id: 'Força Muscular', label: 'Força Muscular', desc: 'Ativação de fibras rápidas pós-40' },
    { id: 'Equilíbrio Hormonal', label: 'Equilíbrio Hormonal', desc: 'Estimulação de GH e Testosterona natural' },
    { id: 'Libido & Disposição', label: 'Libido & Disposição', desc: 'Redução de cortisol e aumento de energia' },
    { id: 'Flexibilidade', label: 'Flexibilidade & Mobilidade', desc: 'Preservação de articulações e alinhamento' },
  ];

  const restrictionsList = [
    { id: 'joelho', label: 'Sensibilidade nos Joelhos (Evitar agachamentos pesados)' },
    { id: 'coluna', label: 'Sensibilidade na Lombar/Coluna (Sobrecarga de compressão zero)' },
    { id: 'ombro', label: 'Sensibilidade nos Ombros (Movimentos aéreos controlados)' },
  ];

  const handleToggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleToggleRestriction = (id: string) => {
    if (restrictions.includes(id)) {
      setRestrictions(restrictions.filter(r => r !== id));
    } else {
      setRestrictions([...restrictions, id]);
    }
  };

  const handleSubmit = () => {
    const profile: UserProfile = {
      name: name || 'Roberto',
      gender,
      age: Number(age) || 45,
      selectedGoals,
      restrictions,
      preferredDuration,
      selectedEquipment,
      workoutsCompleted: 4,
      streakDays: 3,
      hydrationMl: 2100,
      targetHydrationMl: 3500,
      weightKg: 82.5,
      muscleMassPercent: 37.8,
      biologicalAge: 42.4,
      hrvBaseline: 68,
      role
    };
    onComplete(profile);
  };

  return (
    <div className="relative min-h-[90vh] py-8 px-4 flex flex-col justify-center max-w-xl mx-auto z-10">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYq0AfbEEcU-lYQbYjXk65mNCVOyVH4OhRDp_KudByVvj8wegP-239nS39yc01TRo6nR7-OkYWRPE4bZml8SNVI_umiiJycJQ7r0jTU-gMBRz0pcYwycLke2gQtF9uWyMIJcDohlxFd59oIsXw_o7ZW40laD1n8una10LAwdTRr3uC7sxwJ9L_y748UxhQFWGVWqDTU3dxEDThiy8HicYREZf11UCAiJeWMF6T-6C6u-vLrapvaZkECnqwTopRlbsjj6JaB9Q15rPP" 
          alt="Athlete background" 
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131313] via-transparent to-[#131313]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center relative z-10 mb-8"
      >
        <div id="vitality-logo-wrapper" className="inline-flex items-center gap-2 mb-2">
          <Zap className="text-[#ff6b00] w-6 h-6 fill-[#ff6b00]" />
          <span className="font-sans font-bold text-lg tracking-wider text-[#ffb693] uppercase">Vitality Hub</span>
        </div>
        <h2 id="main-onboarding-title" className="text-3xl font-bold font-sans tracking-tight text-white mb-2 leading-tight">
          Sua Jornada de Longevidade Começa Aqui
        </h2>
        <p className="text-sm text-[#e2bfb0] max-w-sm mx-auto leading-relaxed">
          Personalize sua experiência para atingir o pico da sua performance e vitalidade metabólica pós-40.
        </p>
      </motion.div>

      <div className="space-y-6 relative z-10">
        {/* Name input */}
        <div className="bg-[#201f1f] p-4 rounded-xl border border-[#5a4136]/30">
          <label className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest mb-2">Qual seu nome?</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome..."
            className="w-full bg-[#1c1b1b] border border-[#5a4136] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ff6b00] transition font-sans text-center md:text-left font-semibold"
          />
        </div>

        {/* Role Selection */}
        <div id="registration-role-selector" className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/30 space-y-3">
          <span className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest">Papel de Acesso</span>
          <p className="text-white font-sans text-sm font-bold">Como deseja se registrar na plataforma?</p>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('aluno')}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                role === 'aluno'
                  ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white shadow-lg'
                  : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#252424] text-[#e5e2e1]'
              }`}
            >
              <div className="p-1.5 bg-[#ff6b00]/20 rounded-md text-[#ff6b00] font-sans font-bold text-xs mt-0.5">👤</div>
              <div>
                <span className="block text-xs font-bold font-sans">Acessar como Aluno / Paciente</span>
                <span className="block text-[10px] text-[#e2bfb0]/70 mt-0.5 leading-relaxed">Acesso a treinos biomecânicos, cronômetro guiado por voz e envio de gravações para avaliação.</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('personal')}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                role === 'personal'
                  ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white shadow-lg'
                  : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#252424] text-[#e5e2e1]'
              }`}
            >
              <div className="p-1.5 bg-[#ff6b00]/20 rounded-md text-[#ff6b00] font-sans font-bold text-xs mt-0.5">🏋️</div>
              <div>
                <span className="block text-xs font-bold font-sans">Acessar como Personal Trainer {defaultName?.toLowerCase().includes('rafael') || defaultName?.toLowerCase().includes('persano') ? '(Rafael)' : ''}</span>
                <span className="block text-[10px] text-[#e2bfb0]/70 mt-0.5 leading-relaxed">Criar sequências estruturadas de treino, montar novos programas biomecânicos e revisar feedback posture.</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                role === 'admin'
                  ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white shadow-lg'
                  : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#252424] text-[#e5e2e1]'
              }`}
            >
              <div className="p-1.5 bg-[#ff6b00]/20 rounded-md text-[#ff6b00] font-sans font-bold text-xs mt-0.5">👑</div>
              <div>
                <span className="block text-xs font-bold font-sans">Acessar como Administrador Principal</span>
                <span className="block text-[10px] text-[#e2bfb0]/70 mt-0.5 leading-relaxed">Controle completo do sistema, cadastro de novos exercícios globais e moderação do mural de desafios.</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bio identity card */}
        <div className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/30">
          <span className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest mb-2">Identidade Bio</span>
          <p className="text-white font-sans text-lg font-bold mb-4">Como você se identifica?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGender('homem')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all cursor-pointer ${
                gender === 'homem'
                  ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white'
                  : 'border-[#5a4136] bg-[#1c1b1b] text-[#e5e2e1]'
              }`}
            >
              <span className="text-2xl mb-1">♂</span>
              <span className="text-xs font-semibold tracking-wider uppercase">Homem 40+</span>
            </button>
            <button
              onClick={() => setGender('mulher')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all cursor-pointer ${
                gender === 'mulher'
                  ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white'
                  : 'border-[#5a4136] bg-[#1c1b1b] text-[#e5e2e1]'
              }`}
            >
              <span className="text-2xl mb-1">♀</span>
              <span className="text-xs font-semibold tracking-wider uppercase">Mulher 40+</span>
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-[#e2bfb0] text-[11px] font-semibold uppercase mb-1">Sua Idade Atual: {age} anos</label>
            <input
              type="range"
              min="40"
              max="85"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-[#ff6b00]"
            />
            <div className="flex justify-between text-[10px] text-[#e2bfb0]/60 mt-1 font-mono">
              <span>A partir dos 40</span>
              <span>85+ anos</span>
            </div>
          </div>
        </div>

        {/* Target selection */}
        <div className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/30">
          <span className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest mb-1">Foco Principal</span>
          <p className="text-white font-sans text-lg font-bold mb-3">Qual seu objetivo de vitalidade?</p>
          
          <div className="space-y-2">
            {goalsList.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => handleToggleGoal(goal.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#ff6b00] bg-[#ff6b00]/5 text-white'
                      : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#e5e2e1]'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-semibold text-white">{goal.label}</span>
                    <span className="block text-[11px] text-[#e2bfb0]/70 mt-0.5">{goal.desc}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-[#ff6b00] border-[#ff6b00] text-black' : 'border-[#a98a7d]/50'
                  }`}>
                    {isSelected && <Check className="w-3. h-3 text-black stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Joint Restrictions */}
        <div className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/30">
          <span className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest mb-1">Preservação Articular</span>
          <p className="text-white font-sans text-lg font-bold mb-2">Possui restrições ou dores?</p>
          <p className="text-[11px] text-[#e2bfb0]/70 mb-3 leading-relaxed">
            Nossos treinos rápidos adaptam o repertório de movimentos para compensar sensibilidades locais e manter a segurança.
          </p>

          <div className="space-y-2">
            {restrictionsList.map((restriction) => {
              const isSelected = restrictions.includes(restriction.id);
              return (
                <button
                  key={restriction.id}
                  onClick={() => handleToggleRestriction(restriction.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-950/10 text-white'
                      : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#e5e2e1]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    isSelected ? 'bg-red-500 border-red-500 text-black' : 'border-[#a98a7d]/50'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium text-white">{restriction.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Home Gym Options */}
        <div className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/30">
          <span className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest mb-1">Equipamentos para Casa & Calistenia</span>
          <p className="text-white font-sans text-lg font-bold mb-2">Com o que você quer treinar?</p>
          <p className="text-[11px] text-[#e2bfb0]/70 mb-3 leading-relaxed">
            Selecione o que você tem disponível para treinar em casa. Nosso motor adaptará os exercícios de forma ideal.
          </p>

          <div className="space-y-2">
            {[
              { id: 'calistenia', label: 'Calistenia (Somente Peso Corporal)' },
              { id: 'barras', label: 'Barra Fixa (Porta ou Parede)' },
              { id: 'pesos_casa', label: 'Halteres, Kettlebells ou Pesos de Casa' }
            ].map((eq) => {
              const isSelected = selectedEquipment.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedEquipment(selectedEquipment.filter(x => x !== eq.id));
                    } else {
                      setSelectedEquipment([...selectedEquipment, eq.id]);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#ff6b00] bg-[#ff6b00]/5 text-white'
                      : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#e5e2e1]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    isSelected ? 'bg-[#ff6b00] border-[#ff6b00] text-black' : 'border-[#a98a7d]/50'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium text-white">{eq.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workout Duration Segment */}
        <div className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/30">
          <span className="block text-[#ffb693] text-xs font-semibold uppercase tracking-widest mb-1">Duração dos Treinos</span>
          <p className="text-white font-sans text-lg font-bold mb-2">Qual seu limite de tempo diário?</p>
          <p className="text-[11px] text-[#e2bfb0]/70 mb-3 leading-relaxed">
            Treinos diários recomendados de no máximo 30 minutos a 1 hora para evitar catabolismo e picos elevados de cortisol.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { mins: 15, tag: 'Ultra Rápido', desc: 'Metabólico Expresso' },
              { mins: 30, tag: 'Recomendado', desc: 'Equilíbrio Ativo' },
              { mins: 45, tag: 'Completo', desc: 'Hipertrofia Estimulada' },
              { mins: 60, tag: 'Completo +', desc: 'Resiliência Cardiovascular' }
            ].map((d) => {
              const isSelected = preferredDuration === d.mins;
              return (
                <button
                  key={d.mins}
                  onClick={() => setPreferredDuration(d.mins)}
                  className={`flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white'
                      : 'border-[#5a4136]/50 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#e5e2e1]'
                  }`}
                >
                  <span className="text-xs font-bold text-white">{d.mins} Minutos</span>
                  <span className="text-[9px] text-[#ffb693] font-mono uppercase font-bold mt-1">{d.tag}</span>
                  <span className="text-[10px] text-[#e2bfb0]/60 mt-0.5 leading-tight">{d.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#ff6b00] text-[#131313] hover:bg-[#ff8c33] active:scale-[0.98] transition-all font-bold h-12 rounded-full shadow-lg shadow-[#ff6b00]/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
          >
            Iniciar Diagnóstico de Longevidade
            <span className="text-lg">➔</span>
          </button>
          
          <p className="mt-4 text-[10px] text-center text-[#e2bfb0] opacity-50">
            Ao continuar, você concorda com nossos Termos de Longevidade Ativa & Ciência Preventiva.
          </p>
        </div>
      </div>
    </div>
  );
}
