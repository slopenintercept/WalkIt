import { useEffect, useMemo, useRef, useState } from "react";
import { TEMPLATES, GROUPS } from "../templates";

// Type-to-filter problem picker. Matches on LeetCode number, name, or category
// so "54", "spiral" and "matrix" all find Spiral Matrix.
function matchesQuery(t, q) {
  if (!q) return true;
  return (
    String(t.lc).startsWith(q) ||
    t.name.toLowerCase().includes(q) ||
    t.group.toLowerCase().includes(q)
  );
}

export default function ProblemPicker({ template, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const activeRef = useRef(null);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = [];
    for (const g of GROUPS) {
      const items = TEMPLATES.filter((t) => t.group === g && matchesQuery(t, q));
      if (items.length) out.push({ group: g, items });
    }
    return out;
  }, [query]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // keep the highlight in range as the query narrows the list
  useEffect(() => {
    setActive((a) => (a < flat.length ? a : 0));
  }, [flat.length]);

  // keep the highlighted row visible while arrowing through a long list
  useEffect(() => {
    if (open) activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // click outside closes
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openPicker = () => {
    setQuery("");
    setActive(Math.max(0, TEMPLATES.findIndex((t) => t.id === template.id)));
    setOpen(true);
  };

  const choose = (t) => {
    if (t) onSelect(t.id);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openPicker();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (flat.length ? (a + d + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open) choose(flat[active]);
      else openPicker();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  // index of each item within `flat`, so highlighting survives grouping
  let cursor = -1;

  return (
    <div className="picker" ref={rootRef}>
      <input
        ref={inputRef}
        className="picker-input"
        type="text"
        spellCheck={false}
        placeholder="search problems…"
        title="search by number, name, or category"
        value={open ? query : `${template.lc}. ${template.name}`}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onMouseDown={() => {
          if (!open) openPicker();
        }}
        onFocus={() => {
          if (!open) openPicker();
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="picker-menu">
          {flat.length === 0 && <div className="picker-empty">no matches</div>}
          {sections.map((s) => (
            <div key={s.group}>
              <div className="picker-group">{s.group}</div>
              {s.items.map((t) => {
                cursor++;
                const i = cursor;
                return (
                  <div
                    key={t.id}
                    ref={i === active ? activeRef : null}
                    className={
                      "picker-item" +
                      (i === active ? " is-active" : "") +
                      (t.id === template.id ? " is-current" : "")
                    }
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(t);
                    }}
                  >
                    <span className="picker-lc">{t.lc}</span>
                    <span className="picker-name">{t.name}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
