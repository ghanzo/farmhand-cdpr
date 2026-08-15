export type OperationId = 'scan' | 'spray' | 'sample' | 'harvest' | 'weed';

export interface FarmOperation {
  id: OperationId;
  label: string;
  shortLabel: string;
  description: string;
  reactionForceN: number;
  secondsPerPlant: number;
  toolColor: number;
  requiresBrace: boolean;
}

export const FARM_OPERATIONS: FarmOperation[] = [
  {
    id: 'scan',
    label: 'Multispectral scan',
    shortLabel: 'Scan',
    description: 'Non-contact crop imaging and plant-level mapping.',
    reactionForceN: 0,
    secondsPerPlant: 1.2,
    toolColor: 0x6dd7ff,
    requiresBrace: false,
  },
  {
    id: 'spray',
    label: 'Targeted foliar spray',
    shortLabel: 'Spray',
    description: 'Low-force, plant-specific liquid application.',
    reactionForceN: 3,
    secondsPerPlant: 2.8,
    toolColor: 0x8dd45e,
    requiresBrace: false,
  },
  {
    id: 'sample',
    label: 'Plant sampling',
    shortLabel: 'Sample',
    description: 'Vision-guided sap, tissue, or soil sampling.',
    reactionForceN: 18,
    secondsPerPlant: 16,
    toolColor: 0xffc857,
    requiresBrace: false,
  },
  {
    id: 'harvest',
    label: 'Delicate harvest',
    shortLabel: 'Harvest',
    description: 'Compliant picking with local vision and force sensing.',
    reactionForceN: 32,
    secondsPerPlant: 11,
    toolColor: 0xff7b69,
    requiresBrace: false,
  },
  {
    id: 'weed',
    label: 'Mechanical weeding',
    shortLabel: 'Weed',
    description: 'Force-producing operation that may require a ground brace.',
    reactionForceN: 120,
    secondsPerPlant: 8,
    toolColor: 0xd1a4ff,
    requiresBrace: true,
  },
];

export function getOperation(id: OperationId): FarmOperation {
  return FARM_OPERATIONS.find((operation) => operation.id === id) ?? FARM_OPERATIONS[0]!;
}
