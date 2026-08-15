import { describe, expect, it } from 'vitest';
import { solveReelState } from '../src/cdpr/reel-model';

describe('reel model', () => {
  it('uses a larger effective radius when more cable is wound', () => {
    const nearlyFull = solveReelState(5, 1);
    const nearlyEmpty = solveReelState(110, 1);
    expect(nearlyFull.effectiveRadius).toBeGreaterThan(nearlyEmpty.effectiveRadius);
    expect(nearlyFull.rpm).toBeLessThan(nearlyEmpty.rpm);
  });

  it('preserves payout direction in signed RPM', () => {
    expect(solveReelState(20, 0.8).rpm).toBeGreaterThan(0);
    expect(solveReelState(20, -0.8).rpm).toBeLessThan(0);
  });
});
