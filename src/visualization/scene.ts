import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FarmOperation } from '../farm/operations';
import type { CableKinematicState, FarmGeometry, Pose, Vec3 } from '../types';

const CABLE_COLORS = [
  0xffc857,
  0xf68e5f,
  0x70c1b3,
  0x57a6d9,
  0xc59bff,
  0xe66f91,
  0xa6d96a,
  0xf2c14e,
];

export class FarmScene {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly fieldGroup = new THREE.Group();
  private readonly towerGroup = new THREE.Group();
  private readonly cropGroup = new THREE.Group();
  private readonly cableGroup = new THREE.Group();
  private readonly carrier = new THREE.Group();
  private readonly cableLines: THREE.Line[] = [];
  private readonly groundTarget = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.29, 32),
    new THREE.MeshBasicMaterial({ color: 0xf4c95d, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
  );
  private readonly verticalStage: THREE.Mesh;
  private readonly toolHead: THREE.Mesh;
  private readonly clickPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  private activeGeometry?: FarmGeometry;
  private onTarget?: (target: Vec3) => void;
  private pointerStart?: { x: number; y: number };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0b1711, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera.position.set(15, 12, 17);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 2.6, 0);
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.minDistance = 7;
    this.controls.maxDistance = 42;

    this.scene.fog = new THREE.Fog(0x0b1711, 30, 72);
    this.scene.add(new THREE.HemisphereLight(0xddebdc, 0x18251b, 2.2));
    const sun = new THREE.DirectionalLight(0xfff4d6, 3.3);
    sun.position.set(-9, 18, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    this.scene.add(sun);

    this.scene.add(this.fieldGroup, this.cropGroup, this.towerGroup, this.cableGroup, this.carrier);
    this.groundTarget.rotation.x = -Math.PI / 2;
    this.groundTarget.position.y = 0.035;
    this.scene.add(this.groundTarget);
    this.clickPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.clickPlane);

    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.24, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xe4c65d, roughness: 0.52, metalness: 0.36 }),
    );
    deck.castShadow = true;
    deck.receiveShadow = true;
    const equipment = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.44, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x1e3327, roughness: 0.68, metalness: 0.18 }),
    );
    equipment.position.y = 0.34;
    equipment.castShadow = true;
    this.verticalStage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 1, 14),
      new THREE.MeshStandardMaterial({ color: 0xcbd4c9, roughness: 0.34, metalness: 0.72 }),
    );
    this.toolHead = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x6dd7ff, emissive: 0x163f4c, roughness: 0.35 }),
    );
    this.carrier.add(deck, equipment, this.verticalStage, this.toolHead);

    for (let index = 0; index < 8; index += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const material = new THREE.LineBasicMaterial({ color: CABLE_COLORS[index] ?? 0xffffff, transparent: true, opacity: 0.92 });
      const line = new THREE.Line(geometry, material);
      this.cableLines.push(line);
      this.cableGroup.add(line);
    }

    this.canvas.addEventListener('pointerdown', this.handlePointerStart);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', () => {
      this.pointerStart = undefined;
    });
    const observer = new ResizeObserver(() => this.resize());
    observer.observe(this.canvas.parentElement ?? this.canvas);
    this.resize();
  }

  setTargetHandler(handler: (target: Vec3) => void): void {
    this.onTarget = handler;
  }

  rebuild(geometry: FarmGeometry): void {
    this.activeGeometry = geometry;
    clearGroup(this.fieldGroup);
    clearGroup(this.towerGroup);
    clearGroup(this.cropGroup);

    const apron = new THREE.Mesh(
      new THREE.PlaneGeometry(geometry.fieldWidth + 7, geometry.fieldLength + 7),
      new THREE.MeshStandardMaterial({ color: 0x1a2a20, roughness: 1 }),
    );
    apron.rotation.x = -Math.PI / 2;
    apron.receiveShadow = true;
    this.fieldGroup.add(apron);

    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(geometry.fieldWidth, geometry.fieldLength),
      new THREE.MeshStandardMaterial({ color: 0x3f5534, roughness: 1 }),
    );
    field.rotation.x = -Math.PI / 2;
    field.position.y = 0.012;
    field.receiveShadow = true;
    this.fieldGroup.add(field);

    const grid = new THREE.GridHelper(
      Math.max(geometry.fieldWidth, geometry.fieldLength),
      Math.round(Math.max(geometry.fieldWidth, geometry.fieldLength)),
      0x81936d,
      0x536247,
    );
    grid.position.y = 0.026;
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.24;
    this.fieldGroup.add(grid);

    geometry.towers.forEach((tower) => {
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, tower.height, 10),
        new THREE.MeshStandardMaterial({ color: 0x738178, roughness: 0.5, metalness: 0.55 }),
      );
      mast.position.set(tower.position.x, tower.height / 2, tower.position.z);
      mast.castShadow = true;
      const footing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.52, 0.22, 10),
        new THREE.MeshStandardMaterial({ color: 0x4f5b52, roughness: 0.8 }),
      );
      footing.position.set(tower.position.x, 0.11, tower.position.z);
      footing.receiveShadow = true;
      this.towerGroup.add(mast, footing);
    });

    geometry.cables.forEach((cable, index) => {
      const pulley = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 8),
        new THREE.MeshStandardMaterial({
          color: CABLE_COLORS[index] ?? 0xffffff,
          emissive: CABLE_COLORS[index] ?? 0xffffff,
          emissiveIntensity: 0.18,
        }),
      );
      pulley.position.set(cable.anchor.x, cable.anchor.y, cable.anchor.z);
      this.towerGroup.add(pulley);
    });

    addMixedPlanting(this.cropGroup, geometry.fieldWidth, geometry.fieldLength);
    this.clickPlane.scale.set(geometry.fieldWidth / 200, geometry.fieldLength / 200, 1);
  }

  update(
    pose: Pose,
    cableStates: CableKinematicState[],
    tensions: number[],
    stageExtension: number,
    operation: FarmOperation,
    target: Vec3,
  ): void {
    this.carrier.position.set(pose.position.x, pose.position.y, pose.position.z);
    this.carrier.rotation.set(pose.rotation.roll, pose.rotation.yaw, pose.rotation.pitch);
    this.verticalStage.scale.y = stageExtension;
    this.verticalStage.position.y = -stageExtension / 2 - 0.16;
    this.toolHead.position.y = -stageExtension - 0.2;
    const toolMaterial = this.toolHead.material as THREE.MeshStandardMaterial;
    toolMaterial.color.setHex(operation.toolColor);
    toolMaterial.emissive.setHex(operation.toolColor).multiplyScalar(0.22);
    this.groundTarget.position.set(target.x, 0.035, target.z);

    cableStates.forEach((state, index) => {
      const line = this.cableLines[index];
      if (!line) return;
      line.geometry.setFromPoints([
        new THREE.Vector3(state.cable.anchor.x, state.cable.anchor.y, state.cable.anchor.z),
        new THREE.Vector3(state.attachmentWorld.x, state.attachmentWorld.y, state.attachmentWorld.z),
      ]);
      const material = line.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + 0.5 * Math.min(1, (tensions[index] ?? 0) / 1_800);
    });
  }

  render(): void {
    const elapsed = performance.now() / 1000;
    this.groundTarget.rotation.z = elapsed * 0.45;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private readonly handlePointerStart = (event: PointerEvent): void => {
    if (event.button === 0) this.pointerStart = { x: event.clientX, y: event.clientY };
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.activeGeometry || !this.onTarget || event.button !== 0 || !this.pointerStart) return;
    const moved = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
    this.pointerStart = undefined;
    if (moved > 5) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.clickPlane, false)[0];
    if (!hit) return;
    const halfX = this.activeGeometry.fieldWidth / 2 - 0.5;
    const halfZ = this.activeGeometry.fieldLength / 2 - 0.5;
    this.onTarget({
      x: THREE.MathUtils.clamp(hit.point.x, -halfX, halfX),
      y: 0,
      z: THREE.MathUtils.clamp(hit.point.z, -halfZ, halfZ),
    });
  };

  private resize(): void {
    const parent = this.canvas.parentElement;
    const width = Math.max(1, parent?.clientWidth ?? this.canvas.clientWidth);
    const height = Math.max(1, parent?.clientHeight ?? this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}

function clearGroup(group: THREE.Group): void {
  for (const child of [...group.children]) {
    child.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    group.remove(child);
  }
}

function addMixedPlanting(group: THREE.Group, width: number, length: number): void {
  const crops = [
    { color: 0x6e9f4f, height: 0.42, radius: 0.16 },
    { color: 0xa9bd55, height: 0.3, radius: 0.2 },
    { color: 0x4f8548, height: 0.56, radius: 0.13 },
    { color: 0xb08b58, height: 0.34, radius: 0.18 },
  ];
  const count = Math.max(80, Math.round(width * length * 1.35));
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const radius = Math.sqrt((index + 0.5) / count);
    const angle = index * goldenAngle;
    const x = Math.cos(angle) * radius * width * 0.46;
    const z = Math.sin(angle) * radius * length * 0.46;
    const crop = crops[index % crops.length];
    if (!crop) continue;
    const plant = new THREE.Mesh(
      new THREE.ConeGeometry(crop.radius, crop.height, 6),
      new THREE.MeshStandardMaterial({ color: crop.color, roughness: 0.92 }),
    );
    plant.position.set(x, crop.height / 2 + 0.03, z);
    plant.rotation.y = angle;
    plant.castShadow = true;
    group.add(plant);
  }
}
