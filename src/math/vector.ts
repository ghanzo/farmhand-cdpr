import type { EulerPose, Vec3 } from '../types';

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

export const add = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

export const subtract = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

export const scale = (value: Vec3, amount: number): Vec3 => ({
  x: value.x * amount,
  y: value.y * amount,
  z: value.z * amount,
});

export const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

export const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

export const magnitude = (value: Vec3): number => Math.sqrt(dot(value, value));

export const normalize = (value: Vec3): Vec3 => {
  const length = magnitude(value);
  return length > 1e-9 ? scale(value, 1 / length) : vec3();
};

export const clampMagnitude = (value: Vec3, maximum: number): Vec3 => {
  const length = magnitude(value);
  return length > maximum && length > 0 ? scale(value, maximum / length) : { ...value };
};

export const distance = (a: Vec3, b: Vec3): number => magnitude(subtract(a, b));

export function rotateVector(value: Vec3, rotation: EulerPose): Vec3 {
  const cr = Math.cos(rotation.roll);
  const sr = Math.sin(rotation.roll);
  const cp = Math.cos(rotation.pitch);
  const sp = Math.sin(rotation.pitch);
  const cy = Math.cos(rotation.yaw);
  const sy = Math.sin(rotation.yaw);

  const afterRoll = {
    x: value.x,
    y: value.y * cr - value.z * sr,
    z: value.y * sr + value.z * cr,
  };
  const afterPitch = {
    x: afterRoll.x * cp + afterRoll.y * sp,
    y: -afterRoll.x * sp + afterRoll.y * cp,
    z: afterRoll.z,
  };
  return {
    x: afterPitch.x * cy + afterPitch.z * sy,
    y: afterPitch.y,
    z: -afterPitch.x * sy + afterPitch.z * cy,
  };
}
