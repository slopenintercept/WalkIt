import { StateField, StateEffect } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

// Highlights the line currently executing in the trace. Dispatch
// setExecLine.of(lineNumber | null) to move/clear it.
export const setExecLine = StateEffect.define();

const execLineDeco = Decoration.line({ class: "cm-exec-line" });

export const execLineField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setExecLine)) {
        if (e.value == null || e.value < 1 || e.value > tr.state.doc.lines) {
          return Decoration.none;
        }
        const line = tr.state.doc.line(e.value);
        deco = Decoration.set([execLineDeco.range(line.from)]);
      }
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});
