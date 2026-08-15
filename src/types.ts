export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface EulerPose {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface Pose {
  position: Vec3;
  rotation: EulerPose;
}

export interface Tower {
  id: string;
  position: Vec3;
  height: number;
}

export type CableConfiguration = 8 | 12 | 16;
export type CableBand = 'upper' | 'lower';

export interface CableDefinition {
  id: string;
  towerId: string;
  band: CableBand;
  anchor: Vec3;
  attachment: Vec3;
}

export interface FarmGeometry {
  fieldWidth: number;
  fieldLength: number;
  towerMargin: number;
  platformWidth: number;
  platformLength: number;
  cableConfiguration: CableConfiguration;
  lowerAnchorHeight: number;
  towers: Tower[];
  cables: CableDefinition[];
}

export interface CableKinematicState {
  cable: CableDefinition;
  attachmentWorld: Vec3;
  attachmentOffsetWorld: Vec3;
  directionFromPlatform: Vec3;
  lengthGradient: Vec3;
  length: number;
  jacobianRow: [number, number, number, number, number, number];
}

export interface TensionBounds {
  min: number;
  max: number;
}

export interface TensionSolution {
  tensions: number[];
  residual: number;
  feasible: boolean;
  utilization: number;
  stiffnessProxy: number;
}

export interface MotionState {
  position: Vec3;
  velocity: Vec3;
}

export interface MotionLimits {
  maxSpeed: number;
  maxAcceleration: number;
}
