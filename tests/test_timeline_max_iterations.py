#!/usr/bin/env python3
"""
Regression test for issue #12: TimelineView's tithi/nakshatra rendering
loops were capped at a fixed maxIterations = 500. Since tithis and
nakshatras each average ~1 day long, any zoomed-out range beyond ~500
days (~1.4 years) hit the cap and left the tithi/nakshatra bands
rendering only part of the visible range -- a gap on the right side of
the timeline instead of continuous coverage across the full range.
"""

from playwright.sync_api import sync_playwright

# Reads block positions straight from a band's own container so we don't
# collide with unrelated elements elsewhere on the page that reuse the same
# Tailwind color classes (e.g. the "Timeline" tab button is bg-purple-600 too).
GET_BAND_BLOCK_EDGES_JS = """
(label) => {
    const header = [...document.querySelectorAll('h4')].find(h => h.textContent.trim() === label);
    const container = header.closest('.mb-3').querySelector('.relative.h-8');
    return [...container.children].map(el => {
        const left = parseFloat(el.style.left);
        const width = parseFloat(el.style.width);
        return left + width;
    });
}
"""


def test_timeline_tithi_and_nakshatra_bands_cover_full_zoomed_range():
    """Tithi and Nakshatra bands must cover the whole visible range, even zoomed out past 500 days."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto('http://localhost:8000/index-split.html')
            page.wait_for_load_state('networkidle')

            page.click("button:has-text('Timeline')")
            page.wait_for_selector('text=Multi-Band Timeline')

            # Zoom out to 600 days -- beyond the old fixed maxIterations=500 cap.
            page.evaluate("window.setTimelineZoom(600)")
            page.wait_for_timeout(300)

            for label in ('Tithi', 'Nakshatra'):
                edges = page.evaluate(GET_BAND_BLOCK_EDGES_JS, label)
                assert len(edges) > 0, f"No {label} blocks rendered"

                rightmost = max(edges)
                assert rightmost > 95, (
                    f"{label} band only covers {rightmost:.1f}% of the visible range -- "
                    f"maxIterations cap truncated rendering before reaching the end"
                )

                print(f"   {label} band rightmost edge: {rightmost:.1f}%")

            print("   PASS: Tithi and Nakshatra bands cover the full zoomed-out range")

        finally:
            browser.close()


if __name__ == '__main__':
    test_timeline_tithi_and_nakshatra_bands_cover_full_zoomed_range()
