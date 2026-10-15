"""
Docs regression test for issue #13: docs lag the Timeline View implementation.

Failure caught: CONTEXT.md's "Timeline View" subsection (and NOTES.md) describe
only a two-bar solar/tithi comparison, while js/components/TimelineView.js is a
multi-band timeline (solar gradient, lunar band, tithi band, nakshatra band,
zoom controls, centre marker). If those features are removed from the docs, or
never documented, this test fails.

Plain pytest: reads two markdown files, no browser, no network.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Distinctive terms taken from js/components/TimelineView.js (matched case-insensitively).
REQUIRED_TERMS = [
    "multi-band",
    "zoom",
    "solar gradient",
    "lunar band",
    "tithi band",
    "nakshatra band",
    "current-time marker",
    "label thinning",
]


def _read(name):
    return (ROOT / name).read_text(encoding="utf-8")


def _timeline_section(text):
    """Return the body of the '#### Timeline View' subsection of CONTEXT.md."""
    match = re.search(r"^#### Timeline View\s*$(.*?)(?=^#{1,4} )", text, re.S | re.M)
    assert match, "CONTEXT.md has no '#### Timeline View' subsection"
    return match.group(1)


def test_context_timeline_section_names_implemented_features():
    section = _timeline_section(_read("CONTEXT.md")).lower()
    missing = [t for t in REQUIRED_TERMS if t not in section]
    assert not missing, f"CONTEXT.md Timeline View section does not mention: {missing}"


def test_context_timeline_section_lists_zoom_units():
    section = _timeline_section(_read("CONTEXT.md")).lower()
    for unit in ("year", "month", "day", "hour", "min"):
        assert unit in section, f"Timeline View section does not mention zoom unit '{unit}'"


def test_notes_has_timeline_view_section():
    notes = _read("NOTES.md")
    assert re.search(r"^## .*Timeline View", notes, re.M), \
        "NOTES.md has no '## ... Timeline View' section"
