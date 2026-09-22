/**
 * Core type definitions for Residential Electrical Simulation & Circuit Graph
 */

export type SourceFeedType = 'PhaseA' | 'PhaseB' | 'Neutral' | 'Ground' | 'Floating';

export type WireGauge = '14_AWG' | '12_AWG' | '10_AWG' | '8_AWG' | '6_AWG';

export interface WireGaugeSpec {
  gauge: WireGauge;
  name: string;
  maxAmps: number;
  resistancePer1000Ft: number; // ohms
  recommendedBreaker: number; // Amps
  colorStandard: string;
}

export const WIRE_SPECS: Record<WireGauge, WireGaugeSpec> = {
  '14_AWG': { gauge: '14_AWG', name: '14 AWG', maxAmps: 15, resistancePer1000Ft: 3.07, recommendedBreaker: 15, colorStandard: 'White jacket (15A)' },
  '12_AWG': { gauge: '12_AWG', name: '12 AWG', maxAmps: 20, resistancePer1000Ft: 1.93, recommendedBreaker: 20, colorStandard: 'Yellow jacket (20A)' },
  '10_AWG': { gauge: '10_AWG', name: '10 AWG', maxAmps: 30, resistancePer1000Ft: 1.21, recommendedBreaker: 30, colorStandard: 'Orange jacket (30A)' },
  '8_AWG': { gauge: '8_AWG', name: '8 AWG', maxAmps: 40, resistancePer1000Ft: 0.76, recommendedBreaker: 40, colorStandard: 'Black jacket (40A)' },
  '6_AWG': { gauge: '6_AWG', name: '6 AWG', maxAmps: 55, resistancePer1000Ft: 0.49, recommendedBreaker: 50, colorStandard: 'Black jacket (50A)' },
};

export type MultimeterMode = 'OFF' | 'AC_VOLTS' | 'DC_VOLTS' | 'CONTINUITY' | 'RESISTANCE';

export interface TerminalPoint {
  id: string;
  name: string;
  type: 'Brass_Hot' | 'Silver_Neutral' | 'Green_Ground' | 'PhaseA_Bus' | 'PhaseB_Bus' | 'Neutral_Bus' | 'Ground_Bar' | 'Traveler_1' | 'Traveler_2' | 'Common' | 'Chassis_Ground';
  feedType: SourceFeedType;
  voltageToGround: number; // Volts RMS
  potentialPhase: number; // Degrees (0 for A, 180 for B)
  componentId: string;
  isEnergized: boolean;
  screwTorquePercent: number; // 0 to 100% (100% = 12-14 in-lb)
  isStrippedProperly: boolean;
  copperExposedMm: number; // Ideal: 11-14mm
}

export interface BreakerComponent {
  id: string;
  name: string;
  poles: 1 | 2; // 1 = 120V single pole, 2 = 240V double pole
  ratingAmps: number;
  feedPhase: 'PhaseA' | 'PhaseB' | 'PhaseAB';
  state: 'ON' | 'OFF' | 'TRIPPED';
  wireGauge: WireGauge;
  circuitLabel: string;
}

export interface CircuitBranch {
  id: string;
  name: string;
  breakerId: string;
  type: 'Lighting_15A' | 'Kitchen_GFCI_20A' | 'Refrigerator_Dedicated_20A' | 'Microwave_Dedicated_20A' | 'Electric_Range_50A' | 'ThreeWay_Lighting_15A';
  loadType: 'Lighting' | 'Receptacle' | 'Appliance';
  loadWatts: number;
  isGFCI: boolean;
  hasLOTOApplied: boolean;
  hasPPEEquipped: boolean;
  chassisGrounded: boolean;
  deadShortDetected: boolean;
  chassisEnergized: boolean;
}

export interface MultimeterState {
  mode: MultimeterMode;
  redProbeTerminalId: string | null;
  blackProbeTerminalId: string | null;
  redProbePosition: { x: number; y: number } | null;
  blackProbePosition: { x: number; y: number } | null;
  displayValue: string;
  displayUnit: string;
  isContinuityBeeping: boolean;
  isOverload: boolean;
  leadWarning: string | null;
}

export interface NECCodeViolation {
  code: string;
  title: string;
  severity: 'CRITICAL_HAZARD' | 'CODE_VIOLATION' | 'WARNING';
  description: string;
  correctiveAction: string;
  timestamp: string;
}

export interface WireSplineNode {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
  wireColor: 'Black' | 'Red' | 'White' | 'BareCopper' | 'Green';
  gauge: WireGauge;
  lengthFeet: number;
  currentAmps: number;
  isEnergized: boolean;
  isDisconnected: boolean;
  slack: number;
}
