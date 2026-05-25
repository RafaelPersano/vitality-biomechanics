export interface PositionImage {
  label: string; // e.g., "Movimento A", "Posição 1", "Movimento B"
  imageUrl: string; // Can be image URL, base64 image, or base64 video!
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'mobility' | 'longevity';
  duration: number; // in seconds
  description: string;
  formTip: string;
  adaptedFor: string; // e.g. "Low joint impact", "Spinal protection"
  imageUrl: string;
  steps?: string[]; // Bio-mechanical step-by-step execution guidelines
  donts?: string[]; // Critical movement errors to protect from injury
  targetJoints?: string[]; // Joint regions targeted for preservation (e.g. "Ombros", "Coluna Lombar")
  schematicId?: 'shoulders' | 'spiderman' | 'hollow' | 'squat' | 'pushup' | 'row' | 'scapular_pull' | 'australian_row' | 'overhead_press' | 'swing' | 'running' | 'climber' | 'breathing';
  videoUrl?: string; // YouTube educational tutorial link
  positionImages?: PositionImage[]; // To store custom movement frames (A, B, C or positions 1, 2)
}

export interface WorkoutSession {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'mobility' | 'combined';
  totalDuration: number; // in minutes (typically 15)
  exercises: Exercise[];
  estimatedCalories: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  gender: 'homem' | 'mulher' | 'outro';
  age: number;
  selectedGoals: string[];
  restrictions: string[]; // e.g. "joelho", "coluna", "ombro"
  preferredDuration?: number; // Preferred workout duration in minutes (15, 30, 45, 60)
  selectedEquipment?: string[]; // Array of selected equipment (e.g. ["calistenia", "barras", "pesos_casa"])
  workoutsCompleted: number;
  streakDays: number;
  hydrationMl: number;
  targetHydrationMl: number;
  weightKg: number;
  muscleMassPercent: number;
  biologicalAge: number;
  hrvBaseline: number;
  customExercises?: Exercise[];
  role?: 'aluno' | 'personal' | 'admin';
}

export interface WorkoutSummary {
  sessionId: string;
  date: string;
  metabolicEfficiency: number; // e.g. 94%
  hormonalScoreBonus: number; // e.g. +12%
  totalVolumeLifted: number; // e.g. 4850 kg
  avgRpe: number; // RPE rating (6-10)
  completedSeconds: number;
}
