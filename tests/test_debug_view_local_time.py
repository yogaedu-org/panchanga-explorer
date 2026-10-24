#!/usr/bin/env python3
"""
Regression test for issue #2: Debug view showed the raw UTC timestamp
(date.toISOString()) instead of the selected location's local time,
causing confusion when comparing against the main "Date/Time" field.
"""

import re

from playwright.sync_api import sync_playwright


def test_debug_view_shows_local_time():
    """Debug view's Time field must match the location-local convention, not raw UTC."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto('http://localhost:8000/index-split.html')
            page.wait_for_load_state('networkidle')

            page.click("button:has-text('🐛 Debug Data')")
            page.wait_for_selector("text=Timestamp & Ayanamsa")

            time_text = page.locator("text=Time:").locator('..').text_content()

            # The old bug: a raw ISO-8601 UTC string like "2026-09-07T13:19:00.000Z"
            iso_utc_pattern = re.compile(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z')
            assert not iso_utc_pattern.search(time_text), (
                f"Debug view is showing raw UTC ISO timestamp, not local time: {time_text!r}"
            )
            # Default location is Honolulu (Pacific/Honolulu) -- the formatted
            # string should name the timezone, matching the main view's convention.
            assert 'Pacific/Honolulu' in time_text, (
                f"Expected the location's timezone in the Debug view timestamp, got: {time_text!r}"
            )

            print(f"   Debug view Time field: {time_text.strip()}")
            print("   PASS: Debug view shows location-local time, not raw UTC")

        finally:
            browser.close()


if __name__ == '__main__':
    test_debug_view_shows_local_time()
