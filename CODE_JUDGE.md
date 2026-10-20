# Safe code-judge design (not implemented)

**Status: design only.** CyberQalqon does **not** execute submitted code today,
and this document does not add an execution path. No endpoint in this repository
runs user-supplied code. The purpose of this file is to define what a safe judge
would require *before* anyone implements one.

Relevant background: HackerRank, KEP.uz and RoboContest all judge code, but only
behind authenticated surfaces that were not inspected. Their existence is not
evidence that a judge is safe to bolt onto an Express process.

---

## 1. Why the application server must never run submissions

The current backend is a single Express process on a free PaaS instance with a
Postgres connection. Running `python`, `node`, `g++` or `bash` there would give
every submitter:

- the process environment (including `DATABASE_URL` and `JWT_SECRET`),
- the database socket and the API's own credentials,
- outbound network access from the host,
- the ability to fork-bomb, fill disk, or hold CPU indefinitely,
- a path to read other users' data through the app's own DB role.

A `child_process` with a timeout, a `try/catch`, or a regex-based "sandbox" is
**not** a sandbox. None of those are acceptable.

---

## 2. Target architecture

```
client ──POST /v1/judge/submissions──▶ API (auth, rate limit, validate)
                                          │
                                          │ insert row: queued
                                          ▼
                                     Postgres (submissions)
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                       judge worker            judge worker
                    (separate process)       (separate process)
                              │
                              ▼
                 disposable sandbox per submission
                 (container / microVM, no network, read-only rootfs)
                              │
                              ▼
                    stdout/stderr + exit code + timings
                              │
                              ▼
                 comparator vs. test cases (per problem)
                              │
                              ▼
                 verdict: accepted | wrong_answer | tle | mle |
                          runtime_error | compile_error | internal_error
```

### Components

1. **API (untrusted-input boundary)**
   - Authenticate, rate-limit per user and per IP.
   - Enforce a hard source-size cap (e.g. 64 KiB) and an allow-list of languages.
   - Persist a submission row and return `202 Accepted` with an id. Never wait
     for execution in the request handler.
   - Never trust the client's claimed problem id, language or limits; resolve
     them server-side.

2. **Queue**
   - Postgres `SELECT … FOR UPDATE SKIP LOCKED` is sufficient at this scale and
     avoids a new dependency.
   - A submission lease/heartbeat prevents two workers from running the same id.
   - Bounded concurrency (e.g. 2 workers), separate from the web process.

3. **Sandbox (the security boundary)**
   - One disposable environment per submission; destroyed after the run.
   - **No network** (network namespace with no interfaces, or an egress-deny
     policy).
   - **Read-only root filesystem** plus a small writable `tmpfs`.
   - Non-root UID, no Linux capabilities (`--cap-drop=ALL`), `no-new-privileges`.
   - seccomp profile denying `fork` beyond a small process budget, `ptrace`,
     `mount`, `unshare`, raw sockets and module loading.
   - Hard limits enforced **outside** the process: wall clock, CPU time, memory
     (cgroup), output size (e.g. 64 KiB), open files, process count.
   - Kill the whole cgroup, not just the parent PID, on timeout.
   - Consider a microVM (Firecracker) or gVisor if the threat model warrants it;
     a plain container shares the host kernel and is a weaker boundary.

4. **Test data**
   - Test cases live server-side, never in the problem payload sent to clients.
   - Compare output with an explicit policy per problem: exact match, or
     token/whitespace-insensitive match. Floating-point problems need a stated
     tolerance, not a hidden one.
   - Run sample tests first, then hidden tests; stop at the first failure for
     speed, but report which test failed (without leaking hidden input).

5. **Verdicts and feedback**
   - Report a verdict plus the failing test *index* and, for sample tests only,
     the expected/actual output.
   - Never surface a stack trace, absolute path, environment variable, or host
     name.
   - Compilation errors are safe to show verbatim (they describe the user's own
     code).

6. **Operational safeguards**
   - Judge workers run in a separate deployment/host from the API and database.
   - The DB role used by the worker can only read problem test data and write
     submission results.
   - Kill switch: an env flag that stops workers from claiming jobs.
   - Metrics: queue depth, p95 runtime, timeout rate, sandbox failures.

---

## 3. What must be true before shipping

- [ ] A dedicated sandbox host or managed judge service (self-hosted, free tier
      compatible) — **not** the API process.
- [ ] A security review of the sandbox profile by someone other than the author.
- [ ] Verified escape tests: network blocked, filesystem read-only, fork bomb
      contained, memory bomb OOM-killed, infinite loop TLE-killed.
- [ ] Per-language toolchains pinned and patched.
- [ ] Test-case storage with access control; no hidden tests in client payloads.
- [ ] Abuse controls: per-user quota, per-IP quota, global queue cap.
- [ ] A documented incident path for a suspected escape.

Until all of the above exist, CyberQalqon should keep grading **answers**, not
code. The Problem Arena added in this change set is an answer-grading surface:
it reuses the existing six exercise types and the existing server-side grader.
It does not accept source code and does not claim to judge it.

---

## 4. Free/self-hostable options (for a future pass)

- **Judge0 (self-hosted)** — mature API, but still requires a hardened host and
  is resource-hungry; the free hosted tier has limits and should not be used for
  privacy-sensitive submissions.
- **isolate** (IOI/Codeforces-style sandbox) — small, Linux-only, requires root
  to set up cgroups/namespaces; good fit for a dedicated judge box.
- **Firecracker / gVisor** — stronger isolation, higher operational cost.

All three still require the controls in §2–§3. None of them makes it acceptable
to run submissions inside the Express app.
