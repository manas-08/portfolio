'use client';

import {Canvas, type RootState, useFrame, useThree} from '@react-three/fiber';
import {type RefObject, useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';

/** Colors fed to the shader, resolved from the active theme. */
export interface BrainPalette {
  ink: string;
  edema: string;
  enhancing: string;
  core: string;
  scan: string;
  additive: boolean;
}

interface BrainSceneProps {
  palette: BrainPalette;
  reducedMotion: boolean;
  /** Receives the current slice index for the HUD readout. */
  onSlice?: (slice: number) => void;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uSlice;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSeed;
  varying float vLesion;
  varying float vSlice;
  varying float vDepth;

  void main() {
    vec3 p = position * (1.0 + 0.012 * sin(uTime * 1.3 + aSeed * 6.2831));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 delta = vec2((ndc.x - uPointer.x) * uAspect, ndc.y - uPointer.y);
    float wobble = 0.035 * sin(position.x * 11.0 + position.y * 7.0 + uTime)
        + (aSeed - 0.5) * 0.05;
    vLesion = 1.0 - smoothstep(0.0, 0.34, length(delta) + wobble);
    vSlice = 1.0 - smoothstep(0.0, 0.03, abs(position.z - uSlice));
    vDepth = smoothstep(-5.2, -2.2, mv.z);
    float size = uSize * (0.6 + aSeed * 0.8)
        * (1.0 + vLesion * 0.9 + vSlice * 0.7);
    gl_PointSize = size * uPixelRatio / -mv.z;
    gl_Position = clip;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uEdema;
  uniform vec3 uEnhancing;
  uniform vec3 uCore;
  uniform vec3 uScan;
  varying float vLesion;
  varying float vSlice;
  varying float vDepth;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float disc = smoothstep(0.5, 0.15, r);
    float edema = step(0.12, vLesion);
    float enhancing = step(0.48, vLesion);
    float core = step(0.74, vLesion);
    vec3 color = uInk;
    color = mix(color, uEdema, edema);
    color = mix(color, uEnhancing, enhancing);
    color = mix(color, uCore, core);
    color = mix(color, uScan, vSlice * (1.0 - edema));
    float alpha = disc * mix(0.08, 0.55, vDepth);
    alpha = max(alpha, disc * max(edema * 0.95, vSlice * 0.9));
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Deterministic PRNG so the brain looks identical on every visit. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDirection(rng: () => number): [number, number, number] {
  const u = rng() * 2 - 1;
  const theta = rng() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(theta), u, s * Math.sin(theta)];
}

/**
 * Builds a stylized brain: two folded cerebral hemispheres, a striated
 * cerebellum and a brainstem, with sparse interior points so the scan slice
 * has something to cut through.
 */
function buildBrain(count: number): {positions: Float32Array; seeds: Float32Array} {
  const rng = mulberry32(452099);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x: number;
    let y: number;
    let z: number;

    if (pick < 0.84) {
      const [dx, dy, dz] = randomDirection(rng);
      const fold = 0.05 * Math.sin(9 * dx + 3 * dy) * Math.cos(8 * dz - 2 * dy) +
          0.03 * Math.sin(15 * dy + 11 * dz) +
          0.02 * Math.cos(19 * dx - 13 * dz);
      const shell = rng() < 0.8 ? 1 - rng() * 0.035 : Math.pow(rng(), 0.6) * 0.93;
      const r = (1 + fold) * shell;
      x = dx * r * 0.8;
      y = dy * r * 0.7;
      z = dz * r * 1.06;
      if (y > -0.1) x += Math.sign(x || 1) * 0.055;
      if (y < -0.32) y = -0.32 + (y + 0.32) * 0.45;
      y += 0.08;
    } else if (pick < 0.96) {
      const [dx, dy, dz] = randomDirection(rng);
      const shell = rng() < 0.85 ? 1 : Math.pow(rng(), 0.5);
      const stripe = 1 + 0.06 * Math.sin(dy * 28);
      x = dx * 0.46 * shell * stripe;
      y = -0.4 + dy * 0.2 * shell;
      z = -0.66 + dz * 0.3 * shell * stripe;
    } else {
      const t = rng();
      const theta = rng() * Math.PI * 2;
      const radius = 0.11 * (1 - t * 0.25) * Math.sqrt(rng());
      x = Math.cos(theta) * radius;
      y = -0.3 - t * 0.6;
      z = -0.32 - t * 0.12 + Math.sin(theta) * radius;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    seeds[i] = rng();
  }
  return {positions, seeds};
}

const SLICE_COUNT = 155;

function createMaterialParameters(): THREE.ShaderMaterialParameters {
  return {
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uTime: {value: 0},
      uPointer: {value: new THREE.Vector2()},
      uAspect: {value: 1},
      uSlice: {value: 0},
      uPixelRatio: {value: 1},
      uSize: {value: 9},
      uInk: {value: new THREE.Color()},
      uEdema: {value: new THREE.Color()},
      uEnhancing: {value: new THREE.Color()},
      uCore: {value: new THREE.Color()},
      uScan: {value: new THREE.Color()},
    },
  };
}

interface FrameTargets {
  material: THREE.ShaderMaterial | null;
  group: THREE.Group | null;
  hovering: boolean;
  palette: BrainPalette;
  reducedMotion: boolean;
  onSlice?: (slice: number) => void;
}

/** Per-frame animation state, kept outside React's render cycle. */
class BrainSimulation {
  private readonly pointer = new THREE.Vector2(0.2, 0.1);
  private readonly target = new THREE.Vector2();
  private lastSlice = -1;
  private palette: BrainPalette | null = null;

  tick(state: RootState, delta: number, targets: FrameTargets): void {
    const u = targets.material?.uniforms;
    if (!u) return;
    if (this.palette !== targets.palette) {
      this.palette = targets.palette;
      u.uInk.value.set(targets.palette.ink);
      u.uEdema.value.set(targets.palette.edema);
      u.uEnhancing.value.set(targets.palette.enhancing);
      u.uCore.value.set(targets.palette.core);
      u.uScan.value.set(targets.palette.scan);
    }
    const t = state.clock.elapsedTime;
    u.uTime.value = t;
    u.uAspect.value = state.viewport.aspect;
    u.uPixelRatio.value = state.gl.getPixelRatio();

    // When the cursor is away the lesion wanders on a slow Lissajous path,
    // so touch devices still see the segmentation demo.
    if (targets.hovering) {
      this.target.copy(state.pointer);
    } else {
      this.target.set(Math.sin(t * 0.35) * 0.35, Math.sin(t * 0.52) * 0.25);
    }
    this.pointer.lerp(this.target, Math.min(1, delta * 4));
    u.uPointer.value.copy(this.pointer);

    const sweep = targets.reducedMotion ? 0.1 : Math.sin(t * 0.32) * 1.05;
    u.uSlice.value = sweep;
    const slice = Math.round(((sweep + 1.05) / 2.1) * (SLICE_COUNT - 1));
    if (slice !== this.lastSlice) {
      this.lastSlice = slice;
      targets.onSlice?.(slice);
    }

    const g = targets.group;
    if (g && !targets.reducedMotion) {
      const ease = Math.min(1, delta * 2);
      const yaw = -0.9 + t * 0.12 + this.pointer.x * 0.25;
      g.rotation.y += (yaw - g.rotation.y) * ease;
      g.rotation.x += (0.18 - this.pointer.y * 0.15 - g.rotation.x) * ease;
    }
  }
}

interface BrainPointsProps extends BrainSceneProps {
  hoverRef: RefObject<boolean>;
}

function BrainPoints({palette, reducedMotion, onSlice, hoverRef}: BrainPointsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [sim] = useState(() => new BrainSimulation());
  const {size} = useThree();
  const count = size.width < 640 ? 9000 : 16000;

  const geometry = useMemo(() => {
    const {positions, seeds} = buildBrain(count);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [count]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [materialParameters] = useState(createMaterialParameters);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    sim.tick(state, delta, {
      material: materialRef.current,
      group: groupRef.current,
      hovering: hoverRef.current,
      palette,
      reducedMotion,
      onSlice,
    });
  });

  return (
    <group ref={groupRef} rotation={[0.18, -0.9, 0]}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          args={[materialParameters]}
          transparent
          depthWrite={false}
          blending={palette.additive ?
            THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

/** WebGL canvas hosting the brain point cloud. */
export default function BrainScene(props: BrainSceneProps) {
  const hoverRef = useRef(false);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{position: [0, 0.05, 3.3], fov: 38}}
      gl={{antialias: true, alpha: true, powerPreference: 'high-performance'}}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      aria-hidden
    >
      <BrainPoints {...props} hoverRef={hoverRef} />
    </Canvas>
  );
}
