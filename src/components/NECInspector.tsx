import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Info,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap
} from 'lucide-react';
import { NECCodeViolation } from '../types/circuit';
import { CircuitSimulationState } from '../services/circuitSolver';

interface NECInspectorProps {
  state: CircuitSimulationState;
  setState: React.Dispatch<React.SetStateAction<CircuitSimulationState>>;
}

export const NECInspector: React.FC<NECInspectorProps> = ({ state, setState }) => {
  // Box Fill Calculator State (NEC 314.16)
  const [boxVolumeCuIn, setBoxVolumeCuIn] = useState<number>(18.0); // Standard single-gang plastic box ~18 cu.in
  const [conductorCount14, setConductorCount14] = useState<number>(4); // 2.00 cu.in each
  const [conductorCount12, setConductorCount12] = useState<number>(2); // 2.25 cu.in each
  const [internalClampsCount, setInternalClampsCount] = useState<number>(1); // 1 conductor equivalent based on largest wire
  const [supportFittingsCount, setSupportFittingsCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(1); // 2 conductor equivalents per yoke/strap
  const [groundWireCount, setGroundWireCount] = useState<number>(2); // 1 conductor equivalent for all EGCs up to 4

  // Calculate required box volume according to NEC 314.16(B)
  const volume14 = conductorCount14 * 2.0;
  const volume12 = conductorCount12 * 2.25;
  const largestWireAllowance = conductorCount12 > 0 ? 2.25 : 2.0;

  const clampVolume = internalClampsCount > 0 ? 1 * largestWireAllowance : 0;
  const deviceVolume = deviceCount * 2 * largestWireAllowance;
  const groundVolume = groundWireCount > 0 ? 1 * largestWireAllowance : 0;

  const totalRequiredVolume = volume14 + volume12 + clampVolume + deviceVolume + groundVolume;
  const isBoxFillCompliant = totalRequiredVolume <= boxVolumeCuIn;

  // Apprentice Score calculation (100 minus active violations)
  const penalty = state.violations.reduce((acc, v) => {
    if (v.severity === 'CRITICAL_HAZARD') return acc + 35;
    if (v.severity === 'CODE_VIOLATION') return acc + 20;
    return acc + 10;
  }, 0);
  const apprenticeScore = Math.max(0, 100 - penalty);

  const fixAllViolations = () => {
    setState((prev) => ({
      ...prev,
      faults: {
        deadShortBranch2: false,
        cutEquipmentGroundRange: false,
        reversePolarityBranch2: false,
        undersizedWireBranch2: false,
        looseTerminalScrewBranch1: false,
      },
      arcFlashActive: false,
      arcFlashMessage: null,
      violations: [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Score */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>National Electrical Code (NFPA 70 2023 Edition)</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Real-Time AI Code Compliance & Apprentice Safety Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Continuous background rule validator monitoring polarity (NEC 200.6), overcurrent conductor ampacity (NEC 240.4), equipment grounding (NEC 250), and box fill capacity (NEC 314.16).
          </p>
        </div>

        {/* Score Card */}
        <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Apprentice Inspection Score</div>
            <div
              className={`text-2xl font-black font-mono ${
                apprenticeScore >= 90
                  ? 'text-emerald-400'
                  : apprenticeScore >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {apprenticeScore} / 100
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              apprenticeScore >= 90
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : apprenticeScore >= 70
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Violations List & Box Fill Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Violations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Active Inspection Findings ({state.violations.length})</span>
            </h3>

            {state.violations.length > 0 && (
              <button
                onClick={fixAllViolations}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Remediate All Violations</span>
              </button>
            )}
          </div>

          {state.violations.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">100% Code Compliant Installation</h4>
              <p className="text-xs text-emerald-200 max-w-md mx-auto">
                All branch circuits, polarity terminations, wire gauges, grounding bonds, and terminal screw torque values comply with the National Electrical Code.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.violations.map((v, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    v.severity === 'CRITICAL_HAZARD'
                      ? 'bg-rose-950/40 border-rose-600/80 shadow-lg shadow-rose-950/40'
                      : v.severity === 'CODE_VIOLATION'
                      ? 'bg-amber-950/30 border-amber-600/70'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {v.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        v.severity === 'CRITICAL_HAZARD'
                          ? 'bg-rose-600 text-white'
                          : v.severity === 'CODE_VIOLATION'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {v.severity.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{v.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{v.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 text-xs flex items-start space-x-2 text-emerald-300 bg-slate-950/50 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Corrective Remedy: </span>
                      {v.correctiveAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Box Fill Calculator (NEC 314.16) (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">NEC 314.16 Box Fill Volume Calculator</h3>
              <p className="text-[11px] text-slate-400">Prevents conductor crowding and heat accumulation in electrical enclosures</p>
            </div>
          </div>

          {/* Compliance Status Card */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isBoxFillCompliant
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-600/80 text-rose-200'
            }`}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {isBoxFillCompliant ? 'BOX FILL COMPLIANT' : 'OVERFILLED ENCLOSURE (VIOLATION)'}
              </div>
              <div className="text-xs font-mono mt-0.5">
                Required: {totalRequiredVolume.toFixed(2)} cu.in / Available: {boxVolumeCuIn.toFixed(1)} cu.in
              </div>
            </div>
            {isBoxFillCompliant ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
            )}
          </div>

          {/* Input Controls */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium flex justify-between">
                <span>Box Enclosure Stamped Volume:</span>
                <span className="font-mono font-bold text-amber-400">{boxVolumeCuIn} cu.in</span>
              </label>
              <input
                type="range"
                min="12"
                max="42"
                step="2"
                value={boxVolumeCuIn}
                onChange={(e) => setBoxVolumeCuIn(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium">14 AWG Conductors (2.0 cu.in ea):</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={conductorCount14}
                  onChange={(e) => setConductorCount14(Math.max(0, Number(e.target.value)))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">12 AWG Conductors (2.25 cu.in ea):</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={conductorCount12}
                  onChange={(e) => setConductorCount12(Math.max(0, Number(e.target.value)))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium">Wiring Devices / Receptacles:</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={deviceCount}
                  onChange={(e) => setDeviceCount(Math.max(0, Number(e.target.value)))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">Counts as 2 volume units</span>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Grounding Conductors (EGC):</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={groundWireCount}
                  onChange={(e) => setGroundWireCount(Math.max(0, Number(e.target.value)))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">Counts as 1 single allowance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
