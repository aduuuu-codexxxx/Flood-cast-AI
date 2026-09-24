import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  LifeBuoy, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Users, 
  Waves,
  Send,
  Sparkles,
  ExternalLink,
  Search
} from 'lucide-react';
import { CitizenSOS, DispatcherUnit, SOSStatus } from '../types/floodcast';

interface CommandCenterProps {
  sosList: CitizenSOS[];
  dispatchers: DispatcherUnit[];
  onDispatch: (sosId: string, dispatcherId: string) => void;
  onUpdateStatus: (sosId: string, status: SOSStatus) => void;
  onSelectOnMap: (lat: number, lng: number) => void;
  onOpenAssistantWithPrompt: (prompt: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  sosList,
  dispatchers,
  onDispatch,
  onUpdateStatus,
  onSelectOnMap,
  onOpenAssistantWithPrompt,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Statistics
  const totalTrapped = sosList
    .filter((s) => s.status !== 'rescued')
    .reduce((acc, curr) => acc + curr.trappedCount, 0);
  const criticalCount = sosList.filter((s) => s.urgency === 'CRITICAL' && s.status !== 'rescued').length;
  const dispatchedCount = sosList.filter((s) => s.status === 'dispatched' || s.status === 'en-route').length;
  const availableBoats = dispatchers.filter((d) => d.status === 'available').length;

  // Filtered SOS list
  const filteredSOS = sosList.filter((s) => {
    if (filterUrgency !== 'all' && s.urgency !== filterUrgency) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.landmark.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top emergency metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Critical Rescues
            </span>
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{criticalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Rooftops / Chest-high water</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Citizens Cut Off
            </span>
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{totalTrapped}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting boat extraction</p>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Active Dispatches
            </span>
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <LifeBuoy className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{dispatchedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">NDRF / SDRF craft en route</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Available Units
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{availableBoats}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for instant assignment</p>
        </div>
      </div>

      {/* Control filters bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, district, landmark, or SOS ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Urgency:</span>
          </div>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Urgencies</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Urgency</option>
            <option value="MODERATE">Moderate</option>
          </select>

          <span className="text-slate-600">|</span>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="rescued">Rescued / Safe</option>
          </select>
        </div>
      </div>

      {/* SOS Live Feed List */}
      <div className="space-y-4">
        {filteredSOS.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No active SOS requests matching filters</h4>
            <p className="text-xs text-slate-500">
              When citizens share their live location in the Alert Portal, it will appear here in real-time.
            </p>
          </div>
        ) : (
          filteredSOS.map((sos) => {
            const isCritical = sos.urgency === 'CRITICAL';
            const isDispatched = sos.status === 'dispatched' || sos.status === 'en-route';
            const isRescued = sos.status === 'rescued';

            return (
              <div
                key={sos.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-xl space-y-4 ${
                  isCritical && !isRescued
                    ? 'border-red-600/70 shadow-red-950/20'
                    : isDispatched
                    ? 'border-blue-500/50 shadow-blue-950/20'
                    : isRescued
                    ? 'border-slate-800 opacity-70'
                    : 'border-slate-800'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {sos.id}
                      </span>

                      <span
                        className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                            : sos.urgency === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {sos.urgency} URGENCY
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isRescued
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isDispatched
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {sos.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <span>{sos.name}</span>
                      <span className="text-slate-400 text-sm font-normal">
                        ({sos.district})
                      </span>
                    </h3>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectOnMap(sos.lat, sos.lng)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
                      title="Center on GIS Map"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Locate on Map</span>
                    </button>

                    <button
                      onClick={() => onOpenAssistantWithPrompt(`Provide evacuation plan for ${sos.name} at ${sos.landmark} in ${sos.district} with water depth ${sos.waterLevel}`)}
                      className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span>AI Plan</span>
                    </button>
                  </div>
                </div>

                {/* Key metadata grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Water Depth</span>
                    <span className="font-bold text-blue-300 flex items-center space-x-1 mt-0.5">
                      <Waves className="w-3.5 h-3.5 text-blue-400" />
                      <span>{sos.waterLevel}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Trapped Persons</span>
                    <span className="font-bold text-white flex items-center space-x-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sos.trappedCount} individuals</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Live GPS Coordinates</span>
                    <span className="font-mono text-cyan-300 font-semibold mt-0.5 block truncate">
                      {sos.lat.toFixed(4)}°N, {sos.lng.toFixed(4)}°E (±{sos.accuracy}m)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                    <a
                      href={`tel:${sos.phone}`}
                      className="font-bold text-amber-300 hover:underline flex items-center space-x-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{sos.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Description & special flags */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 font-semibold mr-1">Logistics Needs:</span>
                    {sos.needsBoat && (
                      <span className="px-2 py-0.5 bg-blue-900/60 border border-blue-700/60 text-blue-200 rounded font-medium">
                        🚤 Motorboat Required
                      </span>
                    )}
                    {sos.needsMedical && (
                      <span className="px-2 py-0.5 bg-red-900/60 border border-red-700/60 text-red-200 rounded font-medium">
                        🚑 Medical / First Aid Urgent
                      </span>
                    )}
                    {sos.hasInfantElderly && (
                      <span className="px-2 py-0.5 bg-amber-900/60 border border-amber-700/60 text-amber-200 rounded font-medium">
                        👶 Infant / Elderly Present
                      </span>
                    )}
                    {sos.needsFoodWater && (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
                        🍞 Food & Drinking Water Depleted
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    <strong className="text-slate-400">Landmark & Notes:</strong> {sos.landmark} &bull; {sos.description}
                  </p>
                </div>

                {/* Dispatcher Coordination Section */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
                      <LifeBuoy className="w-4 h-4 text-cyan-400" />
                      <span>Rescue Dispatcher Assignment:</span>
                    </span>

                    {/* Status change dropdown */}
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500">Update Status:</span>
                      <select
                        value={sos.status}
                        onChange={(e) => onUpdateStatus(sos.id, e.target.value as SOSStatus)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="en-route">En Route</option>
                        <option value="rescued">Rescued / Safe</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* If already assigned */}
                  {sos.dispatcherName ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-950/40 border border-blue-500/30 p-3 rounded-lg text-xs">
                      <div>
                        <p className="font-bold text-white text-sm">{sos.dispatcherName}</p>
                        <p className="text-slate-400">
                          En route &bull; Estimated arrival: <strong className="text-cyan-300">{sos.etaMinutes || 12} mins</strong>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateStatus(sos.id, 'rescued')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Evacuated & Safe</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Show recommended dispatchers based on Haversine distance */
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400">
                        Smart Recommendation: Closest available rescue units based on live GPS distance:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {dispatchers
                          .filter((d) => d.status === 'available')
                          .slice(0, 3)
                          .map((unit) => {
                            // Rough distance calculation in UI
                            const dLat = (unit.lat - sos.lat) * 111;
                            const dLng = (unit.lng - sos.lng) * 98;
                            const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
                            const eta = Math.round((distKm / 25) * 60 + 8);

                            return (
                              <div
                                key={unit.id}
                                className="bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 p-2.5 rounded-lg flex flex-col justify-between text-xs space-y-2 transition-all"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white truncate">{unit.name}</span>
                                    <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded">
                                      {distKm} km
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">{unit.type} &bull; Cap: {unit.capacity}</p>
                                  <p className="text-[11px] text-slate-500">Base: {unit.baseLocation}</p>
                                </div>

                                <button
                                  onClick={() => onDispatch(sos.id, unit.id)}
                                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Dispatch Unit (~{eta}m)</span>
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
