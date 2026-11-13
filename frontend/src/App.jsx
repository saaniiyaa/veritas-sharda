import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import UploadRecordCard from './components/UploadRecordCard';
import ForensicResultsPanel from './components/ForensicResultsPanel';
import {
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Info
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function App() {
  const [health, setHealth] = useState(null);
  const [isPingingHealth, setIsPingingHealth] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Audio object URL reference to release memory
  const currentAudioUrlRef = useRef(null);

  // Health check pinger
  const checkHealth = useCallback(async () => {
    setIsPingingHealth(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${BACKEND_URL}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setHealth(data);
        setBackendError(null);
      } else {
        setHealth({ status: 'error', code: res.status });
      }
    } catch (err) {
      setHealth({ status: 'offline' });
    } finally {
      setIsPingingHealth(false);
    }
  }, []);

  // Poll health on mount and every 6 seconds
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 6000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle Audio Analysis Dispatch
  const handleAnalyze = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setAnalysisError(null);

    // Update local audio player URL
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
    }
    const newUrl = URL.createObjectURL(file);
    currentAudioUrlRef.current = newUrl;
    setAudioUrl(newUrl);

    try {
      const formData = new FormData();
      // Exact field name matching backend/main.py (file: UploadFile = File(...))
      formData.append('file', file, file.name || 'sample.wav');

      const response = await fetch(`${BACKEND_URL}/api/analyze-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = `Backend HTTP error ${response.status} (${response.statusText})`;
        try {
          const errJson = await response.json();
          if (errJson.detail) errorDetail = errJson.detail;
        } catch (_) {}
        throw new Error(errorDetail);
      }

      const data = await response.json();
      setAnalysisResult(data);
      setAnalysisError(null);
      // Also update health if we succeeded
      setHealth((prev) => (prev?.status === 'ready' ? prev : { status: 'ready', milestone: 'v0.25' }));
    } catch (err) {
      console.error('Audio analysis error:', err);
      let errorMsg = err.message || 'An unexpected error occurred during audio processing.';
      if (
        err.name === 'TypeError' ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError')
      ) {
        errorMsg =
          'Cannot connect to FastAPI backend at http://localhost:8000. Please verify that the backend server is running.';
      }
      setAnalysisError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isBackendHealthy = health?.status === 'ready' || health?.status === 'ok';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header with live health */}
      <Header
        health={health}
        isPingingHealth={isPingingHealth}
        checkHealth={checkHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Backend Offline Warning Banner */}
        {!isBackendHealthy && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-amber-900/40 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-amber-300">
                    FastAPI Microservice Not Detected on Port 8000
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    The backend endpoint <code className="bg-slate-900/80 px-1.5 py-0.5 rounded text-cyan-300 font-mono">http://localhost:8000/api/health</code> is currently unreachable.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  onClick={checkHealth}
                  disabled={isPingingHealth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPingingHealth ? 'animate-spin' : ''}`} />
                  <span>Re-test Link</span>
                </button>
              </div>
            </div>

            {/* Quick Command Guide */}
            <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Start backend:</span>
                <code className="bg-slate-900 px-2 py-1 rounded text-cyan-300 border border-slate-800 select-all">
                  uvicorn backend.main:app --reload --port 8000
                </code>
              </div>
              <span className="text-slate-400 text-[11px]">
                Requires: librosa, soundfile, fastapi, uvicorn
              </span>
            </div>
          </div>
        )}

        {/* Audio Analysis Error Banner */}
        {analysisError && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-950/25 p-4 sm:p-5 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-red-900/50 border border-red-500/50 text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base text-red-300">
                  Acoustic Feature Extraction Failed
                </h3>
                <p className="text-xs text-red-300/90 mt-1 font-mono break-all leading-relaxed">
                  {analysisError}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                  <span>Target: POST http://localhost:8000/api/analyze-audio</span>
                  <span>•</span>
                  <span>Form Key: "file"</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Primary Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Upload/Record (5 Cols on LG) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <UploadRecordCard
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              backendOnline={isBackendHealthy}
            />
          </div>

          {/* Right Column: Forensic Results Panel (7 Cols on LG) */}
          <div className="lg:col-span-7">
            <ForensicResultsPanel
              result={analysisResult}
              audioUrl={audioUrl}
              audioFileName={selectedFile?.name}
              isLoading={isLoading}
            />
          </div>

        </div>

      </main>

      {/* Cyber Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400/80"></span>
            <span>Dhwani Kavach Acoustic Threat Shield</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">Round 1 (v0.25 Milestone)</span>
          </div>
          <div>
            Built with React, Vite &amp; Tailwind CSS v4 • Powered by FastAPI &amp; Librosa
          </div>
        </div>
      </footer>
    </div>
  );
}
