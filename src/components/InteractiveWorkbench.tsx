import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  HelpCircle,
  Lightbulb,
  Radio,
  RefreshCw,
  RotateCw,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Volume2,
  Wrench,
  Zap,
  ZapOff
} from 'lucide-react';
import { MultimeterMode, TerminalPoint, WIRE_SPECS } from '../types/circuit';
import { CircuitSimulationState, evaluateCircuitState } from '../services/circuitSolver';
import { soundEffects } from '../services/soundEffects';

interface InteractiveWorkbenchProps {
  state: CircuitSimulationState;
  setState: React.Dispatch<React.SetStateAction<CircuitSimulationState>>;
}

export const InteractiveWorkbench: React.FC<InteractiveWorkbenchProps> = ({ state, setState }) => {
  const [selectedProbeToMove, setSelectedProbeToMove] = useState<'RED' | 'BLACK'>('RED');

  const updateSim = (updater: (prev: CircuitSimulationState) => CircuitSimulationState) => {
    setState((prev) => evaluateCircuitState(updater(prev)));
  };

  const toggleMainBreaker = () => {
    soundEffects.playBreakerSnap(!state.mainServiceBreaker);
    updateSim((prev) => {
      const nextMain = !prev.mainServiceBreaker;
      const nextBreakers = { ...prev.breakers };
      nextBreakers['b_main'].state = nextMain ? 'ON' : 'OFF';
      return {
        ...prev,
        mainServiceBreaker: nextMain,
        breakers: nextBreakers,
      };
    });
  };

  const toggleBranchBreaker = (breakerId: string) => {
    updateSim((prev) => {
      const current = prev.breakers[breakerId];
      const nextState = current.state === 'ON' ? 'OFF' : 'ON';
      soundEffects.playBreakerSnap(nextState === 'OFF');
      return {
        ...prev,
        breakers: {
          ...prev.breakers,
          [breakerId]: {
            ...current,
            state: nextState,
          },
        },
      };
    });
  };

  const toggleSinglePoleSwitch = () => {
    soundEffects.playRotaryClick();
    updateSim((prev) => ({
      ...prev,
      switchStates: {
        ...prev.switchStates,
        singlePoleSwitch: !prev.switchStates.singlePoleSwitch,
      },
    }));
  };

  const toggle3Way1 = () => {
    soundEffects.playRotaryClick();
    updateSim((prev) => ({
      ...prev,
      switchStates: {
        ...prev.switchStates,
        threeWaySwitch1: prev.switchStates.threeWaySwitch1 === 'UP' ? 'DOWN' : 'UP',
      },
    }));
  };

  const toggle4Way = () => {
    soundEffects.playRotaryClick();
    updateSim((prev) => ({
      ...prev,
      switchStates: {
        ...prev.switchStates,
        fourWaySwitch: prev.switchStates.fourWaySwitch === 'STRAIGHT' ? 'CROSS' : 'STRAIGHT',
      },
    }));
  };

  const toggle3Way2 = () => {
    soundEffects.playRotaryClick();
    updateSim((prev) => ({
      ...prev,
      switchStates: {
        ...prev.switchStates,
        threeWaySwitch2: prev.switchStates.threeWaySwitch2 === 'UP' ? 'DOWN' : 'UP',
      },
    }));
  };

  const setMultimeterMode = (mode: MultimeterMode) => {
    soundEffects.playRotaryClick();
    updateSim((prev) => ({
      ...prev,
      multimeter: {
        ...prev.multimeter,
        mode,
      },
    }));
  };

  const assignProbeTerminal = (probe: 'RED' | 'BLACK', terminalId: string | null) => {
    soundEffects.playRotaryClick();
    updateSim((prev) => ({
      ...prev,
      multimeter: {
        ...prev.multimeter,
        redProbeTerminalId: probe === 'RED' ? terminalId : prev.multimeter.redProbeTerminalId,
        blackProbeTerminalId: probe === 'BLACK' ? terminalId : prev.multimeter.blackProbeTerminalId,
      },
    }));
  };

  const triggerDeadShort = () => {
    updateSim((prev) => ({
      ...prev,
      faults: {
        ...prev.faults,
        deadShortBranch2: true,
      },
    }));
  };

  const resetFaults = () => {
    soundEffects.playBreakerSnap();
    updateSim((prev) => {
      const resetBreakers = { ...prev.breakers };
      resetBreakers['b_br2'].state = 'ON';
      return {
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
        breakers: resetBreakers,
      };
    });
  };

  const currentRedTerminal = state.multimeter.redProbeTerminalId
    ? state.terminals[state.multimeter.redProbeTerminalId]
    : null;
  const currentBlackTerminal = state.multimeter.blackProbeTerminalId
    ? state.terminals[state.multimeter.blackProbeTerminalId]
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Arc Flash or Critical Hazard is Triggered */}
      {state.arcFlashActive && (
        <div className="bg-rose-950/90 border-2 border-rose-500 rounded-xl p-4 text-rose-100 flex items-start space-x-4 shadow-xl shadow-rose-900/40 animate-pulse">
          <Flame className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <span>EXPLOSIVE ARC FLASH & OVERCURRENT BREAKER TRIP!</span>
            </h3>
            <p className="text-sm text-rose-200 mt-1">{state.arcFlashMessage}</p>
            <div className="mt-3 flex items-center space-x-3">
              <button
                onClick={resetFaults}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Branch 2 Breaker & Clear Short</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Panel (Split-Phase Service Panel & Branch Devices) | Right Panel (Interactive Multimeter & Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Service Panel & Devices */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main 120V/240V Split-Phase Service Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>200A Residential Load Center (Split-Phase 120V / 240V)</span>
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      NEMA 1 Enclosure
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dual copper busbars with Phase A (120V @ 0°), Phase B (120V @ 180°), Neutral, and Ground
                  </p>
                </div>
              </div>

              {/* Main 200A Disconnect Breaker */}
              <div className="flex items-center space-x-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-bold text-white">Main Disconnect</div>
                  <div className="text-[10px] font-mono text-slate-400">200A 2-Pole</div>
                </div>
                <button
                  onClick={toggleMainBreaker}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow ${
                    state.mainServiceBreaker
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-700 hover:bg-rose-600 text-white'
                  }`}
                >
                  <PowerIcon isOn={state.mainServiceBreaker} />
                  <span>{state.mainServiceBreaker ? 'MAIN ON' : 'MAIN OFF'}</span>
                </button>
              </div>
            </div>

            {/* Split-Phase Copper Busbars Schematic */}
            <div className="grid grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 mb-5">
              {/* Busbar Phase A */}
              <div
                onClick={() => assignProbeTerminal(selectedProbeToMove, 't_bus_a')}
                className={`cursor-pointer p-3 rounded-lg border transition ${
                  state.terminals['t_bus_a'].isEnergized
                    ? 'bg-amber-950/40 border-amber-500/60 hover:border-amber-400'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400">Phase A Busbar</span>
                  <TerminalProbeTag terminalId="t_bus_a" multimeter={state.multimeter} />
                </div>
                <div className="text-xs font-mono mt-1 text-slate-300">
                  {state.terminals['t_bus_a'].isEnergized ? '120V RMS (0°)' : '0V (De-energized)'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Click to probe with {selectedProbeToMove}</div>
              </div>

              {/* Busbar Phase B */}
              <div
                onClick={() => assignProbeTerminal(selectedProbeToMove, 't_bus_b')}
                className={`cursor-pointer p-3 rounded-lg border transition ${
                  state.terminals['t_bus_b'].isEnergized
                    ? 'bg-amber-950/40 border-amber-500/60 hover:border-amber-400'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400">Phase B Busbar</span>
                  <TerminalProbeTag terminalId="t_bus_b" multimeter={state.multimeter} />
                </div>
                <div className="text-xs font-mono mt-1 text-slate-300">
                  {state.terminals['t_bus_b'].isEnergized ? '120V RMS (180°)' : '0V (De-energized)'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">240V across Phase A-B</div>
              </div>

              {/* Neutral Busbar */}
              <div
                onClick={() => assignProbeTerminal(selectedProbeToMove, 't_neutral_bar')}
                className="cursor-pointer p-3 rounded-lg border bg-slate-900 border-slate-700 hover:border-slate-500 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">Neutral Bar (N)</span>
                  <TerminalProbeTag terminalId="t_neutral_bar" multimeter={state.multimeter} />
                </div>
                <div className="text-xs font-mono mt-1 text-slate-300">0.0V (Bonded)</div>
                <div className="text-[10px] text-slate-500 mt-1">White Conductor Return</div>
              </div>

              {/* Ground Busbar */}
              <div
                onClick={() => assignProbeTerminal(selectedProbeToMove, 't_ground_bar')}
                className="cursor-pointer p-3 rounded-lg border bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-400">Ground Bar (PE)</span>
                  <TerminalProbeTag terminalId="t_ground_bar" multimeter={state.multimeter} />
                </div>
                <div className="text-xs font-mono mt-1 text-emerald-300">0.0V (Electrode)</div>
                <div className="text-[10px] text-slate-500 mt-1">Bare Copper / Green</div>
              </div>
            </div>

            {/* Branch Circuit Breakers Rack */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span>Branch Circuit Protection (NEC 240.4 & 210.8)</span>
                <span className="text-[11px] text-slate-500">Tap breaker switch to toggle / simulate trip</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(state.breakers)
                  .filter((b) => b.id !== 'b_main')
                  .map((b) => {
                    const isTripped = b.state === 'TRIPPED';
                    const isOn = b.state === 'ON';
                    const spec = WIRE_SPECS[b.wireGauge];

                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between ${
                          isTripped
                            ? 'bg-rose-950/40 border-rose-500/80 shadow-md shadow-rose-900/30'
                            : isOn
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/30 border-slate-900 text-slate-500'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white">{b.circuitLabel}</span>
                            <span
                              className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                                b.poles === 2 ? 'bg-indigo-900/60 text-indigo-300' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {b.poles === 2 ? '240V 2-Pole' : '120V 1-Pole'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {b.ratingAmps}A • Feed: {b.feedPhase} • Wire: {spec.name}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isTripped && (
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider animate-pulse">
                              TRIPPED
                            </span>
                          )}
                          <button
                            onClick={() => toggleBranchBreaker(b.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                              isTripped
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : isOn
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                            }`}
                          >
                            {isTripped ? 'RESET' : isOn ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Connected Residential Scenarios & Appliances */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Branch Installations & Interactive Test Terminals</span>
            </h3>

            {/* Scenario 1: Living Room Single-Pole Switch & Light */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Branch 1: Living Room Lighting (15A, 14 AWG)</h4>
                    <p className="text-[11px] text-slate-400">Single-Pole Switch toggles switched hot leg to luminaire</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="text-slate-400">Light Status:</span>
                    <span
                      className={`font-bold flex items-center space-x-1 ${
                        state.terminals['t_light1_hot'].isEnergized ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          state.terminals['t_light1_hot'].isEnergized ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                        }`}
                      />
                      <span>{state.terminals['t_light1_hot'].isEnergized ? 'ILLUMINATED' : 'OFF'}</span>
                    </span>
                  </div>

                  <button
                    onClick={toggleSinglePoleSwitch}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      state.switchStates.singlePoleSwitch
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Switch: {state.switchStates.singlePoleSwitch ? 'CLOSED (ON)' : 'OPEN (OFF)'}</span>
                  </button>
                </div>
              </div>

              {/* Terminals row */}
              <div className="grid grid-cols-3 gap-2">
                <TerminalButton
                  label="Switch Line In (Hot)"
                  feed="Phase A 120V"
                  terminalId="t_sw1_line"
                  terminal={state.terminals['t_sw1_line']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Switch Switched Leg"
                  feed="Switched Hot"
                  terminalId="t_sw1_load"
                  terminal={state.terminals['t_sw1_load']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Light Luminaire Brass"
                  feed="Lamp Brass Screw"
                  terminalId="t_light1_hot"
                  terminal={state.terminals['t_light1_hot']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
              </div>
            </div>

            {/* Scenario 2: Kitchen GFCI Receptacle (Branch 2) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Branch 2: Kitchen Counter GFCI Receptacle (20A, 12 AWG)</h4>
                    <p className="text-[11px] text-slate-400">Class A GFCI 4-6mA ground fault protection (NEC 210.8)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={triggerDeadShort}
                    className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Inject Hot-Neutral Short</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <TerminalButton
                  label="Brass Screw (Hot Line)"
                  feed="Phase B 120V"
                  terminalId="t_gfci_brass_hot"
                  terminal={state.terminals['t_gfci_brass_hot']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Silver Screw (Neutral)"
                  feed="Neutral 0V"
                  terminalId="t_gfci_silver_neutral"
                  terminal={state.terminals['t_gfci_silver_neutral']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Green Screw (Ground)"
                  feed="EGC Ground 0V"
                  terminalId="t_gfci_green_ground"
                  terminal={state.terminals['t_gfci_green_ground']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
              </div>
            </div>

            {/* Scenario 3: 240V Dedicated Electric Range (Branch 5) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Branch 5: 240V Dedicated Electric Range (50A 2-Pole, 6 AWG)</h4>
                    <p className="text-[11px] text-slate-400">4-Prong NEMA 14-50R with Line 1, Line 2, Neutral, and Chassis Ground</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateSim((prev) => ({
                        ...prev,
                        faults: {
                          ...prev.faults,
                          cutEquipmentGroundRange: !prev.faults.cutEquipmentGroundRange,
                        },
                      }))
                    }
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                      state.faults.cutEquipmentGroundRange
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      {state.faults.cutEquipmentGroundRange ? 'Ground Severed (Lethal Chassis!)' : 'Cut Equipment Ground'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <TerminalButton
                  label="Range L1 (Phase A)"
                  feed="120V to Gnd"
                  terminalId="t_range_l1"
                  terminal={state.terminals['t_range_l1']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Range L2 (Phase B)"
                  feed="120V to Gnd (240V L1-L2)"
                  terminalId="t_range_l2"
                  terminal={state.terminals['t_range_l2']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Range Neutral"
                  feed="Center-Tap 0V"
                  terminalId="t_range_neutral"
                  terminal={state.terminals['t_range_neutral']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="Appliance Chassis"
                  feed={state.branches['br5'].chassisEnergized ? 'HOT 120V SHOCK!' : '0V Bonded'}
                  terminalId="t_range_chassis"
                  terminal={state.terminals['t_range_chassis']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                  isHazard={state.branches['br5'].chassisEnergized}
                />
              </div>
            </div>

            {/* Scenario 4: 3-Way & 4-Way Hallway Traveler System (Branch 6) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Branch 6: 3-Way & 4-Way Hallway Traveler Switching</h4>
                    <p className="text-[11px] text-slate-400">Controls hallway luminaire from three independent door locations</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Hallway Light:</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      state.terminals['t_hall_light_hot'].isEnergized
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {state.terminals['t_hall_light_hot'].isEnergized ? 'ON (ENERGIZED)' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* 3 Switches in Series */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-white">Switch 1: 3-Way (Door A)</div>
                  <div className="text-[10px] text-slate-400 mb-2">Common: Line Hot (Phase A)</div>
                  <button
                    onClick={toggle3Way1}
                    className="w-full py-1 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    Position: {state.switchStates.threeWaySwitch1}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-white">Switch 2: 4-Way (Hallway)</div>
                  <div className="text-[10px] text-slate-400 mb-2">Reverses Traveler Pair</div>
                  <button
                    onClick={toggle4Way}
                    className="w-full py-1 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    Position: {state.switchStates.fourWaySwitch}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-white">Switch 3: 3-Way (Door B)</div>
                  <div className="text-[10px] text-slate-400 mb-2">Common: Switched Leg</div>
                  <button
                    onClick={toggle3Way2}
                    className="w-full py-1 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    Position: {state.switchStates.threeWaySwitch2}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <TerminalButton
                  label="3-Way #1 Common"
                  feed="Line In (Phase A)"
                  terminalId="t_3way1_common"
                  terminal={state.terminals['t_3way1_common']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="3-Way #1 Traveler 1"
                  feed="Brass Traveler"
                  terminalId="t_3way1_trav1"
                  terminal={state.terminals['t_3way1_trav1']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
                <TerminalButton
                  label="3-Way #2 Common Leg"
                  feed="To Hallway Light"
                  terminalId="t_3way2_common"
                  terminal={state.terminals['t_3way2_common']}
                  selectedProbe={selectedProbeToMove}
                  multimeter={state.multimeter}
                  onSelect={assignProbeTerminal}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Realistic Digital Multimeter Device & Fault Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digital Multimeter Housing */}
          <div className="bg-gradient-to-b from-yellow-500 via-amber-600 to-yellow-600 rounded-3xl p-4 shadow-2xl border-4 border-yellow-700 relative">
            {/* Rubber Holster Bumpers */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-slate-100 shadow-inner">
              {/* Brand & Model Banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-wider text-amber-400 font-mono">VOLTSIM</span>
                  <span className="text-[10px] text-slate-400 font-mono">TRUE RMS 87-V</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    CAT IV 600V
                  </span>
                </div>
              </div>

              {/* Backlit 7-Segment LCD Display */}
              <div className="bg-[#b4c9ad] border-2 border-slate-700 rounded-xl p-3 shadow-inner text-slate-950 font-mono relative overflow-hidden mb-4">
                {/* LCD Status Icons Header */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 tracking-wider">
                  <span>AUTO RANGE</span>
                  <div className="flex items-center space-x-2">
                    {state.multimeter.isContinuityBeeping && (
                      <span className="flex items-center space-x-1 text-emerald-800 font-black animate-pulse">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>BEEP</span>
                      </span>
                    )}
                    <span>HOLD</span>
                  </div>
                </div>

                {/* Primary Large Value Digits */}
                <div className="py-2 text-right">
                  <span className="text-4xl font-black tracking-tight font-mono">
                    {state.multimeter.displayValue || '0.00'}
                  </span>
                </div>

                {/* Units Bar */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-t border-slate-700/40 pt-1">
                  <span>
                    {state.multimeter.isOverload ? 'OVERLOAD (O.L)' : state.multimeter.leadWarning ? 'HAZARD!' : 'NORMAL'}
                  </span>
                  <span className="text-sm font-black">{state.multimeter.displayUnit}</span>
                </div>
              </div>

              {/* Rotary Switch Selector */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Rotary Function Dial
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setMultimeterMode('AC_VOLTS')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition text-center ${
                      state.multimeter.mode === 'AC_VOLTS'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    V ~ (AC)
                  </button>

                  <button
                    onClick={() => setMultimeterMode('DC_VOLTS')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition text-center ${
                      state.multimeter.mode === 'DC_VOLTS'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    V ⎓ (DC)
                  </button>

                  <button
                    onClick={() => setMultimeterMode('CONTINUITY')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition text-center ${
                      state.multimeter.mode === 'CONTINUITY'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    🔊 BEEP
                  </button>

                  <button
                    onClick={() => setMultimeterMode('RESISTANCE')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition text-center ${
                      state.multimeter.mode === 'RESISTANCE'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    Ω (Ohms)
                  </button>

                  <button
                    onClick={() => setMultimeterMode('OFF')}
                    className={`col-span-2 py-2 px-1 rounded-lg text-xs font-bold transition text-center ${
                      state.multimeter.mode === 'OFF'
                        ? 'bg-rose-600 text-white shadow-md font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    OFF
                  </button>
                </div>
              </div>

              {/* Probe Connection Jacks & Current Lead Status */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Test Leads Attachment</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedProbeToMove('RED')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        selectedProbeToMove === 'RED'
                          ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Red Active
                    </button>
                    <button
                      onClick={() => setSelectedProbeToMove('BLACK')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        selectedProbeToMove === 'BLACK'
                          ? 'bg-slate-700 text-white ring-2 ring-slate-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Black Active
                    </button>
                  </div>
                </div>

                {/* Red Lead Info */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-900/50">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-400/50" />
                    <div>
                      <div className="text-xs font-bold text-rose-300">RED PROBE (V/Ω)</div>
                      <div className="text-[11px] text-slate-300 font-mono truncate max-w-[170px]">
                        {currentRedTerminal ? currentRedTerminal.name : 'Open / Unconnected'}
                      </div>
                    </div>
                  </div>
                  {currentRedTerminal && (
                    <button
                      onClick={() => assignProbeTerminal('RED', null)}
                      className="text-[10px] text-rose-400 hover:text-rose-200 underline"
                    >
                      Detach
                    </button>
                  )}
                </div>

                {/* Black Lead Info */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400 ring-2 ring-slate-500/50" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">BLACK PROBE (COM)</div>
                      <div className="text-[11px] text-slate-300 font-mono truncate max-w-[170px]">
                        {currentBlackTerminal ? currentBlackTerminal.name : 'Open / Unconnected'}
                      </div>
                    </div>
                  </div>
                  {currentBlackTerminal && (
                    <button
                      onClick={() => assignProbeTerminal('BLACK', null)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Detach
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fault Injection & Safety Scenario Toggles */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>Apprentice Training Fault Injections</span>
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950">
                <span className="text-xs text-slate-300 font-medium">Reversed Polarity (Hot on Silver)</span>
                <input
                  type="checkbox"
                  checked={state.faults.reversePolarityBranch2}
                  onChange={(e) =>
                    updateSim((prev) => ({
                      ...prev,
                      faults: { ...prev.faults, reversePolarityBranch2: e.target.checked },
                    }))
                  }
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950">
                <span className="text-xs text-slate-300 font-medium">Undersized Wire (14 AWG on 20A)</span>
                <input
                  type="checkbox"
                  checked={state.faults.undersizedWireBranch2}
                  onChange={(e) =>
                    updateSim((prev) => ({
                      ...prev,
                      faults: { ...prev.faults, undersizedWireBranch2: e.target.checked },
                    }))
                  }
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950">
                <span className="text-xs text-slate-300 font-medium">Loose Terminal Torque (&lt;8 in-lb)</span>
                <input
                  type="checkbox"
                  checked={state.faults.looseTerminalScrewBranch1}
                  onChange={(e) =>
                    updateSim((prev) => ({
                      ...prev,
                      faults: { ...prev.faults, looseTerminalScrewBranch1: e.target.checked },
                    }))
                  }
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
              </label>

              <button
                onClick={resetFaults}
                className="w-full mt-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Faults & Breakers</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TerminalButtonProps {
  label: string;
  feed: string;
  terminalId: string;
  terminal: TerminalPoint;
  selectedProbe: 'RED' | 'BLACK';
  multimeter: any;
  onSelect: (probe: 'RED' | 'BLACK', id: string) => void;
  isHazard?: boolean;
}

const TerminalButton: React.FC<TerminalButtonProps> = ({
  label,
  feed,
  terminalId,
  terminal,
  selectedProbe,
  multimeter,
  onSelect,
  isHazard,
}) => {
  const isRedAttached = multimeter.redProbeTerminalId === terminalId;
  const isBlackAttached = multimeter.blackProbeTerminalId === terminalId;

  return (
    <div
      onClick={() => onSelect(selectedProbe, terminalId)}
      className={`cursor-pointer p-2.5 rounded-lg border transition text-left relative ${
        isHazard
          ? 'bg-rose-950/60 border-rose-500 animate-pulse text-white'
          : terminal.isEnergized
          ? 'bg-amber-950/20 border-amber-600/40 hover:border-amber-400'
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="truncate pr-1 text-slate-200">{label}</span>
        <TerminalProbeTag terminalId={terminalId} multimeter={multimeter} />
      </div>
      <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
        <span>{feed}</span>
        <span className={terminal.isEnergized ? 'text-amber-400 font-bold' : 'text-slate-500'}>
          {terminal.isEnergized ? '⚡ LIVE' : '0V'}
        </span>
      </div>
    </div>
  );
};

const TerminalProbeTag: React.FC<{ terminalId: string; multimeter: any }> = ({ terminalId, multimeter }) => {
  const isRed = multimeter.redProbeTerminalId === terminalId;
  const isBlack = multimeter.blackProbeTerminalId === terminalId;

  if (!isRed && !isBlack) return null;

  return (
    <div className="flex items-center space-x-1">
      {isRed && (
        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white font-mono shadow">
          RED
        </span>
      )}
      {isBlack && (
        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700 text-white font-mono shadow">
          BLK
        </span>
      )}
    </div>
  );
};

const PowerIcon: React.FC<{ isOn: boolean }> = ({ isOn }) => {
  return isOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />;
};
