import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutSession } from './types';
import { PRESET_WORKOUTS, EXERCISE_DATABASE } from './data';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ActiveWorkout from './components/ActiveWorkout';
import ResumoTreino from './components/ResumoTreino';
import Library from './components/Library';
import LongevityHub from './components/LongevityHub';
import ProgressTracker from './components/ProgressTracker';
import AdminPanel from './components/AdminPanel';

// Firebase imports
import { auth, db, loginWithGoogle, logoutUser, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

import { 
  Home, Dumbbell, HeartPulse, BarChart3, Zap, 
  RefreshCw, LogOut, Bell, Shield, LogIn, Lock, CheckCircle, X, Check
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'library' | 'longevity' | 'progress' | 'workout' | 'resumo' | 'onboarding' | 'admin'>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'aluno' | 'personal' | 'admin'>('aluno');
  
  // Real-time notifications database syncing
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  
  // Google Auth & Admin States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMockAdmin, setIsMockAdmin] = useState(false); // Developer bypass for easy evaluation
  const [isGuestMode, setIsGuestMode] = useState(false); // Mode for offline visitor simulation
  
  // Real-time server challenges uploaded by Admin
  const [challenges, setChallenges] = useState<any[]>([]);

  // Suggested active generated workout
  const [suggestedWorkout, setSuggestedWorkout] = useState<WorkoutSession>(PRESET_WORKOUTS[0]);
  const [activeRpeScore, setActiveRpeScore] = useState<number>(8);
  const [completedSecs, setCompletedSecs] = useState<number>(0);

  // 1. Google Authentication State Subscription
  useEffect(() => {
    // Safety guard: If Firebase Auth hangs or is slow inside a sandboxed iframe, 
    // force-release the loader after 2.2 seconds so the user can enter via Guest/Simulated mode.
    const platformTimeoutTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 2200);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(platformTimeoutTimer);
      setCurrentUser(user);
      if (user) {
        setIsGuestMode(false);
        try {
          // A: Handle automatic bootstrapping for corretorpersano@gmail.com
          if (user.email === 'corretorpersano@gmail.com') {
            await setDoc(doc(db, 'admins', user.uid), {
              email: user.email,
              createdAt: new Date().toISOString()
            }, { merge: true });
            setIsAdmin(true);
          } else {
            // Check if UID is a pre-authorized admin in Firestore
            const adminSnap = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminSnap.exists());
          }

          // B: Load or Sync Profile in Firestore DB
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          let finalProfile: UserProfile | null = null;
          
          if (userSnap.exists()) {
            // Load cloud profile
            finalProfile = userSnap.data() as UserProfile;
          } else {
            // Check if local cache has profile data from potential onboarding
            const localCached = localStorage.getItem('vitality_profile_v2');
            if (localCached) {
              finalProfile = JSON.parse(localCached);
            }
          }

          if (finalProfile) {
            // Smart Auto-Correction: If the name is default like 'Roberto' or 'Roberto Administrador', replace it with Google displayName or Rafael Persano.
            const isDefaultName = !finalProfile.name || 
                                  finalProfile.name === 'Roberto' || 
                                  finalProfile.name === 'Roberto Administrador' || 
                                  finalProfile.name.toLowerCase().includes('roberto');
            if (isDefaultName) {
              if (user.displayName) {
                finalProfile.name = user.displayName;
              } else if (user.email === 'corretorpersano@gmail.com') {
                finalProfile.name = 'Rafael Persano';
              }
            }

            // Guarantee correct email linkage
            if (!finalProfile.email && user.email) {
              finalProfile.email = user.email;
            }

            // Save updated cloud and local cached copy
            await setDoc(userDocRef, finalProfile);
            setProfile(finalProfile);
            localStorage.setItem('vitality_profile_v2', JSON.stringify(finalProfile));
            setView('dashboard');
          } else {
            // Redirect to onboarding to build the initial profile
            setView('onboarding');
          }
        } catch (err) {
          console.error("Erro ao sincronizar informações com o Firebase:", err);
          // Standard local fallback
          restoreLocalState();
        }
      } else {
        // Logged out
        setIsAdmin(false);
        setProfile(null);
        // If not in guest mode, keep them on the login gate screen
        if (!isGuestMode) {
          setView('onboarding'); // Fallback screen
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isGuestMode]);

  // Synchronize activeRole dynamically based on profile or Admin identity
  useEffect(() => {
    if (currentUser?.email === 'corretorpersano@gmail.com') {
      setActiveRole('admin');
    } else if (profile?.role) {
      setActiveRole(profile.role);
    } else {
      setActiveRole('aluno');
    }
  }, [profile, currentUser]);

  // 2. Real-time Database Challenges Subscription
  useEffect(() => {
    if (!currentUser && !isGuestMode) {
      setChallenges([]);
      return;
    }

    try {
      const q = collection(db, 'challenges');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChallenges(list);
      }, (error) => {
        console.warn("Subscrever desafios offline ou restrito:", error);
      });
      return () => unsubscribe();
    } catch(e) {
      console.warn("Firestore listener error:", e);
    }
  }, [currentUser, isGuestMode]);

  // 3. Real-time Database Notifications Subscription
  useEffect(() => {
    if (!currentUser && !isGuestMode) {
      setNotifications([]);
      return;
    }

    try {
      const q = collection(db, 'notifications');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        list.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setNotifications(list);
      }, (error) => {
        console.warn("Subscrever notificações erro:", error);
      });
      return () => unsubscribe();
    } catch(e) {
      console.warn("Firestore listener notifications error:", e);
    }
  }, [currentUser, isGuestMode]);

  // Filter and process notifications
  const currentEmail = currentUser?.email || 'visitante@vitality.com';
  
  const userNotifications = notifications.filter(notif => {
    if (!notif.targetStudent || notif.targetStudent === 'all') return true;
    return notif.targetStudent.toLowerCase() === currentEmail.toLowerCase();
  });

  const unreadNotifications = userNotifications.filter(notif => {
    const isDismissed = dismissedIds.includes(notif.id);
    if (isDismissed) return false;
    const readBy = notif.readBy || [];
    return !readBy.includes(currentEmail);
  });

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const notifRef = doc(db, 'notifications', notifId);
      const notifSelected = notifications.find(n => n.id === notifId);
      if (notifSelected) {
        const readBy = notifSelected.readBy || [];
        if (!readBy.includes(currentEmail)) {
          await updateDoc(notifRef, {
            readBy: [...readBy, currentEmail]
          });
        }
      }
    } catch (e) {
      console.warn("Error marking notification as read:", e);
    }
    // Always fall back to local state to maintain reactivity & offline mode
    if (!dismissedIds.includes(notifId)) {
      setDismissedIds(prev => [...prev, notifId]);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      for (const notif of unreadNotifications) {
        await handleMarkAsRead(notif.id);
      }
    } catch (e) {
      console.warn("Error clearing notifications:", e);
    }
  };

  // Restore fallback guest state
  const restoreLocalState = () => {
    try {
      const cachedProfile = localStorage.getItem('vitality_profile_v2');
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    } catch (e) {
      setView('onboarding');
    }
  };

  // Google Login action
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      alert("Erro ao realizar login via popup do Google. Certifique-se de autorizar popups para o endereço!");
      setAuthLoading(false);
    }
  };

  // Logout action
  const handleSignOut = async () => {
    try {
      await logoutUser();
      setIsGuestMode(false);
      setIsMockAdmin(false);
      setProfile(null);
      setView('onboarding');
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    }
  };

  // Activate guest mock tester mode (Aluno)
  const handleEnterAsGuest = () => {
    setIsGuestMode(true);
    setIsMockAdmin(false);
    setActiveRole('aluno');
    restoreLocalState();
  };

  // Activate bypass personal mode for testing
  const handleEnterAsMockPersonal = () => {
    setIsGuestMode(true);
    setIsMockAdmin(true);
    setActiveRole('personal');
    
    // Provision default mock profile if nothing exists to prevent onboarding screen hanging
    const cachedProfile = localStorage.getItem('vitality_profile_v2');
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      setProfile({ ...parsed, role: 'personal' });
    } else {
      const fallback: UserProfile = {
        name: 'Rafael Trainer Simulado',
        gender: 'homem',
        age: 45,
        selectedGoals: ['Força Muscular', 'Equilíbrio Hormonal'],
        restrictions: [],
        workoutsCompleted: 12,
        streakDays: 6,
        hydrationMl: 2500,
        targetHydrationMl: 3500,
        weightKg: 80,
        muscleMassPercent: 39,
        biologicalAge: 41,
        hrvBaseline: 72,
        role: 'personal'
      };
      setProfile(fallback);
      localStorage.setItem('vitality_profile_v2', JSON.stringify(fallback));
    }
    setView('admin'); // Take directly to Personal Panel
  };

  // Activate bypass admin mode for testing
  const handleEnterAsMockAdmin = () => {
    setIsGuestMode(true);
    setIsMockAdmin(true);
    setActiveRole('admin');
    
    // Provision default mock profile if nothing exists to prevent onboarding screen hanging
    const cachedProfile = localStorage.getItem('vitality_profile_v2');
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      setProfile({ ...parsed, role: 'admin' });
    } else {
      const fallback: UserProfile = {
        name: 'Roberto Administrador',
        gender: 'homem',
        age: 45,
        selectedGoals: ['Força Muscular', 'Equilíbrio Hormonal'],
        restrictions: [],
        workoutsCompleted: 12,
        streakDays: 6,
        hydrationMl: 2500,
        targetHydrationMl: 3500,
        weightKg: 80,
        muscleMassPercent: 39,
        biologicalAge: 41,
        hrvBaseline: 72,
        role: 'admin'
      };
      setProfile(fallback);
      localStorage.setItem('vitality_profile_v2', JSON.stringify(fallback));
    }
    setView('admin');
  };

  // Update dynamic workout recommendation when profile changes (Adaptive Workout Generator!)
  useEffect(() => {
    if (!profile) return;
    
    const isStrengthFocused = profile.selectedGoals.includes('Força Muscular');
    const isCardioFocused = profile.selectedGoals.includes('Libido & Disposição');
    
    const filterJointSafeExercises = () => {
      const customs = profile.customExercises || [];
      const baseMerged = EXERCISE_DATABASE.map(dbEx => {
        const custom = customs.find(c => c.id === dbEx.id);
        return custom ? { ...dbEx, ...custom } : dbEx;
      });
      const uniqueCustoms = customs.filter(c => !EXERCISE_DATABASE.some(baseEx => baseEx.id === c.id));
      let filtered = [...baseMerged, ...uniqueCustoms];
      
      if (profile.restrictions.includes('joelho')) {
        filtered = filtered.map(ex => {
          if (ex.id === 's1') {
            return {
              ...ex,
              name: 'Isometria de Parede (Wall-Sit) com Alinhamento',
              formTip: 'Mantenha os joelhos a 90 graus apoiados, sem transladar o peso para a articulação rotular.',
              description: 'Exclusão de agachamento profundo. Mantenha os quadríceps ativos sob tensão constante sem impacto.'
            };
          }
          return ex;
        });
      }

      if (profile.restrictions.includes('coluna')) {
        filtered = filtered.map(ex => {
          if (ex.id === 's3') {
            return {
              ...ex,
              name: 'Ponte Unilateral Isométrica',
              formTip: 'Contraia o glúteo alto ao elevar a pelve. Mantenha os quadris alinhados.',
              description: 'Substituição de levantamento terra RDL por ativação isenta de compressão lombar.'
            };
          }
          return ex;
        });
      }

      if (profile.restrictions.includes('ombro')) {
        filtered = filtered.map(ex => {
          if (ex.id === 's2') {
            return {
              ...ex,
              name: 'Remada Curvada com Peso Próprio (Scapular Pulls)',
              formTip: 'Foque na compressão das escápulas e mantenha os braços na linha do quadril.'
            };
          }
          return ex;
        });
      }

      return filtered;
    };

    const customizedPool = filterJointSafeExercises();
    const selectedEqs = profile.selectedEquipment || ['calistenia', 'barras', 'pesos_casa'];
    
    const filterByEquipment = (pool: any[]) => {
      return pool.filter(ex => {
        if (ex.category === 'mobility' || ex.category === 'longevity') return true;
        if (ex.id === 's1' || ex.id === 's3' || ex.id === 's6' || ex.id === 'c1') {
          return selectedEqs.includes('pesos_casa');
        }
        if (ex.id === 's4' || ex.id === 's5') {
          return selectedEqs.includes('barras');
        }
        if (ex.id === 's2' || ex.id === 'c2' || ex.id === 'c3') {
          return selectedEqs.includes('calistenia');
        }
        return true;
      });
    };

    let finalPool = filterByEquipment(customizedPool);
    if (finalPool.length < 4) {
      finalPool = customizedPool;
    }

    const duration = profile.preferredDuration || 30;
    let exercisesForRoutine: any[] = [];

    const getOfCategory = (cat: string, pool: any[]) => pool.filter(e => e.category === cat);
    const mobilities = getOfCategory('mobility', finalPool);
    const strengths = getOfCategory('strength', finalPool);
    const cardios = getOfCategory('cardio', finalPool);
    const longevities = getOfCategory('longevity', finalPool);

    const warmup1 = mobilities[0] || EXERCISE_DATABASE[0];
    const warmup2 = mobilities[1] || EXERCISE_DATABASE[1];
    const warmup3 = mobilities[2] || EXERCISE_DATABASE[2];
    const cooldown = longevities[0] || EXERCISE_DATABASE.find(e => e.id === 'l1') || EXERCISE_DATABASE[EXERCISE_DATABASE.length - 1];

    let mainSelection = [...strengths, ...cardios];
    if (isStrengthFocused) {
      mainSelection = [...strengths, ...cardios];
    } else if (isCardioFocused) {
      mainSelection = [...cardios, ...strengths];
    }

    if (mainSelection.length === 0) {
      mainSelection = [...EXERCISE_DATABASE.filter(e => e.category === 'strength' || e.category === 'cardio')];
    }

    if (duration <= 15) {
      exercisesForRoutine = [
        warmup1,
        mainSelection[0] || EXERCISE_DATABASE[3],
        mainSelection[1] || EXERCISE_DATABASE[4],
        mainSelection[2] || EXERCISE_DATABASE[6],
        cooldown
      ];
    } else if (duration <= 30) {
      exercisesForRoutine = [
        warmup1,
        warmup2,
        mainSelection[0] || EXERCISE_DATABASE[3],
        mainSelection[1] || EXERCISE_DATABASE[4],
        mainSelection[2] || EXERCISE_DATABASE[5],
        mainSelection[3] || EXERCISE_DATABASE[6],
        mainSelection[4] || EXERCISE_DATABASE[7],
        cooldown
      ];
    } else {
      // 60 mins/longer
      exercisesForRoutine = [
        warmup1,
        warmup2,
        warmup3,
        mainSelection[0] || EXERCISE_DATABASE[3],
        mainSelection[1] || EXERCISE_DATABASE[4],
        mainSelection[2] || EXERCISE_DATABASE[5],
        mainSelection[3] || EXERCISE_DATABASE[6],
        cooldown
      ];
    }

    exercisesForRoutine = exercisesForRoutine.filter(Boolean);

    let customTitle = '';
    let customDesc = '';
    const eqLabelsMap: Record<string, string> = {
      calistenia: 'Calistenia',
      barras: 'Barras',
      pesos_casa: 'Halteres'
    };
    const activeLabelStr = selectedEqs.map(x => eqLabelsMap[x] || x).join(' + ');

    if (isStrengthFocused) {
      customTitle = `Força Explosiva - ${duration} Min em Casa`;
      customDesc = `Fibras musculares rápidas estimuladas via ${activeLabelStr}. Proteção especial das articulações e picos de GH.`;
    } else if (isCardioFocused) {
      customTitle = `VO2 Max & Combustão - ${duration} Min`;
      customDesc = `Alta queima metabólica sem impacto residual nas patelas, utilizando ${activeLabelStr}.`;
    } else {
      customTitle = `Mobilidade & Longevidade - ${duration} Min`;
      customDesc = `Integridade sinovial e descompressão torácica ativa por meio de ${activeLabelStr}.`;
    }

    const calculatedCalories = Math.round((isCardioFocused ? 7.5 : isStrengthFocused ? 6.2 : 4.5) * duration);

    setSuggestedWorkout({
      id: `custom_generated_${duration}`,
      title: customTitle,
      description: customDesc,
      category: isStrengthFocused ? 'strength' : isCardioFocused ? 'cardio' : 'mobility',
      totalDuration: duration,
      exercises: exercisesForRoutine,
      estimatedCalories: calculatedCalories
    });

  }, [profile]);

  // Handle completion of Onboarding questionnaire
  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('vitality_profile_v2', JSON.stringify(newProfile));
    
    // Save to Firestore if authenticated with Google
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), newProfile);
      } catch (e) {
        console.error("Erro ao salvar cadastro na nuvem:", e);
      }
    }
    setView('dashboard');
  };

  // Hydration tracking syncing with Firestore
  const handleUpdateHydration = async (amount: number) => {
    if (!profile) return;
    const updated = {
      ...profile,
      hydrationMl: Math.min(profile.hydrationMl + amount, profile.targetHydrationMl + 1000)
    };
    setProfile(updated);
    localStorage.setItem('vitality_profile_v2', JSON.stringify(updated));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.error("Erro ao salvar hidratação na nuvem:", e);
      }
    }
  };

  // Profile preferences editing syncing with Firestore
  const handleUpdateProfile = async (newData: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = {
      ...profile,
      ...newData
    };
    setProfile(updated);
    localStorage.setItem('vitality_profile_v2', JSON.stringify(updated));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.error("Erro ao salvar preferências na nuvem:", e);
      }
    }
  };

  const handleStartWorkout = () => {
    setView('workout');
  };

  const handleStartCustomWorkout = (workout: WorkoutSession) => {
    setSuggestedWorkout(workout);
    setView('workout');
  };

  // Workout metrics saving and syncing with Firestore
  const handleWorkoutFinished = async (avgRpe: number, duration: number) => {
    setActiveRpeScore(avgRpe);
    setCompletedSecs(duration);
    
    if (profile) {
      // Save completed date to track in consistency calendar
      let newWorkoutsCount = profile.workoutsCompleted + 1;
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        const cacheDates = localStorage.getItem('vitality_completed_dates_v2');
        let currentDates: string[] = [];
        if (cacheDates) {
          currentDates = JSON.parse(cacheDates);
        }
        if (!currentDates.includes(dateStr)) {
          currentDates.push(dateStr);
        }
        newWorkoutsCount = currentDates.length;
        localStorage.setItem('vitality_completed_dates_v2', JSON.stringify(currentDates));
      } catch (err) {
        console.error("Erro ao registrar data do treino:", err);
      }

      const updated = {
        ...profile,
        workoutsCompleted: newWorkoutsCount,
        streakDays: profile.streakDays + 1,
        biologicalAge: Math.max(38.0, Number((profile.biologicalAge - 0.1).toFixed(1)))
      };
      setProfile(updated);
      localStorage.setItem('vitality_profile_v2', JSON.stringify(updated));

      if (currentUser) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
        } catch (e) {
          console.error("Erro ao salvar conclusão de treino na nuvem:", e);
        }
      }
    }
    
    setView('resumo');
  };

  // Render absolute loading gate
  if (authLoading && !isGuestMode) {
    return (
      <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center text-white font-sans">
        <RefreshCw className="w-10 h-10 text-[#ff6b00] animate-spin mb-4" />
        <p className="text-sm tracking-wider uppercase text-[#e2bfb0] font-bold">Vitality Hub - Longevidade Científica</p>
        <p className="text-xs text-[#e2bfb0]/60 mt-1">Sincronizando estado seguro com Google Auth...</p>
      </div>
    );
  }

  // 3. Welcome / Guest & Authentication Entry Gate (If not logged in and not in guest mode)
  if (!currentUser && !isGuestMode) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans flex flex-col justify-center items-center p-6 relative overflow-x-hidden selection:bg-[#ff6b00]/30 selection:text-white">
        {/* Glow Spheres */}
        <div className="absolute top-20 right-[-100px] w-96 h-96 bg-[#ff6b00]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-20 left-[-100px] w-80 h-80 bg-[#3a4a5f]/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div id="login-welcome-gate" className="w-full max-w-md bg-[#1c1b1b] border border-[#5a4136]/25 rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600/10 border border-orange-500/20 rounded-full">
            <Zap className="text-[#ff6b00] w-4.5 h-4.5 fill-[#ff6b00]" />
            <span className="font-sans font-bold text-[10px] tracking-widest text-[#ff6b00] uppercase">Vitality Hub v2.0</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight leading-tight">
              Acesso à Longevidade Ativa
            </h1>
            <p className="text-xs text-[#e2bfb0]/80 px-4 leading-relaxed">
              Descubra sua idade biológica real e sincronize seu treinamento metabólico adaptativo em múltiplos dispositivos na nuvem.
            </p>
          </div>

          {/* Core Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm tracking-wide rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition cursor-pointer shadow-md"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Entrar com Conta Google
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#5a4136]/15"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-mono text-[#e2bfb0]/40">Experimentação Segura</span>
            <div className="flex-grow border-t border-[#5a4136]/15"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Simulate Aluno */}
            <button 
              onClick={handleEnterAsGuest}
              className="py-2.5 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#5a4136]/30 text-white rounded-lg text-[10px] uppercase font-mono font-bold tracking-tight flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <span className="text-sm">👤</span>
              <span>Simular Aluno</span>
            </button>

            {/* Simulate Personal */}
            <button 
              onClick={handleEnterAsMockPersonal}
              className="py-2.5 bg-orange-600/10 hover:bg-orange-600/15 border border-orange-500/25 text-orange-400 rounded-lg text-[10px] uppercase font-mono font-bold tracking-tight flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <span className="text-sm">🏋️</span>
              <span>Simular Personal</span>
            </button>

            {/* Simulated administrator environment */}
            <button 
              onClick={handleEnterAsMockAdmin}
              className="py-2.5 bg-red-600/10 hover:bg-red-600/15 border border-red-500/25 text-red-500 rounded-lg text-[10px] uppercase font-mono font-bold tracking-tight flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <span className="text-sm">👑</span>
              <span>Simular Admin</span>
            </button>
          </div>

          <div className="bg-[#131313]/90 p-4 rounded-xl text-left border border-[#5a4136]/10 text-[11px] leading-relaxed text-[#e2bfb0]/60 space-y-1">
            <p className="font-bold text-white flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#ff6b00]" /> Configuração do Administrador Principal
            </p>
            <p>
              Qualquer login utilizando o email corporativo principal da conta autorizada (ex: <span className="text-white underline font-mono">corretorpersano@gmail.com</span>) será automaticamente reconhecido como Administrador do sistema em tempo real na nuvem do Google Firestore.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans selection:bg-[#ff6b00]/30 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      {view !== 'workout' && view !== 'resumo' && (
        <header className="w-full top-0 sticky z-40 bg-[#131313]/95 backdrop-blur-md flex justify-between items-center px-6 py-3 border-b border-[#5a4136]/10 shadow-md">
          <div className="flex items-center gap-2">
            <Zap className="text-[#ff6b00] w-5.5 h-5.5 fill-[#ff6b00]" />
            <h1 className="font-sans font-extrabold text-white text-base tracking-wider uppercase">
              Vitality <span className="text-[#ff6b00]">Hub</span>
            </h1>
            
            {isAdmin && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-600/25 border border-red-500/35 text-red-400 text-[9px] font-mono font-bold tracking-wider uppercase flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5 fill-red-400/20" /> ADMIN
              </span>
            )}
            {isMockAdmin && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold tracking-wider uppercase flex items-center gap-0.5" title="Simulation Bypass Activated">
                ⚙ SIMULADO
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell with Badge */}
            {(currentUser || isGuestMode) && (
              <button
                onClick={() => setShowNotificationsDrawer(true)}
                className="relative p-2 rounded-lg bg-[#201f1f] hover:bg-[#2b2a2a] text-[#e2bfb0] hover:text-white transition cursor-pointer border border-[#5a4136]/15 flex items-center justify-center h-8.5 w-8.5"
                title={`${unreadNotifications.length} novas notificações`}
              >
                <Bell className="w-4 h-4 text-[#ff6b00]" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#ff6b00] text-black font-extrabold text-[8px] rounded-full flex items-center justify-center border border-[#131313] animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            )}

            {/* Displays active Google Avatar, displays fallback if offline */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-[10px] font-bold text-white">{currentUser.displayName || profile?.name}</span>
                  <span className="text-[9px] font-mono text-[#e2bfb0]/55">{currentUser.email}</span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ff6b00]">
                  <img 
                    src={currentUser.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAoDPxP_goy5S9tZlS9X7A6xkfww8zMfkmkvfJTKX0P9ELaCpkakwjaeqUmOVyu8TTvTzLOC2nB4KSHf3pondvZb8AY7RSXT_xJ7y1vsx9vuHPYhbei5gf3JZ0aLWogetY4I2sKuSYIjGQEhoxe7Cniv_VyTTU1CaoGEvaHHgvTup7wGLYSAWxj_cP9d7NGb6bw3gFT2YdCe-4ZX_MgnKv_yIlZI_v-ZHCeCMG3TckRQsnz5uQVanpnicLHz2mZs12BNaQoW4Dz5zDD"} 
                    alt="User photo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale-0"
                  />
                </div>
                <button 
                  onClick={handleSignOut}
                  title="Sair do Vitality Hub"
                  className="p-1 px-2.5 h-8.5 rounded-lg bg-[#201f1f] hover:bg-red-950/20 text-[#e2bfb0] hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-[#5a4136]/15"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desconectar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-[#2a2522] border border-[#5a4136]/30 px-2.5 py-1 text-[10px] rounded-lg font-mono text-[#ffb693] font-bold">
                  👤 Visitante Off-line
                </span>
                <button 
                  onClick={() => setIsGuestMode(false)}
                  className="p-1.5 h-8.5 rounded-lg bg-[#ff6b00] hover:bg-orange-500 text-black text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar com Google</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* 🛠️ SUPER ROLE SWITCHER HUD FOR RAFAEL PERSANO & ADMINS */}
      {view !== 'workout' && view !== 'resumo' && (isAdmin || isMockAdmin || currentUser?.email === 'corretorpersano@gmail.com') && (
        <div className="w-full bg-[#1e1411] border-b border-[#ff6b00]/25 px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 z-30 select-none">
          <div className="flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase text-[#ffb693] tracking-widest animate-pulse">
            <Shield className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span>Simulador de Papel Ativo para Rafael Persano</span>
          </div>
          <div className="flex bg-[#120b08] p-1 rounded-lg border border-[#5a4136]/30 gap-1 text-[10px] font-mono font-bold font-sans">
            <button
              onClick={() => {
                setActiveRole('aluno');
                setView('dashboard');
              }}
              className={`px-3 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'aluno'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                  : 'text-[#e2bfb0]/70 hover:text-white hover:bg-[#1e1310]'
              }`}
            >
              <span>👤 Aluno</span>
            </button>
            <button
              onClick={() => {
                setActiveRole('personal');
                setView('admin');
              }}
              className={`px-3 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'personal'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                  : 'text-[#e2bfb0]/70 hover:text-white hover:bg-[#1e1310]'
              }`}
            >
              <span>🏋️ Personal Trainer</span>
            </button>
            <button
              onClick={() => {
                setActiveRole('admin');
                setView('admin');
              }}
              className={`px-3 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-[#ff6b00] text-black font-extrabold shadow-md'
                  : 'text-[#e2bfb0]/70 hover:text-white hover:bg-[#1e1310]'
              }`}
            >
              <span>👑 Administrador</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container Content */}
      <main className="flex-1 w-full mx-auto px-4 py-4 md:py-6">
        
        {/* Onboarding stage has to create profile */}
        {view === 'onboarding' && (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            defaultName={currentUser?.displayName || (currentUser?.email === 'corretorpersano@gmail.com' ? 'Rafael Persano' : '')} 
          />
        )}

        {view === 'dashboard' && profile && (
          <div className="space-y-6">
            {/* Real-time Admin Announcements Stripe */}
            {challenges.length > 0 && (
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1c1b1b] via-[#241f1c] to-[#131111] border border-orange-500/25 p-5 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-5 items-stretch relative overflow-hidden">
                {/* Background decorative subtle gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b00]/5 blur-3xl rounded-full pointer-events-none" />
                
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] px-2.5 py-0.5 bg-orange-500/15 border border-orange-500/30 font-black text-[#ffb693] tracking-wide uppercase rounded-full flex items-center gap-1 animate-pulse">
                        <Bell className="w-3 h-3 text-[#ff6b00]" /> DESAFIO ATIVO DO DIA
                      </span>
                      <span className="text-[10px] font-mono text-white/40">✍ {challenges[0].author || 'Administração Vitality'}</span>
                    </div>
                    
                    <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight leading-tight">
                      {challenges[0].title}
                    </h4>
                    
                    <p className="text-xs text-[#e2bfb0]/90 leading-relaxed font-sans whitespace-pre-line">
                      {challenges[0].content}
                    </p>
                  </div>

                  <div className="text-[9px] text-[#e2bfb0]/50 font-mono flex items-center gap-2 pt-2 border-t border-[#5a4136]/15">
                    <span>Publicado em: {challenges[0].createdAt ? new Date(challenges[0].createdAt).toLocaleDateString() : 'Hoje'}</span>
                  </div>
                </div>

                {/* Media frame: Displays video tutorial or image illustrative */}
                {(challenges[0].imageUrl || challenges[0].videoUrl) && (
                  <div className="w-full md:w-80 shrink-0 flex flex-col justify-center bg-black/40 p-2.5 rounded-xl border border-[#5a4136]/20">
                    {challenges[0].videoUrl ? (
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/85 relative shadow-lg">
                        <iframe
                          src={
                            (() => {
                              const url = challenges[0].videoUrl;
                              if (!url) return '';
                              let videoId = '';
                              if (url.includes('v=')) {
                                const parts = url.split('v=');
                                if (parts.length > 1) videoId = parts[1].split('&')[0];
                              } else if (url.includes('youtu.be/')) {
                                const parts = url.split('youtu.be/');
                                if (parts.length > 1) videoId = parts[1].split('?')[0];
                              } else if (url.includes('embed/')) {
                                return url;
                              }
                              return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                            })()
                          }
                          title="Exercício do Desafio"
                          className="w-full h-full border-0 animate-fade-in"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      challenges[0].imageUrl && (
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg relative border border-white/5">
                          <img
                            src={challenges[0].imageUrl}
                            alt={challenges[0].title}
                            className="w-full h-full object-cover select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-center text-[#ffb693]/70 font-mono mt-1.5 font-bold">
                      {challenges[0].videoUrl ? '📺 Assista ao Vídeo do Exercício' : '📸 Registro do Movimento'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Dashboard 
              profile={profile}
              suggestedWorkout={suggestedWorkout}
              onStartWorkout={handleStartWorkout}
              onNavigate={(target) => setView(target)}
              onUpdateHydration={handleUpdateHydration}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {view === 'workout' && (
          <ActiveWorkout 
            session={suggestedWorkout}
            onFinish={handleWorkoutFinished}
            onAbort={() => setView('dashboard')}
            profile={profile}
            currentUser={currentUser}
          />
        )}

        {view === 'resumo' && (
          <ResumoTreino 
            avgRpe={activeRpeScore}
            completedSeconds={completedSecs}
            onGoBack={() => setView('dashboard')}
          />
        )}

        {view === 'library' && profile && (
          <Library 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSelectWorkout={handleStartCustomWorkout} 
          />
        )}

        {view === 'longevity' && (
          <LongevityHub />
        )}

        {view === 'progress' && (
          <ProgressTracker />
        )}

        {view === 'admin' && (
          <AdminPanel 
            currentUserEmail={currentUser ? currentUser.email : "Visitante Simulado"} 
            activeRole={activeRole}
          />
        )}
      </main>

      {/* Persistent Bottom Bar for Navigation */}
      {view !== 'workout' && view !== 'resumo' && view !== 'onboarding' && (
        <nav className="fixed bottom-0 left-0 w-full bg-[#1c1b1b]/95 backdrop-blur-md py-2 border-t border-[#5a4136]/15 flex justify-around items-center z-40 shadow-inner">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer ${
              view === 'dashboard' 
                ? 'bg-[#ff6b00]/10 text-[#ff6b00] font-sans font-bold' 
                : 'text-[#e2bfb0]/70 hover:bg-[#201f1f] hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Dashboard</span>
          </button>

          <button 
            onClick={() => setView('library')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer ${
              view === 'library' 
                ? 'bg-[#ff6b00]/10 text-[#ff6b00] font-sans font-bold' 
                : 'text-[#e2bfb0]/70 hover:bg-[#201f1f] hover:text-white'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Treinos</span>
          </button>

          <button 
            onClick={() => setView('longevity')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer ${
              view === 'longevity' 
                ? 'bg-[#ff6b00]/10 text-[#ff6b00] font-sans font-bold' 
                : 'text-[#e2bfb0]/70 hover:bg-[#201f1f] hover:text-white'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Longevidade</span>
          </button>

          <button 
            onClick={() => setView('progress')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer ${
              view === 'progress' 
                ? 'bg-[#ff6b00]/10 text-[#ff6b00] font-sans font-bold' 
                : 'text-[#e2bfb0]/70 hover:bg-[#201f1f] hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Estatísticas</span>
          </button>

          {/* Sinks Administrator/Personal Panel Access Tab based on active simulated role */}
          {(isAdmin || isMockAdmin) && activeRole !== 'aluno' && (
            <button 
              onClick={() => setView('admin')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer border border-[#ff6b00]/10 ${
                view === 'admin' 
                  ? 'bg-orange-600/10 text-orange-500 font-sans font-bold shadow-sm' 
                  : 'text-orange-400/80 hover:bg-[#201f1f]'
              }`}
            >
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] font-semibold mt-1">
                {activeRole === 'personal' ? 'Painel Personal' : 'Painel Admin'}
              </span>
            </button>
          )}
        </nav>
      )}

      {/* Atmospheric backgrounds */}
      {view !== 'workout' && (
        <>
          <div className="fixed top-20 right-[-100px] w-96 h-96 bg-[#ff6b00]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="fixed bottom-20 left-[-100px] w-80 h-80 bg-[#3a4a5f]/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
        </>
      )}

      {/* 🔔 NOTIFICATION DRAWER OVERLAY */}
      {showNotificationsDrawer && (
        <div id="notifications-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          {/* Backdrop dismiss */}
          <div className="absolute inset-0" onClick={() => setShowNotificationsDrawer(false)}></div>
          
          {/* Drawer content */}
          <div className="relative w-full max-w-md h-full bg-[#1c1b1b] border-l border-[#5a4136]/35 shadow-2xl flex flex-col justify-between py-6 px-5 z-10 animate-slide-in">
            <div className="space-y-5 flex-1 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#5a4136]/20 pb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#ff6b00]" />
                  <h2 className="font-sans font-extrabold text-white text-base uppercase tracking-wider">
                    Suas Notificações
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-1 px-1.5 rounded bg-[#131313]/55 hover:bg-[#ff6b00]/15 text-[#e2bfb0] hover:text-[#ff6b00] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Clear All Option */}
              {unreadNotifications.length > 0 && (
                <div className="flex justify-between items-center bg-[#201f1f] p-2.5 rounded-lg border border-[#5a4136]/15">
                  <span className="text-[10px] font-mono font-bold text-[#ffb693] uppercase tracking-wider">
                    {unreadNotifications.length} pendentes acumuladas
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllNotifications}
                    className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#ff6b00] hover:underline cursor-pointer bg-transparent border-0"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              )}

              {/* Notification feed list */}
              <div className="space-y-3 pt-2">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-16 bg-[#131313]/40 rounded-xl border border-[#5a4136]/10 text-[#e2bfb0]/40 space-y-2">
                    <Bell className="w-8 h-8 mx-auto text-[#5a4136]/30" />
                    <p className="text-xs font-mono">Nenhum aviso ou notificação de personal trainer recebido.</p>
                  </div>
                ) : (
                  userNotifications.map((notif) => {
                    const isUnread = unreadNotifications.some(u => u.id === notif.id);
                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-xl border transition-all duration-200 relative ${
                          isUnread
                            ? 'bg-[#211613] border-[#ff6b00]/30 shadow-md'
                            : 'bg-[#131313]/50 border-[#5a4136]/20 opacity-75'
                        }`}
                      >
                        {/* Unread Indicator tag */}
                        {isUnread && (
                          <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#ff6b00] rounded-full"></span>
                        )}

                        <div className="space-y-1 pr-4">
                          <span className="text-[8px] font-mono bg-orange-600/10 text-[#ff6b00] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-orange-500/10">
                            📢 NOTIFICAÇÃO PUSH
                          </span>
                          <h4 className="font-sans font-bold text-white text-xs mt-1.5 tracking-wide leading-snug">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-[#e2bfb0]/85 leading-relaxed font-sans mt-1">
                            {notif.body}
                          </p>
                        </div>

                        {/* Actions & Timestamp row */}
                        <div className="flex items-center justify-between border-t border-[#5a4136]/10 mt-3 pt-2">
                          <span className="text-[9px] font-mono text-[#e2bfb0]/40">
                            ⏱ {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() + ' ' + new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recentemente'}
                          </span>
                          {isUnread ? (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-[10px] font-mono font-bold text-[#ff6b00] hover:text-white flex items-center gap-1 transition cursor-pointer bg-transparent border-0"
                            >
                              <Check className="w-3.5 h-3.5" /> Marcar como Lida
                            </button>
                          ) : (
                            <span className="text-[9px] font-mono text-emerald-500/70 font-bold flex items-center gap-1">
                              ✓ Visualizada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#5a4136]/15 flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowNotificationsDrawer(false)}
                className="w-full bg-[#ff6b00] hover:bg-orange-500 text-black font-extrabold text-xs py-2.5 rounded-lg text-center transition cursor-pointer uppercase font-mono tracking-wider shadow-lg border-0"
              >
                Voltar ao App
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
