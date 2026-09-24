import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK as per gemini-api guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Types
export interface CitizenSOS {
  id: string;
  name: string;
  phone: string;
  district: string;
  landmark: string;
  lat: number;
  lng: number;
  accuracy: number;
  waterLevel: 'Ankle (0.2m)' | 'Knee (0.5m)' | 'Waist (1.0m)' | 'Chest (1.4m)' | 'Rooftop / Submerged (>2.0m)';
  trappedCount: number;
  needsBoat: boolean;
  needsMedical: boolean;
  needsFoodWater: boolean;
  hasInfantElderly: boolean;
  description: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  status: 'pending' | 'dispatched' | 'en-route' | 'rescued' | 'cancelled';
  timestamp: string;
  dispatcherId?: string;
  dispatcherName?: string;
  etaMinutes?: number;
}

export interface DispatcherUnit {
  id: string;
  name: string;
  agency: 'NDRF' | 'SDRF' | 'Indian Army' | 'Air Force' | 'Civil Defense';
  type: 'Inflatable Motor Boat' | 'Gemini Craft' | 'Heavy BAUT Boat' | 'Mi-17 Rescue Chopper' | 'Ambulance & Medical Team';
  baseLocation: string;
  district: string;
  lat: number;
  lng: number;
  capacity: number;
  status: 'available' | 'dispatched' | 'maintenance';
  contact: string;
}

// In-memory persistent database for SOS and Dispatchers
let sosRequests: CitizenSOS[] = [
  {
    id: 'SOS-8491',
    name: 'Pranab Saikia',
    phone: '+91-94351-22901',
    district: 'Majuli',
    landmark: 'Near Kamalabari Ghat, Ward 4',
    lat: 26.9532,
    lng: 94.2185,
    accuracy: 6.2,
    waterLevel: 'Rooftop / Submerged (>2.0m)',
    trappedCount: 5,
    needsBoat: true,
    needsMedical: false,
    needsFoodWater: true,
    hasInfantElderly: true,
    description: 'Brahmaputra embankment breached. 5 family members on tin roof. Fast current. Please send rescue boat immediately.',
    urgency: 'CRITICAL',
    status: 'dispatched',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    dispatcherId: 'DISP-01',
    dispatcherName: 'NDRF 1st Bn - Boat Unit 04',
    etaMinutes: 12,
  },
  {
    id: 'SOS-8492',
    name: 'Bina Das',
    phone: '+91-98640-51423',
    district: 'Dhemaji',
    landmark: 'Silapathar Lower Primary School vicinity',
    lat: 27.5921,
    lng: 94.7214,
    accuracy: 9.4,
    waterLevel: 'Chest (1.4m)',
    trappedCount: 3,
    needsBoat: true,
    needsMedical: true,
    needsFoodWater: true,
    hasInfantElderly: true,
    description: 'Elderly mother suffering from chronic asthma, oxygen running low. Water inside house reaching chest level.',
    urgency: 'CRITICAL',
    status: 'pending',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'SOS-8493',
    name: 'Rahim Ali',
    phone: '+91-97061-89312',
    district: 'Barpeta',
    landmark: 'Sarthebari Chawk, Road Submerged',
    lat: 26.3451,
    lng: 91.0023,
    accuracy: 12.0,
    waterLevel: 'Waist (1.0m)',
    trappedCount: 8,
    needsBoat: true,
    needsMedical: false,
    needsFoodWater: true,
    hasInfantElderly: false,
    description: 'Beki river overflow flooded the village road. 8 villagers gathered on elevated temple porch.',
    urgency: 'HIGH',
    status: 'pending',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'SOS-8494',
    name: 'Deepak Bora',
    phone: '+91-94355-66710',
    district: 'Morigaon',
    landmark: 'Bhuragaon Riverside embankment',
    lat: 26.4215,
    lng: 92.3512,
    accuracy: 4.8,
    waterLevel: 'Knee (0.5m)',
    trappedCount: 2,
    needsBoat: false,
    needsMedical: false,
    needsFoodWater: false,
    hasInfantElderly: false,
    description: 'Monitoring rising Kopili waters, road partially blocked by silt and fallen trees.',
    urgency: 'MODERATE',
    status: 'rescued',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    dispatcherId: 'DISP-04',
    dispatcherName: 'SDRF Quick Reaction Unit 02',
    etaMinutes: 0,
  }
];

let dispatchers: DispatcherUnit[] = [
  {
    id: 'DISP-01',
    name: 'NDRF 1st Bn - Boat Unit 04',
    agency: 'NDRF',
    type: 'Inflatable Motor Boat',
    baseLocation: 'Jorhat / Nimati Staging Base',
    district: 'Jorhat',
    lat: 26.8521,
    lng: 94.2312,
    capacity: 12,
    status: 'dispatched',
    contact: '+91-94350-11221 (Cmdr. R. K. Baruah)',
  },
  {
    id: 'DISP-02',
    name: 'SDRF Quick Reaction Boat 01',
    agency: 'SDRF',
    type: 'Gemini Craft',
    baseLocation: 'Dhemaji District Headquarters',
    district: 'Dhemaji',
    lat: 27.4812,
    lng: 94.5823,
    capacity: 8,
    status: 'available',
    contact: '+91-98640-33442 (Insp. T. Gogoi)',
  },
  {
    id: 'DISP-03',
    name: 'Army Task Force - Heavy BAUT-02',
    agency: 'Indian Army',
    type: 'Heavy BAUT Boat',
    baseLocation: 'Tezpur Military Station',
    district: 'Sonitpur',
    lat: 26.6534,
    lng: 92.7932,
    capacity: 20,
    status: 'available',
    contact: '+91-94355-77883 (Capt. A. Sharma)',
  },
  {
    id: 'DISP-04',
    name: 'SDRF Quick Reaction Unit 02',
    agency: 'SDRF',
    type: 'Inflatable Motor Boat',
    baseLocation: 'Morigaon Staging Ground',
    district: 'Morigaon',
    lat: 26.2512,
    lng: 92.3421,
    capacity: 10,
    status: 'available',
    contact: '+91-97061-44556 (Sub-Insp. M. Kalita)',
  },
  {
    id: 'DISP-05',
    name: 'Barpeta Civil Defense Rescue Craft',
    agency: 'Civil Defense',
    type: 'Inflatable Motor Boat',
    baseLocation: 'Barpeta Town Emergency Depot',
    district: 'Barpeta',
    lat: 26.3214,
    lng: 90.9821,
    capacity: 10,
    status: 'available',
    contact: '+91-98540-99887 (Vol. Lead N. Ahmed)',
  },
  {
    id: 'DISP-06',
    name: 'IAF Mi-17 Rescue & Winch Helicopter',
    agency: 'Air Force',
    type: 'Mi-17 Rescue Chopper',
    baseLocation: 'Chabua AFS / Dibrugarh',
    district: 'Dibrugarh',
    lat: 27.4811,
    lng: 95.0211,
    capacity: 24,
    status: 'available',
    contact: '+91-94351-00112 (Wing Cdr. S. Hazarika)',
  },
];

// Helper: Haversine distance in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// REST API Endpoints

// 1. Submit citizen SOS live location
app.post('/api/sos/submit', (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      district,
      landmark,
      lat,
      lng,
      accuracy,
      waterLevel,
      trappedCount,
      needsBoat,
      needsMedical,
      needsFoodWater,
      hasInfantElderly,
      description,
    } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required for live rescue dispatch.' });
    }

    // Determine urgency
    let urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
    if (
      waterLevel === 'Rooftop / Submerged (>2.0m)' ||
      waterLevel === 'Chest (1.4m)' ||
      needsMedical ||
      hasInfantElderly
    ) {
      urgency = 'CRITICAL';
    } else if (waterLevel === 'Waist (1.0m)' || needsBoat || trappedCount > 4) {
      urgency = 'HIGH';
    }

    const newSOS: CitizenSOS = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || 'Anonymous Citizen',
      phone: phone || 'Unknown',
      district: district || 'Assam Flood Zone',
      landmark: landmark || 'Geo-located via Mobile GPS',
      lat: Number(lat),
      lng: Number(lng),
      accuracy: accuracy ? Number(accuracy) : 10,
      waterLevel: waterLevel || 'Waist (1.0m)',
      trappedCount: trappedCount ? parseInt(trappedCount, 10) : 1,
      needsBoat: Boolean(needsBoat),
      needsMedical: Boolean(needsMedical),
      needsFoodWater: Boolean(needsFoodWater),
      hasInfantElderly: Boolean(hasInfantElderly),
      description: description || 'Citizen requested immediate rescue support.',
      urgency,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    sosRequests.unshift(newSOS);
    return res.status(201).json({ success: true, sos: newSOS });
  } catch (err) {
    console.error('Error submitting SOS:', err);
    return res.status(500).json({ error: 'Failed to record SOS request' });
  }
});

// 2. Get all SOS requests with optional dispatcher recommendations
app.get('/api/sos/list', (req: Request, res: Response) => {
  // Enrich each SOS with nearest available dispatchers
  const enriched = sosRequests.map((sos) => {
    const recommendedDispatchers = dispatchers
      .filter((d) => d.status === 'available' || d.id === sos.dispatcherId)
      .map((d) => {
        const distanceKm = calculateHaversineDistance(sos.lat, sos.lng, d.lat, d.lng);
        // Estimate ETA assuming average watercraft / road speed of 25 km/h + 8 min prep time
        const eta = Math.round((distanceKm / 25) * 60 + 8);
        return {
          ...d,
          distanceKm,
          estimatedEtaMinutes: eta,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      ...sos,
      recommendedDispatchers,
    };
  });

  return res.json({
    success: true,
    count: enriched.length,
    requests: enriched,
    dispatchers,
  });
});

// 3. Dispatch a unit to an SOS request
app.post('/api/sos/:id/dispatch', (req: Request, res: Response) => {
  const { id } = req.params;
  const { dispatcherId } = req.body;

  const targetSOS = sosRequests.find((s) => s.id === id);
  if (!targetSOS) {
    return res.status(404).json({ error: 'SOS request not found' });
  }

  const targetDisp = dispatchers.find((d) => d.id === dispatcherId);
  if (!targetDisp) {
    return res.status(404).json({ error: 'Dispatcher unit not found' });
  }

  const dist = calculateHaversineDistance(targetSOS.lat, targetSOS.lng, targetDisp.lat, targetDisp.lng);
  const etaMinutes = Math.max(5, Math.round((dist / 25) * 60 + 8));

  // Update SOS
  targetSOS.status = 'dispatched';
  targetSOS.dispatcherId = targetDisp.id;
  targetSOS.dispatcherName = targetDisp.name;
  targetSOS.etaMinutes = etaMinutes;

  // Update Dispatcher
  targetDisp.status = 'dispatched';

  return res.json({
    success: true,
    message: `Dispatched ${targetDisp.name} to ${targetSOS.name} (${targetSOS.district}). ETA: ${etaMinutes} mins.`,
    sos: targetSOS,
    dispatcher: targetDisp,
  });
});

// 4. Update SOS status (e.g. 'rescued', 'en-route', 'pending')
app.patch('/api/sos/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const targetSOS = sosRequests.find((s) => s.id === id);
  if (!targetSOS) {
    return res.status(404).json({ error: 'SOS request not found' });
  }

  targetSOS.status = status;

  if (status === 'rescued' && targetSOS.dispatcherId) {
    const disp = dispatchers.find((d) => d.id === targetSOS.dispatcherId);
    if (disp) {
      disp.status = 'available';
    }
  }

  return res.json({ success: true, sos: targetSOS });
});

// 5. Intelligent FloodCast AI Assistant endpoint
app.post('/api/assistant', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], language = 'en', activeContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build real-time state summary to inject into Gemini prompt
    const pendingCritical = sosRequests.filter((s) => s.urgency === 'CRITICAL' && s.status !== 'rescued');
    const totalActiveSOS = sosRequests.filter((s) => s.status !== 'rescued').length;
    const availableDispatchers = dispatchers.filter((d) => d.status === 'available');

    const contextSummary = `
REAL-TIME ASSAM FLOOD SITUATION REPORT (FLOODCAST AI ENGINE):
- Active Citizen SOS Requests: ${totalActiveSOS}
- Critical Pending Rescues: ${pendingCritical.length} (${pendingCritical.map((c) => `${c.name} in ${c.district} at ${c.landmark}, Water: ${c.waterLevel}, Trapped: ${c.trappedCount}`).join('; ')})
- Ready Dispatcher Units: ${availableDispatchers.length} (${availableDispatchers.map((d) => `${d.name} [${d.type}] at ${d.baseLocation}`).join(', ')})
- Key River Gauges:
  * Brahmaputra at Neamatighat: 86.42m (DANGER: 85.04m, +1.38m OVER DANGER LEVEL, Rising)
  * Brahmaputra at Guwahati (DC Court): 50.15m (DANGER: 49.68m, +0.47m, Rising)
  * Brahmaputra at Dhubri: 29.80m (DANGER: 28.62m, +1.18m, Rapid Surge)
  * Barak at Silchar (Annapurna Ghat): 20.35m (DANGER: 19.83m, +0.52m, Steady)
  * Subansiri at Badatighat: 83.10m (DANGER: 82.53m, +0.57m, Severe discharge from Arunachal hills)
- Submerged Highways & Corridors:
  * NH-715 (Kaziranga Southern Bypass): 0.65m water on tarmac, animal corridors operational with 40 km/h speed restrictions.
  * NH-15 (North Lakhimpur to Dhemaji): Cut off at Sisiborgaon, bridge approach eroded.
- Current Pipeline Stage: Stage 2 (Plains Inundation & Live Citizen Rescue Dispatch).
`.trim();

    const systemInstruction = `
You are FloodCast AI (formerly CloudCast AI), the intelligent, authoritative disaster hydrology and emergency rescue assistant for Assam, India.
You assist both field commanders (NDRF, SDRF, District Disaster Management Authorities - DDMAs, Army) and distressed citizens in flood-affected regions.

Key Directives:
1. Always identify as "FloodCast AI".
2. You have real-time access to the Assam Basin hydrology telemetry, CWC river gauge thresholds, hill catchment rainfall triggers (Arunachal, Bhutan, Meghalaya), and the live citizen SOS tracking queue.
3. When answering questions regarding live distress, trapped citizens, or resource dispatch, cite exact data from the current situation report (districts like Majuli, Dhemaji, Barpeta, Morigaon, Cachar, Dhubri, Guwahati).
4. Provide structured, life-saving, actionable advice:
   - For citizens: safe elevation guidelines, preventing electrocution, keeping drinking water safe with halogen/chlorine tablets, signaling rescue helicopters with bright cloth or mirrors.
   - For commanders: optimal dispatch allocation, boat types (BAUT vs Gemini craft vs inflatable motorized boats), road submersion detours.
5. If the user asks in Assamese, Bengali, or Hindi, reply natively in that language (or provide bilingual support).
6. Be empathetic, sharp, precise, and reassuring. Avoid generic filler.

Current Live Telemetry & Dispatch Status:
${contextSummary}
`;

    // If Gemini client is initialized, call it with gemini-3.8-flash
    if (ai) {
      try {
        const contents: any[] = [];
        // Add conversation history if present
        if (Array.isArray(conversationHistory)) {
          for (const turn of conversationHistory.slice(-6)) {
            contents.push({
              role: turn.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: turn.content }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const reply = response.text || 'FloodCast AI system received your query but generated an empty response. Please ask again.';
        return res.json({ success: true, reply, source: 'gemini-3.8-flash' });
      } catch (geminiError: any) {
        console.error('Gemini API call failed, falling back to local domain intelligence:', geminiError?.message);
        // Fallback to rich rule-based domain reasoning below
      }
    }

    // High-quality local fallback in case Gemini key is missing or network failure
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('sos') || lower.includes('trapped') || lower.includes('rescue') || lower.includes('dispatcher')) {
      reply = `**FloodCast AI Rescue Dispatch Status:**\n\nThere are currently **${totalActiveSOS} active SOS beacons** registered across the Assam river basin:\n- **Critical Rooftop Rescue in Majuli:** Pranab Saikia (+91-94351-22901) — 5 persons trapped on rooftop near Kamalabari Ghat. *Unit NDRF Boat 04 has been dispatched (ETA: 12 min).* \n- **Medical Emergency in Dhemaji:** Bina Das (+91-98640-51423) — 3 persons, chest-high water, asthma patient requiring urgent medical kit.\n- **Barpeta Cut-off:** Rahim Ali (+91-97061-89312) — 8 villagers sheltered on Sarthebari temple porch.\n\n**Available Ready Units:**\n- **SDRF Quick Reaction Boat 01** at Dhemaji HQ (Capacity: 8, Ready)\n- **Army Task Force Heavy BAUT-02** at Tezpur (Capacity: 20, Ready)\n- **IAF Mi-17 Rescue Chopper** on standby at Chabua AFS.\n\n*Command Recommendation:* Immediately authorize SDRF Quick Reaction Boat 01 to Dhemaji for medical evacuation.`;
    } else if (lower.includes('neamati') || lower.includes('gauge') || lower.includes('water level') || lower.includes('danger level')) {
      reply = `**CWC River Gauge Telemetry (Brahmaputra & Barak Basins):**\n\n1. **Neamatighat (Jorhat):** **86.42m** (Danger Level: 85.04m, **+1.38m OVER DANGER**). Trend: Rising steadily due to 184mm catchment precipitation in Upper Subansiri.\n2. **Guwahati (DC Court Ghat):** **50.15m** (Danger Level: 49.68m, **+0.47m OVER DANGER**). Low-lying areas in Pandu & Bharalumukh on high alert.\n3. **Dhubri:** **29.80m** (Danger Level: 28.62m, **+1.18m OVER DANGER**). Severe backflow from downstream junctions.\n4. **Silchar (Barak River):** **20.35m** (Danger Level: 19.83m, **+0.52m**). Embankments at Betukandi under 24/7 patrol.\n\n*Stage 2 Floodfill model predicts additional 0.35m surge within the next 18 hours.*`;
    } else if (lower.includes('highway') || lower.includes('road') || lower.includes('submerged') || lower.includes('route')) {
      reply = `**Transportation & Submersion Corridor Status:**\n\n- **NH-715 (Kaziranga Corridor):** Water logged up to 0.65m along Bagori and Kohora stretches. Special animal movement corridors active; speed radar cameras enforcing 40 km/h limit.\n- **NH-15 (Sisiborgaon, Dhemaji):** Completely breached; traffic diverted via Bogibeel bridge route.\n- **Majuli Inland Ferries:** Kamalabari to Nimati ferry operations suspended by Inland Waterways Authority of India (IWAI) due to high drift logs and velocity exceeding 2.8 m/s.\n- **Barpeta-Sarthebari Road:** Submerged under 0.8m of flowing water; light vehicular transit halted.`;
    } else if (lower.includes('cloudcast') || lower.includes('name') || lower.includes('floodcast')) {
      reply = `**System Announcement:** The platform has officially transitioned from *CloudCast AI* to **FloodCast AI**.\n\n**FloodCast AI** is Assam's integrated end-to-end disaster early warning, citizen GPS live-location streaming, and automated rescue dispatcher coordination suite.`;
    } else {
      reply = `**FloodCast AI Assistant Response:**\n\nI am monitoring the active multi-district flood situation across Assam (Brahmaputra and Barak basins).\n\n**Current System State:**\n- **Stage 1 (Hill Catchments):** Extreme rainfall alerts active in Meghalaya (Mawsynram/Cherrapunji: 290mm/24h) and Upper Arunachal (184mm/24h).\n- **Stage 2 (Plains Inundation):** Neamatighat and Dhubri gauges running significantly above Danger Level; 47 villages inundated.\n- **Stage 3 (Relief & Live Dispatch):** 4 active citizen SOS beacons, with 1 unit currently en-route and 4 reserve watercraft on standby.\n\nHow can I assist your rescue operation or safety planning right now? You can ask me to evaluate evacuation routes, recommend dispatcher assignments, or query specific district coordinates.`;
    }

    return res.json({ success: true, reply, source: 'floodcast-domain-engine' });
  } catch (error) {
    console.error('Error in /api/assistant:', error);
    return res.status(500).json({ error: 'Internal assistant error' });
  }
});

// 6. Download project zip
app.get('/api/download-zip', (req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'public', 'floodcast-ai.zip');
  res.download(zipPath, 'floodcast-ai.zip', (err) => {
    if (err) {
      console.error('Error downloading zip:', err);
      if (!res.headersSent) {
        res.status(500).send('Error generating zip download');
      }
    }
  });
});

// Serve frontend with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FloodCast AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
