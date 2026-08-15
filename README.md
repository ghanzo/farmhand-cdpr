# Farmhand CDPR

Farmhand is an open engineering study for a **cable-driven parallel robot that
works above a diversified farm without carrying tractor traffic through the
cropped area**.

The project combines a four-tower cable carrier for field-scale motion with a
rigid vertical stage and local tool head for plant-scale work. The browser
simulator is deliberately an engineering baseline rather than a claim that the
full system is already solved.

## What the current simulator does

- Models four towers, eight independently measured cables, and eight distinct
  carrier attachment points.
- Computes rigid-body inverse cable geometry for carrier position and small
  platform rotations.
- Allocates bounded positive cable tension against gravity with a numerical
  static-equilibrium solver.
- Displays cable length, estimated tension, reel speed, carrier velocity, and
  equilibrium residual.
- Lets the user vary plot size, tower height, carrier height, moving mass, tool
  stage extension, speed, and farm operation.
- Shows a mixed planting rather than a tractor-row layout.
- Estimates task throughput so that plant-level operations can be evaluated
  against a realistic time budget.

## What it does not yet prove

The current model does not include cable sag, elasticity, wind, tower and
foundation deflection, pulley friction, closed-loop motor control, collision
avoidance, sensing error, or measured end-effector accuracy. The tension solver
is a screening model, not a controller suitable for hardware.

See [assumptions and limitations](docs/assumptions-and-limitations.md) before
using results for design decisions.

## Architecture hypothesis

Farmhand separates motion into two scales:

1. The **CDPR carrier** moves quickly across the plot while remaining above the
   crop canopy.
2. A **rigid vertical stage and local arm** provide the final reach, orientation,
   compliance, and sensing needed at the plant.

This avoids making the farm-scale cable system perform every small manipulation
and keeps most cables away from foliage. Force-heavy operations may require a
temporary ground brace.

## Start locally

```bash
npm install
npm run dev
```

Run the engineering checks with:

```bash
npm test
npm run build
```

## Project documents

- [Farm concept](docs/farm-concept.md)
- [System architecture](docs/system-architecture.md)
- [Agronomic case](docs/agronomy.md)
- [Operations and tooling](docs/operations-and-tools.md)
- [Economics](docs/economics.md)
- [Research roadmap](docs/research-roadmap.md)
- [Assumptions and limitations](docs/assumptions-and-limitations.md)
- [Reference library](docs/references.bib)

## Research foundation

Farmhand builds on agricultural cable robots rather than treating the idea as
unprecedented. Important precedents include AgroCableBot, the ETH field
phenotyping platform, large-scale agricultural wire-robot analysis, CAFEs, and
hybrid cable robots with local manipulators. The agronomic case draws on
peer-reviewed soil-compaction and diversification studies.

Practitioner frameworks such as Advancing Eco Agriculture's Plant Health
Pyramid are treated as hypotheses to measure, not as substitutes for controlled
evidence.

## Status

This is an early research simulator for a 10 × 10 metre pilot. Do not treat its
outputs as structural certification, a safety case, or a hardware control
system.

License selection remains open and should be resolved before external reuse is
invited.
