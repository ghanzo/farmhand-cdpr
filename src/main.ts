import './styles.css';
import { createInitialState } from './app/state';
import { createFarmGeometry } from './cdpr/geometry';
import { solveCableKinematics } from './cdpr/kinematics';
import { solveReelState } from './cdpr/reel-model';
import { solveStaticTensions } from './cdpr/tension-solver';
import { FARM_OPERATIONS, getOperation, type OperationId } from './farm/operations';
import { estimateThroughput } from './farm/throughput';
import { magnitude } from './math/vector';
import { advanceMotion } from './simulation/controller';
import type { CableConfiguration, FarmGeometry, Vec3 } from './types';
import { FarmScene } from './visualization/scene';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Application root was not found.');
const baseUrl = import.meta.env.BASE_URL;

root.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="./" aria-label="Farmhand CDPR home">
        <span class="brand-mark" aria-hidden="true">FH</span>
        <span>
          <strong>Farmhand</strong>
          <small>Cable-driven field robotics</small>
        </span>
      </a>
      <div class="topbar-status">
        <span class="status-dot" id="status-dot" aria-hidden="true"></span>
        <span id="system-status">Evaluating workspace</span>
      </div>
      <nav aria-label="Project links">
        <a href="#research">Research</a>
        <a href="https://github.com/ghanzo/farmhand-cdpr/blob/main/docs/farm-concept.md">Concept</a>
        <a href="https://github.com/ghanzo/farmhand-cdpr">GitHub</a>
      </nav>
    </header>

    <section class="vision-intro" aria-labelledby="vision-title">
      <div class="vision-hero">
        <img
          src="${baseUrl}vision/farmhand-12-cable-field.webp"
          alt="Aerial concept visualization of a twelve-cable Farmhand robot spanning an entire multi-field farm"
          width="1536"
          height="864"
          fetchpriority="high"
        />
        <div class="vision-hero-shade" aria-hidden="true"></div>
        <div class="vision-hero-copy">
          <p class="eyebrow">A new field architecture</p>
          <h1 id="vision-title">Farming beyond<br><em>tractor-defined rows.</em></h1>
          <p>Four towers and a twelve-cable high/low geometry move one intelligent carrier above a living field—bringing sensing and precision tools to each plant without routinely driving heavy equipment across the soil.</p>
          <div class="vision-actions">
            <a class="hero-link hero-link-primary" href="#simulator">Enter the simulator</a>
            <a class="hero-link" href="https://github.com/ghanzo/farmhand-cdpr/blob/main/docs/farm-concept.md">Read the concept</a>
          </div>
          <span class="concept-label">Concept visualization · 12-cable Farmhand research configuration</span>
        </div>
      </div>

      <div class="vision-story">
        <figure>
          <img
            src="${baseUrl}vision/farmhand-high-low-carrier.webp"
            alt="Concept visualization of upper and lower tower cables stabilizing an elevated carrier with a rigid tool stage"
            width="1536"
            height="1024"
            loading="lazy"
          />
          <figcaption>Concept visualization · antagonistic cable geometry above the crop-clearance plane</figcaption>
        </figure>
        <div class="vision-story-copy">
          <p class="eyebrow">Macro reach. Plant precision.</p>
          <h2>One infrastructure.<br>Many kinds of field work.</h2>
          <p>Upper cables carry the moving mass. Lower cables pull against them to create preload and bidirectional constraint. A rigid stage then solves the final metres without lowering the farm-scale cable network into the crop.</p>
          <ol class="vision-principles">
            <li><strong>Separate upper and lower anchors</strong><span>The carrier remains between the anchor planes so positive preload can resist disturbance.</span></li>
            <li><strong>Protect a clear working envelope</strong><span>Every lower cable stays above the crop, access, sag, and motion allowance.</span></li>
            <li><strong>Compare before committing</strong><span>The simulator exposes 8, 12, and 16-cable studies rather than presenting one topology as settled.</span></li>
          </ol>
        </div>
      </div>
    </section>

    <section class="research-evidence" id="research" aria-labelledby="research-title">
      <div class="research-heading">
        <div>
          <p class="eyebrow">Published evidence → Farmhand hypothesis</p>
          <h2 id="research-title">Design the workspace.<br><em>Then draw the machine.</em></h2>
        </div>
        <p>Farmhand’s high/low cable study is grounded in cable-robot workspace, tension, stiffness, and large-span research. Published results are shown as evidence; the 12 and 16-cable layouts remain design hypotheses to test.</p>
      </div>

      <div class="paper-figures">
        <figure class="paper-figure">
          <img src="${baseUrl}research/agrocablebot-reconfigurable-workspace.png" alt="AgroCableBot reconfigurable cable robot and expanded workspace diagram" width="1440" height="620" loading="lazy" />
          <figcaption>
            <span>Published configuration</span>
            <strong>Movable proximal anchors reshape the reachable volume.</strong>
            <small>Adapted crop of Figure 3 from García-Vanegas et al., <a href="https://doi.org/10.3390/robotics12060165">AgroCableBot</a>, Robotics 2023. CC BY 4.0.</small>
          </figcaption>
        </figure>
        <figure class="paper-figure">
          <img src="${baseUrl}research/agrocablebot-workspace-tension.png" alt="AgroCableBot three-dimensional workspace and cable tension distribution" width="1560" height="620" loading="lazy" />
          <figcaption>
            <span>Published result</span>
            <strong>Workspace and tension must be evaluated together.</strong>
            <small>Adapted crop of Figure 11 from García-Vanegas et al., <a href="https://doi.org/10.3390/robotics12060165">AgroCableBot</a>, Robotics 2023. CC BY 4.0.</small>
          </figcaption>
        </figure>
      </div>

      <div class="finding-grid">
        <article>
          <span class="finding-index">01</span>
          <p class="eyebrow">Wrench closure</p>
          <h3>Eight cables are a beginning, not a guarantee.</h3>
          <p>For six-degree-of-freedom constraint, the wrench matrix must be full rank and admit positive internal tension. Cable count alone cannot establish rigidity.</p>
          <a href="https://www.lirmm.fr/~krut/pdf/2008_gouttefarde_ark-1697187840/2008_gouttefarde_ark.pdf">Gouttefarde et al. →</a>
        </article>
        <article>
          <span class="finding-index">02</span>
          <p class="eyebrow">Preload</p>
          <h3>More tension is not always more stiffness.</h3>
          <p>Internal forces can raise stiffness in stabilizable poses and reduce it in others. Farmhand therefore displays a weakest-direction authority proxy while reserving true stiffness for later elastic modeling.</p>
          <a href="https://doi.org/10.1016/j.robot.2019.01.012">Bolboli et al. →</a>
        </article>
        <article>
          <span class="finding-index">03</span>
          <p class="eyebrow">Large span</p>
          <h3>Sag becomes part of the mechanism.</h3>
          <p>At field scale, cable mass, elasticity, wind, and catenary clearance can dominate the straight-line geometry used in an early simulator.</p>
          <a href="https://doi.org/10.3390/machines10070565">Zhang et al. →</a>
        </article>
      </div>

      <div class="architecture-study" aria-labelledby="architecture-title">
        <div class="architecture-copy">
          <p class="eyebrow">Farmhand configuration study</p>
          <h2 id="architecture-title">From minimum constraint<br>to active redundancy.</h2>
          <p>Twelve independently controlled cables—two upper and one lower at each tower—are the working hypothesis. Sixteen cable drives remain the heavy-duty branch for stronger bidirectional wrench authority, stiffness tuning, and cable-failure research.</p>
        </div>
        <div class="architecture-cards">
          <article>
            <span class="architecture-number">08</span>
            <strong>Baseline</strong>
            <p>1 upper + 1 lower per tower</p>
            <small>Lowest complexity · limited redundancy</small>
          </article>
          <article class="recommended">
            <span class="architecture-number">12</span>
            <strong>Working hypothesis</strong>
            <p>2 upper + 1 lower per tower</p>
            <small>More lift · active preload · manageable pilot</small>
          </article>
          <article>
            <span class="architecture-number">16</span>
            <strong>Heavy-duty study</strong>
            <p>2 upper + 2 lower per tower</p>
            <small>Maximum redundancy · highest system complexity</small>
          </article>
        </div>
      </div>
    </section>

    <main class="workspace" id="simulator">
      <aside class="control-panel" aria-label="Simulation controls">
        <div class="panel-intro">
          <p class="eyebrow">Pilot plot 01</p>
          <h2 class="panel-title">Test the<br><em>pilot geometry.</em></h2>
          <p>Compare high/low tower layouts while every active cable remains under positive tension.</p>
        </div>

        <section class="control-section">
          <div class="section-heading">
            <h2>Cable architecture</h2>
            <span id="drive-count">12 active drives</span>
          </div>
          <label class="sr-only" for="cable-configuration">Cable architecture</label>
          <select id="cable-configuration" class="select-control">
            <option value="8">8 cables · baseline</option>
            <option value="12" selected>12 cables · working hypothesis</option>
            <option value="16">16 cables · heavy-duty study</option>
          </select>
          <p class="control-note" id="architecture-description"></p>
        </section>

        <section class="control-section">
          <div class="section-heading">
            <h2>Operation</h2>
            <span id="operation-force">0 N reaction</span>
          </div>
          <label class="sr-only" for="operation">Farm operation</label>
          <select id="operation" class="select-control">
            ${FARM_OPERATIONS.map((operation) => `<option value="${operation.id}">${operation.label}</option>`).join('')}
          </select>
          <p class="control-note" id="operation-description"></p>
        </section>

        <section class="control-section control-grid">
          ${rangeControl('field-size', 'Plot width', 8, 24, 1, 10, 'm')}
          ${rangeControl('tower-height', 'Upper anchor', 6, 18, 0.5, 9, 'm')}
          ${rangeControl('lower-anchor-height', 'Lower anchor', 2.5, 6, 0.1, 3.5, 'm')}
          ${rangeControl('carrier-height', 'Carrier height', 3, 12, 0.1, 5.5, 'm')}
          ${rangeControl('stage-extension', 'Tool stage', 0.8, 7, 0.1, 4.5, 'm')}
          ${rangeControl('payload', 'Moving mass', 35, 260, 5, 85, 'kg')}
          ${rangeControl('speed', 'Travel speed', 0.4, 4, 0.1, 1.8, 'm/s')}
        </section>

        <div class="control-actions">
          <button type="button" id="survey">Run survey path</button>
          <button type="button" id="center">Return center</button>
          <button type="button" id="pause" class="quiet">Pause</button>
        </div>

        <p class="interaction-hint">Click the field to set a target. Drag to orbit. Scroll to zoom.</p>
      </aside>

      <section class="scene-panel" aria-label="Three-dimensional farm simulation">
        <canvas id="farm-canvas"></canvas>
        <div class="scene-label scene-label-top">
          <span>Carrier position</span>
          <strong id="position-readout">0.0 · 5.5 · 0.0 m</strong>
        </div>
        <div class="scene-label scene-label-bottom">
          <span>Architecture</span>
          <strong id="architecture-readout">4 towers · 12 cables · high/low anchors</strong>
        </div>
      </section>

      <aside class="telemetry-panel" aria-label="Engineering telemetry">
        <section>
          <p class="eyebrow">Live model</p>
          <h2>Engineering telemetry</h2>
          <div class="metric-grid">
            ${metric('peak-tension', 'Peak tension', '—', 'N')}
            ${metric('residual', 'Wrench residual', '—', 'N')}
            ${metric('speed-metric', 'Carrier speed', '—', 'm/s')}
            ${metric('pass-time', 'Estimated pass', '—', 'h')}
            ${metric('stiffness-proxy', 'Rigidity proxy', '—', '')}
          </div>
        </section>

        <section class="cable-section">
          <div class="section-heading">
            <h2>Cable state</h2>
            <span>band · length · tension</span>
          </div>
          <div id="cable-list" class="cable-list"></div>
        </section>

        <section class="assumption-box">
          <p class="eyebrow">Model boundary</p>
          <p>This release solves rigid-body geometry and static positive-tension allocation. Sag, elasticity, wind, structural deflection, and closed-loop control remain research stages.</p>
        </section>
      </aside>
    </main>
  </div>
`;

const simulator = createInitialState();
let geometry: FarmGeometry = makeGeometry();
let pathQueue: Vec3[] = [];
let lastFrame = performance.now();
let lastUiUpdate = 0;

const canvas = getElement<HTMLCanvasElement>('farm-canvas');
const farmScene = new FarmScene(canvas);
farmScene.rebuild(geometry);
farmScene.setTargetHandler((point) => {
  pathQueue = [];
  simulator.target = { ...point, y: simulator.settings.carrierHeight };
});

createCableRows();
bindControls();
updateOperationCopy();
updateArchitectureCopy();
requestAnimationFrame(frame);

function frame(now: number): void {
  requestAnimationFrame(frame);
  const deltaSeconds = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
  lastFrame = now;

  if (!simulator.paused) {
    simulator.motion = advanceMotion(
      simulator.motion,
      simulator.target,
      {
        maxSpeed: simulator.settings.maxSpeed,
        maxAcceleration: simulator.settings.maxAcceleration,
      },
      deltaSeconds,
    );
    if (magnitude(simulator.motion.velocity) < 0.03 && distanceToTarget() < 0.04 && pathQueue.length) {
      const next = pathQueue.shift();
      if (next) simulator.target = next;
    }
  }

  simulator.pose.position = { ...simulator.motion.position };
  simulator.pose.rotation.roll = simulator.motion.velocity.z * 0.008;
  simulator.pose.rotation.pitch = -simulator.motion.velocity.x * 0.008;

  const cableStates = solveCableKinematics(geometry, simulator.pose);
  const operation = getOperation(simulator.settings.operation);
  const conservativeMass = simulator.settings.payloadKg + operation.reactionForceN / 9.80665;
  const tension = solveStaticTensions(cableStates, conservativeMass, simulator.settings.tensionBounds);
  farmScene.update(
    simulator.pose,
    cableStates,
    tension.tensions,
    simulator.settings.stageExtension,
    operation,
    simulator.target,
  );
  farmScene.render();

  if (now - lastUiUpdate > 100) {
    lastUiUpdate = now;
    updateTelemetry(cableStates, tension.tensions, tension.residual, tension.feasible, tension.stiffnessProxy);
  }
}

function bindControls(): void {
  getElement<HTMLSelectElement>('cable-configuration').addEventListener('change', (event) => {
    simulator.settings.cableConfiguration = Number((event.currentTarget as HTMLSelectElement).value) as CableConfiguration;
    rebuildGeometry();
    updateArchitectureCopy();
  });

  getElement<HTMLSelectElement>('operation').addEventListener('change', (event) => {
    simulator.settings.operation = (event.currentTarget as HTMLSelectElement).value as OperationId;
    updateOperationCopy();
  });

  bindRange('field-size', (value) => {
    simulator.settings.fieldSize = value;
    rebuildGeometry();
    simulator.target.x = clamp(simulator.target.x, -value / 2 + 0.5, value / 2 - 0.5);
    simulator.target.z = clamp(simulator.target.z, -value / 2 + 0.5, value / 2 - 0.5);
  });
  bindRange('tower-height', (value) => {
    simulator.settings.towerHeight = value;
    rebuildGeometry();
  });
  bindRange('lower-anchor-height', (value) => {
    simulator.settings.lowerAnchorHeight = value;
    rebuildGeometry();
  });
  bindRange('carrier-height', (value) => {
    simulator.settings.carrierHeight = value;
    simulator.target.y = value;
  });
  bindRange('stage-extension', (value) => {
    simulator.settings.stageExtension = value;
  });
  bindRange('payload', (value) => {
    simulator.settings.payloadKg = value;
  });
  bindRange('speed', (value) => {
    simulator.settings.maxSpeed = value;
  });

  getElement<HTMLButtonElement>('center').addEventListener('click', () => {
    pathQueue = [];
    simulator.target = { x: 0, y: simulator.settings.carrierHeight, z: 0 };
  });
  getElement<HTMLButtonElement>('survey').addEventListener('click', () => {
    const edge = simulator.settings.fieldSize / 2 - 1;
    const y = simulator.settings.carrierHeight;
    pathQueue = [
      { x: edge, y, z: -edge },
      { x: -edge, y, z: -edge },
      { x: -edge, y, z: 0 },
      { x: edge, y, z: 0 },
      { x: edge, y, z: edge },
      { x: -edge, y, z: edge },
      { x: 0, y, z: 0 },
    ];
    simulator.target = pathQueue.shift() ?? simulator.target;
  });
  getElement<HTMLButtonElement>('pause').addEventListener('click', (event) => {
    simulator.paused = !simulator.paused;
    (event.currentTarget as HTMLButtonElement).textContent = simulator.paused ? 'Resume' : 'Pause';
  });
}

function updateTelemetry(
  cableStates: ReturnType<typeof solveCableKinematics>,
  tensions: number[],
  residual: number,
  feasible: boolean,
  stiffnessProxy: number,
): void {
  const operation = getOperation(simulator.settings.operation);
  const throughput = estimateThroughput(
    simulator.settings.plantCount,
    operation.secondsPerPlant,
    simulator.settings.simultaneousTools,
  );
  const velocity = simulator.motion.velocity;
  const peakTension = Math.max(...tensions, 0);
  setText('peak-tension', peakTension.toFixed(0));
  setText('residual', residual.toFixed(1));
  setText('speed-metric', magnitude(velocity).toFixed(2));
  setText('pass-time', throughput.hoursPerPass.toFixed(1));
  setText('stiffness-proxy', stiffnessProxy.toFixed(2));
  setText(
    'position-readout',
    `${simulator.motion.position.x.toFixed(1)} · ${simulator.motion.position.y.toFixed(1)} · ${simulator.motion.position.z.toFixed(1)} m`,
  );

  const status = getElement<HTMLElement>('system-status');
  const statusDot = getElement<HTMLElement>('status-dot');
  const stageClearance = simulator.motion.position.y - simulator.settings.stageExtension;
  const carrierAboveLowerBand = simulator.motion.position.y > simulator.settings.lowerAnchorHeight + 0.5;
  const safe = feasible && stageClearance > 0.25 && carrierAboveLowerBand;
  status.textContent = safe
    ? 'Pose is tension-feasible'
    : stageClearance <= 0.25
      ? 'Tool stage intersects ground'
      : !carrierAboveLowerBand
        ? 'Carrier is below the lower-cable working plane'
        : 'Pose exceeds tension model';
  statusDot.classList.toggle('warning', !safe);

  cableStates.forEach((cableState, index) => {
    const row = getElement<HTMLElement>(`cable-${index}`);
    const tension = tensions[index] ?? 0;
    const rate = cableState.jacobianRow[0] * velocity.x
      + cableState.jacobianRow[1] * velocity.y
      + cableState.jacobianRow[2] * velocity.z;
    const reel = solveReelState(cableState.length, rate);
    const fill = row.querySelector<HTMLElement>('.cable-fill');
    const value = row.querySelector<HTMLElement>('.cable-value');
    const meta = row.querySelector<HTMLElement>('.cable-meta');
    if (fill) fill.style.width = `${Math.min(100, (tension / simulator.settings.tensionBounds.max) * 100)}%`;
    if (value) value.textContent = `${tension.toFixed(0)} N`;
    if (meta) meta.textContent = `${cableState.length.toFixed(2)} m · ${Math.abs(reel.rpm).toFixed(1)} rpm`;
  });
}

function createCableRows(): void {
  const list = getElement<HTMLElement>('cable-list');
  list.innerHTML = geometry.cables.map((cable, index) => `
    <div class="cable-row" id="cable-${index}">
      <span class="cable-id">${cable.id}${cable.band === 'upper' ? 'U' : 'L'}</span>
      <span class="cable-track"><span class="cable-fill" style="--cable-color: ${cable.band === 'upper' ? '#e4c65d' : '#70c1b3'}"></span></span>
      <span class="cable-value">— N</span>
      <span class="cable-meta">— m · — rpm</span>
    </div>
  `).join('');
}

function updateArchitectureCopy(): void {
  const count = simulator.settings.cableConfiguration;
  const descriptions: Record<CableConfiguration, string> = {
    8: 'One upper and one lower cable per tower: the lowest-complexity high/low baseline.',
    12: 'Two upper and one lower cable per tower: the current balance of lift, preload, and pilot complexity.',
    16: 'Two upper and two lower cables per tower: maximum active redundancy for the heavy-duty study.',
  };
  setText('drive-count', `${count} active drives`);
  setText('architecture-description', descriptions[count]);
  setText('architecture-readout', `4 towers · ${count} cables · high/low anchors`);
}

function rebuildGeometry(): void {
  geometry = makeGeometry();
  farmScene.rebuild(geometry);
  createCableRows();
}

function updateOperationCopy(): void {
  const operation = getOperation(simulator.settings.operation);
  setText('operation-force', `${operation.reactionForceN} N reaction`);
  setText(
    'operation-description',
    `${operation.description}${operation.requiresBrace ? ' Ground bracing is recommended.' : ''}`,
  );
}

function makeGeometry(): FarmGeometry {
  return createFarmGeometry({
    fieldWidth: simulator.settings.fieldSize,
    fieldLength: simulator.settings.fieldSize,
    towerHeight: simulator.settings.towerHeight,
    lowerAnchorHeight: simulator.settings.lowerAnchorHeight,
    cableConfiguration: simulator.settings.cableConfiguration,
  });
}

function bindRange(id: string, update: (value: number) => void): void {
  const input = getElement<HTMLInputElement>(id);
  const output = getElement<HTMLOutputElement>(`${id}-out`);
  input.addEventListener('input', () => {
    const value = Number(input.value);
    update(value);
    output.value = `${formatRangeValue(value)} ${input.dataset.unit ?? ''}`;
  });
}

function rangeControl(
  id: string,
  label: string,
  minimum: number,
  maximum: number,
  step: number,
  value: number,
  unit: string,
): string {
  return `
    <label class="range-control" for="${id}">
      <span>${label}<output id="${id}-out">${formatRangeValue(value)} ${unit}</output></span>
      <input id="${id}" data-unit="${unit}" type="range" min="${minimum}" max="${maximum}" step="${step}" value="${value}" />
    </label>
  `;
}

function metric(id: string, label: string, value: string, unit: string): string {
  return `<div class="metric"><span>${label}</span><strong><span id="${id}">${value}</span> <small>${unit}</small></strong></div>`;
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element: ${id}`);
  return element as T;
}

function setText(id: string, text: string): void {
  getElement<HTMLElement>(id).textContent = text;
}

function formatRangeValue(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function distanceToTarget(): number {
  const dx = simulator.target.x - simulator.motion.position.x;
  const dy = simulator.target.y - simulator.motion.position.y;
  const dz = simulator.target.z - simulator.motion.position.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
