import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Mic,
  Square,
  FileAudio,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Volume2,
  Trash2,
  Radio,
  Sparkles
} from 'lucide-react';
import { convertBlobToWavFile, generateTestWavFile } from '../utils/audio';

export default function UploadRecordCard({
  onAnalyze,
  isLoading,
  selectedFile,
  setSelectedFile,
  backendOnline,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5.0);
  const [micError, setMicError] = useState(null);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up recording timer and stream on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setMicError(null);
    const validExtensions = ['.wav', '.mp3', '.webm', '.ogg'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt && !file.type.startsWith('audio/')) {
      setMicError('Please select a valid .wav or .mp3 audio file.');
      return;
    }

    setSelectedFile(file);
  };

  // Start 5-second Microphone Recording
  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 22050,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Determine supported mimeType
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const supportedType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';

      const options = supportedType ? { mimeType: supportedType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, {
          type: supportedType || 'audio/webm',
        });

        // Convert to PCM WAV for librosa compatibility
        const wavFile = await convertBlobToWavFile(rawBlob, `mic_sample_${Date.now()}.wav`);
        setSelectedFile(wavFile);

        // Clean up tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Automatically trigger analysis
        onAnalyze(wavFile);
      };

      // Start recording
      mediaRecorder.start(100);
      setIsRecording(true);
      setCountdown(5.0);

      const startTime = Date.now();
      const totalDuration = 5000; // 5 seconds

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (totalDuration - elapsed) / 1000);
        setCountdown(remaining);

        if (elapsed >= totalDuration) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setIsRecording(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 50);
    } catch (err) {
      console.error('Mic access error:', err);
      setIsRecording(false);
      setMicError(
        err.message || 'Microphone permission was denied or device not found.'
      );
    }
  };

  // Cancel recording early if user clicks cancel
  const cancelRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setCountdown(5.0);
  };

  // Quick Demo Audio for 1-click test
  const handleLoadDemoAudio = () => {
    const demo = generateTestWavFile();
    validateAndSetFile(demo);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative cyber grid accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
              Acoustic Ingestion &amp; Capture
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Accepts .wav, .mp3 or captures direct microphone stream
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadDemoAudio}
          type="button"
          disabled={isLoading || isRecording}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition disabled:opacity-40"
          title="Load a synthesized harmonic audio sample for rapid testing"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Demo Tone</span>
        </button>
      </div>

      {/* Mic Access Error Alert */}
      {micError && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-mono">{micError}</div>
        </div>
      )}

      {/* Live Recording Overlay State */}
      {isRecording ? (
        <div className="p-6 rounded-xl border border-cyan-500/50 bg-slate-950/90 text-center cyber-glow mb-5">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="w-20 h-20 rounded-full border-4 border-cyan-400/40 animate-ping absolute inset-0" />
              <div className="w-20 h-20 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 relative shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <Mic className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
                Capturing Acoustic Stream
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-wider">
                {countdown.toFixed(1)}s
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Speak into your mic — auto-submits at 0.0s
              </p>
            </div>

            {/* Countdown progress bar */}
            <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-75"
                style={{ width: `${((5.0 - countdown) / 5.0) * 100}%` }}
              />
            </div>

            <button
              onClick={cancelRecording}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
            >
              <Square className="w-3.5 h-3.5 text-red-400" />
              <span>Cancel Recording</span>
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop File Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 mb-5 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'border-slate-700/80 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,audio/wav,audio/mpeg,audio/mp3,audio/webm"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              <FileAudio className="w-6 h-6 text-cyan-400" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200">
                <span className="text-cyan-400 underline font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Supported: <span className="text-slate-300 font-semibold">.WAV</span> or{' '}
                <span className="text-slate-300 font-semibold">.MP3</span> (Mono or Stereo)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Preview Box */}
      {selectedFile && !isRecording && (
        <div className="mb-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 shrink-0">
              <FileAudio className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-slate-200 truncate font-mono">
                {selectedFile.name}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'audio/wav'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dual Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Record 5s Mic Sample Button */}
        <button
          type="button"
          onClick={startRecording}
          disabled={isLoading || isRecording}
          className="relative group flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 bg-slate-800 hover:bg-slate-700/90 text-white border border-slate-700 hover:border-cyan-500/50 shadow-md disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:animate-ping" />
          <Mic className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold tracking-wide">Record 5s Mic Sample</span>
        </button>

        {/* Analyze Audio Button */}
        <button
          type="button"
          onClick={() => selectedFile && onAnalyze(selectedFile)}
          disabled={isLoading || !selectedFile || isRecording}
          className="flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analyzing Acoustic Features...</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-slate-950" />
              <span>Decompose &amp; Analyze</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-3.5 text-center sm:text-left">
        <p className="text-[11px] font-mono text-slate-500">
          Target: <span className="text-slate-400">POST http://localhost:8000/api/analyze-audio</span> [Key: <span className="text-cyan-400">file</span>]
        </p>
      </div>
    </div>
  );
}
