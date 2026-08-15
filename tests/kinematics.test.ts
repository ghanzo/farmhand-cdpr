import { describe, expect, it } from 'vitest';
import { createFarmGeometry } from '../src/cdpr/geometry';
import { solveCableKinematics } from '../src/cdpr/kinematics';
import type { Pose } from '../src/types';

const LEVEL_POSE: Pose = {
  position: { x: 0, y: 5.5, z: 0 },
  rotation: { roll: 0, pitch: 0, yaw: 0 },
};

describe('inverse cable kinematics', () => {
  it('returns one positive length and Jacobian row per cable', () => {
    const states = solveCableKinematics(createFarmGeometry(), LEVEL_POSE);
    expect(states).toHaveLength(8);
    expect(states.every((state) => state.length > 0)).toBe(true);
    expect(states.every((state) => state.jacobianRow.length === 6)).toBe(true);
  });

  it('changes opposing cable lengths when the carrier translates', () => {
    const geometry = createFarmGeometry();
    const center = solveCableKinematics(geometry, LEVEL_POSE);
    const shifted = solveCableKinematics(geometry, {
      ...LEVEL_POSE,
      position: { x: 1.5, y: 5.5, z: 0 },
    });
    const deltas = shifted.map((state, index) => state.length - (center[index]?.length ?? 0));
    expect(deltas.some((delta) => delta > 0.5)).toBe(true);
    expect(deltas.some((delta) => delta < -0.5)).toBe(true);
  });
});
