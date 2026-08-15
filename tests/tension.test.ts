import { describe, expect, it } from 'vitest';
import { createFarmGeometry } from '../src/cdpr/geometry';
import { solveCableKinematics } from '../src/cdpr/kinematics';
import { solveStaticTensions } from '../src/cdpr/tension-solver';

describe('static tension allocation', () => {
  it('finds a bounded positive solution at the pilot-plot center', () => {
    const geometry = createFarmGeometry();
    const cableStates = solveCableKinematics(geometry, {
      position: { x: 0, y: 5.5, z: 0 },
      rotation: { roll: 0, pitch: 0, yaw: 0 },
    });
    const result = solveStaticTensions(cableStates, 85, { min: 80, max: 1_800 });
    expect(result.tensions).toHaveLength(8);
    expect(result.tensions.every((tension) => tension >= 80 && tension <= 1_800)).toBe(true);
    expect(result.feasible).toBe(true);
  });

  it('rejects an unrealistically heavy payload under tight limits', () => {
    const geometry = createFarmGeometry();
    const cableStates = solveCableKinematics(geometry, {
      position: { x: 0, y: 5.5, z: 0 },
      rotation: { roll: 0, pitch: 0, yaw: 0 },
    });
    const result = solveStaticTensions(cableStates, 5_000, { min: 80, max: 250 });
    expect(result.feasible).toBe(false);
  });
});
