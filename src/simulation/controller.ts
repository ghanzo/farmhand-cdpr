import { add, clampMagnitude, magnitude, normalize, scale, subtract } from '../math/vector';
import type { MotionLimits, MotionState, Vec3 } from '../types';

export function advanceMotion(
  state: MotionState,
  target: Vec3,
  limits: MotionLimits,
  deltaSeconds: number,
): MotionState {
  const delta = subtract(target, state.position);
  const remaining = magnitude(delta);
  const allowedSpeed = Math.min(limits.maxSpeed, Math.sqrt(2 * limits.maxAcceleration * remaining));
  const desiredVelocity = remaining > 1e-6 ? scale(normalize(delta), allowedSpeed) : { x: 0, y: 0, z: 0 };
  const velocityChange = clampMagnitude(
    subtract(desiredVelocity, state.velocity),
    limits.maxAcceleration * deltaSeconds,
  );
  const velocity = add(state.velocity, velocityChange);
  let position = add(state.position, scale(velocity, deltaSeconds));

  if (magnitude(subtract(target, position)) < 0.015 && magnitude(velocity) < 0.08) {
    position = { ...target };
    return { position, velocity: { x: 0, y: 0, z: 0 } };
  }
  return { position, velocity };
}
