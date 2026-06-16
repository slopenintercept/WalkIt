# Walk It — Product & Engineering Reference

> A visual debugger that renders Python code execution as a walkable, video‑game‑style 3D world. When a beginner's LeetCode solution fails, they don't read a stack trace — they *see* the exact moment their code went wrong, rendered as a physical event in the world.

This document is the complete reference: what the product is, who it's for, how every piece works, the data contract that ties it together, the full problem catalog, how to extend it, how it's tested, and where its edges are.

---

## Table of contents

1. [The idea in one minute](#1-the-idea-in-one-minute)
2. [Who it's for & the problem it solves](#2-who-its-for--the-problem-it-solves)
3. [The core loop (what a user actually does)](#3-the-core-loop-what-a-user-actually-does)
4. [The visual language](#4-the-visual-language)
5. [Architecture: the three‑stage pipeline](#5-architecture-the-three-stage-pipeline)
6. [Stage 1 — the tracer (`tracer.py`)](#6-stage-1--the-tracer-tracerpy)
7. [Stage 2 — the analyzer (`analyze.js`)](#7-stage-2--the-analyzer-analyzejs)
8. [Stage 3 — the renderer (`components/world/`)](#8-stage-3--the-renderer-componentsworld)
9. [The trace JSON format (full spec)](#9-the-trace-json-format-full-spec)
10. [Divergence detection](#10-divergence-detection)
11. [Design (class) problems: "ops" mode](#11-design-class-problems-ops-mode)
12. [The UI: panels, timeline, controls](#12-the-ui-panels-timeline-controls)
13. [A worked example, end to end](#13-a-worked-example-end-to-end)
14. [The full 49‑problem catalog](#14-the-full-49-problem-catalog)
15. [Safety & robustness (the hard‑won bits)](#15-safety--robustness-the-hard-won-bits)
16. [Extending Walk It](#16-extending-walk-it)
17. [Testing & verification](#17-testing--verification)
18. [Tech stack, running, building](#18-tech-stack-running-building)
19. [File‑by‑file map](#19-file-by-file-map)
20. [Limitations & future work](#20-limitations--future-work)
21. [Glossary](#21-glossary)

---

## 1. The idea in one minute

Most algorithm visualizers animate a *correct* algorithm — they show you how Two Sum is *supposed* to work. Walk It does the opposite: it visualizes **the user's actual, possibly‑broken code** and points at the **divergence** — the first moment the program's real behavior departs from what the test expects.

You paste a Python function (or class) and a failing test case. Walk It:

1. **Runs it**, sandboxed, fully in the browser, tracing every line.
2. **Records** every state change as a compact JSON trace.
3. **Renders** that trace as an explorable 3D world you can orbit, pan, and zoom.
4. **Plants a red flag** at the crash site — and freezes the frame there.

If an index runs off the end of an array, you don't get `IndexError: list index out of range`. You watch a little character labeled `j` **walk off the edge of the platform and fall into the void**, with a red flag staked where it fell.

---

## 2. Who it's for & the problem it solves

**Audience:** beginners learning data structures and algorithms — people doing their first LeetCode problems who can write code but can't yet *read* a stack trace into a mental model of what went wrong.

**The gap it fills:** a traceback tells you *where* Python gave up (`line 5, IndexError`). It does not tell you *what the program was doing* that made line 5 reach an impossible index, and it certainly doesn't show you the shape of the data at that instant. Walk It turns the invisible runtime state — pointers, comparisons, swaps, recursion depth, the contents of every container — into something physical and continuous, so the "why" is something you watch happen rather than reconstruct.

**The quality bar the product holds itself to:**

- A user who has never seen the tool should understand what a *pointer* is within 10 seconds of pressing Play.
- Scrubbing the timeline is **instant** — it renders from a pre‑computed trace and never re‑executes code.
- Every visual event maps 1:1 to a line of the user's code; the current line is highlighted in the editor in lock‑step with the scene.

---

## 3. The core loop (what a user actually does)

1. **Pick a problem** from the grouped dropdown — 49 problems across 10 categories.
2. The editor loads with a **deliberately buggy** default solution (a classic beginner mistake), and the input/expected boxes fill with the first test case.
3. **Press ▶ Run.** Pyodide executes and traces the code; the scene builds; if the output is wrong (or the code crashes / loops forever), the timeline **auto‑jumps to the divergence step** and a red flag appears.
4. **Scrub** the timeline (drag, arrow keys, or Play at 3 speeds) to move forward and backward through execution — *time‑travel replay*. The 3D world and the highlighted editor line stay in sync.
5. Click **load working solution** to watch the same test on correct code — a clean walk, no flags, ending on a green "matches expected" banner.
6. **Edit the code** freely and re‑run. Type any bug you like; the flag will find it.

Everything after step 3 is instant because it reads from the recorded trace.

---

## 4. The visual language

This is the product. Consistency here is what makes it legible. Every metaphor below is implemented.

| Code concept | In the world |
| --- | --- |
| **List** | A row of floor tiles, each showing its value and index |
| **String** | A row of character tiles — so two‑pointer / sliding‑window string problems walk exactly like array problems |
| **Index / pointer variable** (`i`, `j`, `left`, `right`…) | A small labeled character standing on a tile; when the index changes, the character **walks** to the new tile |
| **Out‑of‑bounds access** | The character walks **off the edge** of the platform and falls; freeze‑frame + red flag |
| **`for x in somelist`** | `x` walks the tiles by iteration order (a "value scan") |
| **Comparison on a branch line** | The referenced tiles **glow** — green if the branch was taken, gray if not, blue if it can't be inferred (single‑line bodies) |
| **Swap** (`a[i], a[j] = a[j], a[i]`) | The two tiles lift, arc through the air, and trade places |
| **Recursion** | Translucent **dungeon‑floor slabs** stack overhead — one per caller frame — plus a `call depth` line on the variables board |
| **Dict** | A **treasure chest** with its `key : value` pairs floating above it |
| **Set** | Shown on the variables board as `{…}` |
| **Linked list** | Floating **platforms connected by bridges** (the `next` pointers); a `None` pointer is a stub bridge into the fog; a null pointer variable stands on a "None" pad |
| **Binary tree** | Platforms laid out by depth and in‑order position, connected by edges; pointer variables (`root`, `node`…) stand on nodes. Two‑tree problems render a **side‑by‑side forest** |
| **Graph** | Nodes arranged on a ring, connected by edges; pointer variables stand on nodes |
| **Heap** (a `heapq` list) | A **binary‑tree pyramid** — parent `i`, children `2i+1` / `2i+2` — the structure `heapq` actually maintains, with the min at the apex |
| **Matrix / grid** | A 2‑D field of cells; the active `grid[r][c]` cell glows green, mutated cells flash orange |
| **Design problem (a class)** | A **timeline of method calls** with their return values, the active one highlighted; the object's fields (`self.stack`, `self.cache`…) render with their own metaphors |
| **Loop iterations** | A floating `loop pass N` counter |
| **Return value** | An `output` pedestal (red when the output is wrong) |
| **Divergence** | A red flag with a pulsing ring, plus a translucent **green "ghost"** of the *expected* output beside the actual state |
| **Other scalars** | A floating `variables` board |

The scene graph is built from plain three.js objects so the camera is swappable — a WebXR camera could be dropped in later without touching the metaphors.

---

## 5. Architecture: the three‑stage pipeline

```
   user code + test case
            │
            ▼
┌───────────────────────┐   trace JSON    ┌──────────────────────┐   analysis    ┌────────────────────────┐
│  Stage 1: TRACER       │ ──────────────▶ │  Stage 2: ANALYZER    │ ────────────▶ │  Stage 3: RENDERER      │
│  src/pyodide/tracer.py │                 │  src/trace/analyze.js │               │  src/components/world/  │
│  (Python, in Pyodide)  │                 │  (pure JS)            │               │  (react‑three‑fiber)    │
│                        │                 │                       │               │                         │
│  sys.settrace records  │                 │  classify structures, │               │  one snapshot per step; │
│  every line/call/      │                 │  derive events, infer  │               │  scrubbing just changes │
│  return/exception      │                 │  pointers & divergence │               │  the step index         │
└───────────────────────┘                 └──────────────────────┘               └────────────────────────┘
```

The crucial design property: **the tracer is dumb and the renderer is dumb; the analyzer is where the intelligence lives.** The tracer just faithfully dumps runtime state. The renderer just draws whatever the analysis says is at a step. The analyzer does the interpretation — *which integer is a pointer into which array, was this branch taken, did a swap happen, where did the program diverge*. This separation is what lets you add a brand‑new visual metaphor by touching `analyze.js` and adding one world component, without ever modifying the tracer.

A second crucial property: **execution happens once, up front.** The full trace is computed on Run and held in memory. Scrubbing, playing, and stepping are pure index changes into that array — never re‑execution. That's why time‑travel is instant.

---

## 6. Stage 1 — the tracer (`tracer.py`)

`src/pyodide/tracer.py` (~560 lines) runs **inside Pyodide** — CPython compiled to WebAssembly — so user Python executes fully client‑side, sandboxed, with no backend. Its single entry point is `walkit_run(payload_json)`, which returns a JSON string.

### What it does, in order

1. **Parse the payload** — user code, mode (`func` or `ops`), the function/class name, the per‑argument *kinds*, and the JSON arguments.
2. **Compile** the user code (syntax errors become a structured `error`, never a crash).
3. **Run top‑level statements under the tracer.** A pasted script's module‑level code (e.g. a stray `print(...)` or top‑level loop) executes under the step budget too, so it can't hang the tab.
4. **Build typed inputs from JSON.** This is where `[1,2,3]` becomes a real `ListNode` chain, `[3,9,20,null,null,15,7]` becomes a `TreeNode` tree, an adjacency list becomes a `Node` graph, and `[[vals], pos]` becomes a *cyclic* linked list.
5. **Install `sys.settrace`** and call the user's function (or, in ops mode, replay a sequence of method calls).
6. **Record a step** on every `line` / `call` / `return` / `exception` event: the line number, call depth, a serialized snapshot of all locals, and — when reference‑typed objects are live — a `heap` of nodes.
7. **Serialize the result** back to plain JSON (linked lists / trees / graphs are walked back into arrays / level‑order lists / adjacency lists).

### Input builders (JSON → Python object)

| `argKind` | JSON shape | Becomes |
| --- | --- | --- |
| `value` | any scalar | itself (int/str/bool/float) |
| `string` | `"abc"` | a `str` (rendered as char tiles) |
| `list` | `[1,2,3]` | a `list` |
| `matrix` | `[[1,0],[0,1]]` | a 2‑D `list` |
| `linkedlist` | `[1,2,3]` | a `ListNode` chain |
| `linkedlist_cycle` | `[[1,2,3], pos]` | a `ListNode` chain whose tail links back to node `pos` (or no cycle if `pos < 0`) |
| `tree` | `[1,2,3,null,4]` (level‑order) | a `TreeNode` tree |
| `graph` | `[[2,4],[1,3],…]` (1‑indexed adjacency) | a `Node` graph |

### Output serializers (Python object → JSON)

`linkedlist` → array (cycle‑safe, flags `cycle: true` if it loops); `tree` → trimmed level‑order list; `graph` → adjacency list ordered by node value; everything else → `_safe_json` (depth‑capped, `inf`/`nan` as strings).

### The snapshot (`snap_value`)

Every local is turned into a small typed object. Primitives keep their value; containers keep up to 30 elements plus a true `len`; reference types (`ListNode`/`TreeNode`/`Node`) register into the per‑step `heap` and the local just holds an `id`; **user objects** (the `self` of a design problem) expand one level into their attributes, so `self.stack` and `self.cache` render as real structures. See [§9](#9-the-trace-json-format-full-spec) for the exact shapes.

### Why this is safe

The tracer is the part most exposed to arbitrary user code, so it's hardened — see [§15](#15-safety--robustness-the-hard-won-bits).

---

## 7. Stage 2 — the analyzer (`analyze.js`)

`src/trace/analyze.js` (~520 lines, pure JS, no dependencies) is the brain. `analyze(raw, template, test, code)` returns a render‑ready object. It does several passes:

### Pass A — discover names & types

Scan every step's locals to find which names are lists, strings (only those that are function arguments, ≤ 40 chars, so intermediate strings don't clutter), dicts, grids, and which are reference nodes. Flatten design‑problem `self` attributes in as if they were top‑level variables. Inspect the `heap` to decide the **scene's structure kind**: `tree`, `graph`, `linked`, or `null` (a flat array/grid/heap scene).

### Pass B — bind pointers to tiles

This is the signature heuristic. An integer local becomes a *pointer* into a tile row by:

- **Source binding:** scanning the code for `arr[i]` patterns to learn that `i` indexes `arr` (handles overlapping/nested subscripts).
- **Name fallback:** a variable named `i`, `j`, `left`, `right`, `mid`, `lo`, `hi`, … is treated as a pointer into the sole tile row, *unless* it's a value‑scan variable.
- **Bounds:** a pointer is marked `oob` when its value is `< 0` or `≥ len`. The true length (not the 30‑element render cap) is used, so out‑of‑bounds is detected correctly even on long arrays.

`for x in somelist` loops are detected separately: `x` "walks" the tiles by iteration. The placement counts how many times the `for` line has executed and wraps modulo `len+1`, so re‑entering the loop restarts the walk at tile 0 rather than freezing at the end.

### Pass C — derive events (diff consecutive steps)

Comparing each step to the previous one *within the same call frame* yields:

- `pointer-move` (an index changed → the character walks),
- `swap` (two list cells exchanged values) vs `set` (cells changed without a swap) vs `resize`,
- `grid-set` (matrix cells changed → flash),
- `dict-set` (dict keys changed),
- `rewire` (a `next`/`left`/`right` link changed → the bridge/edge flashes).

### Pass D — comparison glow & branch truth

On a branch line (`if`/`elif`/`while`), the analyzer figures out **which tiles the comparison touched** (from subscripts and value‑scan variables) and **whether the branch was taken**. Truth is inferred by looking at the *next executed line*: if execution enters the branch's own indented body, it was taken (green); if it falls through, not (gray). Single‑line bodies (`if c: x=1`) are unknowable from line events, so they glow blue rather than lie.

### Pass E — loop laps, ops timeline, divergence

Backward line jumps within a frame count loop laps. In ops mode, each top‑level call advances the active operation index. Finally the **divergence verdict** is computed (see [§10](#10-divergence-detection)).

The output also carries layout hints (`extentX` for camera framing, `listOrder`, `gridOrder`, `heapNames`, the structure kind) that the renderer reads.

---

## 8. Stage 3 — the renderer (`components/world/`)

Built with **react‑three‑fiber** (React bindings for three.js). `World.jsx` is the dispatcher: it reads the analysis and the current step index and composes a scene. There is **no animation state in the data** — animations (walking, falling, swap arcs, glow fades) live entirely in the components and key off the step index, so scrubbing backward animates just as cleanly as forward.

The world components:

| Component | Renders |
| --- | --- |
| `ArrayWorld.jsx` | A row of value/index tiles; comparison glow; the swap arc; per‑tile flash on writes |
| `PointerGuy.jsx` | A labeled capsule‑and‑sphere character that damps toward its target tile (so it *walks*), hops while moving, and tumbles off the edge when `fallen` |
| `LinkedListWorld.jsx` | Node platforms + directional bridges; a `None` pad; bridges flash on rewire |
| `TreeWorld.jsx` | Depth‑laid node platforms + edges; supports a forest (two trees); pointer characters on nodes |
| `GraphWorld.jsx` | Ring‑laid nodes + edges; pointer characters on nodes |
| `GridWorld.jsx` | A 2‑D cell field; active cell glows, changed cells flash |
| `HeapWorld.jsx` | A `heapq` list drawn as a binary‑tree pyramid |
| `DictChest.jsx` | A treasure chest with floating `key : value` lines |
| `ScalarBoard.jsx` | The floating `variables` board |
| `OpsPanel.jsx` | The method‑call timeline with return values (design problems) |
| `RedFlag.jsx` | The divergence flag + pulsing ring |
| `GhostOverlay.jsx` | The translucent green expected‑output overlay |
| `ResultPedestal.jsx` | The output pedestal (red when wrong) |

`Scene.jsx` wraps it all in a `<Canvas>`, sets up lighting and fog that **scale with the scene** (so a 30‑tile string doesn't vanish into haze or fall outside the light frustum), and a `CameraRig` that re‑frames on each run — centering on `x=0` for trees/graphs (which lay out symmetrically) and on the content's midpoint for arrays (which grow rightward from the origin).

Layout helpers live in `utils.js`: `treeLayout` (in‑order x, depth z, multi‑root forests), `graphLayout` (ring), `heapLayout` (pyramid), a stable color hash for pointer names, and value formatting.

---

## 9. The trace JSON format (full spec)

This is the contract between the three stages. `walkit_run` returns:

```jsonc
{
  "steps": [
    {
      "i": 0,                  // step index (0‑based)
      "event": "call",         // "call" | "line" | "return" | "exception"
      "line": 1,               // 1‑based line in the user's code
      "func": "two_sum",       // the function this frame is in
      "depth": 1,              // call depth (1 = the top‑level user function)
      "locals": {              // snapshot taken BEFORE the line executes
        "nums":   { "t": "list",  "v": [2, 7, 11, 15], "len": 4 },
        "target": { "t": "num",   "v": 9 },
        "name":   { "t": "str",   "v": "ab", "len": 2 },
        "flag":   { "t": "bool",  "v": true },
        "x":      { "t": "none" },
        "seen":   { "t": "dict",  "v": { "2": 0 }, "len": 1 },
        "vals":   { "t": "set",   "v": [1, 2], "len": 2 },
        "grid":   { "t": "grid",  "v": [[1,0],[0,1]], "len": 2 },   // 2‑D list
        "head":   { "t": "node",  "id": 1 },     // linked‑list ref into "heap"
        "root":   { "t": "tnode", "id": 1 },     // tree ref into "heap"
        "g":      { "t": "gnode", "id": 1 },     // graph ref into "heap"
        "self":   { "t": "obj", "cls": "MinStack",          // design‑problem object…
                    "attrs": { "stack": { "t": "list", "v": [1], "len": 1 } } }  // …expanded one level
      },
      "heap": {                // present only when reference‑typed locals are live
        "1": { "kind": "list",  "val": 1, "next": 2 },                 // next id (null = end)
        "2": { "kind": "tree",  "val": 5, "left": 3, "right": null },
        "4": { "kind": "graph", "val": 1, "neighbors": [5, 6] }
      },
      "ret": { "t": "num", "v": 7 },                                    // only on "return"
      "exc": { "type": "IndexError", "msg": "list index out of range" } // only on "exception"
    }
  ],
  "result": [0, 1],     // plain‑JSON output; lists/trees/graphs serialized back to arrays
  "error": null,        // or { "type", "msg", "line" } for uncaught exceptions / syntax / setup errors
  "truncated": false,   // true when the 2,000‑step budget killed execution
  "stepLimit": 2000,
  "mode": "func",       // "func" | "ops"
  "ops": ["MinStack","push","getMin"],   // (ops mode only) the method‑call sequence
  "cycle": true         // (optional) a linked‑list result looped back on itself
}
```

### `locals` value types (`t`)

`num`, `str` (+`len`), `bool`, `none`, `list` (+`len`), `grid`, `dict` (+`len`), `set` (+`len`), `node` (linked‑list ref), `tnode` (tree ref), `gnode` (graph ref), `obj` (user object — either expanded `attrs` for the design `self`, or a short `repr` fallback).

### Invariants worth knowing

- **Snapshots are "before".** A step's locals reflect state *before* its line runs; the effect of line *N* shows up in step *N+1*. This is standard debugger semantics and is what lets the renderer show "about to execute this line."
- **Heap node ids are stable for a run** — assigned on first sighting, and the source object is *retained* so its memory address can't be recycled onto a different node. Platforms therefore keep their identity as pointers move around.
- **Container elements** are primitives, short node labels (`→7` list, `△5` tree, `◆1` graph), or `repr()` strings. Nesting beyond grids falls back to `repr`. `inf`/`nan` are encoded as the strings `"inf"`/`"nan"`.

---

## 10. Divergence detection

The flag's position is a **verdict**, computed in priority order:

1. **Uncaught `IndexError`** → *out‑of‑bounds*. The analyzer finds the pointer that's out of range and flags it; the renderer makes that character fall. Message: `Out of bounds: 'j' walked off 'nums' at index 4 (valid: 0 to 3) — line 5`.
2. **Any other uncaught exception** → flag at the step it was raised.
3. **Trace truncated at the step budget** → *probable infinite loop*.
4. **Output ≠ expected** → flag at the function's return step.

**Caught exceptions never flag.** If the user code does `try: … except KeyError: …` as legitimate EAFP control flow, the `exception` event is still recorded (and could be visualized) but it does **not** raise a divergence — only the exception that actually *escaped* the function counts. The analyzer enforces this by only treating an `exc` step as a divergence when `raw.error` is set and its type/line match.

**Output comparison modes** (per‑template `compare`):

- `exact` — deep JSON equality (default).
- `index-pair` — order‑insensitive pair (Two Sum: `[1,0]` ≡ `[0,1]`).
- `set` — order‑insensitive list (Top K Frequent).
- `nested-set` — order‑insensitive at both levels (3Sum, Group Anagrams).

> **Scope note:** divergence today is verdict‑based, not step‑aligned. Walk It flags *that* the run was wrong and *where it ended/crashed*; it does not yet diff the user's trace against the reference solution's trace to pinpoint the first *internal* step that diverged. Each template already carries a correct `solutionCode`, so a future step‑semantics aligner is the natural next step. See [§20](#20-limitations--future-work).

---

## 11. Design (class) problems: "ops" mode

LeetCode "design" problems (Min Stack, LRU Cache, Kth Largest in a Stream) aren't a single function — they're a class exercised by a *sequence of operations*. Walk It models this with `mode: "ops"`.

A test case provides two parallel arrays (LeetCode's own format):

```jsonc
{
  "ops":    ["MinStack", "push", "push", "getMin", "pop", "getMin"],
  "opArgs": [[],         [-2],   [0],    [],        [],    []]
}
```

The tracer instantiates the class (first op = constructor) and then calls each method in order, collecting return values into a `result` array (`null` for the constructor). The whole sequence is traced as one timeline. The renderer shows:

- the **operations panel** (a windowed list of calls with their returns, active one highlighted),
- the object's **internal state** — because `self`'s attributes are flattened into the normal views, `self.stack`/`self.min_stack` render as tile rows, `self.cache` as a chest, `self.heap` as a pyramid,
- the usual **divergence ghost** comparing the actual `result` array to the expected one.

So when buggy Min Stack returns `[…, 0]` where it should return `[…, -2]` for `getMin()`, you see the operation timeline, the two internal stacks, and the green ghost of the correct answer side by side.

---

## 12. The UI: panels, timeline, controls

Three panels (`App.jsx` orchestrates state; ~300 lines):

- **Left — code editor** (CodeMirror via `@uiw/react-codemirror`, Python mode). The currently‑executing line is highlighted in sync with the scene via a custom `StateField` (`editor/execLine.js`). Below it: the test‑case input box (a JSON args array, or `{ops, opArgs}` for design problems) and the expected‑output box, plus **load buggy example** / **load working solution** buttons.
- **Center — the 3D world.** Orbit / pan / zoom with the mouse; the camera re‑frames on each run. A banner at the top states the verdict (red for a flag, green for a clean match). A legend strip at the bottom names the metaphors.
- **Bottom — the timeline scrubber** (`Timeline.jsx`, a hand‑drawn canvas). One tick per execution step, `call`/`return` ticks lighter; the **divergence step marked in red** with a flag; a white playhead. Controls: ⏮ ◀ ▶ play ▶ ⏭, a 0.5×/1×/2× speed selector, and a **🚩 jump to flag** button. Keyboard: ←/→ step, space play/pause.

Behavior details: editing the code marks the run **stale** (the banner reminds you to re‑run; the editor line highlight clears so it can't lie). Playing **auto‑freezes** when the playhead reaches the divergence step. Selecting a new problem resets everything and fills the first test case.

---

## 13. A worked example, end to end

**Problem:** Two Sum, the buggy default. **Test:** `nums=[2,7,11,15]`, `target=26`, expected `[2,3]`.

```python
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):   # ← bug: + 1 too far
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

1. **Tracer.** `nums` is built as a plain list. `sys.settrace` records each line. The inner loop's upper bound is `len(nums) + 1 = 5`, so eventually `j = 4` and `nums[4]` raises `IndexError`. The tracer records an `exception` step with `{type: "IndexError"}` at line 5 and returns a trace with `error.type = "IndexError"`, `error.line = 5`.
2. **Analyzer.** It binds `i` and `j` as pointers into `nums` (from the `nums[i]`/`nums[j]` subscripts). At the exception step, `j = 4` with `len = 4`, so `j` is `oob`. The verdict is `kind: "oob"`, `faller: {name: "j", index: 4}`, message *"Out of bounds: 'j' walked off 'nums' at index 4 (valid: 0 to 3) — line 5"*.
3. **Renderer.** Four tiles `[2,7,11,15]` with indices `0‑3`. A character `i` stands on tile 0, `j` walks 1→2→3→ and then, at the flagged step, **off the right edge and falls**. A red flag plants where it fell; a green ghost shows the expected `[2,3]`. The timeline's red tick sits at the exception step, and Run auto‑jumped there.
4. **User fix.** Click **load working solution** (a hash‑map version) → re‑run → the character walks the array once, the `seen` dict chest fills, and the banner turns green: *"Output [2,3] matches expected — clean walk, no flags."*

---

## 14. The full 49‑problem catalog

Every problem ships with a beginner‑buggy default, a correct reference solution, and 2–3 test cases. The first test is always chosen so the **buggy version diverges** on it.

### Arrays & Hashing (7)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 1 | Two Sum | array + dict | inner loop runs one index too far → out‑of‑bounds |
| 217 | Contains Duplicate | array + set | inverted return condition |
| 242 | Valid Anagram | two char‑tile strings + dict | never checks the counts balance |
| 49 | Group Anagrams | string tiles + dict | keys by the word, not its sorted letters |
| 347 | Top K Frequent Elements | array + dict | sorts ascending → returns the *least* frequent |
| 238 | Product of Array Except Self | array → array | missing the suffix pass |
| 128 | Longest Consecutive Sequence | array | duplicates break the run counter |

### Two Pointers (4)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 125 | Valid Palindrome | char‑tile string | never strips punctuation / case |
| 167 | Two Sum II | array | returns 0‑indexed instead of 1‑indexed |
| 11 | Container With Most Water | array | moves the taller wall instead of the shorter |
| 15 | 3Sum | array → triplets | never skips duplicates |

### Sliding Window (3)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 121 | Best Time to Buy/Sell Stock | array (value scan) | `min_price` initialized to 0 instead of ∞ |
| 3 | Longest Substring Without Repeating | char‑tile string + set | window never shrinks on a repeat |
| 424 | Longest Repeating Char Replacement | char‑tile string + dict | assumes the whole prefix is replaceable |

### Stack (3)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 20 | Valid Parentheses | char‑tile string + stack list | ignores leftover open brackets |
| 739 | Daily Temperatures | array + stack list | stores absolute index, not the day gap |
| 155 | Min Stack | **ops** + two stacks | pushes the raw value, not the running min |

### Binary Search (3)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 704 | Binary Search | array | `while l < r` skips single‑element ranges |
| 33 | Search in Rotated Sorted Array | array | plain binary search ignores the rotation |
| 153 | Find Minimum in Rotated Sorted Array | array | compares to the left end, not the right |

### Linked List (6)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 206 | Reverse Linked List | platforms + bridges | returns `head` (now the tail) instead of `prev` |
| 21 | Merge Two Sorted Lists | two chains | forgets to attach the leftover list |
| 19 | Remove Nth Node From End | chain | `while fast` (not `fast.next`) overshoots |
| 141 | Linked List Cycle | cyclic chain | single pointer → **infinite loop** (hits the step budget!) |
| 143 | Reorder List | chain | only reverses; reorder must interleave |
| 146 | LRU Cache | **ops** + dict chest | `get` doesn't mark the key recently‑used |

### Trees (12)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 104 | Maximum Depth of Binary Tree | tree | forgot the `+ 1` |
| 100 | Same Tree | two‑tree forest | `or` instead of `and` |
| 226 | Invert Binary Tree | tree → tree | swaps the root only, never recurses |
| 110 | Balanced Binary Tree | tree | checks the root only, not every subtree |
| 543 | Diameter of Binary Tree | tree | only measures the path through the root |
| 102 | Level Order Traversal | tree → nested list | appends flat, not grouped by level |
| 199 | Right Side View | tree → list | only follows right children |
| 98 | Validate BST | tree | compares to immediate children, not the range |
| 230 | Kth Smallest in a BST | tree | off‑by‑one (`res[k]` vs `res[k-1]`) |
| 235 | Lowest Common Ancestor of a BST | tree | goes left when it should go right |
| 572 | Subtree of Another Tree | two‑tree forest | only compares from the root |
| 1448 | Count Good Nodes | tree | passes the parent value, not the running max |

### Heap (3)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 1046 | Last Stone Weight | heap pyramid | min‑heap smashes the *lightest* stones |
| 215 | Kth Largest Element | heap pyramid | `nsmallest` returns the kth *smallest* |
| 703 | Kth Largest in a Stream | **ops** + heap | never trims to size k → returns the overall min |

### Graphs (3)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 133 | Clone Graph | graph → graph | never clones the neighbors |
| 207 | Course Schedule | grid (edge list) | a seen node isn't necessarily a cycle |
| 210 | Course Schedule II | grid (edge list) → order | reverses a correct topological order |

### Matrix (5)
| # | Problem | Renders as | The bug it teaches |
| --- | --- | --- | --- |
| 200 | Number of Islands | grid | counts land cells, no flood fill |
| 695 | Max Area of Island | grid | forgot the `+ 1` for the current cell |
| 130 | Surrounded Regions | grid → grid | flips border‑connected regions too |
| 36 | Valid Sudoku | 9×9 grid | never checks the 3×3 boxes |
| 417 | Pacific Atlantic Water Flow | grid → coords | no flow simulation, only corner cells |

---

## 15. Safety & robustness (the hard‑won bits)

Because the tracer runs arbitrary user code on the main thread, several failure modes had to be designed out. These were each found by an adversarial code review and are covered by regression tests.

- **The step‑budget kill can't be swallowed.** Execution is capped at **2,000 steps**. The kill signal is a `StepLimitExceeded` exception — but it subclasses **`BaseException`**, not `Exception`, specifically so a user's `try: … except Exception:` (a very common way beginners paper over an `IndexError` in a `while` loop) can't catch it and let the program run untraced forever.
- **Top‑level code obeys the budget too.** A pasted script's module‑level statements run *under* the tracer and consume the same step budget, so a stray top‑level `while True:` can't hang the tab.
- **`BaseException` is caught at the boundary.** `SystemExit`/`exit()`/`quit()` from user code produce a structured `error` in the JSON, not an unhandled crash that breaks the JSON contract.
- **Node identity never gets recycled.** The tracer keeps a strong reference to every node it has seen, so CPython can't free a `ListNode`/`TreeNode` and hand its memory address to a new node — which would otherwise make a brand‑new node inherit a dead node's id and visually "morph" an existing platform.
- **Caught exceptions don't false‑flag.** Correct EAFP code (`try/except` as control flow) records its exceptions but is never marked as a divergence.
- **Containers are capped** at 30 rendered elements (with the true `len` preserved for bounds math), and result serialization is depth‑capped, so pathological inputs can't produce unbounded JSON.

---

## 16. Extending Walk It

### Add a problem (most common)

Append an entry to `src/templates.js`:

**Function problem:**
```js
{
  id: "my-problem",
  name: "My Problem",
  group: "Arrays & Hashing",          // must be one of GROUPS
  func: "solve",
  argNames: ["nums", "k"],
  argKinds: ["list", "value"],         // see kinds below
  retKind: "value",                    // value | list | matrix | tree | linkedlist | graph
  compare: "exact",                    // exact | index-pair | set | nested-set
  description: "One‑line description.",
  defaultCode: `def solve(nums, k):\n    ...buggy...`,
  solutionCode: `def solve(nums, k):\n    ...correct...`,
  tests: [{ args: [[1,2,3], 2], expected: 5 }],   // first test must make the bug diverge
  // render: { heap: ["heap","h"] }   // optional: draw a list var as a heap pyramid
}
```

**Design problem:** add `mode: "ops"`, `className`, and `tests: [{ ops, opArgs, expected }]`.

`argKinds`: `value | string | list | matrix | tree | linkedlist | linkedlist_cycle | graph`.

Trees, graphs, grids, and heaps need **no tracer or renderer changes** — only the right kinds and (for heaps) a `render` hint. The `tests/all_templates.test.mjs` suite will immediately enforce that your buggy default diverges and your solution runs clean.

### Add a brand‑new visual metaphor

1. Have the tracer emit the data (often it already does — it's structure‑agnostic).
2. Teach `analyze.js` to classify it and attach per‑step render data.
3. Add a world component under `src/components/world/` and wire it into `World.jsx`.

The tracer almost never needs to change; that's the point of the pipeline.

---

## 17. Testing & verification

`npm test` runs two Node‑side suites that load the **real** `tracer.py` into Node‑side Pyodide and feed traces through the **real** `analyze.js` — no mocks:

- **`tests/logic.test.mjs`** — 21 targeted assertions: out‑of‑bounds detection, caught‑exception handling, the step‑limit kill (including the `try/except` and top‑level‑loop escape attempts), node‑id stability across garbage collection, branch‑truth inference (`if/else`, single‑line bodies, loop exits), value‑scan placement, and recursion depth.
- **`tests/all_templates.test.mjs`** — sweeps **all 49 templates** (~237 assertions): every buggy default must raise a divergence flag on its first test case, and every reference solution must run clean on *all* its test cases. This is the regression net when adding or editing templates.

Beyond the unit suites, the build was verified end‑to‑end in a headless Chromium browser driving the real UI: one representative problem per category plus the original suite, screenshot‑reviewed, with zero console/page errors.

---

## 18. Tech stack, running, building

- **React 18** + **react‑three‑fiber** / **drei** / **three.js** for the scene.
- **Pyodide 0.26.4** (CPython in WebAssembly) loaded from the jsDelivr CDN — runs user Python fully client‑side.
- **CodeMirror 6** (`@uiw/react-codemirror` + `@codemirror/lang-python`) for the editor.
- **Vite 5** for dev server and build.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # the two Pyodide‑backed suites
npm run build    # production bundle to dist/
```

**Runtime network requirement:** Pyodide (~10 MB, cached after first visit) and the in‑scene text font are fetched from CDNs, so the first run needs network access. Everything else is local.

> A dependency note: `package.json` pins `@codemirror/state` and `@codemirror/view` via `overrides` — npm otherwise installs two incompatible copies of CodeMirror's state package and the editor throws at runtime. `puppeteer-core` and `pyodide` are dev‑only (browser/Node test harnesses).

---

## 19. File‑by‑file map

```
src/
  main.jsx                      entry point
  App.jsx                 ~306  state, run flow, panel layout, keyboard, playback
  styles.css                    all styling
  templates.js                  the 49‑problem catalog (buggy + solution + tests)

  pyodide/
    tracer.py             ~560  sys.settrace tracer; input builders; serializers; ops mode
    runner.js                   loads Pyodide, runs walkit_run, returns parsed JSON

  trace/
    analyze.js            ~520  the brain: classify structures, derive events, divergence

  editor/
    execLine.js                 CodeMirror decoration for the synced current line

  components/
    Scene.jsx             ~114  <Canvas>, lighting/fog scaling, CameraRig framing
    Timeline.jsx          ~176  canvas scrubber: ticks, divergence marker, transport controls
    EditorPanel.jsx        ~39  CodeMirror wrapper + signature/description header
    world/
      World.jsx           ~209  dispatcher: composes a scene from the analysis + step
      ArrayWorld.jsx      ~154  tiles, glow, swap arc, write flashes
      PointerGuy.jsx       ~60  the walking/falling character
      LinkedListWorld.jsx ~148  node platforms + bridges
      TreeWorld.jsx       ~102  tree/forest platforms + edges
      GraphWorld.jsx       ~71  ring graph + edges
      GridWorld.jsx        ~88  2‑D cell field
      HeapWorld.jsx        ~54  heap pyramid
      DictChest.jsx        ~40  dict treasure chest
      ScalarBoard.jsx      ~34  variables board
      OpsPanel.jsx         ~43  design‑problem operations timeline
      RedFlag.jsx          ~34  divergence flag
      GhostOverlay.jsx     ~69  expected‑output ghost
      ResultPedestal.jsx   ~23  output pedestal
      utils.js                  layout math (tree/graph/heap), color hash, formatting

tests/
  logic.test.mjs                21 targeted analyzer/tracer assertions
  all_templates.test.mjs        sweeps all 49 templates (~237 assertions)
```

~5,000 lines of application source. `README.md` is the quick‑start; this file is the deep reference.

---

## 20. Limitations & future work

**Known limitations (by design, for now):**

- **Verdict‑based divergence, not step alignment.** Walk It flags that a run was wrong and where it crashed/ended, but doesn't yet diff the user's trace against the reference solution to pinpoint the first *internal* divergence. The reference solutions are already in every template, ready for a step‑semantics aligner.
- **Templates only.** The tracer needs to know the shape of inputs/outputs to build and serialize them, so arbitrary problems aren't supported — you pick from the catalog.
- **Main‑thread execution.** Pyodide runs on the main thread; the 2,000‑step budget is what guarantees the tab can't hang. A Web Worker would isolate it further (and is the right home for a future "run with a real wall‑clock timeout").
- **Container cap.** Only the first 30 elements of a container render (true length is preserved for correctness).
- **Some lower‑fidelity scenes.** Course Schedule renders its prerequisite *edge list* as a grid rather than a laid‑out graph; very long strings (30+ chars) are legible but small.

**Natural next steps:**

- A trace‑alignment engine for true first‑divergence pinpointing.
- A WebXR camera (the scene graph is already plain three.js, so the metaphors don't change).
- More categories (tries, intervals, DP tables as a glowing grid, backtracking as a branching dungeon).
- Persistence / shareable links for a specific buggy run.

---

## 21. Glossary

- **Trace** — the recorded list of execution steps produced by the tracer.
- **Step** — one `sys.settrace` event (a line executed, a call entered, a return, or an exception). The atomic unit the timeline scrubs over.
- **Divergence** — the first point where the program's behavior departs from the expected result (the crash site). Marked by the red flag.
- **Ghost** — the translucent green render of the *expected* output, shown beside the actual state at the divergence.
- **Pointer (in Walk It's sense)** — an integer variable that the analyzer has decided indexes into a tile row, rendered as a walking character.
- **Value scan** — a `for x in seq` loop variable, which walks the tiles by iteration order rather than by an index value.
- **Heap (the per‑step `heap`)** — the trace's pool of reference‑typed nodes (linked‑list, tree, graph) that locals point into by id. Distinct from a **heap data structure** (a `heapq` list, rendered as a pyramid).
- **Ops mode** — the execution mode for class‑based "design" problems, replaying a constructor + method sequence.
- **Structure kind** — the analyzer's verdict on what the scene fundamentally is: `tree`, `graph`, `linked`, or `null` (a flat array/grid/heap scene).
```
