# PENDING-TASK

Status: **no active task** — last unit committed and clean (wave 2026-10-12).

## Start here / resume line
Three local, unpushed, unmerged branches, all off `main` (merge order: any; PM files may conflict add/add — keep both):
- `swarm/20260907-2` — #2 debug-view local time fix
- `swarm/20260907-12` — #12 maxIterations scaling fix (+ test_timeline_max_iterations.py)
- `swarm/20261012-wave` — #13 Timeline docs (206f084), docs refresh (cc87b2e), tests/check_doc_links.py

After merging, #2, #12 and #13 are closable (see wave report). Next candidate unit: #10 (adaptive solar gradient sampling in TimelineView.js).
Re-run the doc link check any time: `python tests/check_doc_links.py` (expect 0 broken).
