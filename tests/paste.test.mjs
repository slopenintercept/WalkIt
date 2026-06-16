/* Pasted-LeetCode-code support: typing names (List/Optional) available, and the
   `class Solution` wrapper / camelCase method names resolved automatically. */
import { loadPyodide } from "pyodide";
import { readFileSync } from "fs";
import { analyze } from "../src/trace/analyze.js";
import { TEMPLATES } from "../src/templates.js";

const tracerSrc = readFileSync(new URL("../src/pyodide/tracer.py", import.meta.url), "utf8");
const py = await loadPyodide();
py.runPython(tracerSrc);
const run = py.globals.get("walkit_run");
const T = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

function trace(code, template, test) {
  return JSON.parse(run(JSON.stringify({
    code, func: template.func, argKinds: template.argKinds,
    args: test.args, retKind: template.retKind,
  })));
}

let pass = 0, fail = 0;
const ck = (n, c, x = "") => { if (c) { pass++; console.log("  ok  " + n); } else { fail++; console.log("FAIL  " + n + "  " + x); } };

// 1) class Solution + List type hint (the exact shape the user pasted) must RUN,
//    not die with NameError: name 'List' is not defined / MissingFunction.
{
  const t = T["daily-temperatures"];
  const code = `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)
        stack = []
        for i, v in enumerate(temperatures):
            while stack and v > temperatures[stack[-1]]:
                j = stack.pop()
                answer[j] = i - j
            stack.append(i)
        return answer`;
  const raw = trace(code, t, t.tests[0]);
  ck("class Solution + List hint runs (no setup error)",
    !raw.error || !["NameError", "MissingFunction", "SyntaxError"].includes(raw.error.type),
    JSON.stringify(raw.error));
  const a = analyze(raw, t, t.tests[0], code);
  ck("class Solution correct → clean + right answer",
    a.divergence === null && JSON.stringify(raw.result) === JSON.stringify(t.tests[0].expected),
    `div=${a.divergence?.kind} result=${JSON.stringify(raw.result)}`);
}

// 2) class Solution for Two Sum (List hint), correct → matches expected
{
  const t = T["two-sum"];
  const code = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen:
                return [seen[target - n], i]
            seen[n] = i
        return []`;
  const raw = trace(code, t, t.tests[1]); // target 9 -> [0,1]
  const a = analyze(raw, t, t.tests[1], code);
  ck("class Solution Two Sum resolves & correct",
    a.divergence === null, `div=${a.divergence?.kind} result=${JSON.stringify(raw.result)}`);
}

// 3) camelCase top-level function (no class) resolves
{
  const t = T["two-sum"];
  const code = `def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []`;
  const raw = trace(code, t, t.tests[1]);
  ck("camelCase top-level function resolves",
    !raw.error && JSON.stringify(raw.result) === JSON.stringify([0, 1]),
    `err=${JSON.stringify(raw.error)} result=${JSON.stringify(raw.result)}`);
}

// 4) Optional[ListNode] hint on a linked-list problem runs
{
  const t = T["reverse-linked-list"];
  const code = `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        while head:
            nxt = head.next
            head.next = prev
            prev = head
            head = nxt
        return prev`;
  const raw = trace(code, t, t.tests[0]);
  ck("Optional[ListNode] hint + class resolves",
    !raw.error && JSON.stringify(raw.result) === JSON.stringify([5, 4, 3, 2, 1]),
    `err=${JSON.stringify(raw.error)} result=${JSON.stringify(raw.result)}`);
}

// 5) backward compat: a plain snake_case top-level function still works
{
  const t = T["daily-temperatures"];
  const raw = trace(t.solutionCode, t, t.tests[0]);
  ck("plain top-level function still works",
    !raw.error && JSON.stringify(raw.result) === JSON.stringify(t.tests[0].expected),
    JSON.stringify(raw.error));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
