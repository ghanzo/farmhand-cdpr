import { describe, expect, it } from 'vitest';
import { createFarmGeometry } from '../src/cdpr/geometry';

describe('farm geometry', () => {
  it('creates four towers and eight independently attached cables', () => {
    const geometry = createFarmGeometry();
    expect(geometry.towers).toHaveLength(4);
    expect(geometry.cables).toHaveLength(8);
    expect(new Set(geometry.cables.map((cable) => JSON.stringify(cable.attachment))).size).toBe(8);
  });

  it('places tower foundations outside the crop plot', () => {
    const geometry = createFarmGeometry({ fieldWidth: 12, fieldLength: 8, towerMargin: 1.25 });
    expect(geometry.towers.every((tower) => Math.abs(tower.position.x) > 6)).toBe(true);
    expect(geometry.towers.every((tower) => Math.abs(tower.position.z) > 4)).toBe(true);
  });
});
