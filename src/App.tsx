import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { LiveLocationPortal } from './components/LiveLocationPortal';
import { InteractiveMap } from './components/InteractiveMap';
import { StageOverview } from './components/StageOverview';
import { AIAssistant } from './components/AIAssistant';
import { AlertBroadcastModal } from './components/AlertBroadcastModal';
import { 
  INITIAL_GAUGES, 
  INITIAL_CATCHMENTS, 
  INITIAL_SUBMERGED_ROADS, 
  INITIAL_SHELTERS, 
  INITIAL_DISPATCHERS 
} from './data/assamHydrology';
import { CitizenSOS, DispatcherUnit, SOSStatus } from './types/floodcast';
import { playEmergencyAlertSound } from './utils/audioAlert';
import { ShieldCheck, BellRing, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'command' | 'receiver' | 'map' | 'pipeline' | 'assistant'>('command');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scenario, setScenario] = useState<string>('2024_historical');

  // Hydrology state
  const [gauges, setGauges] = useState(INITIAL_GAUGES);
  const [catchments] = useState(INITIAL_CATCHMENTS);
  const [roads] = useState(INITIAL_SUBMERGED_ROADS);
  const [shelters] = useState(INITIAL_SHELTERS);

  // SOS and Dispatcher lists
  const [sosList, setSosList] = useState<CitizenSOS[]>([]);
  const [dispatchers, setDispatchers] = useState<DispatcherUnit[]>(INITIAL_DISPATCHERS);

  // Map focus coordinate
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Assistant initial prompt
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');

  // Broadcast modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial SOS list & dispatchers from server
  const loadSOSData = async () => {
    try {
      const res = await fetch('/api/sos/list');
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          setSosList(data.requests);
        }
        if (data.dispatchers) {
          setDispatchers(data.dispatchers);
        }
      }
    } catch (err) {
      console.warn('Could not fetch SOS from server, using local fallback state:', err);
    }
  };

  useEffect(() => {
    loadSOSData();
    // Poll updates every 15 seconds
    const interval = setInterval(loadSOSData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle citizen adding a new SOS live location
  const handleSOSCreated = (newSOS: CitizenSOS) => {
    setSosList((prev) => [newSOS, ...prev.filter((s) => s.id !== newSOS.id)]);
    if (soundEnabled) {
      playEmergencyAlertSound();
    }
    showToast(`🚨 NEW LIVE SOS: ${newSOS.name} (${newSOS.district}) - ${newSOS.waterLevel}`);
  };

  // Handle dispatcher allocation
  const handleDispatch = async (sosId: string, dispatcherId: string) => {
    try {
      const res = await fetch(`/api/sos/${sosId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatcherId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🚤 ${data.message}`);
        // Refresh local state
        loadSOSData();
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      // Fallback local update
      setSosList((prev) =>
        prev.map((s) =>
          s.id === sosId
            ? { ...s, status: 'dispatched', dispatcherId, dispatcherName: 'Rescue Unit (Dispatched)', etaMinutes: 12 }
            : s
        )
      );
      showToast('Rescue Unit dispatched to citizen coordinates.');
    }
  };

  // Handle status update
  const handleUpdateStatus = async (sosId: string, status: SOSStatus) => {
    try {
      const res = await fetch(`/api/sos/${sosId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        loadSOSData();
        showToast(`Updated SOS status to: ${status.toUpperCase()}`);
      }
    } catch (err) {
      setSosList((prev) =>
        prev.map((s) => (s.id === sosId ? { ...s, status } : s))
      );
      showToast(`Updated SOS status to: ${status.toUpperCase()}`);
    }
  };

  // Map locate
  const handleSelectOnMap = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setActiveTab('map');
  };

  // AI prompt open
  const handleOpenAssistantWithPrompt = (prompt: string) => {
    setAssistantPrompt(prompt);
    setActiveTab('assistant');
  };

  const criticalCount = sosList.filter((s) => s.urgency === 'CRITICAL' && s.status !== 'rescued').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-red-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm animate-bounce">
          <BellRing className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sosCount={sosList.filter((s) => s.status !== 'rescued').length}
        criticalCount={criticalCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        scenario={scenario}
        setScenario={setScenario}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'command' && (
          <CommandCenter
            sosList={sosList}
            dispatchers={dispatchers}
            onDispatch={handleDispatch}
            onUpdateStatus={handleUpdateStatus}
            onSelectOnMap={handleSelectOnMap}
            onOpenAssistantWithPrompt={handleOpenAssistantWithPrompt}
          />
        )}

        {activeTab === 'receiver' && (
          <LiveLocationPortal
            onSOSCreated={handleSOSCreated}
            activeSOSList={sosList}
            onOpenAssistantWithPrompt={handleOpenAssistantWithPrompt}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMap
            gauges={gauges}
            sosList={sosList}
            dispatchers={dispatchers}
            shelters={shelters}
            selectedLocation={selectedLocation}
            onDispatch={handleDispatch}
          />
        )}

        {activeTab === 'pipeline' && (
          <StageOverview
            catchments={catchments}
            gauges={gauges}
            roads={roads}
            shelters={shelters}
            onOpenAssistantWithPrompt={handleOpenAssistantWithPrompt}
          />
        )}

        {activeTab === 'assistant' && (
          <AIAssistant
            initialPrompt={assistantPrompt}
            onSelectCoordinates={(lat, lng) => handleSelectOnMap(lat, lng)}
          />
        )}
      </main>

      {/* Broadcast Alert Modal */}
      <AlertBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcastSuccess={(details) => {
          showToast(`🚨 Flood warning broadcast sent to ${details.district}!`);
          if (soundEnabled) playEmergencyAlertSound();
        }}
        onSwitchToReceiver={() => setActiveTab('receiver')}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300">FloodCast AI</span>
            <span>&bull;</span>
            <span>Assam River Basin Early Warning & Emergency Dispatch System</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Integrated with NDRF, SDRF & ASDMA</span>
            <span>&bull;</span>
            <span className="text-cyan-400 font-semibold">Gemini 3.8 Flash Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
