import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// The divergence marker: red flag on a pole with a pulsing ring at its base.
export default function RedFlag({ position }) {
  const ring = useRef();
  useFrame((state) => {
    if (!ring.current) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.14;
    ring.current.scale.set(s, s, 1);
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.8, 8]} />
        <meshStandardMaterial color="#d8dce8" roughness={0.4} />
      </mesh>
      <mesh position={[0.34, 1.56, 0]} castShadow>
        <boxGeometry args={[0.66, 0.42, 0.03]} />
        <meshStandardMaterial
          color="#ff3b4d"
          emissive="#ff3b4d"
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.64, 32]} />
        <meshBasicMaterial color="#ff3b4d" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
