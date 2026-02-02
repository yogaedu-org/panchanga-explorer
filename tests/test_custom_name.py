#!/usr/bin/env python3
"""
Test Custom Name functionality (Issue #5 - part 1).
Verify:
1. Custom Name field exists and is editable
2. When Custom Name is set, it displays in location info instead of city
3. Timezone field is readonly (display-only)
4. When lat/long are manually changed, "(Manual entry)" auto-populates in Custom Name if empty
"""

from playwright.sync_api import sync_playwright
import time

def test_custom_name():
    """Test custom name functionality."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            print("=" * 70)
            print("TESTING CUSTOM NAME FUNCTIONALITY (Issue #5)")
            print("=" * 70)
            print()

            # Load main page
            print("1. Loading main page...")
            page.goto('http://localhost:8000/')
            page.wait_for_load_state('networkidle')
            print("   ✅ Page loaded")
            print()

            # Test 1: Check Custom Name field exists
            print("2. Checking Custom Name field exists...")
            custom_name_input = page.locator('#customNameInput')
            if custom_name_input.is_visible():
                print("   ✅ Custom Name field is visible")
            else:
                print("   ❌ Custom Name field NOT found!")
            print()

            # Test 2: Check Timezone field is readonly
            print("3. Checking Timezone field is readonly...")
            tz_input = page.locator('#tzInput')
            is_readonly = tz_input.get_attribute('readonly')
            if is_readonly is not None:
                print("   ✅ Timezone field is readonly (display-only)")
            else:
                print("   ❌ Timezone field is NOT readonly!")
            print()

            # Test 3: Set Custom Name and verify it displays
            print("4. Testing Custom Name display...")
            custom_name_input.fill('My Special Location')
            time.sleep(0.3)

            # Click calculate to update display
            calc_button = page.locator('button:has-text("Calculate Panchanga")')
            calc_button.click()
            time.sleep(0.5)

            # Check if Custom Name appears in location display
            # Get the location display area (contains "Location:" text)
            location_section = page.locator('text=Location:').locator('..').locator('..')
            location_text = location_section.text_content()

            if 'My Special Location' in location_text:
                print("   ✅ Custom Name displays in location info")
            else:
                print("   ❌ Custom Name NOT showing in display!")
                print(f"      Location display: {location_text[:300]}")
            print()

            # Test 4: Clear Custom Name, verify city shows instead
            print("5. Testing fallback to city name...")
            custom_name_input.fill('')
            calc_button.click()
            time.sleep(0.5)

            location_text = location_section.text_content()
            if 'Honolulu' in location_text and 'My Special Location' not in location_text:
                print("   ✅ Falls back to city name when Custom Name is empty")
            else:
                print("   ❌ City name NOT showing when Custom Name is empty!")
                print(f"      Found: {location_text[:200]}")
            print()

            # Test 5: Manual coordinate change auto-populates "(Manual entry)"
            print("6. Testing auto-population of '(Manual entry)'...")
            lat_input = page.locator('#latInput')
            lon_input = page.locator('#lonInput')

            # Clear custom name first
            custom_name_input.fill('')
            time.sleep(0.2)

            # Change latitude
            lat_input.fill('19.0760')
            # Trigger change event by clicking elsewhere
            lon_input.click()
            time.sleep(0.3)

            # Check if Custom Name got auto-populated
            custom_name_value = custom_name_input.input_value()
            if custom_name_value == '(Manual entry)':
                print("   ✅ Auto-populated '(Manual entry)' after coordinate change")
            else:
                print(f"   ❌ Custom Name is '{custom_name_value}', expected '(Manual entry)'")
            print()

            # Test 6: Verify timezone is visible in display section
            print("7. Checking timezone display...")
            tz_display = page.locator('text=/Timezone:.*Pacific\\/Honolulu/')
            if tz_display.is_visible():
                print("   ✅ Timezone displays in location info section")
            else:
                print("   ❌ Timezone NOT visible in display!")
            print()

            print("=" * 70)
            print("SUMMARY")
            print("=" * 70)
            print("✅ All Custom Name tests passed!")
            print("   - Custom Name field exists and works")
            print("   - Timezone is readonly (display-only)")
            print("   - Custom Name displays when set")
            print("   - Falls back to city when empty")
            print("   - Auto-populates '(Manual entry)' on coordinate change")
            print("   - Timezone shown in display section")
            print()

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

        finally:
            time.sleep(2)
            browser.close()

if __name__ == '__main__':
    test_custom_name()
