import React, { useState } from 'react';
import {
  Activity,
  Box,
  Cpu,
  Layers,
  MemoryStick,
  PieChart,
  Radio,
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';

export const ArchitectureDiagrams: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<'SPLIT_PHASE' | 'GRAPH_EVALUATOR' | 'MOBILE_INPUT' | 'MEMORY_BUDGET'>('SPLIT_PHASE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Unity URP Technical Specifications</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            System Architecture & Mechanical Design Schematics
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Detailed diagrams covering the Split-Phase 120V/240V utility matrix, CircuitGraph BFS state evaluation engine, mobile raycast hand interaction pipeline, and low-end Android memory budget (&lt;100MB RAM).
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedDiagram('SPLIT_PHASE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedDiagram === 'SPLIT_PHASE'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Split-Phase Phasor
          </button>
          <button
            onClick={() => setSelectedDiagram('GRAPH_EVALUATOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedDiagram === 'GRAPH_EVALUATOR'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Graph Evaluator
          </button>
          <button
            onClick={() => setSelectedDiagram('MOBILE_INPUT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedDiagram === 'MOBILE_INPUT'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Mobile Touch & Spline
          </button>
          <button
            onClick={() => setSelectedDiagram('MEMORY_BUDGET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedDiagram === 'MEMORY_BUDGET'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Memory Budget (&lt;100MB)
          </button>
        </div>
      </div>

      {/* Diagram Canvas Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {selectedDiagram === 'SPLIT_PHASE' && <SplitPhaseDiagram />}
        {selectedDiagram === 'GRAPH_EVALUATOR' && <GraphEvaluatorDiagram />}
        {selectedDiagram === 'MOBILE_INPUT' && <MobileInputDiagram />}
        {selectedDiagram === 'MEMORY_BUDGET' && <MemoryBudgetDiagram />}
      </div>
    </div>
  );
};

/* Diagram 1: Split-Phase 120V / 240V Electrical Matrix */
const SplitPhaseDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">Residential 120V/240V Split-Phase AC Distribution Matrix</h3>
          <p className="text-xs text-slate-400">
            Center-tapped utility transformer secondary winding producing two 120V conductors 180° out of phase.
          </p>
        </div>
        <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md">
          V(A-B) = 240V RMS • V(A-N) = 120V • V(B-N) = 120V
        </span>
      </div>

      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs">
        <svg viewBox="0 0 800 360" className="w-full h-auto text-slate-200">
          {/* Transformer Core & Coils */}
          <rect x="50" y="40" width="120" height="280" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <text x="110" y="30" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">Utility Transformer</text>
          <text x="110" y="170" textAnchor="middle" fill="#64748b" fontSize="11">7.2kV Primary</text>
          <text x="110" y="190" textAnchor="middle" fill="#64748b" fontSize="11">Secondary Coil</text>

          {/* Lines coming out */}
          {/* Phase A (Line 1) */}
          <path d="M 170 80 L 400 80 L 720 80" fill="none" stroke="#f59e0b" strokeWidth="4" />
          <circle cx="170" cy="80" r="5" fill="#f59e0b" />
          <text x="730" y="85" fill="#f59e0b" fontSize="13" fontWeight="bold">Phase A (Hot 120V @ 0°)</text>

          {/* Neutral Center Tap */}
          <path d="M 170 180 L 400 180 L 720 180" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle cx="170" cy="180" r="5" fill="#e2e8f0" />
          <text x="730" y="185" fill="#e2e8f0" fontSize="13" fontWeight="bold">Neutral Center-Tap (0V)</text>

          {/* Phase B (Line 2) */}
          <path d="M 170 280 L 400 280 L 720 280" fill="none" stroke="#f59e0b" strokeWidth="4" />
          <circle cx="170" cy="280" r="5" fill="#f59e0b" />
          <text x="730" y="285" fill="#f59e0b" fontSize="13" fontWeight="bold">Phase B (Hot 120V @ 180°)</text>

          {/* Grounding Electrode System Bonding (NEC 250.28) */}
          <path d="M 400 180 L 400 320 L 460 320" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="5,5" />
          <circle cx="400" cy="180" r="4" fill="#10b981" />
          <text x="470" y="325" fill="#10b981" fontSize="11" fontWeight="bold">Main Bonding Jumper (MBJ)</text>
          <text x="470" y="340" fill="#64748b" fontSize="10">Tied to Ground Rods (NEC 250.52)</text>

          {/* Potential Brackets */}
          {/* Phase A to Neutral = 120V */}
          <line x1="300" y1="85" x2="300" y2="175" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />
          <rect x="250" y="118" width="100" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" />
          <text x="300" y="134" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">120V RMS</text>

          {/* Neutral to Phase B = 120V */}
          <line x1="300" y1="185" x2="300" y2="275" stroke="#38bdf8" strokeWidth="2" />
          <rect x="250" y="218" width="100" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" />
          <text x="300" y="234" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">120V RMS</text>

          {/* Phase A to Phase B = 240V */}
          <line x1="580" y1="85" x2="580" y2="275" stroke="#ec4899" strokeWidth="2" strokeDasharray="4,4" />
          <rect x="520" y="168" width="120" height="26" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
          <text x="580" y="185" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="bold">240V RMS (A-B)</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="font-bold text-amber-400 mb-1">Phase A (120V @ 0°)</div>
          <p className="text-slate-400 leading-relaxed">
            Feeds odd-numbered breaker slots in the load center. Serves branch circuits 1, 3, and leg 1 of the 240V range.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="font-bold text-amber-400 mb-1">Phase B (120V @ 180°)</div>
          <p className="text-slate-400 leading-relaxed">
            Feeds even-numbered breaker slots. Exactly inverted phase angle ensures cancellation of shared neutral currents on multi-wire branch circuits (MWBC).
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="font-bold text-emerald-400 mb-1">Equipment Ground & Bonding</div>
          <p className="text-slate-400 leading-relaxed">
            Neutral and ground are bonded strictly at the service equipment. In subpanels, the floating neutral is isolated from ground (NEC 250.24(A)(5)).
          </p>
        </div>
      </div>
    </div>
  );
};

/* Diagram 2: CircuitGraph BFS Evaluator Pipeline */
const GraphEvaluatorDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">CircuitGraph State Evaluation & Fault Detection Architecture</h3>
          <p className="text-xs text-slate-400">
            Real-time BFS traversal pipeline with pre-allocated queue for 0 GC memory allocations per frame.
          </p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md">
          Execution Time: &lt; 0.25ms per update
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-white text-xs mb-1">Source Roots Seeding</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Main Busbars (Phase A/B), Neutral, and Ground nodes are injected as source roots with verified RMS potentials and phase angles.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-mono text-amber-400 bg-amber-950/40 p-1.5 rounded">
            Enqueue(BusbarA, BusbarB)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-white text-xs mb-1">Conductivity Propagation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              BFS traverses edges checking switch positions, breaker trip states, and conductor resistance. Non-conductive contacts halt branch traversal.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-mono text-blue-400 bg-blue-950/40 p-1.5 rounded">
            if (edge.IsConductive) Propagate()
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 font-bold flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-white text-xs mb-1">Dead Short & Arc Flash</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects zero-impedance loops between Hot and Neutral/Ground (R &lt; 0.35 Ω). Instantly calculates fault current ($I = V/R &gt; 1000A$) and trips breaker.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-mono text-rose-400 bg-rose-950/40 p-1.5 rounded">
            TripUpstreamBreaker()
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-bold text-white text-xs mb-1">Multimeter Probe Solver</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes true RMS difference between Red and Black probe contact nodes. Simulates 10MΩ high-impedance phantom voltage on disconnected wires.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-1.5 rounded">
            MeasurePotentialDiff(n1, n2)
          </div>
        </div>
      </div>
    </div>
  );
};

/* Diagram 3: Mobile Touch & Physical Verlet Wire Spline */
const MobileInputDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">Mobile Touch Raycast & Verlet Physics Wire Manipulation</h3>
          <p className="text-xs text-slate-400">
            First-person Android touch controls, stripped-wire insertion, and torque fastening mechanics.
          </p>
        </div>
        <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-md">
          Android Touch Gestures: Pinch, Drag, Twist
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="font-bold text-white flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Screen-Space Gesture Pipeline</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Touch input passes through Unity Input System (Enhanced Touch API). One-finger drag manipulates wire end particle; two-finger twist adjusts screwdriver torque angle.
          </p>
          <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
            Raycast(touchPos, out Hit, LayerMask.Terminals)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Verlet Integration Spline</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            14 particles with 2 constraint relaxation iterations per frame. Extrudes a 6-sided low-poly procedural cylinder mesh with zero heap allocations.
          </p>
          <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
            x_new = 2x - x_prev + a * dt^2
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-rose-400" />
            <span>Apprentice Failure Hazards</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Touching bare copper or inserting metal screwdriver into energized screw terminal without LOTO or 1000V rated gloves triggers electric shock visual pulse and haptics.
          </p>
          <div className="text-[11px] font-mono text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-900/60">
            Handheld.Vibrate() + ShockOverlay.Play()
          </div>
        </div>
      </div>
    </div>
  );
};

/* Diagram 4: Mobile Android Memory Footprint (<100MB RAM) */
const MemoryBudgetDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">Mobile Android Performance & Memory Budget (&lt; 100MB)</h3>
          <p className="text-xs text-slate-400">
            Architectural memory allocation breakdown guaranteeing 60 FPS on low-end Android devices (Adreno 610 / Mali-G52).
          </p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md">
          Total Footprint: 88.0 MB / 100 MB Limit
        </span>
      </div>

      {/* Memory Bars Breakdown */}
      <div className="space-y-3 font-mono text-xs">
        <MemoryBar label="ASTC Textures (6x6 Atlases for Breakers, Tools, Panel Labels)" mb={28.0} maxMb={100} color="bg-amber-500" />
        <MemoryBar label="Procedural Wire Meshes & Static Room Geometry (Baked VBOs)" mb={16.5} maxMb={100} color="bg-blue-500" />
        <MemoryBar label="URP Render Pipeline Framebuffers (1080p Single-Pass Forward+)" mb={14.0} maxMb={100} color="bg-purple-500" />
        <MemoryBar label="Unity Engine C++ Runtime Core & Physics Engine (PhysX/Verlet)" mb={18.0} maxMb={100} color="bg-slate-400" />
        <MemoryBar label="C# Managed Mono Heap (Pre-allocated Object Pools, Zero GC/frame)" mb={6.5} maxMb={100} color="bg-emerald-500" />
        <MemoryBar label="Audio Clips & Synthesizer Buffers (Multimeter Piezo, Breaker Snaps)" mb={5.0} maxMb={100} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="font-bold text-white mb-1">Shader & Material Rules</div>
          <ul className="text-slate-400 space-y-1 list-disc list-inside">
            <li>Strictly zero transparent materials on wires (Opaque URP/Simple Lit with vertex colors).</li>
            <li>No alpha test <code className="text-amber-400">clip()</code> / <code className="text-amber-400">discard</code> to preserve early-Z mobile tile rejection.</li>
            <li>SRP Batcher enabled for all switches, screws, and circuit breakers.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="font-bold text-white mb-1">Zero Garbage Collection Discipline</div>
          <ul className="text-slate-400 space-y-1 list-disc list-inside">
            <li>All graph traversal queues and hash sets in <code className="text-emerald-400">CircuitGraph.cs</code> are allocated at Awake.</li>
            <li>Wire tube mesh vertex arrays (<code className="text-emerald-400">_meshVertices</code>) are cached and re-assigned via <code className="text-emerald-400">mesh.vertices = ...</code>.</li>
            <li>No string concatenation in Update: TextMeshPro uses <code className="text-emerald-400">SetText(StringBuilder)</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const MemoryBar: React.FC<{ label: string; mb: number; maxMb: number; color: string }> = ({
  label,
  mb,
  maxMb,
  color,
}) => {
  const pct = (mb / maxMb) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400 font-bold">{mb.toFixed(1)} MB</span>
      </div>
      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
