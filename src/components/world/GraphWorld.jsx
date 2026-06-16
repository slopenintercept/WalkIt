import { Text } from "@react-three/drei";
import PointerGuy from "./PointerGuy";
import { colorFor, fmtVal, graphLayout, STAND_SLOTS } from "./utils";

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

function GraphNode({ pos, val }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.66, 0.3, 6]} />
        <meshStandardMaterial color="#2c3a5e" roughness={0.5} />
      </mesh>
      <Text position={[0, 0.17, 0.16]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.46} color="#fff">
        {fmtVal(val)}
      </Text>
    </group>
  );
}

export default function GraphWorld({ step, stepIndex }) {
  const heap = step.heap || {};
  const { pos } = graphLayout(heap);
  const drawn = new Set();
  const edges = [];
  for (const [id, node] of Object.entries(heap)) {
    for (const nb of node.neighbors || []) {
      const key = id < nb ? `${id}-${nb}` : `${nb}-${id}`;
      if (drawn.has(key) || !pos[id] || !pos[nb]) continue;
      drawn.add(key);
      edges.push([pos[id], pos[nb], key]);
    }
  }
  const ptrEntries = Object.entries(step.graphPtrs);
  return (
    <group>
      {edges.map(([a, b, key]) => (
        <Edge key={key} from={a} to={b} />
      ))}
      {Object.entries(heap).map(([id, node]) =>
        pos[id] ? <GraphNode key={id} pos={pos[id]} val={node.val} /> : null
      )}
      {ptrEntries.map(([name, id], i) => {
        const p = id != null ? pos[id] : null;
        if (!p) return null;
        const slot = STAND_SLOTS[i % STAND_SLOTS.length];
        return (
          <PointerGuy
            key={name}
            name={name}
            color={colorFor(name)}
            stepIndex={stepIndex}
            fallen={false}
            target={[p[0] + slot[0] * 0.6, 0.16, p[1] - 0.4 + slot[1] * 0.4]}
          />
        );
      })}
    </group>
  );
}
