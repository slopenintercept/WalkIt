import { useCallback, useEffect, useRef } from "react";

export default function Timeline({
  analysis,
  stepIndex,
  setStepIndex,
  playing,
  setPlaying,
  speed,
  setSpeed,
}) {
  const canvasRef = useRef(null);
  const dragging = useRef(false);
  const n = analysis ? analysis.steps.length : 0;
  const div = analysis?.divergence;
  const PAD = 14;

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (!w || !h) return;
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    if (!n) {
      ctx.fillStyle = "#3a4564";
      ctx.font = "12px sans-serif";
      ctx.fillText("run your code to get a timeline", PAD, h / 2 + 4);
      return;
    }
    const W = w - PAD * 2;
    const x = (i) => PAD + (n === 1 ? 0 : (i / (n - 1)) * W);
    const mid = h / 2 + 6;

    ctx.lineCap = "round";
    ctx.strokeStyle = "#252e4f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(PAD, mid);
    ctx.lineTo(PAD + W, mid);
    ctx.stroke();

    ctx.strokeStyle = "#4a5b8c";
    ctx.beginPath();
    ctx.moveTo(PAD, mid);
    ctx.lineTo(x(stepIndex), mid);
    ctx.stroke();

    // tick marks (thinned when steps outnumber pixels)
    const every = Math.max(1, Math.ceil(n / Math.floor(W / 7)));
    for (let i = 0; i < n; i += every) {
      const ev = analysis.steps[i].event;
      ctx.strokeStyle =
        ev === "call" || ev === "return" ? "#7d8db5" : "#39426a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x(i), mid - 5);
      ctx.lineTo(x(i), mid + 5);
      ctx.stroke();
    }

    if (div) {
      const dx = x(div.step);
      ctx.strokeStyle = "#ff3b4d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(dx, mid - 12);
      ctx.lineTo(dx, mid + 8);
      ctx.stroke();
      ctx.fillStyle = "#ff3b4d";
      ctx.beginPath();
      ctx.moveTo(dx, mid - 18);
      ctx.lineTo(dx + 9, mid - 14);
      ctx.lineTo(dx, mid - 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x(stepIndex), mid, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }, [analysis, n, stepIndex, div]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  const seek = (e) => {
    if (!n) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const frac = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left - PAD) / (rect.width - PAD * 2))
    );
    setStepIndex(Math.round(frac * (n - 1)));
  };

  const step = analysis?.steps[stepIndex];

  return (
    <footer className="timeline">
      <div className="controls">
        <button disabled={!n} onClick={() => setStepIndex(0)} title="jump to start">
          ⏮
        </button>
        <button
          disabled={!n}
          onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
          title="step back"
        >
          ◀
        </button>
        <button
          className="play"
          disabled={!n}
          onClick={() => {
            if (!playing && stepIndex >= n - 1) setStepIndex(0);
            setPlaying(!playing);
          }}
        >
          {playing ? "❚❚ pause" : "▶ play"}
        </button>
        <button
          disabled={!n}
          onClick={() => setStepIndex(Math.min(n - 1, stepIndex + 1))}
          title="step forward"
        >
          ▶
        </button>
        <button disabled={!n} onClick={() => setStepIndex(n - 1)} title="jump to end">
          ⏭
        </button>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
        </select>
        {div && (
          <button className="jump" onClick={() => setStepIndex(div.step)}>
            🚩 jump to flag
          </button>
        )}
        <div className="stepinfo">
          {n
            ? `step ${stepIndex + 1}/${n} · line ${step?.line ?? "–"} · ${step?.event}`
            : "no trace yet"}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="scrub"
        onPointerDown={(e) => {
          if (!n) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setPlaying(false);
          seek(e);
        }}
        onPointerMove={(e) => dragging.current && seek(e)}
        onPointerUp={() => (dragging.current = false)}
      />
    </footer>
  );
}
