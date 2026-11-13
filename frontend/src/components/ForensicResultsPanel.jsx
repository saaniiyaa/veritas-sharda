import React, { useState } from 'react';
import {
  Activity,
  Clock,
  Radio,
  Maximize2,
  Cpu,
  Download,
  Eye,
  FileAudio,
  ShieldCheck,
  X,
  Volume2,
  AudioWaveform
} from 'lucide-react';

export default function ForensicResultsPanel({
  result,
  audioUrl,
  audioFileName,
  isLoading,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If no result and not loading, show empty state
  if (!result && !isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 sm:p-12 text-center shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-500">
          <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2 font-mono">
          Awaiting Acoustic Ingestion
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Upload an audio file (.wav/.mp3) or record a 5-second microphone sample. The forensic engine will decompose the waveform into its Mel-frequency spectrogram and calculate temporal &amp; cepstral metrics.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl mx-auto text-left">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-500 font-mono block">STAGE 1</span>
            <span className="text-xs font-semibold text-slate-300">Mel-Spectrogram</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-500 font-mono block">STAGE 1</span>
            <span className="text-xs font-semibold text-slate-300">13 MFCC Features</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-500 font-mono block">STAGE 1</span>
            <span className="text-xs font-semibold text-slate-300">Dynamic Amplitude</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-500 font-mono block">STAGE 1</span>
            <span className="text-xs font-semibold text-slate-300">Sampling Nyquist</span>
          </div>
        </div>
      </div>
    );
  }

  // Format base64 spectrogram image
  const spectrogramSrc = result?.spectrogram_base64
    ? result.spectrogram_base64.startsWith('data:')
      ? result.spectrogram_base64
      : `data:image/png;base64,${result.spectrogram_base64}`
    : null;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative cyber grid accent */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
                Forensic Acoustic Telemetry
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PROCESSED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate max-w-sm sm:max-w-md">
              Target Source: <span className="text-slate-200">{result?.filename || audioFileName || 'Acoustic Stream'}</span>
            </p>
          </div>
        </div>

        {spectrogramSrc && (
          <a
            href={spectrogramSrc}
            download={`mel_spectrogram_${result?.filename || 'sample'}.png`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-mono border border-slate-700 transition self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </a>
        )}
      </div>

      {/* HTML5 Audio Player Card */}
      {audioUrl && (
        <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Acoustic Playback Stream</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {result?.duration ? `${result.duration}s duration` : ''}
            </span>
          </div>
          <audio
            controls
            src={audioUrl}
            className="w-full h-10 accent-cyan-400 rounded-lg outline-none"
          />
        </div>
      )}

      {/* 4 Clean Forensic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Card 1: Duration */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              Duration
            </span>
            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-cyan-950/60 text-slate-400 group-hover:text-cyan-400 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {result?.duration !== undefined ? `${result.duration}` : '—'}
            <span className="text-xs text-slate-400 ml-1 font-sans font-normal">sec</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Signal length (Librosa)
          </p>
        </div>

        {/* Card 2: Sample Rate */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              Sample Rate
            </span>
            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-emerald-950/60 text-slate-400 group-hover:text-emerald-400 transition">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {result?.sample_rate !== undefined
              ? result.sample_rate.toLocaleString()
              : '—'}
            <span className="text-xs text-slate-400 ml-1 font-sans font-normal">Hz</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Temporal sampling fidelity
          </p>
        </div>

        {/* Card 3: Peak Amplitude */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              Peak Amplitude
            </span>
            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-cyan-950/60 text-slate-400 group-hover:text-cyan-400 transition">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {result?.peak_amplitude !== undefined ? `${result.peak_amplitude}` : '—'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Max normalized dynamic range
          </p>
        </div>

        {/* Card 4: MFCC Mean */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              MFCC Mean
            </span>
            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-emerald-950/60 text-slate-400 group-hover:text-emerald-400 transition">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {result?.mfcc_mean !== undefined ? `${result.mfcc_mean}` : '—'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Cepstral timbre spectral mean
          </p>
        </div>
      </div>

      {/* Mel-Spectrogram Viewer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              MEL-SPECTROGRAM DECOMPOSITION
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              [Colormap: Magma • Power-to-dB Ref(max)]
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Enlarge</span>
          </button>
        </div>

        <div className="p-2 sm:p-4 flex items-center justify-center bg-black/40 min-h-[220px]">
          {spectrogramSrc ? (
            <img
              src={spectrogramSrc}
              alt={`Mel-Spectrogram for ${result?.filename || 'analyzed audio'}`}
              className="w-full max-h-[380px] object-contain rounded-lg border border-slate-800/80 cursor-pointer hover:border-cyan-500/40 transition"
              onClick={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="text-xs font-mono text-slate-500">
              Spectrogram render unavailable
            </div>
          )}
        </div>
      </div>

      {/* Modal for Full-Resolution Spectrogram */}
      {isModalOpen && spectrogramSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="font-mono text-sm text-cyan-400 font-semibold flex items-center gap-2">
                <span>Mel-Spectrogram High-Resolution Inspection</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({result?.filename})
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/60 rounded-xl p-2 flex items-center justify-center border border-slate-800 max-h-[75vh] overflow-auto">
              <img
                src={spectrogramSrc}
                alt="Full resolution spectrogram"
                className="w-full h-auto object-contain rounded"
              />
            </div>

            <div className="flex justify-between items-center mt-4 text-xs font-mono text-slate-400">
              <span>librosa.feature.melspectrogram • cmap=magma</span>
              <a
                href={spectrogramSrc}
                download={`mel_spectrogram_${result?.filename || 'sample'}.png`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition"
              >
                <Download className="w-4 h-4" />
                <span>Save Full-Res Image</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
