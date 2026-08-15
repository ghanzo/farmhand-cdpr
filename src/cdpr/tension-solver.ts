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
  const directions = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [Math.SQRT1_2, Math.SQRT1_2, 0],
    [Math.SQRT1_2, 0, Math.SQRT1_2],
    [0, Math.SQRT1_2, Math.SQRT1_2],
  ];
  const weakestDirectionalAuthority = cableStates.length
    ? Math.min(...directions.map((direction) => cableStates.reduce((sum, state) => {
      const unit = state.directionFromPlatform;
      const projection = unit.x * (direction[0] ?? 0)
        + unit.y * (direction[1] ?? 0)
        + unit.z * (direction[2] ?? 0);
      return sum + projection * projection;
    }, 0) / cableStates.length))
    : 0;
  const forceTolerance = Math.max(8, massKg * GRAVITY * 0.025);

  return {
    tensions,
    residual,
    feasible: residual <= forceTolerance && tensions.every((value) => value >= bounds.min && value <= bounds.max),
    utilization: bounds.max > 0 ? peak / bounds.max : 1,
    stiffnessProxy: weakestDirectionalAuthority * (1 - Math.min(1, peak / Math.max(bounds.max, 1))),
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
