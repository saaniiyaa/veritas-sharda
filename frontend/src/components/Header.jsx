import React from 'react';
import { Shield, Activity, RefreshCw, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Header({ health, isPingingHealth, checkHealth }) {
  const isHealthy = health?.status === 'ready' || health?.status === 'ok';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Shield className="w-6 h-6 text-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Dhwani Kavach</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium tracking-wider bg-slate-800/90 text-cyan-400 border border-cyan-500/30">
                    ध्वनि कवच
                  </span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono tracking-wide mt-0.5">
                AI Voice Cloning &amp; Deepfake Defense
              </p>
            </div>
          </div>

          {/* Live Backend Health Indicator */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                isHealthy
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-red-950/30 border-red-500/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
              }`}
              title="FastAPI Backend Health Status"
            >
              <span className="relative flex h-2 w-2">
                {isHealthy ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </>
                )}
              </span>

              <div className="flex flex-col">
                <span className="font-semibold tracking-wider">
                  {isHealthy ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isHealthy
                    ? `${health?.milestone || 'v0.25'} • :8000/api/health`
                    : 'Target: localhost:8000'}
                </span>
              </div>

              <button
                onClick={checkHealth}
                disabled={isPingingHealth}
                title="Ping backend health again"
                className="ml-1 p-1 hover:bg-slate-800/80 rounded transition text-slate-400 hover:text-cyan-400 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isPingingHealth ? 'animate-spin text-cyan-400' : ''}`}
                />
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
