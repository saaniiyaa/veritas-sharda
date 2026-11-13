import React from 'react';
import { CheckCircle2, ArrowRight, Shield, Layers, Radio, Sparkles } from 'lucide-react';

export default function RoadmapCard() {
  const stages = [
    {
      id: 1,
      title: 'Stage 1: Acoustic Ingestion & Spectrogram Extraction',
      badge: 'COMPLETE',
      status: 'complete',
      milestone: 'v0.25 (Current)',
      desc: 'Robust audio intake (.wav, .mp3, mic streams), temporal feature parsing, dynamic peak normalization, 128-band Mel-Spectrogram generation with power-to-dB conversion, and MFCC mean extraction.',
      deliverables: [
        'FastAPI audio processing microservice',
        'Librosa Mel-Spectrogram & MFCC feature extractor',
        'Browser MediaRecorder 5s countdown capture',
        'Interactive forensic telemetry dashboard'
      ]
    },
    {
      id: 2,
      title: 'Stage 2: Deepfake Classifier Model',
      badge: 'NEXT — ROUND 2',
      status: 'next',
      milestone: 'v0.50 Target',
      desc: 'Dual-stream deep neural classifier (Conformer / ResNet acoustic encoder) trained on synthetic vocoder artifacts, TTS phase discontinuities, and voice-cloning biometric anomalies.',
      deliverables: [
        'Synthetic voice probability score (0-100%)',
        'Vocoder artifact heatmap (WaveNet, HiFi-GAN signatures)',
        'Biometric timbre divergence indicators',
        'Confidence interval & risk tier assessment'
      ]
    },
    {
      id: 3,
      title: 'Stage 3: Real-Time Call Shield',
      badge: 'PLANNED',
      status: 'planned',
      milestone: 'v1.00 Vision',
      desc: 'Ultra-low latency in-line acoustic firewall for WebRTC, VoIP, and cellular streams. Continuous rolling-window inference (<300ms) with automated fraud alerting and voice spoofing mitigation.',
      deliverables: [
        'WebRTC real-time stream interceptor',
        'Sub-300ms rolling chunk inference engine',
        'In-call visual spoof alert & fraud warnings',
        'Autonomous acoustic firewall policy engine'
      ]
    }
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background cyber accent */}
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
              Project Architecture Roadmap
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              From Acoustic Decomposition to Autonomous Real-Time Voice Shielding
            </p>
          </div>
        </div>

        {/* 25% Progress Metric Badge */}
        <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto font-mono text-xs">
          <span className="text-slate-400">Progression:</span>
          <span className="text-cyan-400 font-bold">25%</span>
          <span className="text-slate-500 font-normal">→ 100%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="text-emerald-400 font-semibold">Stage 1: 25% Ingestion</span>
          <span className="text-cyan-400">Stage 2: 50% Classifier</span>
          <span className="text-slate-500">Stage 3: 100% Shield</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-500"
            style={{ width: '25%' }}
          />
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isComplete = stage.status === 'complete';
          const isNext = stage.status === 'next';
          const isPlanned = stage.status === 'planned';

          return (
            <div
              key={stage.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isComplete
                  ? 'bg-emerald-950/15 border-emerald-500/30'
                  : isNext
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                  : 'bg-slate-950/40 border-slate-800/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
                <div className="flex items-center space-x-2.5">
                  {isComplete ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isNext ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <h3 className="font-semibold text-sm sm:text-base text-white tracking-wide">
                    {stage.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isNext
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    [{stage.badge}]
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    {stage.milestone}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                {stage.desc}
              </p>

              {/* Deliverables tags */}
              <div className="flex flex-wrap gap-1.5">
                {stage.deliverables.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400"
                  >
                    • {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
