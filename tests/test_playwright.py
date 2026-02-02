#!/usr/bin/env python3
"""
Test panchanga calculations using Playwright.
Install: pip install playwright && playwright install chromium
"""

from playwright.sync_api import sync_playwright
import json

def fetch_panchanga_data(url='http://localhost:8000/api.html'):
    """Fetch panchanga data using Playwright."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(url)
            page.wait_for_selector('pre')

            # Get JSON content
            json_content = page.locator('pre').text_content()

            # Parse JSON
            data = json.loads(json_content)

            return data

        finally:
            browser.close()

def display_results(data):
    """Display the panchanga calculation results."""

    print("=" * 70)
    print("PANCHANGA CALCULATION RESULTS")
    print("=" * 70)
    print()
    print(f"Timestamp: {data['timestamp']}")
    print()

    print("MASA (Lunar Month):")
    print(f"  Name: {data['masa']['name']}")
    print(f"  Method: {data['masa'].get('calculationMethod', 'N/A')}")

    if data['masa'].get('fullMoonDate'):
        print(f"  Full Moon: {data['masa']['fullMoonDate']}")
        print(f"  FM Nakshatra: {data['masa']['fullMoonNakshatra']} (#{data['masa']['fullMoonNakshatraNumber']})")
        print(f"  Prev New Moon: {data['masa']['prevNewMoon']}")
        print(f"  Next New Moon: {data['masa']['nextNewMoon']}")

    if data['masa'].get('error'):
        print(f"  ⚠️  ERROR: {data['masa']['error']}")

    if data['masa'].get('sunRashi') is not None:
        print(f"  Sun's Rashi: {data['masa']['sunRashi'] + 1}")

    print()
    print("TITHI:")
    print(f"  {data['tithi']['name']} ({data['tithi']['number']}/30)")
    print(f"  Paksha: {data['tithi']['paksha']}")
    print(f"  Progress: {data['tithi']['percentComplete']}%")

    print()
    print("NAKSHATRA:")
    print(f"  {data['nakshatra']['name']} ({data['nakshatra']['number']}/27)")
    print(f"  Progress: {data['nakshatra']['percentComplete']}%")

    print()
    print("=" * 70)

    # Verification
    print()
    print("VERIFICATION:")
    expected_masa = 'Māgha'
    expected_fm_nakshatra_num = 10

    if data['masa']['name'] == expected_masa:
        print(f"  ✅ Masa is CORRECT: {expected_masa}")
    elif data['masa']['name'] == 'Unknown':
        print(f"  ❌ Masa is UNKNOWN - mapping missing!")
        if data['masa'].get('fullMoonNakshatraNumber'):
            print(f"     Full moon nakshatra #{data['masa']['fullMoonNakshatraNumber']} needs to be mapped")
    else:
        print(f"  ❌ Masa is WRONG: got '{data['masa']['name']}', expected '{expected_masa}'")

    print()

def main():
    """Main function."""
    try:
        print("Fetching panchanga data from http://localhost:8000/api.html...")
        print()

        data = fetch_panchanga_data()
        display_results(data)

        # Save full data
        output_file = 'tests/panchanga_output.json'
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Full data saved to: {output_file}")

    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print()
        print("Make sure:")
        print("  1. Playwright is installed: pip install playwright")
        print("  2. Browser installed: playwright install chromium")
        print("  3. Server is running on http://localhost:8000")

if __name__ == '__main__':
    main()
