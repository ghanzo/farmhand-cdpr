# SkyCam Sim

**▶ Live demo: https://ghanzo.github.io/Skycam-Sim--V1Motor/**

A browser simulator of an NFL-style SkyCam: a camera suspended over the field on
four cables, positioned by paying cable in and out from motorized reels at the
stadium corners.

Click anywhere on the field and the camera flies there **at constant speed** —
while four live motor readouts and a strip chart show each cable paying out at
its own **continuously changing, non-linear rate**. That contrast is the entire
point of the project: simple camera motion demands non-trivial motor control.

![nfl-camera](https://user-images.githubusercontent.com/22437742/196407908-cf30e197-1789-40a8-95c8-85206209ca5d.jpg)

## The math (v2 — 3D, all four motors)

Towers hold the cable ends at fixed anchor points **T<sub>i</sub>**; the camera
is at **P** = (x, y, z). Each cable length is 3D Pythagoras:

```
Lᵢ = |P − Tᵢ| = √( (x−xᵢ)² + (y−yᵢ)² + (z−zᵢ)² )
```

When the camera moves with velocity **v**, the required payout rate of each
motor is the projection of that motion onto the cable direction:

```
dLᵢ/dt = ( (P − Tᵢ) · v ) / Lᵢ
```

A straight, constant-speed camera path therefore requires four different motor
speeds, all changing continuously through the move.

**Stepper quantization** uses the v1 rule: the motor takes its next step only
when that step lands *closer* to the ideal cable length than staying put, so the
cable is never more than half a step (~2.5 cm) from ideal. Small steps at high
rates → visually smooth motion.

*Simplification: cables are modeled as straight lines (no catenary sag). Real
rigs compensate for sag and cable stretch — that's v3 territory.*

## Using the sim

- **Click the field** — camera flies to that spot at constant speed
- **Drag / scroll** — orbit and zoom the view
- **Speed & height sliders** — travel speed (yd/s) and rig altitude (yd)
- **v1 pass** — replays the original demo: one straight midfield pass
- **Lap** — tours the four corners
- Motor panel shows each cable's length, signed payout rate (+ out / − in), and
  step frequency; the chart traces payout rates over the last 30 s

Implementation: a single `index.html` — Three.js (pinned CDN) for the 3D scene,
a hand-rolled canvas strip chart, no build step. Units are yards; the field is a
regulation 120 × 53.3 yd.

## v1 (2022) — where this started

Version 1 reduced the problem to its essence: **one motor, one straight-line
translation, in 2D**, animated with Python turtle graphics. The camera moved at a
constant rate while the top-right motor's step rate changed non-linearly through
the translation. The original write-up, math images, and code are preserved in
[`/v1`](./v1/).

- v1 on Replit: https://replit.com/@gonzo/movement-via-time#main.py
- v1 math on Desmos: https://www.desmos.com/calculator/h2k6fdmklq
