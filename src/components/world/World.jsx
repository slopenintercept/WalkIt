import { Billboard, Text } from "@react-three/drei";
import ArrayWorld from "./ArrayWorld";
import PointerGuy from "./PointerGuy";
import LinkedListWorld from "./LinkedListWorld";
import TreeWorld from "./TreeWorld";
import GraphWorld from "./GraphWorld";
import GridWorld from "./GridWorld";
import HeapWorld from "./HeapWorld";
import DictChest from "./DictChest";
import ScalarBoard from "./ScalarBoard";
import OpsPanel from "./OpsPanel";
import RedFlag from "./RedFlag";
import GhostOverlay from "./GhostOverlay";
import ResultPedestal from "./ResultPedestal";
import { TILE, colorFor, STAND_SLOTS, fmtVal } from "./utils";

export default function World({ analysis, stepIndex }) {
  const step = analysis.steps[stepIndex];
  if (!step) return null;
  const div = analysis.divergence;
  const flagOn = !!div && stepIndex >= div.step;
  const cmp = analysis.cmps[stepIndex];
  const events = analysis.events[stepIndex] || [];
  const ex = analysis.extentX;
  const kind = analysis.structureKind;
  const flatScene = kind === null; // arrays / grids / heaps / strings

  // lane out the 1D rows (arrays + tiled strings) in -z
  const origins = {};
  analysis.listOrder.forEach((nm, i) => {
    origins[nm] = [0, 0, -i * 3.2];
  });
  const backZ = -analysis.listOrder.length * 3.2 - 3;
  const heapOrigins = {};
  [...analysis.heapNames].forEach((nm, i) => {
    heapOrigins[nm] = [0, 0, backZ - i * 4.5];
  });
  const gridOrigins = {};
  analysis.gridOrder.forEach((nm, i) => {
    const rows = step.grids[nm]?.length ?? 0;
    gridOrigins[nm] = [0, 0, flatScene && analysis.listOrder.length ? backZ - i * (rows + 4) : 0];
  });

  const rewired = events.filter((e) => e.type === "rewire").map((e) => e.id);

  let flagPos = [ex / 2, 0.25, 0];
  let ghostPos = [ex / 2 + 2.4, 0.2, 2.6];
  if (div) {
    if (div.kind === "oob" && div.faller) {
      const o = origins[div.faller.array] || [0, 0, 0];
      flagPos = [o[0] + div.faller.index * TILE, 0.25, o[2]];
      ghostPos = [flagPos[0] + 1.6, 0.2, flagPos[2] + 2.4];
    } else if (div.kind === "wrong-output") {
      flagPos = [ex / 2 + 1.6, 0, 3.8];
      ghostPos = [ex / 2 + 3.9, 0, 3.8];
    }
  }

  const scalarLines = [];
  for (const [nm, v] of Object.entries(step.scalars)) {
    let val;
    if (v.t === "str") val = `'${fmtVal(v.v)}'`;
    else if (v.t === "none") val = "None";
    else if (v.t === "set") val = "{" + v.v.map(fmtVal).join(",") + "}";
    else if (v.t === "obj") val = v.cls ? `<${v.cls}>` : "<obj>";
    else val = fmtVal(v.v);
    scalarLines.push(`${nm} = ${val}`);
  }
  if (step.depth > 1 && !analysis.opsMode) scalarLines.push(`call depth: ${step.depth}`);

  // dungeon-floor slabs only in flat/linked scenes (tree/graph DFS already
  // shows depth spatially, and the slabs would clutter them)
  const floorsAbove =
    !analysis.opsMode && (flatScene || kind === "linked")
      ? Math.min(Math.max(step.depth - 1, 0), 4)
      : 0;

  const laps = analysis.laps[stepIndex];
  const showResult =
    !analysis.opsMode &&
    (flatScene || kind === "linked") &&
    analysis.hasResult &&
    analysis.lastReturnStep >= 0 &&
    stepIndex >= analysis.lastReturnStep;

  return (
    <group>
      {flatScene && (
        <mesh receiveShadow position={[ex / 2 - 1, -0.42, -1]}>
          <boxGeometry args={[ex + 16, 0.3, 22]} />
          <meshStandardMaterial color="#10162c" roughness={0.95} />
        </mesh>
      )}

      {/* 1D rows: arrays and tiled strings */}
      {analysis.listOrder.map(
        (nm) =>
          step.lists[nm] && (
            <ArrayWorld
              key={nm}
              name={nm}
              values={step.lists[nm]}
              origin={origins[nm]}
              cmp={cmp}
              events={events}
              stepIndex={stepIndex}
            />
          )
      )}
      {analysis.listOrder.length > 0 &&
        Object.entries(step.pointers).map(([name, p], i) => {
          const o = origins[p.array] || [0, 0, 0];
          const slot = STAND_SLOTS[i % STAND_SLOTS.length];
          const fallen =
            flagOn && div.kind === "oob" && div.faller && div.faller.name === name;
          return (
            <PointerGuy
              key={name}
              name={name}
              color={colorFor(name)}
              stepIndex={stepIndex}
              fallen={!!fallen}
              target={[
                o[0] + p.index * TILE + slot[0] * 0.5,
                0.25,
                o[2] - 0.28 + slot[1] * 0.5,
              ]}
            />
          );
        })}

      {/* heaps */}
      {[...analysis.heapNames].map(
        (nm) =>
          step.lists[nm] && (
            <HeapWorld key={nm} name={nm} values={step.lists[nm]} origin={heapOrigins[nm]} stepIndex={stepIndex} />
          )
      )}

      {/* grids / matrices */}
      {analysis.gridOrder.map(
        (nm) =>
          step.grids[nm] && (
            <GridWorld
              key={nm}
              name={nm}
              rows={step.grids[nm]}
              origin={gridOrigins[nm]}
              cell={step.cell}
              events={events}
              stepIndex={stepIndex}
            />
          )
      )}

      {/* structure centerpieces */}
      {kind === "linked" && <LinkedListWorld step={step} stepIndex={stepIndex} rewired={rewired} />}
      {kind === "tree" && <TreeWorld step={step} stepIndex={stepIndex} rewired={rewired} />}
      {kind === "graph" && <GraphWorld step={step} stepIndex={stepIndex} />}

      {analysis.dictOrder.map(
        (nm, i) =>
          step.dicts[nm] && (
            <DictChest
              key={nm}
              name={nm}
              entries={step.dicts[nm]}
              position={[-4.2, 0, 2.0 + i * 2.6]}
            />
          )
      )}

      {Array.from({ length: floorsAbove }, (_, k) => (
        <mesh key={"floor" + k} position={[ex / 2 - 1, 3.0 + k * 1.1, -1]}>
          <boxGeometry args={[ex + 12, 0.16, 14]} />
          <meshStandardMaterial color="#26304f" transparent opacity={0.14} />
        </mesh>
      ))}

      <ScalarBoard lines={scalarLines} position={[-4.0, 2.2, -2.4]} />

      {analysis.opsMode && (
        <OpsPanel
          ops={analysis.ops}
          outputs={analysis.outputs}
          active={analysis.opAtStep ? analysis.opAtStep[stepIndex] : -1}
          position={[ex / 2 + 4.5, 2.4, 0]}
        />
      )}

      {laps > 0 && (
        <Billboard position={[ex / 2, 3.6, -1]}>
          <Text fontSize={0.4} color="#8fd3ff" outlineWidth={0.02} outlineColor="#0b0e1a">
            {`loop pass ${laps}`}
          </Text>
        </Billboard>
      )}
      {showResult && (
        <ResultPedestal
          value={analysis.result}
          position={[ex / 2 - 1.4, 0, 3.8]}
          bad={div?.kind === "wrong-output"}
        />
      )}
      {flagOn && <RedFlag position={flagPos} />}
      {flagOn && <GhostOverlay expected={analysis.expected} position={ghostPos} />}
    </group>
  );
}
