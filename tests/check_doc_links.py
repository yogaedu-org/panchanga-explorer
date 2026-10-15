#!/usr/bin/env python3
"""Check that relative links and path mentions in the root docs resolve.

Scans README.md, CLAUDE.md, CONTEXT.md, NOTES.md, CALCULATIONS.md, plus
START-HERE*.md, docs/index*, docs/README* when present. Extracts:
  - markdown links  [text](target)              (http/https/mailto/anchor-only skipped)
  - backticked paths  `js/foo.js`, `tests/`      (only tokens that look like paths)
  - bare file mentions  'See CONTEXT.md', 'foo.js' in prose
Bare-name matching skips tree-diagram lines (box-drawing chars); those are checked by hand.
Targets resolve relative to the repo root (the directory above tests/).
#anchors and ?queries are stripped before the existence check.

Re-run:
  python tests/check_doc_links.py
  python tests/check_doc_links.py --status    # also list status-line candidates (dates/counts) for manual review

Output: one JSON object {"checked", "broken", "stale_status"}. "checked" counts
reference occurrences (not unique targets). "stale_status" is always [] here;
status claims are verified by hand against `ls` / git.
"""
import glob
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]  # repo root (tests/..)

DOC_NAMES = ["README.md", "CLAUDE.md", "CONTEXT.md", "NOTES.md", "CALCULATIONS.md"]
OPTIONAL_GLOBS = ["START-HERE*.md", "docs/index*", "docs/README*"]

SKIP_TARGET = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|#|//)", re.I)  # http:, https:, mailto:, #anchor, //host
TREE_CHARS = re.compile("[├└│─]")  # box-drawing chars used by tree diagrams
MD_LINK = re.compile(r"\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)")
BACKTICK = re.compile(r"`([^`\n]+)`")
BARE = re.compile(
    r"(?<![\w/.-])((?:[\w.-]+/)*[\w.-]+\.(?:md|js|mjs|html|css|py|json|jsonl|txt|ya?ml|sh|ts|svg|csv|toml|ps1))(?![\w/-])"
)
PATHISH = re.compile(r"^(?:\.{0,2}/)?[\w.-]+(?:/[\w.@-]+)*/?$")
KNOWN_EXT = re.compile(r"\.(?:md|js|mjs|html|css|py|json|jsonl|txt|ya?ml|sh|ts|svg|csv|toml|ps1)$")
STATUS_HINT = re.compile(
    r"(last updated|updated|as of|status|\b\d+\s+(?:issues?|tests?|files?|commits?)\b|\b20\d\d-\d\d-\d\d\b)",
    re.I,
)


def is_path_token(tok):
    """Decide whether a backticked token is a file/dir path rather than code or prose."""
    if not PATHISH.match(tok):
        return bool(re.fullmatch(r"\.[A-Za-z][\w-]*", tok))  # dotfiles like .gitignore
    if tok.endswith("/"):
        return True
    if KNOWN_EXT.search(tok):
        return True
    return "/" in tok and re.search(r"[A-Za-z]", tok) is not None and not re.fullmatch(r"[\d/.]+", tok)


def resolve_status(target):
    """Strip anchor/query, percent-decode, and map to an absolute path under ROOT."""
    clean = unquote(target.split("#", 1)[0].split("?", 1)[0]).strip()
    if not clean:
        return None
    return ROOT / clean.lstrip("/")


def scan_file(path):
    """Yield (line_no, kind, target) for every reference in one doc.

    Fence toggling is not used: CONTEXT.md has an unclosed tree fence at line 81,
    so fence parity is wrong. Instead, box-drawing tree lines skip bare-name matching.
    """
    lines = path.read_text(encoding="utf-8").splitlines()
    for no, line in enumerate(lines, 1):
        work = line
        for m in MD_LINK.finditer(line):
            tgt = m.group(1)
            if not SKIP_TARGET.match(tgt):
                yield no, "markdown-link", tgt
        work = MD_LINK.sub(lambda m: " " * len(m.group(0)), work)
        for m in BACKTICK.finditer(work):
            tok = m.group(1).strip()
            if is_path_token(tok) and not SKIP_TARGET.match(tok):
                yield no, "backtick-path", tok
        work = BACKTICK.sub(lambda m: " " * len(m.group(0)), work)
        work = re.sub(r"https?://\S+", lambda m: " " * len(m.group(0)), work)
        if TREE_CHARS.search(line):
            continue
        for m in BARE.finditer(work):
            yield no, "bare-mention", m.group(1)


def status_candidates(path):
    """Lines in the first 15 that carry dates or counts; reviewed manually."""
    out = []
    for no, line in enumerate(path.read_text(encoding="utf-8").splitlines()[:15], 1):
        if STATUS_HINT.search(line):
            out.append({"file": path.name, "line": no, "text": line.strip()})
    return out


def basename_exists(name):
    """True if a file with this basename exists anywhere in the repo (ignores .git, .claude)."""
    return any(
        p.name == name and not {".git", ".claude"} & set(p.relative_to(ROOT).parts)
        for p in ROOT.rglob(name)
    )


def main():
    docs = [ROOT / n for n in DOC_NAMES if (ROOT / n).is_file()]
    for pattern in OPTIONAL_GLOBS:
        docs += [Path(p) for p in sorted(glob.glob(str(ROOT / pattern)))]
    docs = [d for d in docs if d.is_file()]

    checked = 0
    broken = []
    for doc in docs:
        for no, kind, tgt in scan_file(doc):
            checked += 1
            full = resolve_status(tgt)
            if kind == "bare-mention" and "/" not in tgt and basename_exists(tgt):
                continue  # prose mention of a file by name only, e.g. 'check DebugView.js'
            if full is None or not full.exists():
                broken.append({"file": doc.name, "line": no, "target": tgt, "kind": kind})

    if "--status" in sys.argv:
        for doc in docs:
            if doc.name in ("README.md", "CONTEXT.md", "NOTES.md"):
                for c in status_candidates(doc):
                    print(json.dumps(c, ensure_ascii=False), file=sys.stderr)

    result = {"checked": checked, "broken": broken, "stale_status": []}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
