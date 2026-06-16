import { Billboard, Text } from "@react-three/drei";

// Floating sign listing scalar variables (non-pointer ints, strings, bools).
export default function ScalarBoard({ lines, position }) {
  if (!lines.length) return null;
  const h = 0.7 + lines.length * 0.36;
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[3.8, h]} />
        <meshBasicMaterial color="#141a30" transparent opacity={0.85} />
      </mesh>
      <Text
        position={[-1.7, h / 2 - 0.28, 0.01]}
        fontSize={0.24}
        color="#8fa3d0"
        anchorX="left"
      >
        variables
      </Text>
      <Text
        position={[-1.7, h / 2 - 0.6, 0.01]}
        fontSize={0.27}
        color="#e8ecf4"
        anchorX="left"
        anchorY="top"
        textAlign="left"
        lineHeight={1.35}
      >
        {lines.join("\n")}
      </Text>
    </Billboard>
  );
}
