import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

// A labeled character that walks between tiles/platforms. `target` is where
// its feet should stand; `fallen` plays the off-the-edge fall and freezes.
export default function PointerGuy({ name, color, target, fallen, stepIndex }) {
  const g = useRef();
  const placed = useRef(false);
  const fall = useRef(0);

  useLayoutEffect(() => {
    if (!placed.current && g.current) {
      g.current.position.set(target[0], target[1], target[2]);
      placed.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fallen) fall.current = 0;
  }, [fallen, stepIndex]);

  useFrame((state, dt) => {
    const o = g.current;
    if (!o) return;
    // when fallen, tumble a bit past the edge and land beside the platform
    const tx = fallen ? target[0] + 0.45 : target[0];
    o.position.x = THREE.MathUtils.damp(o.position.x, tx, 7, dt);
    o.position.z = THREE.MathUtils.damp(o.position.z, target[2], 7, dt);
    let ty = target[1];
    if (fallen) {
      fall.current = Math.min(fall.current + dt * 2, 1);
      ty = -0.14 * fall.current + target[1] * (1 - fall.current);
    }
    const moving = !fallen && Math.abs(o.position.x - target[0]) > 0.05;
    const hop = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.22 : 0;
    o.position.y = THREE.MathUtils.damp(o.position.y, ty + hop, fallen ? 3.5 : 9, dt);
    o.rotation.z = THREE.MathUtils.damp(o.rotation.z, fallen ? Math.PI / 2.1 : 0, 4, dt);
  });

  return (
    <group ref={g}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.16, 0.3, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.68, 0]}>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <Billboard position={[0, 1.18, 0]}>
        <Text fontSize={0.34} color={color} outlineWidth={0.024} outlineColor="#0b0e1a">
          {name}
        </Text>
      </Billboard>
    </group>
  );
}
