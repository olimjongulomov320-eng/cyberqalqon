import type { RawCase, RunnerReply } from './runner';

/**
 * Controller for the Pyodide worker (public/workers/py-runner.js).
 *
 * Learner code can loop forever, so every run has a deadline; on timeout the
 * worker is terminated (the only way to stop WebAssembly) and a fresh one is
 * started for the next run. Pyodide's files come from the browser cache after
 * the first load.
 */
const WORKER_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/workers/py-runner.js`;
const LOAD_TIMEOUT_MS = 90_000;
const RUN_TIMEOUT_MS = 8_000;

type Pending = { resolve: (r: RunnerReply) => void; timer: number };

export class PyRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private seq = 0;
  private pending = new Map<number, Pending>();

  private start(): Promise<void> {
    this.stop();
    const worker = new Worker(WORKER_URL);
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('load-timeout')), LOAD_TIMEOUT_MS);
      worker.onmessage = (e: MessageEvent) => {
        const m = e.data;
        if (m?.type === 'ready') {
          window.clearTimeout(timer);
          resolve();
        } else if (m?.type === 'load-error') {
          window.clearTimeout(timer);
          reject(new Error(m.error));
        } else if (typeof m?.id === 'number') {
          const p = this.pending.get(m.id);
          if (p) {
            window.clearTimeout(p.timer);
            this.pending.delete(m.id);
            p.resolve(m as RunnerReply);
          }
        }
      };
      worker.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error('worker-error'));
      };
    });
    return this.ready;
  }

  /** Begin loading Pyodide in the background (call when the page opens). */
  warm(): Promise<void> {
    if (!this.ready) this.ready = this.start();
    return this.ready;
  }

  async run(code: string, entry: string, cases: unknown[][]): Promise<RunnerReply> {
    try {
      await this.warm();
    } catch (e) {
      this.stop();
      return { ok: false, error: e instanceof Error ? e.message : 'load failed' };
    }
    const id = ++this.seq;
    return new Promise<RunnerReply>(resolve => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        this.stop(); // kills the runaway code; next run restarts the worker
        resolve({ ok: false, error: 'timeout' });
      }, RUN_TIMEOUT_MS);
      this.pending.set(id, { resolve, timer });
      this.worker?.postMessage({ id, code, entry, cases });
    });
  }

  stop() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    Array.from(this.pending.values()).forEach(p => window.clearTimeout(p.timer));
    this.pending.clear();
  }
}

export type { RawCase };
