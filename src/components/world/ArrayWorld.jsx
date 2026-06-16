import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { TILE, fmtVal } from "./utils";

const BASE_COLOR = "#2c3a5e";

function Tile({ index, value, glowColor, glowStrength, flash, stepIndex }) {
  const mat = useRef();
  const age = useRef(0);
  useEffect(() => {
    age.current = 0;
  }, [stepIndex]);
  useFrame((_, dt) => {
    age.current += dt;
    if (!mat.current) return;
    let intensity = 0;
    let color = "#000000";
    if (glowColor) {
      color = glowColor;
      intensity = glowStrength;
    }
    if (flash && age.current < 0.7) {
      const f = (0.7 - age.current) * 1.6;
      if (f > intensity) {
        intensity = f;
        color = "#ffb454";
      }
    }
    mat.current.emissive.set(color);
    mat.current.emissiveIntensity = intensity;
  });
  const label = fmtVal(value);
  const size = label.length > 4 ? Math.max(0.18, 1.5 / label.length) : 0.42;
  return (
    <group position={[index * TILE, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.12, 0.5, 1.12]} />
        <meshStandardMaterial ref={mat} color={BASE_COLOR} roughness={0.55} metalness={0.1} />
      </mesh>
      <Text
        position={[0, 0.27, 0.24]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={size}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text position={[0, 0.08, 0.63]} fontSize={0.19} color="#7d8db5">
        {String(index)}
      </Text>
    </group>
  );
}

// One-shot arc animation replaying a detected swap at the current step.
function SwapFx({ a, b, values, stepIndex }) {
  const t = useRef(0);
  const ga = useRef();
  const gb = useRef();
  useEffect(() => {
    t.current = 0;
  }, [stepIndex, a, b]);
  useFrame((_, dt) => {
    t.current = Math.min(t.current + dt * 1.9, 1);
    const p = t.current;
    const ease = p * p * (3 - 2 * p);
    const arc = Math.sin(ease * Math.PI) * 1.0;
    if (ga.current) {
      ga.current.position.x = THREE.MathUtils.lerp(b * TILE, a * TILE, ease);
      ga.current.position.y = 0.6 + arc;
      ga.current.visible = p < 1;
    }
    if (gb.current) {
      gb.current.position.x = THREE.MathUtils.lerp(a * TILE, b * TILE, ease);
      gb.current.position.y = 0.6 + arc * 0.7;
      gb.current.visible = p < 1;
    }
  });
  // full-size tile proxies, so the swap reads as the tiles themselves
  // lifting and trading places
  const cube = (ref, v) => (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[1.12, 0.5, 1.12]} />
        <meshStandardMaterial color="#2c3a5e" emissive="#ffb454" emissiveIntensity={0.45} />
      </mesh>
      <Text position={[0, 0.27, 0.24]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.42} color="#fff">
        {fmtVal(v)}
      </Text>
    </group>
  );
  return (
    <>
      {cube(ga, values[a])}
      {cube(gb, values[b])}
    </>
  );
}

export default function ArrayWorld({ name, values, origin, cmp, events, stepIndex }) {
  const flashSet = new Set();
  let swapEvent = null;
  for (const e of events) {
    if (e.array !== name) continue;
    if (e.type === "swap") swapEvent = e;
    if (e.type === "set") e.indices.forEach((i) => flashSet.add(i));
    if (e.type === "resize") values.forEach((_, i) => flashSet.add(i));
  }
  const glowMap = new Map();
  if (cmp) {
    // green = branch taken, gray = not taken, blue = truth unknown
    const glow =
      cmp.truth === true
        ? ["#2ecc71", 0.6]
        : cmp.truth === false
          ? ["#5a6378", 0.35]
          : ["#59a8e8", 0.45];
    for (const t of cmp.tiles) {
      if (t.array === name && t.index >= 0 && t.index < values.length) {
        glowMap.set(t.index, glow);
      }
    }
  }
  return (
    <group position={origin}>
      <Text position={[-1.5, 0.35, 0]} fontSize={0.38} color="#8fa3d0" anchorX="right">
        {name}
      </Text>
      {values.length === 0 && (
        <Text position={[0, 0.3, 0]} fontSize={0.3} color="#5f6c92">
          (empty)
        </Text>
      )}
      {values.map((v, i) => (
        <Tile
          key={i}
          index={i}
          value={v}
          glowColor={glowMap.get(i)?.[0]}
          glowStrength={glowMap.get(i)?.[1] ?? 0}
          flash={flashSet.has(i)}
          stepIndex={stepIndex}
        />
      ))}
      {swapEvent && (
        <SwapFx a={swapEvent.a} b={swapEvent.b} values={values} stepIndex={stepIndex} />
      )}
    </group>
  );
}
