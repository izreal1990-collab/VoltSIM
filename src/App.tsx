/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { InteractiveWorkbench } from './components/InteractiveWorkbench';
import { ScriptsVault } from './components/ScriptsVault';
import { ArchitectureDiagrams } from './components/ArchitectureDiagrams';
import { NECInspector } from './components/NECInspector';
import { AIBlueprintStudio } from './components/AIBlueprintStudio';
import { ChatInterface } from './components/ChatInterface';
import { createInitialSimulationState, CircuitSimulationState, evaluateCircuitState } from './services/circuitSolver';
import { soundEffects } from './services/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workbench');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [simState, setSimState] = useState<CircuitSimulationState>(() =>
    evaluateCircuitState(createInitialSimulationState())
  );

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    soundEffects.setMuted(muted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Application Header & Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={handleMuteToggle}
        activeViolationsCount={simState.violations.length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workbench' && (
          <InteractiveWorkbench state={simState} setState={setSimState} />
        )}
        {activeTab === 'scripts' && <ScriptsVault />}
        {activeTab === 'architecture' && <ArchitectureDiagrams />}
        {activeTab === 'nec' && <NECInspector state={simState} setState={setSimState} />}
        {activeTab === 'ai-studio' && <AIBlueprintStudio />}
        {activeTab === 'chat' && <ChatInterface simState={simState} />}
      </main>

      {/* Floating Quick Consultation Launcher */}
      {activeTab !== 'chat' && (
        <button
          onClick={() => setActiveTab('chat')}
          className="fixed bottom-14 right-6 z-40 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl shadow-amber-500/30 flex items-center space-x-2 text-xs transition transform hover:scale-105 active:scale-95 border border-amber-300/40"
          title="Consult Gemini Technical AI Mentor"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
          <span>Ask Gemini Mentor</span>
        </button>
      )}

      {/* Persistent Technical Status Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-amber-500 font-bold">VoltSim 3D Engine</span>
            <span>•</span>
            <span>Unity URP Android Mobile Target</span>
            <span>•</span>
            <span>NFPA 70 NEC Compliant</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span>SRP Batcher: ON</span>
            <span>Draw Calls: 74/120</span>
            <span>Memory: 78.4MB / 100MB</span>
            <span>Target: 60 FPS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
