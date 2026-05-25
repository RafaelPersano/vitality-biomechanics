import React, { useState } from 'react';
import { Pill, Sun, Moon, Dumbbell, ShieldCheck, CheckCircle2, Circle, GraduationCap, X } from 'lucide-react';
import { ARTICLES } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function LongevityHub() {
  const [testosteroneChecked, setTestosteroneChecked] = useState(true);
  const [hghChecked, setHghChecked] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(null);

  const supplementStack = [
    { name: 'Vitamina D3', value: '10.000 UI', timing: 'Diário c/ Gorduras', icon: Sun, color: 'text-amber-400 bg-amber-400/10' },
    { name: 'Glicinato de Magnésio', value: '400mg', timing: '60 min Antes de Dormir', icon: Moon, color: 'text-indigo-400 bg-indigo-400/10' },
    { name: 'Creatina Monohidratada', value: '5g', timing: 'Pós-Treino', icon: Dumbbell, color: 'text-[#ff6b00] bg-[#ff6b00]/10' },
    { name: 'Ashwagandha KSM-66', value: '600mg', timing: 'Controle de Cortisol', icon: ShieldCheck, color: 'text-cyan-400 bg-cyan-400/10' }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Biological optimization score hero info */}
      <section className="bg-[#1c1b1b] rounded-xl p-5 border border-[#5a4136]/20 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] text-[#ff6b00] uppercase font-bold tracking-widest font-mono">Status do Protocolo</p>
          <h2 className="text-xl font-bold font-sans text-white mt-1">Otimização de Idade Biológica</h2>
          
          <div className="flex items-baseline gap-2 mt-4 font-sans">
            <span className="text-4xl font-extrabold text-[#ff6b00] font-mono leading-none">42.4</span>
            <span className="text-xs font-semibold text-[#89ceff]">vs. 48 Idade Cronológica</span>
          </div>
          
          <div className="w-full h-2 bg-[#353534] rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#89ceff] to-[#ff6b00] rounded-full w-[88%]"></div>
          </div>
          <p className="text-[10px] text-[#e2bfb0]/70 mt-2 font-mono">Sua composição molecular e VFC projetam uma saúde residual ativa comparável a 5.6 anos mais jovem.</p>
        </div>
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-[#ff6b00]/10 blur-[90px] rounded-full"></div>
      </section>

      {/* Bento Layout row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Support Reposition Cycle */}
        <div className="md:col-span-8 bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Pill className="text-[#ff6b00] w-5 h-5" />
              <h3 className="text-sm font-bold text-white font-sans">Suporte Circadiano & Ciclos</h3>
            </div>
            <span className="text-[9px] font-mono font-bold bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] px-2 py-0.5 rounded-full">Ativo</span>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${testosteroneChecked ? 'bg-[#1c1b1b] border border-[#5a4136]/30 opacity-100' : 'bg-[#1c1b1b]/55 opacity-60'}`}>
              <div>
                <span className="block text-[10px] text-[#89ceff] font-bold font-mono">CICLO MATINAL</span>
                <span className="font-bold text-white block mt-0.5">Cipionato de Testosterona (20mg)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-[#e2bfb0]/60 italic">Subcutâneo</span>
                <input 
                  type="checkbox" 
                  checked={testosteroneChecked}
                  onChange={(e) => setTestosteroneChecked(e.target.checked)}
                  className="rounded text-[#ff6b00] focus:ring-[#ff6b00] bg-[#131313] border-[#5a4136] w-4.5 h-4.5"
                />
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${hghChecked ? 'bg-[#1c1b1b] border border-[#5a4136]/30 opacity-100' : 'bg-[#1c1b1b]/55 opacity-60'}`}>
              <div>
                <span className="block text-[10px] text-indigo-400 font-bold font-mono">CICLO NOTURNO REFRIGERADO</span>
                <span className="font-bold text-white block mt-0.5">Fragmento HGH 176-191</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-[#e2bfb0]/60 italic">Peptídeo</span>
                <input 
                  type="checkbox" 
                  checked={hghChecked}
                  onChange={(e) => setHghChecked(e.target.checked)}
                  className="rounded text-[#ff6b00] focus:ring-[#ff6b00] bg-[#131313] border-[#5a4136] w-4.5 h-4.5"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#5a4136]/10 flex items-center gap-2 text-[10px] text-[#e2bfb0]/60 font-mono">
            <span>📅 Próximos exames de controle: 24 de Outubro - Labs Vitality Pro.</span>
          </div>
        </div>

        {/* Anti inflammatory meal guide */}
        <div className="md:col-span-4 bg-[#1c1b1b] rounded-xl overflow-hidden border border-[#5a4136]/10 flex flex-col justify-between">
          <div className="h-28 w-full relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1_oLjyz-ojyUP6gG6fVH8r2vhBYjwV-5Gk2y1VOArlNDn-6Tn4H5Aepi6y8wwKUdn0khBbVxz82wtmRGhPY0WN36BjMu5JqefVGVGBVA4cDEliw0jAov_1xsbvODgzuCDjLZR1bgbjkdkFII09ZTSnkzEqTzX6LZ8GvrcZ4Nz4zyVbp82UihYp_O69LKgVkMwJJsfIEddXr11E0HWWcTUQC8KQPZrgfGrevU1Il_CTZcaxp1HKj9Lz4lgRF4JztFhnnFwH5hI8pYF" 
              alt="Mediterranean diet food" 
              className="w-full h-full object-cover filter contrast-125 brightness-90 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] via-[#1c1b1b]/30 to-transparent"></div>
          </div>
          <div className="p-4 flex-grow">
            <h4 className="text-xs font-bold text-white font-sans leading-none">Dieta Anti-Inflamatória</h4>
            <p className="text-[10px] text-[#e2bfb0]/70 mt-1">Foco: Neutralização de Oxidação Mitocondrial</p>
            
            <ul className="space-y-1.5 mt-3 text-[11px] text-[#e5e2e1]/90">
              <li className="flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b00]" /> Açúcares Processados Zero
              </li>
              <li className="flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b00]" /> Ingestão Elevada de Ômega-3
              </li>
              <li className="flex items-center gap-1.5 font-sans text-[#e2bfb0]/55">
                <Circle className="w-3.5 h-3.5 stroke-[2.5]" /> Jejum Intermitente Adaptado (16/8)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supplements stack display */}
      <section className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/10">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="text-[#89ceff] w-5 h-5" />
          <h3 className="text-sm font-bold text-white font-sans">Suplementos de Performance & Atividade</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {supplementStack.map((sup, ix) => (
            <div key={ix} className="bg-[#1c1b1b] p-3 rounded-lg border border-[#353534] hover:border-[#ff6b00]/30 transition flex flex-col justify-between items-center text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${sup.color}`}>
                <sup.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-[#e2bfb0]/75 tracking-tight uppercase leading-none">{sup.name}</span>
              <span className="text-sm font-black font-mono text-[#ffb693] mt-1.5 block">{sup.value}</span>
              <span className="text-[9px] text-[#e2bfb0]/55 font-sans mt-0.5 leading-none block">{sup.timing}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical papers knowledge engine display */}
      <section className="space-y-3">
        <div className="flex justify-between items-baseline mb-1">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="text-[#ff6b00] w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb693]">Knowledge Engine</h3>
          </div>
          <span className="text-[10px] text-[#e2bfb0]/65 font-mono">Papers Científicos Ativos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARTICLES.map((article) => (
            <div 
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-[#1c1b1b] rounded-xl border border-[#5a4136]/20 overflow-hidden cursor-pointer hover:border-[#ff6b00]/40 hover:scale-[1.01] active:scale-[0.99] transition duration-200 shadow-xl"
            >
              <div className="h-32 relative">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover filter grayscale contrast-125 hover:scale-105 duration-500 transition-all"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 border border-[#5a4136]/30 text-[9px] font-mono font-bold text-[#ffb693]">
                  {article.ageLevel}
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <span className="text-[9px] font-bold font-mono text-[#ff6b00] uppercase tracking-wide">{article.category}</span>
                <h5 className="text-[11px] font-bold leading-snug line-clamp-2 text-white">{article.title}</h5>
                <p className="text-[10px] text-[#e2bfb0]/70 line-clamp-3 leading-relaxed mt-1">{article.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reader overlay portal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#131313]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#201f1f] rounded-2xl border border-[#5a4136]/40 max-w-xl w-full p-6 space-y-4 relative shadow-2xl z-50 my-8"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#1a1a1a] text-[#e2bfb0] transition cursor-pointer"
                aria-label="Close reader"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-6 pt-2">
                <span className="text-[10px] font-bold font-mono text-[#ff6b00] uppercase tracking-widest">{selectedArticle.category}</span>
                <h3 className="text-xl font-bold font-sans text-white leading-tight tracking-tight">{selectedArticle.title}</h3>
                <span className="inline-block px-2 py-0.5 rounded-full bg-black/40 border border-[#5a4136]/30 text-[9px] font-mono font-bold text-[#ffb693] mt-1">
                  {selectedArticle.ageLevel}
                </span>
              </div>

              {/* Cover cover */}
              <div className="aspect-video w-full rounded-xl overflow-hidden relative">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover filter grayscale contrast-125"
                />
              </div>

              {/* Text document */}
              <div className="text-xs text-[#e5e2e1] leading-relaxed space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar font-sans text-justify">
                <p className="font-semibold text-[#ffb693]">{selectedArticle.summary}</p>
                <p className="opacity-90">{selectedArticle.content}</p>
                <p className="opacity-90 pt-1 border-t border-[#5a4136]/10 text-[10px] italic text-[#e2bfb0]/70 font-mono">
                  Fonte: Department of Molecular Longevity & Clinical Performance. Harvard Medical Research (Adapted).
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="bg-[#ff6b00] text-black font-sans font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                >
                  Concluir Leitura
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
