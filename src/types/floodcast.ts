export type WaterDepthCategory =
  | 'Ankle (0.2m)'
  | 'Knee (0.5m)'
  | 'Waist (1.0m)'
  | 'Chest (1.4m)'
  | 'Rooftop / Submerged (>2.0m)';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MODERATE';

export type SOSStatus = 'pending' | 'dispatched' | 'en-route' | 'rescued' | 'cancelled';

export interface CitizenSOS {
  id: string;
  name: string;
  phone: string;
  district: string;
  landmark: string;
  lat: number;
  lng: number;
  accuracy: number;
  waterLevel: WaterDepthCategory;
  trappedCount: number;
  needsBoat: boolean;
  needsMedical: boolean;
  needsFoodWater: boolean;
  hasInfantElderly: boolean;
  description: string;
  urgency: UrgencyLevel;
  status: SOSStatus;
  timestamp: string;
  dispatcherId?: string;
  dispatcherName?: string;
  etaMinutes?: number;
  recommendedDispatchers?: Array<DispatcherUnit & { distanceKm: number; estimatedEtaMinutes: number }>;
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

export interface RiverGauge {
  id: string;
  name: string;
  river: string;
  district: string;
  lat: number;
  lng: number;
  currentLevel: number;
  warningLevel: number;
  dangerLevel: number;
  highFloodLevel: number;
  trend: 'rising' | 'falling' | 'steady';
  dischargeCusecs: number;
  updatedAt: string;
}

export interface CatchmentRegion {
  id: string;
  name: string;
  basin: string;
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Bhutan Hills';
  rainfall24h: number;
  thresholdMm: number;
  runoffRisk: 'Extreme' | 'High' | 'Moderate' | 'Low';
  radarEchoStatus: string;
}

export interface SubmergedRoad {
  id: string;
  roadName: string;
  stretch: string;
  waterDepthMeters: number;
  trafficStatus: 'CLOSED' | 'RESTRICTED' | 'MONITORED';
  detourRoute: string;
}

export interface ReliefShelter {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  hasWaterSupplies: boolean;
  hasMedicalPost: boolean;
  contactOfficer: string;
}

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}
