import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Download,
  ExternalLink,
  Eye,
  FileImage,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  RefreshCw,
  Sliders,
  Sparkles,
  Wand2,
  X,
  Zap
} from 'lucide-react';

export const AIBlueprintStudio: React.FC = () => {
  const [model, setModel] = useState<'gemini-3.1-flash-image-preview' | 'gemini-3-pro-image-preview'>('gemini-3.1-flash-image-preview');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [prompt, setPrompt] = useState<string>(
    'Photorealistic 3D Unity URP mobile render of a residential 200A split-phase electrical service panel interior with copper busbars, labeled circuit breakers, neat Romex wire routing, and digital multimeter probes testing 240V'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  const aspectRatios = [
    { value: '1:1', label: '1:1 Square' },
    { value: '2:3', label: '2:3 Portrait' },
    { value: '3:2', label: '3:2 Landscape' },
    { value: '3:4', label: '3:4 Vertical' },
    { value: '4:3', label: '4:3 Standard' },
    { value: '9:16', label: '9:16 Mobile Android' },
    { value: '16:9', label: '16:9 Widescreen' },
    { value: '21:9', label: '21:9 Ultrawide' },
  ];

  const imageSizes = [
    { value: '1K', label: '1K Standard' },
    { value: '2K', label: '2K High Definition' },
    { value: '4K', label: '4K Ultra High Definition' },
  ];

  const presets = [
    {
      title: '200A Split-Phase Service Panel',
      prompt: 'Photorealistic 3D Unity URP mobile render of a residential 200A split-phase electrical service panel interior with copper busbars, labeled circuit breakers, neat Romex wire routing, and digital multimeter probes testing 240V',
    },
    {
      title: '3-Way & 4-Way Traveler Schematic',
      prompt: 'High-definition technical electrical engineering blueprint schematic of 3-way and 4-way hallway switches with red and black traveler wires, brass screws, neutral bundle, and luminaire load',
    },
    {
      title: 'Mobile First-Person Hand & Multimeter',
      prompt: 'First-person perspective of 3D gloved electrician hands in Unity URP mobile, holding red and black multimeter probes contacting a 240V NEMA 14-50 range receptacle in a modern kitchen',
    },
    {
      title: 'Verlet Wire Spline & Terminal Fastening',
      prompt: 'Close-up technical render of a flexible copper wire spline bending smoothly into a brass terminal screw with an insulated torque screwdriver tightening to 14 in-lbs in a blue electrical junction box',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-blueprint-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during image generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `voltsim-blueprint-${aspectRatio.replace(':', 'x')}-${imageSize}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Visual Diagram & Blueprint Generator</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Electrical Blueprint & 3D Unity URP Render Studio
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Generate photorealistic 3D Unity mobile scene mockups, electrical schematics, and mechanical wiring blueprints using Gemini image models with complete aspect ratio and resolution controls.
          </p>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls | Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Model Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Gemini Image Generation Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModel('gemini-3.1-flash-image-preview')}
                className={`p-3 rounded-xl border text-left transition ${
                  model === 'gemini-3.1-flash-image-preview'
                    ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">gemini-3.1-flash-image-preview</div>
                <div className="text-[11px] text-slate-400 mt-0.5">General cases & fast blueprint generation</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('gemini-3-pro-image-preview')}
                className={`p-3 rounded-xl border text-left transition ${
                  model === 'gemini-3-pro-image-preview'
                    ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">gemini-3-pro-image-preview</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Studio-quality photorealistic 3D renders</div>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Affordance Selector (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9) */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Aspect Ratio ({aspectRatios.length} Formats Supported)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  className={`py-2 px-1.5 rounded-lg text-xs font-semibold transition text-center ${
                    aspectRatio === ar.value
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Size Affordance Selector (1K, 2K, 4K) */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Image Resolution Output
            </label>
            <div className="grid grid-cols-3 gap-2">
              {imageSizes.map((sz) => (
                <button
                  key={sz.value}
                  type="button"
                  onClick={() => setImageSize(sz.value as any)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition text-center ${
                    imageSize === sz.value
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Prompts */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Technical Apprenticeship Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p.prompt)}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-left text-xs text-slate-300 hover:text-white transition"
                >
                  <div className="font-semibold text-amber-400">{p.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{p.prompt}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Blueprint Generation Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the electrical schematic, Unity scene view, or panel component..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
            />
          </div>

          {/* Error Message if Any */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-600/80 text-rose-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Generating {imageSize} Blueprint with {model}...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate High-Quality Blueprint ({aspectRatio}, {imageSize})</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Viewport (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <FileImage className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Render Viewport</span>
            </div>

            {generatedImageUrl && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Full View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadImage}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Canvas or Image Display */}
          <div className="flex-1 min-h-[380px] bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center p-4 overflow-hidden relative group">
            {isGenerating ? (
              <div className="text-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
                <div className="text-sm font-bold text-white">Synthesizing Technical Blueprint</div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Rendering {aspectRatio} image at {imageSize} resolution using {model}...
                </p>
              </div>
            ) : generatedImageUrl ? (
              <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setPreviewModalOpen(true)}>
                <img
                  src={generatedImageUrl}
                  alt="Generated Electrical Blueprint"
                  className="max-h-[460px] w-auto object-contain rounded-lg shadow-2xl transition group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg font-bold border border-slate-700 flex items-center space-x-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Click to Zoom</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 text-slate-500 p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  No Render Generated Yet
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select an apprenticeship scenario preset or type a prompt and press "Generate High-Quality Blueprint" to render photorealistic 3D Unity assets.
                </p>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Target: {aspectRatio} • {imageSize}</span>
            <span>Engine: {model}</span>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {previewModalOpen && generatedImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="text-xs font-bold text-white font-mono">
                Blueprint Render Preview ({aspectRatio}, {imageSize})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={downloadImage}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[80vh] overflow-auto bg-slate-950">
              <img
                src={generatedImageUrl}
                alt="Full View Electrical Blueprint"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
