# 🚩 Walk It

A visual debugger that renders Python code execution as a walkable, video-game-style 3D world.

Paste a (broken) LeetCode-style solution, pick a failing test case, and press **Run**. Walk It executes the code step by step in your browser, records every state change, renders it as a game world, and plants a **red flag** at the first step where execution diverges from what was expected — an out-of-bounds index becomes a character walking off the edge of the platform and falling.

It ships with **49 problems** (the NeetCode-style set) across ten categories — Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Heap, Graphs, and Matrix — each rendered with the data-structure metaphor that fits it (tiles, character pointers, tree/graph platforms, grids, heap pyramids, treasure-chest dicts, and an operation timeline for class-based "design" problems).

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. **Network access is required at runtime** — Python runs via [Pyodide](https://pyodide.org) loaded from the jsDelivr CDN (~10 MB, cached after the first visit), and the in-scene text font is also fetched remotely.

Pick a template, press **▶ Run** (each template loads with a classic beginner bug so the flag has something to point at), then scrub the timeline or press play. `load working solution` shows the same scene with the bug fixed.

## The visual language

| Code concept | In the world |
| --- | --- |
| List | A row of floor tiles, each showing its value and index |
| String | A row of character tiles (so two-pointer / sliding-window string problems walk the same way arrays do) |
| Index / pointer variable (`i`, `j`, `left`…) | A small labeled character standing on a tile; when the index changes, the character walks there |
| Out-of-bounds access | The character walks off the edge of the platform and falls; freeze frame + red flag |
| `for x in somelist` | `x` walks the tiles by iteration ("value scan") |
| Comparison on a branch line | Referenced tiles glow — green if the branch was taken, gray if not, blue if unknowable (single-line bodies) |
| Swap (`a[i], a[j] = a[j], a[i]`) | The two tiles lift, arc through the air, and trade places |
| Recursion | Translucent dungeon-floor slabs stack overhead — one per caller frame (plus a `call depth` line on the variables board) |
| Dict | A treasure chest with its `key : value` pairs floating above |
| Linked list | Floating platforms connected by bridges (the `next` pointers); a `None` pointer is a stub bridge into the fog; null-valued pointer variables stand on a "None" pad |
| Binary tree | Platforms laid out by depth, connected by edges; pointer variables (`root`, `node`…) stand on nodes; two-tree problems render a side-by-side forest |
| Graph | Nodes on a ring connected by edges; pointer variables stand on nodes |
| Heap (`heapq` list) | A binary-tree pyramid — parent `i`, children `2i+1`/`2i+2` — the structure `heapq` actually maintains |
| Matrix / grid | A 2-D field of cells; the active `grid[r][c]` cell glows; mutated cells flash |
| Design problem (class) | A timeline of method calls with their return values; the object's fields (`self.stack`, `self.cache`…) render with their own metaphors |
| Loop iterations | A floating `loop pass N` counter |
| Return value | An `output` pedestal (red when it's wrong) |
| Divergence | Red flag + pulsing ring, plus a translucent green **ghost** of the expected output |
| Other scalars | A floating `variables` board |

## Layout

- **Left** — CodeMirror editor; the line about to execute is highlighted in sync with the scene, plus the test-case input/expected JSON.
- **Center** — the 3D world (react-three-fiber). Orbit / pan / zoom with the mouse; the camera re-frames on each run.
- **Bottom** — timeline scrubber with one tick per execution step and the divergence step marked in red. Play / pause / step / 3 speeds (arrow keys and space work too). Scrubbing renders from the pre-computed trace; nothing re-executes.

When output ≠ expected, the timeline auto-jumps to the divergence step, and playback freezes there when playing through.

## How it works

```
┌────────────┐   trace JSON   ┌─────────────┐   analysis   ┌──────────────┐
│  Pyodide    │ ─────────────▶ │  analyze.js  │ ───────────▶ │  r3f scene    │
│  tracer.py  │                │  (derive     │              │  (World.jsx)  │
│ sys.settrace│                │   events)    │              │               │
└────────────┘                └─────────────┘              └──────────────┘
```

1. **`src/pyodide/tracer.py`** runs the user code under `sys.settrace` inside Pyodide (fully client-side, sandboxed). It builds inputs from JSON (linked lists, trees, graphs, grids, cyclic lists), runs either a single function or — for "design" problems — a recorded sequence of method calls on a class instance, then serializes the result back to JSON. Every `line` / `call` / `return` / `exception` event records a step: line number, a serialized snapshot of the locals, and a heap of reference-typed nodes (linked-list / tree / graph). Execution is killed after a **2,000-step budget** (infinite-loop protection — the kill signal derives from `BaseException` so a user's `except Exception:` can't swallow it, and top-level statements in a pasted script consume the same budget). Containers are capped at 30 rendered elements.
2. **`src/trace/analyze.js`** turns the raw trace into render-ready data: which ints are *pointers* into which list (via `arr[i]` patterns in the source + name heuristics), pointer moves, swaps, dict writes, bridge rewires, comparison glow (branch truth inferred from the indentation of the next executed line), loop laps, and the **divergence verdict**.
3. **`src/components/world/`** renders a snapshot per step. Scrubbing just changes the step index — every visual maps to the pre-computed trace, and each step maps 1:1 to a source line.

### Divergence detection (v1)

In priority order:

1. **Uncaught `IndexError`** → *out-of-bounds*: the offending pointer falls off its array at the exact index.
2. Any other uncaught exception → flag at the step where it was raised.
3. Trace truncated at the step limit → *probable infinite loop*.
4. Final output ≠ expected → flag at the function's return step (Two Sum compares order-insensitively).

Exceptions the user code catches (EAFP-style `try/except`) are recorded in the trace but never flagged — only the exception that actually escaped raises the flag.

Trace alignment against a reference solution is a v2 idea — see below.

## The trace JSON format

`walkit_run(payload)` (defined in `tracer.py`) returns this JSON. **New visual metaphors only need `analyze.js` + a new world component — the tracer doesn't change.**

```jsonc
{
  "steps": [
    {
      "i": 0,                  // step index
      "event": "call",         // "call" | "line" | "return" | "exception"
      "line": 1,               // 1-based line in the user's code
      "func": "two_sum",
      "depth": 1,              // call depth (1 = top-level user function)
      "locals": {              // snapshot BEFORE the line executes
        "nums":   { "t": "list", "v": [2, 7, 11, 15], "len": 4 },
        "target": { "t": "num",  "v": 9 },
        "name":   { "t": "str",  "v": "ab", "len": 2 },
        "flag":   { "t": "bool", "v": true },
        "x":      { "t": "none" },
        "seen":   { "t": "dict", "v": { "2": 0 }, "len": 1 },
        "vals":   { "t": "set",  "v": [1, 2], "len": 2 },
        "grid":   { "t": "grid", "v": [[1,0],[0,1]], "len": 2 }, // 2-D list
        "head":   { "t": "node",  "id": 1 },    // linked-list ref into "heap"
        "root":   { "t": "tnode", "id": 1 },    // tree ref into "heap"
        "g":      { "t": "gnode", "id": 1 },    // graph ref into "heap"
        "self":   { "t": "obj", "cls": "MinStack",  // design problems: attrs
                    "attrs": { "stack": { "t": "list", "v": [1], "len": 1 } } }
      },
      "heap": {                // present when reference-typed locals exist
        "1": { "kind": "list", "val": 1, "next": 2 },          // next id (null = end)
        "2": { "kind": "tree", "val": 5, "left": 3, "right": null },
        "4": { "kind": "graph", "val": 1, "neighbors": [5, 6] }
      },
      "ret": { "t": "num", "v": 7 },   // only on "return" events
      "exc": { "type": "IndexError", "msg": "list index out of range" } // only on "exception"
    }
  ],
  "result": [0, 1],        // plain-JSON output; lists/trees/graphs serialized back to arrays
  "error":  null,          // or { "type", "msg", "line" } for uncaught exceptions / syntax errors
  "truncated": false,      // true when the 2,000-step limit killed execution
  "stepLimit": 2000,
  "mode": "func",          // or "ops" for class/method design problems
  "ops": ["MinStack","push","getMin"]  // (ops mode) the method-call sequence
}
```

Notes:

- Container elements are primitives, short node labels (`→7` list, `△5` tree, `◆1` graph), or `repr()` strings; nesting beyond grids falls back to `repr`. `inf`/`nan` floats are encoded as strings (`"inf"`).
- `locals` snapshots are taken before each line runs, debugger-style: the effect of line *N* is visible in the *next* step's snapshot.
- Node ids are stable for the lifetime of a run (assigned on first sighting, with the source object retained so addresses can't be recycled), so platforms don't jump around as pointers move.
- In `"ops"` mode the trace covers the constructor plus every method call in sequence; `result` is the list of per-call return values (LeetCode style, `null` for the constructor).

### Tests

```bash
npm test
```

Two suites run the real tracer in Node-side Pyodide and feed the traces through the real `analyze.js`:

- **`tests/logic.test.mjs`** — 21 targeted assertions: out-of-bounds detection, caught-exception handling, the step-limit kill (including `try/except` and top-level-loop escapes), node-id stability, branch-truth inference (`if/else`, single-line bodies, loop exits), value-scan placement, and recursion depth.
- **`tests/all_templates.test.mjs`** — sweeps **all 49 templates**: every buggy default must raise a divergence flag on its first test case, and every reference solution must run clean on *all* its test cases (≈237 assertions). This is the regression net for adding or editing templates.

### Adding a problem template

Add an entry to `src/templates.js`:

- **Function problems**: `func`, `argNames`, `argKinds`, `retKind`, an optionally-buggy `defaultCode`, a correct `solutionCode`, and `tests: [{ args, expected }]`.
  - `argKinds`: `list | value | string | matrix | tree | linkedlist | linkedlist_cycle | graph`
  - `retKind`: `value | list | matrix | tree | linkedlist | graph`
  - `compare`: `exact` (default) | `index-pair` | `set` | `nested-set` (for order-insensitive answers)
  - `render: { heap: [names] }` to draw a list variable as a heap pyramid (defaults cover `heap`/`h`/`pq`)
- **Design problems**: `mode: "ops"`, `className`, and `tests: [{ ops, opArgs, expected }]` (LeetCode's operation/argument arrays).

Trees, graphs, grids, and heaps need no tracer changes — only a `group` and the right `argKinds`/`retKind`. A genuinely new metaphor means a new world component in `src/components/world/` plus a few lines in `analyze.js`; the tracer is already structure-agnostic.

## Scope and non-goals

Ships: all 49 problems in the list (Python only); arrays, strings, ints, dicts, sets, linked lists, binary trees, graphs, 2-D grids, heaps, and class-based design problems; a synced editor, 3-speed timeline, and the divergence flag + ghost overlay.

Deliberately out of scope: arbitrary problems (templates only — the tracer needs the input/output shapes), VR/WebXR (the scene graph is plain three.js objects, so a WebXR camera can be swapped in later), accounts/persistence, and smart step-by-step trace alignment against the reference solution (each template already carries a correct solution, ready for a future step-semantics aligner; today divergence is verdict-based — exception / step-limit / wrong-output).
