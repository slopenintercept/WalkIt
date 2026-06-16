/* Walk It logic tests — runs the real tracer in Node pyodide, feeds traces
   through the real analyze.js, and asserts the review-fix behaviors. */
import { loadPyodide } from "pyodide";
import { readFileSync } from "fs";
import { analyze } from "../src/trace/analyze.js";
import { TEMPLATES } from "../src/templates.js";

const tracerSrc = readFileSync(
  new URL("../src/pyodide/tracer.py", import.meta.url),
  "utf8"
);
const T = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

const py = await loadPyodide();
py.runPython(tracerSrc);
const walkitRun = py.globals.get("walkit_run");

function trace(code, template, args) {
  const payload = JSON.stringify({
    code,
    func: template.func,
    argKinds: template.argKinds,
    args,
    retKind: template.retKind,
  });
  return JSON.parse(walkitRun(payload));
}

let pass = 0,
  fail = 0;
function check(name, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name} ${extra}`);
  }
}

// ---- 1. buggy two-sum: OOB divergence with faller j ----
{
  const t = T["two-sum"];
  const raw = trace(t.defaultCode, t, [[2, 7, 11, 15], 26]);
  const a = analyze(raw, t, { args: [[2, 7, 11, 15], 26], expected: [2, 3] }, t.defaultCode);
  check("oob divergence", a.divergence?.kind === "oob", JSON.stringify(a.divergence));
  check("oob faller is j@4", a.divergence?.faller?.name === "j" && a.divergence.faller.index === 4);
}

// ---- 2. solution two-sum: clean ----
{
  const t = T["two-sum"];
  const raw = trace(t.solutionCode, t, [[2, 7, 11, 15], 26]);
  const a = analyze(raw, t, { args: [[2, 7, 11, 15], 26], expected: [2, 3] }, t.solutionCode);
  check("solution clean", a.divergence === null, JSON.stringify(a.divergence));
}

// ---- 3. correct EAFP code with a CAUGHT exception: no divergence ----
{
  const t = T["two-sum"];
  const code = `def two_sum(nums, target):
    for i in range(len(nums)):
        try:
            j = nums.index(target - nums[i], i + 1)
            return [i, j]
        except ValueError:
            pass
    return []`;
  const raw = trace(code, t, [[3, 2, 4], 6]);
  const a = analyze(raw, t, { args: [[3, 2, 4], 6], expected: [1, 2] }, code);
  check("caught exception not flagged", a.divergence === null, JSON.stringify(a.divergence));
  check("caught-exc run returns right answer", JSON.stringify(raw.result) === "[1,2]");
}

// ---- 4. try/except around loop body cannot swallow the step-limit kill ----
{
  const t = T["two-sum"];
  const code = `def two_sum(nums, target):
    i = 0
    while i < 30000:
        try:
            i = i + 1
        except Exception:
            pass
    return []`;
  const raw = trace(code, t, [[1, 2], 3]);
  check("step limit survives except Exception", raw.truncated === true, `truncated=${raw.truncated} result=${JSON.stringify(raw.result)}`);
  check("step limit caps steps", raw.steps.length <= 2000, `steps=${raw.steps.length}`);
}

// ---- 5. SystemExit produces a structured error, not a crash ----
{
  const t = T["two-sum"];
  const code = `def two_sum(nums, target):
    exit()`;
  const raw = trace(code, t, [[1, 2], 3]);
  check("SystemExit structured", raw.error?.type === "SystemExit", JSON.stringify(raw.error));
}

// ---- 6. top-level loop obeys the step budget ----
{
  const t = T["two-sum"];
  const code = `x = 0
while x < 300000:
    x += 1

def two_sum(nums, target):
    return []`;
  const raw = trace(code, t, [[1, 2], 3]);
  check("top-level loop killed", raw.truncated === true, `truncated=${raw.truncated}`);
}

// ---- 7. node ids never recycled across distinct nodes ----
{
  const t = T["reverse-linked-list"];
  const code = `def reverse_list(head):
    for i in range(5):
        tmp = ListNode(100 + i)
        tmp = None
    return head`;
  const raw = trace(code, t, [[1, 2]]);
  // collect val seen per node id across all steps; each id must keep one val
  const seen = {};
  let stable = true;
  for (const s of raw.steps) {
    for (const [id, node] of Object.entries(s.heap || {})) {
      if (seen[id] !== undefined && seen[id] !== node.val) stable = false;
      seen[id] = node.val;
    }
  }
  check("node ids stable across GC", stable, JSON.stringify(seen));
}

// ---- 8. if/else: else taken → if-line truth is false ----
{
  const t = T["best-time-stock"];
  const code = `def max_profit(prices):
    best = 0
    for i in range(1, len(prices)):
        if prices[i] < prices[i-1]:
            pass
        else:
            best = max(best, prices[i] - prices[0])
    return best`;
  const raw = trace(code, t, [[7, 1, 5]]);
  const a = analyze(raw, t, { args: [[7, 1, 5]], expected: 0 }, code);
  // find the step where the if-line evaluated prices[2] < prices[1] (5 < 1 → False, else runs)
  const ifLine = 4;
  let verdicts = [];
  a.steps.forEach((s, k) => {
    if (s.line === ifLine && s.event === "line" && a.cmps[k]) verdicts.push(a.cmps[k].truth);
  });
  // i=1: 1<7 true; i=2: 5<1 false
  check("if/else truth", JSON.stringify(verdicts) === "[true,false]", JSON.stringify(verdicts));
}

// ---- 9. single-line body → truth null (unknown), not false ----
{
  const t = T["best-time-stock"];
  const code = `def max_profit(prices):
    best = 0
    i = 0
    while i < len(prices) - 1:
        if prices[i+1] - prices[i] > best: best = prices[i+1] - prices[i]
        i += 1
    return best`;
  const raw = trace(code, t, [[1, 9, 2]]);
  const a = analyze(raw, t, { args: [[1, 9, 2]], expected: 8 }, code);
  const ifLine = 5;
  const verdicts = [];
  a.steps.forEach((s, k) => {
    if (s.line === ifLine && s.event === "line" && a.cmps[k]) verdicts.push(a.cmps[k].truth);
  });
  check(
    "single-line body truth is null",
    verdicts.length === 2 && verdicts.every((v) => v === null),
    JSON.stringify(verdicts)
  );
}

// ---- 10. value-scan restarts at tile 0 when the loop re-enters ----
{
  const t = T["best-time-stock"];
  const code = `def max_profit(prices):
    best = 0
    for i in range(len(prices)):
        day = 0
        for p in prices:
            if day > i and p - prices[i] > best:
                best = p - prices[i]
            day += 1
    return best`;
  const raw = trace(code, t, [[3, 1, 4]]);
  const a = analyze(raw, t, { args: [[3, 1, 4]], expected: 3 }, code);
  // gather p's tile index over time; it must return to 0 after each pass
  const tiles = a.steps.map((s) => s.pointers.p?.index).filter((x) => x !== undefined);
  const resets = tiles.filter((x, i) => i > 0 && x === 0 && tiles[i - 1] === 2).length;
  check("scan resets each pass", resets >= 2, `tiles=${JSON.stringify(tiles.slice(0, 40))}`);
}

// ---- 11. `for i in prices` is a scan, not an index pointer ----
{
  const t = T["best-time-stock"];
  const code = `def max_profit(prices):
    best = 0
    low = prices[0]
    for i in prices:
        if i < low:
            low = i
        elif i - low > best:
            best = i - low
    return best`;
  const raw = trace(code, t, [[7, 1, 5, 3, 6, 4]]);
  const a = analyze(raw, t, { args: [[7, 1, 5, 3, 6, 4]], expected: 5 }, code);
  check("for-i-in-prices clean", a.divergence === null, JSON.stringify(a.divergence));
  // i must walk 0,1,2,... (scan), never jump by element value
  const tiles = a.steps.map((s) => s.pointers.i).filter(Boolean);
  const allScan = tiles.every((p) => p.scan);
  const idxs = [...new Set(tiles.map((p) => p.index))];
  check("i is scan-classified", allScan && JSON.stringify(idxs) === "[0,1,2,3,4,5]", JSON.stringify({ allScan, idxs }));
}

// ---- 12. stock template comparisons glow the scanned tile ----
{
  const t = T["best-time-stock"];
  const raw = trace(t.solutionCode, t, [[7, 1, 5, 3, 6, 4]]);
  const a = analyze(raw, t, { args: [[7, 1, 5, 3, 6, 4]], expected: 5 }, t.solutionCode);
  const glowing = a.cmps.filter((c) => c && c.tiles.length > 0);
  check("stock comparisons glow tiles", glowing.length > 5, `glowing steps=${glowing.length}`);
}

// ---- 13. while-loop exit at implicit return reads as false, not green ----
{
  const t = T["reverse-linked-list"];
  const code = `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`;
  const raw = trace(code, t, [[1, 2, 3]]);
  const a = analyze(raw, t, { args: [[1, 2, 3]], expected: [3, 2, 1] }, code);
  check("recursive-free reverse clean", a.divergence === null, JSON.stringify(a.divergence));
  const whileLine = 4;
  const verdicts = [];
  a.steps.forEach((s, k) => {
    if (s.line === whileLine && s.event === "line" && a.cmps[k]) verdicts.push(a.cmps[k].truth);
  });
  check(
    "while truth: T,T,T then F",
    JSON.stringify(verdicts) === "[true,true,true,false]",
    JSON.stringify(verdicts)
  );
}

// ---- 14. recursion depth recorded for dungeon floors ----
{
  const t = T["reverse-linked-list"];
  const code = `def reverse_list(head):
    if head is None or head.next is None:
        return head
    rest = reverse_list(head.next)
    head.next.next = head
    head.next = None
    return rest`;
  const raw = trace(code, t, [[1, 2, 3]]);
  const a = analyze(raw, t, { args: [[1, 2, 3]], expected: [3, 2, 1] }, code);
  check("recursive reverse clean", a.divergence === null, JSON.stringify(a.divergence));
  const maxDepth = Math.max(...a.steps.map((s) => s.depth));
  check("recursion depth tracked", maxDepth === 3, `maxDepth=${maxDepth}`);
}

// ---- 15. consecutive runs don't leak state ----
{
  const t = T["two-sum"];
  const raw1 = trace(t.defaultCode, t, [[2, 7, 11, 15], 26]);
  const raw2 = trace(t.defaultCode, t, [[2, 7, 11, 15], 26]);
  check("runs independent", raw1.steps.length === raw2.steps.length);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
