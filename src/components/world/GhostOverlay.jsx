import { Billboard, Text } from "@react-three/drei";
import { fmtVal } from "./utils";

// Translucent green render of the EXPECTED state, shown beside the actual
// state at the divergence step.
export default function GhostOverlay({ expected, position, label = "expected" }) {
  const isArr = Array.isArray(expected);
  const items = isArr ? expected.slice(0, 16) : null;
  const centerX = isArr && items.length > 1 ? ((items.length - 1) * 0.95) / 2 : 0;
  return (
    <group position={position}>
      <Billboard position={[centerX, 1.6, 0]}>
        <Text fontSize={0.28} color="#34d399" outlineWidth={0.018} outlineColor="#0b0e1a">
          {label}
        </Text>
      </Billboard>
      {isArr ? (
        items.length === 0 ? (
          <Billboard position={[0, 0.6, 0]}>
            <Text fontSize={0.32} color="#9fe8c8">
              []
            </Text>
          </Billboard>
        ) : (
          items.map((v, i) => (
            <group key={i} position={[i * 0.95, 0.5, 0]}>
              <mesh>
                <boxGeometry args={[0.8, 0.36, 0.8]} />
                <meshStandardMaterial
                  color="#34d399"
                  transparent
                  opacity={0.28}
                  emissive="#34d399"
                  emissiveIntensity={0.45}
                />
              </mesh>
              <Text
                position={[0, 0.2, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#b8ffe3"
              >
                {fmtVal(v)}
              </Text>
            </group>
          ))
        )
      ) : (
        <group position={[0, 0.55, 0]}>
          <mesh>
            <boxGeometry args={[1.3, 0.7, 0.9]} />
            <meshStandardMaterial
              color="#34d399"
              transparent
              opacity={0.28}
              emissive="#34d399"
              emissiveIntensity={0.45}
            />
          </mesh>
          <Billboard position={[0, 0, 0.55]}>
            <Text fontSize={0.36} color="#d9ffee" outlineWidth={0.02} outlineColor="#0b0e1a">
              {fmtVal(expected)}
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}
