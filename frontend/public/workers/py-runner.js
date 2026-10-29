/* Python runner — runs learner code in a Web Worker with Pyodide (CPython in
 * WebAssembly). Nothing here touches the application server: the code executes
 * in the learner's own browser, isolated from the page's DOM and cookies.
 *
 * Protocol (main thread -> worker): { id, code, entry, cases: [[args...], ...] }
 * Protocol (worker -> main thread):
 *   { type: 'ready' }                                   Pyodide is loaded
 *   { id, ok: true, compile_error?, results: [...], stdout }
 *   { id, ok: false, error }                            runner failure
 * `results[i]` is { ok: true, value } or { ok: false, error } for case i.
 */
const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v' + PYODIDE_VERSION + '/full/';

let pyodide = null;

const HARNESS = `
import json, traceback
ns = {}
try:
    exec(compile(__code, "<solution>", "exec"), ns)
except BaseException:
    out = json.dumps({"compile_error": traceback.format_exc(limit=0).strip().splitlines()[-1], "results": []})
else:
    fn = ns.get(__entry)
    if not callable(fn):
        out = json.dumps({"compile_error": "Define a function named " + __entry + "()", "results": []})
    else:
        results = []
        for args in json.loads(__cases):
            try:
                value = fn(*args)
                results.append({"ok": True, "value": json.loads(json.dumps(value))})
            except BaseException as e:
                results.append({"ok": False, "error": type(e).__name__ + ": " + str(e)})
        out = json.dumps({"results": results})
out
`;

async function load() {
  if (pyodide) return pyodide;
  importScripts(PYODIDE_URL + 'pyodide.js');
  pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  return pyodide;
}

self.onmessage = async (event) => {
  const { id, code, entry, cases } = event.data;
  try {
    const py = await load();
    const lines = [];
    py.setStdout({ batched: (s) => lines.push(s) });
    py.setStderr({ batched: (s) => lines.push(s) });
    py.globals.set('__code', code);
    py.globals.set('__entry', entry);
    py.globals.set('__cases', JSON.stringify(cases));
    const raw = py.runPython(HARNESS);
    const parsed = JSON.parse(raw);
    self.postMessage({ id, ok: true, compile_error: parsed.compile_error, results: parsed.results, stdout: lines.join('\n') });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};

// Warm up as soon as the worker starts so the first Run is fast.
load().then(() => self.postMessage({ type: 'ready' })).catch((err) =>
  self.postMessage({ type: 'load-error', error: String((err && err.message) || err) })
);
