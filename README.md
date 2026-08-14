# SkyCam Sim

**▶ Live demo: https://ghanzo.github.io/Skycam-Sim--V1Motor/**

A browser simulator of a **cable-driven parallel robot (CDPR)** in the SkyCam
configuration: a platform suspended over the field on four cables, positioned
by paying cable in and out from motorized winches at the corners. The same
architecture scales from broadcast cameras to warehouse cranes (NIST's
RoboCrane) to field robots — a gondola that can carry a camera today and a
tool later.

Click anywhere on the field and the camera flies there **at constant speed** —
while four live motor readouts and a strip chart show each cable paying out at
its own **continuously changing, non-linear rate**. That contrast is the entire
point of the project: simple camera motion demands non-trivial motor control.

![nfl-camera](https://user-images.githubusercontent.com/22437742/196407908-cf30e197-1789-40a8-95c8-85206209ca5d.jpg)

## The math (v3 — motion profiles, dynamics, slack, reels)

Towers hold the cable ends at fixed anchor points **T<sub>i</sub>**; the
commanded camera position is **P** = (x, y, z). Each cable length is 3D
Pythagoras, and the payout rate is the motion projected onto the cable:

```
Lᵢ = |P − Tᵢ|            dLᵢ/dt = ( (P − Tᵢ) · v ) / Lᵢ
```

**Motion profile** — the rig accelerates at a capped rate and its speed is
governed so it can always brake to the target:

```
|v| ≤ min( vmax, √(2 · a · d_remaining) )
```

Retargeting mid-flight just bends the trajectory — no precomputed profile.

**Gondola dynamics** — the rendered gondola is a damped spring chasing the
commanded point (`ẍ = ω²(P_cmd − x) − 2ζω·ẋ`), softer horizontally than
vertically, so it lags under acceleration, swings through stops, and bobs as it
settles. A faint ghost dot marks the commanded position the winches track.

**Slack & sag** — winches pay cable for the *commanded* chord; when the
swinging gondola ends up nearer a tower than commanded, that cable has excess
length and droops with the parabolic catenary approximation:

```
slackᵢ = L_paid,ᵢ − |P_vis − Tᵢ|        sag ≈ √( 3 · D · slack / 8 )
```

The motor panel flags each cable taut / slack live.

**Reel geometry** — each winch drum (0.35 yd core, 8 mm cable, 38 wraps per
layer, 300 yd capacity) converts line speed to drum RPM through the effective
radius of the working layer:

```
r_eff = r_core + layer · d_cable        RPM = 60 · |dL/dt| / (2π · r_eff)
```

Same line speed on a different layer → different RPM. That's why real winches
encoder the cable, not just the motor.

**Rigidity** — cables only pull, so a 4-cable suspended CDPR leans on gravity
as its antagonist and its stiffness scales with cable tension. The Rigidity
slider stands in for tension + control gain (vertical is held near critical
damping so altitude only changes when commanded). Real-world rigidity upgrades,
in rough order: higher preload tension, heavier platform, more cables pulling
against each other (RoboCrane's 6-cable Stewart-style geometry; 8-cable CDPRs
constrain all 6 DOF), input shaping so commands never excite the swing modes,
and a self-stabilized end effector for the last few centimeters of precision.

## Using the sim

- **Click the field** — camera flies there under the acceleration profile
- **Drag / scroll** — orbit and zoom the view
- **Speed / Accel / Height sliders** — vmax (yd/s), amax (yd/s²), altitude (yd)
- **v1 pass** — replays the original demo: one straight midfield pass
- **3D lap** — tours the corners with altitude changes (full x/y/z motion)
- **Stop** — brakes at the accel limit; watch the gondola swing and the near
  cables drop slack
- Motor panel: cable paid out, signed payout rate (+ out / − in), drum RPM +
  working layer, taut/slack state; the chart traces payout rates (last 30 s)

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
