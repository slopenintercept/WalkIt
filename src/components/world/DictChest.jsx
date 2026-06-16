import { Billboard, Text } from "@react-three/drei";
import { fmtVal } from "./utils";

// A dict rendered as a treasure chest with its key: value pairs floating above.
export default function DictChest({ name, entries, position }) {
  const lines = Object.entries(entries).map(([k, v]) => `${k} : ${fmtVal(v)}`);
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.5, 0.7, 1.0]} />
        <meshStandardMaterial color="#7a5a2e" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.74, -0.16]} rotation={[-0.85, 0, 0]}>
        <boxGeometry args={[1.5, 0.12, 1.05]} />
        <meshStandardMaterial color="#8d6a38" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.42, 0.51]}>
        <boxGeometry args={[0.18, 0.22, 0.06]} />
        <meshStandardMaterial color="#e8c35a" metalness={0.6} roughness={0.3} />
      </mesh>
      <Billboard position={[0, 1.5 + lines.length * 0.15, 0]}>
        <Text fontSize={0.27} color="#ffd97a" anchorY="bottom" outlineWidth={0.018} outlineColor="#0b0e1a">
          {name}
        </Text>
        <Text
          position={[0, -0.08, 0]}
          fontSize={0.24}
          color="#ffffff"
          anchorY="top"
          textAlign="left"
          lineHeight={1.35}
          outlineWidth={0.014}
          outlineColor="#0b0e1a"
        >
          {lines.length ? lines.join("\n") : "(empty)"}
        </Text>
      </Billboard>
    </group>
  );
}
