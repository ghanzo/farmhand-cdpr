export interface ThroughputEstimate {
  hoursPerPass: number;
  energyKwh: number;
  plantsPerHour: number;
}

export function estimateThroughput(
  plantCount: number,
  secondsPerPlant: number,
  simultaneousTools: number,
  travelSecondsPerPlant = 1.5,
  averagePowerKw = 1.8,
): ThroughputEstimate {
  const tools = Math.max(1, simultaneousTools);
  const totalSeconds = (plantCount * (secondsPerPlant + travelSecondsPerPlant)) / tools;
  const hoursPerPass = totalSeconds / 3600;
  return {
    hoursPerPass,
    energyKwh: hoursPerPass * averagePowerKw,
    plantsPerHour: hoursPerPass > 0 ? plantCount / hoursPerPass : 0,
  };
}
