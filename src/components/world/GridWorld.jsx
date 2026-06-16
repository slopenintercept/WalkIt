import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { fmtVal } from "./utils";

const CELL = 1.15;

function Cell({ x, z, value, flash, current, stepIndex }) {
  const mat = useRef();
  const age = useRef(0);
  useEffect(() => {
    age.current = 0;
  }, [stepIndex]);
  useFrame((_, dt) => {
    age.current += dt;
    if (!mat.current) return;
    let color = "#000000";
    let intensity = 0;
    if (current) {
      color = "#2ecc71";
      intensity = 0.55;
    }
    if (flash && age.current < 0.7) {
      const f = (0.7 - age.current) * 1.6;
      if (f > intensity) {
        color = "#ffb454";
        intensity = f;
      }
    }
    mat.current.emissive.set(color);
    mat.current.emissiveIntensity = intensity;
  });
  const label = fmtVal(value);
  const size = label.length > 3 ? Math.max(0.2, 1.0 / label.length) : 0.4;
  // dark base for "0"/water-ish falsy cells, lighter for filled
  const base = value === 0 || value === "0" || value === "." || value === false
    ? "#1a2138"
    : "#33436b";
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CELL * 0.92, 0.4, CELL * 0.92]} />
        <meshStandardMaterial ref={mat} color={base} roughness={0.6} />
      </mesh>
      <Text
        position={[0, 0.22, 0.04]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={size}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default function GridWorld({ name, rows, origin, cell, events, stepIndex }) {
  const flash = new Set();
  for (const e of events) {
    if (e.type === "grid-set" && e.name === name)
      for (const [r, c] of e.cells) flash.add(r + "," + c);
  }
  const cols = Math.max(0, ...rows.map((r) => (Array.isArray(r) ? r.length : 0)));
  const w = (cols - 1) * CELL;
  const h = (rows.length - 1) * CELL;
  return (
    <group position={origin}>
      <Text position={[-0.9, 0.4, -0.9]} fontSize={0.34} color="#8fa3d0" anchorX="right">
        {name}
      </Text>
      {rows.map((row, r) =>
        (Array.isArray(row) ? row : [row]).map((v, c) => (
          <Cell
            key={r + "_" + c}
            x={c * CELL - w / 2}
            z={r * CELL - h / 2}
            value={v}
            flash={flash.has(r + "," + c)}
            current={cell && cell.grid === name && cell.r === r && cell.c === c}
            stepIndex={stepIndex}
          />
        ))
      )}
    </group>
  );
}
