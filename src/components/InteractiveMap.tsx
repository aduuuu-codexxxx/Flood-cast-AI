import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RiverGauge, CitizenSOS, DispatcherUnit, ReliefShelter } from '../types/floodcast';
import { Layers, MapPin, Radio, ShieldAlert, LifeBuoy } from 'lucide-react';

interface InteractiveMapProps {
  gauges: RiverGauge[];
  sosList: CitizenSOS[];
  dispatchers: DispatcherUnit[];
  shelters: ReliefShelter[];
  selectedLocation: { lat: number; lng: number } | null;
  onDispatch: (sosId: string, dispatcherId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  gauges,
  sosList,
  dispatchers,
  shelters,
  selectedLocation,
  onDispatch,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer toggles
  const [showGauges, setShowGauges] = useState<boolean>(true);
  const [showSOS, setShowSOS] = useState<boolean>(true);
  const [showDispatchers, setShowDispatchers] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);

  // Markers groups
  const layersRef = useRef<{
    gaugesGroup: L.LayerGroup;
    sosGroup: L.LayerGroup;
    dispGroup: L.LayerGroup;
    sheltersGroup: L.LayerGroup;
  }>({
    gaugesGroup: L.layerGroup(),
    sosGroup: L.layerGroup(),
    dispGroup: L.layerGroup(),
    sheltersGroup: L.layerGroup(),
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Brahmaputra Valley, Assam
    const map = L.map(mapContainerRef.current, {
      center: [26.40, 93.00],
      zoom: 8,
      zoomControl: true,
    });

    // Dark high-contrast cartography
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add layer groups to map
    layersRef.current.gaugesGroup.addTo(map);
    layersRef.current.sosGroup.addTo(map);
    layersRef.current.dispGroup.addTo(map);
    layersRef.current.sheltersGroup.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when selectedLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 12, {
        animate: true,
      });
    }
  }, [selectedLocation]);

  // Render Markers
  useEffect(() => {
    const { gaugesGroup, sosGroup, dispGroup, sheltersGroup } = layersRef.current;

    // 1. Gauges
    gaugesGroup.clearLayers();
    if (showGauges) {
      gauges.forEach((gauge) => {
        const isOverDanger = gauge.currentLevel >= gauge.dangerLevel;
        const color = isOverDanger ? '#ef4444' : gauge.currentLevel >= gauge.warningLevel ? '#f59e0b' : '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-gauge-icon',
          html: `
            <div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([gauge.lat, gauge.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 2px;">
            <strong style="font-size: 13px; color: #0f172a;">${gauge.name} Gauge</strong><br/>
            <span style="color: #64748b;">River: ${gauge.river} (${gauge.district})</span><hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
            <div>Current Level: <strong style="color: ${color}; font-size: 13px;">${gauge.currentLevel}m</strong></div>
            <div>Danger Level: <strong>${gauge.dangerLevel}m</strong> (${isOverDanger ? `<span style="color: red; font-weight: bold;">+${(gauge.currentLevel - gauge.dangerLevel).toFixed(2)}m OVER</span>` : 'Normal'})</div>
            <div>Discharge: <strong>${gauge.dischargeCusecs.toLocaleString()} cusecs</strong> (${gauge.trend})</div>
          </div>
        `);
        gaugesGroup.addLayer(marker);
      });
    }

    // 2. Citizen SOS Live Locations
    sosGroup.clearLayers();
    if (showSOS) {
      sosList.forEach((sos) => {
        const isCritical = sos.urgency === 'CRITICAL';
        const color = sos.status === 'rescued' ? '#10b981' : isCritical ? '#dc2626' : '#f97316';

        const sosIcon = L.divIcon({
          className: 'custom-sos-icon',
          html: `
            <div style="position: relative; width: 26px; height: 26px;">
              <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background-color: ${color}; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};">
                <span style="color: white; font-weight: 900; font-size: 10px;">!</span>
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([sos.lat, sos.lng], { icon: sosIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; min-width: 190px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #dc2626; font-size: 13px;">${sos.id} - ${sos.name}</strong>
            </div>
            <span style="color: #64748b;">${sos.district} &bull; ${sos.landmark}</span><br/>
            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
            <div>Water Depth: <strong>${sos.waterLevel}</strong></div>
            <div>Trapped Persons: <strong>${sos.trappedCount}</strong></div>
            <div>Status: <strong style="text-transform: uppercase;">${sos.status}</strong></div>
            ${sos.dispatcherName ? `<div style="margin-top: 4px; padding: 4px; background: #e0f2fe; border-radius: 4px; color: #0369a1;">Assigned: <strong>${sos.dispatcherName}</strong> (ETA: ${sos.etaMinutes || 12}m)</div>` : ''}
            <div style="margin-top: 6px; font-size: 11px; color: #475569;">${sos.description}</div>
          </div>
        `);
        sosGroup.addLayer(marker);

        // Accuracy circle
        if (sos.accuracy && sos.status !== 'rescued') {
          const circle = L.circle([sos.lat, sos.lng], {
            radius: Math.min(500, Math.max(sos.accuracy * 10, 50)),
            color: color,
            fillColor: color,
            fillOpacity: 0.15,
            weight: 1,
          });
          sosGroup.addLayer(circle);
        }
      });
    }

    // 3. Dispatchers
    dispGroup.clearLayers();
    if (showDispatchers) {
      dispatchers.forEach((disp) => {
        const dispIcon = L.divIcon({
          className: 'custom-disp-icon',
          html: `
            <div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #2563eb;">
              <span style="color: white; font-size: 12px;">🚤</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([disp.lat, disp.lng], { icon: dispIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
            <strong style="color: #1d4ed8; font-size: 13px;">${disp.name}</strong><br/>
            <span>Agency: ${disp.agency} (${disp.type})</span><hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
            <div>Base: <strong>${disp.baseLocation}</strong></div>
            <div>Capacity: <strong>${disp.capacity} evacuees</strong></div>
            <div>Status: <strong style="color: ${disp.status === 'available' ? '#16a34a' : '#2563eb'};">${disp.status.toUpperCase()}</strong></div>
            <div>Contact: <strong>${disp.contact}</strong></div>
          </div>
        `);
        dispGroup.addLayer(marker);
      });
    }

    // 4. Relief Shelters
    sheltersGroup.clearLayers();
    if (showShelters) {
      shelters.forEach((shelter) => {
        const shelterIcon = L.divIcon({
          className: 'custom-shelter-icon',
          html: `
            <div style="background-color: #059669; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px #059669;">
              <span style="color: white; font-size: 11px;">⛺</span>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
            <strong style="color: #047857; font-size: 13px;">${shelter.name}</strong><br/>
            <span>District: ${shelter.district}</span><hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
            <div>Occupancy: <strong>${shelter.currentOccupancy} / ${shelter.capacity}</strong></div>
            <div>Medical Support: <strong>${shelter.hasMedicalPost ? 'Yes (Doctor on site)' : 'First aid kit only'}</strong></div>
            <div>Officer: <strong>${shelter.contactOfficer}</strong></div>
          </div>
        `);
        sheltersGroup.addLayer(marker);
      });
    }
  }, [gauges, sosList, dispatchers, shelters, showGauges, showSOS, showDispatchers, showShelters]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
      {/* Map toolbar */}
      <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Assam River Basin GIS Map (Brahmaputra & Barak)
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showSOS}
              onChange={(e) => setShowSOS(e.target.checked)}
              className="rounded text-red-600 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center space-x-1 text-red-400 font-bold">
              <span>SOS Beacons ({sosList.filter((s) => s.status !== 'rescued').length})</span>
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showGauges}
              onChange={(e) => setShowGauges(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center space-x-1 text-amber-300">
              <span>CWC Gauges ({gauges.length})</span>
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showDispatchers}
              onChange={(e) => setShowDispatchers(e.target.checked)}
              className="rounded text-blue-500 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center space-x-1 text-blue-300">
              <span>Rescue Dispatchers ({dispatchers.length})</span>
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center space-x-1 text-emerald-300">
              <span>Shelters ({shelters.length})</span>
            </span>
          </label>

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([26.40, 93.00], 8);
              }
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-[580px] bg-slate-950 relative z-0" />

      {/* Map Legend */}
      <div className="bg-slate-950/95 p-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-wrap gap-y-1">
          <span className="flex items-center space-x-1 text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block animate-ping mr-1"></span>
            Critical Citizen SOS (Rooftop / Chest)
          </span>
          <span className="flex items-center space-x-1 text-blue-400">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block mr-1"></span>
            Rescue Boat / Heli Dispatcher
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block mr-1"></span>
            CWC River Gauge Station
          </span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block mr-1"></span>
            Relief Camp Shelter
          </span>
        </div>

        <span className="text-slate-500">
          Source: Assam State Disaster Management Authority (ASDMA) & Central Water Commission (CWC)
        </span>
      </div>
    </div>
  );
};
