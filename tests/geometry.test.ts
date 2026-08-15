import { describe, expect, it } from 'vitest';
import { createFarmGeometry } from '../src/cdpr/geometry';

describe('farm geometry', () => {
  it('creates four towers and twelve independently attached cables by default', () => {
    const geometry = createFarmGeometry();
    expect(geometry.towers).toHaveLength(4);
    expect(geometry.cables).toHaveLength(12);
    expect(new Set(geometry.cables.map((cable) => JSON.stringify(cable.attachment))).size).toBe(12);
  });

  it.each([
    { cableConfiguration: 8 as const, upper: 4, lower: 4 },
    { cableConfiguration: 12 as const, upper: 8, lower: 4 },
    { cableConfiguration: 16 as const, upper: 8, lower: 8 },
  ])('builds the $cableConfiguration-cable high/low architecture', ({ cableConfiguration, upper, lower }) => {
    const geometry = createFarmGeometry({ cableConfiguration });
    expect(geometry.cables).toHaveLength(cableConfiguration);
    expect(geometry.cables.filter((cable) => cable.band === 'upper')).toHaveLength(upper);
    expect(geometry.cables.filter((cable) => cable.band === 'lower')).toHaveLength(lower);
    expect(geometry.cables.filter((cable) => cable.band === 'upper').every((cable) => cable.anchor.y === 9)).toBe(true);
    expect(geometry.cables.filter((cable) => cable.band === 'lower').every((cable) => cable.anchor.y === 3.5)).toBe(true);
  });

  it('places tower foundations outside the crop plot', () => {
    const geometry = createFarmGeometry({ fieldWidth: 12, fieldLength: 8, towerMargin: 1.25 });
    expect(geometry.towers.every((tower) => Math.abs(tower.position.x) > 6)).toBe(true);
    expect(geometry.towers.every((tower) => Math.abs(tower.position.z) > 4)).toBe(true);
  });
});
