import { describe, expect, it } from 'vitest';
import { estimateThroughput } from '../src/farm/throughput';

describe('throughput estimate', () => {
  it('reduces pass time when simultaneous tools increase', () => {
    const oneTool = estimateThroughput(50_000, 10, 1, 0);
    const fourTools = estimateThroughput(50_000, 10, 4, 0);
    expect(oneTool.hoursPerPass).toBeCloseTo(138.89, 1);
    expect(fourTools.hoursPerPass).toBeCloseTo(oneTool.hoursPerPass / 4, 6);
  });
});
