import type { CableConfiguration, CableDefinition, FarmGeometry, Tower, Vec3 } from '../types';

export interface GeometryOptions {
  fieldWidth: number;
  fieldLength: number;
  towerHeight: number;
  lowerAnchorHeight: number;
  towerMargin: number;
  platformWidth: number;
  platformLength: number;
  anchorSeparation: number;
  cableConfiguration: CableConfiguration;
}

export const DEFAULT_GEOMETRY: GeometryOptions = {
  fieldWidth: 10,
  fieldLength: 10,
  towerHeight: 9,
  lowerAnchorHeight: 3.5,
  towerMargin: 1.5,
  platformWidth: 1.8,
  platformLength: 1.4,
  anchorSeparation: 0.8,
  cableConfiguration: 12,
};

export function createFarmGeometry(options: Partial<GeometryOptions> = {}): FarmGeometry {
  const config = { ...DEFAULT_GEOMETRY, ...options };
  const halfX = config.fieldWidth / 2 + config.towerMargin;
  const halfZ = config.fieldLength / 2 + config.towerMargin;
  const corners = [
    { id: 'NE', sx: 1, sz: -1 },
    { id: 'NW', sx: -1, sz: -1 },
    { id: 'SW', sx: -1, sz: 1 },
    { id: 'SE', sx: 1, sz: 1 },
  ];

  const towers: Tower[] = corners.map(({ id, sx, sz }) => ({
    id,
    height: config.towerHeight,
    position: { x: sx * halfX, y: 0, z: sz * halfZ },
  }));

  const cables: CableDefinition[] = [];
  const platformHalfX = config.platformWidth / 2;
  const platformHalfZ = config.platformLength / 2;

  for (const [towerIndex, corner] of corners.entries()) {
    const tower = towers[towerIndex];
    if (!tower) continue;
    const inwardX = -corner.sx;
    const inwardZ = -corner.sz;
    const candidates: Array<{ band: 'upper' | 'lower'; anchor: Vec3; attachment: Vec3 }> = [
      {
        band: 'upper',
        anchor: {
          x: tower.position.x + inwardX * config.anchorSeparation * 0.5,
          y: config.towerHeight,
          z: tower.position.z,
        },
        attachment: { x: corner.sx * platformHalfX, y: 0, z: corner.sz * platformHalfZ * 0.58 },
      },
      {
        band: 'upper',
        anchor: {
          x: tower.position.x,
          y: config.towerHeight,
          z: tower.position.z + inwardZ * config.anchorSeparation * 0.5,
        },
        attachment: { x: corner.sx * platformHalfX * 0.58, y: 0, z: corner.sz * platformHalfZ },
      },
      {
        band: 'lower',
        anchor: {
          x: tower.position.x + inwardX * config.anchorSeparation * 0.5,
          y: config.lowerAnchorHeight,
          z: tower.position.z,
        },
        attachment: { x: corner.sx * platformHalfX * 0.76, y: 0, z: corner.sz * platformHalfZ * 0.32 },
      },
      {
        band: 'lower',
        anchor: {
          x: tower.position.x,
          y: config.lowerAnchorHeight,
          z: tower.position.z + inwardZ * config.anchorSeparation * 0.5,
        },
        attachment: { x: corner.sx * platformHalfX * 0.32, y: 0, z: corner.sz * platformHalfZ * 0.76 },
      },
    ];
    const selected = config.cableConfiguration === 8
      ? [candidates[0], candidates[2]]
      : config.cableConfiguration === 12
        ? [candidates[0], candidates[1], candidates[2]]
        : candidates;

    selected.forEach((candidate, cableIndex) => {
      if (!candidate) return;
      cables.push({
        id: `C${towerIndex * selected.length + cableIndex + 1}`,
        towerId: tower.id,
        band: candidate.band,
        anchor: candidate.anchor,
        attachment: candidate.attachment,
      });
    });
  }

  return {
    fieldWidth: config.fieldWidth,
    fieldLength: config.fieldLength,
    towerMargin: config.towerMargin,
    platformWidth: config.platformWidth,
    platformLength: config.platformLength,
    cableConfiguration: config.cableConfiguration,
    lowerAnchorHeight: config.lowerAnchorHeight,
    towers,
    cables,
  };
}
