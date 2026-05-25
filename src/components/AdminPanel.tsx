import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { EXERCISE_DATABASE } from '../data';
import { Exercise, PositionImage } from '../types';
import { 
  Users, Award, Bell, Shield, Plus, Trash2, Edit, Save, ArrowLeft,
  Dumbbell, CheckCircle, RefreshCw, Eye, Check, Edit2, Upload, 
  Camera, Video, Info, Calendar, AlignLeft, AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  currentUserEmail: string | null;
  onAnnounceCreated?: () => void;
  activeRole?: 'aluno' | 'personal' | 'admin';
}

// HTML5 Canvas markup drawer for Personal Trainers to annotate exercise frames
function CanvasDrawingEditor({ 
  imageUrl, 
  onSave, 
  onClose 
}: { 
  imageUrl: string; 
  onSave: (base64: string) => void; 
  onClose: () => void; 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#ff6b00');
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState<'free' | 'arrow' | 'circle' | 'text'>('free');
  const [textInput, setTextInput] = useState('POSTURA');
  const [isDrawing, setIsDrawing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(640);
  const [canvasHeight, setCanvasHeight] = useState(360);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const aspect = img.width / img.height;
      let w = 640;
      let h = 360;
      if (aspect > 1.77) {
        h = 640 / aspect;
      } else {
        w = 360 * aspect;
      }
      setCanvasWidth(Math.round(w));
      setCanvasHeight(Math.round(h));
      
      setTimeout(() => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      }, 70);
    };
    img.src = imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=640';
  }, [imageUrl]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    startPos.current = { x, y };
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'free') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'text') {
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(textInput, x, y);
      ctx.fillText(textInput, x, y);
      setIsDrawing(false); 
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'free') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    if (tool === 'arrow') {
      const fromx = startPos.current.x;
      const fromy = startPos.current.y;
      const tox = x;
      const toy = y;
      
      const headlen = 12;
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (tool === 'circle') {
      const r = Math.sqrt(Math.pow(x - startPos.current.x, 2) + Math.pow(y - startPos.current.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.current.x, startPos.current.y, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#1c1b1b] border border-[#ff6b00]/30 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#5a4136]/15 pb-3">
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 text-[#ff6b00]" />
            <h3 className="text-sm font-bold text-[#ffb693] uppercase tracking-wider font-mono">Quadro de Anotações do Personal</h3>
          </div>
          <button onClick={onClose} className="text-[#e2bfb0]/75 hover:text-white font-mono text-xs hover:underline cursor-pointer">Fechar</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#131111] rounded-lg border border-[#5a4136]/30 text-xs items-center">
          <div className="flex flex-wrap gap-1.5">
            {(['free', 'arrow', 'circle', 'text'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTool(t)}
                className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition ${tool === t ? 'bg-[#ff6b00] text-black font-extrabold' : 'bg-[#201f1f] text-white/80 hover:bg-neutral-800'}`}
              >
                {t === 'free' ? '🖌️ Pincel' : t === 'arrow' ? '➡️ Seta' : t === 'circle' ? '⭕ Círculo' : '✍️ Texto'}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2">
            {tool === 'text' && (
              <input
                type="text"
                placeholder="Insira o texto..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="bg-[#2a2727] border border-[#5a4136]/50 rounded px-2 py-1 text-xs text-white max-w-[120px] focus:ring-1 focus:ring-[#ff6b00] outline-none"
              />
            )}

            <div className="flex gap-1.5 items-center">
              {['#ff6b00', '#22c55e', '#ef4444', '#ffffff', '#eab308'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-4.5 h-4.5 rounded-full border border-black/30 cursor-pointer transition ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center bg-black/40 p-1.5 rounded-xl border border-[#5a4136]/10">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            className="border border-[#ff6b00]/15 max-w-full cursor-crosshair rounded-lg bg-[#131313]"
          />
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-[10px] text-[#e2bfb0]/70 leading-relaxed">
            💡 <strong>Instruções:</strong> Arraste para desenhar setas, círculos em articulações ou pincel livre. Para Texto, digite e clique na foto onde deseja aplicá-lo.
          </p>
          <div className="flex justify-end gap-2.5 border-t border-[#5a4136]/10 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#201f1f] border border-[#5a4136]/30 text-[#e2bfb0] text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#ff6b00] text-black text-xs font-extrabold rounded-lg hover:bg-orange-500 cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Salvar Desenho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ currentUserEmail, onAnnounceCreated, activeRole = 'admin' }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('Central de Longevidade');
  const [publishing, setPublishing] = useState(false);
  
  // States for attached media and exercise referencing in challenges
  const [challengeImageUrl, setChallengeImageUrl] = useState('');
  const [challengeVideoUrl, setChallengeVideoUrl] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

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
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const handleSelectExerciseForChallenge = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    if (!exerciseId) {
      setChallengeImageUrl('');
      setChallengeVideoUrl('');
      return;
    }
    const found = EXERCISE_DATABASE.find(ex => ex.id === exerciseId);
    if (found) {
      setChallengeImageUrl(found.imageUrl || '');
      setChallengeVideoUrl(found.videoUrl || '');
      if (!newTitle) {
        setNewTitle(`Desafio de Longevidade: ${found.name}`);
      }
      if (!newContent) {
        setNewContent(`Que tal praticarmos o exercício "${found.name}" hoje? Recomendo fortemente este movimento para ativar suas articulações de maneira segura e saudável. Assista ao vídeo de instrução!`);
      }
    }
  };

  const handleUploadChallengeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Arquivo muito pesado! Máximo de 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setChallengeImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<Partial<Exercise> | null>(null);
  const [savingUserExercises, setSavingUserExercises] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [activeDrawImageUrl, setActiveDrawImageUrl] = useState('');
  const [activeDrawIndex, setActiveDrawIndex] = useState<number | null>(null); // -1 for main, 0+ for positionImages, -2 for recording feedback

  // --- 🧭 NEW CORE ADMIN SUB-TABS STATE ---
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'challenges' | 'create_exercise' | 'sequences' | 'recordings' | 'notifications'>('users');

  useEffect(() => {
    if (activeRole === 'personal' && (adminSubTab === 'create_exercise' || adminSubTab === 'challenges')) {
      setAdminSubTab('users');
    }
  }, [activeRole, adminSubTab]);

  // --- 🏋️ GLOBAL EXERCISES STATE ---
  const [globalExercisesList, setGlobalExercisesList] = useState<Exercise[]>([]);
  const [loadingGlobalEx, setLoadingGlobalEx] = useState(false);
  const [savingGlobalEx, setSavingGlobalEx] = useState(false);

  // Form states for creating a new global exercise
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<'strength' | 'cardio' | 'mobility' | 'longevity'>('strength');
  const [newExDuration, setNewExDuration] = useState(45);
  const [newExDescription, setNewExDescription] = useState('');
  const [newExFormTip, setNewExFormTip] = useState('');
  const [newExAdaptedFor, setNewExAdaptedFor] = useState('Fortalecimento articular para faixa 40+');
  const [newExImageUrl, setNewExImageUrl] = useState('');
  const [newExSteps, setNewExSteps] = useState<string[]>(['Fase de ativação isométrica lenta', 'Fase excêntrica controlada']);
  const [newExDonts, setNewExDonts] = useState<string[]>(['Não faça compensações articulares bruscas']);
  const [newExTargetJoints, setNewExTargetJoints] = useState<string[]>(['Joelhos']);

  // --- ⏱ SEQUENCES STATE ---
  const [sequencesList, setSequencesList] = useState<any[]>([]);
  const [loadingSequences, setLoadingSequences] = useState(false);
  const [savingSeq, setSavingSeq] = useState(false);

  // Form states for sequence builder
  const [seqTitle, setSeqTitle] = useState('');
  const [seqDescription, setSeqDescription] = useState('');
  const [seqCategory, setSeqCategory] = useState<'strength' | 'cardio' | 'mobility' | 'combined'>('strength');
  const [seqDuration, setSeqDuration] = useState(15);
  const [seqTrainer, setSeqTrainer] = useState(currentUserEmail ? currentUserEmail.split('@')[0] : 'Rafael Persano');
  const [seqSelectedEx, setSeqSelectedEx] = useState<string[]>([]); // Array of selected exercise template ids or custom ids

  // --- 📢 NOTIFICATIONS STATE ---
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [publishingNotification, setPublishingNotification] = useState(false);
  
  // Notification Form States
  const [notifHeaderTitle, setNotifHeaderTitle] = useState('');
  const [notifBodyMsg, setNotifBodyMsg] = useState('');
  const [notifSelectedStudent, setNotifSelectedStudent] = useState('all'); // 'all' or specific student email

  // --- 🎥 RECORDINGS STATE (PHYSICAL FORM REVIEW) ---
  const [recordingsList, setRecordingsList] = useState<any[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const [trainerFeedbackText, setTrainerFeedbackText] = useState('');
  const [feedbackAnnotatedImage, setFeedbackAnnotatedImage] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const q = collection(db, 'notifications');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      list.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setNotificationsList(list);
    } catch (err) {
      console.warn("Error loading notifications in admin:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = collection(db, 'users');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsers(list);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const q = collection(db, 'challenges');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChallenges(list);
    } catch (e) {
      console.error('Error fetching challenges:', e);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const fetchGlobalExercises = async () => {
    setLoadingGlobalEx(true);
    try {
      const q = collection(db, 'global_exercises');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Exercise));
      setGlobalExercisesList(list);
    } catch (err) {
      console.warn("Error loading global exercises:", err);
    } finally {
      setLoadingGlobalEx(false);
    }
  };

  const fetchSequences = async () => {
    setLoadingSequences(true);
    try {
      const q = collection(db, 'sequences');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSequencesList(list);
    } catch (err) {
      console.warn("Error loading sequences:", err);
    } finally {
      setLoadingSequences(false);
    }
  };

  const fetchRecordings = async () => {
    setLoadingRecordings(true);
    try {
      const q = collection(db, 'recordings');
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setRecordingsList(list);
    } catch (err) {
      console.warn("Error loading student recordings:", err);
    } finally {
      setLoadingRecordings(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchChallenges();
    fetchGlobalExercises();
    fetchSequences();
    fetchRecordings();
    fetchNotifications();
  }, []);

  const handlePublishNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifHeaderTitle.trim() || !notifBodyMsg.trim()) {
      alert("Por favor, preencha o título e o corpo da mensagem.");
      return;
    }

    setPublishingNotification(true);
    try {
      const notifId = 'notif_' + Date.now();
      const notifDoc = {
        title: notifHeaderTitle.trim(),
        body: notifBodyMsg.trim(),
        targetStudent: notifSelectedStudent,
        createdAt: new Date().toISOString(),
        sentBy: currentUserEmail || 'Rafael Persano (Personal)',
        readBy: []
      };

      await setDoc(doc(db, 'notifications', notifId), notifDoc);
      setNotifHeaderTitle('');
      setNotifBodyMsg('');
      setNotifSelectedStudent('all');
      
      await fetchNotifications();
    } catch (err) {
      console.error("Error creating notification document:", err);
      alert("Erro ao salvar notificação: " + (err as Error).message);
    } finally {
      setPublishingNotification(false);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta notificação do Firestore?")) return;
    try {
      await deleteDoc(doc(db, 'notifications', notifId));
      await fetchNotifications();
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Erro ao excluir notificação.");
    }
  };

  const handlePublishChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setPublishing(true);
    try {
      const challengeId = 'challenge_' + Date.now();
      const challengeDoc = {
        title: newTitle,
        content: newContent,
        author: newAuthor || 'Administração Vitality',
        imageUrl: challengeImageUrl || '',
        videoUrl: challengeVideoUrl || '',
        exerciseId: selectedExerciseId || '',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'challenges', challengeId), challengeDoc);
      setNewTitle('');
      setNewContent('');
      setChallengeImageUrl('');
      setChallengeVideoUrl('');
      setSelectedExerciseId('');
      fetchChallenges();
      if (onAnnounceCreated) onAnnounceCreated();
    } catch (err) {
      console.error('Error publishing announcement:', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'challenges', id));
      fetchChallenges();
    } catch (err) {
      console.error('Error deleting challenge:', err);
    }
  };

  // --- 🏋️ CREAR NOVO EXERCÍCIO GLOBAL (Gerar exercícios novo) ---
  const handleCreateGlobalExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) {
      alert("Por favor insira um nome para o exercício!");
      return;
    }
    setSavingGlobalEx(true);
    try {
      const customId = 'glob_' + Date.now();
      const docPayload: Exercise = {
        id: customId,
        name: newExName,
        category: newExCategory,
        duration: newExDuration,
        description: newExDescription,
        formTip: newExFormTip,
        adaptedFor: newExAdaptedFor || 'Prevenção de Lesões 40+',
        imageUrl: newExImageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=640',
        steps: newExSteps.filter(s => s.trim() !== ''),
        donts: newExDonts.filter(d => d.trim() !== ''),
        targetJoints: newExTargetJoints.filter(j => j.trim() !== '')
      };

      await setDoc(doc(db, 'global_exercises', customId), docPayload);
      
      // Reset form fields
      setNewExName('');
      setNewExDescription('');
      setNewExFormTip('');
      setNewExImageUrl('');
      setNewExSteps(['Fase de ativação isométrica lenta', 'Fase excêntrica controlada']);
      setNewExDonts(['Não faça compensações articulares bruscas']);
      setNewExTargetJoints(['Joelhos']);

      fetchGlobalExercises();
      alert("Novo exercício clínico criado com sucesso no banco de dados!");
    } catch (err) {
      console.error("Error creating global exercise:", err);
      alert("Erro ao gravar exercício global no banco.");
    } finally {
      setSavingGlobalEx(false);
    }
  };

  const handleDeleteGlobalExercise = async (id: string) => {
    if (!window.confirm("Deseja realmente apagar este exercício do banco global?")) return;
    try {
      await deleteDoc(doc(db, 'global_exercises', id));
      fetchGlobalExercises();
    } catch (err) {
      console.error("Error deleting global exercise:", err);
    }
  };

  // --- ⏱ GERAR SEQUENCIA DE TREINAMENTO DO PROGRAMA ---
  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seqTitle.trim() || !seqDescription.trim()) {
      alert("Por favor forneça título e descrição dos objetivos!");
      return;
    }
    if (seqSelectedEx.length === 0) {
      alert("Por favor selecione pelo menos 1 exercício para a sequência!");
      return;
    }

    setSavingSeq(true);
    try {
      const customId = 'seq_' + Date.now();
      // Gather selected Exercise objects from default database + global exercises list
      const combinedPool = [...EXERCISE_DATABASE, ...globalExercisesList];
      const selectedObjList = seqSelectedEx.map(exId => combinedPool.find(item => item.id === exId)).filter(Boolean) as Exercise[];

      const docPayload = {
        id: customId,
        title: seqTitle,
        description: seqDescription, // SATISFIES THE "OBJETIVOS DO PROGRAMA" DETAILS!
        category: seqCategory,
        totalDuration: Number(seqDuration),
        exercises: selectedObjList,
        estimatedCalories: selectedObjList.length * 25,
        personalTrainerName: seqTrainer || 'Rafael Persano', // SATISFIES PERSONAL PROGRAM WITH COACH NAME!
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'sequences', customId), docPayload);

      // Reset sequence form fields
      setSeqTitle('');
      setSeqDescription('');
      setSeqSelectedEx([]);
      
      fetchSequences();
      alert("Sequência de Treinamento prescrita com sucesso no banco global!");
    } catch (err) {
      console.error("Error creating sequence:", err);
      alert("Erro ao salvar sequência no Firestore.");
    } finally {
      setSavingSeq(false);
    }
  };

  const handleDeleteSequence = async (id: string) => {
    if (!window.confirm("Deseja deletar esta sequência de treinamento?")) return;
    try {
      await deleteDoc(doc(db, 'sequences', id));
      fetchSequences();
    } catch (err) {
      console.error("Error deleting sequence:", err);
    }
  };

  // --- 🎥 SALVAR FEEDBACK DO PERSONAL EM EXECUÇÃO FILMADA ---
  const handleSaveTrainerFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecording) return;

    setSavingFeedback(true);
    try {
      const updatedDoc = {
        ...selectedRecording,
        trainerFeedback: trainerFeedbackText,
        trainerFeedbackAnnotatedImage: feedbackAnnotatedImage || selectedRecording.trainerFeedbackAnnotatedImage || ""
      };

      await setDoc(doc(db, 'recordings', selectedRecording.id), updatedDoc);
      alert("Feedback e observações salvas com sucesso no prontuário do aluno!");
      
      setSelectedRecording(null);
      setTrainerFeedbackText('');
      setFeedbackAnnotatedImage('');
      fetchRecordings();
    } catch (err) {
      console.error("Error saving trainer feedback on recording document:", err);
      alert("Erro ao salvar feedback do personal.");
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleOpenDrawOnRecording = () => {
    if (!selectedRecording) return;
    setActiveDrawIndex(-2); // Special index representing recording feedback
    
    // Choose selectedRecording video frame snapshot template URL, or fallback to an action illustration
    const imageUrlToDraw = selectedRecording.videoUrl && !selectedRecording.videoUrl.startsWith('https://lh3.googleusercontent.com')
      ? selectedRecording.videoUrl
      : "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=640"; // nice posture template fallback

    setActiveDrawImageUrl(imageUrlToDraw);
    setShowDrawingCanvas(true);
  };

  // --- 👤 Personal Trainer Customization Controls ---
  const handleSelectUserForCustomization = (u: any) => {
    setSelectedUser(u);
    setUserExercises(u.customExercises || []);
    setEditingExercise(null);
  };

  const handleInitExerciseDraft = (isFromScratch: boolean) => {
    if (isFromScratch) {
      const newEx: Exercise = {
        id: 'cust_ex_' + Date.now(),
        name: 'Novo Exercício Personalizado',
        category: 'strength',
        duration: 45,
        description: 'Descrição executiva do exercício...',
        formTip: 'Dica científica para preservar articulações.',
        adaptedFor: 'Postura de Longevidade Ativa.',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=640',
        steps: ['Alinhamento articular inicial', 'Execução cadenciada lenta', 'Retorno respiratório controlado'],
        donts: ['Fazer rotação compensatória', 'Bloquear respiração'],
        targetJoints: ['Joelhos', 'Core'],
        positionImages: [
          { label: 'Movimento A: Postura Inicial', imageUrl: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=640' },
          { label: 'Movimento B: Meio de Curso', imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=640' },
          { label: 'Movimento C: Ponto de Carga', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=640' }
        ]
      };
      setEditingExercise(newEx);
    } else {
      if (!selectedTemplateId) return;
      handleImportExerciseTemplate(selectedTemplateId);
      setSelectedTemplateId('');
    }
  };

  const handleImportExerciseTemplate = (templateId: string) => {
    const template = EXERCISE_DATABASE.find(ex => ex.id === templateId);
    if (!template) return;
    
    const copiedEx: Exercise = {
      ...template,
      id: 'cust_ex_' + template.id + '_' + Date.now(),
      name: `${template.name} (Customizado)`,
      positionImages: [
        { label: 'Movimento A (Postura de Início)', imageUrl: template.imageUrl },
        { label: 'Movimento B (Vetores de Força)', imageUrl: template.imageUrl },
        { label: 'Movimento C (Retorno Excêntrico)', imageUrl: template.imageUrl }
      ]
    };
    setEditingExercise(copiedEx);
  };

  const handleUploadFileToField = (e: React.ChangeEvent<HTMLInputElement>, fieldIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 14 * 1024 * 1024) {
      alert("Arquivo muito pesado! Máximo 12MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (fieldIndex === -1) {
        setEditingExercise(prev => prev ? { ...prev, imageUrl: base64String } : null);
      } else {
        const list = [...(editingExercise?.positionImages || [])];
        if (list[fieldIndex]) {
          list[fieldIndex] = { ...list[fieldIndex], imageUrl: base64String };
          setEditingExercise(prev => prev ? { ...prev, positionImages: list } : null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenDrawOnField = (fieldIndex: number) => {
    if (!editingExercise) return;
    setActiveDrawIndex(fieldIndex);
    const url = fieldIndex === -1 
      ? (editingExercise.imageUrl || '') 
      : (editingExercise.positionImages?.[fieldIndex]?.imageUrl || '');
    
    if (url.startsWith('data:video/')) {
      alert("Vídeos não aceitam anotações gráficas no canva.");
      return;
    }
    
    setActiveDrawImageUrl(url);
    setShowDrawingCanvas(true);
  };

  const handleSaveAnnotatedImage = (base64Result: string) => {
    if (activeDrawIndex === -2) {
      setFeedbackAnnotatedImage(base64Result);
      setShowDrawingCanvas(false);
      setActiveDrawIndex(null);
      return;
    }

    if (!editingExercise) return;
    
    if (activeDrawIndex === -1) {
      setEditingExercise(prev => prev ? { ...prev, imageUrl: base64Result } : null);
    } else if (activeDrawIndex !== null && activeDrawIndex >= 0) {
      const list = [...(editingExercise.positionImages || [])];
      if (list[activeDrawIndex]) {
        list[activeDrawIndex] = { ...list[activeDrawIndex], imageUrl: base64Result };
        setEditingExercise(prev => prev ? { ...prev, positionImages: list } : null);
        
        if (activeDrawIndex === 0 && (!editingExercise.imageUrl || editingExercise.imageUrl.includes('unsplash'))) {
          setEditingExercise(prev => prev ? { ...prev, imageUrl: base64Result } : null);
        }
      }
    }
    
    setShowDrawingCanvas(false);
    setActiveDrawIndex(null);
  };

  const handleUpdateStep = (idx: number, val: string) => {
    if (!editingExercise) return;
    const steps = [...(editingExercise.steps || [])];
    steps[idx] = val;
    setEditingExercise({ ...editingExercise, steps });
  };
  
  const handleAddStep = () => {
    if (!editingExercise) return;
    const steps = [...(editingExercise.steps || []), ''];
    setEditingExercise({ ...editingExercise, steps });
  };
  
  const handleRemoveStep = (idx: number) => {
    if (!editingExercise) return;
    const steps = (editingExercise.steps || []).filter((_, i) => i !== idx);
    setEditingExercise({ ...editingExercise, steps });
  };

  const handleUpdateDont = (idx: number, val: string) => {
    if (!editingExercise) return;
    const donts = [...(editingExercise.donts || [])];
    donts[idx] = val;
    setEditingExercise({ ...editingExercise, donts });
  };
  
  const handleAddDont = () => {
    if (!editingExercise) return;
    const donts = [...(editingExercise.donts || []), ''];
    setEditingExercise({ ...editingExercise, donts });
  };
  
  const handleRemoveDont = (idx: number) => {
    if (!editingExercise) return;
    const donts = (editingExercise.donts || []).filter((_, i) => i !== idx);
    setEditingExercise({ ...editingExercise, donts });
  };

  const handleUpdatePositionLabel = (idx: number, label: string) => {
    if (!editingExercise) return;
    const positionImages = [...(editingExercise.positionImages || [])];
    if (positionImages[idx]) {
      positionImages[idx] = { ...positionImages[idx], label };
      setEditingExercise({ ...editingExercise, positionImages });
    }
  };

  const handleAddPositionFrame = () => {
    if (!editingExercise) return;
    const currentLen = editingExercise.positionImages?.length || 0;
    const char = String.fromCharCode(65 + currentLen);
    const newItem = {
      label: `Movimento ${char}: Nova Posição`,
      imageUrl: editingExercise.imageUrl || 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=640'
    };
    setEditingExercise({
      ...editingExercise,
      positionImages: [...(editingExercise.positionImages || []), newItem]
    });
  };

  const handleRemovePositionFrame = (idx: number) => {
    if (!editingExercise) return;
    setEditingExercise({
      ...editingExercise,
      positionImages: (editingExercise.positionImages || []).filter((_, i) => i !== idx)
    });
  };

  const handleSaveDraftToLocalList = () => {
    if (!editingExercise || !editingExercise.name?.trim()) {
      alert("Por favor, dê nome ao exercício.");
      return;
    }
    
    const id = editingExercise.id || 'cust_ex_' + Date.now();
    const cleanDraft: Exercise = {
      ...(editingExercise as Exercise),
      id,
      steps: editingExercise.steps || [],
      donts: editingExercise.donts || [],
      targetJoints: typeof editingExercise.targetJoints === 'string'
        ? (editingExercise.targetJoints as string).split(',').map(s => s.trim())
        : (editingExercise.targetJoints || [])
    };

    const exists = userExercises.some(ex => ex.id === id);
    let updated;
    if (exists) {
      updated = userExercises.map(ex => ex.id === id ? cleanDraft : ex);
    } else {
      updated = [...userExercises, cleanDraft];
    }
    
    setUserExercises(updated);
    setEditingExercise(null);
  };

  const handleRemoveUserCustomExercise = (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("Deseja mesmo retirar este exercício customizado?")) {
      setUserExercises(userExercises.filter(ex => ex.id !== id));
    }
  };

  const handleSyncCustomWorkoutsToFirestore = async () => {
    if (!selectedUser) return;
    setSavingUserExercises(true);
    try {
      const userDocRef = doc(db, 'users', selectedUser.uid);
      const updatedUserProps = {
        ...selectedUser,
        customExercises: userExercises
      };
      
      await setDoc(userDocRef, updatedUserProps, { merge: true });
      setSelectedUser(updatedUserProps);
      setUsers(prev => prev.map(u => u.uid === selectedUser.uid ? updatedUserProps : u));
      alert(`Treinos de ${selectedUser.name} salvos com sucesso no bando de dados!`);
    } catch (e) {
      console.error(e);
      alert("Erro ao gravar alterações no banco Firestore.");
    } finally {
      setSavingUserExercises(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-[#ff6b00] uppercase tracking-widest font-bold flex items-center gap-1.5 font-mono">
            <Shield className="w-4 h-4 fill-[#ff6b00]/10 text-[#ff6b00]" /> Painel Administrativo de Longevidade
          </p>
          <h2 className="text-2xl font-black text-white font-sans tracking-tight">
            Personal Trainer: <span className="text-[#ffb693]">{currentUserEmail || 'Gerente Vitality'}</span>
          </h2>
          <p className="text-xs text-[#e2bfb0]/70">Construa treinos personalizados, anote fotos com vetores articulares e defina fases de movimento A, B, C.</p>
        </div>
        <button 
          onClick={() => { fetchUsers(); fetchChallenges(); }}
          className="p-2.5 rounded-lg bg-[#201f1f] hover:bg-[#2e2d2d] border border-[#5a4136]/35 text-[#ffb693] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar Dados
        </button>
      </div>

      {selectedUser ? (
        <div className="bg-[#1c1b1b] rounded-2xl border border-[#ff6b00]/30 overflow-hidden shadow-2xl relative">
          
          <div className="bg-[#241e1b] p-5 border-b border-[#5a4136]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono bg-orange-600/15 border border-orange-500/30 text-orange-400 px-2.5 py-0.5 rounded-full font-bold">
                Prescrição Ativa do Personal
              </span>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-1.5 font-sans">
                <Users className="w-5 h-5 text-[#ff6b00]" /> Aluno: {selectedUser.name}
              </h3>
              <p className="text-xs text-[#e2bfb0]/80">
                Idade Biol: <span className="text-green-400 font-bold">{selectedUser.biologicalAge || 'N/A'}</span> • Limitações: <span className="text-red-400 font-bold">{(selectedUser.restrictions || []).join(', ') || 'Nenhuma'}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3.5 py-2 rounded-lg bg-[#201f1f] border border-[#5a4136]/30 text-xs text-[#e2bfb0] font-sans font-bold flex items-center gap-1.5 hover:bg-neutral-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              <button
                onClick={handleSyncCustomWorkoutsToFirestore}
                disabled={savingUserExercises}
                className="px-4 py-2 rounded-lg bg-[#ff6b00] text-black text-xs font-black flex items-center gap-1.5 hover:bg-orange-500 transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {savingUserExercises ? 'Sincronizando...' : 'Publicar Treino'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {editingExercise ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#5a4136]/20 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-1.5 font-mono">
                    <Edit2 className="w-4 h-4" /> Editando Estrutura de Movimentos e Posturas
                  </h4>
                  <button 
                    onClick={() => setEditingExercise(null)} 
                    className="text-xs text-[#e2bfb0]/70 hover:text-white hover:underline cursor-pointer"
                  >
                    Descartar Rascunho
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">Nome do Exercício</label>
                        <input
                          type="text"
                          value={editingExercise.name || ''}
                          onChange={e => setEditingExercise({ ...editingExercise, name: e.target.value })}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">Categoria</label>
                        <select
                          value={editingExercise.category}
                          onChange={e => setEditingExercise({ ...editingExercise, category: e.target.value as any })}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                        >
                          <option value="strength">Força & Calistenia</option>
                          <option value="cardio">Cardio & Condicionamento</option>
                          <option value="mobility">Mobilidade & Alongamento</option>
                          <option value="longevity">Recuperação & Diafragma</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">Duração Recomendada (s)</label>
                        <input
                          type="number"
                          value={editingExercise.duration || 45}
                          onChange={e => setEditingExercise({ ...editingExercise, duration: Number(e.target.value) })}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">Articulações Envolvidas</label>
                        <input
                          type="text"
                          placeholder="Ex: Quadril, Joelhos"
                          value={typeof editingExercise.targetJoints === 'string' ? editingExercise.targetJoints : editingExercise.targetJoints?.join(', ')}
                          onChange={e => setEditingExercise({ ...editingExercise, targetJoints: e.target.value })}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">Descrição do Exercício</label>
                      <textarea
                        rows={2}
                        value={editingExercise.description || ''}
                        onChange={e => setEditingExercise({ ...editingExercise, description: e.target.value })}
                        className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">URL do Vídeo Tutorial (YouTube)</label>
                      <input
                        type="url"
                        placeholder="Ex: https://www.youtube.com/watch?v=..."
                        value={editingExercise.videoUrl || ''}
                        onChange={e => setEditingExercise({ ...editingExercise, videoUrl: e.target.value })}
                        className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono">Dica Ergonômica</label>
                        <input
                          type="text"
                          value={editingExercise.formTip || ''}
                          onChange={e => setEditingExercise({ ...editingExercise, formTip: e.target.value })}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-bold text-red-400">Adaptado e Seguro para:</label>
                        <input
                          type="text"
                          value={editingExercise.adaptedFor || ''}
                          onChange={e => setEditingExercise({ ...editingExercise, adaptedFor: e.target.value })}
                          className="w-full bg-[#131111] border border-[#5a4136]/60 text-white rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Step lists */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 font-mono">Passo a Passo</label>
                        <button
                          type="button"
                          onClick={handleAddStep}
                          className="text-[9px] font-mono font-bold text-[#ff6b00]"
                        >
                          + Adicionar Passo
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[120px] overflow-y-auto">
                        {(editingExercise.steps || []).map((st, sIdx) => (
                          <div key={sIdx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-[#ff6b00]">{sIdx + 1}.</span>
                            <input
                              type="text"
                              value={st}
                              onChange={e => handleUpdateStep(sIdx, e.target.value)}
                              className="flex-1 bg-[#131111] border border-[#5a4136]/40 text-white rounded px-2 py-1 text-xs"
                            />
                            <button type="button" onClick={() => handleRemoveStep(sIdx)} className="text-red-400 text-xs px-1 hover:underline">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Donts lists */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase text-red-400 font-mono">Fatores de Risco</label>
                        <button
                          type="button"
                          onClick={handleAddDont}
                          className="text-[9px] font-mono font-bold text-red-400"
                        >
                          + Adicionar Risco
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[120px] overflow-y-auto">
                        {(editingExercise.donts || []).map((dn, dIdx) => (
                          <div key={dIdx} className="flex gap-2 items-center">
                            <span className="text-xs text-red-500 font-bold">✕</span>
                            <input
                              type="text"
                              value={dn}
                              onChange={e => handleUpdateDont(dIdx, e.target.value)}
                              className="flex-1 bg-[#131111] border border-[#5a4136]/40 text-white rounded px-2 py-1 text-xs"
                            />
                            <button type="button" onClick={() => handleRemoveDont(dIdx)} className="text-red-400 text-xs px-1">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-[#131111] p-4 rounded-xl border border-[#5a4136]/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Posturas & Fases do Exercício (A, B, C...)</h4>
                      <button
                        type="button"
                        onClick={handleAddPositionFrame}
                        className="text-[9px] font-mono font-bold text-[#ff6b00] bg-orange-600/10 px-2 py-1 rounded"
                      >
                        + Nova Posição
                      </button>
                    </div>

                    <p className="text-[10px] text-[#e2bfb0]/70 mb-2">Configure os frames de movimento. Cada frame pode conter fotos desenhadas ou pequenos loops de vídeo.</p>

                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {(editingExercise.positionImages || []).map((pos, pIdx) => {
                        const isVideoSource = pos.imageUrl?.startsWith('data:video/') || 
                                              pos.imageUrl?.endsWith('.mp4') || 
                                              pos.imageUrl?.includes('video');

                        return (
                          <div key={pIdx} className="bg-[#1c1b1b] p-3 rounded-lg border border-[#5a4136]/20 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={pos.label}
                                onChange={e => handleUpdatePositionLabel(pIdx, e.target.value)}
                                className="bg-[#131111] border border-[#5a4136]/40 text-[#ffb693] rounded px-2 py-0.5 text-xs font-bold focus:outline-none flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePositionFrame(pIdx)}
                                className="text-red-400 p-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex gap-2 items-center">
                              <div className="w-16 h-12 bg-neutral-900 border border-[#5a4136]/40 rounded overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                                {isVideoSource ? (
                                  <span className="text-[8px] bg-[#ff6b00] text-black px-1 font-bold rounded">VÍDEO LUPOV</span>
                                ) : (
                                  <img src={pos.imageUrl} className="w-full h-full object-cover" alt="Frame" />
                                )}
                              </div>

                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    accept="image/*,video/*"
                                    onChange={e => handleUploadFileToField(e, pIdx)}
                                    id={`file-p-${pIdx}`}
                                    className="hidden" 
                                  />
                                  <label 
                                    htmlFor={`file-p-${pIdx}`}
                                    className="h-7 bg-[#201f1f] text-white border border-[#5a4136]/40 rounded font-mono text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Upload className="w-2.5 h-2.5 text-[#ff6b00]" /> Upload
                                  </label>
                                </div>

                                {!isVideoSource && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDrawOnField(pIdx)}
                                    className="h-7 bg-orange-600/10 border border-[#ff6b00]/25 text-[#ffb693] rounded font-mono text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-orange-600/20"
                                  >
                                    ✏️ Desenhar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#5a4136]/20">
                  <button
                    type="button"
                    onClick={() => setEditingExercise(null)}
                    className="px-4 py-2 bg-[#201f1f] text-[#e2bfb0] rounded-lg text-xs font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraftToLocalList}
                    className="px-5 py-2 bg-[#ff6b00] text-black text-xs font-black rounded-lg"
                  >
                    Salvar Rascunho
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#5a4136]/15 pb-4">
                  <div>
                    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#ffb693] font-mono">Exercícios Customizados e Ativos</h4>
                    <p className="text-[11px] text-[#e2bfb0]/70 mt-0.5">As modificações e edições entram em vigor para os treinos recomendados deste aluno.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-[#131111] p-1 rounded-lg border border-[#5a4136]/35 items-center">
                      <select
                        value={selectedTemplateId}
                        onChange={e => setSelectedTemplateId(e.target.value)}
                        className="bg-transparent text-white text-[11px] outline-none max-w-[150px] pr-2 shrink-0 border-0"
                      >
                        <option value="">-- Importar do Banco --</option>
                        {EXERCISE_DATABASE.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleInitExerciseDraft(false)}
                        disabled={!selectedTemplateId}
                        className="bg-[#241e1b] text-[#ff6b00] text-[10px] font-bold px-2.5 py-1 rounded transition disabled:opacity-50"
                      >
                        Importar
                      </button>
                    </div>

                    <button
                      onClick={() => handleInitExerciseDraft(true)}
                      className="h-8.5 px-3 bg-[#ff6b00] text-black text-[11px] font-black rounded-lg transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Criar Novo
                    </button>
                  </div>
                </div>

                {userExercises.length === 0 ? (
                  <div className="text-center py-10 bg-[#131313]/55 rounded-xl border border-[#5a4136]/15 space-y-1">
                    <Dumbbell className="w-10 h-10 text-[#5a4136]/50 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Treinos padrões do sistema rodando</p>
                    <p className="text-[11px] text-[#e2bfb0]/60 max-w-sm mx-auto leading-relaxed">Importe um exercício do banco padrão ou crie um do zero no botão acima para moldar as posições fêmoro-patelares.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userExercises.map((ex, idx) => (
                      <div key={ex.id || idx} className="bg-[#131313] rounded-xl border border-[#5a4136]/25 p-4 flex gap-4 hover:border-[#ff6b00]/30 transition items-start">
                        <div className="w-20 aspect-square bg-[#1c1b1b] rounded border border-[#3e2c24] overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                          <img src={ex.imageUrl || "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=640"} className="w-full h-full object-cover" alt={ex.name} />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-mono px-1 py-0.5 rounded text-white font-bold">
                            {ex.positionImages?.length || 0} Fases
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/25 rounded text-[#ffb693] uppercase font-bold">
                              {ex.category}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate mt-1 leading-snug">{ex.name}</h4>
                            <p className="text-[11px] text-[#e2bfb0]/75 leading-snug truncate mt-0.5">{ex.description}</p>
                          </div>

                          <div className="flex gap-2 pt-1 border-t border-[#5a4136]/10">
                            <button
                              onClick={() => setEditingExercise(ex)}
                              className="px-2 py-0.5 text-[10px] bg-[#ff6b00]/10 text-[#ffb693] rounded border border-[#ff6b00]/15"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleRemoveUserCustomExercise(ex.id)}
                              className="px-2 py-0.5 text-[10px] bg-red-950/20 text-red-400 rounded border border-red-500/10"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 🧭 TABS SELECTOR PANELS */}
          <div className="flex bg-[#201f1f]/60 p-1.5 rounded-xl border border-[#5a4136]/30 overflow-x-auto gap-1">
            <button
              onClick={() => setAdminSubTab('users')}
              className={`px-4.5 py-2.5 rounded-lg font-mono text-[11px] uppercase font-bold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'users'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                  : 'text-[#e2bfb0]/80 hover:text-white hover:bg-[#131313]/55 bg-transparent'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alunos ({users.length})</span>
            </button>

            {activeRole !== 'personal' && (
              <button
                onClick={() => setAdminSubTab('create_exercise')}
                className={`px-4.5 py-2.5 rounded-lg font-mono text-[11px] uppercase font-bold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  adminSubTab === 'create_exercise'
                    ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                    : 'text-[#e2bfb0]/80 hover:text-white hover:bg-[#131313]/55 bg-transparent'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>Gerar Exercícios Novo ({globalExercisesList.length})</span>
              </button>
            )}

            <button
              onClick={() => setAdminSubTab('sequences')}
              className={`px-4.5 py-2.5 rounded-lg font-mono text-[11px] uppercase font-bold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'sequences'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                  : 'text-[#e2bfb0]/80 hover:text-white hover:bg-[#131313]/55 bg-transparent'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Gerar Sequência ({sequencesList.length})</span>
            </button>

            {activeRole !== 'personal' && (
              <button
                onClick={() => setAdminSubTab('challenges')}
                className={`px-4.5 py-2.5 rounded-lg font-mono text-[11px] uppercase font-bold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  adminSubTab === 'challenges'
                    ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                    : 'text-[#e2bfb0]/80 hover:text-white hover:bg-[#131313]/55 bg-transparent'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Mural de Desafios ({challenges.length})</span>
              </button>
            )}

            <button
              onClick={() => setAdminSubTab('recordings')}
              className={`px-4.5 py-2.5 rounded-lg font-mono text-[11px] uppercase font-bold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'recordings'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md text-orange-950'
                  : 'text-[#e2bfb0]/80 hover:text-white hover:bg-[#131313]/55 bg-transparent'
              }`}
            >
              <Camera className="w-4 h-4 text-orange-400" />
              <span>Gravações do App ({recordingsList.length})</span>
            </button>

            <button
              onClick={() => setAdminSubTab('notifications')}
              className={`px-4.5 py-2.5 rounded-lg font-mono text-[11px] uppercase font-bold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'notifications'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                  : 'text-[#e2bfb0]/80 hover:text-white hover:bg-[#131313]/55 bg-transparent'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notificações ({notificationsList.length})</span>
            </button>
          </div>

          {/* 👥 VIEW: SELECT STUDENT & INDIVIDUALIZE EXERCISE */}
          {adminSubTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#201f1f] p-5 rounded-xl border border-[#5a4136]/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ffb693] font-mono">Estatísticas Operacionais</h4>
                    <Users className="text-[#ff6b00] w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#e2bfb0]/70">Alunos Ativos no Prontuário</p>
                    <h3 className="text-4xl font-extrabold text-white font-mono my-1">{users.length}</h3>
                    <p className="text-[10px] text-green-500 font-mono">● Sincronizado com Firestore Real</p>
                  </div>
                </div>

                <div className="bg-[#1c1b1b] border border-[#ff6b00]/15 p-5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] font-mono flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#ff6b00]" /> Prescrição Biomecânica
                  </h4>
                  <p className="text-[11px] text-[#e2bfb0]/70 leading-relaxed">
                    Selecione um aluno na tabela ao lado para individualizar seus exercícios. Você poderá pintar vetores de forças diretamente sobre as fotos das posturas das fases de movimento, ajustando o treino para as necessidades específicas dele.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] flex items-center gap-1.5 mb-2 font-mono">
                    <Users className="w-4 h-4 text-[#ff6b00]" /> Cadastro de Prontidão de Alunos Ativos
                  </h4>
                  <p className="text-[11px] text-[#e2bfb0]/60 mb-4">Escolha um aluno para desenhar posturas articulares nas fotografias ou carregar vídeos customizados.</p>

                  {loadingUsers ? (
                    <p className="text-xs text-[#e2bfb0]/50 font-mono">Carregando alunos do Firestore...</p>
                  ) : users.length === 0 ? (
                    <p className="text-xs text-[#e2bfb0]/50 py-4 text-center">Nenhum aluno registrado.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#5a4136]/30 text-[#e2bfb0]/50 font-mono text-[10px]">
                            <th className="py-2.5">Nome / Email</th>
                            <th className="py-2.5 text-center">Idade Bio</th>
                            <th className="py-2.5">Treino Personalizado</th>
                            <th className="py-2.5 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#5a4136]/10 text-[#e5e2e1]">
                          {users.map((u, i) => (
                            <tr key={u.uid || i} className="hover:bg-[#131313]/35 transition">
                              <td className="py-3">
                                <span className="block font-bold text-white text-[12px]">{u.name}</span>
                                <span className="block text-[10px] text-[#e2bfb0]/60 font-mono">{u.email}</span>
                              </td>
                              <td className="py-3 text-center font-mono">
                                <span className="text-green-400 font-bold">{u.biologicalAge?.toFixed(1) || 'N/A'}</span>
                              </td>
                              <td className="py-3">
                                {u.customExercises && u.customExercises.length > 0 ? (
                                  <span className="bg-[#ff6b00]/10 text-[#ffb693] text-[9px] font-mono px-2 py-0.5 rounded font-bold border border-[#ff6b00]/15">
                                    🏋️ {u.customExercises.length} Customizados
                                  </span>
                                ) : (
                                  <span className="text-white/40 text-[10px]">Padrão Longevidade</span>
                                )}
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleSelectUserForCustomization(u)}
                                  className="bg-[#ff6b00]/10 hover:bg-[#ff6b00]/25 text-[#ffb693] text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                                >
                                  ⚙️ Personalizar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🏋️ VIEW: CREATE NEW GLOBAL EXERCISE */}
          {adminSubTab === 'create_exercise' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to insert new global exercise */}
              <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-xl border border-[#ff6b00]/20 shadow-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-1.5 border-b border-[#5a4136]/15 pb-2 font-mono">
                  <Plus className="w-4 h-4" /> Gerar Exercício Clínico Novo
                </h4>

                <form onSubmit={handleCreateGlobalExercise} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Nome do Exercício</label>
                    <input
                      type="text"
                      placeholder="Ex: Prancha Lateral com Elevação de Quadril"
                      value={newExName}
                      onChange={e => setNewExName(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Categoria</label>
                      <select
                        value={newExCategory}
                        onChange={e => setNewExCategory(e.target.value as any)}
                        className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      >
                        <option value="strength">Força</option>
                        <option value="cardio">Cardio</option>
                        <option value="mobility">Mobilidade</option>
                        <option value="longevity">Longevidade</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Duração (Seg)</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={newExDuration}
                        onChange={e => setNewExDuration(Number(e.target.value))}
                        className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Descrição de Alinhamento</label>
                    <textarea
                      placeholder="Descreva a execução ideal do exercício para o aluno..."
                      value={newExDescription}
                      onChange={e => setNewExDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Dica Científica (Preservação)</label>
                    <input
                      type="text"
                      placeholder="Evite hiperextensão da lombar, mantenha abdômen ativado."
                      value={newExFormTip}
                      onChange={e => setNewExFormTip(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Adaptado Para (Patologias)</label>
                    <input
                      type="text"
                      placeholder="Condromalácia patelar e preservação lombar"
                      value={newExAdaptedFor}
                      onChange={e => setNewExAdaptedFor(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Tag de Articulações Alvo</label>
                    <input
                      type="text"
                      placeholder="Joelhos, Ombros, Quadril (separados por vírgula)"
                      value={newExTargetJoints.join(', ')}
                      onChange={e => setNewExTargetJoints(e.target.value.split(',').map(s => s.trim()))}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Foto Principal / Vídeo do Exercício (URL)</label>
                    <input
                      type="text"
                      placeholder="Link de imagem ou gif explicativo..."
                      value={newExImageUrl}
                      onChange={e => setNewExImageUrl(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingGlobalEx}
                    className="w-full bg-[#ff6b00] hover:bg-orange-500 font-extrabold text-xs py-2 rounded-lg text-black transition cursor-pointer flex justify-center items-center gap-1 shadow-lg"
                  >
                    {savingGlobalEx ? 'Cadastrando no banco...' : 'Adicionar Exercício Clínico'}
                  </button>
                </form>
              </div>

              {/* List of existing global exercises in Firestore */}
              <div className="lg:col-span-2 bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] font-mono">
                    Catálogo de Exercícios Globais Criados no Firestore
                  </h4>
                  <span className="text-[10px] bg-[#ff6b00]/10 text-[#ff6b00] px-2 py-0.5 rounded font-mono font-bold">
                    {globalExercisesList.length} EXERCÍCIOS
                  </span>
                </div>

                {loadingGlobalEx ? (
                  <p className="text-xs text-[#e2bfb0]/50 font-mono">Buscando do banco de dados...</p>
                ) : globalExercisesList.length === 0 ? (
                  <div className="text-center py-10 bg-[#131313]/55 rounded-lg border border-[#5a4136]/10 text-[#e2bfb0]/50 text-xs">
                    Nenhum exercício cadastrado no Firestore. Utilize o formulário ao lado para gerar novos!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {globalExercisesList.map(globEx => (
                      <div key={globEx.id} className="bg-[#131313] p-4 rounded-xl border border-[#5a4136]/30 hover:border-[#ff6b00]/30 transition group relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] uppercase font-mono font-bold bg-[#ff6b00] text-black px-1.5 py-0.5 rounded-sm">
                              {globEx.category === 'strength' ? 'Força' : globEx.category === 'cardio' ? 'Cardio' : globEx.category === 'mobility' ? 'Mobilidade' : 'Longevidade'}
                            </span>
                            <span className="text-[10px] font-mono text-white/50">{globEx.duration}s</span>
                          </div>
                          <h5 className="font-bold text-white text-[13px]">{globEx.name}</h5>
                          {globEx.description && (
                            <p className="text-xs text-[#e2bfb0]/70 line-clamp-2 mt-1 leading-relaxed">{globEx.description}</p>
                          )}
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {globEx.targetJoints?.map(j => (
                              <span key={j} className="text-[9px] bg-[#89ceff]/10 text-[#89ceff] border border-[#89ceff]/15 px-1.5 py-0.5 rounded-xs font-mono">
                                🛡️ {j}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center border-t border-[#5a4136]/15 pt-2.5">
                          <span className="text-[9px] font-mono text-white/40">{globEx.id}</span>
                          <button
                            onClick={() => handleDeleteGlobalExercise(globEx.id)}
                            className="bg-red-950/20 hover:bg-red-900/40 border border-red-500/15 hover:border-red-500/40 text-red-400 p-1.5 rounded transition cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ⏱ VIEW: GENERATE TRAINING SEQUENCES AND OBJECTIVES */}
          {adminSubTab === 'sequences' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to generate new sequence */}
              <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-xl border border-[#ff6b00]/20 shadow-lg space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-1.5 border-b border-[#5a4136]/15 pb-2 font-mono">
                    <Plus className="w-4 h-4" /> Gerar Sequência do Programa
                  </h4>
                  <p className="text-[10px] text-[#e2bfb0]/70 mt-1">Inscreva o plano de treino, defina os objetivos do programa e selecione as fases biomecânicas adequadas.</p>
                </div>

                <form onSubmit={handleCreateSequence} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold font-bold">Título do Programa de Treino</label>
                    <input
                      type="text"
                      placeholder="Ex: Sequência de Fortalecimento de Quadril"
                      value={seqTitle}
                      onChange={e => setSeqTitle(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold font-bold">Objetivos do Programa (Metas Clínicas)</label>
                    <textarea
                      placeholder="Ex: Focar na ativação do glúteo médio e redução de sobrecarga patelar..."
                      value={seqDescription}
                      onChange={e => setSeqDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Tipo Biomecânico</label>
                      <select
                        value={seqCategory}
                        onChange={e => setSeqCategory(e.target.value as any)}
                        className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      >
                        <option value="strength">Força Recrutadora</option>
                        <option value="cardio">Cardiovascular</option>
                        <option value="mobility">Mobilidade Ativa</option>
                        <option value="combined">Misto Geral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Tempo Total (Min)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={seqDuration}
                        onChange={e => setSeqDuration(Number(e.target.value))}
                        className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold font-bold">Nome do Personal Trainer Prescritor</label>
                    <input
                      type="text"
                      placeholder="Ex: Rafael Persano - CREF 123456"
                      value={seqTrainer}
                      onChange={e => setSeqTrainer(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-[#ffb693] font-bold rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      required
                    />
                  </div>

                  {/* Selecting multiple exercises from combined array */}
                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1.5 font-mono font-bold">
                      Exercícios Selecionados ({seqSelectedEx.length})
                    </label>
                    <div className="max-h-[180px] overflow-y-auto space-y-1.5 border border-[#5a4136]/30 p-2 rounded-lg bg-[#131111]">
                      {[...EXERCISE_DATABASE, ...globalExercisesList].map(ex => {
                        const isSelected = seqSelectedEx.includes(ex.id);
                        return (
                          <label key={ex.id} className="flex items-center gap-2 p-1.5 hover:bg-[#201f1f] rounded transition cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSeqSelectedEx(prev => prev.filter(id => id !== ex.id));
                                } else {
                                  setSeqSelectedEx(prev => [...prev, ex.id]);
                                }
                              }}
                              className="accent-[#ff6b00]"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-white truncate">{ex.name}</span>
                              <span className="block text-[9px] text-[#e2bfb0]/50 font-mono">
                                {ex.category === 'strength' ? 'Força' : 'Clinico'} | {ex.targetJoints?.join(', ') || 'Geral'}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSeq}
                    className="w-full bg-[#ff6b00] hover:bg-orange-500 font-extrabold text-xs py-2 rounded-lg text-black transition cursor-pointer flex justify-center items-center gap-1 shadow-lg"
                  >
                    {savingSeq ? 'Registrando Sequência...' : 'Gerar Sequência Recomendada'}
                  </button>
                </form>
              </div>

              {/* List of existing training sequences in Firestore */}
              <div className="lg:col-span-2 bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] font-mono flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-[#ff6b00]" /> Listar Sequências e Objetivos do Programa
                  </h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    {sequencesList.length} ATIVOS
                  </span>
                </div>

                {loadingSequences ? (
                  <p className="text-xs text-[#e2bfb0]/50 font-mono animate-pulse">Buscando sequências no Firestore...</p>
                ) : sequencesList.length === 0 ? (
                  <div className="text-center py-10 bg-[#131313]/55 rounded-lg border border-[#5a4136]/10 text-[#e2bfb0]/50 text-xs">
                    Nenhuma sequência de treino cadastrada. Use o gerador do personal para emitir sequências ao vivo!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sequencesList.map(seq => (
                      <div key={seq.id} className="bg-[#131313] p-5 rounded-2xl border border-[#5a4136]/30 hover:border-[#ff6b00]/30 transition flex flex-col md:flex-row justify-between gap-5">
                        <div className="flex-1 space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold bg-[#ff6b00]/15 border border-[#ff6b00]/25 text-[#ff6b00] px-2 py-0.5 rounded">
                              {seq.category === 'strength' ? 'Hipolordose & Força' : seq.category === 'mobility' ? 'Artrite & Flex' : 'Treino Geral'} | {seq.totalDuration} Minutos
                            </span>
                            <h5 className="font-extrabold text-white text-[15px] mt-1 text-[#ffb693]">{seq.title}</h5>
                          </div>

                          <div className="bg-[#1c1b1b] p-3 rounded-lg border border-[#5a4136]/15 space-y-1">
                            <span className="text-[9px] uppercase font-mono text-white/50 block tracking-wider font-bold">📌 Objetivo do Programa:</span>
                            <p className="text-[11px] text-[#e2bfb0] leading-relaxed italic">"{seq.description}"</p>
                          </div>

                          {/* Exercícios involved in the routine */}
                          <div>
                            <span className="text-[10px] uppercase font-mono text-[#ffb693]/70 font-bold block mb-1">Passos Biomecânicos ({seq.exercises?.length || 0}):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {seq.exercises?.map((ex: any, idx: number) => (
                                <span key={idx} className="bg-[#241e1b] text-white text-[10px] px-2.5 py-0.5 rounded border border-[#5a4136]/30 font-semibold">
                                  {idx + 1}. {ex.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-4 text-[10px] text-white/40 pt-1.5 font-mono border-t border-[#5a4136]/10">
                            <span>✍️ Coach: <span className="text-white/80 font-bold">{seq.personalTrainerName || 'Admin'}</span></span>
                            <span>⏱ Sinc: {new Date(seq.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col justify-between items-end shrink-0 pl-1">
                          <span className="text-[9px] font-mono text-white/20">{seq.id}</span>
                          <button
                            onClick={() => handleDeleteSequence(seq.id)}
                            className="bg-red-950/25 hover:bg-red-950/55 border border-red-500/15 text-red-400 p-2 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 📢 VIEW: ACTIVE CHALLENGES CREATOR */}
          {adminSubTab === 'challenges' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-xl border border-[#ff6b00]/25 shadow-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-1.5 border-b border-[#5a4136]/15 pb-2 font-mono">
                  <Plus className="w-4 h-4" /> Criar Novo Desafio Ativo
                </h4>
                <form onSubmit={handlePublishChallenge} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Vincular Exercício do Banco</label>
                    <select
                      value={selectedExerciseId}
                      onChange={e => handleSelectExerciseForChallenge(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    >
                      <option value="">-- Manual (Sem exercício específico) --</option>
                      {EXERCISE_DATABASE.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name} ({ex.category === 'strength' ? 'Força' : ex.category === 'cardio' ? 'Cardio' : ex.category === 'mobility' ? 'Mobilidade' : 'Recuperação'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Título do Desafio/Anúncio</label>
                    <input
                      type="text"
                      placeholder="ex: Desafio da Postura de Ombros"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Conteúdo ou Instruções</label>
                    <textarea
                      placeholder="Detalhamento do Desafio e metas para os alunos..."
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      rows={4}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Imagem Ilustrativa</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Cole link de imagem..."
                        value={challengeImageUrl}
                        onChange={e => setChallengeImageUrl(e.target.value)}
                        className="flex-1 bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      />
                      <label className="bg-[#2a2727] hover:bg-[#3d3838] border border-[#5a4136]/40 text-[#ffb693] font-mono text-[9px] px-2.5 py-2.5 rounded font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0">
                        <Upload className="w-3 h-3 text-[#ff6b00]" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadChallengeImage}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Link do Vídeo Tutorial (YouTube)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={challengeVideoUrl}
                      onChange={e => setChallengeVideoUrl(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    />
                  </div>

                  {(challengeImageUrl || challengeVideoUrl) && (
                    <div className="p-3 bg-[#131111] rounded-lg border border-[#5a4136]/20 space-y-2 mt-2">
                      <span className="text-[10px] uppercase font-mono text-[#ffb693] block font-bold">👀 Prévia do Conteúdo</span>
                      {challengeImageUrl && (
                        <div className="relative rounded overflow-hidden border border-[#5a4136]/30 aspect-video max-h-24 bg-black flex items-center justify-center">
                          <img src={challengeImageUrl} alt="Challenge image preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button type="button" onClick={() => setChallengeImageUrl('')} className="absolute top-1 right-1 bg-black/60 hover:bg-black text-[9px] text-red-300 px-1.5 py-0.5 rounded font-black">X</button>
                        </div>
                      )}
                      {challengeVideoUrl && getYouTubeEmbedUrl(challengeVideoUrl) && (
                        <div className="relative rounded overflow-hidden border border-[#5a4136]/30 aspect-video max-h-28 bg-[#131313]">
                          <iframe
                            src={getYouTubeEmbedUrl(challengeVideoUrl)}
                            title="Preview Video"
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                          <button type="button" onClick={() => setChallengeVideoUrl('')} className="absolute top-1 right-1 bg-black/60 hover:bg-black text-[9px] text-red-300 px-1.5 py-0.5 rounded font-black z-10">X</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Assinatura</label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishing}
                    className="w-full bg-[#ff6b00] hover:bg-orange-500 font-extrabold text-xs py-2 rounded-lg text-black transition cursor-pointer flex justify-center items-center gap-1 shadow-lg"
                  >
                    {publishing ? 'Salvando no Banco...' : 'Publicar Desafio'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] flex items-center gap-1.5 mb-3 font-mono">
                    <Award className="w-4 h-4 text-[#ff6b00]" /> Mural de Desafios Ativos no Firestore
                  </h4>
                  {loadingChallenges ? (
                    <p className="text-xs text-[#e2bfb0]/50 font-mono">Carregando desafios...</p>
                  ) : challenges.length === 0 ? (
                    <div className="text-center py-6 bg-[#131313]/55 rounded-lg border border-[#5a4136]/10">
                      <Bell className="w-8 h-8 text-[#5a4136]/50 mx-auto" />
                      <p className="text-xs text-[#e2bfb0]/50 font-mono">Nenhum desafio ativo cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {challenges.map(ch => (
                        <div key={ch.id} className="bg-[#131313] p-4 rounded-xl border border-[#5a4136]/30 flex flex-col md:flex-row justify-between items-stretch gap-4 hover:border-[#ff6b00]/25 transition">
                          <div className="flex-1 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h5 className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5 text-[#ffb693]">
                                <Award className="w-3.5 h-3.5 text-[#ff6b00]" /> {ch.title}
                              </h5>
                              <p className="text-xs text-[#e2bfb0]/85 leading-relaxed whitespace-pre-line">{ch.content}</p>
                            </div>
                            <div className="flex gap-3 text-[10px] text-white/50 font-mono border-t border-[#5a4136]/10 pt-2 shrink-0">
                              <span>✍ {ch.author}</span>
                              <span>⏱ {new Date(ch.createdAt).toLocaleDateString()}</span>
                              {ch.exerciseId && (
                                <span className="text-[#ff6b00]/80 font-bold">🏋️ Vinculado</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Media block */}
                          {(ch.imageUrl || (ch.videoUrl && getYouTubeEmbedUrl(ch.videoUrl))) && (
                            <div className="w-full md:w-56 shrink-0 flex flex-col gap-2 bg-black/35 p-2 rounded-lg border border-[#5a4136]/15 justify-center">
                              {ch.videoUrl && getYouTubeEmbedUrl(ch.videoUrl) ? (
                                <div className="aspect-video w-full rounded overflow-hidden bg-black/65 border border-white/5 relative">
                                  <iframe
                                    src={getYouTubeEmbedUrl(ch.videoUrl)}
                                    title="Challenge Video"
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                  />
                                </div>
                              ) : (
                                ch.imageUrl && (
                                  <div className="aspect-video w-full rounded overflow-hidden bg-black border border-white/5 relative">
                                    <img
                                      src={ch.imageUrl}
                                      alt="Challenge Illustration"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          <div className="flex md:flex-col justify-end items-end p-1 shrink-0">
                            <button
                              onClick={() => handleDeleteChallenge(ch.id)}
                              className="bg-red-950/20 hover:bg-red-900/30 border border-red-500/15 hover:border-red-500/50 text-red-400 p-1.5 rounded-lg transition"
                              title="Apagar Desafio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🎥 VIEW: STUDENT VIDEO RECORDINGS AND FEEDBACK PANEL */}
          {adminSubTab === 'recordings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recordings Review Feed */}
              <div className="lg:col-span-2 bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] font-mono flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#ff6b00]" /> Gravações Recebidas dos Alunos Ativos
                  </h4>
                  <span className="text-[10px] bg-[#ff6b00]/10 text-[#ff6b00] px-2 py-0.5 rounded font-mono font-bold">
                    {recordingsList.length} FILMAGENS
                  </span>
                </div>

                {loadingRecordings ? (
                  <p className="text-xs text-[#e2bfb0]/50 font-mono">Consultando envios no Firestore...</p>
                ) : recordingsList.length === 0 ? (
                  <div className="text-center py-10 bg-[#131313]/55 rounded-lg border border-[#5a4136]/10 text-[#e2bfb0]/50 text-xs font-sans">
                    Nenhuma gravação de treino recebida ainda. Os alunos podem filmar sua execução no app durante a série ativa e salvar no banco!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recordingsList.map(rec => (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border transition flex flex-col md:flex-row justify-between items-stretch gap-4 cursor-pointer ${
                          selectedRecording?.id === rec.id
                            ? 'bg-[#2a2321] border-[#ff6b00]/60'
                            : 'bg-[#131313] border-[#5a4136]/25 hover:border-[#ff6b00]/15'
                        }`}
                        onClick={() => {
                          setSelectedRecording(rec);
                          setTrainerFeedbackText(rec.trainerFeedback || '');
                          setFeedbackAnnotatedImage(rec.trainerFeedbackAnnotatedImage || '');
                        }}
                      >
                        <div className="flex-1 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-mono tracking-widest bg-red-600/10 text-red-500 px-2 py-0.5 rounded font-extrabold border border-red-500/10">
                              📹 EXECUÇÃO FILMADA
                            </span>
                            <h5 className="font-extrabold text-white text-sm mt-1">{rec.exerciseName || "Exercício Clínico"}</h5>
                            <p className="text-[10px] font-mono text-[#e2bfb0]/50">Enviado por: {rec.userEmail || "aluno@vitality.com"}</p>
                            
                            {rec.trainerFeedback ? (
                              <div className="mt-2 bg-[#201f1f]/80 p-2 text-[11px] rounded border-l-2 border-emerald-500 text-emerald-300">
                                <span className="font-bold text-[9px] uppercase block mb-0.5 text-[#ffb693]">✓ Feedback Respondido:</span>
                                "{rec.trainerFeedback}"
                              </div>
                            ) : (
                              <div className="mt-2 text-[10px] text-orange-400 font-mono flex items-center gap-1 font-bold">
                                ⏱️ Pendente de avaliação do Personal
                              </div>
                            )}
                          </div>

                          <div className="flex gap-4 text-[9px] text-white/30 pt-2 font-mono border-t border-[#5a4136]/10">
                            <span>⏱ Clipe: {rec.durationSeconds}s</span>
                            <span>⏱ Data: {new Date(rec.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Output Video local playback */}
                        <div className="w-full md:w-48 shrink-0 rounded overflow-hidden bg-black/50 border border-[#5a4136]/15 flex items-center justify-center relative">
                          {rec.videoUrl && rec.videoUrl.startsWith('data:') ? (
                            <div className="absolute inset-0 bg-[#ff6b00]/5 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                              <CheckCircle className="w-5 h-5 text-emerald-400 mb-1" />
                              <span className="text-[8px] font-mono font-bold text-[#ffb693] uppercase">Vídeo Compactado</span>
                              <span className="text-[7px] text-[#e2bfb0]/50 mt-0.5">Capturado em Sandbox</span>
                            </div>
                          ) : (
                            <img src="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=200" alt="Postura" className="w-full h-full object-cover opacity-60" />
                          )}
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] text-[#ff6b00] font-mono">
                            Clique para Avaliar
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessment Sheet for the selected recording */}
              <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-xl border border-orange-500/15 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] border-b border-[#5a4136]/15 pb-2 font-mono flex items-center gap-1">
                  💡 Painel de Prontuário & Avaliação
                </h4>

                {selectedRecording ? (
                  <form onSubmit={handleSaveTrainerFeedback} className="space-y-4">
                    <div className="bg-[#131111] p-3 rounded-lg border border-[#5a4136]/30">
                      <span className="text-[9px] font-mono text-[#ffb693] block uppercase tracking-wide">ALUNO EM AVALIAÇÃO:</span>
                      <span className="text-xs font-bold text-white block mt-0.5 truncate">{selectedRecording.userEmail}</span>
                      <span className="text-[11px] text-[#e2bfb0]/70 block mt-1.5">Item: <strong className="text-white">{selectedRecording.exerciseName}</strong></span>
                    </div>

                    {/* Annotation visual snapshot */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase text-[#e2bfb0]/70 font-mono font-semibold">Anotador Biomecânico (Pintura de Postura)</label>
                        <button
                          type="button"
                          onClick={handleOpenDrawOnRecording}
                          className="text-[9px] font-mono text-[#ff6b00] underline uppercase font-bold"
                        >
                          {feedbackAnnotatedImage ? 'Refazer Desenho' : 'Começar a Pintar'}
                        </button>
                      </div>

                      {feedbackAnnotatedImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-[#5a4136]/40">
                          <img src={feedbackAnnotatedImage} alt="Feedback drawing" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFeedbackAnnotatedImage('')}
                            className="absolute top-1 right-1 bg-black/80 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-black"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={handleOpenDrawOnRecording}
                          className="aspect-video rounded-lg bg-[#131111] border-2 border-dashed border-[#5a4136]/30 hover:border-[#ff6b00]/30 transition flex flex-col items-center justify-center text-center p-3 cursor-pointer"
                        >
                          <Edit className="w-6 h-6 text-[#5a4136] mb-1 group-hover:text-[#ff6b00]" />
                          <span className="text-[10px] text-[#e2bfb0]/60 font-medium">Editar feedback visual</span>
                          <span className="text-[8px] font-mono text-[#e2bfb0]/40 mt-0.5">Clique para pintar vetores articulares</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">Observações / Recomendações Prescritivas</label>
                      <textarea
                        rows={5}
                        placeholder="Informe se o alinhamento da lombar ou cervical está adequado..."
                        value={trainerFeedbackText}
                        onChange={e => setTrainerFeedbackText(e.target.value)}
                        className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none resize-none font-sans"
                        required
                      />
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRecording(null)}
                        className="flex-1 bg-neutral-800 text-[#e2bfb0] font-mono text-[10px] font-bold py-2 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingFeedback}
                        className="flex-1 bg-[#ff6b00] hover:bg-orange-500 font-extrabold text-[10px] py-2 rounded-lg text-black transition font-mono uppercase tracking-wider"
                      >
                        {savingFeedback ? 'Enviando...' : 'Salvar Feedback'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-10 bg-[#131111]/35 rounded-lg border border-[#5a4136]/10 text-white/40 text-[11px]">
                    Selecione um envio de gravação na tabela para iniciar a avaliação do personal.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 📢 VIEW: NOTIFICATIONS MANAGER PANEL */}
          {adminSubTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List of Sent Notifications */}
              <div className="lg:col-span-2 bg-[#201f1f] rounded-xl p-5 border border-[#5a4136]/20 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] font-mono flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#ff6b00]" /> Histórico de Mensagens Enviadas (Firestore)
                  </h4>
                  <span className="text-[10px] bg-[#ff6b00]/10 text-[#ff6b00] px-2 py-0.5 rounded font-mono font-bold uppercase">
                    {notificationsList.length} Notificações
                  </span>
                </div>

                {loadingNotifications ? (
                  <p className="text-xs text-[#e2bfb0]/50 font-mono">Buscando mensagens no Firestore...</p>
                ) : notificationsList.length === 0 ? (
                  <div className="text-center py-12 bg-[#131313]/55 rounded-lg border border-[#5a4136]/10 text-[#e2bfb0]/55 text-xs font-sans">
                    Nenhuma notificação configurada ainda. Use o formulário ao lado para enviar mensagens em tempo real para os alunos!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notificationsList.map(notif => (
                      <div key={notif.id} className="bg-[#131313]/90 p-4 rounded-xl border border-[#5a4136]/25 hover:border-[#ff6b00]/20 transition flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[8px] uppercase font-mono tracking-widest bg-orange-600/10 text-[#ff6b00] px-1.5 py-0.5 rounded font-bold border border-orange-500/10">
                                📢 PUSH
                              </span>
                              <span className="text-[9px] font-mono bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                                Destinatário: <strong className="text-white">{notif.targetStudent === 'all' ? 'TODOS OS ALUNOS' : notif.targetStudent}</strong>
                              </span>
                            </div>
                            <h5 className="font-extrabold text-white text-xs mt-1.5">{notif.title}</h5>
                            <p className="text-xs text-[#e2bfb0]/85 whitespace-pre-line leading-relaxed">{notif.body}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="p-1 px-1.5 rounded bg-red-950/20 text-red-400 hover:text-white hover:bg-red-600 transition border border-red-500/10 text-[9px] font-mono flex items-center gap-1 cursor-pointer shrink-0"
                            title="Deletar permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>

                        {/* Metadata receipt row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-t border-[#5a4136]/15 pt-2.5 text-[9px] font-mono text-[#e2bfb0]/40">
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <span>✍ Por: {notif.sentBy || 'Administrador'}</span>
                            <span>⏱ Data: {new Date(notif.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded border border-[#5a4136]/15">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <span>Visualizações: <strong className="text-white">{(notif.readBy || []).length}</strong></span>
                            {notif.readBy && notif.readBy.length > 0 && (
                              <span className="text-[8px] opacity-75">({notif.readBy.join(', ')})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Configure/Publish Form Panel */}
              <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-xl border border-orange-500/15 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb693] border-b border-[#5a4136]/15 pb-2 font-mono flex items-center gap-1">
                  💡 Nova Configuração Push
                </h4>

                <form onSubmit={handlePublishNotification} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">
                      Destinatário (Filtro Personal)
                    </label>
                    <select
                      value={notifSelectedStudent}
                      onChange={e => setNotifSelectedStudent(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none cursor-pointer"
                    >
                      <option value="all">Sincronizar Geral (Todos os Alunos)</option>
                      {users.map(u => (
                        <option key={u.uid} value={u.email || u.uid}>
                          Filtrar para: {u.name} ({u.email || 'offline_guest'})
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-[#e2bfb0]/40 block mt-1 font-mono">
                      Selecione um aluno específico para direcionar o alerta ou envie para todos.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">TÍTULO DA MENSAGEM</label>
                    <input
                      type="text"
                      placeholder="Ex: Treino Personalizado Pronto!"
                      value={notifHeaderTitle}
                      onChange={e => setNotifHeaderTitle(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e2bfb0]/70 mb-1 font-mono font-semibold">CORPO DO ALERTA (BODY)</label>
                    <textarea
                      rows={5}
                      placeholder="Escreva as recomendações ou incentivos que aparecerão na notificação do aluno..."
                      value={notifBodyMsg}
                      onChange={e => setNotifBodyMsg(e.target.value)}
                      className="w-full bg-[#201f1f] border border-[#5a4136]/60 text-white rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#ff6b00] outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishingNotification}
                    className="w-full bg-[#ff6b00] hover:bg-orange-500 font-extrabold text-xs py-2.5 rounded-lg text-black transition cursor-pointer flex justify-center items-center gap-1 shadow-lg uppercase font-mono tracking-wider"
                  >
                    {publishingNotification ? 'Publicando...' : 'Enviar Alerta Push'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {showDrawingCanvas && (
        <CanvasDrawingEditor
          imageUrl={activeDrawImageUrl}
          onSave={handleSaveAnnotatedImage}
          onClose={() => {
            setShowDrawingCanvas(false);
            setActiveDrawIndex(null);
          }}
        />
      )}

    </div>
  );
}
