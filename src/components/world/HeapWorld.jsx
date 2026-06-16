import { Text } from "@react-three/drei";
import { fmtVal, heapLayout } from "./utils";

// Renders a heapq-backed list as a binary-tree pyramid (parent i -> children
// 2i+1, 2i+2), the structure heapq actually maintains.
function Edge({ from, to }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  return (
    <mesh position={[(from[0] + to[0]) / 2, 0.04, (from[1] + to[1]) / 2]} rotation={[0, -ang, 0]}>
      <boxGeometry args={[len, 0.06, 0.12]} />
      <meshStandardMaterial color="#3d6fa8" emissive="#4a78c8" emissiveIntensity={0.3} />
    </mesh>
  );
}

export default function HeapWorld({ name, values, origin, stepIndex }) {
  const pos = heapLayout(values.length);
  return (
    <group position={origin}>
      <Text position={[0, 0.5, -1.1]} fontSize={0.34} color="#8fa3d0">
        {name} (heap)
      </Text>
      {values.map((_, i) => {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        return (
          <group key={"e" + i}>
            {l < values.length && <Edge from={pos[i]} to={pos[l]} />}
            {r < values.length && <Edge from={pos[i]} to={pos[r]} />}
          </group>
        );
      })}
      {values.map((v, i) => (
        <group key={i} position={[pos[i][0], 0, pos[i][1]]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.56, 0.3, 20]} />
            <meshStandardMaterial
              color={i === 0 ? "#3a4d7a" : "#2c3a5e"}
              emissive={i === 0 ? "#59a8e8" : "#000000"}
              emissiveIntensity={i === 0 ? 0.4 : 0}
              roughness={0.55}
            />
          </mesh>
          <Text position={[0, 0.17, 0.14]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#fff">
            {fmtVal(v)}
          </Text>
        </group>
      ))}
    </group>
  );
}
