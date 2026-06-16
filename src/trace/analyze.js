// Turns a raw tracer JSON (see README.md) into a render-ready analysis:
// per-step pointers/structures, derived events, comparison glow, loop laps,
// and the divergence verdict. Supports arrays, strings (as char tiles),
// linked lists, trees, graphs, grids/matrices, heaps, and ops-mode design
// problems.

const FALLBACK_PTRS = new Set([
  "i", "j", "k", "left", "right", "lo", "hi", "low", "high",
  "mid", "idx", "index", "start", "end", "l", "r",
]);

const NODEISH = new Set([
  "prev", "curr", "cur", "nxt", "next_node", "node", "head",
  "tail", "p", "q", "slow", "fast", "n", "root", "left", "right", "child",
]);

const DEFAULT_HEAP_NAMES = ["heap", "h", "pq", "min_heap", "max_heap", "minheap", "maxheap"];

function fmt(v) {
  return v === undefined ? "nothing" : JSON.stringify(v);
}

function indentOf(line, codeLines) {
  const text = codeLines[line - 1];
  if (!text || !text.trim()) return 0;
  return text.length - text.trimStart().length;
}

// Map index-variable -> tileable name (1D list/string) from `arr[var]` patterns.
function computeBindings(tileNames, code) {
  const b = {};
  const re = /\b([A-Za-z_]\w*)\s*\[\s*([A-Za-z_]\w*)/g;
  let m;
  while ((m = re.exec(code))) {
    const [, arr, idx] = m;
    if (tileNames.has(arr) && !b[idx]) b[idx] = arr;
    re.lastIndex = m.index + m[1].length;
  }
  return b;
}

// `for x in somelist:` loops — x walks the list by value, one tile per lap.
function detectScans(tileNames, codeLines) {
  const scans = [];
  const re = /^\s*for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*)\s*:/;
  codeLines.forEach((text, i) => {
    const m = text.match(re);
    if (m && tileNames.has(m[2])) {
      scans.push({ varName: m[1], array: m[2], line: i + 1 });
    }
  });
  return scans;
}

export function analyze(raw, template, test, code) {
  const codeLines = code.split("\n");
  const steps = raw.steps || [];
  const n = steps.length;
  const opsMode = raw.mode === "ops";
  const argNames = new Set(template.argNames || []);
  const heapHint = new Set(template.render?.heap || DEFAULT_HEAP_NAMES);

  // ---- first pass: discover names/types across the whole trace ----
  // (self.attrs are flattened in so design-problem state renders like vars)
  const listNames = new Set();
  const stringNames = new Set();
  const dictNames = new Set();
  const gridNames = new Set();
  const maxLens = {};
  const maxGrid = {}; // name -> [rows, cols]
  let heapKinds = new Set();
  let maxNodeId = 0;

  function visitLocal(name, v) {
    if (!v) return;
    if (v.t === "list") {
      listNames.add(name);
      maxLens[name] = Math.max(maxLens[name] || 0, v.len ?? v.v.length);
    } else if (v.t === "str") {
      if (argNames.has(name) && (v.len ?? v.v.length) <= 40) {
        stringNames.add(name);
        maxLens[name] = Math.max(maxLens[name] || 0, v.len ?? v.v.length);
      }
    } else if (v.t === "dict") {
      dictNames.add(name);
    } else if (v.t === "grid") {
      gridNames.add(name);
      const rows = v.v.length;
      const cols = Math.max(0, ...v.v.map((r) => (Array.isArray(r) ? r.length : 0)));
      const prev = maxGrid[name] || [0, 0];
      maxGrid[name] = [Math.max(prev[0], rows), Math.max(prev[1], cols)];
    } else if (v.t === "obj" && v.attrs) {
      for (const [a, av] of Object.entries(v.attrs)) visitLocal(a, av);
    }
  }
  for (const s of steps) {
    for (const [name, v] of Object.entries(s.locals || {})) visitLocal(name, v);
    if (s.heap) {
      for (const [id, node] of Object.entries(s.heap)) {
        heapKinds.add(node.kind || "list");
        maxNodeId = Math.max(maxNodeId, Number(id));
      }
    }
  }

  const heapNames = new Set([...listNames].filter((nm) => heapHint.has(nm)));
  const tileNames = new Set([...listNames, ...stringNames]);
  const bindings = computeBindings(tileNames, code);
  const scans = detectScans(tileNames, codeLines);
  const scanNames = new Set(scans.map((sc) => sc.varName));

  const structureKind = heapKinds.has("tree")
    ? "tree"
    : heapKinds.has("graph")
      ? "graph"
      : heapKinds.has("list")
        ? "linked"
        : null;

  // cumulative hit count of each scan's `for` line, per step
  const scanHits = scans.map(() => new Array(n).fill(0));
  scans.forEach((scan, si) => {
    let count = 0;
    for (let k = 0; k < n; k++) {
      if (steps[k].event === "line" && steps[k].line === scan.line) count++;
      scanHits[si][k] = count;
    }
  });

  // ---- enrich each step ----
  const enriched = steps.map((s, k) => {
    const lists = {};
    const listLens = {};
    const dicts = {};
    const grids = {};
    const scalars = {};
    const nodePtrs = {}; // linked-list node refs
    const treePtrs = {}; // tree node refs
    const graphPtrs = {}; // graph node refs

    function place(name, v) {
      if (v.t === "list") {
        lists[name] = v.v;
        listLens[name] = v.len ?? v.v.length;
      } else if (v.t === "str" && stringNames.has(name)) {
        lists[name] = v.v.split("");
        listLens[name] = v.len ?? v.v.length;
      } else if (v.t === "grid") {
        grids[name] = v.v;
      } else if (v.t === "dict") {
        dicts[name] = v.v;
      } else if (v.t === "node") {
        nodePtrs[name] = v.id;
      } else if (v.t === "tnode") {
        treePtrs[name] = v.id;
      } else if (v.t === "gnode") {
        graphPtrs[name] = v.id;
      } else if (v.t === "none" && NODEISH.has(name)) {
        if (structureKind === "tree") treePtrs[name] = null;
        else if (structureKind === "linked") nodePtrs[name] = null;
      } else if (v.t === "obj" && v.attrs) {
        for (const [a, av] of Object.entries(v.attrs)) {
          place(lists[a] || dicts[a] || scalars[a] ? `self.${a}` : a, av);
        }
      } else if (["num", "str", "bool", "none", "set", "obj"].includes(v.t)) {
        scalars[name] = v;
      }
    }
    for (const [name, v] of Object.entries(s.locals || {})) place(name, v);

    // index pointers into 1D tile rows (lists or tiled strings)
    const pointers = {};
    for (const [name, v] of Object.entries(s.locals || {})) {
      if (v.t !== "num" || typeof v.v !== "number" || !Number.isInteger(v.v)) continue;
      let arr = bindings[name];
      if (!arr && FALLBACK_PTRS.has(name) && !scanNames.has(name) && tileNames.size === 1)
        arr = [...tileNames][0];
      if (!arr || !lists[arr]) continue;
      const len = listLens[arr];
      if (v.v >= -1 && v.v <= len) {
        pointers[name] = { array: arr, index: v.v, oob: v.v < 0 || v.v >= len };
        delete scalars[name];
      }
    }

    // value-scan loops: `for p in prices` — p stands on the tile being visited
    scans.forEach((scan, si) => {
      if (pointers[scan.varName] || !lists[scan.array]) return;
      if (!(scan.varName in (s.locals || {})) && scanHits[si][k] === 0) return;
      const len = lists[scan.array].length;
      if (len === 0 || scanHits[si][k] === 0) return;
      const idx = Math.min((scanHits[si][k] - 1) % (len + 1), len - 1);
      pointers[scan.varName] = { array: scan.array, index: idx, oob: false, scan: true };
      delete scalars[scan.varName];
    });

    // grid current-cell highlight from a row/col scalar pair
    let cell = null;
    const gridName = Object.keys(grids)[0];
    if (gridName) {
      const dims = [grids[gridName].length, grids[gridName][0]?.length ?? 0];
      for (const [rn, cn] of [["r", "c"], ["row", "col"], ["i", "j"], ["x", "y"]]) {
        const rv = s.locals[rn], cv = s.locals[cn];
        if (rv?.t === "num" && cv?.t === "num" &&
            rv.v >= 0 && rv.v < dims[0] && cv.v >= 0 && cv.v < dims[1]) {
          cell = { grid: gridName, r: rv.v, c: cv.v };
          break;
        }
      }
    }

    return { ...s, lists, listLens, dicts, grids, scalars, pointers, nodePtrs, treePtrs, graphPtrs, cell };
  });

  // ---- derived events (diff consecutive steps within the same frame) ----
  const events = enriched.map(() => []);
  for (let k = 1; k < n; k++) {
    const prev = enriched[k - 1];
    const cur = enriched[k];
    if (prev.depth !== cur.depth) continue;
    const ev = events[k];

    for (const [name, p] of Object.entries(cur.pointers)) {
      const q = prev.pointers[name];
      if (q && q.array === p.array && q.index !== p.index)
        ev.push({ type: "pointer-move", name, from: q.index, to: p.index });
    }

    for (const [name, vals] of Object.entries(cur.lists)) {
      const old = prev.lists[name];
      if (!old) continue;
      if (old.length === vals.length) {
        const changed = [];
        for (let i = 0; i < vals.length; i++)
          if (JSON.stringify(old[i]) !== JSON.stringify(vals[i])) changed.push(i);
        if (
          changed.length === 2 &&
          JSON.stringify(old[changed[0]]) === JSON.stringify(vals[changed[1]]) &&
          JSON.stringify(old[changed[1]]) === JSON.stringify(vals[changed[0]])
        ) {
          ev.push({ type: "swap", array: name, a: changed[0], b: changed[1] });
        } else if (changed.length > 0) {
          ev.push({ type: "set", array: name, indices: changed });
        }
      } else {
        ev.push({ type: "resize", array: name });
      }
    }

    for (const [name, rows] of Object.entries(cur.grids)) {
      const old = prev.grids[name];
      if (!old) continue;
      const changed = [];
      for (let r = 0; r < rows.length; r++)
        for (let c = 0; c < (rows[r]?.length ?? 0); c++)
          if (JSON.stringify(old[r]?.[c]) !== JSON.stringify(rows[r][c]))
            changed.push([r, c]);
      if (changed.length) ev.push({ type: "grid-set", name, cells: changed });
    }

    for (const [name, entries] of Object.entries(cur.dicts)) {
      const old = prev.dicts[name];
      if (!old) continue;
      const keys = Object.keys(entries).filter(
        (key) => JSON.stringify(old[key]) !== JSON.stringify(entries[key])
      );
      if (keys.length) ev.push({ type: "dict-set", name, keys });
    }

    if (cur.heap && prev.heap) {
      for (const [id, node] of Object.entries(cur.heap)) {
        const before = prev.heap[id];
        if (!before) continue;
        if (node.kind === "list" && before.next !== node.next)
          ev.push({ type: "rewire", id: Number(id) });
        if (node.kind === "tree" &&
            (before.left !== node.left || before.right !== node.right))
          ev.push({ type: "rewire", id: Number(id) });
      }
    }
  }

  // first line of a branch's indented body, or null for single-line bodies
  function bodyStartLine(branchLine) {
    const bIndent = indentOf(branchLine, codeLines);
    for (let l = branchLine + 1; l <= codeLines.length; l++) {
      const text = codeLines[l - 1];
      if (!text || !text.trim() || text.trim().startsWith("#")) continue;
      return indentOf(l, codeLines) > bIndent ? l : null;
    }
    return null;
  }

  // ---- comparison glow per step ----
  const cmps = enriched.map((s, k) => {
    if (s.event !== "line") return null;
    const text = codeLines[s.line - 1] || "";
    const trimmed = text.trim();
    const isBranch = /^(if|elif|while)\b/.test(trimmed);
    if (!isBranch && !/(==|!=|<=|>=|<|>)/.test(trimmed)) return null;

    const tiles = [];
    const re = /\b([A-Za-z_]\w*)\s*\[\s*([A-Za-z_]\w*|\d+)\s*([+-]\s*\d+)?\s*\]/g;
    let m;
    while ((m = re.exec(text))) {
      const [, arr, idxTok, delta] = m;
      if (!s.lists[arr]) continue;
      let idx = /^\d+$/.test(idxTok)
        ? Number(idxTok)
        : s.locals[idxTok]?.t === "num" && typeof s.locals[idxTok].v === "number"
          ? s.locals[idxTok].v
          : null;
      if (idx === null) continue;
      if (delta) idx += parseInt(delta.replace(/\s/g, ""), 10);
      tiles.push({ array: arr, index: idx });
    }
    for (const scan of scans) {
      const p = s.pointers[scan.varName];
      if (p?.scan && new RegExp(`\\b${scan.varName}\\b`).test(trimmed)) {
        tiles.push({ array: p.array, index: p.index });
      }
    }

    let truth = null;
    if (isBranch) {
      const body = bodyStartLine(s.line);
      for (let j = k + 1; j < n; j++) {
        const t2 = enriched[j];
        if (t2.depth !== s.depth) break;
        if (t2.event === "exception") break;
        if (t2.event === "return") {
          truth = t2.line === s.line && /\breturn\b/.test(trimmed) ? true : false;
          break;
        }
        if (t2.event === "line") {
          truth = body !== null ? t2.line === body : null;
          break;
        }
      }
    }
    if (!tiles.length && truth === null) return null;
    return { tiles, truth, isBranch };
  });

  // ---- loop laps (backward line jumps within a frame) ----
  const laps = new Array(n).fill(0);
  let lap = 0;
  for (let k = 1; k < n; k++) {
    if (
      enriched[k].depth === enriched[k - 1].depth &&
      enriched[k].event === "line" &&
      enriched[k - 1].event === "line" &&
      enriched[k].line < enriched[k - 1].line
    )
      lap++;
    laps[k] = lap;
  }

  // ---- ops timeline (design problems): which operation is active per step ----
  let opAtStep = null;
  if (opsMode && raw.ops) {
    opAtStep = new Array(n).fill(-1);
    let opIdx = -1;
    for (let k = 0; k < n; k++) {
      if (enriched[k].event === "call" && enriched[k].depth === 1) opIdx++;
      opAtStep[k] = opIdx;
    }
  }

  // ---- divergence ----
  let excStep = -1;
  if (raw.error) {
    excStep = enriched.findIndex(
      (s) => s.exc && s.exc.type === raw.error.type &&
        (!raw.error.line || s.line === raw.error.line)
    );
    if (excStep < 0)
      excStep = enriched.findIndex((s) => s.exc && s.exc.type === raw.error.type);
  }
  let lastReturnStep = -1;
  for (let k = n - 1; k >= 0; k--) {
    if (enriched[k].event === "return" && enriched[k].depth === 1) {
      lastReturnStep = k;
      break;
    }
  }

  let divergence = null;
  if (excStep >= 0 && enriched[excStep].exc.type === "IndexError") {
    const s = enriched[excStep];
    let faller = null;
    for (const [name, p] of Object.entries(s.pointers))
      if (p.oob) faller = { name, ...p };
    const len = faller ? s.listLens[faller.array] : 0;
    divergence = {
      kind: "oob",
      step: excStep,
      line: s.line,
      faller,
      message: faller
        ? `Out of bounds: '${faller.name}' walked off '${faller.array}' at index ${faller.index} (valid: 0 to ${len - 1}) — line ${s.line}`
        : `IndexError: ${s.exc.msg} — line ${s.line}`,
    };
  } else if (excStep >= 0) {
    const s = enriched[excStep];
    divergence = {
      kind: "exception",
      step: excStep,
      line: s.line,
      message: `${s.exc.type}: ${s.exc.msg} — line ${s.line}`,
    };
  } else if (raw.truncated) {
    divergence = {
      kind: "step-limit",
      step: n - 1,
      line: enriched[n - 1]?.line ?? 0,
      message: `Stopped after ${raw.stepLimit} steps — probably an infinite loop. Showing the last recorded steps.`,
    };
  } else if (raw.error) {
    divergence = {
      kind: "exception",
      step: Math.max(n - 1, 0),
      line: raw.error.line,
      message: `${raw.error.type}: ${raw.error.msg} — line ${raw.error.line}`,
    };
  } else if (!outputsMatch(template, raw.result, test.expected)) {
    const step = lastReturnStep >= 0 ? lastReturnStep : Math.max(n - 1, 0);
    divergence = {
      kind: "wrong-output",
      step,
      line: enriched[step]?.line ?? 0,
      message: `Output ${fmt(raw.result)} does not match expected ${fmt(test.expected)} — flagging at line ${enriched[step]?.line ?? "?"}`,
    };
  }

  const hasResult = !raw.error && !raw.truncated;
  const banner = divergence
    ? divergence.message
    : `Output ${fmt(raw.result)} matches expected — clean walk, no flags.`;

  const listOrder = [...listNames, ...stringNames]
    .filter((nm) => !heapNames.has(nm))
    .sort((a, b) => {
      const ai = (template.argNames || []).indexOf(a);
      const bi = (template.argNames || []).indexOf(b);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b);
    });
  const dictOrder = [...dictNames].sort();
  const gridOrder = [...gridNames];

  // scene extent for camera framing
  const maxLen = Math.max(1, ...Object.values(maxLens), 0);
  let extentX = Math.max(maxLen * 1.3, 6);
  if (structureKind === "tree") extentX = Math.max(extentX, Math.min(maxNodeId, 31) * 1.6, 9);
  else if (structureKind === "graph") extentX = Math.max(extentX, maxNodeId * 2.4, 8);
  else if (structureKind === "linked") extentX = Math.max(extentX, maxNodeId * 2.7);
  for (const [, [, cols]] of Object.entries(maxGrid)) extentX = Math.max(extentX, cols * 1.4 + 2);

  return {
    steps: enriched,
    events,
    cmps,
    laps,
    divergence,
    banner,
    result: raw.result,
    hasResult,
    expected: test.expected,
    lastReturnStep,
    listOrder,
    dictOrder,
    gridOrder,
    heapNames,
    stringNames,
    structureKind,
    hasNodes: structureKind === "linked",
    maxNodeId,
    extentX,
    truncated: !!raw.truncated,
    opsMode,
    ops: raw.ops || null,
    opAtStep,
    outputs: opsMode ? raw.result : null,
  };
}

function deepSortKey(v) {
  return JSON.stringify(sortDeep(v));
}
function sortDeep(v) {
  if (Array.isArray(v)) {
    const mapped = v.map(sortDeep);
    // sort if it's a list of comparable scalars or arrays
    return [...mapped].sort((a, b) =>
      JSON.stringify(a) < JSON.stringify(b) ? -1 : 1
    );
  }
  return v;
}

function outputsMatch(template, actual, expected) {
  const norm = (v) => JSON.stringify(v);
  const mode = template.compare || "exact";
  if (mode === "index-pair" && Array.isArray(actual) && Array.isArray(expected)) {
    const sa = [...actual].sort((a, b) => a - b);
    const se = [...expected].sort((a, b) => a - b);
    return norm(sa) === norm(se);
  }
  if (mode === "set" && Array.isArray(actual) && Array.isArray(expected)) {
    const sa = [...actual].sort((a, b) => (norm(a) < norm(b) ? -1 : 1));
    const se = [...expected].sort((a, b) => (norm(a) < norm(b) ? -1 : 1));
    return norm(sa) === norm(se);
  }
  if (mode === "nested-set" && Array.isArray(actual) && Array.isArray(expected)) {
    return deepSortKey(actual) === deepSortKey(expected);
  }
  return norm(actual) === norm(expected);
}
