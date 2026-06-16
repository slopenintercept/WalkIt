import tracerSource from "./tracer.py?raw";

let pyodidePromise = null;

export function ensurePyodide(onStatus) {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (typeof window.loadPyodide !== "function") {
        throw new Error(
          "Pyodide script not loaded — Walk It needs network access to cdn.jsdelivr.net"
        );
      }
      onStatus?.("Loading Python runtime (~10 MB, first visit only)…");
      const pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });
      pyodide.runPython(tracerSource);
      return pyodide;
    })();
    pyodidePromise.catch(() => {
      pyodidePromise = null; // allow retry after a failed load
    });
  }
  return pyodidePromise;
}

export async function runTrace({ code, template, input, onStatus }) {
  const pyodide = await ensurePyodide(onStatus);
  onStatus?.("Tracing your code…");
  const payload =
    template.mode === "ops"
      ? JSON.stringify({
          code,
          mode: "ops",
          className: template.className,
          ops: input.ops,
          opArgs: input.opArgs,
        })
      : JSON.stringify({
          code,
          func: template.func,
          argKinds: template.argKinds,
          args: input.args,
          retKind: template.retKind,
        });
  const run = pyodide.globals.get("walkit_run");
  try {
    const out = run(payload);
    return JSON.parse(out);
  } finally {
    run.destroy?.();
  }
}
