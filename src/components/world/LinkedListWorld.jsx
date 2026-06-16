import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import PointerGuy from "./PointerGuy";
import { NODE_DX, colorFor, fmtVal, STAND_SLOTS } from "./utils";

const nodePos = (id) => [(id - 1) * NODE_DX, 0, 0];

function NodePlatform({ id, node }) {
  return (
    <group position={nodePos(id)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.3, 1.7]} />
        <meshStandardMaterial color="#2c3a5e" roughness={0.55} />
      </mesh>
      <Text
        position={[0, 0.17, 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
      >
        {fmtVal(node.val)}
      </Text>
      <Text
        position={[0, 0.17, -0.65]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        color="#7d8db5"
      >
        {"node " + id}
      </Text>
    </group>
  );
}

// Bridge for a `next` pointer. `to === null` renders a stub out into the fog.
function Bridge({ fromId, toId, flash, stepIndex }) {
  const mat = useRef();
  const age = useRef(0);
  useEffect(() => {
    age.current = 0;
  }, [stepIndex, toId]);
  useFrame((_, dt) => {
    age.current += dt;
    if (!mat.current) return;
    const f = flash ? Math.max(0, 0.8 - age.current) : 0;
    mat.current.emissive.set(f > 0 ? "#ffb454" : "#59c2ff");
    mat.current.emissiveIntensity = 0.25 + f * 1.6;
  });

  if (toId === null) {
    const from = nodePos(fromId);
    return (
      <group position={[from[0], 0, from[2] - 0.85]}>
        <mesh>
          <boxGeometry args={[0.5, 0.08, 1.2]} />
          <meshStandardMaterial
            ref={mat}
            color="#3d6fa8"
            emissive="#59c2ff"
            emissiveIntensity={0.25}
            transparent
            opacity={0.22}
          />
        </mesh>
        <Text
          position={[0, 0.15, -0.95]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.26}
          color="#5f6c92"
        >
          None
        </Text>
      </group>
    );
  }

  const from = nodePos(fromId);
  const to = nodePos(toId);
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.max(Math.hypot(dx, dz) - 1.7, 0.2);
  const ang = Math.atan2(dz, dx);
  const mid = [(from[0] + to[0]) / 2, 0, (from[2] + to[2]) / 2];
  return (
    <group position={mid} rotation={[0, -ang, 0]}>
      <mesh castShadow>
        <boxGeometry args={[len, 0.09, 0.42]} />
        <meshStandardMaterial
          ref={mat}
          color="#3d6fa8"
          emissive="#59c2ff"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh position={[len * 0.28, 0.14, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.34, 12]} />
        <meshStandardMaterial color="#9fd8ff" emissive="#59c2ff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export default function LinkedListWorld({ step, stepIndex, rewired }) {
  const heap = step.heap || {};
  const ids = Object.keys(heap).map(Number).sort((a, b) => a - b);
  const ptrEntries = Object.entries(step.nodePtrs);
  return (
    <group>
      {/* None pad — where null pointers stand */}
      <group position={[-NODE_DX, 0, 0]}>
        <mesh receiveShadow position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.85, 0.95, 0.18, 24]} />
          <meshStandardMaterial color="#1a2138" roughness={0.9} />
        </mesh>
        <Text position={[0, 0.05, 0.45]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.26} color="#5f6c92">
          None
        </Text>
      </group>
      {ids.map((id) => (
        <NodePlatform key={id} id={id} node={heap[String(id)]} />
      ))}
      {ids.map((id) => (
        <Bridge
          key={"b" + id}
          fromId={id}
          toId={heap[String(id)].next}
          flash={rewired.includes(id)}
          stepIndex={stepIndex}
        />
      ))}
      {ptrEntries.map(([name, nid], i) => {
        const base = nid ? nodePos(nid) : [-NODE_DX, 0, 0];
        const slot = STAND_SLOTS[i % STAND_SLOTS.length];
        return (
          <PointerGuy
            key={name}
            name={name}
            color={colorFor(name)}
            stepIndex={stepIndex}
            fallen={false}
            target={[base[0] + slot[0], 0.15, base[2] - 0.25 + slot[1] * 0.6]}
          />
        );
      })}
    </group>
  );
}
