import { cross } from '../math/vector';
import type { CableKinematicState, TensionBounds, TensionSolution } from '../types';

const GRAVITY = 9.80665;

export function solveStaticTensions(
  cableStates: CableKinematicState[],
  massKg: number,
  bounds: TensionBounds,
): TensionSolution {
  const columns = cableStates.map((state) => {
    const moment = cross(state.attachmentOffsetWorld, state.directionFromPlatform);
    return [
      state.directionFromPlatform.x,
      state.directionFromPlatform.y,
      state.directionFromPlatform.z,
      moment.x,
      moment.y,
      moment.z,
    ];
  });
  const target = [0, massKg * GRAVITY, 0, 0, 0, 0];
  const preload = bounds.min + 0.18 * (bounds.max - bounds.min);
  const tensions = columns.map(() => preload);
  const residualVector = multiply(columns, tensions).map((value, index) => value - (target[index] ?? 0));

  for (let iteration = 0; iteration < 700; iteration += 1) {
    for (let cableIndex = 0; cableIndex < columns.length; cableIndex += 1) {
      const column = columns[cableIndex];
      if (!column) continue;
      let numerator = 0;
      let denominator = 1e-9;
      for (let row = 0; row < 6; row += 1) {
        const coefficient = column[row] ?? 0;
        numerator += coefficient * (residualVector[row] ?? 0);
        denominator += coefficient * coefficient;
      }
      const previous = tensions[cableIndex] ?? preload;
      const next = clamp(previous - numerator / denominator, bounds.min, bounds.max);
      const delta = next - previous;
      tensions[cableIndex] = next;
      if (Math.abs(delta) > 1e-10) {
        for (let row = 0; row < 6; row += 1) {
          residualVector[row] = (residualVector[row] ?? 0) + (column[row] ?? 0) * delta;
        }
      }
    }
  }

  const residual = Math.sqrt(residualVector.reduce((sum, value) => sum + value * value, 0));
  const peak = Math.max(...tensions, 0);
  const averageVerticalAuthority = cableStates.length
    ? cableStates.reduce((sum, state) => sum + Math.max(0, state.directionFromPlatform.y), 0) / cableStates.length
    : 0;
  const forceTolerance = Math.max(8, massKg * GRAVITY * 0.025);

  return {
    tensions,
    residual,
    feasible: residual <= forceTolerance && tensions.every((value) => value >= bounds.min && value <= bounds.max),
    utilization: bounds.max > 0 ? peak / bounds.max : 1,
    stiffnessProxy: averageVerticalAuthority * (1 - Math.min(1, peak / Math.max(bounds.max, 1))),
  };
}

function multiply(columns: number[][], values: number[]): number[] {
  const result = [0, 0, 0, 0, 0, 0];
  columns.forEach((column, columnIndex) => {
    const value = values[columnIndex] ?? 0;
    for (let row = 0; row < 6; row += 1) {
      result[row] = (result[row] ?? 0) + (column[row] ?? 0) * value;
    }
  });
  return result;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
