# PENDING-TASK

Status: **no active task** — last unit committed and clean.

## Last completed unit
- Issue: [#12](https://github.com/yogaedu-org/panchanga-explorer/issues/12) — Increase or remove maxIterations limit for tithi/nakshatra rendering
- Branch: `swarm/20260907-12` (local only, not pushed; branched from `main`, does NOT include the `swarm/20260907-2` / #2 commits)
- Commit: `cd88c59`
- Test: `tests/test_timeline_max_iterations.py` — verified fails on pre-fix code (62% coverage), passes post-fix (100% coverage, both tithi and nakshatra bands)

## Resume line
If picking this repo back up cold: two local unmerged branches exist — `swarm/20260907-2` (#2 debug-view UTC fix) and `swarm/20260907-12` (#12 maxIterations fix), both off `main`, neither pushed. KA needs to merge both (they don't conflict — different files). Next candidate unit: issue #10 (adaptive solar gradient sampling) — same TimelineView.js file, related perf theme (this fix confirmed per-iteration ephemeris calls are the real cost driver, ~3ms/iteration).
