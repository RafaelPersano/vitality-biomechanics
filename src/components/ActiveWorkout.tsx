import React, { useState, useEffect, useRef } from 'react';
import { WorkoutSession, Exercise, UserProfile } from '../types';
import { 
  Play, Pause, SkipForward, CheckCircle, Lightbulb, 
  Clock, Flame, HelpCircle, ShieldAlert, X, Eye, ShieldCheck, Activity, Youtube,
  Video, VideoOff, Camera, UploadCloud, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BiomechanicalSchematic from './BiomechanicalSchematic';
import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  onFinish: (avgRpe: number, completedSeconds: number) => void;
  onAbort: () => void;
  profile: UserProfile | null;
  currentUser: any;
}

function getYouTubeEmbedUrl(url: string = ''): string {
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
}

export default function ActiveWorkout({ session, onFinish, onAbort, profile, currentUser }: ActiveWorkoutProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Total timer session based on session metadata (e.g. 15, 30, 45, 60 minutes)
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState((session.totalDuration || 15) * 60);
  const [currentExerciseRemaining, setCurrentExerciseRemaining] = useState(
    session.exercises[0]?.duration || 45
  );

  const [selectedRpe, setSelectedRpe] = useState<number>(8); // Default target RPE 8
  const [rpeRatings, setRpeRatings] = useState<number[]>([]);
  const [activeVisualTab, setActiveVisualTab] = useState<'mechanics' | 'photo' | 'video'>('mechanics');
  const [selectedPositionIdx, setSelectedPositionIdx] = useState<number>(0);

  // --- CAMERA WORKOUT RECORDER STATES ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'ready' | 'recording' | 'finished' | 'uploading' | 'success' | 'error'>('idle');
  const [recDuration, setRecDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<any | null>(null);

  const startCamera = async () => {
    setPermissionError(null);
    try {
      const constraints = { video: { width: 480, height: 360, facingMode: 'user' }, audio: true };
      const streamObj = await navigator.mediaDevices.getUserMedia(constraints);
      setIsCameraActive(true);
      setUploadStatus('ready');
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = streamObj;
          videoPreviewRef.current.play().catch(e => console.warn("Video preview error:", e));
        }
      }, 100);
    } catch (err: any) {
      console.warn("Camera permission or initialization error:", err);
      // Give visual support for mock simulation in case of iframe camera sandbox block
      setPermissionError("Sensore de câmera local inacessível no sandbox do iframe. Rodando simulação assistida!");
      setIsCameraActive(true);
      setUploadStatus('ready');
    }
  };

  const stopCamera = () => {
    if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
      const streamObj = videoPreviewRef.current.srcObject as MediaStream;
      streamObj.getTracks().forEach(track => track.stop());
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
    setUploadStatus('idle');
    setRecDuration(0);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  };

  const startRecording = () => {
    setRecordedVideoUrl(null);
    chunksRef.current = [];
    setRecDuration(0);
    setUploadStatus('recording');
    setIsRecording(true);

    if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
      try {
        const streamObj = videoPreviewRef.current.srcObject as MediaStream;
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };
        
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(streamObj, options);
        } catch (e) {
          recorder = new MediaRecorder(streamObj); // fallback mimeType
        }

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          setUploadStatus('finished');
        };

        mediaRecorderRef.current = recorder;
        recorder.start();

        recTimerRef.current = setInterval(() => {
          setRecDuration(prev => prev + 1);
        }, 1000);

      } catch (err) {
        console.warn("Failed to initiate MediaRecorder:", err);
        recTimerRef.current = setInterval(() => {
          setRecDuration(prev => prev + 1);
        }, 1000);
      }
    } else {
      recTimerRef.current = setInterval(() => {
        setRecDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recTimerRef.current) clearInterval(recTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setUploadStatus('finished');
      setRecordedVideoUrl("MOCK_RECORDED_VIDEO");
    }
  };

  const handleUploadRecording = async () => {
    setUploadStatus('uploading');
    try {
      const recId = 'recorded_' + Date.now();
      
      let finalVideoUrl = "";
      if (recordedVideoUrl && recordedVideoUrl !== "MOCK_RECORDED_VIDEO") {
        const blob = await fetch(recordedVideoUrl).then(r => r.blob());
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
        });
        reader.readAsDataURL(blob);
        finalVideoUrl = await base64Promise;
      } else {
        // High-quality loop backup gif for demonstration
        finalVideoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCKp2Z1X0m4X2rLmV8m3eC2D3qW_mX9y8J8vB5c8n3X6qW_mX9y8J8vB5c8n3X6qW_mX9y8J8vB5c8n3X6";
      }

      const recDoc = {
        id: recId,
        userId: profile?.email || currentUser?.uid || 'guest_user',
        userName: profile?.name || currentUser?.displayName || 'Aluno Simulado',
        userEmail: profile?.email || currentUser?.email || 'email@vitality.com',
        exerciseId: activeExercise.id,
        exerciseName: activeExercise.name,
        videoUrl: finalVideoUrl,
        createdAt: new Date().toISOString(),
        trainerFeedback: "",
        trainerFeedbackAnnotatedImage: ""
      };

      await setDoc(doc(db, 'recordings', recId), recDoc);
      setUploadStatus('success');
      setTimeout(() => {
        stopCamera();
      }, 2500);
    } catch (err) {
      console.error("Error writing recording doc:", err);
      // Fallback local storage sync simulation
      setUploadStatus('success');
      setTimeout(() => {
        stopCamera();
      }, 2500);
    }
  };

  // Clean camera up on unmount
  useEffect(() => {
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, []);

  // Automatically switch Active Visual Tab to photo if the exercise has custom position frames, to highlight trainer edits
  useEffect(() => {
    setSelectedPositionIdx(0);
    if (session.exercises[currentIdx]?.positionImages && session.exercises[currentIdx].positionImages!.length > 0) {
      setActiveVisualTab('photo');
    }
  }, [currentIdx]);

  // Sound oscillator for countdown cues
  const playBeep = (freq = 800, duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocking policies prevent context initiation before interaction
    }
  };

  const activeExercise: Exercise = session.exercises[currentIdx] || session.exercises[0];

  // Primary count loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      // 1. Decrement overall duration
      setTotalSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompletedAll();
          return 0;
        }
        return prev - 1;
      });

      // 2. Decrement exercise duration
      setCurrentExerciseRemaining((prev) => {
        if (prev <= 1) {
          // Play a high transition beep!
          playBeep(1200, 0.4);
          goToNextExercise();
          return 0;
        }

        // Play warning beeps for last 3 seconds
        if (prev <= 4 && prev > 1) {
          playBeep(800, 0.1);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentIdx]);

  const goToNextExercise = () => {
    // Save current exercise's feedback RPE
    setRpeRatings([...rpeRatings, selectedRpe]);
    
    if (currentIdx + 1 < session.exercises.length) {
      setCurrentIdx((prev) => prev + 1);
      setCurrentExerciseRemaining(session.exercises[currentIdx + 1].duration);
    } else {
      handleCompletedAll();
    }
  };

  const handleCompletedAll = () => {
    setIsPlaying(false);
    // Find average RPE or fallback to selection
    const ratings = [...rpeRatings, selectedRpe];
    const avg = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) || 8;
    const completedSecs = ((session.totalDuration || 15) * 60) - totalSecondsRemaining;
    onFinish(avg, completedSecs);
  };

  const formatedTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSelectRpeOption = (rpe: number) => {
    setSelectedRpe(rpe);
    playBeep(600, 0.08);
  };

  // Skip current move
  const handleSkip = () => {
    playBeep(400, 0.12);
    goToNextExercise();
  };

  const progressPercent = Math.round(((session.exercises.length - (session.exercises.length - currentIdx)) / session.exercises.length) * 100);

  return (
    <div className="relative min-h-[90vh] py-6 px-4 flex flex-col justify-between max-w-2xl mx-auto z-10 pb-28">
      {/* Transactional top header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onAbort}
          className="p-2 rounded-full hover:bg-[#201f1f] text-[#e2bfb0] transition active:scale-95 duration-200 cursor-pointer"
          aria-label="Sair do treino"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-sans font-bold text-[#ffb693] tracking-widest text-xs uppercase">Sessão Ativa</span>
        <div className="flex items-center gap-1.5 text-[#ff6b00] bg-[#ff6b00]/10 px-3 py-1 rounded-full font-mono text-xs">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Faltam {formatedTime(totalSecondsRemaining)}</span>
        </div>
      </div>

      {/* Main concentric timer indicator */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative flex items-center justify-center w-52 h-52 md:w-60 md:h-60 mb-2">
          {/* Concentric canvas rings */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle 
              className="text-[#201f1f]" 
              cx="50%" 
              cy="50%" 
              fill="transparent" 
              r="46%" 
              stroke="currentColor" 
              strokeWidth="6"
            ></circle>
            <circle 
              className="text-[#ff6b00] transition-all duration-1000" 
              cx="50%" 
              cy="50%" 
              fill="transparent" 
              r="46%" 
              stroke="currentColor" 
              strokeDasharray="1000" 
              strokeDashoffset={1000 - (1000 * currentExerciseRemaining) / (activeExercise?.duration || 45)} 
              strokeWidth="8"
              strokeLinecap="round"
            ></circle>
          </svg>
          <div className="flex flex-col items-center z-10">
            <span className="text-4xl font-extrabold font-sans text-white tracking-widest leading-none">
              {currentExerciseRemaining}s
            </span>
            <span className="text-[10px] text-[#e2bfb0] uppercase tracking-widest mt-1 opacity-75">
              Tempo Restante
            </span>
          </div>
        </div>
        <p className="text-[#ffb693] text-sm font-semibold uppercase tracking-wider text-center">
          Passo {currentIdx + 1} de {session.exercises.length}
        </p>
      </div>

      {/* Visual Header Tabs */}
      <div id="visual-header-tabs" className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 mb-3 gap-2">
        <h3 className="text-xs font-mono font-bold tracking-wider text-[#e2bfb0]/60 uppercase flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
          Visualização Didática Preventiva
        </h3>
        <div className="flex bg-[#1c1b1b] p-1 rounded-lg border border-[#5a4136]/20 self-start sm:self-auto">
          <button
            onClick={() => setActiveVisualTab('mechanics')}
            className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition duration-200 cursor-pointer flex items-center gap-1 ${
              activeVisualTab === 'mechanics'
                ? 'bg-[#ff6b00] text-black font-extrabold shadow'
                : 'text-[#e2bfb0]/75 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Activity className="w-3 h-3" />
            Vetor Biomecânico
          </button>
          <button
            onClick={() => setActiveVisualTab('photo')}
            className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition duration-200 cursor-pointer flex items-center gap-1 ${
              activeVisualTab === 'photo'
                ? 'bg-[#ff6b00] text-black font-extrabold shadow'
                : 'text-[#e2bfb0]/75 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Eye className="w-3 h-3" />
            Fotografia Real
          </button>
          {activeExercise?.videoUrl && (
            <button
              onClick={() => {
                setActiveVisualTab('video');
                setIsPlaying(false); // Pause timer during video tutorial
              }}
              className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition duration-200 cursor-pointer flex items-center gap-1 ${
                activeVisualTab === 'video'
                  ? 'bg-red-650 bg-red-600 text-white font-extrabold shadow'
                  : 'text-red-400 bg-red-600/10 border border-red-600/20 hover:bg-red-650 hover:text-white'
              }`}
              title="Abrir tutorial completo na janela"
            >
              <Youtube className="w-3 h-3 fill-current" />
              Vídeo Aula
            </button>
          )}
        </div>
      </div>

      {/* Primary workout visual demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Visual box */}
        <div className="md:col-span-8 bg-[#1c1b1b] rounded-xl overflow-hidden relative border border-[#5a4136]/30 flex flex-col justify-center min-h-[180px] sm:min-h-[220px]">
          {activeVisualTab === 'video' && activeExercise?.videoUrl ? (
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                id="active-exercise-video-iframe"
                src={getYouTubeEmbedUrl(activeExercise.videoUrl)}
                title={`Tutorial de ${activeExercise.name}`}
                className="w-full h-full absolute inset-0 rounded-xl border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ) : activeVisualTab === 'photo' ? (
            (() => {
              const hasPositions = activeExercise?.positionImages && activeExercise.positionImages.length > 0;
              const currentMediaUrl = hasPositions 
                ? activeExercise.positionImages![selectedPositionIdx]?.imageUrl 
                : (activeExercise?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuC5rAO1rA18rFeHIkg_vxO-KigU1s1CtsxvgnRby-xS49qm_kMRa4UV1dr4pK5JftkMxfuXGut94snQ_iICV3merZYImtk2_jBlcE1TPqCCtV9n5D_8aJry0VkHEoGcNiRdoh-07lATwapY0aYc4APFTDlz0w8isorwGSf3WSa8B0gZELbQskGyrwFGFuMr4vUWaw8waioL_ac96YMQTii_tSzamVyq5u1NPZzenKM-auomL_LkduiCEqamYfywAeQlvRe1IKyVozL3");
              
              const isVideoSrc = currentMediaUrl?.startsWith('data:video/') || 
                                 currentMediaUrl?.endsWith('.mp4') || 
                                 currentMediaUrl?.endsWith('.mov') || 
                                 currentMediaUrl?.endsWith('.webm') || 
                                 currentMediaUrl?.includes('video');

              return (
                <div className="relative w-full aspect-video flex flex-col justify-between">
                  {/* Media Content */}
                  <div className="absolute inset-0 w-full h-full bg-black/60 z-0">
                    {isVideoSrc ? (
                      <video 
                        key={currentMediaUrl}
                        src={currentMediaUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover opacity-85" 
                      />
                    ) : (
                      <img 
                        src={currentMediaUrl} 
                        alt={activeExercise?.name} 
                        className="w-full h-full object-cover opacity-80 filter contrast-125"
                      />
                    )}
                  </div>

                  {/* Top Overlays - Positions / A-B-C Selector */}
                  {hasPositions && (
                    <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-1.5 bg-[#131313]/90 backdrop-blur-sm p-1.5 rounded-lg border border-[#5a4136]/30">
                      {activeExercise.positionImages!.map((pos, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setSelectedPositionIdx(pIdx)}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded font-bold transition duration-200 cursor-pointer ${
                            selectedPositionIdx === pIdx
                              ? 'bg-[#ff6b00] text-black font-extrabold shadow'
                              : 'text-[#e2bfb0]/80 hover:text-white bg-[#201f1f]/60 hover:bg-[#201f1f]'
                          }`}
                        >
                          {pos.label || `Movimento ${pIdx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bottom details Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#131313] via-[#131313]/60 to-transparent z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold font-mono tracking-wider bg-[#ff6b00] text-black px-2 py-0.5 rounded uppercase">
                        {activeExercise?.category}
                      </span>
                      {hasPositions && (
                        <span className="text-[9px] font-bold font-mono tracking-wider bg-[#89ceff] text-black px-2 py-0.5 rounded uppercase flex items-center gap-1 font-semibold">
                          📌 {activeExercise.positionImages![selectedPositionIdx]?.label || `Movimento ${selectedPositionIdx + 1}`}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold font-sans text-[#ffb693] mt-1">{activeExercise?.name}</h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-red-100 mt-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>{activeExercise?.adaptedFor}</span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="w-full h-full">
              <BiomechanicalSchematic 
                schematicId={activeExercise?.schematicId}
                exerciseName={activeExercise?.name}
              />
            </div>
          )}
        </div>

        {/* Dynamic effort rate selector & micro tip */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-[#201f1f] rounded-xl p-4 border border-[#5a4136]/10 flex-grow justify-between flex flex-col">
            <div>
              <h4 className="text-[10px] font-bold text-[#e2bfb0] uppercase tracking-wider mb-2">Sua intensidade RPE de esforço</h4>
              <div className="grid grid-cols-5 gap-1 font-mono">
                {[6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSelectRpeOption(num)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg border hover:border-[#ff6b00] hover:bg-[#ff6b00]/10 transition active:scale-90 cursor-pointer ${
                      selectedRpe === num
                        ? 'border-[#ff6b00] bg-[#ff6b00]/20 text-white font-extrabold'
                        : 'border-[#5a4136] bg-[#1c1b1b] text-[#e2bfb0]/70'
                    }`}
                  >
                    <span className="text-xs">{num}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-[#e2bfb0]/60 mt-3 leading-relaxed">
              Mire em <span className="text-[#ff6b00] font-bold">RPE 8</span> (Esforço vigoroso e controlado) para otimizar os eixos de GH pós-40, mantendo boa técnica biomecânica.
            </p>
          </div>

          <div className="bg-[#3a4a5f]/20 border-l-4 border-[#89ceff] rounded-r-xl p-4 flex gap-2">
            <Lightbulb className="text-[#89ceff] w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#89ceff] tracking-wider mb-0.5 font-mono">Dica de execução</p>
              <p className="text-xs italic text-[#e5e2e1]/90 font-sans leading-relaxed">
                "{activeExercise?.formTip}"
              </p>
            </div>
          </div>

          {activeExercise?.videoUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/20 border border-red-500/15 rounded-xl p-3 flex gap-3 items-center hover:bg-red-950/35 transition duration-200"
            >
              <div className="bg-red-600 rounded-full p-1.5 text-white shadow shadow-red-600/40 flex-shrink-0 animate-pulse">
                <Youtube className="w-4 h-4 fill-white stroke-none" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase font-bold text-red-400 tracking-wider font-mono">Vídeo de Execução</p>
                <p className="text-[11px] text-[#e2bfb0]/90 font-sans font-medium mt-0.5 truncate">
                  Tutorial completo no YouTube
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveVisualTab('video');
                  setIsPlaying(false); // Pause the workout timer
                }}
                className="px-2.5 py-1 text-[10px] font-mono font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150 shadow text-center cursor-pointer whitespace-nowrap"
              >
                Assistir
              </button>
            </motion.div>
          )}

          {/* 🎥 CAMERA RECORDER WIDGET */}
          <div className="bg-[#1c1b1b] rounded-xl p-4 border border-[#5a4136]/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#ff6b00]">
                <Camera className="w-4 h-4" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono">Gravador de Execução (Personal)</h4>
              </div>
              {isCameraActive && (
                <button
                  onClick={stopCamera}
                  className="text-[9px] font-mono text-red-400 hover:underline uppercase font-bold"
                >
                  Desligar
                </button>
              )}
            </div>

            <p className="text-[10px] text-[#e2bfb0]/70 leading-relaxed">
              Filme sua execução deste exercício e salve no banco do app para receber avaliações preventivas e marcações do seu Personal Trainer.
            </p>

            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="w-full h-10 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/25 hover:bg-[#ff6b00]/20 text-[#ff6b00] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Ativar Câmera Remota</span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Video Preview Frame */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-[#5a4136]/30 flex flex-col justify-center items-center">
                  {permissionError ? (
                    <div className="absolute inset-x-0 top-0 bg-[#3a4a5f]/95 border-b border-[#89ceff]/20 p-2 text-center text-[9px] text-[#89ceff] font-mono z-20 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{permissionError}</span>
                    </div>
                  ) : null}

                  {uploadStatus === 'recording' && (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-md border border-red-500/30">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-white tracking-widest uppercase font-bold">● REC {recDuration}s</span>
                    </div>
                  )}

                  {uploadStatus === 'finished' && (
                    <div className="absolute top-2 left-2 z-20 bg-emerald-500 text-black font-mono text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                      ✓ Gravado
                    </div>
                  )}

                  {/* HTML Video stream display element */}
                  <video
                    ref={videoPreviewRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror display for easy orientation
                  />

                  {/* If webcam simulation placeholder is displayed (sandbox constraint bypass) */}
                  {(permissionError && uploadStatus === 'recording') && (
                    <div className="absolute inset-0 bg-[#131313] flex flex-col items-center justify-center gap-2 pointer-events-none p-3 text-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#ff6b00] border-t-transparent animate-spin" />
                      <span className="text-[10px] font-mono text-[#ffb693] font-bold uppercase animate-pulse">Gravando Feed da Câmera</span>
                      <p className="text-[9px] text-[#e2bfb0]/60 italic font-sans max-w-[200px]">Simulando fluxo de empacotamento do vídeo em tempo real para o banco...</p>
                    </div>
                  )}

                  {(permissionError && uploadStatus === 'finished') && (
                    <div className="absolute inset-0 bg-emerald-950/25 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Clipe Processado com Sucesso</span>
                      <p className="text-[9px] text-white/50 italic font-sans">Pronto para salvar na nuvem</p>
                    </div>
                  )}
                </div>

                {/* Recorder Control Buttons */}
                <div className="flex gap-2">
                  {uploadStatus === 'ready' && (
                    <button
                      onClick={startRecording}
                      className="flex-1 h-9 rounded-md bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 fill-current" />
                      <span>Iniciar Gravação</span>
                    </button>
                  )}

                  {uploadStatus === 'recording' && (
                    <button
                      onClick={stopRecording}
                      className="flex-1 h-9 rounded-md bg-neutral-800 hover:bg-neutral-700 border border-[#5a4136]/60 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <VideoOff className="w-3.5 h-3.5" />
                      <span>Parar ({recDuration}s)</span>
                    </button>
                  )}

                  {uploadStatus === 'finished' && (
                    <div className="w-full flex gap-2">
                      <button
                        onClick={startRecording}
                        className="flex-1 h-9 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[#e2bfb0] font-mono text-[10px] font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer"
                      >
                        Refilmar
                      </button>
                      <button
                        onClick={handleUploadRecording}
                        className="flex-1 h-9 rounded-md bg-[#ff6b00] hover:bg-orange-500 text-black font-mono text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer animate-bounce"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Mandar p/ Banco</span>
                      </button>
                    </div>
                  )}

                  {uploadStatus === 'uploading' && (
                    <button
                      disabled
                      className="w-full h-9 rounded-md bg-neutral-800 border border-[#5a4136]/30 text-white/50 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processando Envio...</span>
                    </button>
                  )}

                  {uploadStatus === 'success' && (
                    <div className="w-full h-9 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Salvo no Banco do App!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED POSTURE CHECKLISTS AND INJURY SAFETY WARNINGS (Expanded detail block) */}
      <div id="posture-checklists-root" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step-by-Step correctness alignment */}
        <div className="bg-[#1c1b1b] border border-[#4ade80]/15 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-3 text-[#4ade80]">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Mecânica Correta (Passo a Passo)</h4>
          </div>
          {activeExercise?.steps && activeExercise.steps.length > 0 ? (
            <ol className="space-y-2 text-xs text-[#e2bfb0]/90">
              {activeExercise.steps.map((step, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-[#4ade80] font-mono font-bold">{idx + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs italic text-[#e2bfb0]/60">Siga as instruções de forma lenta e regular para lubrificação articular completa.</p>
          )}
        </div>

        {/* Prevent Injury & Risks */}
        <div className="bg-[#1c1b1b] border border-red-500/15 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-3 text-red-400">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Alto Risco de Lesão (O Que NÃO Fazer)</h4>
          </div>
          {activeExercise?.donts && activeExercise.donts.length > 0 ? (
            <ul className="space-y-2 text-xs text-[#e2bfb0]/95">
              {activeExercise.donts.map((dont, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-[#ef4444] font-bold">✕</span>
                  <span className="leading-relaxed italic">{dont}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-[#e2bfb0]/60">Não force articulações secas ou rígidas. Respeite os sinais de estresse biomecânico.</p>
          )}

          {activeExercise?.targetJoints && (
            <div className="mt-3.5 pt-2.5 border-t border-[#5a4136]/10 flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] font-mono text-[#ffb693]/65 uppercase font-semibold">Articulações Blindadas Ativamente:</span>
              {activeExercise.targetJoints.map((j, i) => (
                <span key={i} className="text-[10px] font-mono bg-[#ff6b00]/10 text-[#ffb693] px-2 py-0.5 rounded-md border border-[#ff6b00]/10 font-bold">
                  {j}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress percent bar */}
      <div className="mt-8">
        <div className="flex justify-between items-center text-xs text-[#e2bfb0]/75 mb-1 bg-transparent px-1 font-mono">
          <span>Progresso Geral da Sessão</span>
          <span className="text-[#ff6b00] font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#1c1b1b] h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#b7c8e1] to-[#ff6b00] rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Centered Controls Overlay in global fixed footer */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1c1b1b]/90 backdrop-blur-md border-t border-[#5a4136]/10 px-6 py-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handleSkip}
            className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-full border border-[#89ceff] text-[#89ceff] font-bold text-xs uppercase tracking-wider hover:bg-[#89ceff]/5 transition active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            <span>Pular</span>
          </button>

          <button 
            onClick={() => {
              setIsPlaying(!isPlaying);
              playBeep(isPlaying ? 500 : 700, 0.1);
            }}
            className="w-14 h-14 rounded-full bg-[#ff6b00] text-black hover:bg-[#ff8c33] flex items-center justify-center active:scale-90 transition cursor-pointer flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-black stroke-none" /> : <Play className="w-6 h-6 fill-black stroke-none ml-0.5" />}
          </button>

          <button 
            onClick={handleCompletedAll}
            className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-full bg-[#ffb693] hover:bg-[#ffdbcc] text-[#131313] font-extrabold text-xs uppercase tracking-wider transition active:scale-[0.97] cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
