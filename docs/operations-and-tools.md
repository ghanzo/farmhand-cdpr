# Operations and tooling

## Operation classes

### Non-contact

RGB, depth, thermal, multispectral, and fluorescence sensing impose almost no
reaction force. These are the safest first applications and create the plant
map required by later autonomy.

### Low force

Targeted foliar application, spot irrigation, and liquid injection are good
early tools. Bulk irrigation should normally remain fixed as drip or subsurface
infrastructure rather than moving water around on the carrier.

### Compliant manipulation

Harvesting berries or tomatoes, pruning, and sampling require local vision,
force sensing, compliant motion, and crop-specific end effectors. A short local
arm can approach through foliage from multiple angles.

### Force producing

Uprooting weeds, chopping thick stems, cultivation, and seed insertion transfer
meaningful force into the carrier. These operations may require a temporary
ground brace or a tool that anchors itself before loading the mechanism.

## Dense foliage

A tendon-driven continuum or “snake” arm may help reach through foliage, but it
should be treated as a specialized tool. It trades reachability for lower
stiffness, harder calibration, and greater collision-planning complexity.

## Tool interface

Every tool should declare:

- mass and center of gravity;
- electrical and fluid requirements;
- expected force and torque envelope;
- required pose accuracy;
- perception requirements;
- contamination and cleaning rules;
- task time distribution; and
- safe failure behavior.

These declarations allow the simulator to reject operations that exceed the
current carrier or workspace model.
