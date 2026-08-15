import { add, cross, magnitude, normalize, rotateVector, subtract } from '../math/vector';
import type { CableKinematicState, FarmGeometry, Pose } from '../types';

export function solveCableKinematics(geometry: FarmGeometry, pose: Pose): CableKinematicState[] {
  return geometry.cables.map((cable) => {
    const attachmentOffsetWorld = rotateVector(cable.attachment, pose.rotation);
    const attachmentWorld = add(pose.position, attachmentOffsetWorld);
    const fromPlatform = subtract(cable.anchor, attachmentWorld);
    const length = magnitude(fromPlatform);
    const directionFromPlatform = normalize(fromPlatform);
    const lengthGradient = {
      x: -directionFromPlatform.x,
      y: -directionFromPlatform.y,
      z: -directionFromPlatform.z,
    };
    const angularGradient = cross(attachmentOffsetWorld, lengthGradient);

    return {
      cable,
      attachmentWorld,
      attachmentOffsetWorld,
      directionFromPlatform,
      lengthGradient,
      length,
      jacobianRow: [
        lengthGradient.x,
        lengthGradient.y,
        lengthGradient.z,
        angularGradient.x,
        angularGradient.y,
        angularGradient.z,
      ],
    };
  });
}
