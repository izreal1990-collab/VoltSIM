import React from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Code2,
  Cpu,
  Eye,
  FileCode2,
  HelpCircle,
  Image as ImageIcon,
  ShieldAlert,
  Volume2,
  VolumeX,
  Zap,
  Bot,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'workbench' | 'scripts' | 'architecture' | 'nec' | 'ai-studio' | 'chat';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  activeViolationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  activeViolationsCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('workbench')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
              <Zap className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">VoltSim 3D</span>
                <span className="text-[11px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  Unity URP Mobile
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Master Electrician & Apprenticeship Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'workbench'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Interactive Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('scripts')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'scripts'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>C# Production Scripts</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>System Architecture</span>
            </button>

            <button
              onClick={() => setActiveTab('nec')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'nec'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>NEC AI Inspector</span>
              {activeViolationsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {activeViolationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ai-studio')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ai-studio'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>AI Blueprint Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Gemini AI Mentor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            </button>
          </nav>

          {/* Right Controls: Audio & Telemetry */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>60 FPS • 78.4 MB RAM</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Simulator Sounds' : 'Mute Simulator Sounds'}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'workbench' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Workbench
          </button>
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'scripts' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            C# Scripts
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'architecture' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('nec')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'nec' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            NEC ({activeViolationsCount})
          </button>
          <button
            onClick={() => setActiveTab('ai-studio')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'ai-studio' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            AI Blueprints
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>AI Mentor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
