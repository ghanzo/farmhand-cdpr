# System architecture

## Macro–micro motion

Farmhand uses two positioning systems:

| Layer | Responsibility |
|---|---|
| Four towers and 8/12/16 winches | Generate field-scale cable geometry, preload, and tension |
| Suspended carrier | Move payload rapidly above the canopy |
| Rigid vertical stage | Reach downward without adding a free pendulum |
| Local arm or wrist | Final orientation, obstacle avoidance, and compliance |
| Tool head | Execute a crop-specific operation |
| Service dock | Change tools, refill, unload, calibrate, and park safely |

The CDPR is not expected to place a weeding tip between leaves by itself. It
delivers the local robot to a stable neighborhood around the plant.

## Coordinate model

Each cable connects a fixed tower anchor **aᵢ** to a distinct carrier attachment
**bᵢ**. For carrier position **p** and orientation **R**:

```text
eᵢ = p + Rbᵢ
Lᵢ = ||aᵢ - eᵢ||
L̇ᵢ = ûᵢᵀ(v + ω × Rbᵢ)
```

Distinct attachment points are essential. If every cable ends at the same
point, cable forces cannot create controlled platform moments.

## Static tension

Cables pull but do not push. A pose is useful only when cable tensions satisfy
force and moment equilibrium while remaining inside operating limits:

```text
W(q)t + w_external = 0
t_min ≤ tᵢ ≤ t_max
```

The current simulator solves a bounded approximation of static equilibrium
against gravity and an operation-dependent equivalent load. Future versions
must add uncertainty, wind, cable weight, elasticity, tower deflection, and
tool-force direction.

## Carrier configuration

The simulator compares three independently driven configurations. The
eight-cable baseline uses one upper and one lower connection at each tower. The
12-cable working hypothesis uses two upper and one lower connection per tower.
The 16-cable study uses two upper and two lower connections per tower for the
greatest redundancy and bidirectional wrench authority—and the greatest drive,
sensing, control, and maintenance burden.

The carrier operates between the upper and lower anchor planes. Lower cables
must remain above the crop, access, sag, and motion-clearance envelope; a rigid
stage reaches downward from the elevated carrier. All layouts use distinct
carrier attachment points and aim to keep the carrier approximately level while
the local arm supplies most tool orientation. Cable count alone does not prove
wrench closure, stiffness, or structural safety.

## Safety architecture

A physical design requires, at minimum:

- independent brakes and overspeed protection;
- redundant carrier pose sensing;
- measured cable tension;
- exclusion-zone enforcement;
- controlled behavior after a motor, encoder, or cable fault;
- weather limits and wind monitoring;
- foundation and tower load certification; and
- a safe service and parking position.

None of these requirements is satisfied by the browser simulation.
