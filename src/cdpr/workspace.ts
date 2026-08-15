import { solveCableKinematics } from './kinematics';
import { solveStaticTensions } from './tension-solver';
import type { FarmGeometry, Pose, TensionBounds } from '../types';

export interface WorkspaceSample {
  pose: Pose;
  feasible: boolean;
  residual: number;
  utilization: number;
  minimumClearance: number;
}

export function evaluateWorkspacePoint(
  geometry: FarmGeometry,
  pose: Pose,
  massKg: number,
  bounds: TensionBounds,
): WorkspaceSample {
  const cableStates = solveCableKinematics(geometry, pose);
  const tension = solveStaticTensions(cableStates, massKg, bounds);
  const minimumClearance = Math.min(...cableStates.map((state) => state.attachmentWorld.y));
  return {
    pose,
    feasible: tension.feasible && minimumClearance > 0.5,
    residual: tension.residual,
    utilization: tension.utilization,
    minimumClearance,
  };
}
