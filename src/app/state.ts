import type { OperationId } from '../farm/operations';
import type { MotionState, Pose, TensionBounds, Vec3 } from '../types';

export interface SimulatorSettings {
  fieldSize: number;
  towerHeight: number;
  carrierHeight: number;
  payloadKg: number;
  stageExtension: number;
  maxSpeed: number;
  maxAcceleration: number;
  operation: OperationId;
  plantCount: number;
  simultaneousTools: number;
  tensionBounds: TensionBounds;
}

export interface SimulatorState {
  settings: SimulatorSettings;
  motion: MotionState;
  target: Vec3;
  pose: Pose;
  paused: boolean;
}

export const DEFAULT_SETTINGS: SimulatorSettings = {
  fieldSize: 10,
  towerHeight: 9,
  carrierHeight: 5.5,
  payloadKg: 85,
  stageExtension: 2.4,
  maxSpeed: 1.8,
  maxAcceleration: 1.1,
  operation: 'scan',
  plantCount: 240,
  simultaneousTools: 1,
  tensionBounds: { min: 80, max: 1_800 },
};

export function createInitialState(): SimulatorState {
  const start = { x: 0, y: DEFAULT_SETTINGS.carrierHeight, z: 0 };
  return {
    settings: { ...DEFAULT_SETTINGS, tensionBounds: { ...DEFAULT_SETTINGS.tensionBounds } },
    motion: { position: { ...start }, velocity: { x: 0, y: 0, z: 0 } },
    target: { ...start },
    pose: {
      position: { ...start },
      rotation: { roll: 0, pitch: 0, yaw: 0 },
    },
    paused: false,
  };
}
