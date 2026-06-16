import { useCallback, useEffect, useMemo, useState } from "react";
import { TEMPLATES, testLabel, GROUPS } from "./templates";
import { ensurePyodide, runTrace } from "./pyodide/runner";
import { analyze } from "./trace/analyze";
import EditorPanel from "./components/EditorPanel";
import Scene from "./components/Scene";
import Timeline from "./components/Timeline";

// the input-box text for a test, depending on mode
function inputText(template, test) {
  if (template.mode === "ops")
    return JSON.stringify({ ops: test.ops, opArgs: test.opArgs }, null, 1);
  return JSON.stringify(test.args);
}

export default function App() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const template = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );
  const [code, setCode] = useState(TEMPLATES[0].defaultCode);
  const [testIdx, setTestIdx] = useState(0);
  const [argsText, setArgsText] = useState(
    inputText(TEMPLATES[0], TEMPLATES[0].tests[0])
  );
  const [expectedText, setExpectedText] = useState(
    JSON.stringify(TEMPLATES[0].tests[0].expected)
  );
  const [status, setStatus] = useState({ kind: "idle", msg: "" });
  const [analysis, setAnalysis] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stale, setStale] = useState(false);
  const [running, setRunning] = useState(false);

  // warm up the Python runtime in the background
  useEffect(() => {
    ensurePyodide((m) => setStatus({ kind: "loading", msg: m }))
      .then(() =>
        setStatus((s) =>
          s.kind === "loading" || s.kind === "idle"
            ? { kind: "idle", msg: "Python ready" }
            : s
        )
      )
      .catch((e) => setStatus({ kind: "error", msg: e.message }));
  }, []);

  const selectTemplate = (id) => {
    const t = TEMPLATES.find((x) => x.id === id);
    setTemplateId(id);
    setCode(t.defaultCode);
    setTestIdx(0);
    setArgsText(inputText(t, t.tests[0]));
    setExpectedText(JSON.stringify(t.tests[0].expected));
    setAnalysis(null);
    setStepIndex(0);
    setPlaying(false);
    setStale(false);
  };

  const selectTest = (i) => {
    setTestIdx(i);
    setArgsText(inputText(template, template.tests[i]));
    setExpectedText(JSON.stringify(template.tests[i].expected));
    setStale(true);
  };

  const doRun = async (codeArg, templateArg, input, test) => {
    setRunning(true);
    setPlaying(false);
    try {
      const raw = await runTrace({
        code: codeArg,
        template: templateArg,
        input,
        onStatus: (m) => setStatus({ kind: "loading", msg: m }),
      });
      const setupErr = ["SyntaxError", "MissingFunction", "MissingClass"];
      if (raw.error && setupErr.includes(raw.error.type)) {
        setAnalysis(null);
        setStatus({
          kind: "error",
          msg:
            `${raw.error.type === "SyntaxError" ? "Syntax error" : "Setup"}: ${raw.error.msg}` +
            (raw.error.line ? ` (line ${raw.error.line})` : ""),
        });
        return;
      }
      const a = analyze(raw, templateArg, test, codeArg);
      setAnalysis(a);
      setStale(false);
      setStepIndex(a.divergence ? a.divergence.step : 0);
      setStatus({ kind: "idle", msg: "" });
    } catch (e) {
      console.error(e);
      setStatus({ kind: "error", msg: "Run failed: " + (e.message || e) });
    } finally {
      setRunning(false);
    }
  };

  const run = () => {
    let input, expected, test;
    try {
      const parsed = JSON.parse(argsText);
      if (template.mode === "ops") {
        if (!parsed || !Array.isArray(parsed.ops) || !Array.isArray(parsed.opArgs))
          throw new Error('expected { "ops": [...], "opArgs": [...] }');
        input = { ops: parsed.ops, opArgs: parsed.opArgs };
      } else {
        if (!Array.isArray(parsed)) throw new Error("must be a JSON array of arguments");
        input = { args: parsed };
      }
    } catch (e) {
      setStatus({ kind: "error", msg: "Input is not valid JSON: " + e.message });
      return;
    }
    try {
      expected = JSON.parse(expectedText);
    } catch (e) {
      setStatus({ kind: "error", msg: "Expected output is not valid JSON: " + e.message });
      return;
    }
    test = template.mode === "ops"
      ? { ops: input.ops, opArgs: input.opArgs, expected }
      : { args: input.args, expected };
    doRun(code, template, input, test);
  };

  // playback — auto-freeze when the playhead reaches the divergence step
  useEffect(() => {
    if (!playing || !analysis) return;
    const id = setInterval(() => {
      setStepIndex((s) => {
        const last = analysis.steps.length - 1;
        if (s >= last) {
          setPlaying(false);
          return s;
        }
        const next = s + 1;
        if (analysis.divergence && next === analysis.divergence.step)
          setPlaying(false);
        return next;
      });
    }, 340 / speed);
    return () => clearInterval(id);
  }, [playing, speed, analysis]);

  // keyboard scrubbing
  useEffect(() => {
    const onKey = (e) => {
      if (!analysis) return;
      const t = e.target;
      if (
        t.closest?.(".cm-editor") ||
        /INPUT|TEXTAREA|SELECT/.test(t.tagName || "")
      )
        return;
      if (e.key === "ArrowRight") {
        setStepIndex((s) => Math.min(s + 1, analysis.steps.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setStepIndex((s) => Math.max(s - 1, 0));
        e.preventDefault();
      } else if (e.key === " ") {
        setPlaying((p) => !p);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [analysis]);

  const onCodeChange = useCallback((v) => {
    setCode(v);
    setStale(true);
  }, []);

  const step = analysis?.steps[stepIndex];
  const currentLine = !stale && step ? step.line : null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">🚩 Walk It</div>
        <select
          value={templateId}
          onChange={(e) => selectTemplate(e.target.value)}
          title="problem template"
        >
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {TEMPLATES.filter((t) => t.group === g).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select
          value={testIdx}
          onChange={(e) => selectTest(Number(e.target.value))}
          title="test case"
        >
          {template.tests.map((t, i) => (
            <option key={i} value={i}>
              {testLabel(template, t)}
            </option>
          ))}
        </select>
        <button className="run" onClick={run} disabled={running}>
          {running ? "Running…" : "▶ Run"}
        </button>
        <div className={`status status-${status.kind}`}>
          {stale && analysis ? "edited — press Run to re-trace · " : ""}
          {status.msg}
        </div>
      </header>

      <div className="main">
        <aside className="left">
          <EditorPanel
            template={template}
            code={code}
            onChange={onCodeChange}
            currentLine={currentLine}
          />
          <div className="testbox">
            <label>
              {template.mode === "ops"
                ? 'input — { "ops": [...], "opArgs": [...] }'
                : "input — args as a JSON list, one entry per parameter"}
            </label>
            <textarea
              rows={template.mode === "ops" ? 4 : 2}
              spellCheck={false}
              value={argsText}
              onChange={(e) => {
                setArgsText(e.target.value);
                setStale(true);
              }}
            />
            <label>expected output (JSON)</label>
            <textarea
              rows={1}
              spellCheck={false}
              value={expectedText}
              onChange={(e) => {
                setExpectedText(e.target.value);
                setStale(true);
              }}
            />
            <div className="snippets">
              <button
                onClick={() => {
                  setCode(template.defaultCode);
                  setStale(true);
                }}
              >
                load buggy example
              </button>
              <button
                onClick={() => {
                  setCode(template.solutionCode);
                  setStale(true);
                }}
              >
                load working solution
              </button>
            </div>
          </div>
        </aside>

        <section className="center">
          <Scene analysis={analysis} stepIndex={stepIndex} />
          {analysis && !stale && (
            <div
              className={`banner ${analysis.divergence ? "banner-bad" : "banner-good"}`}
            >
              {analysis.divergence ? "🚩 " : "✅ "}
              {analysis.banner}
            </div>
          )}
          <div className="legend">
            characters = your index/pointer variables · tiles = list values ·
            chest = dict · bridges = next pointers · 🚩 = first divergence
          </div>
        </section>
      </div>

      <Timeline
        analysis={analysis}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        playing={playing}
        setPlaying={setPlaying}
        speed={speed}
        setSpeed={setSpeed}
      />
    </div>
  );
}
