import React, { useState } from 'react';
import { 
  Layers, 
  CloudRain, 
  Waves, 
  LifeBuoy, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Building2, 
  Truck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { CatchmentRegion, RiverGauge, SubmergedRoad, ReliefShelter } from '../types/floodcast';

interface StageOverviewProps {
  catchments: CatchmentRegion[];
  gauges: RiverGauge[];
  roads: SubmergedRoad[];
  shelters: ReliefShelter[];
  onOpenAssistantWithPrompt: (prompt: string) => void;
}

export const StageOverview: React.FC<StageOverviewProps> = ({
  catchments,
  gauges,
  roads,
  shelters,
  onOpenAssistantWithPrompt,
}) => {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);

  return (
    <div className="space-y-6">
      {/* 3-Stage Pipeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1 */}
        <button
          onClick={() => setActiveStage(1)}
          className={`text-left p-5 rounded-2xl border transition-all ${
            activeStage === 1
              ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/50'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              STAGE 1
            </span>
            <CloudRain className={`w-5 h-5 ${activeStage === 1 ? 'text-cyan-400' : 'text-slate-500'}`} />
          </div>
          <h4 className="font-bold text-white text-base mt-2">Hill Catchment Runoff</h4>
          <p className="text-xs text-slate-400 mt-1">
            Precipitation telemetry in Arunachal, Bhutan & Meghalaya hills before water enters the valley
          </p>
        </button>

        {/* Stage 2 */}
        <button
          onClick={() => setActiveStage(2)}
          className={`text-left p-5 rounded-2xl border transition-all ${
            activeStage === 2
              ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-950/30 ring-1 ring-blue-500/50'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
              STAGE 2
            </span>
            <Waves className={`w-5 h-5 ${activeStage === 2 ? 'text-blue-400' : 'text-slate-500'}`} />
          </div>
          <h4 className="font-bold text-white text-base mt-2">Plains Inundation & DEM</h4>
          <p className="text-xs text-slate-400 mt-1">
            River gauge surge, hydrodynamic flood-fill, and road & village submersion modeling
          </p>
        </button>

        {/* Stage 3 */}
        <button
          onClick={() => setActiveStage(3)}
          className={`text-left p-5 rounded-2xl border transition-all ${
            activeStage === 3
              ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              STAGE 3
            </span>
            <LifeBuoy className={`w-5 h-5 ${activeStage === 3 ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <h4 className="font-bold text-white text-base mt-2">Relief & Dispatch Allocation</h4>
          <p className="text-xs text-slate-400 mt-1">
            Automated boat dispatch, camp resource rationing, and critical healthcare routing
          </p>
        </button>
      </div>

      {/* Stage 1 Content: Hill Catchment Triggers */}
      {activeStage === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CloudRain className="w-5 h-5 text-cyan-400" />
                <span>Stage 1: Upstream Catchment Trigger Telemetry</span>
              </h3>
              <p className="text-xs text-slate-400">
                Measures antecedent precipitation index (API) and radar convective cloud bursts
              </p>
            </div>

            <button
              onClick={() => onOpenAssistantWithPrompt('Explain how rainfall in Meghalaya and Arunachal triggers floods in Assam plains')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold"
            >
              Analyze with FloodCast AI &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catchments.map((cat) => {
              const isOver = cat.rainfall24h >= cat.thresholdMm;
              const pct = Math.min(100, Math.round((cat.rainfall24h / cat.thresholdMm) * 100));

              return (
                <div
                  key={cat.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                        {cat.state}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{cat.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        cat.runoffRisk === 'Extreme'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {cat.runoffRisk} Risk
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>24h Recorded Rainfall:</span>
                      <strong className={isOver ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {cat.rainfall24h} mm
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Trigger Threshold:</span>
                      <span>{cat.thresholdMm} mm</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1.5">
                      <div
                        className={`h-full ${
                          isOver ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2 rounded border border-slate-800">
                    &ldquo;{cat.radarEchoStatus}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage 2 Content: Gauges & Submerged Highways */}
      {activeStage === 2 && (
        <div className="space-y-6">
          {/* Gauges Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Waves className="w-5 h-5 text-blue-400" />
                  <span>Central Water Commission (CWC) Key River Gauges</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Hydrographic telemetry comparing gauge water elevation against Warning and Danger levels
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Station Name</th>
                    <th className="py-2.5 px-3">River & District</th>
                    <th className="py-2.5 px-3">Current Level</th>
                    <th className="py-2.5 px-3">Danger Level</th>
                    <th className="py-2.5 px-3">Surge Status</th>
                    <th className="py-2.5 px-3">Trend</th>
                    <th className="py-2.5 px-3">Discharge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gauges.map((g) => {
                    const diff = g.currentLevel - g.dangerLevel;
                    const isOver = diff >= 0;

                    return (
                      <tr key={g.id} className="hover:bg-slate-950/40">
                        <td className="py-3 px-3 font-bold text-white">{g.name}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {g.river} ({g.district})
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-extrabold text-sm ${
                              isOver ? 'text-red-400' : 'text-slate-200'
                            }`}
                          >
                            {g.currentLevel}m
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{g.dangerLevel}m</td>
                        <td className="py-3 px-3">
                          {isOver ? (
                            <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-black text-[10px]">
                              +{diff.toFixed(2)}m OVER DANGER
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                              {(g.dangerLevel - g.currentLevel).toFixed(2)}m below
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 capitalize text-slate-300 font-semibold">{g.trend}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {g.dischargeCusecs.toLocaleString()} cusecs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submerged Highways and Transportation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <span>Submerged Roads & National Highway Corridors</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roads.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{r.roadName}</h4>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.trafficStatus === 'CLOSED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {r.trafficStatus}
                    </span>
                  </div>

                  <p className="text-slate-400">{r.stretch}</p>

                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded">
                    <span className="text-slate-400">Tarmac Water Depth:</span>
                    <strong className="text-red-400 font-bold">{r.waterDepthMeters}m</strong>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    <strong className="text-slate-500">Detour Route:</strong> {r.detourRoute}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage 3 Content: Relief Matrix */}
      {activeStage === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Stage 3: Designated Evacuation Centers & Relief Camps</span>
              </h3>
              <p className="text-xs text-slate-400">
                Shelter logistics, drinking water purification, medical post status and capacity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelters.map((s) => {
              const occPct = Math.round((s.currentOccupancy / s.capacity) * 100);

              return (
                <div
                  key={s.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                        {s.district} District
                      </span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{s.name}</h4>
                    </div>

                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {occPct}% Capacity
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Occupancy:</span>
                      <strong>
                        {s.currentOccupancy} / {s.capacity} persons
                      </strong>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${occPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] pt-1">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <span>💧 Purified Water:</span>
                      <strong className="text-emerald-400 font-bold">Available</strong>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-300">
                      <span>🩺 Medical Post:</span>
                      <strong className={s.hasMedicalPost ? 'text-emerald-400' : 'text-slate-500'}>
                        {s.hasMedicalPost ? 'Active' : 'Basic'}
                      </strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                    <strong>Nodal Officer:</strong> {s.contactOfficer}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
