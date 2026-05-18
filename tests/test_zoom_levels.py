#!/usr/bin/env python3
"""
Test Timeline View zoom levels to observe UI behavior at different scales.

This test incrementally increases zoom:
1. Days: 1 -> 30 (click + 30 times with Day selected)
2. Months: continue + 10 times with Month selected
3. Years: continue + 10 times with Year selected

For each step, captures screenshot and reports observations about:
- Solar band gradient
- Lunar band gradient
- Tithi band blocks (count, visibility)
- Nakshatra band blocks (count, visibility)

Install: pip install playwright && playwright install chromium
Run: python tests/test_zoom_levels.py
"""

from playwright.sync_api import sync_playwright
import time
import os
from datetime import datetime

# Create output directory for screenshots
SCREENSHOT_DIR = 'tests/zoom_screenshots'
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def count_visible_blocks(page, selector):
    """Count visible blocks in a band."""
    blocks = page.locator(selector)
    return blocks.count()

def get_zoom_value(page):
    """Get current zoom value from input field."""
    zoom_input = page.locator('input[type="number"]').first
    return float(zoom_input.input_value())

def get_date_range(page):
    """Get the displayed date range."""
    date_range = page.locator('.text-gray-600.whitespace-nowrap').last
    return date_range.text_content().strip()

def analyze_timeline(page, step_name, zoom_value):
    """Analyze timeline state and return observations."""
    observations = {
        'step': step_name,
        'zoom_value': zoom_value,
        'date_range': get_date_range(page),
        'tithi_blocks': 0,
        'nakshatra_blocks': 0,
        'issues': []
    }

    # Count tithi blocks (purple divs in tithi band)
    tithi_blocks = page.locator('.bg-purple-600, .bg-purple-400')
    observations['tithi_blocks'] = tithi_blocks.count()

    # Count nakshatra blocks (blue divs in nakshatra band)
    nakshatra_blocks = page.locator('.bg-blue-600, .bg-blue-400')
    observations['nakshatra_blocks'] = nakshatra_blocks.count()

    # Check for potential issues
    if observations['tithi_blocks'] == 0:
        observations['issues'].append('NO TITHI BLOCKS VISIBLE')
    elif observations['tithi_blocks'] < 3 and zoom_value > 30:
        observations['issues'].append(f'Too few tithi blocks ({observations["tithi_blocks"]}) for {zoom_value} days')

    if observations['nakshatra_blocks'] == 0:
        observations['issues'].append('NO NAKSHATRA BLOCKS VISIBLE')
    elif observations['nakshatra_blocks'] < 3 and zoom_value > 30:
        observations['issues'].append(f'Too few nakshatra blocks ({observations["nakshatra_blocks"]}) for {zoom_value} days')

    # Expected counts (rough estimates)
    # Tithi duration ~1 day, Nakshatra duration ~1 day
    expected_tithis = max(1, int(zoom_value))
    expected_nakshatras = max(1, int(zoom_value))

    tithi_ratio = observations['tithi_blocks'] / expected_tithis if expected_tithis > 0 else 0
    nakshatra_ratio = observations['nakshatra_blocks'] / expected_nakshatras if expected_nakshatras > 0 else 0

    if tithi_ratio < 0.5 and zoom_value > 5:
        observations['issues'].append(f'Tithi blocks ({observations["tithi_blocks"]}) < 50% of expected ({expected_tithis})')

    if nakshatra_ratio < 0.5 and zoom_value > 5:
        observations['issues'].append(f'Nakshatra blocks ({observations["nakshatra_blocks"]}) < 50% of expected ({expected_nakshatras})')

    return observations

def test_zoom_levels():
    """Test zoom levels and document observations."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Show browser
        page = browser.new_page(viewport={'width': 1400, 'height': 900})

        all_observations = []

        try:
            print("=" * 80)
            print("TIMELINE VIEW ZOOM LEVEL TEST")
            print("=" * 80)
            print()

            # Load split page
            print("Loading index-split.html...")
            page.goto('http://localhost:3000/index-split.html')
            page.wait_for_load_state('networkidle')
            time.sleep(1)

            # Click Timeline tab
            print("Switching to Timeline tab...")
            timeline_tab = page.locator('button:has-text("Timeline")')
            timeline_tab.click()
            time.sleep(0.5)

            # Get initial state
            initial_zoom = get_zoom_value(page)
            print(f"Initial zoom value: {initial_zoom}")
            print()

            # ===== PHASE 1: Days (1 -> 30) =====
            print("-" * 80)
            print("PHASE 1: Incrementing by DAYS (1 -> 30)")
            print("-" * 80)

            # Ensure Day is selected
            day_radio = page.locator('input[value="day"]')
            day_radio.click()
            time.sleep(0.3)

            plus_button = page.locator('button:has-text("+")').first

            for i in range(30):
                zoom_value = get_zoom_value(page)
                step_name = f"Day_{i+1}"

                # Analyze before clicking
                obs = analyze_timeline(page, step_name, zoom_value)
                all_observations.append(obs)

                # Report
                issues_str = ' | '.join(obs['issues']) if obs['issues'] else 'OK'
                print(f"  {step_name}: zoom={zoom_value:.2f} | tithis={obs['tithi_blocks']} | nakshatras={obs['nakshatra_blocks']} | {issues_str}")

                # Screenshot every 5 steps
                if i % 5 == 0:
                    screenshot_path = f"{SCREENSHOT_DIR}/day_{i+1:02d}_zoom_{zoom_value:.0f}.png"
                    page.screenshot(path=screenshot_path)

                # Click + to increment
                plus_button.click()
                time.sleep(0.2)

            print()

            # ===== PHASE 2: Months (+10) =====
            print("-" * 80)
            print("PHASE 2: Incrementing by MONTHS (+10)")
            print("-" * 80)

            # Select Month
            month_radio = page.locator('input[value="month"]')
            month_radio.click()
            time.sleep(0.3)

            for i in range(10):
                zoom_value = get_zoom_value(page)
                step_name = f"Month_{i+1}"

                obs = analyze_timeline(page, step_name, zoom_value)
                all_observations.append(obs)

                issues_str = ' | '.join(obs['issues']) if obs['issues'] else 'OK'
                print(f"  {step_name}: zoom={zoom_value:.2f} | tithis={obs['tithi_blocks']} | nakshatras={obs['nakshatra_blocks']} | {issues_str}")

                screenshot_path = f"{SCREENSHOT_DIR}/month_{i+1:02d}_zoom_{zoom_value:.0f}.png"
                page.screenshot(path=screenshot_path)

                plus_button.click()
                time.sleep(0.3)

            print()

            # ===== PHASE 3: Years (+10) =====
            print("-" * 80)
            print("PHASE 3: Incrementing by YEARS (+10)")
            print("-" * 80)

            # Select Year
            year_radio = page.locator('input[value="year"]')
            year_radio.click()
            time.sleep(0.3)

            for i in range(10):
                zoom_value = get_zoom_value(page)
                step_name = f"Year_{i+1}"

                obs = analyze_timeline(page, step_name, zoom_value)
                all_observations.append(obs)

                issues_str = ' | '.join(obs['issues']) if obs['issues'] else 'OK'
                print(f"  {step_name}: zoom={zoom_value:.2f} | tithis={obs['tithi_blocks']} | nakshatras={obs['nakshatra_blocks']} | {issues_str}")

                screenshot_path = f"{SCREENSHOT_DIR}/year_{i+1:02d}_zoom_{zoom_value:.0f}.png"
                page.screenshot(path=screenshot_path)

                plus_button.click()
                time.sleep(0.5)  # Longer wait for larger calculations

            print()

            # ===== SUMMARY =====
            print("=" * 80)
            print("SUMMARY")
            print("=" * 80)

            # Find all steps with issues
            problematic_steps = [obs for obs in all_observations if obs['issues']]

            if problematic_steps:
                print(f"\n⚠️  {len(problematic_steps)} steps had issues:\n")
                for obs in problematic_steps:
                    print(f"  {obs['step']} (zoom={obs['zoom_value']:.2f}):")
                    for issue in obs['issues']:
                        print(f"    - {issue}")
            else:
                print("\n✅ All steps passed without issues!")

            print(f"\nScreenshots saved to: {SCREENSHOT_DIR}/")
            print()

            # Save detailed report
            report_path = f"{SCREENSHOT_DIR}/zoom_test_report.txt"
            with open(report_path, 'w') as f:
                f.write(f"Zoom Level Test Report\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
                f.write("=" * 80 + "\n\n")

                for obs in all_observations:
                    f.write(f"{obs['step']}:\n")
                    f.write(f"  Zoom: {obs['zoom_value']:.2f} days\n")
                    f.write(f"  Date Range: {obs['date_range']}\n")
                    f.write(f"  Tithi Blocks: {obs['tithi_blocks']}\n")
                    f.write(f"  Nakshatra Blocks: {obs['nakshatra_blocks']}\n")
                    if obs['issues']:
                        f.write(f"  Issues:\n")
                        for issue in obs['issues']:
                            f.write(f"    - {issue}\n")
                    f.write("\n")

            print(f"Detailed report saved to: {report_path}")

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

            # Save error screenshot
            page.screenshot(path=f"{SCREENSHOT_DIR}/error_screenshot.png")

        finally:
            print("\nKeeping browser open for 5 seconds...")
            time.sleep(5)
            browser.close()

if __name__ == '__main__':
    test_zoom_levels()
