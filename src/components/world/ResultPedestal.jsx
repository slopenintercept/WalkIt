import { Billboard, Text } from "@react-three/drei";
import { fmtVal } from "./utils";

// Shows the function's actual returned value once execution reaches the return.
export default function ResultPedestal({ value, position, bad }) {
  const col = bad ? "#ff5d6e" : "#3ddc97";
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.95, 1.1, 0.6, 28]} />
        <meshStandardMaterial color="#222b49" roughness={0.6} />
      </mesh>
      <Billboard position={[0, 1.3, 0]}>
        <Text position={[0, 0.34, 0]} fontSize={0.26} color="#8fa3d0">
          output
        </Text>
        <Text fontSize={0.46} color={col} outlineWidth={0.022} outlineColor="#0b0e1a">
          {fmtVal(value)}
        </Text>
      </Billboard>
    </group>
  );
}
