/* Drives every template through the real tracer + analyzer:
   - the buggy default must diverge on its first test case
   - the working solution must be clean (no flag) on ALL test cases
   - neither should crash the tracer with a setup/syntax error            */
import { loadPyodide } from "pyodide";
import { readFileSync } from "fs";
import { analyze } from "../src/trace/analyze.js";
import { TEMPLATES } from "../src/templates.js";

const tracerSrc = readFileSync(new URL("../src/pyodide/tracer.py", import.meta.url), "utf8");
const py = await loadPyodide();
py.runPython(tracerSrc);
const run = py.globals.get("walkit_run");

function trace(code, template, test) {
  const payload =
    template.mode === "ops"
      ? JSON.stringify({ code, mode: "ops", className: template.className, ops: test.ops, opArgs: test.opArgs })
      : JSON.stringify({
          code, func: template.func, argKinds: template.argKinds,
          args: test.args, retKind: template.retKind,
        });
  return JSON.parse(run(payload));
}

let pass = 0, fail = 0;
const fails = [];
function ck(name, cond, extra = "") {
  if (cond) pass++;
  else {
    fail++;
    fails.push(`${name}  ${extra}`);
  }
}

for (const t of TEMPLATES) {
  // setup sanity: solution must not have syntax/missing errors
  const sol0 = trace(t.solutionCode, t, t.tests[0]);
  ck(
    `${t.id}: solution loads`,
    !sol0.error || !["SyntaxError", "MissingFunction", "MissingClass"].includes(sol0.error.type),
    JSON.stringify(sol0.error)
  );

  // solution clean on every test
  for (let i = 0; i < t.tests.length; i++) {
    const raw = trace(t.solutionCode, t, t.tests[i]);
    const a = analyze(raw, t, t.tests[i], t.solutionCode);
    ck(
      `${t.id}: solution clean on test[${i}]`,
      a.divergence === null,
      `got ${a.divergence?.kind}: ${a.divergence?.message?.slice(0, 120)} | result=${JSON.stringify(raw.result)}`
    );
  }

  // buggy diverges on test[0]
  const rawB = trace(t.defaultCode, t, t.tests[0]);
  const aB = analyze(rawB, t, t.tests[0], t.defaultCode);
  ck(
    `${t.id}: buggy diverges on test[0]`,
    aB.divergence !== null,
    `no flag | result=${JSON.stringify(rawB.result)} expected=${JSON.stringify(t.tests[0].expected)}`
  );
}

console.log(`\nTemplates: ${TEMPLATES.length}`);
console.log(`${pass} passed, ${fail} failed`);
if (fails.length) {
  console.log("\nFAILURES:");
  for (const f of fails) console.log("  ✗ " + f);
}
process.exit(fail ? 1 : 0);
