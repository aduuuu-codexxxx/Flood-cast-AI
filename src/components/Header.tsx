import React from 'react';
import { 
  Waves, 
  Radio, 
  MapPin, 
  Bot, 
  Layers, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Activity,
  PhoneCall,
  Flame,
  Download
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'command' | 'receiver' | 'map' | 'pipeline' | 'assistant';
  setActiveTab: (tab: 'command' | 'receiver' | 'map' | 'pipeline' | 'assistant') => void;
  sosCount: number;
  criticalCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  scenario: string;
  setScenario: (scen: string) => void;
  onOpenBroadcastModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sosCount,
  criticalCount,
  soundEnabled,
  setSoundEnabled,
  scenario,
  setScenario,
  onOpenBroadcastModal
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top emergency status bar */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 px-4 py-1.5 text-xs border-b border-red-900/40 flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="flex items-center text-red-400 font-bold uppercase tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5 mr-1" />
            LIVE TELEMETRY
          </span>
          <span className="hidden sm:inline-block text-slate-500">|</span>
          <span className="truncate">
            <strong className="text-amber-300">CWC Alert:</strong> Neamatighat +1.38m above DL &bull; Dhubri +1.18m above DL &bull; Kaziranga NH-715 submerged (0.65m)
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 bg-red-900/50 px-2 py-0.5 rounded border border-red-700/60 text-red-200 font-semibold">
            <Flame className="w-3 h-3 text-red-400" />
            <span>{criticalCount} Critical Rescues</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>IFEWRAS Core: Active</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('command')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                FloodCast AI
              </span>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-medium">
              Assam Flood Early Warning & Live Rescue Dispatch
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'command'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Operations</span> Center
            {sosCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
                {sosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('receiver')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'receiver'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4 mr-1.5 text-red-400" />
            Citizen <span className="hidden sm:inline">Live</span> SOS
            <span className="ml-1.5 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4 mr-1.5" />
            GIS Map
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'pipeline'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 mr-1.5" />
            Hydrology <span className="hidden sm:inline">Stages</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'assistant'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 mr-1.5 text-purple-400" />
            AI Assistant
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Download full project zip */}
          <button
            onClick={async () => {
              try {
                const res = await fetch('/floodcast-ai.zip');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'floodcast-ai.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              } catch (e) {
                window.location.href = '/api/download-zip';
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
            title="Download complete FloodCast AI project as .zip"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ZIP</span>
          </button>

          {/* Quick broadcast alert button */}
          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
            title="Broadcast emergency flood warning to citizens"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Broadcast</span> Alert
          </button>

          {/* Sound audio siren toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Emergency siren audio enabled' : 'Mute emergency siren audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Scenario selector */}
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="2024_historical">Scenario: 2024 Assam Inundation</option>
            <option value="subansiri_flash">Scenario: Subansiri Dam Surge</option>
            <option value="barak_valley">Scenario: Barak Valley Extreme Cloudburst</option>
          </select>
        </div>
      </div>
    </header>
  );
};
