import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  Layers,
  Sparkles,
  Terminal,
  Zap
} from 'lucide-react';
import { UNITY_SCRIPTS, UnityScriptItem } from '../services/unityScriptsData';

export const ScriptsVault: React.FC = () => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>(UNITY_SCRIPTS[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const activeScript = UNITY_SCRIPTS.find((s) => s.id === selectedScriptId) || UNITY_SCRIPTS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeScript.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeScript.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeScript.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Production Unity C# Architecture</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Production-Ready C# Scripts Vault (Unity URP Mobile)
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Complete, fully commented C# scripts for the core graph evaluator, interactive multimeter, Verlet wire splines, NEC inspector, and mobile URP configuration. Zero-GC allocations per frame, memory footprint &lt; 100MB.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy C# Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download {activeScript.filename}</span>
          </button>
        </div>
      </div>

      {/* Code Explorer Grid: Left Scripts List | Right Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scripts List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Simulation Source Modules ({UNITY_SCRIPTS.length})
          </div>

          {UNITY_SCRIPTS.map((script) => {
            const isSelected = script.id === selectedScriptId;
            return (
              <div
                key={script.id}
                onClick={() => setSelectedScriptId(script.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                    {script.filename}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {script.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{script.description}</p>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">{script.linesOfCode} lines of code</div>
              </div>
            );
          })}
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* File Tab Header */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold font-mono text-white">{activeScript.filename}</span>
              <span className="text-[11px] text-slate-400 font-mono">({activeScript.linesOfCode} lines)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Script Overview Note */}
          <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-2.5 text-xs text-slate-300 flex items-start space-x-2">
            <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Module Purpose: </span>
              {activeScript.description}
            </div>
          </div>

          {/* Code Text with Line Numbers */}
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto text-xs font-mono leading-relaxed bg-[#0a0f1d] text-slate-300">
            <pre className="table">
              {activeScript.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-800/40">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 font-mono text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono text-slate-200">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
