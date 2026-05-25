import React from 'react';
import { Activity } from 'lucide-react';

interface BiomechanicalSchematicProps {
  schematicId?: string;
  exerciseName: string;
}

export default function BiomechanicalSchematic({ schematicId, exerciseName }: BiomechanicalSchematicProps) {
  // Renders highly detailed biomechanical vector schematics of movement mechanics.
  // Upgraded to recreate Pinterest's popular aesthetic:
  // - High-contrast chalkboard dark background.
  // - Muscular maps highlighted in vivid Red/Orange for primary target zones and Blue for secondary stabilizers.
  // - Clean vector line calligraphy pointing to muscle names with tiny dots.
  // - Neon-green skeletal alignments showing pristine, healthy forms.
  // - Neon-red warning paths highlighting danger vectors (with alert circles).
  // - UPGRADED with beautiful 3D-feeling muscular contours & defined human silhouettes instead of thin bones only.
  
  const renderSVG = () => {
    // Defines standard gradient sets for 3D body shading inside each SVG
    const defs = (
      <defs>
        {/* Glow & body silhouette gradients */}
        <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#e2bfb0" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#121010" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="musclePrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="muscleSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="coreGlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
        </linearGradient>
        <filter id="glowEffect" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
        </marker>
        <marker id="redArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
        </marker>
      </defs>
    );

    switch (schematicId) {
      case 'squat':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            {/* Grid Pattern in background (Pinterest Engineering look) */}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            
            {/* Ground */}
            <line x1="20" y1="175" x2="180" y2="175" stroke="#333" strokeWidth="2.5" />
            
            {/* DEFINED MUSCULAR SILHOUETTES */}
            {/* Head Contour */}
            <circle cx="118" cy="55" r="11" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
            
            {/* Torso & Abdomen stability - Secondary stabilizer (sky blue) */}
            <path d="M 75,120 Q 72,100 82,85 Q 92,70 110,65 Q 116,72 114,82 Q 102,102 85,122 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" filter="url(#glowEffect)" />
            
            {/* Glutes - Highlighted Primary (glowing red-orange muscle silhouette) */}
            <path d="M 75,120 C 65,121 52,132 58,145 C 64,154 75,152 82,142 C 86,134 82,125 75,120 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Thigh / Quadríceps - Powerful defined primary silhouette */}
            <path d="M 75,120 C 88,122 104,122 120,121 C 122,126 116,133 108,136 Q 92,138 75,120 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Calf / Gastrocnemius - Defined blue secondary silhouette */}
            <path d="M 120,121 C 126,128 135,142 135,152 C 135,160 131,171 129,175 C 124,175 120,165 118,152 C 116,140 118,128 120,121 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Support Foot */}
            <path d="M 110,175 L 140,175 L 138,168 L 122,168 Z" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.2" />

            {/* Arm driving dumbbell/kettlebell load */}
            <path d="M 110,65 Q 120,80 122,92 Q 122,105 115,110 L 120,111 Q 128,105 128,92 Q 126,80 110,65 Z" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />

            {/* Skeletal Framework Overlay (Neon Green Alignment) */}
            {/* Foot */}
            <line x1="110" y1="175" x2="140" y2="175" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            {/* Shin */}
            <line x1="130" y1="175" x2="120" y2="120" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            {/* Thigh (horizontal target depth) */}
            <line x1="120" y1="120" x2="75" y2="120" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            {/* Spinal alignment */}
            <line x1="75" y1="120" x2="110" y2="65" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* External Weight */}
            <circle cx="120" cy="103" r="11" fill="#f97316" fillOpacity="0.1" stroke="#f97316" strokeWidth="1.2" />
            <line x1="120" y1="91" x2="120" y2="115" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Joint Centers */}
            <circle cx="130" cy="175" r="4" fill="#111" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="120" cy="120" r="4" fill="#10b981" stroke="#111" strokeWidth="1.5" />
            <circle cx="75" cy="120" r="4" fill="#10b981" stroke="#111" strokeWidth="1.5" />
            
            {/* PINTEREST MUSCLE CALLOUTS & POINTERS */}
            {/* Quadríceps Callout */}
            <line x1="110" y1="126" x2="148" y2="105" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="110" cy="126" r="2.5" fill="#ef4444" />
            <text x="152" y="103" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Quadríceps</text>

            {/* Glúteo Máximo Callout */}
            <line x1="70" y1="132" x2="45" y2="146" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="70" cy="132" r="2.5" fill="#ef4444" />
            <text x="12" y="154" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Glúteo Máx.</text>

            {/* Core abdominal callout */}
            <line x1="94" y1="88" x2="55" y2="75" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="94" cy="88" r="2.5" fill="#3b82f6" />
            <text x="12" y="72" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Core Abdominal</text>

            {/* Force Directional Arch */}
            <path d="M 52,135 Q 35,110 48,88" stroke="#f97316" strokeWidth="1.2" fill="none" markerEnd="url(#arrow)" strokeDasharray="2 2"/>
            <text x="25" y="102" fill="#f97316" className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Hinge Quadril</text>
            
            {/* Red Alert Circle & warning */}
            <path d="M 120,120 Q 142,120 155,155" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="152" cy="148" r="6" fill="#f87171" fillOpacity="0.2" stroke="#f87171" strokeWidth="1" />
            <line x1="149" y1="145" x2="155" y2="151" stroke="#f87171" strokeWidth="1.5" />
            <text x="145" y="138" fill="#f87171" className="text-[7px] font-mono font-extrabold uppercase">Desvio Patelar!</text>
          </svg>
        );

      case 'pushup':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="20" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="2.5" />

            {/* CONTURED ATHLETIC PLANK SILHOUETTE */}
            {/* Head Contour */}
            <circle cx="170" cy="88" r="10" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
            
            {/* Core Cylinder (defined Plank core) - Sky Blue stabilizing highlight */}
            <path d="M 50,158 C 70,146 100,128 128,115 C 135,124 125,135 112,142 C 90,151 70,160 50,162 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" filter="url(#glowEffect)" />
            
            {/* Pectoralis major - Primary active target (vivid coral gradient) */}
            <path d="M 132,118 C 145,114 153,103 150,94 C 142,94 134,106 132,118 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />

            {/* Triceps brachii & shoulder definition - Secondary active zone */}
            <path d="M 152,100 C 148,110 144,115 142,125 C 139,122 144,112 147,100 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />

            {/* Legs - Rigid defined silhouette */}
            <path d="M 50,158 C 42,162 38,162 45,152 Z" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.2" />

            {/* Skeletal Setup in Neon Green */}
            <line x1="50" y1="160" x2="160" y2="90" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="140" y1="165" x2="142" y2="125" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="142" y1="125" x2="152" y2="100" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Joints */}
            <circle cx="50" cy="160" r="3.5" fill="#333" />
            <circle cx="110" cy="122" r="4" fill="#10b981" stroke="#111" strokeWidth="1.5" />
            <circle cx="152" cy="100" r="4" fill="#10b981" stroke="#111" strokeWidth="1.5" />
            <circle cx="142" cy="125" r="4" fill="#10b981" stroke="#111" strokeWidth="1.5" />

            {/* PINTEREST MUSCLE CALLOUTS & POINTERS */}
            {/* Peitoral Callout */}
            <line x1="140" y1="102" x2="175" y2="122" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="140" cy="102" r="2.5" fill="#ef4444" />
            <text x="178" y="125" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Peitoral</text>

            {/* Tríceps Callout */}
            <line x1="142" y1="135" x2="175" y2="145" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="142" cy="135" r="2.5" fill="#ef4444" />
            <text x="178" y="148" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Tríceps</text>

            {/* Core Callout */}
            <line x1="95" y1="130" x2="60" y2="110" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="95" cy="130" r="2.5" fill="#3b82f6" />
            <text x="12" y="105" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Core Ativado</text>

            <path d="M 142,125 Q 125,120 120,105" stroke="#10b981" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            <text x="75" y="85" fill="#10b981" className="text-[8px] font-mono font-bold">Postura Plank 180° ✓</text>

            {/* Danger Zone: Sagging Lower Back */}
            <path d="M 50,160 Q 110,153 152,100" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3 3" fill="none" />
            <text x="65" y="152" fill="#ef4444" className="text-[7.5px] font-mono font-extrabold uppercase">Quadril Descaído ✕</text>
          </svg>
        );

      case 'row':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            {/* Support Bench */}
            <line x1="15" y1="150" x2="125" y2="150" stroke="#333" strokeWidth="3" />
            <line x1="45" y1="150" x2="45" y2="180" stroke="#333" strokeWidth="2.5" />
            <line x1="115" y1="150" x2="115" y2="180" stroke="#333" strokeWidth="2.5" />

            {/* BENT OVER ATHLETIC ROW MANNEQUIN SILHOUETTE */}
            {/* Head */}
            <circle cx="145" cy="85" r="10" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
            
            {/* Spine contour horizontal structure */}
            <path d="M 45,114 Q 95,102 145,110 C 145,118 95,122 45,114 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Latissimus Dorsi & Rhomboids - Primary targets (Red/Orange gradient wing) */}
            <path d="M 125,110 C 110,88 85,92 65,110 Q 95,92 125,110 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Biceps/Upper arm - Stabilizer target */}
            <path d="M 125,110 C 118,98 112,110 108,122 C 104,118 112,100 125,110 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Supported Knee leg & support Arm */}
            <path d="M 42,110 L 48,110 L 48,150 L 42,150 Z" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.2" />
            
            {/* Spine backbone (Neutral horizontal) in Neon Green */}
            <line x1="45" y1="110" x2="145" y2="110" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="125" y1="110" x2="114" y2="72" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="114" y1="72" x2="108" y2="122" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            
            {/* Dumbbell load */}
            <circle cx="108" cy="122" r="10" fill="#f97316" fillOpacity="0.15" stroke="#f97316" />
            <line x1="108" y1="110" x2="108" y2="134" stroke="#f97316" strokeWidth="3.5" />
            
            <circle cx="125" cy="110" r="4" fill="#10b981" stroke="#111" />
            <circle cx="114" cy="72" r="4" fill="#10b981" stroke="#111" />
            <circle cx="45" cy="110" r="3.5" fill="#333" />

            {/* PINTEREST CALLOUTS */}
            {/* Dorsal Callout */}
            <line x1="95" y1="95" x2="135" y2="75" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="95" cy="95" r="2.5" fill="#ef4444" />
            <text x="138" y="73" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Dorsal Largo</text>

            {/* Bíceps Callout */}
            <line x1="114" y1="90" x2="80" y2="60" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="114" cy="90" r="2.5" fill="#3b82f6" />
            <text x="44" y="58" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Bíceps Braquial</text>

            <path d="M 108,122 Q 115,95 125,75" stroke="#f97316" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="2 2" />

            {/* Error alignment */}
            <path d="M 45,110 Q 95,80 145,110" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <text x="50" y="78" fill="#ef4444" className="text-[7px] font-mono font-extrabold uppercase">Evite Flexão Cervical! ✕</text>
            <text x="75" y="126" fill="#10b981" className="text-[8px] font-mono font-bold">Coluna Neutra ✓</text>
          </svg>
        );

      case 'shoulders':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            
            {/* FRONT VIEW MODEL WITH DEFINTED SHOUDLERS/DELTS */}
            {/* Head and neck */}
            <circle cx="100" cy="55" r="12" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
            
            {/* Torso & Rib cage block */}
            <path d="M 75,100 C 70,120 72,145 78,165 L 122,165 C 128,145 130,120 125,100 Z" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.15" />

            {/* Trapezius - Secondary stabilizer (glowing blue-cyan gradient) */}
            <path d="M 85,67 C 92,60 108,60 115,67 L 125,100 L 75,100 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" filter="url(#glowEffect)" />
            
            {/* Deltoids (Left & Right) - Key Target (highly defined glowing red-orange spheres) */}
            <path d="M 75,100 C 62,95 53,95 48,102 C 53,109 62,109 75,100 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            <path d="M 125,100 C 138,95 147,95 152,102 C 147,109 138,109 125,100 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />

            {/* Skeletal Framework in Neon Green */}
            <line x1="100" y1="67" x2="100" y2="160" stroke="#10b981" strokeWidth="3.5" />
            <line x1="60" y1="95" x2="140" y2="95" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            
            {/* Biomechanical Rotation Circles */}
            <circle cx="60" cy="95" r="17" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="140" cy="95" r="17" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />

            {/* PINTEREST CALLOUTS */}
            {/* Deltoides Callout */}
            <line x1="60" y1="95" x2="25" y2="80" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="60" cy="95" r="2.5" fill="#ef4444" />
            <text x="12" y="72" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Deltoides</text>

            {/* Trapézio Callout */}
            <line x1="100" y1="74" x2="135" y2="60" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="100" cy="74" r="2.5" fill="#3b82f6" />
            <text x="138" y="58" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Trapézio</text>

            <path d="M 40,95 Q 40,75 60,75" stroke="#10b981" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            <path d="M 160,95 Q 160,75 140,75" stroke="#10b981" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />

            {/* Cervical Alert Vector */}
            <path d="M 100,55 L 132,55" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="132" cy="55" r="3.5" fill="#ef4444" />
            <text x="110" y="48" fill="#ef4444" className="text-[7.5px] font-mono font-extrabold uppercase">Projeção Cervical! ✕</text>
            <text x="25" y="145" fill="#e2bfb0" className="text-[8px] font-mono uppercase tracking-wider font-semibold">Abdução Segura e Limpa ✓</text>
          </svg>
        );

      case 'spiderman':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="20" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="2.5" />

            {/* DEEP ATHLETIC SPIDERMAN CONTURED MANNEQUIN */}
            {/* Front Leg Thigh/Glute Target - Highly defined red muscle */}
            <path d="M 95,120 C 105,120 120,118 130,120 C 132,125 128,130 115,135 C 105,138 98,128 95,120 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            {/* Front Leg Calf - Secondary Blue */}
            <path d="M 130,120 C 134,128 134,142 130,165 L 122,165 C 120,145 122,128 130,120 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />

            {/* Back Leg Extended stretching zone */}
            <path d="M 95,120 C 80,135 60,148 40,160 Q 52,160 70,145 C 85,132 95,125 95,120 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" />

            {/* Rotational Torso & raised arm reaching upwards */}
            <path d="M 95,120 Q 90,70 115,60 C 117,62 105,74 95,120 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />

            {/* Skeletal Structure in Neon Green */}
            <line x1="130" y1="165" x2="130" y2="120" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="130" y1="120" x2="95" y2="120" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="95" y1="120" x2="40" y2="160" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            <line x1="95" y1="120" x2="115" y2="60" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />

            <circle cx="130" cy="165" r="3.5" fill="#333" />
            <circle cx="130" cy="120" r="4" fill="#10b981" stroke="#111" />
            <circle cx="95" cy="120" r="4" fill="#10b981" stroke="#111" />

            {/* PINTEREST CALLOUTS */}
            {/* Iliopsóas Hip Callout */}
            <line x1="120" y1="130" x2="155" y2="145" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="120" cy="130" r="2.5" fill="#ef4444" />
            <text x="158" y="148" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Psoas / Coxa</text>

            {/* Torácica Mobilidade Callout */}
            <line x1="105" y1="80" x2="68" y2="60" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="105" cy="80" r="2.5" fill="#f97316" />
            <text x="12" y="58" fill="#f97316" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Mobilidade Torácica</text>

            <path d="M 115,110 Q 125,85 118,62" stroke="#f97316" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="2 2" />

            {/* Spine flex injury alert */}
            <path d="M 40,160 Q 65,135 90,70" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <text x="12" y="152" fill="#ef4444" className="text-[7.5px] font-mono font-bold uppercase">Cuidado: Não Corcundar! ✕</text>
            <text x="25" y="44" fill="#10b981" className="text-[8.5px] font-mono font-bold">Descompressão Pélvica ✓</text>
          </svg>
        );

      case 'hollow':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="20" y1="155" x2="180" y2="155" stroke="#333" strokeWidth="2.5" />

            {/* HOLLOW CORE ACTIVATING EXERCISE CONTURED SILHOUETTE */}
            {/* Spinal glue backing - Neutral Neon Green Base layer */}
            <path d="M 45,145 Q 100,154 155,142" fill="none" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            
            {/* Core activation abs - Primary (Coral Red defined abdominal shape) */}
            <path d="M 70,140 Q 100,118 130,138 C 125,146 100,150 70,140 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Extended Legs extended lever - Secondary Blue stabilizer */}
            <path d="M 155,142 C 165,134 175,124 185,115 C 183,110 171,118 155,142 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Hip and thigh levers */}
            <path d="M 45,145 L 20,120 L 32,120 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />

            {/* PINTEREST CALLOUTS */}
            {/* Reto Abdominal Callout */}
            <line x1="100" y1="132" x2="100" y2="98" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="100" cy="132" r="2.5" fill="#ef4444" />
            <text x="68" y="91" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Reto Abdominal</text>

            {/* Coxa/Flexores Levers Callout */}
            <line x1="32" y1="131" x2="32" y2="168" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="32" cy="131" r="2.5" fill="#3b82f6" />
            <text x="12" y="177" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Flexores Quadril</text>

            <path d="M 100,118 L 100,140" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="110" y="125" fill="#10b981" className="text-[8px] font-mono font-bold">Pressão Contra o Solo ✓</text>

            {/* Error arch warning */}
            <path d="M 75,150 Q 100,132 125,150" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <text x="75" y="166" fill="#ef4444" className="text-[7.5px] font-mono font-extrabold uppercase text-center">Espaço sob as Costas! ✕</text>
          </svg>
        );

      case 'scapular_pull':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            {/* Pull Up Bar */}
            <line x1="20" y1="35" x2="180" y2="35" stroke="#f97316" strokeWidth="3.5" />

            {/* HANGING BACK SCAPULA DEPRESSION MANNEQUIN */}
            {/* Lower Trapezius and Scapulae contract - Primary Red defined wing */}
            <path d="M 80,85 C 90,80 110,80 120,85 L 112,118 C 100,112 100,112 88,118 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Hanging Forearm & Grip - Secondary Blue contours */}
            <path d="M 68,35 C 70,55 74,75 78,85 L 82,85 C 78,75 74,55 68,35" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />
            <path d="M 132,35 C 130,55 126,75 122,85 L 118,85 C 122,75 126,55 132,35" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />

            {/* Spine skeleton in Neon Green */}
            <line x1="78" y1="85" x2="122" y2="85" stroke="#10b981" strokeWidth="3.5" />
            <line x1="100" y1="85" x2="100" y2="165" stroke="#e2bfb0" strokeWidth="3" />

            {/* PINTEREST CALLOUTS */}
            {/* Escápulas Callout */}
            <line x1="100" y1="105" x2="152" y2="105" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="100" cy="105" r="2.5" fill="#ef4444" />
            <text x="155" y="108" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Depressão Escapular</text>

            {/* Grip Callout */}
            <line x1="68" y1="35" x2="40" y2="55" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="68" cy="35" r="2.5" fill="#3b82f6" />
            <text x="12" y="65" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Controle de Grip</text>

            <path d="M 70,75 L 70,100" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 130,75 L 130,100" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />

            <text x="35" y="178" fill="#10b981" className="text-[8.5px] font-mono font-bold">Braço Estendido ✓</text>
          </svg>
        );

      case 'australian_row':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            {/* Low Bar representing desk */}
            <line x1="120" y1="50" x2="120" y2="140" stroke="#333" strokeWidth="2.5" />
            <line x1="110" y1="75" x2="160" y2="75" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="30" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="2" />

            {/* RIGID 45 DEGREE PLANK AUSTRALIAN ROW SILHOUETTE */}
            {/* Rigid Core Alignment - Secondary Blue plank body */}
            <polygon points="40,165 140,88 144,94 44,171" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Back Latissimus & Rhomboids - Primary Red defined pulling wing */}
            <path d="M 114,100 C 130,94 140,84 140,90 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />

            {/* Board Plank in Neon Green */}
            <line x1="40" y1="165" x2="140" y2="90" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="130" y1="75" x2="114" y2="100" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="114" y1="100" x2="140" y2="90" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

            <circle cx="140" cy="90" r="4" fill="#10b981" stroke="#111" />
            <circle cx="114" cy="100" r="3.5" fill="#10b981" stroke="#111" />
            <circle cx="40" cy="165" r="3.5" fill="#333" />

            {/* PINTEREST CALLOUTS */}
            {/* Dorsal Grande Callout */}
            <line x1="130" y1="92" x2="168" y2="110" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="130" cy="92" r="2.5" fill="#ef4444" />
            <text x="171" y="113" fill="#ef4444" className="text-[6px] font-mono font-bold uppercase tracking-wider">M. Latíssimo</text>

            {/* Isquios e Glúteos Callout */}
            <line x1="72" y1="132" x2="35" y2="112" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="72" cy="132" r="2.5" fill="#3b82f6" />
            <text x="12" y="105" fill="#3b82f6" className="text-[6px] font-mono font-bold uppercase tracking-wider">Plano Pélvico Estável</text>

            <path d="M 114,120 Q 110,95 125,82" stroke="#f97316" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            <text x="68" y="65" fill="#10b981" className="text-[8.5px] font-mono font-bold">Peito em Direção à Barra ✓</text>
          </svg>
        );

      case 'overhead_press':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            {/* Chair Encosto */}
            <line x1="75" y1="70" x2="75" y2="165" stroke="#333" strokeWidth="2.5" />
            <line x1="55" y1="165" x2="115" y2="165" stroke="#333" strokeWidth="2.5" />

            {/* SEATED OVERHEAD PRESS CONTURED MANNEQUIN */}
            {/* Head */}
            <circle cx="80" cy="55" r="11" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
            
            {/* Torso glued vertical core - Sky Blue stability */}
            <path d="M 75,90 C 70,110 72,135 78,165 L 85,165 C 90,135 88,110 82,90 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" filter="url(#glowEffect)" />
            
            {/* Deltoides anterior contracting - Primary Red defined deltoid circle */}
            <circle cx="95" cy="90" r="12" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1" filter="url(#glowEffect)" />

            {/* Arms lifting weight (contoured biomechanical posture) */}
            <path d="M 80,90 C 95,85 100,74 105,65 L 110,48 Z" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.2" />

            {/* Skeletal overlay */}
            <line x1="80" y1="90" x2="100" y2="70" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="100" y1="70" x2="108" y2="42" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />

            {/* Dumbbell load */}
            <circle cx="108" cy="42" r="9" fill="#f97316" fillOpacity="0.15" stroke="#f97316" />
            <line x1="108" y1="32" x2="108" y2="52" stroke="#f97316" strokeWidth="3" />

            {/* PINTEREST CALLOUTS */}
            {/* Deltoide Delts Callout */}
            <line x1="95" y1="90" x2="135" y2="92" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="95" cy="90" r="2.5" fill="#ef4444" />
            <text x="138" y="95" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Deltoide Anterior</text>

            {/* Trapézio/Neck Callout */}
            <line x1="83" y1="78" x2="40" y2="62" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="83" cy="78" r="2.5" fill="#3b82f6" />
            <text x="12" y="58" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Trapézio Ativo</text>

            <path d="M 100,68 L 105,48" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Hyperextension warning */}
            <path d="M 75,165 Q 60,125 75,95" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <text x="12" y="125" fill="#ef4444" className="text-[7.5px] font-mono font-extrabold uppercase">Cole a Lombar no Encosto! ✕</text>
            <text x="110" y="68" fill="#10b981" className="text-[8px] font-mono font-bold">Plano Escapular ✓</text>
          </svg>
        );

      case 'swing':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="20" y1="175" x2="180" y2="175" stroke="#333" strokeWidth="2.5" />

            {/* HINGED SWING POSTERIOR CHAIN POWER PATTERN */}
            {/* Hamstrings & Glutes (Intense Coral Red defined glute/ham curve) */}
            <path d="M 125,175 Q 110,135 70,125 Q 90,105 120,90 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Core abdominal horizontal lock - Secondary Blue */}
            <polygon points="70,125 120,90 95,95" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" />

            {/* Shins & Thighs hinge in Neon Green */}
            <line x1="125" y1="175" x2="115" y2="135" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            <line x1="115" y1="135" x2="70" y2="125" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="125" x2="120" y2="90" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />

            {/* Lifting mechanics arms contour */}
            <path d="M 120,90 Q 128,105 135,120" stroke="#e2bfb0" strokeOpacity="0.32" strokeWidth="6" strokeLinecap="round" />

            <circle cx="135" cy="120" r="11" fill="#f97316" fillOpacity="0.1" stroke="#f97316" strokeWidth="1.2" />
            <line x1="130" y1="120" x2="140" y2="120" stroke="#f97316" strokeWidth="3" />

            {/* PINTEREST CALLOUTS */}
            {/* Posteriores Hamstrings Callout */}
            <line x1="102" y1="145" x2="135" y2="162" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="102" cy="145" r="2.5" fill="#ef4444" />
            <text x="138" y="165" fill="#ef4444" className="text-[6px] font-mono font-bold uppercase tracking-wider">M. Posteriores (Coxa)</text>

            {/* Glúteos Swing Callout */}
            <line x1="78" y1="124" x2="40" y2="114" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="78" cy="124" r="2.5" fill="#ef4444" />
            <text x="12" y="108" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Glúteo Ativo</text>

            <path d="M 52,118 L 82,120" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Avoid squatting */}
            <path d="M 125,175 Q 148,142 115,135" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <text x="110" y="152" fill="#ef4444" className="text-[7.5px] font-mono font-bold uppercase">Não Agache! ✕</text>
            <text x="25" y="95" fill="#10b981" className="text-[8px] font-mono font-bold">Dobradiça Pélvica ✓</text>
          </svg>
        );

      case 'running':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="20" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="2.5" />

            {/* RUNNING DRIVING ATHLETIC MANNEQUIN SILHOUETTE */}
            {/* Thigh knee lift - Primary power red muscle contour */}
            <path d="M 100,115 C 108,115 125,105 125,115 C 120,128 110,135 100,115 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Calf driven vertical drive - Secondary Blue contour */}
            <path d="M 125,115 C 128,124 132,135 125,145 C 120,142 122,126 125,115 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" />

            {/* Head */}
            <circle cx="105" cy="50" r="11" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />

            {/* Support trailing leg and active torso */}
            <path d="M 100,165 C 95,148 98,132 100,115 L 105,65 Q 110,95 100,165 Z" fill="url(#coreGlow)" stroke="#36b9c9" strokeWidth="1" />

            {/* Support leg bone in Neon Green */}
            <line x1="100" y1="165" x2="100" y2="115" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="100" y1="115" x2="105" y2="65" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />

            <circle cx="100" cy="115" r="4" fill="#10b981" stroke="#111" />
            <circle cx="125" cy="115" r="4" fill="#ef4444" stroke="#111" />

            {/* PINTEREST CALLOUTS */}
            {/* Quadríceps Runner Callout */}
            <line x1="114" y1="114" x2="148" y2="95" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="114" cy="114" r="2.5" fill="#ef4444" />
            <text x="152" y="93" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Quadríceps Potência</text>

            {/* Panturrilha/Calf Callout */}
            <line x1="94" y1="145" x2="52" y2="135" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="94" cy="145" r="2.5" fill="#3b82f6" />
            <text x="12" y="128" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Gastrocnêmio</text>

            {/* Elastic impact circles */}
            <path d="M 90,172 Q 100,180 110,172" stroke="#10b981" strokeWidth="1.5" fill="none" />
            <path d="M 85,176 Q 100,186 115,176" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" fill="none" />

            <text x="22" y="90" fill="#10b981" className="text-[8.5px] font-mono font-bold">Impacto Suave (Antepé) ✓</text>
            <text x="125" y="80" fill="#f97316" className="text-[8.5px] font-mono font-bold">Elevação Ativa de Joelho ✓</text>
          </svg>
        );

      case 'climber':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            <line x1="20" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="2.5" />

            {/* Chair Limits */}
            <line x1="150" y1="165" x2="150" y2="105" stroke="#333" strokeWidth="3.5" />
            <line x1="130" y1="105" x2="165" y2="105" stroke="#333" strokeWidth="3.5" />

            {/* HIGH-KNEE MOUNTAIN CLIMBER PLANK MANNEQUIN */}
            {/* Core abdominal - Primary active defined Red group */}
            <path d="M 90,135 L 115,120 L 105,145 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1.2" filter="url(#glowEffect)" />
            
            {/* Shoulder alignment - Secondary stabilizing Blue group */}
            <circle cx="135" cy="110" r="12" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" filter="url(#glowEffect)" />

            {/* Elevated body plank */}
            <path d="M 45,165 C 75,146 105,128 135,110 L 138,135 Z" fill="url(#coreGlow)" stroke="#36b9c9" strokeWidth="1" />

            {/* Elevated plank in Neon Green */}
            <line x1="45" y1="165" x2="135" y2="110" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="135" y1="110" x2="148" y2="92" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="138" y1="105" x2="138" y2="145" stroke="#e2bfb0" strokeWidth="2.5" />

            <circle cx="135" cy="110" r="4" fill="#10b981" stroke="#111" />
            <circle cx="45" cy="165" r="3.5" fill="#333" />

            {/* PINTEREST CALLOUTS */}
            {/* Rectus Abdominis Callout */}
            <line x1="102" y1="132" x2="72" y2="112" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="102" cy="132" r="2.5" fill="#ef4444" />
            <text x="12" y="105" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">M. Reto Abdominal</text>

            {/* Estabilidade do Ombro */}
            <line x1="135" y1="110" x2="168" y2="85" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="135" cy="110" r="2.5" fill="#3b82f6" />
            <text x="171" y="82" fill="#3b82f6" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Deltoide Estável</text>

            {/* Bouncing danger */}
            <path d="M 45,165 Q 98,162 135,110" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <text x="35" y="152" fill="#ef4444" className="text-[7.5px] font-mono font-bold uppercase">Apoio Travado na Parede! (Segurança)</text>
            <text x="58" y="95" fill="#10b981" className="text-[8.5px] font-mono font-bold">Lombar Neutra e Rígida ✓</text>
          </svg>
        );

      case 'breathing':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <path d="M0,40 H200 M0,80 H200 M0,120 H200 M0,160 H200 M40,0 V200 M80,0 V200 M120,0 V200 M160,0 V200" stroke="#222" strokeWidth="0.5" strokeDasharray="1 3" />
            
            {/* Rounded Box representing the 4s biohacking cycle */}
            <rect x="35" y="35" width="130" height="130" rx="14" stroke="#444" strokeWidth="2" fill="#111" />
            
            {/* Step lines in Neon Green and Orange */}
            <line x1="35" y1="165" x2="35" y2="35" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
            <text x="14" y="105" fill="#10b981" className="text-[8px] font-mono rotate-270 font-bold uppercase">Inspira (4s)</text>

            <line x1="35" y1="35" x2="165" y2="35" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
            <text x="70" y="26" fill="#f97316" className="text-[8px] font-mono font-bold uppercase">Segura (4s)</text>

            <line x1="165" y1="35" x2="165" y2="165" stroke="#a855f7" strokeWidth="4.5" strokeLinecap="round" />
            <text x="172" y="105" fill="#a855f7" className="text-[8px] font-mono font-bold uppercase">Expira (4s)</text>

            <line x1="165" y1="165" x2="35" y2="165" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
            <text x="70" y="180" fill="#ef4444" className="text-[8px] font-mono font-bold uppercase">Vazio (4s)</text>

            {/* DETAILED HIGH-DEFINITION LUNGS DIAGRAM SHAPE INSTEAD OF TRACES */}
            {/* Right Lung defined 3D shape */}
            <path d="M 80,75 C 85,68 98,72 96,95 C 94,115 84,118 78,110 C 72,102 70,85 80,75 Z" fill="url(#muscleSecondary)" stroke="#3b82f6" strokeWidth="1" filter="url(#glowEffect)" />
            {/* Left Lung defined 3D shape */}
            <path d="M 120,75 C 115,68 102,72 104,95 C 106,115 116,118 122,110 C 128,102 130,85 120,75 Z" fill="url(#musclePrimary)" stroke="#ef4444" strokeWidth="1" filter="url(#glowEffect)" />

            {/* Diaphragm horizontal band */}
            <path d="M 70,118 C 85,114 115,114 130,118 C 130,123 115,121 70,123 Z" fill="url(#coreGlow)" stroke="#06b6d4" strokeWidth="1" />

            {/* Pointers inside */}
            <line x1="100" y1="88" x2="100" y2="72" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <circle cx="100" cy="88" r="1.5" fill="#ef4444" />
            <text x="74" y="66" fill="#ef4444" className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Foco Diafragma</text>

            <text x="64" y="145" fill="#e2bfb0" className="text-[8.5px] font-sans font-extrabold uppercase text-center tracking-wider">Ciclo Autonômico</text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full text-white" fill="none" stroke="currentColor">
            {defs}
            <line x1="30" y1="160" x2="170" y2="160" stroke="#333" strokeWidth="2" />
            {/* Muscular Standby silhouette */}
            <circle cx="100" cy="55" r="14" fill="url(#bodySkin)" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
            
            {/* Defined chest and leg traces */}
            <path d="M 85,69 L 115,69 L 110,120 L 90,120 Z" fill="url(#coreGlow)" stroke="#3b82f6" strokeWidth="1" />
            <path d="M 90,120 L 80,160 L 72,160 L 85,120 Z" fill="url(#bodySkin)" stroke="#fff" strokeOpacity="0.2" />
            <path d="M 110,120 L 120,160 L 128,160 L 115,120 Z" fill="url(#bodySkin)" stroke="#fff" strokeOpacity="0.2" />

            <line x1="100" y1="69" x2="100" y2="120" stroke="#f97316" strokeWidth="3" />
            <line x1="70" y1="85" x2="130" y2="85" stroke="#e2bfb0" strokeWidth="3.5" strokeLinecap="round" />
            <text x="45" y="180" fill="#e2bfb0" className="text-[9px] font-mono uppercase">Mecânica Ativa</text>
          </svg>
        );
    }
  };

  return (
    <div id="biomechanical-schematic-root" className="bg-[#100f0f] rounded-xl border border-[#3e2e28]/25 overflow-hidden flex flex-col h-full">
      {/* Pinterest-Inspired Schematic Header Banner */}
      <div className="bg-[#161515] border-b border-[#3e2e28]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ef4444] animate-pulse" />
          <span className="text-[10px] font-mono text-white font-extrabold uppercase tracking-widest flex items-center gap-1">
            Ficha de Biomecânica <span className="text-[#94a3b8] font-normal text-[9px] lowercase font-sans">(Pinterest Inspired)</span>
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#ffb693] bg-[#f97316]/10 px-2.5 py-1 rounded border border-[#f97316]/20 uppercase font-bold">
          Anatomia Funcional Ativa
        </span>
      </div>

      <div className="p-4 flex flex-col lg:flex-row gap-5 items-stretch bg-gradient-to-br from-[#1b120f] to-[#0c0c0c] flex-grow">
        
        {/* Dynamic Vector visual viewport & Legend wrapper */}
        <div className="flex flex-col gap-3 items-center flex-shrink-0">
          <div className="w-48 h-48 md:w-56 md:h-56 bg-[#090909] rounded-xl flex items-center justify-center p-3 border border-[#3e2e28]/40 relative shadow-2xl overflow-hidden group">
            <div className="absolute top-2 left-2 flex gap-1 items-center font-mono text-[6.5px] text-[#e2bfb0]/55 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Mapeamento de Cargas
            </div>
            {renderSVG()}
          </div>

          {/* Pinterest Infographic Legend Box */}
          <div className="w-full bg-[#141212]/95 rounded-lg border border-[#3e2e28]/20 p-2 text-[9px] font-mono shadow-inner">
            <div className="text-[8.5px] font-bold text-[#e1bfb1]/60 uppercase tracking-widest border-b border-[#3e2e28]/20 pb-1 mb-1.5 text-center">
              Legenda do Mapa Anatômico
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="flex items-center gap-1.5 text-[#ef4444]">
                <span className="w-2.5 h-2.5 rounded bg-[#ef4444] flex-shrink-0" /> Músc. Principal
              </span>
              <span className="flex items-center gap-1.5 text-[#3b82f6]">
                <span className="w-2.5 h-2.5 rounded bg-[#3b82f6] flex-shrink-0" /> Músc. Secundário
              </span>
              <span className="flex items-center gap-1.5 text-[#10b981]">
                <span className="w-2.5 h-2.5 rounded bg-[#10b981] flex-shrink-0" /> Alinhamento OK
              </span>
              <span className="flex items-center gap-1.5 text-[#f87171]">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#f87171] bg-transparent flex-shrink-0 animate-ping" /> Alerta de Lesão
              </span>
            </div>
          </div>
        </div>

        {/* Informative text side panel describing joint protection details */}
        <div className="flex-grow flex flex-col justify-between space-y-4 w-full">
          <div className="bg-[#121010]/90 p-3 rounded-xl border border-[#3e2e28]/20">
            <h5 className="text-[10px] font-mono text-[#e2bfb0]/40 uppercase tracking-wide">Ficha Biomecânica do Exercício</h5>
            <div className="text-base font-extrabold text-white font-sans mt-0.5 leading-tight tracking-tight uppercase">{exerciseName}</div>
          </div>

          <div className="space-y-3 flex-grow justify-center flex flex-col">
            <div className="border-l-2 border-[#10b981] pl-3 py-1 bg-[#10b981]/5 rounded-r">
              <div className="flex items-center gap-1.5 text-[9.5px] text-[#10b981] font-mono uppercase font-bold tracking-wider mb-1">
                <span>Diretriz de Segurança Escapular & Lombar</span>
              </div>
              <p className="text-xs text-[#e2bfb0]/90 font-sans leading-relaxed">
                As linhas de vetor em <strong className="text-[#10b981]">Verde Néon</strong> mostram a postura neutra obrigatória das articulações em carga. Mantenha os joelhos e cotovelos alinhados com estes trajetos para evitar estresses axiais.
              </p>
            </div>

            <div className="border-l-2 border-[#ef4444] pl-3 py-1 bg-[#ef4444]/5 rounded-r">
              <div className="flex items-center gap-1.5 text-[9.5px] text-[#f87171] font-mono uppercase font-bold tracking-wider mb-1">
                <span>Indicadores de Cisalhamento Gravitacional</span>
              </div>
              <p className="text-xs text-[#e2bfb0]/90 font-sans leading-relaxed">
                As áreas com <strong className="text-[#ef4444]">Fills em Vermelho</strong> estão trabalhando em torque máximo. Mantenha a amplitude controlada para concentrar o estímulo no ventre fibroso da musculatura alvo.
              </p>
            </div>
          </div>

          <div className="text-[9.5px] text-[#e2bfb0]/50 italic font-sans text-center lg:text-left pt-2 border-t border-[#3e2e28]/10 bg-black/20 p-2.5 rounded-lg">
            *Inspirado nas ilustrações técnicas do Pinterest para prevenção de hérnias e máximo aproveitamento de calistenia/pesos livres.
          </div>
        </div>

      </div>
    </div>
  );
}
