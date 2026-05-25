import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { 
  Video, Scissors, Download, RefreshCw, Play, Pause, 
  Clock, Settings, AlertTriangle, CheckCircle2, Image, 
  Plus, Film, Compass, ChevronRight, HelpCircle, Trash2, Link
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data'; // Import database exercises if available, or fall back

interface VideoToGifConverterProps {
  onGifGenerated?: (base64Gif: string) => void;
  onLinkToExercise?: (exerciseId: string, base64Gif: string) => void;
  onLinkToChallenge?: (base64Gif: string) => void;
  availableExercises?: any[];
}

export default function VideoToGifConverter({
  onGifGenerated,
  onLinkToExercise,
  onLinkToChallenge,
  availableExercises = []
}: VideoToGifConverterProps) {
  // Video Loading States
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number>(320);
  const [videoHeight, setVideoHeight] = useState<number>(240);

  // Video Players Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Trimming parameters
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(3); // Default 3 second clip
  const [fps, setFps] = useState<number>(8); // Frames per second
  const [outputScale, setOutputScale] = useState<number>(200); // Frame width size
  const [cropRatio, setCropRatio] = useState<'1:1' | '16:9' | '3:4'>('1:1');

  // Compilation States
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [gifResult, setGifResult] = useState<string>(''); // Base64 data URI of compiled GIF
  const [gifSizeKb, setGifSizeKb] = useState<number>(0);
  const [linkedId, setLinkedId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const abortCompileRef = useRef<boolean>(false);

  // Clean up video URL when file changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Handle local video drop/upload
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadVideoFile(file);
  };

  const loadVideoFile = (file: File) => {
    // Basic format verification
    if (!file.type.startsWith('video/')) {
      alert('Por favor, envie um arquivo de vídeo suportado (MP4, WebM, etc.)');
      return;
    }
    
    // Warn if video is very large (just a recommendation)
    if (file.size > 100 * 1024 * 1024) {
      alert('Aviso: O arquivo é maior que 100MB. Pode demorar para carregar dependendo do seu hardware.');
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setGifResult('');
    setStartTime(0);
    setEndTime(3);
    setSuccessMsg('');
    setIsPlaying(false);
  };

  // Video Loaded Metadata callback
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    setDuration(vid.duration);
    setVideoWidth(vid.videoWidth || 320);
    setVideoHeight(vid.videoHeight || 240);
    
    // Adjust default end time to end of video if it is shorter than 3 seconds
    if (vid.duration < 3) {
      setEndTime(vid.duration);
    } else {
      setEndTime(3);
    }
  };

  // Keep track of current video time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Navigation helpers to snap Trim points
  const setTrimStartToCurrent = () => {
    if (!videoRef.current) return;
    const time = parseFloat(videoRef.current.currentTime.toFixed(2));
    setStartTime(time);
    if (time >= endTime) {
      setEndTime(Math.min(time + 3, duration));
    }
  };

  const setTrimEndToCurrent = () => {
    if (!videoRef.current) return;
    const time = parseFloat(videoRef.current.currentTime.toFixed(2));
    if (time <= startTime) {
      setStartTime(Math.max(0, time - 3));
    }
    setEndTime(time);
  };

  // Core Seek helper
  const seekTo = (time: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!videoRef.current) return resolve();
      const video = videoRef.current;
      
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      
      video.addEventListener('seeked', onSeeked);
      video.currentTime = time;
    });
  };

  // MAIN GIF COMPILER ENGINE
  const compileGif = async () => {
    if (!videoRef.current || isCompiling) return;
    
    // Double sanity checks
    if (endTime <= startTime) {
      alert('O tempo final deve ser maior que o tempo inicial!');
      return;
    }

    const clipDuration = endTime - startTime;
    if (clipDuration > 8) {
      const confirmLong = window.confirm(
        'Você selecionou um intervalo longo (' + clipDuration.toFixed(1) + 's). GIFs com mais de 8 segundos ocupam muito espaço e demoram para processar. Deseja continuar?'
      );
      if (!confirmLong) return;
    }

    // Set compiles configurations
    setIsCompiling(true);
    setCompileProgress(0);
    setProgressText('Inicializando decodificador...');
    abortCompileRef.current = false;
    setSuccessMsg('');

    try {
      const video = videoRef.current;
      
      // Calculate output size based on Crop ratio and Scale width
      let snapWidth = outputScale;
      let snapHeight = outputScale;

      if (cropRatio === '16:9') {
        snapHeight = Math.round(outputScale * (9 / 16));
      } else if (cropRatio === '3:4') {
        snapHeight = Math.round(outputScale * (4 / 3));
      }

      // Create extraction canvas
      const canvas = document.createElement('canvas');
      canvas.width = snapWidth;
      canvas.height = snapHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Não foi possível inicializar o canvas 2D.');

      // Initialize the gifenc encoder
      const encoder = GIFEncoder();
      const delayMs = Math.round(1000 / fps);
      
      // Calculate active steps
      const totalFrames = Math.max(1, Math.round(clipDuration * fps));
      const stepTime = 1 / fps;

      // Pause video if playing
      video.pause();
      setIsPlaying(false);

      const backupTime = video.currentTime;

      // Extraction frame queue
      for (let i = 0; i < totalFrames; i++) {
        if (abortCompileRef.current) {
          setProgressText('Cancelado pelo usuário.');
          setIsCompiling(false);
          await seekTo(backupTime);
          return;
        }

        const seekTarget = startTime + (i * stepTime);
        if (seekTarget > endTime) break;

        setProgressText(`Seeking frame ${i + 1}/${totalFrames}...`);
        await seekTo(seekTarget);

        // Update progress bar
        const frameProgress = Math.round((i / totalFrames) * 95);
        setCompileProgress(frameProgress);
        setProgressText(`Renderizando frame ${i + 1}/${totalFrames} (segundo: ${seekTarget.toFixed(2)}s)...`);

        // Compute crop alignment (simulate crop center)
        // Draw centered cropping area in canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, snapWidth, snapHeight);

        // Aspect ratio mapping
        const sourceAspect = video.videoWidth / video.videoHeight;
        const targetAspect = snapWidth / snapHeight;

        let drawWidth = snapWidth;
        let drawHeight = snapHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (sourceAspect > targetAspect) {
          // Video is wider than crop box
          drawWidth = snapHeight * sourceAspect;
          offsetX = (snapWidth - drawWidth) / 2;
        } else {
          // Video is taller than crop box
          drawHeight = snapWidth / sourceAspect;
          offsetY = (snapHeight - drawHeight) / 2;
        }

        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Extract frame pixel buffer
        const imgData = ctx.getImageData(0, 0, snapWidth, snapHeight);
        const { data } = imgData;

        // Perform color quantization (pure JS gifenc routine)
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette, 'rgb565');

        // Write frame structure
        encoder.writeFrame(index, snapWidth, snapHeight, {
          palette,
          delay: delayMs
        });
      }

      // Finish encoding process
      setProgressText('Finalizando empacotamento do GIF animado...');
      encoder.finish();

      // Collect raw output bytes
      const bytes = encoder.bytes();
      const blob = new Blob([bytes], { type: 'image/gif' });
      const sizeInKb = parseFloat((blob.size / 1024).toFixed(1));

      // Load results in standard Base64 Data URL or blob URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64result = reader.result as string;
        setGifResult(base64result);
        setGifSizeKb(sizeInKb);
        setIsCompiling(false);
        setCompileProgress(100);
        setProgressText('');
      };
      reader.readAsDataURL(blob);

      // Restore initial user video playhead position
      await seekTo(backupTime);

    } catch (err: any) {
      console.error('Error generating GIF:', err);
      alert('Erro inesperado na compilação: ' + err?.message);
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!gifResult) return;
    const link = document.createElement('a');
    link.href = gifResult;
    link.download = `exercicio-longevidade-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLinkToCurrentChallenge = () => {
    if (!gifResult || !onLinkToChallenge) return;
    onLinkToChallenge(gifResult);
    setSuccessMsg('✅ Vinculado com sucesso ao Formulário de Desafio Ativo!');
  };

  const handleLinkToChosenExercise = () => {
    if (!gifResult || !onLinkToExercise || !linkedId) return;
    onLinkToExercise(linkedId, gifResult);
    setSuccessMsg('✅ GIF de exercício atualizado no Banco de Dados com sucesso!');
  };

  return (
    <div className="bg-[#1c1b1b] rounded-2xl border border-[#ff6b00]/25 shadow-xl overflow-hidden p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#5a4136]/15 pb-4 gap-2">
        <div>
          <h3 className="text-sm font-black text-[#ffb693] tracking-wide uppercase flex items-center gap-2">
            <Scissors className="w-4.5 h-4.5 text-[#ff6b00]" /> Fábrica de GIFs de Exercício
          </h3>
          <p className="text-[10px] text-[#e2bfb0]/70 mt-0.5">
            Corte pedaços de vídeos gravados de seus treinos e converta em ilustrações de exercícios leves para os alunos
          </p>
        </div>
        
        {videoFile && (
          <button 
            onClick={() => {
              setVideoFile(null);
              setVideoUrl('');
              setGifResult('');
            }}
            className="text-[9px] bg-red-950/20 text-red-300 border border-red-500/10 px-2.5 py-1 rounded hover:bg-red-900/20 hover:border-red-500/30 font-mono transition"
          >
            Substituir Vídeo
          </button>
        )}
      </div>

      {!videoFile ? (
        // Drop ou Upload State
        <div className="border border-dashed border-[#5a4136]/50 hover:border-[#ff6b00]/40 rounded-xl p-8 hover:bg-[#201f1f]/3 w-full transition text-center cursor-pointer group relative">
          <input
            type="file"
            accept="video/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleVideoSelect}
          />
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="w-12 h-12 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-full flex items-center justify-center group-hover:scale-105 transition duration-300">
              <Film className="w-6 h-6 text-[#ff6b00]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wide">
                Arraste ou Selecione seu Vídeo de Exercício
              </p>
              <p className="text-[11px] text-[#e2bfb0]/65 mt-1">
                Suporta MP4, WebM ou MOV acelerado por hardware localmente
              </p>
            </div>
            <span className="text-[9px] text-[#ffb693]/50 font-mono py-1 px-2.5 bg-[#201f1f] rounded border border-[#5a4136]/20">
              100% Processado no Navegador (Privacidade Total)
            </span>
          </div>
        </div>
      ) : (
        // Video Edit & Trimmer workspace
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT: Video Player and Timeline Trimming */}
          <div className="space-y-4">
            <div className="bg-black/40 p-3 rounded-xl border border-[#5a4136]/20 space-y-3">
              <span className="text-[10px] text-[#ffb693] font-mono tracking-wider uppercase block font-semibold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#ff6b00]" /> Vídeo Original do Exercício
              </span>

              {/* Responsive Video Container based on Crop Aspect Ratio */}
              <div className="flex justify-center bg-[#131111] rounded-lg overflow-hidden border border-[#5a4136]/20 relative aspect-video max-h-72">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                  playsInline
                  crossOrigin="anonymous"
                />
                
                {/* Visual Crop Box overlay mock to show user area */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className={`border border-dashed border-[#ff6b00]/60 bg-[#ff6b00]/5 max-w-full max-h-full transition-all duration-300 ${
                    cropRatio === '1:1' ? 'aspect-square h-5/6' :
                    cropRatio === '16:9' ? 'aspect-video w-5/6' :
                    'aspect-[3/4] h-5/6'
                  }`} />
                </div>
              </div>

              {/* Player Timeline Tracker and Play Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#e2bfb0]/80">
                  <span className="font-mono text-xs">{currentTime.toFixed(2)}s / {duration.toFixed(2)}s</span>
                  <span className="bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase text-[#ff6b00] border border-orange-500/15">
                    Trim: [{startTime.toFixed(1)}s - {endTime.toFixed(1)}s]
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => {
                    const seekVal = parseFloat(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.currentTime = seekVal;
                      setCurrentTime(seekVal);
                    }
                  }}
                  className="w-full accent-[#ff6b00] h-1.5 bg-[#4c352a]/40 rounded-lg cursor-pointer"
                />

                {/* Video controls toolbar */}
                <div className="flex gap-2 items-center justify-between pt-1">
                  <button 
                    onClick={togglePlay}
                    className="bg-[#2a2727] hover:bg-[#3d3838] border border-[#5a4136]/40 p-2 rounded-lg text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-[#ffb693]" /> : <Play className="w-4 h-4 text-[#ff6b00]" />}
                    <span className="text-[10px] uppercase font-bold font-mono px-0.5">{isPlaying ? 'Pausar' : 'Play'}</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={setTrimStartToCurrent}
                      className="bg-orange-950/20 hover:bg-orange-950/40 border border-[#ff6b00]/30 hover:border-[#ff6b00]/60 text-[#ffb693] font-mono text-[10px] px-2.5 py-2 rounded transition cursor-pointer flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3 text-[#ff6b00]" /> Def. Início ({currentTime.toFixed(1)}s)
                    </button>
                    <button
                      onClick={setTrimEndToCurrent}
                      className="bg-red-950/20 hover:bg-red-900/20 border border-orange-500/30 hover:border-orange-500/60 text-[#ffb693] font-mono text-[10px] px-2.5 py-2 rounded transition cursor-pointer flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3 text-orange-500" /> Def. Fim ({currentTime.toFixed(1)}s)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Box */}
            <div className="bg-[#201f1f] p-4 rounded-xl border border-[#5a4136]/20 space-y-4">
              <span className="text-[10px] text-[#ffb693] font-mono tracking-wider uppercase block font-semibold flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-[#ff6b00]" /> Ajustes de Formato de Saída (Ultra Otimizado)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Formato do Recorte</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['1:1', '16:9', '3:4'] as const).map(ratio => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setCropRatio(ratio)}
                        className={`text-[10px] font-bold p-2 rounded transition font-mono ${
                          cropRatio === ratio
                            ? 'bg-[#ff6b00] text-black'
                            : 'bg-[#131111] hover:bg-[#1a1818] text-white/70 border border-[#5a4136]/20'
                        }`}
                      >
                        {ratio === '1:1' ? '1:1 (Quadrado)' : ratio === '16:9' ? '16:9 (Landscape)' : '3:4 (Retrato)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Resolução (Tamanho do Arquivo)</label>
                  <select
                    value={outputScale}
                    onChange={e => setOutputScale(Number(e.target.value))}
                    className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                  >
                    <option value="160">160px (Ultra Leve ~100kb, Recomendado)</option>
                    <option value="200">200px (Equilibrado ~250kb)</option>
                    <option value="240">240px (Médio ~400kb)</option>
                    <option value="320">320px (Alto ~700kb, Lento/Pesado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Taxa de Quadros (Smoothness)</label>
                  <div className="flex gap-2">
                    {[5, 8, 12].map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFps(f)}
                        className={`flex-1 text-[11px] py-1.5 rounded transition font-mono font-bold ${
                          fps === f
                            ? 'bg-[#ff6b00]/20 border border-[#ff6b00] text-[#ffb693]'
                            : 'bg-[#131111] hover:bg-[#1c1a1a] text-white/50 border border-[#5a4136]/10'
                        }`}
                      >
                        {f} FPS {f === 5 ? '(Retrô)' : f === 8 ? '(Normal)' : '(Liso)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-end pt-1">
                  <div className="text-[10px] text-[#e2bfb0]/50 space-y-0.5 leading-tight font-mono bg-[#131111] p-2 rounded border border-[#5a4136]/10">
                    <div className="flex justify-between">
                      <span>Duração do clipe:</span>
                      <span className="text-[#ffb693]">{(endTime - startTime).toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frames estimados:</span>
                      <span className="text-[#ffb693]">{Math.max(1, Math.round((endTime - startTime) * fps))} quadros</span>
                    </div>
                  </div>
                </div>
              </div>

              {!isCompiling ? (
                <button
                  type="button"
                  onClick={compileGif}
                  className="w-full bg-[#ff6b00] hover:bg-orange-500 text-black font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                  CORTER EXERCÍCIO & GERAR GIF ANIMADO
                </button>
              ) : (
                <div className="bg-[#131111] rounded-lg p-3.5 border border-orange-500/20 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-white animate-pulse">⚙️ COMPILANDO GIF...</span>
                    <span className="font-mono font-bold text-[#ff6b00]">{compileProgress}%</span>
                  </div>
                  
                  {/* Real progress bar */}
                  <div className="w-full bg-[#201f1f] h-2 rounded-full overflow-hidden border border-[#5a4136]/30">
                    <div 
                      className="bg-[#ff6b00] h-full transition-all duration-300"
                      style={{ width: `${compileProgress}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-[#e2bfb0]/80 leading-relaxed truncate">
                    {progressText}
                  </p>

                  <button
                    type="button"
                    onClick={() => { abortCompileRef.current = true; }}
                    className="absolute top-2.5 right-2 bg-red-950/30 text-red-400 hover:bg-red-900/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold hover:text-red-300 text-[10px] border border-red-500/20"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Results Preview & Linking Tools */}
          <div className="space-y-4">
            <div className="bg-black/40 p-4 rounded-xl border border-[#5a4136]/20 flex flex-col justify-center items-center min-h-[280px] text-center space-y-4 relative">
              <span className="text-[10px] text-[#ffb693] font-mono tracking-wider uppercase absolute top-3 left-3 font-semibold flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-[#ff6b00]" /> Resultado / Prévia do Loop
              </span>

              {!gifResult ? (
                <div className="flex flex-col items-center justify-center text-[#e2bfb0]/40 space-y-2 py-20">
                  <RefreshCw className="w-10 h-10 stroke-[1.2] animate-pulse" />
                  <p className="text-xs">
                    Nenhum GIF gerado ainda.<br />Ajuste o trecho do vídeo e clique em "Gerar" à esquerda.
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-4 pt-4 flex flex-col items-center">
                  
                  {/* Real looping GIF image */}
                  <div className="relative rounded-xl overflow-hidden border border-[#ff6b00]/30 shadow-2xl bg-[#131111] p-1 scale-100 max-w-xs flex items-center justify-center">
                    <img 
                      src={gifResult} 
                      alt="Exercício em Loop" 
                      className="rounded-lg max-h-56 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 rounded text-[9px] text-[#ffb693] font-mono font-bold uppercase tracking-wide">
                      Loop Ativo
                    </span>
                  </div>

                  <div className="p-3 bg-[#201f1f] rounded-lg border border-[#5a4136]/35 text-left text-xs max-w-sm w-full space-y-2.5 select-none">
                    <div className="flex justify-between font-mono text-[10px] border-b border-[#5a4136]/20 pb-1.5">
                      <span className="text-white/60">Tamanho do GIF:</span>
                      <span className={`font-bold ${gifSizeKb > 700 ? 'text-red-400' : gifSizeKb > 400 ? 'text-orange-400' : 'text-green-400'}`}>
                        {gifSizeKb} KB
                      </span>
                    </div>

                    {gifSizeKb > 750 && (
                      <div className="flex gap-2 bg-red-950/15 border border-red-500/20 text-red-200 p-2.5 rounded text-[10px] leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div>
                          <p className="font-extrabold uppercase">Aviso: Arquivo Grande</p>
                          <p className="mt-0.5">O arquivo gerado excede 750KB. Recomendamos encurtar o tempo do clipe (ex: 2 segundos) ou baixar para 160px para melhor performance dos alunos.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleDownload}
                        className="flex-1 bg-[#2a2727] hover:bg-[#3d3838] border border-[#5a4136]/40 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-[#ff6b00]" /> Baixar GIF
                      </button>

                      {onLinkToChallenge && (
                        <button
                          onClick={handleLinkToCurrentChallenge}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-[#ff6b00] hover:brightness-110 font-black text-black py-2 px-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Fixar em Desafio
                        </button>
                      )}
                    </div>
                  </div>

                  {/* LINK TO EXERCISE SELECTION TOOL */}
                  {onLinkToExercise && (
                    <div className="p-4 bg-[#201f1f] rounded-lg border border-[#5a4136]/35 text-left w-full space-y-3 max-w-sm">
                      <span className="text-[10px] text-[#ffb693] font-mono tracking-wider uppercase block font-semibold flex items-center gap-1">
                        <Link className="w-3 h-3 text-[#ff6b00]" /> Vincular a um Exercício do Acervo
                      </span>
                      
                      <div className="space-y-2">
                        <select
                          value={linkedId}
                          onChange={e => setLinkedId(e.target.value)}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                        >
                          <option value="">-- Selecionar Exercício --</option>
                          {EXERCISE_DATABASE.map(ex => (
                            <option key={ex.id} value={ex.id}>
                              {ex.name} ({ex.category === 'strength' ? 'Força' : ex.category === 'cardio' ? 'Cardio' : 'Mobilidade'})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleLinkToChosenExercise}
                          disabled={!linkedId}
                          className="w-full bg-[#2a2727] hover:bg-[#3d3838] disabled:opacity-50 disabled:cursor-not-allowed border border-[#5a4136]/40 text-[#ffb693] font-extrabold py-1.5 px-3 rounded-lg text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Salvar GIF no Exercício Selecionado
                        </button>
                      </div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-green-950/15 border border-green-500/20 text-green-300 p-3 rounded-lg text-xs leading-relaxed max-w-sm text-left flex items-start gap-2 animate-bounce">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Quick manual tip */}
            <div className="bg-[#201f1f] p-3.5 rounded-xl border border-[#5a4136]/10 text-xs text-[#e2bfb0]/70 flex gap-2.5 items-start">
              <Compass className="w-6 h-6 text-[#ff6b00] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Como fazer imagens animadas eficientes?</p>
                <ol className="list-decimal list-inside text-[11px] mt-1 space-y-0.5 text-[#e2bfb0]/80">
                  <li>Escolha vídeos de no máximo 5-10 segundos.</li>
                  <li>Use o playhead para encontrar o início e o fim da execução ideal.</li>
                  <li>Mantenha o recorte em no máximo 160-240px de escala.</li>
                  <li>O GIF gerado rodará em loop, dando uma imagem de execução perfeita para o aluno.</li>
                </ol>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
