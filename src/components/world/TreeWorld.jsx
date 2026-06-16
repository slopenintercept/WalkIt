import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import PointerGuy from "./PointerGuy";
import { colorFor, fmtVal, treeLayout, STAND_SLOTS } from "./utils";

function Edge({ from, to, flash, stepIndex }) {
  const mat = useRef();
  const age = useRef(0);
  useEffect(() => {
    age.current = 0;
  }, [stepIndex, from[0], from[1], to[0], to[1]]);
  useFrame((_, dt) => {
    age.current += dt;
    if (!mat.current) return;
    const f = flash ? Math.max(0, 0.8 - age.current) : 0;
    mat.current.emissive.set(f > 0 ? "#ffb454" : "#4a78c8");
    mat.current.emissiveIntensity = 0.3 + f * 1.6;
  });
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, 0.04, (from[1] + to[1]) / 2]}
      rotation={[0, -ang, 0]}
    >
      <boxGeometry args={[len, 0.07, 0.16]} />
      <meshStandardMaterial ref={mat} color="#3d6fa8" emissive="#4a78c8" emissiveIntensity={0.3} />
    </mesh>
  );
}

function NodePlatform({ pos, val }) {
  const label = fmtVal(val);
  const size = label.length > 3 ? Math.max(0.22, 1.3 / label.length) : 0.46;
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.28, 24]} />
        <meshStandardMaterial color="#2c3a5e" roughness={0.55} />
      </mesh>
      <Text
        position={[0, 0.16, 0.18]}
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

export default function TreeWorld({ step, stepIndex, rewired }) {
  const heap = step.heap || {};
  const { pos } = treeLayout(heap);
  const ptrEntries = [
    ...Object.entries(step.treePtrs).map(([n, id]) => [n, id, "tree"]),
  ];

  return (
    <group>
      {Object.entries(heap).map(([id, node]) => {
        const p = pos[id];
        if (!p) return null;
        return (
          <group key={"n" + id}>
            {node.left != null && pos[node.left] && (
              <Edge from={p} to={pos[node.left]} flash={rewired.includes(Number(id))} stepIndex={stepIndex} />
            )}
            {node.right != null && pos[node.right] && (
              <Edge from={p} to={pos[node.right]} flash={rewired.includes(Number(id))} stepIndex={stepIndex} />
            )}
          </group>
        );
      })}
      {Object.entries(heap).map(([id, node]) =>
        pos[id] ? <NodePlatform key={"p" + id} pos={pos[id]} val={node.val} /> : null
      )}
      {ptrEntries.map(([name, id], i) => {
        const p = id != null ? pos[id] : null;
        const slot = STAND_SLOTS[i % STAND_SLOTS.length];
        const base = p || [0, -2.4]; // null pointers wait just above the root
        return (
          <PointerGuy
            key={name}
            name={name}
            color={colorFor(name)}
            stepIndex={stepIndex}
            fallen={false}
            target={[base[0] + slot[0] * 0.7, 0.14, base[1] - 0.5 + slot[1] * 0.5]}
          />
        );
      })}
    </group>
  );
}
