import { Billboard, Text } from "@react-three/drei";
import { fmtVal } from "./utils";

// Design problems: a timeline of method calls with their return values, the
// active one highlighted. The object's internal state renders separately
// (its attributes are flattened into the normal list/dict/scalar views).
export default function OpsPanel({ ops, outputs, active, position }) {
  if (!ops) return null;
  const window = 9;
  const half = Math.floor(window / 2);
  let start = Math.max(0, active - half);
  let end = Math.min(ops.length, start + window);
  start = Math.max(0, end - window);
  const lines = [];
  for (let i = start; i < end; i++) {
    const out = outputs && outputs[i] !== undefined && outputs[i] !== null ? ` → ${fmtVal(outputs[i])}` : "";
    const mark = i === active ? "▶ " : "  ";
    lines.push(`${mark}${i + 1}. ${ops[i]}${out}`);
  }
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[4.6, 0.5 + lines.length * 0.4]} />
        <meshBasicMaterial color="#141a30" transparent opacity={0.86} />
      </mesh>
      <Text position={[0, (lines.length * 0.4) / 2 + 0.05, 0.01]} fontSize={0.26} color="#8fa3d0">
        operations
      </Text>
      <Text
        position={[-2.0, (lines.length * 0.4) / 2 - 0.3, 0.01]}
        fontSize={0.27}
        color="#e8ecf4"
        anchorX="left"
        anchorY="top"
        textAlign="left"
        lineHeight={1.45}
        font={undefined}
      >
        {lines.join("\n")}
      </Text>
    </Billboard>
  );
}
