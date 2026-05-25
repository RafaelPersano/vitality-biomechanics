import React, { useState, useEffect } from 'react';
import { WorkoutSession, UserProfile, Exercise } from '../types';
import { PRESET_WORKOUTS, EXERCISE_DATABASE } from '../data';
import { 
  Search, Flame, Clock, PlayCircle, Eye, Edit2, 
  CheckCircle2, AlertTriangle, Save, Youtube, ShieldCheck,
  ChevronDown, ChevronUp, Plus, Dumbbell, Sparkles, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface LibraryProps {
  profile: UserProfile;
  onUpdateProfile: (newData: Partial<UserProfile>) => Promise<void>;
  onSelectWorkout: (workout: WorkoutSession) => void;
}

export default function Library({ profile, onUpdateProfile, onSelectWorkout }: LibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'routines' | 'mechanics'>('routines');
  const [activeCategory, setActiveCategory] = useState<'all' | 'strength' | 'cardio' | 'mobility'>('all');
  
  // Real-time Firestore resources
  const [dbSequences, setDbSequences] = useState<any[]>([]);
  const [dbGlobalExercises, setDbGlobalExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    try {
      const unsubSeq = onSnapshot(collection(db, 'sequences'), (snap) => {
        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDbSequences(list);
      });

      const unsubEx = onSnapshot(collection(db, 'global_exercises'), (snap) => {
        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Exercise));
        setDbGlobalExercises(list);
      });

      return () => {
        unsubSeq();
        unsubEx();
      };
    } catch (e) {
      console.warn("Firestore Library links offline:", e);
    }
  }, []);

  // Custom Exercises state & Editor modes
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Merge default exercises with user's customized ones saved in Firestore
  const customExercises = profile.customExercises || [];
  const mergedExercisePool = [...EXERCISE_DATABASE, ...dbGlobalExercises].map(baseEx => {
    const custom = customExercises.find(c => c.id === baseEx.id);
    return custom ? { ...baseEx, ...custom } : baseEx;
  });

  // Include any extra unique custom exercises user created
  const uniqueCustoms = customExercises.filter(
    c => !EXERCISE_DATABASE.some(baseEx => baseEx.id === c.id) && !dbGlobalExercises.some(dbEx => dbEx.id === c.id)
  );
  const allExercises = [...mergedExercisePool, ...uniqueCustoms];

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'strength', label: 'Força Muscular' },
    { id: 'cardio', label: 'Cardio / HIIT' },
    { id: 'mobility', label: 'Mobilidade 40+' },
  ];

  // Helper to construct embed URLs
  const getYouTubeEmbedUrl = (url: string = ''): string => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts.length > 1) {
        videoId = parts[1].split('&')[0];
      }
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0];
      }
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Filter exercises based on search term & category
  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.targetJoints && exercise.targetJoints.some(j => j.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = activeCategory === 'all' || exercise.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Convert dbSequences to standard WorkoutSession format
  const dbWorkoutSessions: WorkoutSession[] = dbSequences.map(seq => ({
    id: seq.id,
    title: seq.title,
    description: seq.description,
    category: seq.category || 'combined',
    totalDuration: seq.totalDuration || 15,
    estimatedCalories: (seq.totalDuration || 15) * 6,
    exercises: seq.exercises || [],
    personalTrainerName: seq.personalTrainerName || 'Rafael Persano'
  } as any));

  const allWorkouts = [...dbWorkoutSessions, ...PRESET_WORKOUTS];

  // Filter workout sessions
  const filteredWorkouts = allWorkouts.filter((workout) => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || workout.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredWorkout = allWorkouts.find(w => w.id === 'routine_longevidade_1') || allWorkouts[0] || PRESET_WORKOUTS[0];

  // Open editor with an exercise
  const handleOpenEdit = (exercise: Exercise) => {
    setEditingExercise({
      ...exercise,
      steps: exercise.steps ? [...exercise.steps] : [],
      donts: exercise.donts ? [...exercise.donts] : [],
      targetJoints: exercise.targetJoints ? [...exercise.targetJoints] : []
    });
  };

  // Handle saving the custom exercise back to UserProfile in Firestore
  const handleSaveExercise = async () => {
    if (!editingExercise) return;
    setIsSaving(true);
    
    try {
      // Clean and structure updated items
      const updatedExercise: Exercise = {
        ...editingExercise,
        // sanitize blank entries
        steps: editingExercise.steps?.filter(s => s.trim() !== '') || [],
        donts: editingExercise.donts?.filter(d => d.trim() !== '') || [],
        targetJoints: editingExercise.targetJoints?.filter(j => j.trim() !== '') || []
      };

      const currentCustoms = [...(profile.customExercises || [])];
      const existingIdx = currentCustoms.findIndex(c => c.id === updatedExercise.id);

      if (existingIdx > -1) {
        currentCustoms[existingIdx] = updatedExercise;
      } else {
        currentCustoms.push(updatedExercise);
      }

      await onUpdateProfile({
        customExercises: currentCustoms
      });

      setEditingExercise(null);
    } catch (e) {
      console.error("Erro ao salvar exercício customizado na nuvem:", e);
      alert("Erro ao salvar dados no Firestore. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-32 max-w-4xl mx-auto selection:bg-[#ff6b00]/30">
      
      {/* Tab Switcher: Workout Routines vs Pinterest Mechanics Board */}
      <div className="flex bg-[#1c1b1b] p-1.5 rounded-xl border border-[#5a4136]/20 max-w-md mx-auto">
        <button
          onClick={() => {
            setActiveTab('routines');
            setSearchTerm('');
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'routines'
              ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
              : 'text-[#e2bfb0]/70 hover:text-white hover:bg-[#201f1f]'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Rotinas de Treino
        </button>
        <button
          onClick={() => {
            setActiveTab('mechanics');
            setSearchTerm('');
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'mechanics'
              ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
              : 'text-[#e2bfb0]/70 hover:text-white hover:bg-[#201f1f]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Fichas de Biomecânica
        </button>
      </div>

      {/* Modern Pinterest description header */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          {activeTab === 'routines' ? 'Sessões de Estimulação Rápida' : 'Manual de Biomecânica Preventiva'}
        </h2>
        <p className="text-xs text-[#e2bfb0]/70 leading-relaxed">
          {activeTab === 'routines' 
            ? 'Treinos adaptativos baseados na sua integridade clínica que otimizam longevidade em fatias precisas de 15 minutos.'
            : 'Explore, customize e salve no banco mecânicas inspiradas em fluxos ilustrativos de postura, protegendo as articulações em tempo real.'}
        </p>
      </div>

      {/* Dynamic Search & Filters bar */}
      <section className="space-y-3.5">
        <div className="relative group max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e2bfb0]/60 w-4.5 h-4.5 group-focus-within:text-[#ff6b00] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'routines' ? "Procurar treinos, focos..." : "Procurar exercícios, manguito, coluna..."}
            className="w-full h-11 bg-[#1a1a1a] border border-[#5a4136]/40 rounded-xl pl-11 pr-4 text-xs focus:outline-none focus:border-[#ff6b00] transition-all text-white placeholder-[#e2bfb0]/40"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#ffb693] justify-center">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-sans text-xs font-bold cursor-pointer transition ${
                activeCategory === c.id
                  ? 'bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30'
                  : 'bg-[#201f1f] border border-transparent text-[#e2bfb0] hover:bg-[#2c2a2a]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ROUTINES LIST TAB */}
      {activeTab === 'routines' && (
        <div className="space-y-6">
          {/* Featured Workout Card */}
          {!searchTerm && activeCategory === 'all' && (
            <section className="mt-2">
              <div 
                onClick={() => onSelectWorkout(featuredWorkout)}
                className="relative w-full h-56 rounded-xl overflow-hidden cursor-pointer shadow-xl border border-[#5a4136]/20 group"
              >
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4NaJxVYZHHKwLhJTICsGasqL3FqnTQeh9P5c2ubMW3SsgrPIOouxsV1hyyxgMosUiKguGXVPGXZa3Si7FuEQLUW0ur-GANmE-J-UMJh5YHFOOjl0vA_mZbKffN8wP9v0PeHn3PIf_K7jzJe2_e8i7XB47i83cVLun7m1S_Ts8CZ0FkPWiqGXEhbVmJzezzCT6F24HkgEUnDFfWPilVJJ3m6WcUMIG7wAMwOUXEzwjCuutlXfdo8_YICc4NCAjDqIfFjXS6qlfGgK5" 
                  alt="Metabolic high density" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-103 duration-700 transition-all filter brightness-90 grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <div className="flex gap-2 mb-2 font-mono text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30 uppercase tracking-widest">Intensidade</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ff6b00] text-black uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> RECOMENDADO</span>
                  </div>
                  <h3 className="text-lg font-extrabold font-sans text-white mb-1 leading-tight">
                    {featuredWorkout.title}
                  </h3>
                  <p className="text-xs text-[#e2bfb0]/70 line-clamp-2 max-w-xl mb-3 leading-relaxed">
                    {featuredWorkout.description}
                  </p>
                  <div className="flex items-center gap-4 text-[#e2bfb0] font-mono text-xs">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#ff6b00]" /> {featuredWorkout.totalDuration} Minutos</span>
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-[#ff6b00]" /> {featuredWorkout.estimatedCalories} kcal</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Grid Routines list */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693]">
              Rotinas Estruturadas Disponíveis
            </h4>

            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-12 text-[#e2bfb0]/50 text-xs bg-[#1a1a1a] rounded-xl border border-[#5a4136]/10">
                Nenhuma rotina foi encontrada com esses termos.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredWorkouts.map((workout) => (
                  <div 
                    key={workout.id}
                    onClick={() => onSelectWorkout(workout)}
                    className="bg-[#201f1f] p-4 rounded-xl border border-[#5a4136]/15 hover:border-[#ff6b00]/30 transition group cursor-pointer flex gap-4"
                  >
                    {/* Micro cover */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={
                          workout.category === 'strength' 
                            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRu5RYvb4iCdIyGIqVxsSILTYjN29vewSrXHrcsS3Ug50oiUWMEy9f0dWRm49_VHyyd-GP3itXVRu4T1CJ98xYqqlRFGZ5F3vNCONtk-q4woRTDPTb6hgxYMJdqzu8BIFdMlCzr6_-ajt0MFRZsDv7nsZBKYZ9juBtAubyWUMezyB5G6-Uaif9aWbl9cuZYQTHgdKyfwLrjam62IegU60eqd8gtsjBIgdL3soi16MMEMHgDZY51ACOoERBAJdWaYKVR7_cdVM2wgvF'
                            : workout.category === 'cardio'
                            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5rAO1rA18rFeHIkg_vxO-KigU1s1CtsxvgnRby-xS49qm_kMRa4UV1dr4pK5JftkMxfuXGut94snQ_iICV3merZYImtk2_jBlcE1TPqCCtV9n5D_8aJry0VkHEoGcNiRdoh-07lATwapY0aYc4APFTDlz0w8isorwGSf3WSa8B0gZELbQskGyrwFGFuMr4vUWaw8waioL_ac96YMQTii_tSzamVyq5u1NPZzenKM-auomL_LkduiCEamYfywAeQlvRe1IKyVozL3'
                            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr89Zu8O5-HjiM7xY29vFRivzJwRyb6szVG9fx6kvKZ5nlCQoVaFraEUsfXG0jyr7JoD8f1DjU0eiuLy2ciK0GmnVdmHiVg8voZU4wypG3XNFIxGNR6t5rQHzJ_Vwyg5XagqIcxevxAXQ4_Qm1SGWxlxkkwYY-mqi89D6WsELHQJ_OAGTA7IfCtzSb94VBV_VphmZ3jfY5oQQ8MQi7I5GrabJ9pGC85mndQJ8aXrbK_aogCsMxz_OYHGDBMGRwMO_0FQhksiTfZFiG'
                        } 
                        alt={workout.title} 
                        className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 duration-300 transition-all opacity-85"
                      />
                      <div className="absolute inset-0 bg-[#131313]/30 flex items-center justify-center">
                        <PlayCircle className="text-white w-6 h-6 stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Cover text */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="font-extrabold text-white text-xs font-sans group-hover:text-[#ffb693] transition-colors flex flex-wrap items-center gap-1.5">
                          <span>{workout.title}</span>
                          {(workout as any).personalTrainerName && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold tracking-wider text-[#ff6b00] uppercase bg-orange-600/10 border border-orange-500/25 px-1.5 py-0.5 rounded">
                              ✍️ Personal: {(workout as any).personalTrainerName}
                            </span>
                          )}
                        </h5>
                        <p className="text-[10px] text-[#e2bfb0]/70 font-sans line-clamp-2 leading-relaxed mt-0.5">
                          {workout.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#5a4136]/10 font-mono text-[9px] text-[#e2bfb0]/55">
                        <div className="flex gap-2">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-[#ff6b00]" /> {workout.totalDuration} min</span>
                          <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-[#ff6b00]" /> {workout.estimatedCalories} kcal</span>
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded uppercase text-[8px] tracking-tight bg-[#2a2a2a] text-[#ffb693] font-semibold border border-[#5a4136]/30">
                          {workout.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* PINTEREST BIOMECHANICS BOARD TAB */}
      {activeTab === 'mechanics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693]">
              {filteredExercises.length} Fichas de Alinhamento Ativo
            </h4>
            <button
              onClick={() => handleOpenEdit({
                id: `ex_custom_${Date.now()}`,
                name: 'Novo Exercício Postural',
                category: 'strength',
                duration: 45,
                description: 'Insira descrição anatômica explicativa da execução ideal.',
                formTip: 'Dica motivadora de respiração ou alinhamento corretivo.',
                adaptedFor: 'Proteção articular',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr89Zu8O5-HjiM7xY29vFRivzJwRyb6szVG9fx6kvKZ5nlCQoVaFraEUsfXG0jyr7JoD8f1DjU0eiuLy2ciK0GmnVdmHiVg8voZU4wypG3XNFIxGNR6t5rQHzJ_Vwyg5XagqIcxevxAXQ4_Qm1SGWxlxkkwYY-mqi89D6WsELHQJ_OAGTA7IfCtzSb94VBV_VphmZ3jfY5oQQ8MQi7I5GrabJ9pGC85mndQJ8aXrbK_aogCsMxz_OYHGDBMGRwMO_0FQhksiTfZFiG',
                steps: ['Passo 1 de posicionamento anatômico'],
                donts: ['Evitar erro comum prejudicial'],
                targetJoints: ['Proteção Articular'],
                schematicId: 'squat'
              })}
              className="px-3.5 py-1.5 text-[10px] font-mono font-bold bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00] rounded-lg hover:bg-[#ff6b00] hover:text-black transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Criar Exercício Customizado
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredExercises.map((ex) => {
              const isExpanded = expandedCardId === ex.id;
              
              return (
                <div 
                  key={ex.id}
                  className="bg-[#1c1b1b] border border-[#5a4136]/20 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#ff6b00]/20 transition-all hover:shadow-[#131110] hover:shadow-lg relative"
                >
                  <div>
                    {/* Pinterest Visual Preview */}
                    <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden group">
                      <img 
                        src={ex.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuC5rAO1rA18rFeHIkg_vxO-KigU1s1CtsxvgnRby-xS49qm_kMRa4UV1dr4pK5JftkMxfuXGut94snQ_iICV3merZYImtk2_jBlcE1TPqCCtV9n5D_8aJry0VkHEoGcNiRdoh-07lATwapY0aYc4APFTDlz0w8isorwGSf3WSa8B0gZELbQskGyrwFGFuMr4vUWaw8waioL_ac96YMQTii_tSzamVyq5u1NPZzenKM-auomL_LkduiCEqamYfywAeQlvRe1IKyVozL3"} 
                        alt={ex.name} 
                        className="w-full h-full object-cover opacity-75 grayscale contrast-125 filter group-hover:scale-102 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] to-transparent"></div>
                      
                      {/* Video Quick Play Badge overlay (loads inside app iframe!) */}
                      {ex.videoUrl && (
                        <button
                          onClick={() => setVideoModalUrl(ex.videoUrl || null)}
                          className="absolute top-3 right-3 p-2 rounded-full cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse hover:scale-105 duration-200"
                          title="Assistir tutorial em vídeo integrado"
                        >
                          <Youtube className="w-4 h-4 fill-white stroke-none" />
                        </button>
                      )}

                      <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00] text-[8px] tracking-wider uppercase font-mono rounded">
                        {ex.category}
                      </span>
                    </div>

                    {/* Pinterest Layout Typography */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-extrabold text-white text-sm tracking-tight leading-tight uppercase font-sans">
                          {ex.name}
                        </h5>
                        <button
                          onClick={() => handleOpenEdit(ex)}
                          className="p-1.5 rounded bg-neutral-800 hover:bg-[#ff6b00]/10 text-[#e2bfb0] hover:text-[#ff6b00] transition cursor-pointer"
                          title="Reformular / Reescrever especificações deste exercício"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#e2bfb0]/70 leading-relaxed font-sans line-clamp-2">
                        {ex.description}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-orange-400 font-medium">
                        <span className="font-mono bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 rounded text-[9px] uppercase">
                          Adaptado Para: {ex.adaptedFor}
                        </span>
                      </div>

                      {/* POSTURAL SAFETY TABLE (pinterest style split mechanics) */}
                      <div className="mt-4 bg-[#131212] rounded-lg border border-[#5a4136]/10 p-3.5 space-y-3.5 text-[11px]">
                        
                        {/* Correct posture column list */}
                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-green-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> ✔️ Execução Correta
                          </span>
                          <ul className="list-none space-y-1 pl-1 text-[#e2bfb0]/90">
                            {ex.steps && ex.steps.slice(0, 3).map((st, i) => (
                              <li key={i} className="flex gap-1.5 items-start">
                                <span className="text-green-400 font-mono font-bold">•</span>
                                <span className="leading-normal">{st}</span>
                              </li>
                            ))}
                            {ex.steps && ex.steps.length > 3 && !isExpanded && (
                              <li className="text-[9px] text-[#ff6b00] font-mono hover:underline cursor-pointer" onClick={() => setExpandedCardId(ex.id)}>
                                + {ex.steps.length - 3} mais instruções biomecânicas...
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Critical error list */}
                        <div className="space-y-1.5 border-t border-[#5a4136]/10 pt-2.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-red-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> ❌ Evitar / Proibido
                          </span>
                          <ul className="list-none space-y-1 pl-1 text-[#e2bfb0]/90">
                            {ex.donts && ex.donts.slice(0, 2).map((dn, i) => (
                              <li key={i} className="flex gap-1.5 items-start">
                                <span className="text-red-400 font-mono font-bold">•</span>
                                <span className="leading-normal">{dn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Expanding full info container */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-3 border-t border-[#5a4136]/10 pt-2.5"
                            >
                              {ex.steps && ex.steps.length > 3 && (
                                <div className="space-y-1">
                                  <span className="text-[#ffb693] text-[9px] uppercase font-mono">Mais Passos:</span>
                                  <ul className="space-y-1 pl-1 text-[#e2bfb0]/90">
                                    {ex.steps.slice(3).map((st, i) => (
                                      <li key={i} className="flex gap-1.5 items-start">
                                        <span className="text-green-400 font-mono">•</span>
                                        <span>{st}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {ex.targetJoints && ex.targetJoints.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[#ffb693] text-[9px] uppercase font-mono">Articulações Alvo Preservadas:</span>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {ex.targetJoints.map((j, i) => (
                                      <span key={i} className="bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono text-[9px] font-semibold text-blue-300">
                                        🛡️ {j}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Expand / Close button footer */}
                  <div className="p-3 border-t border-[#5a4136]/10 bg-[#131212]/30 flex justify-between items-center text-[10px] font-mono">
                    <button 
                      onClick={() => setExpandedCardId(isExpanded ? null : ex.id)}
                      className="text-[#e2bfb0]/60 hover:text-white flex items-center gap-0.5 transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Contrair <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Ver Detalhes do Alinhamento <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                    {ex.videoUrl && (
                      <button 
                        onClick={() => setVideoModalUrl(ex.videoUrl || null)}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Youtube className="w-3.5 h-3.5 fill-current" /> Tutorial Interno
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. RECONSTRUCT / EDIT SPECIFICATIONS DIALOG OVERLAY */}
      <AnimatePresence>
        {editingExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#1c1b1b] border border-[#ff6b00]/30 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#5a4136]/30 pb-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="text-[#ff6b00] w-5 h-5" />
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wide">
                    Refazer Mecânica
                  </h3>
                </div>
                <button 
                  onClick={() => setEditingExercise(null)}
                  className="p-1 text-[#e2bfb0]/60 hover:text-white transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-[#e2bfb0]">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#ffb693]">Nome do Exercício</label>
                  <input
                    type="text"
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                    className="w-full bg-[#131212] border border-[#5a4136]/40 rounded-lg p-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>

                {/* Video tutorial Url */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-bold text-red-400 flex items-center gap-1">
                    <Youtube className="w-4 h-4 fill-red-400 stroke-none" /> URL do Vídeo Tutorial (YouTube)
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={editingExercise.videoUrl || ''}
                    onChange={(e) => setEditingExercise({ ...editingExercise, videoUrl: e.target.value })}
                    className="w-full bg-[#131212] border border-[#5a4136]/40 rounded-lg p-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#ff6b00] font-mono text-xs"
                  />
                </div>

                {/* Adapted For */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#ffb693]">Foco Adaptativo (Selo Clínico)</label>
                  <input
                    type="text"
                    placeholder="Ex: Proteção lombar, baixo cisalhamento patelar"
                    value={editingExercise.adaptedFor}
                    onChange={(e) => setEditingExercise({ ...editingExercise, adaptedFor: e.target.value })}
                    className="w-full bg-[#131212] border border-[#5a4136]/40 rounded-lg p-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>

                {/* Target Joints */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#ffb693]">Articulações Preservadas (Separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: Joelhos, Ombros, Lombar"
                    value={editingExercise.targetJoints?.join(', ') || ''}
                    onChange={(e) => setEditingExercise({ 
                      ...editingExercise, 
                      targetJoints: e.target.value.split(',').map(x => x.trim()) 
                    })}
                    className="w-full bg-[#131212] border border-[#5a4136]/40 rounded-lg p-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>

                {/* Step by Step list */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-bold text-green-400">Como Executar Corretamente (Um passo por linha)</label>
                  <textarea
                    rows={4}
                    placeholder="Dobre o joelho a 90 graus...&#10;Afaste os pés..."
                    value={editingExercise.steps?.join('\n') || ''}
                    onChange={(e) => setEditingExercise({ 
                      ...editingExercise, 
                      steps: e.target.value.split('\n') 
                    })}
                    className="w-full bg-[#131212] border border-[#5a4136]/40 rounded-lg p-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#ff6b00] font-sans text-xs leading-relaxed"
                  />
                </div>

                {/* Prohibited Errors list */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-bold text-red-400">O que NÃO Fazer (Erros graves, um por linha)</label>
                  <textarea
                    rows={3}
                    placeholder="Não gire os quadris...&#10;Não permita que as costas arredondem..."
                    value={editingExercise.donts?.join('\n') || ''}
                    onChange={(e) => setEditingExercise({ 
                      ...editingExercise, 
                      donts: e.target.value.split('\n') 
                    })}
                    className="w-full bg-[#131212] border border-[#5a4136]/40 rounded-lg p-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#ff6b00] font-sans text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Form trigger buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-[#5a4136]/20">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-4 py-2 bg-neutral-900 border border-[#5a4136]/40 hover:bg-neutral-800 text-[#e2bfb0]/70 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveExercise}
                  className="px-5 py-2 bg-[#ff6b00] hover:bg-orange-500 text-black rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-orange-600/10"
                >
                  <Save className="w-4 h-4" /> 
                  {isSaving ? 'Sincronizando...' : 'Salvar no Banco'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. EMBEDDED INLINE VIDEO MODAL PLAYER (Plays directly inside the app!) */}
      <AnimatePresence>
        {videoModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl relative aspect-video"
            >
              {/* Floating close x button */}
              <button 
                onClick={() => setVideoModalUrl(null)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                ✕
              </button>
              
              {/* Embed Frame */}
              <iframe
                src={`${getYouTubeEmbedUrl(videoModalUrl)}?autoplay=1`}
                title="Tutorial de Posicionamento Anatomico"
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
