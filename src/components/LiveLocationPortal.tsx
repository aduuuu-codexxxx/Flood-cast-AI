import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  LifeBuoy, 
  Phone, 
  Users, 
  Waves,
  Crosshair,
  Sparkles,
  Compass
} from 'lucide-react';
import { CitizenSOS, WaterDepthCategory } from '../types/floodcast';

interface LiveLocationPortalProps {
  onSOSCreated: (sos: CitizenSOS) => void;
  activeSOSList: CitizenSOS[];
  onOpenAssistantWithPrompt?: (prompt: string) => void;
}

export const LiveLocationPortal: React.FC<LiveLocationPortalProps> = ({
  onSOSCreated,
  activeSOSList,
  onOpenAssistantWithPrompt,
}) => {
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Majuli');
  const [landmark, setLandmark] = useState('');
  const [waterLevel, setWaterLevel] = useState<WaterDepthCategory>('Chest (1.4m)');
  const [trappedCount, setTrappedCount] = useState<number>(3);
  const [needsBoat, setNeedsBoat] = useState<boolean>(true);
  const [needsMedical, setNeedsMedical] = useState<boolean>(false);
  const [needsFoodWater, setNeedsFoodWater] = useState<boolean>(true);
  const [hasInfantElderly, setHasInfantElderly] = useState<boolean>(true);
  const [description, setDescription] = useState('');

  // Geolocation states
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSOSId, setSubmittedSOSId] = useState<string | null>(null);

  // Check if we have an active SOS submitted by this user in session
  const currentActiveSOS = activeSOSList.find((s) => s.id === submittedSOSId) || null;

  // Obtain GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGeoError(`Unable to retrieve GPS: ${err.message}. You can select one of the high-risk Assam test locations below.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // Continuous live watch GPS
  const toggleLiveWatch = () => {
    if (!navigator.geolocation) return;

    if (isWatching) {
      setIsWatching(false);
    } else {
      setIsWatching(true);
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAccuracy(Math.round(pos.coords.accuracy));
        },
        (err) => {
          console.warn('Watch position error:', err);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  };

  // Preset location helper for instant simulation / testing
  const setPresetLocation = (presetLat: number, presetLng: number, presetDistrict: string, presetLandmark: string) => {
    setLat(presetLat);
    setLng(presetLng);
    setAccuracy(5.0);
    setDistrict(presetDistrict);
    setLandmark(presetLandmark);
    setGeoError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lat || !lng) {
      setGeoError('Please acquire your live GPS location or click one of the location presets before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name || 'Citizen in Distress',
        phone: phone || '+91-XXXXXXXXXX',
        district,
        landmark: landmark || 'Geo-located via GPS',
        lat,
        lng,
        accuracy: accuracy || 10,
        waterLevel,
        trappedCount,
        needsBoat,
        needsMedical,
        needsFoodWater,
        hasInfantElderly,
        description: description || 'Immediate rescue and boat assistance required.',
      };

      const res = await fetch('/api/sos/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.sos) {
        setSubmittedSOSId(data.sos.id);
        onSOSCreated(data.sos);
      } else {
        alert(data.error || 'Failed to submit SOS alert');
      }
    } catch (err) {
      console.error('Error submitting SOS:', err);
      // Fallback local create if network down
      const fallbackSOS: CitizenSOS = {
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name || 'Citizen in Distress',
        phone: phone || '+91-XXXXXXXXXX',
        district,
        landmark: landmark || 'Geo-located via GPS',
        lat,
        lng,
        accuracy: accuracy || 8,
        waterLevel,
        trappedCount,
        needsBoat,
        needsMedical,
        needsFoodWater,
        hasInfantElderly,
        description: description || 'Immediate rescue requested.',
        urgency: waterLevel.includes('Rooftop') || needsMedical ? 'CRITICAL' : 'HIGH',
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      setSubmittedSOSId(fallbackSOS.id);
      onSOSCreated(fallbackSOS);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Alert Banner that citizens receive */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 border-2 border-red-600 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <ShieldAlert className="w-40 h-40 text-red-400" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/40 animate-pulse">
              <LifeBuoy className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-xs font-black tracking-widest uppercase bg-red-950 px-2 py-0.5 rounded border border-red-700">
                  CRITICAL EMERGENCY ALERT
                </span>
                <span className="text-slate-400 text-xs">FloodCast AI Broadcast</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Brahmaputra Basin Flood Warning: Share Your Live Location
              </h2>
            </div>
          </div>

          <div className="bg-red-900/60 border border-red-700/60 rounded-xl px-4 py-2 text-right shrink-0">
            <p className="text-[11px] text-red-200 uppercase font-semibold">Toll-Free Control Room</p>
            <p className="text-lg font-black text-amber-300 tracking-wide">1079 / 112</p>
          </div>
        </div>

        <p className="text-slate-200 text-sm mt-3 leading-relaxed">
          Flood waters are rising rapidly. If your family is cut off, surrounded by water, or stranded on a rooftop or embankment,
          <strong> share your live GPS location</strong> below. Our Emergency Operations Command will triangulate your beacon, calculate the water depth, and deploy the nearest <strong>NDRF / SDRF rescue boat or helicopter</strong>.
        </p>
      </div>

      {/* If already submitted, display Live Rescue Dispatch Status */}
      {currentActiveSOS && (
        <div className="bg-slate-900/90 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    SOS BEACON ACTIVE #{currentActiveSOS.id}
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                    {new Date(currentActiveSOS.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Live Dispatch Tracking: {currentActiveSOS.name} ({currentActiveSOS.district})
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                currentActiveSOS.status === 'rescued'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : currentActiveSOS.status === 'dispatched'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                Status: {currentActiveSOS.status}
              </span>
            </div>
          </div>

          {/* Stepper progress */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-emerald-500/30">
              <p className="text-emerald-400 font-bold">1. Beacon Received</p>
              <p className="text-slate-400 text-[11px] mt-0.5">GPS verified (±{currentActiveSOS.accuracy}m)</p>
            </div>
            <div className={`p-3 bg-slate-950/70 rounded-xl border ${
              currentActiveSOS.status !== 'pending' ? 'border-blue-500/50 text-blue-300' : 'border-slate-800 text-slate-500'
            }`}>
              <p className="font-bold">2. Unit Assigned</p>
              <p className="text-[11px] mt-0.5 truncate">
                {currentActiveSOS.dispatcherName || 'Command matching nearest team'}
              </p>
            </div>
            <div className={`p-3 bg-slate-950/70 rounded-xl border ${
              currentActiveSOS.status === 'dispatched' || currentActiveSOS.status === 'en-route'
                ? 'border-cyan-500/50 text-cyan-300'
                : currentActiveSOS.status === 'rescued'
                ? 'border-emerald-500/50 text-emerald-300'
                : 'border-slate-800 text-slate-500'
            }`}>
              <p className="font-bold">3. Rescue En Route</p>
              <p className="text-[11px] mt-0.5">
                {currentActiveSOS.etaMinutes ? `ETA: ~${currentActiveSOS.etaMinutes} mins` : 'Pending departure'}
              </p>
            </div>
            <div className={`p-3 bg-slate-950/70 rounded-xl border ${
              currentActiveSOS.status === 'rescued' ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-800 text-slate-500'
            }`}>
              <p className="font-bold">4. Evacuated Safe</p>
              <p className="text-[11px] mt-0.5">Relief shelter transfer</p>
            </div>
          </div>

          {/* Rescue Unit Box */}
          {currentActiveSOS.dispatcherName ? (
            <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/50 shrink-0">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-blue-300 font-semibold">Assigned Dispatcher Unit</p>
                  <p className="text-base font-bold text-white">{currentActiveSOS.dispatcherName}</p>
                  <p className="text-xs text-slate-400">Equipped with motorized rescue craft & medical first-aid kit</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Estimated Arrival</p>
                  <p className="text-xl font-extrabold text-cyan-300">
                    {currentActiveSOS.etaMinutes || 12} mins
                  </p>
                </div>
                <button
                  onClick={() => onOpenAssistantWithPrompt?.(`What is the rescue procedure for ${currentActiveSOS.name} stranded in ${currentActiveSOS.district}?`)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-blue-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-center space-x-3 text-amber-200 text-xs">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <span>
                Dispatch queue active: The Command Center is currently assigning the optimal motorboat unit stationed near {currentActiveSOS.district}. Keep this page open.
              </span>
            </div>
          )}

          {/* Safety instructions for stranded citizens */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Immediate Life-Safety Instructions:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li>Remain on the highest point (rooftop, upper floor, or stable reinforced masonry).</li>
              <li>Tie a bright red, yellow, or white cloth to a bamboo pole or antenna for aerial boat & helicopter sighting.</li>
              <li>Conserve phone battery: reduce brightness, turn off unnecessary background apps, but keep GPS active.</li>
              <li>Do NOT drink unfiltered floodwaters. Use boiled water or chlorine/halogen purification tablets.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main SOS Submission Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>Live Location & SOS Registration</span>
            </h3>
            <p className="text-xs text-slate-400">
              Directly feeds into FloodCast AI Command Operations dispatcher terminal
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">Emergency Priority:</span>
            <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-xs font-bold">
              PRIORITY LEVEL 1
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Live GPS Acquisition */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>1. Live GPS Location Stream (Required)</span>
                </label>
                <p className="text-xs text-slate-400">
                  Allow browser geolocation to pinpoint your exact coordinates for the boat rescue team.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
                >
                  <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'Acquiring GPS...' : 'Acquire My GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleLiveWatch}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                    isWatching
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Continuously broadcast your coordinates as you move"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isWatching ? 'Streaming Active' : 'Live Stream'}</span>
                </button>
              </div>
            </div>

            {/* GPS result display */}
            {lat !== null && lng !== null ? (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">
                    GPS Locked: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
                  </span>
                  {accuracy && (
                    <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded text-[11px]">
                      Accuracy: &plusmn;{accuracy} meters
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[11px]">Ready for dispatcher routing</span>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-dashed border-slate-700 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
                <span>No GPS fix yet. Click "Acquire My GPS" or use one of the test presets below.</span>
              </div>
            )}

            {geoError && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-xs text-red-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Simulated / Test GPS quick buttons */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Test Location Presets (Assam Flood Hotspots):
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPresetLocation(26.9532, 94.2185, 'Majuli', 'Kamalabari Ghat Embankment')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  📍 Majuli (Kamalabari)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetLocation(27.5921, 94.7214, 'Dhemaji', 'Silapathar LP School')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  📍 Dhemaji (Silapathar)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetLocation(26.3451, 91.0023, 'Barpeta', 'Sarthebari Chawk')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  📍 Barpeta (Beki River)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetLocation(24.8333, 92.8012, 'Cachar', 'Silchar Annapurna Ghat')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  📍 Cachar (Silchar)
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: Water Depth & Trapped Persons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Waves className="w-3.5 h-3.5 text-blue-400" />
                <span>Current Water Depth Around You</span>
              </label>
              <select
                value={waterLevel}
                onChange={(e) => setWaterLevel(e.target.value as WaterDepthCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option value="Ankle (0.2m)">Ankle Level (~0.2m / 8 inches)</option>
                <option value="Knee (0.5m)">Knee Level (~0.5m / 1.6 feet)</option>
                <option value="Waist (1.0m)">Waist Level (~1.0m / 3.3 feet)</option>
                <option value="Chest (1.4m)">Chest Level (~1.4m / 4.6 feet)</option>
                <option value="Rooftop / Submerged (>2.0m)">Rooftop / Submerged (&gt;2.0m / 6.5+ feet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Number of Trapped People</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={trappedCount}
                onChange={(e) => setTrappedCount(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Emergency Special Needs Checkboxes */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Emergency Logistics Checklist:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={needsBoat}
                  onChange={(e) => setNeedsBoat(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span className="text-slate-200 font-medium">Inflatable Boat Required (Road submerged)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={needsMedical}
                  onChange={(e) => setNeedsMedical(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span className="text-slate-200 font-medium">Urgent Medical / Oxygen / Injury Care</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={hasInfantElderly}
                  onChange={(e) => setHasInfantElderly(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span className="text-slate-200 font-medium">Includes Infants / Elderly / Pregnant</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={needsFoodWater}
                  onChange={(e) => setNeedsFoodWater(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span className="text-slate-200 font-medium">Food & Drinking Water Depleted</span>
              </label>
            </div>
          </div>

          {/* STEP 3: Citizen Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kalita"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mobile Phone Number</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91-94351-XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                District in Assam
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Majuli">Majuli (Island)</option>
                <option value="Dhemaji">Dhemaji</option>
                <option value="Lakhimpur">Lakhimpur</option>
                <option value="Barpeta">Barpeta</option>
                <option value="Morigaon">Morigaon</option>
                <option value="Kamrup Metro">Kamrup Metro (Guwahati)</option>
                <option value="Jorhat">Jorhat</option>
                <option value="Dhubri">Dhubri</option>
                <option value="Cachar">Cachar (Silchar)</option>
                <option value="Sonitpur">Sonitpur (Tezpur)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Visible Landmark or Roof Identification
            </label>
            <input
              type="text"
              placeholder="e.g. Blue tin roof next to Kali Mandir, waving a yellow cloth on bamboo pole"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Urgent Message / Special Instructions for Boat Commander
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Current is strong on the east side of village. Please approach via western temple canal."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-base rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-red-600/40 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'TRANSMITTING SOS BEACON...' : 'TRANSMIT SOS & LIVE LOCATION TO DISPATCHER'}</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              This triggers an immediate priority alert on the FloodCast AI Central Operations Dispatch Grid.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
