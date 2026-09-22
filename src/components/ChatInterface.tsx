import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Trash2,
  Copy,
  Check,
  Cpu,
  ShieldAlert,
  Calculator,
  RefreshCw,
  Terminal,
  Settings,
  HelpCircle,
  Download,
  AlertTriangle,
  Lightbulb,
  Share2
} from 'lucide-react';
import { CircuitSimulationState } from '../services/circuitSolver';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  modelUsed?: string;
  roleTitle?: string;
}

export type ChatRolePreset = 'master_electrician' | 'unity_architect' | 'nec_inspector' | 'fast_calc';
export type ModelOption = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

interface ChatInterfaceProps {
  simState?: CircuitSimulationState;
}

interface RoleConfig {
  id: ChatRolePreset;
  title: string;
  badge: string;
  recommendedModel: ModelOption;
  icon: React.ReactNode;
  description: string;
  systemInstruction: string;
  suggestedPrompts: string[];
}

const ROLE_CONFIGS: Record<ChatRolePreset, RoleConfig> = {
  master_electrician: {
    id: 'master_electrician',
    title: 'Master Electrician Mentor',
    badge: 'Apprenticeship Instructor',
    recommendedModel: 'gemini-3.5-flash',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    description: 'Mentorship in residential wiring, split-phase theory, jobsite safety, and multimeter troubleshooting.',
    systemInstruction: `You are a licensed Master Electrician and Apprenticeship Instructor with over 25 years of field experience in residential electrical systems. 
Your mission is to mentor apprentices with practical, authoritative, safety-first electrical knowledge.
Cover split-phase 120V/240V theory, conductor colors (black/red hot, white neutral, bare/green ground), neutral return current cancellation, Lockout/Tagout (LOTO) protocols, multimeter diagnostics (phantom voltage, continuity, impedance), and circuit breaker operation.
Always emphasize electrical safety and de-energizing circuits before physical contact. Keep tone encouraging, professional, and clear.`,
    suggestedPrompts: [
      'Why is there 240V between Phase A and Phase B, but 120V to Neutral?',
      'How does a 3-way switch circuit route current across travelers?',
      'Why does a digital multimeter sometimes display phantom 40-70V on disconnected wires?',
      'Explain how a multi-wire branch circuit (MWBC) cancels neutral current when balanced.',
    ],
  },
  unity_architect: {
    id: 'unity_architect',
    title: 'Unity Engine Architect',
    badge: 'Mobile 3D & URP',
    recommendedModel: 'gemini-3.1-pro-preview',
    icon: <Cpu className="w-4 h-4 text-cyan-400" />,
    description: 'Specializes in Unity URP mobile optimization, zero-GC C# graph solving, and Verlet wire physics.',
    systemInstruction: `You are a Principal Unity Engine Architect specializing in interactive technical training simulations on Android mobile with the Universal Render Pipeline (URP).
You possess deep expertise in:
- Tile-based deferred renderers (TBDR GPUs: Adreno, Mali), early-Z rejection, avoiding alpha testing/cutout in favor of opaque vertex-colored meshes.
- Zero-garbage-collection per-frame C# architecture (pre-allocated collections, non-alloc physics queries, BFS graph state evaluation).
- Procedural Verlet integration wire splines that simulate flexible Romex cables without expensive Rigidbody physics.
- High-impedance 10M-Ohm multimeter probing simulation.
- Keeping peak Android memory below 100MB.
Provide concrete C# snippets, mathematical formulations, and shader optimization advice when asked.`,
    suggestedPrompts: [
      'How does CircuitGraph evaluate circuit potential using zero-GC BFS?',
      'Explain how Verlet wire splines simulate cable flex without Rigidbody physics overhead.',
      'How does early-Z rejection optimize wire mesh rendering on mobile TBDR GPUs?',
      'What are the memory allocations needed to keep total mobile heap under 100MB?',
    ],
  },
  nec_inspector: {
    id: 'nec_inspector',
    title: 'NEC Code Compliance Inspector',
    badge: 'NFPA 70 AHJ',
    recommendedModel: 'gemini-3.1-pro-preview',
    icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
    description: 'Certified electrical inspector auditing NFPA 70 (NEC 2023) articles, box fill, and protection rules.',
    systemInstruction: `You are an Authority Having Jurisdiction (AHJ) and Senior Electrical Inspector certified in NFPA 70 (National Electrical Code - 2023 edition).
You inspect residential installations and enforce:
- NEC 210.8 (GFCI protection in kitchens, bathrooms, outdoors, basements).
- NEC 210.12 (AFCI protection for branch circuits in dwelling units).
- NEC 240.4 (Overcurrent protection limits: 14 AWG = 15A, 12 AWG = 20A, 10 AWG = 30A).
- NEC 250 (Grounding electrode systems and equipment bonding vs grounding).
- NEC 314.16 (Box fill calculation volume allowances: 2.00 cu in for 14 AWG, 2.25 cu in for 12 AWG, clamps, support fittings, devices, grounds).
Always cite specific code sections and explain the fire or electrocution risk behind each violation.`,
    suggestedPrompts: [
      'Calculate NEC 314.16 box fill for a 2-gang box with four 12 AWG Romex cables and two receptacles.',
      'Where is GFCI protection strictly required under NEC 2023 210.8(A)?',
      'Explain the difference between system grounding and equipment bonding under NEC 250.',
      'Why is tapping a 20A breaker with 14 AWG Romex an NEC 240.4 violation?',
    ],
  },
  fast_calc: {
    id: 'fast_calc',
    title: 'Rapid Calculation Co-Pilot',
    badge: 'Instant Math & Tables',
    recommendedModel: 'gemini-3.1-flash-lite',
    icon: <Calculator className="w-4 h-4 text-amber-300" />,
    description: 'Sub-second electrical calculations: Ohm’s law, voltage drop, conduit fill, and ampacity tables.',
    systemInstruction: `You are a high-speed electrical calculator and rapid formula solver.
Deliver instantaneous, mathematically precise answers:
- Ohm's Law (V = I * R, P = V * I, P = I^2 * R)
- Conductor Ampacities (NEC 310.16 75°C/60°C ratings)
- 3% and 5% Voltage Drop calculations: VD = (2 * K * I * L) / CM
- Quick conduit and box volume checks
Keep responses structured, concise, and straight to the numbers.`,
    suggestedPrompts: [
      'Calculate voltage drop for 20A load on 12 AWG copper at 100 feet on 120V.',
      'What is the continuous load limit on a 20A breaker according to the 80% rule?',
      'Give me the standard ampacities for 14, 12, 10, 8, 6 AWG copper (60°C and 75°C).',
      'How much current does a 12,000W electric residential range pull at 240V?',
    ],
  },
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ simState }) => {
  const [selectedRole, setSelectedRole] = useState<ChatRolePreset>('master_electrician');
  const [selectedModel, setSelectedModel] = useState<ModelOption>('gemini-3.5-flash');
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [isEditingInstruction, setIsEditingInstruction] = useState<boolean>(false);
  const [includeTelemetry, setIncludeTelemetry] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      role: 'model',
      text: `Welcome to the **VoltSim 3D AI Mentor & Technical Advisory Desk**! ⚡

I am ready to assist you with:
- **Electrical Apprenticeship & Theory:** Split-phase 120V/240V systems, switch legs, 3-way travelers, and live multimeter troubleshooting.
- **Unity URP Mobile Architecture:** Zero-GC C# algorithms, low-poly procedural Verlet wire splines, and mobile TBDR render optimization.
- **NEC 2023 Code Compliance:** Box fill calculations, AFCI/GFCI protection, and equipment grounding.

*Select a persona role or model above, or try one of the prompt chips below to get started.*`,
      timestamp: new Date(),
      modelUsed: 'gemini-3.5-flash',
      roleTitle: 'Master Electrician Mentor',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust model when role changes if user hasn't explicitly locked it
  const handleRoleChange = (newRole: ChatRolePreset) => {
    setSelectedRole(newRole);
    setSelectedModel(ROLE_CONFIGS[newRole].recommendedModel);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    let enrichedPrompt = text.trim();

    // If telemetry context injection is enabled and simState is available, append current live simulation parameters
    if (includeTelemetry && simState) {
      const activeViolations = simState.violations.map((v) => v.title).join(', ') || 'None (Clean Code)';
      const activeFaults = Object.entries(simState.faults)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ') || 'None';

      const breakerSummaries = Object.values(simState.breakers)
        .map((b) => `${b.circuitLabel} (${b.ratingAmps}A): ${b.state}`)
        .join('; ');

      const redTarget = simState.multimeter.redProbeTerminalId
        ? simState.terminals[simState.multimeter.redProbeTerminalId]?.name || simState.multimeter.redProbeTerminalId
        : 'NONE';
      const blackTarget = simState.multimeter.blackProbeTerminalId
        ? simState.terminals[simState.multimeter.blackProbeTerminalId]?.name || simState.multimeter.blackProbeTerminalId
        : 'NONE';

      const telemetryContext = `\n\n[LIVE VOLTSIM 3D SIMULATION CONTEXT:
- Main Service Disconnect: ${simState.mainServiceBreaker ? 'ENERGIZED (ON)' : 'DISCONNECTED (OFF)'}
- Breaker Panel States: ${breakerSummaries}
- Active Injected Faults: ${activeFaults}
- Multimeter: Mode ${simState.multimeter.mode}, Red on [${redTarget}], Black on [${blackTarget}], Display: ${simState.multimeter.displayValue} ${simState.multimeter.displayUnit}
- Active NEC Violations Detected: ${activeViolations}]`;

      enrichedPrompt += telemetryContext;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(), // display clean message in UI
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const currentRoleConfig = ROLE_CONFIGS[selectedRole];
      const activeSystemInstruction = customSystemInstruction.trim() || currentRoleConfig.systemInstruction;

      // Prepare conversation payload for multi-turn server route
      const apiMessages = newHistory.map((m, idx) => {
        // For the latest user message, send enriched prompt with context if enabled
        if (idx === newHistory.length - 1 && m.role === 'user') {
          return { role: 'user', text: enrichedPrompt };
        }
        return { role: m.role, text: m.text };
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemInstruction: activeSystemInstruction,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to reach Gemini API`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response returned from model.',
        timestamp: new Date(),
        modelUsed: data.modelUsed || selectedModel,
        roleTitle: currentRoleConfig.title,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Simulation Advisory Notice**: ${err.message || 'Unable to communicate with the Gemini server. Please check your connection and configuration.'}`,
        timestamp: new Date(),
        modelUsed: selectedModel,
        roleTitle: 'System Diagnostic',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        text: `Chat thread cleared. What would you like to explore next in **VoltSim 3D**?`,
        timestamp: new Date(),
        modelUsed: selectedModel,
        roleTitle: ROLE_CONFIGS[selectedRole].title,
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportTranscript = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'Apprentice' : m.roleTitle || 'Gemini AI'} (${m.modelUsed || 'user'}):\n${m.text}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voltsim-gemini-session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to render text with Markdown features (headers, bold, code blocks)
  const renderFormattedContent = (content: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        code: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3 leading-relaxed text-sm">
        {parts.map((part, pIdx) => {
          if (part.type === 'code') {
            return (
              <div key={pIdx} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                  <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{part.language || 'code'}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(part.code || '', `code-${pIdx}`)}
                    className="flex items-center space-x-1 text-[11px] hover:text-white transition"
                  >
                    {copiedId === `code-${pIdx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto text-slate-200 select-text font-mono text-xs">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          // Plain text with simple paragraph/list formatting
          const paragraphs = part.content?.split('\n\n') || [];
          return (
            <div key={pIdx} className="space-y-2">
              {paragraphs.map((p, paraIdx) => {
                // Check if it's a bullet list
                if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
                  const items = p.split('\n').filter((item) => item.trim().length > 0);
                  return (
                    <ul key={paraIdx} className="list-disc list-inside space-y-1 my-1 pl-1 text-slate-200">
                      {items.map((it, itIdx) => (
                        <li key={itIdx}>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: it
                                .replace(/^[-*]\s+/, '')
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>'),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Check for headers (###, ##, #)
                if (p.trim().startsWith('### ')) {
                  return (
                    <h4 key={paraIdx} className="text-amber-400 font-bold text-sm mt-3 mb-1">
                      {p.replace('### ', '')}
                    </h4>
                  );
                }
                if (p.trim().startsWith('## ')) {
                  return (
                    <h3 key={paraIdx} className="text-amber-300 font-bold text-base mt-3 mb-1">
                      {p.replace('## ', '')}
                    </h3>
                  );
                }

                return (
                  <p
                    key={paraIdx}
                    className="text-slate-200 leading-normal"
                    dangerouslySetInnerHTML={{
                      __html: p
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>'),
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const activeRoleConfig = ROLE_CONFIGS[selectedRole];

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Gemini Technical Apprentice & Engine Chatbot</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    Multi-Turn
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Role-based electrical mentoring, code enforcement, and low-latency mobile engine consultation.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Clear, Export, Config) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingInstruction(!isEditingInstruction)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Inspect or modify AI System Instruction"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>System Role Spec</span>
            </button>

            <button
              onClick={exportTranscript}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Download conversation markdown transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={clearChat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Persona Role Selection Grid */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(Object.keys(ROLE_CONFIGS) as ChatRolePreset[]).map((rKey) => {
            const role = ROLE_CONFIGS[rKey];
            const isSelected = selectedRole === rKey;
            return (
              <button
                key={rKey}
                onClick={() => handleRoleChange(rKey)}
                className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-slate-900 border border-slate-800">{role.icon}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                      {role.title}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{role.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-1.5 mt-auto">
                  <span>Rec:</span>
                  <span className="text-amber-400/90 font-medium">{role.recommendedModel}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Model Selection Toolbar & Live Telemetry Toggle */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold font-mono text-[11px]">ACTIVE MODEL:</span>
            
            {/* gemini-3.5-flash for general tasks */}
            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              gemini-3.5-flash
              <span className="ml-1.5 text-[9px] opacity-80">(General Tasks)</span>
            </button>

            {/* gemini-3.1-flash-lite for tasks that should happen fast */}
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              gemini-3.1-flash-lite
              <span className="ml-1.5 text-[9px] opacity-80">(Fast Tasks)</span>
            </button>

            {/* gemini-3.1-pro-preview for particularly complex tasks */}
            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              gemini-3.1-pro-preview
              <span className="ml-1.5 text-[9px] opacity-80">(Complex Tasks)</span>
            </button>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={includeTelemetry}
              onChange={(e) => setIncludeTelemetry(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/20"
            />
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Attach Live Simulation State (Breakers, Probes, Faults)</span>
            </span>
          </label>
        </div>

        {/* System Instruction Customizer Drawer */}
        {isEditingInstruction && (
          <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
                <Settings className="w-3.5 h-3.5" />
                <span className="font-bold">ACTIVE SYSTEM INSTRUCTION: {activeRoleConfig.title}</span>
              </div>
              <button
                onClick={() => setCustomSystemInstruction('')}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Reset to Role Default
              </button>
            </div>
            <textarea
              rows={3}
              value={customSystemInstruction || activeRoleConfig.systemInstruction}
              onChange={(e) => setCustomSystemInstruction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-md p-2.5 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              placeholder="Provide custom instructions to guide the role persona..."
            />
            <p className="text-[10px] text-slate-500">
              *System instructions are sent on every conversation turn to enforce technical persona, safety bounds, and domain expertise.*
            </p>
          </div>
        )}
      </div>

      {/* Main Conversation Thread Viewport */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[580px]">
        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 border border-slate-700 text-amber-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                  <div
                    className={`flex items-center space-x-2 text-[11px] font-mono ${
                      isUser ? 'justify-end text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">
                      {isUser ? 'Electrical Apprentice' : message.roleTitle || 'AI Mentor'}
                    </span>
                    <span>•</span>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.modelUsed && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 text-[9px] border border-slate-700">
                        {message.modelUsed}
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-2xl relative shadow-md select-text ${
                      isUser
                        ? 'bg-amber-600/20 text-slate-100 border border-amber-500/30 rounded-tr-none'
                        : 'bg-slate-950 text-slate-100 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    {renderFormattedContent(message.text)}

                    {/* Copy message button */}
                    <button
                      onClick={() => copyToClipboard(message.text, message.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-none space-y-2">
                <div className="flex items-center space-x-2 text-xs text-amber-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>
                    Evaluating circuit physics & formulating response with{' '}
                    <strong className="text-white">{selectedModel}</strong>...
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 overflow-x-auto flex items-center space-x-2 text-xs no-scrollbar">
          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap flex items-center space-x-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Suggested:</span>
          </span>
          {activeRoleConfig.suggestedPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] whitespace-nowrap transition disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          <div className="relative flex items-end bg-slate-950 border border-slate-700 rounded-xl focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={`Ask ${activeRoleConfig.title} a question (Press Enter to send, Shift+Enter for new line)...`}
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans"
            />
            <div className="p-2 flex items-center space-x-2">
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>
              Persona: <strong className="text-slate-300">{activeRoleConfig.title}</strong>
            </span>
            <span>
              Model: <strong className="text-amber-400">{selectedModel}</strong> • User-Agent: aistudio-build
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
