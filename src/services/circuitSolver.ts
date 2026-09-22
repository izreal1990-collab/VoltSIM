import {
  BreakerComponent,
  CircuitBranch,
  MultimeterMode,
  MultimeterState,
  NECCodeViolation,
  TerminalPoint,
  WIRE_SPECS,
  WireGauge,
} from '../types/circuit';
import { soundEffects } from './soundEffects';

export interface CircuitSimulationState {
  mainServiceBreaker: boolean; // ON / OFF
  breakers: Record<string, BreakerComponent>;
  terminals: Record<string, TerminalPoint>;
  branches: Record<string, CircuitBranch>;
  switchStates: {
    singlePoleSwitch: boolean; // true = closed (ON), false = open (OFF)
    threeWaySwitch1: 'UP' | 'DOWN'; // Up connects Common to Traveler 1, Down to Traveler 2
    fourWaySwitch: 'STRAIGHT' | 'CROSS'; // Straight connects T1->T3, T2->T4; Cross connects T1->T4, T2->T3
    threeWaySwitch2: 'UP' | 'DOWN'; // Up connects Traveler 3 to Lamp, Down connects Traveler 4
  };
  faults: {
    deadShortBranch2: boolean; // Short Kitchen hot to neutral
    cutEquipmentGroundRange: boolean; // Ungrounded Range chassis
    reversePolarityBranch2: boolean; // Hot on silver, neutral on brass
    undersizedWireBranch2: boolean; // 14 AWG on 20A breaker
    looseTerminalScrewBranch1: boolean; // Incomplete torque
  };
  multimeter: MultimeterState;
  violations: NECCodeViolation[];
  arcFlashActive: boolean;
  arcFlashMessage: string | null;
}

export function createInitialSimulationState(): CircuitSimulationState {
  const breakers: Record<string, BreakerComponent> = {
    'b_main': { id: 'b_main', name: 'Main 200A Service Disconnect', poles: 2, ratingAmps: 200, feedPhase: 'PhaseAB', state: 'ON', wireGauge: '6_AWG', circuitLabel: 'Main Disconnect' },
    'b_br1': { id: 'b_br1', name: '15A Lighting (Phase A)', poles: 1, ratingAmps: 15, feedPhase: 'PhaseA', state: 'ON', wireGauge: '14_AWG', circuitLabel: 'Living Room Lights' },
    'b_br2': { id: 'b_br2', name: '20A Kitchen GFCI (Phase B)', poles: 1, ratingAmps: 20, feedPhase: 'PhaseB', state: 'ON', wireGauge: '12_AWG', circuitLabel: 'Kitchen Counter Receptacles' },
    'b_br3': { id: 'b_br3', name: '20A Dedicated Refrigerator (Phase A)', poles: 1, ratingAmps: 20, feedPhase: 'PhaseA', state: 'ON', wireGauge: '12_AWG', circuitLabel: 'Kitchen Refrigerator' },
    'b_br4': { id: 'b_br4', name: '20A Dedicated Microwave (Phase B)', poles: 1, ratingAmps: 20, feedPhase: 'PhaseB', state: 'ON', wireGauge: '12_AWG', circuitLabel: 'Microwave' },
    'b_br5': { id: 'b_br5', name: '50A 240V Range Double-Pole (Phase A+B)', poles: 2, ratingAmps: 50, feedPhase: 'PhaseAB', state: 'ON', wireGauge: '6_AWG', circuitLabel: 'Electric Range Oven' },
    'b_br6': { id: 'b_br6', name: '15A Hallway 3-Way/4-Way Lighting (Phase A)', poles: 1, ratingAmps: 15, feedPhase: 'PhaseA', state: 'ON', wireGauge: '14_AWG', circuitLabel: 'Hallway 3-Way System' },
  };

  const branches: Record<string, CircuitBranch> = {
    'br1': { id: 'br1', name: 'Living Room Lighting', breakerId: 'b_br1', type: 'Lighting_15A', loadType: 'Lighting', loadWatts: 180, isGFCI: false, hasLOTOApplied: false, hasPPEEquipped: true, chassisGrounded: true, deadShortDetected: false, chassisEnergized: false },
    'br2': { id: 'br2', name: 'Kitchen Counter GFCI', breakerId: 'b_br2', type: 'Kitchen_GFCI_20A', loadType: 'Receptacle', loadWatts: 1200, isGFCI: true, hasLOTOApplied: false, hasPPEEquipped: true, chassisGrounded: true, deadShortDetected: false, chassisEnergized: false },
    'br3': { id: 'br3', name: 'Refrigerator Dedicated', breakerId: 'b_br3', type: 'Refrigerator_Dedicated_20A', loadType: 'Appliance', loadWatts: 450, isGFCI: false, hasLOTOApplied: false, hasPPEEquipped: true, chassisGrounded: true, deadShortDetected: false, chassisEnergized: false },
    'br4': { id: 'br4', name: 'Microwave Dedicated', breakerId: 'b_br4', type: 'Microwave_Dedicated_20A', loadType: 'Appliance', loadWatts: 1500, isGFCI: false, hasLOTOApplied: false, hasPPEEquipped: true, chassisGrounded: true, deadShortDetected: false, chassisEnergized: false },
    'br5': { id: 'br5', name: 'Electric Range 240V', breakerId: 'b_br5', type: 'Electric_Range_50A', loadType: 'Appliance', loadWatts: 9600, isGFCI: false, hasLOTOApplied: false, hasPPEEquipped: true, chassisGrounded: true, deadShortDetected: false, chassisEnergized: false },
    'br6': { id: 'br6', name: 'Hallway 3-Way / 4-Way Lighting', breakerId: 'b_br6', type: 'ThreeWay_Lighting_15A', loadType: 'Lighting', loadWatts: 240, isGFCI: false, hasLOTOApplied: false, hasPPEEquipped: true, chassisGrounded: true, deadShortDetected: false, chassisEnergized: false },
  };

  const terminals: Record<string, TerminalPoint> = {
    // Utility & Main Service Panel Terminals
    't_bus_a': { id: 't_bus_a', name: 'Panel Main Busbar Phase A', type: 'PhaseA_Bus', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'panel', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_bus_b': { id: 't_bus_b', name: 'Panel Main Busbar Phase B', type: 'PhaseB_Bus', feedType: 'PhaseB', voltageToGround: 120, potentialPhase: 180, componentId: 'panel', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_neutral_bar': { id: 't_neutral_bar', name: 'Panel Neutral Busbar', type: 'Neutral_Bus', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'panel', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_ground_bar': { id: 't_ground_bar', name: 'Panel Equipment Ground Bar', type: 'Ground_Bar', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'panel', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    // Branch 1: Single-Pole Switch & Lighting
    't_sw1_line': { id: 't_sw1_line', name: 'Switch 1 Line (Phase A in)', type: 'Brass_Hot', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw1', isEnergized: true, screwTorquePercent: 70, isStrippedProperly: true, copperExposedMm: 12 },
    't_sw1_load': { id: 't_sw1_load', name: 'Switch 1 Load (Switched Hot)', type: 'Brass_Hot', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw1', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_light1_hot': { id: 't_light1_hot', name: 'Living Room Light Brass Hot', type: 'Brass_Hot', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'light1', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_light1_neutral': { id: 't_light1_neutral', name: 'Living Room Light Silver Neutral', type: 'Silver_Neutral', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'light1', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_light1_ground': { id: 't_light1_ground', name: 'Living Room Light Green Ground', type: 'Green_Ground', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'light1', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 14 },

    // Branch 2: Kitchen GFCI Receptacle
    't_gfci_brass_hot': { id: 't_gfci_brass_hot', name: 'Kitchen GFCI Brass Hot (Phase B)', type: 'Brass_Hot', feedType: 'PhaseB', voltageToGround: 120, potentialPhase: 180, componentId: 'rec_gfci', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_gfci_silver_neutral': { id: 't_gfci_silver_neutral', name: 'Kitchen GFCI Silver Neutral', type: 'Silver_Neutral', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_gfci', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_gfci_green_ground': { id: 't_gfci_green_ground', name: 'Kitchen GFCI Green Ground', type: 'Green_Ground', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_gfci', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    // Branch 3: Dedicated Refrigerator Receptacle
    't_fridge_brass': { id: 't_fridge_brass', name: 'Refrigerator Brass Hot (Phase A)', type: 'Brass_Hot', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'rec_fridge', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_fridge_silver': { id: 't_fridge_silver', name: 'Refrigerator Silver Neutral', type: 'Silver_Neutral', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_fridge', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_fridge_ground': { id: 't_fridge_ground', name: 'Refrigerator Green Ground', type: 'Green_Ground', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_fridge', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    // Branch 4: Dedicated Microwave Receptacle
    't_micro_brass': { id: 't_micro_brass', name: 'Microwave Brass Hot (Phase B)', type: 'Brass_Hot', feedType: 'PhaseB', voltageToGround: 120, potentialPhase: 180, componentId: 'rec_micro', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_micro_silver': { id: 't_micro_silver', name: 'Microwave Silver Neutral', type: 'Silver_Neutral', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_micro', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_micro_ground': { id: 't_micro_ground', name: 'Microwave Green Ground', type: 'Green_Ground', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_micro', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    // Branch 5: Electric Range 120V/240V 4-Prong (NEMA 14-50R)
    't_range_l1': { id: 't_range_l1', name: 'Range Line 1 (Phase A)', type: 'Brass_Hot', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'rec_range', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 14 },
    't_range_l2': { id: 't_range_l2', name: 'Range Line 2 (Phase B)', type: 'Brass_Hot', feedType: 'PhaseB', voltageToGround: 120, potentialPhase: 180, componentId: 'rec_range', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 14 },
    't_range_neutral': { id: 't_range_neutral', name: 'Range Neutral Terminal', type: 'Silver_Neutral', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_range', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 14 },
    't_range_ground': { id: 't_range_ground', name: 'Range Ground Terminal', type: 'Green_Ground', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'rec_range', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 14 },
    't_range_chassis': { id: 't_range_chassis', name: 'Range Metal Appliance Chassis', type: 'Chassis_Ground', feedType: 'Ground', voltageToGround: 0, potentialPhase: 0, componentId: 'range_appliance', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 0 },

    // Branch 6: 3-Way & 4-Way Switching System
    't_3way1_common': { id: 't_3way1_common', name: '3-Way #1 Common (Line In Phase A)', type: 'Common', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw_3w_1', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_3way1_trav1': { id: 't_3way1_trav1', name: '3-Way #1 Traveler 1 (Brass)', type: 'Traveler_1', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw_3w_1', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_3way1_trav2': { id: 't_3way1_trav2', name: '3-Way #1 Traveler 2 (Brass)', type: 'Traveler_2', feedType: 'Floating', voltageToGround: 0, potentialPhase: 0, componentId: 'sw_3w_1', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    't_4way_in1': { id: 't_4way_in1', name: '4-Way Switch IN 1', type: 'Traveler_1', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw_4w', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_4way_in2': { id: 't_4way_in2', name: '4-Way Switch IN 2', type: 'Traveler_2', feedType: 'Floating', voltageToGround: 0, potentialPhase: 0, componentId: 'sw_4w', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_4way_out1': { id: 't_4way_out1', name: '4-Way Switch OUT 1', type: 'Traveler_1', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw_4w', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_4way_out2': { id: 't_4way_out2', name: '4-Way Switch OUT 2', type: 'Traveler_2', feedType: 'Floating', voltageToGround: 0, potentialPhase: 0, componentId: 'sw_4w', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    't_3way2_trav1': { id: 't_3way2_trav1', name: '3-Way #2 Traveler 1', type: 'Traveler_1', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw_3w_2', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_3way2_trav2': { id: 't_3way2_trav2', name: '3-Way #2 Traveler 2', type: 'Traveler_2', feedType: 'Floating', voltageToGround: 0, potentialPhase: 0, componentId: 'sw_3w_2', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_3way2_common': { id: 't_3way2_common', name: '3-Way #2 Common (Switched Leg to Hallway Light)', type: 'Common', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'sw_3w_2', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },

    't_hall_light_hot': { id: 't_hall_light_hot', name: 'Hallway Light Brass Hot', type: 'Brass_Hot', feedType: 'PhaseA', voltageToGround: 120, potentialPhase: 0, componentId: 'light_hall', isEnergized: true, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
    't_hall_light_neutral': { id: 't_hall_light_neutral', name: 'Hallway Light Silver Neutral', type: 'Silver_Neutral', feedType: 'Neutral', voltageToGround: 0, potentialPhase: 0, componentId: 'light_hall', isEnergized: false, screwTorquePercent: 100, isStrippedProperly: true, copperExposedMm: 12 },
  };

  return {
    mainServiceBreaker: true,
    breakers,
    terminals,
    branches,
    switchStates: {
      singlePoleSwitch: true,
      threeWaySwitch1: 'UP',
      fourWaySwitch: 'STRAIGHT',
      threeWaySwitch2: 'UP',
    },
    faults: {
      deadShortBranch2: false,
      cutEquipmentGroundRange: false,
      reversePolarityBranch2: false,
      undersizedWireBranch2: false,
      looseTerminalScrewBranch1: false,
    },
    multimeter: {
      mode: 'AC_VOLTS',
      redProbeTerminalId: 't_bus_a',
      blackProbeTerminalId: 't_neutral_bar',
      redProbePosition: null,
      blackProbePosition: null,
      displayValue: '120.2',
      displayUnit: 'V AC',
      isContinuityBeeping: false,
      isOverload: false,
      leadWarning: null,
    },
    violations: [],
    arcFlashActive: false,
    arcFlashMessage: null,
  };
}

/**
 * Evaluates the full circuit state, calculating node voltages,
 * current flow, continuity, and NEC code compliance.
 */
export function evaluateCircuitState(state: CircuitSimulationState): CircuitSimulationState {
  const next = { ...state };
  const violations: NECCodeViolation[] = [];

  const mainOn = next.mainServiceBreaker && next.breakers['b_main'].state === 'ON';

  // Check 1: Dead short simulation
  if (next.faults.deadShortBranch2 && next.breakers['b_br2'].state === 'ON' && mainOn) {
    // Instantaneous magnetic trip on breaker 2
    next.breakers['b_br2'].state = 'TRIPPED';
    next.branches['br2'].deadShortDetected = true;
    next.arcFlashActive = true;
    next.arcFlashMessage = 'ARC FLASH EXPLOSION! Line-to-Neutral short circuit detected on Branch 2. Breaker magnetic instantaneous trip engaged at 10kA I.C.';
    soundEffects.playArcFlash();
    soundEffects.playBreakerSnap(true);

    violations.push({
      code: 'NEC 110.9 & 240.4',
      title: 'Dead Short Overcurrent Fault',
      severity: 'CRITICAL_HAZARD',
      description: 'Zero-impedance Hot-to-Neutral fault caused explosive arc flash. Breaker tripped on instantaneous magnetic pickup.',
      correctiveAction: 'De-energize circuit, verify LOTO, inspect Romex sheath for internal conductor pinches or insulation gouging before reset.',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // Update terminal feeds based on breaker states
  // Busbars
  const busA_energized = mainOn;
  const busB_energized = mainOn;

  next.terminals['t_bus_a'].isEnergized = busA_energized;
  next.terminals['t_bus_a'].voltageToGround = busA_energized ? 120 : 0;
  next.terminals['t_bus_b'].isEnergized = busB_energized;
  next.terminals['t_bus_b'].voltageToGround = busB_energized ? 120 : 0;

  // Branch 1: Single Pole Lighting
  const br1_on = busA_energized && next.breakers['b_br1'].state === 'ON';
  next.terminals['t_sw1_line'].isEnergized = br1_on;
  next.terminals['t_sw1_line'].voltageToGround = br1_on ? 120 : 0;

  const sw1_closed = next.switchStates.singlePoleSwitch;
  const br1_load_energized = br1_on && sw1_closed;
  next.terminals['t_sw1_load'].isEnergized = br1_load_energized;
  next.terminals['t_sw1_load'].voltageToGround = br1_load_energized ? 120 : 0;
  next.terminals['t_light1_hot'].isEnergized = br1_load_energized;
  next.terminals['t_light1_hot'].voltageToGround = br1_load_energized ? 120 : 0;

  // Branch 2: Kitchen GFCI
  const br2_on = busB_energized && next.breakers['b_br2'].state === 'ON';
  if (next.faults.reversePolarityBranch2) {
    // Reverse polarity: Hot connected to silver, neutral to brass
    next.terminals['t_gfci_brass_hot'].feedType = 'Neutral';
    next.terminals['t_gfci_brass_hot'].isEnergized = false;
    next.terminals['t_gfci_brass_hot'].voltageToGround = 0;

    next.terminals['t_gfci_silver_neutral'].feedType = 'PhaseB';
    next.terminals['t_gfci_silver_neutral'].isEnergized = br2_on;
    next.terminals['t_gfci_silver_neutral'].voltageToGround = br2_on ? 120 : 0;

    violations.push({
      code: 'NEC 200.6 & 406.4(D)',
      title: 'Reversed Polarity at Receptacle',
      severity: 'CRITICAL_HAZARD',
      description: 'Grounded conductor (neutral) connected to brass terminal; ungrounded conductor (hot) connected to silver terminal.',
      correctiveAction: 'Swap wires: Black hot conductor MUST connect to brass terminal screw; White neutral conductor MUST connect to silver terminal screw.',
      timestamp: new Date().toLocaleTimeString(),
    });
  } else {
    next.terminals['t_gfci_brass_hot'].feedType = 'PhaseB';
    next.terminals['t_gfci_brass_hot'].isEnergized = br2_on;
    next.terminals['t_gfci_brass_hot'].voltageToGround = br2_on ? 120 : 0;

    next.terminals['t_gfci_silver_neutral'].feedType = 'Neutral';
    next.terminals['t_gfci_silver_neutral'].isEnergized = false;
    next.terminals['t_gfci_silver_neutral'].voltageToGround = 0;
  }

  // Branch 3: Refrigerator
  const br3_on = busA_energized && next.breakers['b_br3'].state === 'ON';
  next.terminals['t_fridge_brass'].isEnergized = br3_on;
  next.terminals['t_fridge_brass'].voltageToGround = br3_on ? 120 : 0;

  // Branch 4: Microwave
  const br4_on = busB_energized && next.breakers['b_br4'].state === 'ON';
  next.terminals['t_micro_brass'].isEnergized = br4_on;
  next.terminals['t_micro_brass'].voltageToGround = br4_on ? 120 : 0;

  // Branch 5: Range 240V Split-Phase
  const br5_on = busA_energized && busB_energized && next.breakers['b_br5'].state === 'ON';
  next.terminals['t_range_l1'].isEnergized = br5_on;
  next.terminals['t_range_l1'].voltageToGround = br5_on ? 120 : 0;
  next.terminals['t_range_l2'].isEnergized = br5_on;
  next.terminals['t_range_l2'].voltageToGround = br5_on ? 120 : 0;

  // Range Chassis Ground fault check
  if (next.faults.cutEquipmentGroundRange) {
    next.terminals['t_range_ground'].feedType = 'Floating';
    next.terminals['t_range_ground'].isEnergized = false;
    next.terminals['t_range_ground'].voltageToGround = br5_on ? 78 : 0; // Floating phantom induced voltage
    next.terminals['t_range_chassis'].feedType = 'Floating';
    next.terminals['t_range_chassis'].isEnergized = br5_on;
    next.terminals['t_range_chassis'].voltageToGround = br5_on ? 120 : 0; // Hot leakage energizes metal frame!
    next.branches['br5'].chassisEnergized = br5_on;
    next.branches['br5'].chassisGrounded = false;

    violations.push({
      code: 'NEC 250.4(A)(5) & 250.114',
      title: 'Ungrounded Metal Appliance Chassis - Lethal Shock Hazard',
      severity: 'CRITICAL_HAZARD',
      description: 'Equipment grounding conductor (EGC) is severed. Internal insulation degradation or hot contact has energized the metallic appliance chassis to 120V to ground.',
      correctiveAction: 'Bond 10/8 AWG bare/green EGC to appliance ground lug and main panel ground bar. Ensure effective ground-fault current path.',
      timestamp: new Date().toLocaleTimeString(),
    });
  } else {
    next.terminals['t_range_ground'].feedType = 'Ground';
    next.terminals['t_range_ground'].isEnergized = false;
    next.terminals['t_range_ground'].voltageToGround = 0;
    next.terminals['t_range_chassis'].feedType = 'Ground';
    next.terminals['t_range_chassis'].isEnergized = false;
    next.terminals['t_range_chassis'].voltageToGround = 0;
    next.branches['br5'].chassisEnergized = false;
    next.branches['br5'].chassisGrounded = true;
  }

  // Branch 6: 3-Way and 4-Way Switching Logic
  const br6_on = busA_energized && next.breakers['b_br6'].state === 'ON';
  next.terminals['t_3way1_common'].isEnergized = br6_on;
  next.terminals['t_3way1_common'].voltageToGround = br6_on ? 120 : 0;

  // 3-Way #1
  const sw3w1_up = next.switchStates.threeWaySwitch1 === 'UP';
  const trav1_active = br6_on && sw3w1_up;
  const trav2_active = br6_on && !sw3w1_up;

  next.terminals['t_3way1_trav1'].isEnergized = trav1_active;
  next.terminals['t_3way1_trav1'].voltageToGround = trav1_active ? 120 : 0;
  next.terminals['t_3way1_trav2'].isEnergized = trav2_active;
  next.terminals['t_3way1_trav2'].voltageToGround = trav2_active ? 120 : 0;

  next.terminals['t_4way_in1'].isEnergized = trav1_active;
  next.terminals['t_4way_in1'].voltageToGround = trav1_active ? 120 : 0;
  next.terminals['t_4way_in2'].isEnergized = trav2_active;
  next.terminals['t_4way_in2'].voltageToGround = trav2_active ? 120 : 0;

  // 4-Way
  const straight = next.switchStates.fourWaySwitch === 'STRAIGHT';
  const out1_active = straight ? trav1_active : trav2_active;
  const out2_active = straight ? trav2_active : trav1_active;

  next.terminals['t_4way_out1'].isEnergized = out1_active;
  next.terminals['t_4way_out1'].voltageToGround = out1_active ? 120 : 0;
  next.terminals['t_4way_out2'].isEnergized = out2_active;
  next.terminals['t_4way_out2'].voltageToGround = out2_active ? 120 : 0;

  next.terminals['t_3way2_trav1'].isEnergized = out1_active;
  next.terminals['t_3way2_trav1'].voltageToGround = out1_active ? 120 : 0;
  next.terminals['t_3way2_trav2'].isEnergized = out2_active;
  next.terminals['t_3way2_trav2'].voltageToGround = out2_active ? 120 : 0;

  // 3-Way #2
  const sw3w2_up = next.switchStates.threeWaySwitch2 === 'UP';
  const hallLightEnergized = (sw3w2_up && out1_active) || (!sw3w2_up && out2_active);

  next.terminals['t_3way2_common'].isEnergized = hallLightEnergized;
  next.terminals['t_3way2_common'].voltageToGround = hallLightEnergized ? 120 : 0;
  next.terminals['t_hall_light_hot'].isEnergized = hallLightEnergized;
  next.terminals['t_hall_light_hot'].voltageToGround = hallLightEnergized ? 120 : 0;

  // Wire gauge mismatch check
  if (next.faults.undersizedWireBranch2) {
    violations.push({
      code: 'NEC 240.4(D) & 310.16',
      title: 'Undersized Conductor for Overcurrent Device',
      severity: 'CODE_VIOLATION',
      description: '14 AWG copper wire installed on a 20-Ampere breaker. Conductor ampacity rating is exceeded during peak continuous load.',
      correctiveAction: 'Upgrade branch circuit conductors to 12 AWG copper, or replace breaker with 15A rating.',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // Loose terminal screw check
  if (next.faults.looseTerminalScrewBranch1) {
    violations.push({
      code: 'NEC 110.14(D)',
      title: 'Terminal Connection Torque Deficiency',
      severity: 'WARNING',
      description: 'Terminal screw torqued to under 8 in-lb (threshold: 12-14 in-lb). High contact resistance promotes thermal runaway and arcing.',
      correctiveAction: 'Apply calibrated torque screwdriver to reach manufacturer specified 12-14 inch-pounds.',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  next.violations = violations;

  // Now calculate Multimeter readout
  next.multimeter = calculateMultimeterReading(next);

  return next;
}

/**
 * Calculates multimeter LCD readout, auto-ranging unit, continuity buzzer,
 * and high-impedance phantom voltage based on physical probe connections.
 */
function calculateMultimeterReading(state: CircuitSimulationState): MultimeterState {
  const mm = { ...state.multimeter };
  const tRed = mm.redProbeTerminalId ? state.terminals[mm.redProbeTerminalId] : null;
  const tBlack = mm.blackProbeTerminalId ? state.terminals[mm.blackProbeTerminalId] : null;

  soundEffects.stopContinuityBeep();
  mm.isContinuityBeeping = false;
  mm.isOverload = false;
  mm.leadWarning = null;

  if (mm.mode === 'OFF') {
    mm.displayValue = '';
    mm.displayUnit = 'OFF';
    return mm;
  }

  if (!tRed || !tBlack) {
    // Open leads
    if (mm.mode === 'AC_VOLTS') {
      mm.displayValue = '0.00';
      mm.displayUnit = 'V AC';
    } else if (mm.mode === 'DC_VOLTS') {
      mm.displayValue = '0.00';
      mm.displayUnit = 'V DC';
    } else if (mm.mode === 'CONTINUITY' || mm.mode === 'RESISTANCE') {
      mm.displayValue = '0.L';
      mm.displayUnit = mm.mode === 'CONTINUITY' ? 'Ω' : 'MΩ';
      mm.isOverload = true;
    }
    return mm;
  }

  // Both probes connected to the exact same terminal
  if (tRed.id === tBlack.id) {
    if (mm.mode === 'AC_VOLTS' || mm.mode === 'DC_VOLTS') {
      mm.displayValue = '0.00';
      mm.displayUnit = mm.mode === 'AC_VOLTS' ? 'V AC' : 'V DC';
    } else if (mm.mode === 'CONTINUITY') {
      mm.displayValue = '0.1';
      mm.displayUnit = 'Ω';
      mm.isContinuityBeeping = true;
      soundEffects.playContinuityBeep(true);
    } else if (mm.mode === 'RESISTANCE') {
      mm.displayValue = '0.12';
      mm.displayUnit = 'Ω';
    }
    return mm;
  }

  // Multimeter AC VOLTS mode
  if (mm.mode === 'AC_VOLTS') {
    // Calculate potential difference between Phase A, Phase B, Neutral, Ground
    let vDiff = 0;

    const redEnergized = tRed.isEnergized;
    const blackEnergized = tBlack.isEnergized;

    const redFeed = tRed.feedType;
    const blackFeed = tBlack.feedType;

    if (redFeed === 'PhaseA' && blackFeed === 'PhaseB') {
      vDiff = (redEnergized && blackEnergized) ? 240.4 : (redEnergized || blackEnergized ? 120.1 : 0);
    } else if (redFeed === 'PhaseB' && blackFeed === 'PhaseA') {
      vDiff = (redEnergized && blackEnergized) ? 240.4 : (redEnergized || blackEnergized ? 120.1 : 0);
    } else if ((redFeed === 'PhaseA' || redFeed === 'PhaseB') && (blackFeed === 'Neutral' || blackFeed === 'Ground')) {
      vDiff = redEnergized ? 120.2 : 0;
    } else if ((blackFeed === 'PhaseA' || blackFeed === 'PhaseB') && (redFeed === 'Neutral' || redFeed === 'Ground')) {
      vDiff = blackEnergized ? 120.2 : 0;
    } else if ((redFeed === 'Neutral' && blackFeed === 'Ground') || (redFeed === 'Ground' && blackFeed === 'Neutral')) {
      // Main bonding jumper keeps Neutral-to-Ground ~0V, with slight drop if high current
      vDiff = 0.15;
    } else if (redFeed === blackFeed && (redFeed === 'PhaseA' || redFeed === 'PhaseB')) {
      // Same phase to same phase potential is 0V
      vDiff = 0.02;
    } else if (redFeed === 'Floating' || blackFeed === 'Floating') {
      // High-impedance 10M-Ohm input phantom / ghost voltage
      vDiff = (redEnergized || blackEnergized) ? 38.6 : 0.0;
    }

    // Add tiny realistic jitter (+/- 0.2V)
    if (vDiff > 10) {
      vDiff = Math.round((vDiff + (Math.sin(Date.now() / 1500) * 0.2)) * 10) / 10;
    }

    mm.displayValue = vDiff.toFixed(1);
    mm.displayUnit = 'V AC';
    return mm;
  }

  // Multimeter DC VOLTS mode
  if (mm.mode === 'DC_VOLTS') {
    // Residential branch is AC, DC voltmeter reads millivolt residual offset
    mm.displayValue = '0.002';
    mm.displayUnit = 'V DC';
    return mm;
  }

  // Continuity Mode (Audio beeper threshold < 30 Ohms)
  if (mm.mode === 'CONTINUITY') {
    // If either terminal is energized with 120V/240V while on continuity, safety warning!
    if (tRed.isEnergized || tBlack.isEnergized) {
      mm.displayValue = 'O.L';
      mm.displayUnit = 'WARNING: LIVE VOLTAGE';
      mm.leadWarning = 'DANGER: Attempting continuity measurement on live energized circuit! Meter input clamp engaged.';
      return mm;
    }

    // Check if terminals are bonded / connected together
    const isDirectBond =
      (tRed.feedType === 'Ground' && tBlack.feedType === 'Ground') ||
      (tRed.feedType === 'Neutral' && tBlack.feedType === 'Neutral') ||
      (tRed.feedType === 'Ground' && tBlack.feedType === 'Neutral') || // Main panel bonding jumper
      (tRed.componentId === tBlack.componentId && tRed.type.startsWith('Traveler') && tBlack.type.startsWith('Traveler'));

    if (isDirectBond) {
      mm.displayValue = '0.4';
      mm.displayUnit = 'Ω';
      mm.isContinuityBeeping = true;
      soundEffects.playContinuityBeep(true);
    } else {
      mm.displayValue = '0.L';
      mm.displayUnit = 'Ω';
      mm.isOverload = true;
    }
    return mm;
  }

  // Resistance Mode
  if (mm.mode === 'RESISTANCE') {
    if (tRed.isEnergized || tBlack.isEnergized) {
      mm.displayValue = 'O.L';
      mm.displayUnit = 'LIVE VOLTAGE';
      mm.isOverload = true;
      return mm;
    }

    const isDirectBond =
      (tRed.feedType === 'Ground' && tBlack.feedType === 'Ground') ||
      (tRed.feedType === 'Neutral' && tBlack.feedType === 'Neutral');

    if (isDirectBond) {
      mm.displayValue = '0.38';
      mm.displayUnit = 'Ω';
    } else if (
      (tRed.feedType === 'PhaseA' || tRed.feedType === 'PhaseB') &&
      tBlack.feedType === 'Neutral'
    ) {
      // Cold filament load resistance (e.g. 180W light = ~80 ohms cold, 1200W microwave = ~12 ohms)
      mm.displayValue = '14.2';
      mm.displayUnit = 'Ω';
    } else {
      mm.displayValue = '0.L';
      mm.displayUnit = 'MΩ';
      mm.isOverload = true;
    }
    return mm;
  }

  return mm;
}
