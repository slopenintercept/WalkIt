"""Walk It tracer — runs inside Pyodide.

Executes user code under sys.settrace and records one JSON step per
line/call/return/exception event. See README.md for the trace format.
"""

import json
import math
import sys

STEP_LIMIT = 2000
CONTAINER_CAP = 30


# BaseException so a user's `except Exception:` can't swallow the kill signal
class StepLimitExceeded(BaseException):
    pass


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Node:
    """Graph node (LeetCode 'Clone Graph' shape)."""

    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def _plain(x):
    """Container elements: keep primitives, short-label nodes, repr the rest."""
    if x is None or isinstance(x, (bool, int, str)):
        return x
    if isinstance(x, float):
        if math.isinf(x) or math.isnan(x):
            return repr(x)
        return x
    if isinstance(x, ListNode):
        return "→%s" % (x.val,)
    if isinstance(x, TreeNode):
        return "△%s" % (x.val,)
    if isinstance(x, Node):
        return "◆%s" % (x.val,)
    return repr(x)[:40]


# ---- input builders (JSON value -> Python object) -------------------------

def build_linked_list(vals):
    head = None
    for x in reversed(vals):
        head = ListNode(x, head)
    return head


def build_linked_list_cycle(spec):
    """[values, pos] -> list whose tail links back to node[pos] (pos<0 = none)."""
    vals, pos = spec[0], spec[1]
    if not vals:
        return None
    nodes = [ListNode(v) for v in vals]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos is not None and pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0]


def build_tree(vals):
    """LeetCode level-order list with None holes -> TreeNode."""
    if not vals:
        return None
    it = iter(vals)
    root = TreeNode(next(it))
    queue = [root]
    qi = 0
    for v in it:
        parent = queue[qi // 2]
        if v is not None:
            child = TreeNode(v)
            if qi % 2 == 0:
                parent.left = child
            else:
                parent.right = child
            queue.append(child)
        else:
            queue.append(None)
        # advance to next slot, skipping holes that have no parent
        qi += 1
        while qi // 2 < len(queue) and queue[qi // 2] is None:
            qi += 1
    return root


def build_graph(adj):
    """Adjacency list (1-indexed neighbors) -> first Node, or None if empty."""
    if not adj:
        return None
    nodes = {i + 1: Node(i + 1) for i in range(len(adj))}
    for i, neighbors in enumerate(adj):
        nodes[i + 1].neighbors = [nodes[j] for j in neighbors]
    return nodes[1]


# ---- output serializers (Python object -> plain JSON) ---------------------

def serialize_linked_list(ret):
    out, seen, cur = [], set(), ret
    cycle = False
    while isinstance(cur, ListNode) and len(out) < 200:
        if id(cur) in seen:
            cycle = True
            break
        seen.add(id(cur))
        out.append(_plain(cur.val))
        cur = cur.next
    return out, cycle


def serialize_tree(root):
    """TreeNode -> LeetCode level-order list (trailing Nones trimmed)."""
    if not isinstance(root, TreeNode):
        return []  # empty tree
    out = []
    queue = [root]
    seen = set()
    while queue:
        node = queue.pop(0)
        if isinstance(node, TreeNode) and id(node) not in seen:
            seen.add(id(node))
            out.append(_plain(node.val))
            queue.append(node.left)
            queue.append(node.right)
        else:
            out.append(None)
        if len(out) > 400:
            break
    while out and out[-1] is None:
        out.pop()
    return out


def serialize_graph(node):
    """First Node -> adjacency list (by val order)."""
    if not isinstance(node, Node):
        return []
    seen = {}
    order = []
    stack = [node]
    while stack:
        n = stack.pop()
        if id(n) in seen:
            continue
        seen[id(n)] = n
        order.append(n)
        for nb in n.neighbors:
            if id(nb) not in seen:
                stack.append(nb)
    order.sort(key=lambda n: n.val)
    return [[nb.val for nb in n.neighbors] for n in order]


def _safe_json(v, depth=0):
    """Sanitize a function's return value into plain JSON."""
    if v is None or isinstance(v, (bool, int, str)):
        return v
    if isinstance(v, float):
        if math.isinf(v) or math.isnan(v):
            return repr(v)
        return v
    if depth > 5:
        return repr(v)[:60]
    if isinstance(v, (list, tuple)):
        return [_safe_json(x, depth + 1) for x in list(v)[:200]]
    if isinstance(v, dict):
        return {str(k): _safe_json(x, depth + 1) for k, x in list(v.items())[:200]}
    if isinstance(v, set):
        return sorted((_safe_json(x, depth + 1) for x in list(v)[:200]), key=repr)
    return repr(v)[:60]


class Tracer:
    def __init__(self):
        self.steps = []
        self.depth = 0
        self.silent = 0  # budget consumed by untraced (module-level) events
        self.truncated = False
        self._node_ids = {}
        self._node_refs = []  # keep nodes alive so id() addresses are never recycled
        self._next_id = 1

    def node_id(self, node):
        k = id(node)
        if k not in self._node_ids:
            self._node_ids[k] = self._next_id
            self._node_refs.append(node)
            self._next_id += 1
        return self._node_ids[k]

    def tick_silent(self):
        if len(self.steps) + self.silent >= STEP_LIMIT:
            self.truncated = True
            raise StepLimitExceeded()
        self.silent += 1

    def register_chain(self, head, heap):
        seen = set()
        cur = head
        while isinstance(cur, ListNode) and id(cur) not in seen:
            seen.add(id(cur))
            nid = self.node_id(cur)
            nxt = cur.next
            heap[str(nid)] = {
                "kind": "list",
                "val": _plain(cur.val),
                "next": self.node_id(nxt) if isinstance(nxt, ListNode) else None,
            }
            cur = nxt
        return self.node_id(head)

    def register_tree(self, root, heap):
        stack = [root]
        seen = set()
        while stack:
            node = stack.pop()
            if not isinstance(node, TreeNode) or id(node) in seen:
                continue
            seen.add(id(node))
            nid = self.node_id(node)
            heap[str(nid)] = {
                "kind": "tree",
                "val": _plain(node.val),
                "left": self.node_id(node.left) if isinstance(node.left, TreeNode) else None,
                "right": self.node_id(node.right) if isinstance(node.right, TreeNode) else None,
            }
            stack.append(node.left)
            stack.append(node.right)
        return self.node_id(root)

    def register_graph(self, start, heap):
        stack = [start]
        seen = set()
        while stack:
            node = stack.pop()
            if not isinstance(node, Node) or id(node) in seen:
                continue
            seen.add(id(node))
            nid = self.node_id(node)
            nbs = [n for n in node.neighbors if isinstance(n, Node)]
            heap[str(nid)] = {
                "kind": "graph",
                "val": _plain(node.val),
                "neighbors": [self.node_id(n) for n in nbs],
            }
            stack.extend(nbs)
        return self.node_id(start)

    def snap_value(self, v, heap, depth=0):
        if isinstance(v, bool):
            return {"t": "bool", "v": v}
        if isinstance(v, float) and (math.isinf(v) or math.isnan(v)):
            return {"t": "num", "v": repr(v)}
        if isinstance(v, (int, float)):
            return {"t": "num", "v": v}
        if isinstance(v, str):
            return {"t": "str", "v": v[:60], "len": len(v)}
        if v is None:
            return {"t": "none"}
        if isinstance(v, ListNode):
            return {"t": "node", "id": self.register_chain(v, heap)}
        if isinstance(v, TreeNode):
            return {"t": "tnode", "id": self.register_tree(v, heap)}
        if isinstance(v, Node):
            return {"t": "gnode", "id": self.register_graph(v, heap)}
        if isinstance(v, (list, tuple)):
            nested = any(isinstance(x, (list, tuple)) for x in v)
            if nested:
                rows = []
                for x in list(v)[:CONTAINER_CAP]:
                    if isinstance(x, (list, tuple)):
                        rows.append([_plain(e) for e in list(x)[:CONTAINER_CAP]])
                    else:
                        rows.append(_plain(x))
                return {"t": "grid", "v": rows, "len": len(v)}
            return {
                "t": "list",
                "v": [_plain(x) for x in list(v)[:CONTAINER_CAP]],
                "len": len(v),
            }
        if isinstance(v, dict):
            out = {}
            for i, (k, val) in enumerate(v.items()):
                if i >= CONTAINER_CAP:
                    break
                out[str(_plain(k))] = _plain(val)
            return {"t": "dict", "v": out, "len": len(v)}
        if isinstance(v, set):
            return {
                "t": "set",
                "v": [_plain(x) for x in list(v)[:CONTAINER_CAP]],
                "len": len(v),
            }
        # user object (design problems): expand instance attributes one level
        if depth == 0 and hasattr(v, "__dict__"):
            attrs = {}
            for k, val in list(vars(v).items())[:CONTAINER_CAP]:
                attrs[k] = self.snap_value(val, heap, depth + 1)
            return {"t": "obj", "cls": type(v).__name__, "attrs": attrs}
        return {"t": "obj", "cls": type(v).__name__, "v": repr(v)[:60]}

    def snapshot_locals(self, frame, heap):
        out = {}
        for name, val in frame.f_locals.items():
            if name.startswith("__"):
                continue
            if callable(val) and not isinstance(val, (ListNode, TreeNode, Node)):
                continue
            out[name] = self.snap_value(val, heap)
        return out

    def record(self, frame, event, arg):
        if len(self.steps) + self.silent >= STEP_LIMIT:
            self.truncated = True
            raise StepLimitExceeded()
        heap = {}
        step = {
            "i": len(self.steps),
            "event": event,
            "line": frame.f_lineno,
            "func": frame.f_code.co_name,
            "depth": self.depth,
            "locals": self.snapshot_locals(frame, heap),
        }
        if event == "return":
            step["ret"] = self.snap_value(arg, heap)
        if event == "exception":
            etype, evalue, _tb = arg
            step["exc"] = {"type": etype.__name__, "msg": str(evalue)[:200]}
        if heap:
            step["heap"] = heap
        self.steps.append(step)


TR = None


def _local_trace(frame, event, arg):
    TR.record(frame, event, arg)
    if event == "return":
        TR.depth -= 1
    return _local_trace


def _module_trace(frame, event, arg):
    # module-level statements aren't rendered, but still consume the step
    # budget so a top-level infinite loop can't hang the tab
    TR.tick_silent()
    return _module_trace


def _global_trace(frame, event, arg):
    if frame.f_code.co_filename != "<walkit>":
        return None
    if event == "call":
        if frame.f_code.co_name == "<module>":
            TR.tick_silent()
            return _module_trace
        TR.depth += 1
        TR.record(frame, "call", arg)
        return _local_trace
    return None


def _walkit_line(e):
    tb = e.__traceback__
    line = 0
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == "<walkit>":
            line = tb.tb_lineno
        tb = tb.tb_next
    return line


def make_arg(kind, val):
    if kind == "linkedlist":
        return build_linked_list(val)
    if kind == "linkedlist_cycle":
        return build_linked_list_cycle(val)
    if kind == "tree":
        return build_tree(val)
    if kind == "graph":
        return build_graph(val)
    return val  # list, matrix, value, string, int


def serialize_ret(ret_kind, ret):
    if ret_kind == "linkedlist":
        out, cycle = serialize_linked_list(ret)
        return out, cycle
    if ret_kind == "tree":
        return serialize_tree(ret), False
    if ret_kind == "graph":
        return serialize_graph(ret), False
    return _safe_json(ret), False


def walkit_run(payload_json):
    global TR
    p = json.loads(payload_json)
    user_code = p["code"]
    mode = p.get("mode", "func")

    TR = Tracer()
    result = {
        "steps": [],
        "result": None,
        "error": None,
        "truncated": False,
        "stepLimit": STEP_LIMIT,
        "mode": mode,
    }

    glb = {"ListNode": ListNode, "TreeNode": TreeNode, "Node": Node}
    # LeetCode's editor implicitly provides typing names (List, Optional, …),
    # so pasted solutions annotate with them without importing. Mirror that so
    # `def f(self, nums: List[int]) -> List[int]:` doesn't raise NameError.
    import typing as _typing
    for _name in (
        "List", "Dict", "Set", "Tuple", "Optional", "Union", "Any", "Callable",
        "Deque", "Iterable", "Sequence", "Mapping", "DefaultDict", "Counter", "FrozenSet",
    ):
        if hasattr(_typing, _name):
            glb[_name] = getattr(_typing, _name)

    try:
        code = compile(user_code, "<walkit>", "exec")
    except SyntaxError as e:
        result["error"] = {
            "type": "SyntaxError",
            "msg": str(e.msg or e),
            "line": e.lineno or 0,
        }
        return json.dumps(result)

    # run top-level statements under the tracer too, so they obey the step
    # budget (a pasted script with a stray top-level loop can't hang the tab)
    sys.settrace(_global_trace)
    try:
        exec(code, glb)
    except StepLimitExceeded:
        result["truncated"] = True
        result["steps"] = TR.steps
        return json.dumps(result)
    except BaseException as e:
        result["error"] = {
            "type": type(e).__name__,
            "msg": str(e)[:200],
            "line": _walkit_line(e),
        }
        result["steps"] = TR.steps
        return json.dumps(result)
    finally:
        sys.settrace(None)

    if mode == "ops":
        return _run_ops(p, glb, result)
    return _run_func(p, glb, result)


def _is_user_func(v):
    """A function defined in the user's pasted code (not an injected helper)."""
    c = getattr(v, "__code__", None)
    return c is not None and getattr(c, "co_filename", "") == "<walkit>"


def resolve_callable(glb, func_name):
    """Find the function to run, tolerating real-world LeetCode paste shapes:
    a plain top-level function, a camelCase function, or a method inside a
    `class Solution`. Matches by exact name, then name ignoring case/underscores,
    then falls back to the sole candidate."""
    def norm(s):
        return s.lower().replace("_", "")

    want = norm(func_name)

    f = glb.get(func_name)
    if _is_user_func(f):
        return f

    candidates = []  # (name, callable)
    for k, v in list(glb.items()):
        if _is_user_func(v):
            candidates.append((k, v))
    for k, v in list(glb.items()):
        if not isinstance(v, type) or v in (ListNode, TreeNode, Node):
            continue
        methods = [
            mn for mn, mv in vars(v).items()
            if _is_user_func(mv) and not mn.startswith("_")
        ]
        if not methods:
            continue
        try:
            inst = v()
        except BaseException:
            continue
        for mn in methods:
            candidates.append((mn, getattr(inst, mn)))

    for name, fn in candidates:
        if name == func_name:
            return fn
    for name, fn in candidates:
        if norm(name) == want:
            return fn
    if len(candidates) == 1:
        return candidates[0][1]
    return None


def _run_func(p, glb, result):
    func_name = p["func"]
    arg_kinds = p["argKinds"]
    ret_kind = p["retKind"]
    args_json = p["args"]

    target = resolve_callable(glb, func_name)
    if target is None:
        result["error"] = {
            "type": "MissingFunction",
            "msg": "Define a function named '%s' (or a Solution class with that method)." % func_name,
            "line": 0,
        }
        return json.dumps(result)

    args = [make_arg(kind, val) for kind, val in zip(arg_kinds, args_json)]

    ret = None
    had_error = False
    sys.settrace(_global_trace)
    try:
        ret = target(*args)
    except StepLimitExceeded:
        result["truncated"] = True
        had_error = True
    except BaseException as e:
        had_error = True
        result["error"] = {
            "type": type(e).__name__,
            "msg": str(e)[:200],
            "line": _walkit_line(e),
        }
    finally:
        sys.settrace(None)

    if not had_error:
        out, cycle = serialize_ret(ret_kind, ret)
        result["result"] = out
        if cycle:
            result["cycle"] = True

    result["steps"] = TR.steps
    result["truncated"] = result["truncated"] or TR.truncated
    return json.dumps(result)


def _run_ops(p, glb, result):
    """Design problems: construct a class, then replay a method sequence."""
    class_name = p["className"]
    ops = p["ops"]
    op_args = p["opArgs"]

    if class_name not in glb:
        result["error"] = {
            "type": "MissingClass",
            "msg": "Define a class named '%s'." % class_name,
            "line": 0,
        }
        return json.dumps(result)

    cls = glb[class_name]
    outputs = []
    inst = None
    had_error = False
    sys.settrace(_global_trace)
    try:
        for op, a in zip(ops, op_args):
            if op == class_name:
                inst = cls(*a)
                outputs.append(None)
            else:
                outputs.append(_safe_json(getattr(inst, op)(*a)))
    except StepLimitExceeded:
        result["truncated"] = True
        had_error = True
    except BaseException as e:
        had_error = True
        result["error"] = {
            "type": type(e).__name__,
            "msg": str(e)[:200],
            "line": _walkit_line(e),
        }
    finally:
        sys.settrace(None)

    if not had_error:
        result["result"] = outputs
    result["ops"] = ops
    result["steps"] = TR.steps
    result["truncated"] = result["truncated"] or TR.truncated
    return json.dumps(result)
