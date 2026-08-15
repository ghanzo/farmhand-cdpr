# Assumptions and limitations

## Implemented assumptions

- Cables are straight, massless tension members.
- Tower anchors and foundations are rigid.
- Carrier geometry is rigid.
- Static loads dominate the tension screening calculation.
- Each cable has an independent length measurement.
- Every active cable represents an independent motor, brake, encoder, and
  tension-sensing channel; the 16-cable option therefore represents 16 drives.
- Pulley locations coincide with the modeled anchor points.
- Operation force is represented conservatively as an equivalent vertical load.
- The local arm is represented by a rigid vertical stage, not articulated
  dynamics.

## Missing physics

- cable sag, stretch, damping, creep, and thermal effects;
- pulley friction, fleet angle, and layered winding error;
- tower and foundation compliance;
- carrier aerodynamics and wind gusts;
- nonlinear rigid-body dynamics;
- motor, gearbox, brake, encoder, and drive limits;
- cable collision and crop interference;
- sensor noise, latency, and calibration drift; and
- failure and emergency-stop behavior.

## Solver boundary

The bounded tension solver minimizes a static wrench residual numerically. A
green result means only that the simplified model found a low-residual set of
positive tensions inside the selected limits. It is not proof of controllability,
stability, stiffness, structural safety, or real-world reachability.

The displayed rigidity value is a normalized directional-authority proxy based
on sampled translational directions and peak-tension utilization. It is not a
stiffness matrix and does not include cable elasticity, geometric stiffness,
preload optimization, or structural compliance.

## Units

Geometry is expressed in metres, velocity in metres per second, mass in
kilograms, force in newtons, angles in radians, and reel speed in revolutions per
minute.
