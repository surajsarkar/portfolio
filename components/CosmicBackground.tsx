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
  /**
   * How far the camera flies along -Z over full page scroll (world units).
   * Higher = stronger depth travel.
   */
  scrollDepth?: number;
}

/**
 * GPU starfield with scroll-driven Z-axis flight (depth dolly),
 * layered parallax stars, nebula, craft, and shooting stars.
 */
const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  density = 1,
  mouseParallax = 0.35,
  drift = 1,
  nebula = true,
  accent = '#d4c4a8',
  className = '',
  fixed = false,
  opacity = 1,
  scrollDepth = 220,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const scrollTarget = useRef(0);
  const scrollSmooth = useRef(0);
  const scrollVel = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersLowPower =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    const isMobile = window.innerWidth < 768;

    const starMultiplier = isMobile ? 0.45 : prefersLowPower ? 0.75 : 1;
    // Milky Way layer counts
    const farCount = Math.floor(7000 * density * starMultiplier);
    const midCount = Math.floor(4000 * density * starMultiplier);
    const nearCount = Math.floor(2500 * density * starMultiplier);

    // Flight: camera moves on Z, but stars live in a sliding window that
    // wraps with the camera so the field never empties at the last section.
    const CAM_START_Z = 70;
    const CAM_TRAVEL = Math.max(80, scrollDepth);
    // Star bubble around the camera (always full of stars)
    const STAR_AHEAD = 130; // how far in front of camera stars extend
    const STAR_BEHIND = 35; // how far behind before they recycle
    const STAR_SEGMENT = STAR_AHEAD + STAR_BEHIND; // wrap period

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 800);
    camera.position.set(0, 0, CAM_START_Z);
    camera.lookAt(0, 0, CAM_START_Z - 40);

    // Root that holds world content; camera dollys through it on Z
    const world = new THREE.Group();
    scene.add(world);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : prefersLowPower ? 1.25 : 2));
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
    // Stellar temperature palette (Milky Way)
    const coreWarm = new THREE.Color(0xffe0a8); // galactic center gold
    const armWarm = new THREE.Color(0xfff2d6); // disk warm white
    const armWhite = new THREE.Color(0xf4f6ff);
    const haloBlue = new THREE.Color(0xc8d8ff);
    const haloDeep = new THREE.Color(0xa8b8e8);
    const dustTint = new THREE.Color(0xc4a88a); // dusty lane brown-gold

    // Shared galactic orientation (diagonal band across the sky)
    const GALACTIC_ROLL = 0.48; // ~27° diagonal
    const GALACTIC_TILT = 0.22;
    // Galactic center offset (brighter bulge sits slightly off-center)
    const CORE_X = 8;
    const CORE_Y = -3;

    const gauss = () => {
      // Box-Muller
      let u = 0;
      let v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    /**
     * Milky Way structure along the Z flight corridor:
     * - dense thin disk (galactic plane)
     * - spiral-arm density waves
     * - central bulge
     * - sparse spherical halo
     * - dust lanes (dimmed midplane gaps)
     */
    const makeStarLayer = (
      count: number,
      radial: number,
      size: number,
      opacityBase: number,
      parallax: number,
      /** 0 = mostly halo/sparse, 1 = heavy disk/bulge */
      diskBias: number
    ) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      // Place all stars inside the camera bubble; wrap keeps it full forever
      const zMin = CAM_START_Z - STAR_AHEAD;
      const zMax = CAM_START_Z + STAR_BEHIND;
      const depthSpan = zMax - zMin;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Heavy disk fill so the band reads as a continuous river of stars
        const inDisk = Math.random() < 0.32 + diskBias * 0.65;
        let x: number;
        let y: number;
        let z: number;
        let brightness: number;
        let starSize = size;
        let c = armWhite;

        if (inDisk) {
          const lon = Math.random() * Math.PI * 2;
          const towardCore = Math.random() < 0.2 + diskBias * 0.12;
          let rPlane: number;
          if (towardCore) {
            rPlane = Math.abs(gauss()) * radial * 0.28;
          } else {
            // Fill the plane densely (less power = more mid-band stars)
            rPlane = Math.pow(Math.random(), 0.45) * radial;
          }

          // Soft spiral modulation — boost density, don't reject stars
          const armPhase = lon * 2.0 - rPlane * 0.12;
          const armDensity = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.cos(armPhase), 1.6);

          const coreFactor = Math.exp(-rPlane / (radial * 0.4));
          // Slightly thicker plane so more stars catch the eye
          const thickness = radial * (0.05 + coreFactor * 0.1);
          let h = gauss() * thickness;

          // Dust lanes: only dim a small subset (don't remove population)
          const dustLane = Math.abs(Math.sin(lon * 3.0 + rPlane * 0.08)) > 0.82 && Math.random() < 0.25;
          if (dustLane && Math.abs(h) < thickness * 0.4) {
            h += (h >= 0 ? 1 : -1) * thickness * 0.5;
          }

          z = zMin + Math.random() * depthSpan;

          // Wide ribbon across X with arm waves
          const bandAlong = (Math.random() - 0.5) * radial * 3.2;
          const armWave = Math.sin(bandAlong * 0.08 + lon) * radial * 0.14;
          x = bandAlong + armWave + CORE_X * (towardCore ? 0.6 : 0.15);
          x += Math.cos(lon) * rPlane * 0.3;
          y = h + Math.sin(bandAlong * 0.05) * thickness * 0.8 + CORE_Y * (towardCore ? 0.5 : 0.1);
          y += Math.sin(bandAlong * 0.04) * radial * 0.03;

          if (towardCore || rPlane < radial * 0.22) {
            c = Math.random() > 0.3 ? coreWarm : armWarm;
            brightness = 0.75 + Math.random() * 0.35;
            starSize = size * (1.0 + Math.random() * 0.85);
          } else if (dustLane) {
            c = dustTint;
            brightness = 0.35 + Math.random() * 0.3;
            starSize = size * (0.5 + Math.random() * 0.45);
          } else {
            const armRoll = Math.random();
            if (armRoll > 0.94) c = accentColor;
            else if (armRoll > 0.5) c = armWarm;
            else if (armRoll > 0.2) c = armWhite;
            else c = haloBlue;
            brightness = 0.5 + Math.random() * 0.5 + armDensity * 0.12;
            starSize = size * (0.65 + Math.random() * 0.9);
          }

          // Unresolved band population: many faint tiny stars (the "milky" look)
          if (Math.random() < 0.7) {
            starSize *= 0.45 + Math.random() * 0.35;
            brightness *= 0.75 + Math.random() * 0.25;
          }
        } else {
          // Halo — still denser than before so the sky isn't empty off-band
          const angle = Math.random() * Math.PI * 2;
          const elev = (Math.random() - 0.5) * Math.PI;
          const r = Math.pow(Math.random(), 0.4) * radial * 1.25;
          x = Math.cos(elev) * Math.cos(angle) * r;
          y = Math.sin(elev) * r;
          z = zMin + Math.random() * depthSpan;
          c = Math.random() > 0.5 ? haloBlue : haloDeep;
          brightness = 0.35 + Math.random() * 0.45;
          starSize = size * (0.4 + Math.random() * 0.65);
          if (Math.random() > 0.96) {
            brightness = 0.85 + Math.random() * 0.2;
            starSize = size * (1.15 + Math.random());
            c = armWhite;
          }
        }

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        colors[i3] = c.r * brightness;
        colors[i3 + 1] = c.g * brightness;
        colors[i3 + 2] = c.b * brightness;
        sizes[i] = Math.max(0.2, starSize);
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
          uSpeed: { value: 0 },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float uPixelRatio;
          uniform float uTime;
          uniform float uTwinkle;
          uniform float uSpeed;

          void main() {
            vColor = color;
            vec3 pos = position;
            pos.z += uSpeed * 0.12 * (aSize - 1.0);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            float twinkle = 1.0;
            if (uTwinkle > 0.5) {
              // Dimmer stars twinkle more; bright core stays steadier
              float dim = 1.0 - smoothstep(0.4, 1.2, aSize);
              twinkle = 0.78 + 0.22 * sin(uTime * 1.6 + position.x * 11.0 + position.y * 8.0) * dim
                      + 0.08 * sin(uTime * 3.1 + position.z * 4.0) * dim;
            }
            vAlpha = twinkle;
            float depth = max(0.8, -mvPosition.z);
            gl_PointSize = aSize * uPixelRatio * ((155.0 + uSpeed * 35.0) / depth);
            gl_PointSize = min(gl_PointSize, 56.0);
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
      const group = new THREE.Group();
      group.add(points);
      // Align every layer to the same galactic plane
      group.rotation.z = GALACTIC_ROLL;
      group.rotation.x = GALACTIC_TILT;
      world.add(group);
      return { points, material, geometry, group, parallax };
    };

    // Far = wide soft band, mid = dense disk, near = bright nearby arm stars
    const far = makeStarLayer(farCount, 110, 1.0, 0.7, 0.2, 0.88);
    const mid = makeStarLayer(midCount, 72, 1.45, 0.88, 0.5, 0.94);
    const near = makeStarLayer(nearCount, 42, 2.15, 1.0, 0.95, 0.85);

    /**
     * Keep stars in a sliding window around the camera.
     * Without this, flying to the last section leaves empty space ahead.
     */
    const wrapStarLayer = (geometry: THREE.BufferGeometry, camZ: number) => {
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const maxZ = camZ + STAR_BEHIND;
      const minZ = camZ - STAR_AHEAD;
      let dirty = false;
      for (let i = 0, n = pos.count; i < n; i++) {
        const iz = i * 3 + 2;
        let z = arr[iz];
        if (z > maxZ) {
          // Flown past → jump ahead into the next segment
          z -= STAR_SEGMENT * Math.ceil((z - maxZ) / STAR_SEGMENT);
          arr[iz] = z;
          dirty = true;
        } else if (z < minZ) {
          // Too far ahead (scroll back) → jump behind
          z += STAR_SEGMENT * Math.ceil((minZ - z) / STAR_SEGMENT);
          arr[iz] = z;
          dirty = true;
        }
      }
      if (dirty) {
        pos.needsUpdate = true;
        geometry.computeBoundingSphere();
      }
    };

    // Milky Way integrated light — soft elongated band glow + core
    const nebulaMeshes: THREE.Mesh[] = [];
    if (nebula) {
      const bandTex = (() => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 128;
        const ctx = c.getContext('2d')!;
        // Horizontal galactic glow with falloff
        const g = ctx.createLinearGradient(0, 0, 0, 128);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.35, 'rgba(255,240,210,0.15)');
        g.addColorStop(0.5, 'rgba(255,245,220,0.55)');
        g.addColorStop(0.65, 'rgba(255,240,210,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 128);
        // Lengthwise soft ends
        const gx = ctx.createLinearGradient(0, 0, 512, 0);
        gx.addColorStop(0, 'rgba(0,0,0,0.85)');
        gx.addColorStop(0.15, 'rgba(0,0,0,0)');
        gx.addColorStop(0.85, 'rgba(0,0,0,0)');
        gx.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gx;
        ctx.fillRect(0, 0, 512, 128);
        // Dust mottling
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 40; i++) {
          const px = Math.random() * 512;
          const py = 48 + Math.random() * 32;
          const pr = 8 + Math.random() * 28;
          const gg = ctx.createRadialGradient(px, py, 0, px, py, pr);
          gg.addColorStop(0, `rgba(0,0,0,${0.15 + Math.random() * 0.25})`);
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      })();

      const coreTex = (() => {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        g.addColorStop(0, 'rgba(255,230,180,0.7)');
        g.addColorStop(0.25, 'rgba(255,210,150,0.35)');
        g.addColorStop(0.55, 'rgba(180,160,220,0.12)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      })();

      /** Tag mesh so the animate loop can drift + wrap it through depth */
      const tagCloud = (
        mesh: THREE.Mesh,
        baseX: number,
        baseY: number,
        z: number
      ) => {
        mesh.position.set(baseX, baseY, z);
        mesh.rotation.z = GALACTIC_ROLL;
        mesh.rotation.x = GALACTIC_TILT;
        mesh.userData.baseX = baseX;
        mesh.userData.baseY = baseY;
        mesh.userData.phase = Math.random() * Math.PI * 2;
        mesh.userData.driftSpeed = 0.12 + Math.random() * 0.22;
        mesh.userData.driftAmpX = 3 + Math.random() * 5;
        mesh.userData.driftAmpY = 1.5 + Math.random() * 3;
        mesh.userData.spin = (Math.random() - 0.5) * 0.08;
        world.add(mesh);
        nebulaMeshes.push(mesh);
        return mesh;
      };

      const makeBand = (
        z: number,
        scaleX: number,
        scaleY: number,
        op: number,
        tint: number,
        x = CORE_X * 0.3,
        y = CORE_Y * 0.2
      ) => {
        const geo = new THREE.PlaneGeometry(scaleX, scaleY);
        const mat = new THREE.MeshBasicMaterial({
          map: bandTex,
          color: new THREE.Color().setHSL(0.1, 0.25, 0.75).multiplyScalar(tint),
          transparent: true,
          opacity: op,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        return tagCloud(new THREE.Mesh(geo, mat), x, y, z);
      };

      const makeCore = (z: number, scale: number, op: number) => {
        const geo = new THREE.PlaneGeometry(scale, scale * 0.65);
        const mat = new THREE.MeshBasicMaterial({
          map: coreTex,
          color: 0xffe8c0,
          transparent: true,
          opacity: op,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        return tagCloud(new THREE.Mesh(geo, mat), CORE_X, CORE_Y, z);
      };

      // Scatter clouds through the star bubble — they drift & wrap as you fly
      const zMin = CAM_START_Z - STAR_AHEAD;
      const zMax = CAM_START_Z + STAR_BEHIND;
      const cloudSlots = 7;
      for (let i = 0; i < cloudSlots; i++) {
        const z = zMin + ((i + 0.35) / cloudSlots) * (zMax - zMin);
        const side = i % 2 === 0 ? 1 : -1;
        makeBand(z, 130, 24, 0.13 + (i % 2) * 0.03, 0.9, side * 4, CORE_Y * 0.2);
        makeBand(
          z - 8,
          100,
          16,
          0.08,
          0.75,
          -side * 10,
          CORE_Y * 0.5 + side * 2
        );
        if (i % 2 === 0) makeCore(z - 5, 28 + (i % 3) * 6, 0.15);
        const coolGeo = new THREE.PlaneGeometry(75, 38);
        const coolMat = new THREE.MeshBasicMaterial({
          map: coreTex,
          color: 0x6a8fd4,
          transparent: true,
          opacity: 0.05,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        tagCloud(
          new THREE.Mesh(coolGeo, coolMat),
          -CORE_X * 0.5 + side * 6,
          5 + side * 2,
          z - 12
        );
      }

      if (nebulaMeshes[0]) {
        nebulaMeshes[0].userData.bandTex = bandTex;
        nebulaMeshes[0].userData.coreTex = coreTex;
      }
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
      gap: number;
      done: boolean;
      kind: 'satellite';
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

    const randomPath = (camZ: number) => {
      const z = camZ - (20 + Math.random() * 40);
      const edge = Math.floor(Math.random() * 3); // 0=left-to-right, 1=right-to-left, 2=top-to-bottom-side
      let start: THREE.Vector3, end: THREE.Vector3;
      switch (edge) {
        case 0: // left to right
          start = new THREE.Vector3(-18 - Math.random() * 4, 3 + Math.random() * 6, z);
          end = new THREE.Vector3(18 + Math.random() * 4, -2 + Math.random() * 5, z - 5 - Math.random() * 10);
          break;
        case 1: // right to left
          start = new THREE.Vector3(18 + Math.random() * 4, 3 + Math.random() * 6, z);
          end = new THREE.Vector3(-18 - Math.random() * 4, -2 + Math.random() * 5, z - 5 - Math.random() * 10);
          break;
        default: // top to bottom-side
          start = new THREE.Vector3((Math.random() - 0.5) * 12, 14 + Math.random() * 4, z);
          end = new THREE.Vector3((Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 4), -8 - Math.random() * 4, z - 5 - Math.random() * 10);
          break;
      }
      return { start, end };
    };

    const spawnSatellite = (initialDelay: number) => {
      const group = buildSatellite();
      group.visible = false;
      world.add(group);
      const path = randomPath(CAM_START_Z);
      crafts.push({
        group,
        materials: [],
        geometries: [],
        phase: 0,
        duration: 50 + Math.random() * 30,
        start: path.start,
        end: path.end,
        spin: (Math.random() - 0.5) * 0.25,
        baseScale: 0.55,
        delay: initialDelay,
        gap: 15 + Math.random() * 30,
        done: false,
        kind: 'satellite',
      });
    };

    // Single satellite — rare surprise for space travellers (skip on mobile for perf)
    if (!reduceMotion && !isMobile) {
      spawnSatellite(8 + Math.random() * 12);
    } else {
      const sat = buildSatellite();
      sat.position.set(8, 4, CAM_START_Z - 25);
      sat.rotation.set(0.3, 0.8, 0.2);
      sat.scale.setScalar(0.45);
      world.add(sat);
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
        gap: 9999,
        done: false,
        kind: 'satellite',
      });
    }

    // Shooting-star streaks (occasional) — head + tapering tail
    const streakGroup = new THREE.Group();
    world.add(streakGroup);
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

    const spawnStreak = (now: number, camZ: number) => {
      // Spawn slightly ahead of camera so streaks read in depth
      const head = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        4 + Math.random() * 10,
        camZ - (8 + Math.random() * 30)
      );
      const dir = new THREE.Vector3(
        0.45 + Math.random() * 0.45,
        -0.55 - Math.random() * 0.35,
        -0.35 - Math.random() * 0.4 // mostly into the flight path
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

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Page scroll → Z flight progress (0 at top, 1 at bottom)
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    readScroll();
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll, { passive: true });

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

      // Smooth scroll → depth (heavier ease so Z flight feels inertial)
      const scrollLerp = 1 - Math.exp(-3.2 * dt);
      const prevScroll = scrollSmooth.current;
      scrollSmooth.current += (scrollTarget.current - scrollSmooth.current) * scrollLerp;
      // Velocity in "scroll units per second" for warp cues
      scrollVel.current = Math.abs(scrollSmooth.current - prevScroll) / Math.max(dt, 0.001);
      const speedNorm = Math.min(1, scrollVel.current * 0.35);

      const mx = mouseCurrent.current.x * mouseParallax;
      const my = mouseCurrent.current.y * mouseParallax;
      const s = scrollSmooth.current; // 0 → 1

      // Camera dolly along -Z (the depth axis)
      const camZ = CAM_START_Z - s * CAM_TRAVEL;
      // Subtle FOV push when scrolling fast
      const baseFov = 58;
      const targetFov = reduceMotion ? baseFov : baseFov + speedNorm * 6;
      camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-6 * dt));
      camera.updateProjectionMatrix();

      if (!reduceMotion) {
        const d = drift;

        // Infinite star tunnel: recycle stars that fly past the camera
        wrapStarLayer(far.geometry, camZ);
        wrapStarLayer(mid.geometry, camZ);
        wrapStarLayer(near.geometry, camZ);

        // Keep Milky Way plane stable — only subtle drift / mouse lean
        const roll = GALACTIC_ROLL + mx * 0.03 + Math.sin(t * 0.03 * d) * 0.015;
        const tilt = GALACTIC_TILT + my * 0.02;
        far.group.rotation.z = roll;
        far.group.rotation.x = tilt;
        mid.group.rotation.z = roll + 0.01;
        mid.group.rotation.x = tilt;
        near.group.rotation.z = roll - 0.008;
        near.group.rotation.x = tilt + 0.01;

        far.material.uniforms.uTime.value = t;
        mid.material.uniforms.uTime.value = t;
        near.material.uniforms.uTime.value = t;
        far.material.uniforms.uSpeed.value = speedNorm;
        mid.material.uniforms.uSpeed.value = speedNorm;
        near.material.uniforms.uSpeed.value = speedNorm;

        // Clouds: living drift + fly-past wrap (not glued to the camera)
        nebulaMeshes.forEach((mesh, i) => {
          const baseX = (mesh.userData.baseX as number) ?? 0;
          const baseY = (mesh.userData.baseY as number) ?? 0;
          const phase0 = (mesh.userData.phase as number) ?? 0;
          const driftSpeed = (mesh.userData.driftSpeed as number) ?? 0.15;
          const ampX = (mesh.userData.driftAmpX as number) ?? 4;
          const ampY = (mesh.userData.driftAmpY as number) ?? 2;
          const spin = (mesh.userData.spin as number) ?? 0;
          const phase = phase0 + t * driftSpeed * d;

          // Soft lateral / vertical drift (the "cloud is alive" feel)
          mesh.position.x = baseX + Math.sin(phase) * ampX + mx * 1.5;
          mesh.position.y = baseY + Math.cos(phase * 0.75) * ampY + my * 1.0;

          // Depth wrap — approach, pass, recycle ahead (parallax motion on scroll)
          let z = mesh.position.z;
          const maxZ = camZ + STAR_BEHIND;
          const minZ = camZ - STAR_AHEAD;
          if (z > maxZ) {
            z -= STAR_SEGMENT * Math.ceil((z - maxZ) / STAR_SEGMENT);
          } else if (z < minZ) {
            z += STAR_SEGMENT * Math.ceil((minZ - z) / STAR_SEGMENT);
          }
          mesh.position.z = z;

          mesh.rotation.z = roll + spin + Math.sin(phase * 0.55) * 0.05;
          mesh.rotation.x = tilt + Math.cos(phase * 0.4) * 0.02;
          // Gentle breathe
          const breathe = 1 + Math.sin(phase * 0.9) * 0.045;
          mesh.scale.set(breathe, breathe * (0.95 + Math.sin(phase * 0.6) * 0.04), 1);

          const mat = mesh.material as THREE.MeshBasicMaterial;
          if (mat.userData.baseOp == null) mat.userData.baseOp = mat.opacity;
          // Fade slightly when very close / far so wraps don't pop
          const rel = camZ - z; // positive = ahead
          const depthFade =
            rel < 8 ? Math.max(0.15, rel / 8) : rel > STAR_AHEAD - 15 ? Math.max(0.2, (STAR_AHEAD - rel) / 15) : 1;
          mat.opacity =
            mat.userData.baseOp *
            depthFade *
            (0.88 + 0.12 * Math.sin(phase + i * 0.5));
        });

        // Fly forward: camera on Z, slight mouse look
        camera.position.x = mx * 2.4;
        camera.position.y = my * 1.5;
        camera.position.z = camZ;
        camera.lookAt(mx * 0.8, my * 0.5, camZ - 50);

        // Satellite drift — one-shot edge-to-edge, never repeats
        crafts.forEach((craft) => {
          // Already completed its journey — stay hidden forever
          if (craft.done) {
            craft.group.visible = false;
            return;
          }
          if (t < craft.delay) {
            craft.group.visible = false;
            return;
          }
          const localT = t - craft.delay;
          const p = localT / craft.duration;

          // Finished traversal — mark done permanently
          if (p >= 1) {
            craft.group.visible = false;
            craft.done = true;
            return;
          }

          craft.group.visible = true;
          craft.group.position.lerpVectors(craft.start, craft.end, p);
          craft.group.position.y += Math.sin(p * Math.PI) * 1.0;

          // Satellite rotation
          craft.group.rotation.y = t * 0.15 + craft.spin;
          craft.group.rotation.z = 0.15 + Math.sin(t * 0.2) * 0.08;
          craft.group.rotation.x = 0.4 + Math.sin(t * 0.12) * 0.05;

          craft.group.scale.setScalar(craft.baseScale);
          craft.group.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.isMesh && mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                const mat = m as THREE.MeshStandardMaterial;
                if ('opacity' in mat) {
                  mat.transparent = true;
                  mat.opacity = mat.userData.baseOpacity ?? 1;
                  if (mat.userData.baseEmissive != null) {
                    mat.emissiveIntensity = mat.userData.baseEmissive;
                  }
                }
              });
            }
          });
        });

        // Shooting stars — time-based life so they always die cleanly
        if (t > nextStreakAt) {
          spawnStreak(t, camZ);
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
      } else {
        // Reduced motion: fixed camera, no Z flight
        camera.position.set(0, 0, CAM_START_Z);
        camera.lookAt(0, 0, CAM_START_Z - 40);
        camera.fov = 58;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);
      ro.disconnect();

      [far, mid, near].forEach((layer) => {
        layer.geometry.dispose();
        layer.material.dispose();
        world.remove(layer.group);
      });
      const sharedBand = nebulaMeshes[0]?.userData.bandTex as THREE.Texture | undefined;
      const sharedCore = nebulaMeshes[0]?.userData.coreTex as THREE.Texture | undefined;
      nebulaMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        const mat = mesh.material as THREE.MeshBasicMaterial;
        // maps are shared — dispose once below
        mat.map = null;
        mat.dispose();
        world.remove(mesh);
      });
      sharedBand?.dispose();
      sharedCore?.dispose();

      crafts.forEach((c) => world.remove(c.group));
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
      world.remove(streakGroup);
      scene.remove(world);
      scene.remove(ambient);
      scene.remove(sun);
      scene.remove(fill);

      starTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [density, mouseParallax, drift, nebula, accent, scrollDepth]);

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
