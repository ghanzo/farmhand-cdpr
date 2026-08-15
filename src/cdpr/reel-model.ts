export interface ReelParameters {
  coreRadius: number;
  cableDiameter: number;
  drumWidth: number;
  capacity: number;
}

export interface ReelState {
  layer: number;
  effectiveRadius: number;
  rpm: number;
}

export const DEFAULT_REEL: ReelParameters = {
  coreRadius: 0.12,
  cableDiameter: 0.006,
  drumWidth: 0.28,
  capacity: 120,
};

export function solveReelState(
  paidOut: number,
  lineVelocity: number,
  parameters: ReelParameters = DEFAULT_REEL,
): ReelState {
  const wrapsPerLayer = Math.max(1, Math.floor(parameters.drumWidth / parameters.cableDiameter));
  let wound = Math.max(0, parameters.capacity - paidOut);
  let layer = 0;
  while (layer < 10_000) {
    const radius = parameters.coreRadius + layer * parameters.cableDiameter;
    const layerLength = 2 * Math.PI * radius * wrapsPerLayer;
    if (wound <= layerLength) break;
    wound -= layerLength;
    layer += 1;
  }
  const effectiveRadius = parameters.coreRadius + layer * parameters.cableDiameter;
  const rpm = effectiveRadius > 0 ? (60 * lineVelocity) / (2 * Math.PI * effectiveRadius) : 0;
  return { layer, effectiveRadius, rpm };
}
