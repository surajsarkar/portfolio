import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface CosmicBackgroundProps {
  /** Relative density of stars (default 1) */
  density?: number;
  /** Mouse parallax strength 0–1 */
  mouseParallax?: number;
  /** Continuous drift speed */
  drift?: number;
  /** Soft green nebula haze */
  nebula?: boolean;
  /** Accent color hex for nebula / bright stars */
  accent?: string;
  /** Extra class on wrapper */
  className?: string;
  /** Fixed full-viewport vs absolute fill */
  fixed?: boolean;
  /** Opacity of the canvas layer */
  opacity?: number;
}

/**
 * GPU starfield: layered points, subtle nebula, smooth mouse/time drift.
 * Renders transparent so section backgrounds show through.
 */
const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  density = 1,
  mouseParallax = 0.35,
  drift = 1,
  nebula = true,
  accent = '#53d22d',
  className = '',
  fixed = false,
  opacity = 1,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersLowPower =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

    const starMultiplier = prefersLowPower ? 0.55 : 1;
    const farCount = Math.floor(1800 * density * starMultiplier);
    const midCount = Math.floor(900 * density * starMultiplier);
    const nearCount = Math.floor(280 * density * starMultiplier);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, prefersLowPower ? 1.25 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    // Soft circular star texture
    const starTexture = (() => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
      g.addColorStop(0.55, 'rgba(200,220,255,0.25)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();

    const accentColor = new THREE.Color(accent);
    const white = new THREE.Color(0xffffff);
    const warm = new THREE.Color(0xfffae6);
    const cool = new THREE.Color(0xe6f0ff);

    const makeStarLayer = (
      count: number,
      spread: number,
      size: number,
      opacityBase: number,
      zJitter: number
    ) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Mild band bias for milky-way feel
        const band = Math.random() < 0.72;
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = band
          ? (Math.random() - 0.5) * spread * 0.38 + (Math.random() - 0.5) * spread * 0.12
          : (Math.random() - 0.5) * spread;
        positions[i3 + 2] = (Math.random() - 0.5) * zJitter;

        const roll = Math.random();
        let c = white;
        if (roll > 0.97) c = accentColor;
        else if (roll > 0.9) c = warm;
        else if (roll > 0.82) c = cool;

        const brightness = 0.55 + Math.random() * 0.45;
        colors[i3] = c.r * brightness;
        colors[i3 + 1] = c.g * brightness;
        colors[i3 + 2] = c.b * brightness;
        sizes[i] = size * (0.6 + Math.random() * 0.9);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: starTexture },
          uOpacity: { value: opacityBase },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uTime: { value: 0 },
          uTwinkle: { value: reduceMotion ? 0 : 1 },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float uPixelRatio;
          uniform float uTime;
          uniform float uTwinkle;

          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float twinkle = 1.0;
            if (uTwinkle > 0.5) {
              twinkle = 0.72 + 0.28 * sin(uTime * 1.7 + position.x * 12.0 + position.y * 9.0);
            }
            vAlpha = twinkle;
            gl_PointSize = aSize * uPixelRatio * (180.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uTexture;
          uniform float uOpacity;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vec4 tex = texture2D(uTexture, gl_PointCoord);
            float a = tex.a * uOpacity * vAlpha;
            if (a < 0.02) discard;
            gl_FragColor = vec4(vColor, a);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);
      return { points, material, geometry };
    };

    const far = makeStarLayer(farCount, 220, 0.9, 0.55, 80);
    const mid = makeStarLayer(midCount, 140, 1.4, 0.75, 50);
    const near = makeStarLayer(nearCount, 90, 2.2, 0.95, 30);

    // Soft nebula planes (billboards of additive haze)
    const nebulaMeshes: THREE.Mesh[] = [];
    if (nebula) {
      const nebulaGeo = new THREE.PlaneGeometry(90, 50);
      const makeNebula = (color: THREE.Color, x: number, y: number, z: number, rot: number, op: number) => {
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: op,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        // Soft falloff via canvas texture
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(128, 64, 10, 128, 64, 100);
        g.addColorStop(0, 'rgba(255,255,255,0.55)');
        g.addColorStop(0.4, 'rgba(255,255,255,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 128);
        mat.map = new THREE.CanvasTexture(c);
        mat.map.colorSpace = THREE.SRGBColorSpace;
        const mesh = new THREE.Mesh(nebulaGeo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.z = rot;
        scene.add(mesh);
        nebulaMeshes.push(mesh);
        return mesh;
      };

      makeNebula(accentColor.clone().multiplyScalar(0.35), -18, -8, -40, -0.25, 0.12);
      makeNebula(new THREE.Color(0x4a7cff).multiplyScalar(0.25), 22, 6, -55, 0.35, 0.08);
      makeNebula(accentColor.clone().multiplyScalar(0.2), 5, -18, -30, 0.1, 0.07);
    }

    // Soft lighting so metal / solar panels read in deep space
    const ambient = new THREE.AmbientLight(0xb0c4ff, 0.55);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff2e0, 1.15);
    sun.position.set(40, 25, 50);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x4a7cff, 0.35);
    fill.position.set(-30, -10, 20);
    scene.add(fill);

    // ---------- Craft: satellite + small ship (procedural meshes) ----------
    type CraftState = {
      group: THREE.Group;
      materials: THREE.Material[];
      geometries: THREE.BufferGeometry[];
      phase: number; // 0..1 progress along path
      duration: number;
      start: THREE.Vector3;
      end: THREE.Vector3;
      spin: number;
      baseScale: number;
      delay: number;
      kind: 'satellite' | 'ship';
    };

    const crafts: CraftState[] = [];
    const craftGeometries: THREE.BufferGeometry[] = [];
    const craftMaterials: THREE.Material[] = [];

    /** Per-craft material kit so fade opacity never leaks across vehicles */
    const makeMatKit = () => {
      const metal = new THREE.MeshStandardMaterial({
        color: 0x9aa3ad,
        metalness: 0.85,
        roughness: 0.35,
        emissive: 0x111418,
        emissiveIntensity: 0.15,
        transparent: true,
      });
      const metalDark = new THREE.MeshStandardMaterial({
        color: 0x4a5159,
        metalness: 0.9,
        roughness: 0.4,
        transparent: true,
      });
      const solar = new THREE.MeshStandardMaterial({
        color: 0x1a4a8c,
        metalness: 0.55,
        roughness: 0.25,
        emissive: 0x0a2a55,
        emissiveIntensity: 0.35,
        transparent: true,
      });
      const solarGrid = new THREE.MeshStandardMaterial({
        color: 0x2a6ab8,
        metalness: 0.4,
        roughness: 0.2,
        emissive: 0x124080,
        emissiveIntensity: 0.25,
        transparent: true,
      });
      const hull = new THREE.MeshStandardMaterial({
        color: 0xc8cdd3,
        metalness: 0.7,
        roughness: 0.45,
        transparent: true,
      });
      const thrusterMat = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 1.4,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      thrusterMat.userData.baseOpacity = 0.85;
      thrusterMat.userData.baseEmissive = 1.4;
      const accentMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(accent),
        emissive: new THREE.Color(accent),
        emissiveIntensity: 0.55,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
      });
      accentMat.userData.baseEmissive = 0.55;
      const gold = new THREE.MeshStandardMaterial({
        color: 0xc9a227,
        metalness: 0.95,
        roughness: 0.25,
        transparent: true,
      });
      const canopyMat = new THREE.MeshPhysicalMaterial({
        color: 0x88cfff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.55,
        thickness: 0.2,
        transparent: true,
        opacity: 0.85,
        emissive: 0x1a4060,
        emissiveIntensity: 0.3,
      });
      canopyMat.userData.baseOpacity = 0.85;
      canopyMat.userData.baseEmissive = 0.3;

      const all = [
        metal,
        metalDark,
        solar,
        solarGrid,
        hull,
        thrusterMat,
        accentMat,
        gold,
        canopyMat,
      ];
      all.forEach((m) => {
        if (m.userData.baseOpacity == null) m.userData.baseOpacity = 1;
        if (m.userData.baseEmissive == null && 'emissiveIntensity' in m) {
          m.userData.baseEmissive = (m as THREE.MeshStandardMaterial).emissiveIntensity;
        }
        craftMaterials.push(m);
      });

      return {
        metal,
        metalDark,
        solar,
        solarGrid,
        hull,
        thruster: thrusterMat,
        accentMat,
        gold,
        canopyMat,
      };
    };

    const buildSatellite = (): THREE.Group => {
      const kit = makeMatKit();
      const g = new THREE.Group();

      // Bus body
      const bodyGeo = new THREE.BoxGeometry(0.55, 0.9, 0.55);
      craftGeometries.push(bodyGeo);
      const body = new THREE.Mesh(bodyGeo, kit.metal);
      g.add(body);

      // Gold foil band
      const bandGeo = new THREE.BoxGeometry(0.58, 0.12, 0.58);
      craftGeometries.push(bandGeo);
      const band = new THREE.Mesh(bandGeo, kit.gold);
      band.position.y = 0.05;
      g.add(band);

      // Solar panels (left / right)
      const panelGeo = new THREE.BoxGeometry(1.35, 0.55, 0.04);
      craftGeometries.push(panelGeo);
      [-1, 1].forEach((side) => {
        const panel = new THREE.Mesh(panelGeo, kit.solar);
        panel.position.set(side * 1.05, 0, 0);
        g.add(panel);
        // panel frame
        const frameGeo = new THREE.BoxGeometry(1.4, 0.6, 0.02);
        craftGeometries.push(frameGeo);
        const frame = new THREE.Mesh(frameGeo, kit.metalDark);
        frame.position.set(side * 1.05, 0, -0.03);
        g.add(frame);
        // cell lines (thin bars)
        for (let i = 0; i < 3; i++) {
          const cellGeo = new THREE.BoxGeometry(1.25, 0.02, 0.015);
          craftGeometries.push(cellGeo);
          const cell = new THREE.Mesh(cellGeo, kit.solarGrid);
          cell.position.set(side * 1.05, -0.18 + i * 0.18, 0.025);
          g.add(cell);
        }
      });

      // Antenna boom + dish
      const boomGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6);
      craftGeometries.push(boomGeo);
      const boom = new THREE.Mesh(boomGeo, kit.metalDark);
      boom.position.y = 0.75;
      g.add(boom);

      const dishGeo = new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
      craftGeometries.push(dishGeo);
      const dish = new THREE.Mesh(dishGeo, kit.metal);
      dish.position.y = 1.05;
      dish.rotation.x = Math.PI;
      g.add(dish);

      // Status LED (primary green)
      const ledGeo = new THREE.SphereGeometry(0.05, 8, 8);
      craftGeometries.push(ledGeo);
      const led = new THREE.Mesh(ledGeo, kit.accentMat);
      led.position.set(0.22, 0.25, 0.28);
      g.add(led);

      // Thruster glow (bottom)
      const thrusterGeo = new THREE.SphereGeometry(0.1, 8, 8);
      craftGeometries.push(thrusterGeo);
      const thrusterMesh = new THREE.Mesh(thrusterGeo, kit.thruster);
      thrusterMesh.position.y = -0.5;
      thrusterMesh.scale.set(1, 0.55, 1);
      g.add(thrusterMesh);

      g.scale.setScalar(0.55);
      return g;
    };

    const buildShip = (): THREE.Group => {
      const kit = makeMatKit();
      const g = new THREE.Group();

      // Fuselage
      const bodyGeo = new THREE.CapsuleGeometry(0.22, 0.85, 4, 10);
      craftGeometries.push(bodyGeo);
      const body = new THREE.Mesh(bodyGeo, kit.hull);
      body.rotation.z = Math.PI / 2;
      g.add(body);

      // Nose cone
      const noseGeo = new THREE.ConeGeometry(0.2, 0.45, 10);
      craftGeometries.push(noseGeo);
      const nose = new THREE.Mesh(noseGeo, kit.metal);
      nose.rotation.z = -Math.PI / 2;
      nose.position.x = 0.72;
      g.add(nose);

      // Cockpit canopy
      const canopyGeo = new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
      craftGeometries.push(canopyGeo);
      const canopy = new THREE.Mesh(canopyGeo, kit.canopyMat);
      canopy.position.set(0.15, 0.16, 0);
      canopy.rotation.z = Math.PI / 2;
      g.add(canopy);

      // Wings
      const wingGeo = new THREE.BoxGeometry(0.35, 0.04, 1.1);
      craftGeometries.push(wingGeo);
      const wing = new THREE.Mesh(wingGeo, kit.metalDark);
      wing.position.set(-0.1, 0, 0);
      g.add(wing);

      // Engine nacelles
      [-1, 1].forEach((side) => {
        const nacelleGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8);
        craftGeometries.push(nacelleGeo);
        const nacelle = new THREE.Mesh(nacelleGeo, kit.metal);
        nacelle.rotation.z = Math.PI / 2;
        nacelle.position.set(-0.45, 0, side * 0.28);
        g.add(nacelle);

        const glowGeo = new THREE.SphereGeometry(0.07, 8, 8);
        craftGeometries.push(glowGeo);
        const glow = new THREE.Mesh(glowGeo, kit.thruster);
        glow.position.set(-0.65, 0, side * 0.28);
        g.add(glow);
      });

      // Accent stripe
      const stripeGeo = new THREE.BoxGeometry(0.6, 0.04, 0.06);
      craftGeometries.push(stripeGeo);
      const stripe = new THREE.Mesh(stripeGeo, kit.accentMat);
      stripe.position.set(0.1, 0.12, 0);
      g.add(stripe);

      g.scale.setScalar(0.48);
      return g;
    };

    const randomPath = (kind: 'satellite' | 'ship') => {
      // Drift across view: enter from top-ish, exit bottom-ish (original vibe)
      const xStart = (Math.random() - 0.5) * 28;
      const xEnd = xStart + (Math.random() - 0.5) * 14;
      const z = 18 + Math.random() * 12; // near layer so silhouette reads
      if (kind === 'satellite') {
        return {
          start: new THREE.Vector3(xStart, 14 + Math.random() * 4, z),
          end: new THREE.Vector3(xEnd, -16 - Math.random() * 4, z + (Math.random() - 0.5) * 4),
        };
      }
      // Ship: more horizontal glide
      const side = Math.random() > 0.5 ? 1 : -1;
      return {
        start: new THREE.Vector3(side * 22, 4 + Math.random() * 8, z),
        end: new THREE.Vector3(-side * 22, -2 + Math.random() * 6, z - 2),
      };
    };

    const spawnCraft = (kind: 'satellite' | 'ship', initialDelay: number) => {
      const group = kind === 'satellite' ? buildSatellite() : buildShip();
      group.visible = false;
      scene.add(group);
      const path = randomPath(kind);
      crafts.push({
        group,
        materials: [],
        geometries: [],
        phase: 0,
        duration: kind === 'satellite' ? 55 + Math.random() * 35 : 40 + Math.random() * 25,
        start: path.start,
        end: path.end,
        spin: (Math.random() - 0.5) * 0.25,
        baseScale: kind === 'satellite' ? 0.55 : 0.48,
        delay: initialDelay,
        kind,
      });
    };

    // One satellite always, plus a ship; staggered like the original 8s delay
    if (!reduceMotion) {
      spawnCraft('satellite', 2.5);
      spawnCraft('ship', 18);
      // Second satellite on a longer cycle for deeper space feel
      spawnCraft('satellite', 45);
    } else {
      // Static parked satellite for reduced-motion users
      const sat = buildSatellite();
      sat.position.set(8, 6, 22);
      sat.rotation.set(0.3, 0.8, 0.2);
      sat.scale.setScalar(0.45);
      scene.add(sat);
      crafts.push({
        group: sat,
        materials: [],
        geometries: [],
        phase: 0.5,
        duration: 9999,
        start: sat.position.clone(),
        end: sat.position.clone(),
        spin: 0,
        baseScale: 0.45,
        delay: 0,
        kind: 'satellite',
      });
    }

    // Shooting-star streaks (occasional) — head + tapering tail
    const streakGroup = new THREE.Group();
    scene.add(streakGroup);
    type Streak = {
      line: THREE.Line;
      born: number;
      maxLife: number;
      head: THREE.Vector3;
      dir: THREE.Vector3;
      speed: number;
      length: number;
    };
    const streaks: Streak[] = [];
    let nextStreakAt = 4 + Math.random() * 6;

    const spawnStreak = (now: number) => {
      const head = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        8 + Math.random() * 14,
        5 + Math.random() * 20
      );
      const dir = new THREE.Vector3(
        0.55 + Math.random() * 0.5,
        -0.65 - Math.random() * 0.4,
        (Math.random() - 0.5) * 0.2
      ).normalize();
      const length = 2.2 + Math.random() * 3.2;
      const tail = head.clone().addScaledVector(dir, -length);
      const geo = new THREE.BufferGeometry().setFromPoints([tail, head]);
      // Vertex colors: dim tail → bright head
      geo.setAttribute(
        'color',
        new THREE.Float32BufferAttribute([0.35, 0.4, 0.55, 1, 1, 1], 3)
      );
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
      });
      const line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      streakGroup.add(line);
      streaks.push({
        line,
        born: now,
        maxLife: 0.55 + Math.random() * 0.4,
        head,
        dir,
        speed: 36 + Math.random() * 28,
        length,
      });
    };

    const destroyStreak = (s: Streak) => {
      streakGroup.remove(s.line);
      s.line.geometry.dispose();
      (s.line.material as THREE.Material).dispose();
      s.line.visible = false;
    };

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const setSize = () => {
      if (!mount || disposed) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      const pr = Math.min(window.devicePixelRatio, prefersLowPower ? 1.25 : 2);
      renderer.setPixelRatio(pr);
      [far, mid, near].forEach((layer) => {
        layer.material.uniforms.uPixelRatio.value = pr;
      });
    };

    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(mount);

    const onPointerMove = (e: PointerEvent) => {
      if (reduceMotion || mouseParallax <= 0) return;
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTarget.current.x = nx;
      mouseTarget.current.y = ny;
    };

    // Track on window so section fills feel continuous
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const animate = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(animate);

      // getDelta FIRST — getElapsedTime() also calls getDelta and would zero-out dt
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Smooth mouse lerp (springy ease)
      const lerp = 1 - Math.exp(-4.2 * dt);
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * lerp;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * lerp;

      const mx = mouseCurrent.current.x * mouseParallax;
      const my = mouseCurrent.current.y * mouseParallax;

      if (!reduceMotion) {
        const d = drift;
        far.points.rotation.y = t * 0.006 * d + mx * 0.04;
        far.points.rotation.x = my * 0.03;
        mid.points.rotation.y = t * 0.012 * d + mx * 0.08;
        mid.points.rotation.x = my * 0.05;
        near.points.rotation.y = t * 0.02 * d + mx * 0.14;
        near.points.rotation.x = my * 0.08;

        far.material.uniforms.uTime.value = t;
        mid.material.uniforms.uTime.value = t;
        near.material.uniforms.uTime.value = t;

        nebulaMeshes.forEach((mesh, i) => {
          mesh.position.x += Math.sin(t * 0.12 + i) * 0.002 * d;
          mesh.rotation.z += 0.0004 * d * (i % 2 === 0 ? 1 : -1);
          mesh.position.x += mx * 0.4;
          mesh.position.y += my * 0.25;
        });

        camera.position.x = mx * 2.2;
        camera.position.y = my * 1.4;
        camera.lookAt(mx * 0.5, my * 0.3, 0);

        // Craft drift + fade cycles
        crafts.forEach((craft) => {
          if (t < craft.delay) {
            craft.group.visible = false;
            return;
          }
          const localT = t - craft.delay;
          const cycle = localT % (craft.duration + 12); // 12s rest between passes
          if (cycle > craft.duration) {
            craft.group.visible = false;
            // Resample path once when rest ends next time
            if (cycle - craft.duration < dt * 2) {
              const path = randomPath(craft.kind);
              craft.start.copy(path.start);
              craft.end.copy(path.end);
              craft.duration =
                craft.kind === 'satellite' ? 55 + Math.random() * 35 : 40 + Math.random() * 25;
            }
            return;
          }

          const p = cycle / craft.duration;
          // Ease in/out opacity
          let alpha = 1;
          if (p < 0.08) alpha = p / 0.08;
          else if (p > 0.88) alpha = (1 - p) / 0.12;
          alpha = Math.max(0, Math.min(1, alpha));

          craft.group.visible = alpha > 0.02;
          craft.group.position.lerpVectors(craft.start, craft.end, p);
          // Slight arc
          craft.group.position.y += Math.sin(p * Math.PI) * 1.2;

          if (craft.kind === 'satellite') {
            craft.group.rotation.y = t * 0.15 + craft.spin;
            craft.group.rotation.z = 0.15 + Math.sin(t * 0.2) * 0.08;
            craft.group.rotation.x = 0.4 + Math.sin(t * 0.12) * 0.05;
          } else {
            // Face along travel direction
            const dir = craft.end.clone().sub(craft.start).normalize();
            craft.group.lookAt(craft.group.position.clone().add(dir));
            craft.group.rotateY(Math.PI / 2);
            craft.group.rotation.z = Math.sin(t * 0.4) * 0.06;
          }

          craft.group.scale.setScalar(craft.baseScale * (0.96 + alpha * 0.04));
          craft.group.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.isMesh && mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                const mat = m as THREE.MeshStandardMaterial;
                if ('opacity' in mat) {
                  mat.transparent = true;
                  mat.opacity = alpha * (mat.userData.baseOpacity ?? 1);
                  // Preserve thruster glow intensity
                  if (mat.emissiveIntensity !== undefined && mat.userData.baseEmissive == null) {
                    mat.userData.baseEmissive = mat.emissiveIntensity;
                  }
                  if (mat.userData.baseEmissive != null) {
                    mat.emissiveIntensity = mat.userData.baseEmissive * alpha;
                  }
                }
              });
            }
          });
        });

        // Shooting stars — time-based life so they always die cleanly
        if (t > nextStreakAt) {
          spawnStreak(t);
          nextStreakAt = t + 5 + Math.random() * 9;
        }
        for (let i = streaks.length - 1; i >= 0; i--) {
          const s = streaks[i];
          const age = t - s.born;
          if (age >= s.maxLife || age < 0) {
            destroyStreak(s);
            streaks.splice(i, 1);
            continue;
          }

          const p = age / s.maxLife; // 0 → 1
          // Fade in fast, hold, fade out hard at the end
          let alpha: number;
          if (p < 0.12) alpha = p / 0.12;
          else if (p > 0.55) alpha = 1 - (p - 0.55) / 0.45;
          else alpha = 1;
          alpha = Math.max(0, Math.min(1, alpha));

          // Trail shrinks as it dies (matches old GSAP scaleX fade)
          const trailLen = s.length * (1 - p * 0.85);

          s.head.addScaledVector(s.dir, s.speed * dt);
          const tail = s.head.clone().addScaledVector(s.dir, -trailLen);

          const pos = s.line.geometry.attributes.position as THREE.BufferAttribute;
          pos.setXYZ(0, tail.x, tail.y, tail.z);
          pos.setXYZ(1, s.head.x, s.head.y, s.head.z);
          pos.needsUpdate = true;
          s.line.geometry.computeBoundingSphere();

          const mat = s.line.material as THREE.LineBasicMaterial;
          mat.opacity = alpha * 0.95;
          // Fully hide before dispose so no ghost frame
          s.line.visible = alpha > 0.02;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();

      [far, mid, near].forEach((layer) => {
        layer.geometry.dispose();
        layer.material.dispose();
        scene.remove(layer.points);
      });
      nebulaMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.dispose();
        scene.remove(mesh);
      });

      crafts.forEach((c) => scene.remove(c.group));
      // Unique geometries/materials only once
      const seenGeo = new Set<THREE.BufferGeometry>();
      craftGeometries.forEach((g) => {
        if (!seenGeo.has(g)) {
          seenGeo.add(g);
          g.dispose();
        }
      });
      const seenMat = new Set<THREE.Material>();
      craftMaterials.forEach((m) => {
        if (!seenMat.has(m)) {
          seenMat.add(m);
          m.dispose();
        }
      });

      streaks.forEach((s) => destroyStreak(s));
      streaks.length = 0;
      scene.remove(streakGroup);
      scene.remove(ambient);
      scene.remove(sun);
      scene.remove(fill);

      starTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [density, mouseParallax, drift, nebula, accent]);

  return (
    <div
      ref={mountRef}
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0, opacity }}
      aria-hidden="true"
    />
  );
};

export default CosmicBackground;
