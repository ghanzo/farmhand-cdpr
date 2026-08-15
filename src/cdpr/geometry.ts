import type { CableDefinition, FarmGeometry, Tower, Vec3 } from '../types';

export interface GeometryOptions {
  fieldWidth: number;
  fieldLength: number;
  towerHeight: number;
  towerMargin: number;
  platformWidth: number;
  platformLength: number;
  anchorSeparation: number;
}

export const DEFAULT_GEOMETRY: GeometryOptions = {
  fieldWidth: 10,
  fieldLength: 10,
  towerHeight: 9,
  towerMargin: 1.5,
  platformWidth: 1.8,
  platformLength: 1.4,
  anchorSeparation: 0.8,
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
    const anchors: [Vec3, Vec3] = [
      {
        x: tower.position.x + inwardX * config.anchorSeparation * 0.5,
        y: config.towerHeight,
        z: tower.position.z,
      },
      {
        x: tower.position.x,
        y: config.towerHeight,
        z: tower.position.z + inwardZ * config.anchorSeparation * 0.5,
      },
    ];
    const attachments: [Vec3, Vec3] = [
      { x: corner.sx * platformHalfX, y: 0, z: corner.sz * platformHalfZ * 0.58 },
      { x: corner.sx * platformHalfX * 0.58, y: 0, z: corner.sz * platformHalfZ },
    ];

    anchors.forEach((anchor, pairIndex) => {
      const attachment = attachments[pairIndex];
      if (!attachment) return;
      cables.push({
        id: `C${towerIndex * 2 + pairIndex + 1}`,
        towerId: tower.id,
        anchor,
        attachment,
      });
    });
  }

  return {
    fieldWidth: config.fieldWidth,
    fieldLength: config.fieldLength,
    towerMargin: config.towerMargin,
    platformWidth: config.platformWidth,
    platformLength: config.platformLength,
    towers,
    cables,
  };
}
