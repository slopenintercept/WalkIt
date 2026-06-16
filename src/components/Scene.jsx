import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import World from "./world/World";
import PointerGuy from "./world/PointerGuy";
import { TILE } from "./world/utils";

// Re-frames the camera whenever a new trace arrives so wide scenes
// (e.g. long linked lists) fit in view. Manual orbiting stays untouched
// between runs.
// trees/graphs center their content about x=0; arrays/linked lists grow
// rightward from x=0. Frame accordingly.
function sceneCenterX(analysis) {
  const ex = analysis ? analysis.extentX : 6;
  const centered = analysis?.structureKind === "tree" || analysis?.structureKind === "graph";
  return centered ? ex * 0.18 : ex * 0.5;
}

function CameraRig({ analysis }) {
  const { camera, controls } = useThree();
  const extentX = analysis ? analysis.extentX : 6;
  useEffect(() => {
    // frame the content width: distance ≈ width fits the ~54° horizontal fov.
    // wider scenes use a flatter, more head-on angle so tiles stay legible.
    const cx = sceneCenterX(analysis);
    const dist = Math.min(95, Math.max(11, extentX * 1.02 + 5));
    const dir = extentX > 16 ? [0.18, 0.42, 0.89] : [0.3, 0.58, 0.76];
    camera.position.set(cx + dir[0] * dist, dir[1] * dist, dir[2] * dist);
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(cx, 0.4, 0);
      controls.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis]);
  return null;
}

// Friendly placeholder before the first run — teaches the tile metaphor.
function IdleWorld() {
  const letters = ["W", "A", "L", "K", "I", "T"];
  return (
    <group>
      <mesh receiveShadow position={[3.2, -0.42, -1]}>
        <boxGeometry args={[16, 0.3, 12]} />
        <meshStandardMaterial color="#10162c" roughness={0.95} />
      </mesh>
      {letters.map((ch, i) => (
        <group key={i} position={[i * TILE, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.12, 0.5, 1.12]} />
            <meshStandardMaterial color="#2c3a5e" roughness={0.55} />
          </mesh>
          <Text
            position={[0, 0.27, 0.06]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.46}
            color="#ffffff"
          >
            {ch}
          </Text>
          <Text position={[0, 0.08, 0.63]} fontSize={0.19} color="#7d8db5">
            {String(i)}
          </Text>
        </group>
      ))}
      <PointerGuy name="you" color="#ffb454" target={[0, 0.25, 0]} fallen={false} stepIndex={0} />
      <Text position={[3.2, 2.4, -1]} fontSize={0.42} color="#8fa3d0">
        paste a solution, pick a test, press Run
      </Text>
    </group>
  );
}

export default function Scene({ analysis, stepIndex }) {
  const ex = analysis ? analysis.extentX : 6;
  const targetX = sceneCenterX(analysis);
  const shadowR = Math.max(20, ex * 0.7);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }} // lets users screenshot the canvas
      camera={{ position: [7, 7.5, 11.5], fov: 42 }}
    >
      <color attach="background" args={["#0b0e1a"]} />
      {/* fog scales with the scene so wide layouts don't vanish into haze */}
      <fog attach="fog" args={["#0b0e1a", 24 + ex, 70 + ex * 2.5]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.4} groundColor="#1b2240" color="#bcd0ff" />
      <directionalLight
        position={[targetX + 6, 16, 10]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowR}
        shadow-camera-right={shadowR}
        shadow-camera-top={shadowR}
        shadow-camera-bottom={-shadowR}
      />
      {analysis ? <World analysis={analysis} stepIndex={stepIndex} /> : <IdleWorld />}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.12}
        target={[targetX, 0.4, 0]}
        maxPolarAngle={Math.PI * 0.49}
        minDistance={4}
        maxDistance={130}
      />
      <CameraRig analysis={analysis} />
    </Canvas>
  );
}
