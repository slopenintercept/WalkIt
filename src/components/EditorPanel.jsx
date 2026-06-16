import { useEffect, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { execLineField, setExecLine } from "../editor/execLine";

export default function EditorPanel({ template, code, onChange, currentLine }) {
  const viewRef = useRef(null);
  // stable identity — a fresh array here makes react-codemirror dispatch a
  // full reconfigure on every render (i.e. on every timeline step)
  const extensions = useMemo(() => [python(), execLineField], []);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: setExecLine.of(currentLine ?? null) });
  }, [currentLine, code]);

  return (
    <div className="editor-panel">
      <div className="ed-head">
        <div className="sig">
          {template.mode === "ops"
            ? `class ${template.className}`
            : `def ${template.func}(${template.argNames.join(", ")})`}
        </div>
        <div className="desc">{template.description}</div>
      </div>
      <CodeMirror
        value={code}
        theme="dark"
        height="100%"
        style={{ flex: 1, minHeight: 0, overflow: "auto" }}
        extensions={extensions}
        onChange={onChange}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
      />
    </div>
  );
}
