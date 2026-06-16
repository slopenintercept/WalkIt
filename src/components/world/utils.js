export const TILE = 1.3;
export const NODE_DX = 2.7;

const PALETTE = [
  "#ffb454", "#ff6b9d", "#4ecdc4", "#a78bfa",
  "#f87171", "#34d399", "#fbbf24", "#60a5fa",
];

export function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function fmtVal(v) {
  if (v === null || v === undefined) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "string") return v.length > 12 ? v.slice(0, 11) + ".." : v;
  if (Array.isArray(v)) {
    const s = "[" + v.map(fmtVal).join(",") + "]";
    return s.length > 24 ? s.slice(0, 23) + "..]" : s;
  }
  if (typeof v === "object") return "{..}";
  return String(v);
}

// offsets so several characters can share one tile/platform without overlapping
export const STAND_SLOTS = [
  [0, -0.1],
  [0.42, 0.3],
  [-0.42, 0.3],
  [0.46, -0.34],
  [-0.46, -0.34],
];

export const TREE_DX = 1.5; // horizontal gap between in-order tree nodes
export const TREE_DZ = 2.4; // depth between tree levels

// Roots of a tree heap are nodes that are no other node's child (a forest,
// for two-tree problems like Same Tree / Subtree).
export function treeRoots(heap) {
  const children = new Set();
  for (const node of Object.values(heap)) {
    if (node.left != null) children.add(node.left);
    if (node.right != null) children.add(node.right);
  }
  const ids = Object.keys(heap).map(Number).sort((a, b) => a - b);
  const roots = ids.filter((id) => !children.has(id));
  return roots.length ? roots : ids.slice(0, 1);
}

// Clean binary-tree layout: x by in-order index, z by depth. Multiple roots
// are laid out side by side. Returns { pos: {id:[x,z]}, width }.
export function treeLayout(heap) {
  const pos = {};
  const roots = treeRoots(heap);
  if (!roots.length) return { pos, roots, width: 0 };
  let counter = 0;
  const seen = new Set();
  const walk = (id, depth) => {
    if (id == null || !heap[String(id)] || seen.has(id)) return;
    seen.add(id);
    const node = heap[String(id)];
    walk(node.left, depth + 1);
    pos[id] = [counter * TREE_DX, depth * TREE_DZ];
    counter++;
    walk(node.right, depth + 1);
  };
  roots.forEach((root, ri) => {
    if (ri > 0) counter += 1.5; // gap between separate trees
    walk(root, 0);
  });
  const xs = Object.values(pos).map((p) => p[0]);
  if (!xs.length) return { pos, roots, width: 0 };
  const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
  for (const id of Object.keys(pos)) pos[id][0] -= mid;
  return { pos, roots, width: Math.max(...xs) - Math.min(...xs) };
}

// Graph nodes laid out on a circle, ordered by value.
export function graphLayout(heap) {
  const entries = Object.entries(heap).sort(
    (a, b) => (a[1].val ?? 0) - (b[1].val ?? 0)
  );
  const k = entries.length;
  const radius = Math.max(2.2, k * 0.75);
  const pos = {};
  entries.forEach(([id], i) => {
    const a = (i / Math.max(k, 1)) * Math.PI * 2 - Math.PI / 2;
    pos[id] = [Math.cos(a) * radius, Math.sin(a) * radius];
  });
  return { pos, radius };
}

// Array-backed heap as a binary-tree pyramid: index i -> [x, z].
export function heapLayout(len) {
  const pos = [];
  for (let i = 0; i < len; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    const rowStart = (1 << depth) - 1;
    const rowCount = 1 << depth;
    const within = i - rowStart;
    const x = (within - (rowCount - 1) / 2) * (TREE_DX * (1 << Math.max(0, 3 - depth)));
    pos.push([x, depth * TREE_DZ]);
  }
  return pos;
}
