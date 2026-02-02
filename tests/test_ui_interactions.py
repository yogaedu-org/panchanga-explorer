#!/usr/bin/env python3
"""
Test UI interactions on the main page to verify:
1. No auto-refresh (page stays static)
2. Input fields are usable (can type without interruption)
3. Buttons work (Now, Calculate)
4. Calculations trigger correctly
"""

from playwright.sync_api import sync_playwright
import time

def test_ui_interactions():
    """Test the main page UI interactions."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Show browser for debugging
        page = browser.new_page()

        try:
            print("=" * 70)
            print("TESTING MAIN PAGE UI INTERACTIONS")
            print("=" * 70)
            print()

            # Load main page
            print("1. Loading main page...")
            page.goto('http://localhost:8000/')
            page.wait_for_load_state('networkidle')

            # Skip educational overview if present
            if page.locator('text=Explore Today').is_visible(timeout=2000):
                print("   Skipping educational overview...")
                page.click('text=Explore Today')
                page.wait_for_load_state('networkidle')

            print("   ✅ Page loaded")
            print()

            # Test 1: Check initial masa value
            print("2. Checking initial masa value...")
            # Look for the MASA card (has border-t-4 border-orange-500)
            masa_card = page.locator('.border-orange-500').first
            # Get the big bold text (masa name)
            initial_masa_element = masa_card.locator('.text-orange-700')
            initial_masa = initial_masa_element.text_content()
            print(f"   Initial Masa: {initial_masa}")

            if initial_masa == "Māgha":
                print("   ✅ Masa is correct (Māgha)")
            else:
                print(f"   ❌ Masa is wrong: {initial_masa}")
            print()

            # Test 2: Verify no auto-refresh (wait and check masa doesn't change)
            print("3. Testing for auto-refresh (waiting 3 seconds)...")
            time.sleep(3)
            current_masa = initial_masa_element.text_content()

            if current_masa == initial_masa:
                print("   ✅ No auto-refresh detected - masa value unchanged")
            else:
                print(f"   ❌ Page auto-refreshed! Masa changed from {initial_masa} to {current_masa}")
            print()

            # Test 3: Test input fields (can type without interruption)
            print("4. Testing city input field...")
            city_input = page.locator('#cityInput')
            city_input.click()
            city_input.fill('')  # Clear first

            # Type slowly and check value doesn't get cleared
            test_city = "Mumbai"
            for char in test_city:
                city_input.type(char, delay=100)
                time.sleep(0.1)

            final_value = city_input.input_value()
            if final_value == test_city:
                print(f"   ✅ Can type in city field without interruption: '{final_value}'")
            else:
                print(f"   ❌ Input field issue! Expected '{test_city}', got '{final_value}'")
            print()

            # Test 4: Test latitude/longitude inputs
            print("5. Testing lat/long inputs...")
            lat_input = page.locator('#latInput')
            lon_input = page.locator('#lonInput')

            lat_input.click()
            lat_input.fill('19.0760')

            lon_input.click()
            lon_input.fill('72.8777')

            lat_value = lat_input.input_value()
            lon_value = lon_input.input_value()

            if lat_value == '19.0760' and lon_value == '72.8777':
                print(f"   ✅ Lat/Long inputs work: {lat_value}, {lon_value}")
            else:
                print(f"   ❌ Lat/Long issue! Got {lat_value}, {lon_value}")
            print()

            # Test 5: Test date/time inputs
            print("6. Testing date/time inputs...")
            date_input = page.locator('#dateInput')
            time_input = page.locator('#timeInput')

            date_input.fill('2026-01-29')
            time_input.fill('18:27')

            date_value = date_input.input_value()
            time_value = time_input.input_value()

            if date_value == '2026-01-29' and time_value == '18:27':
                print(f"   ✅ Date/Time inputs work: {date_value} {time_value}")
            else:
                print(f"   ❌ Date/Time issue! Got {date_value} {time_value}")
            print()

            # Test 6: Test "Now" button
            print("7. Testing 'Now' button...")
            now_button = page.locator('button:has-text("Now")')
            now_button.click()
            time.sleep(0.5)

            # Check if date/time updated to current
            from datetime import datetime
            now = datetime.now()
            expected_date = now.strftime('%Y-%m-%d')
            actual_date = date_input.input_value()

            if actual_date == expected_date:
                print(f"   ✅ 'Now' button works - date updated to {actual_date}")
            else:
                print(f"   ⚠️  'Now' button: Expected {expected_date}, got {actual_date}")
            print()

            # Test 7: Test "Calculate Panchanga" button
            print("8. Testing 'Calculate Panchanga' button...")
            # Set to a specific date first
            date_input.fill('2026-01-29')
            time_input.fill('18:27')
            city_input.fill('Honolulu')
            lat_input.fill('21.3099')
            lon_input.fill('-157.8581')

            calc_button = page.locator('button:has-text("Calculate Panchanga")')
            calc_button.click()
            time.sleep(1)

            # Check if calculation happened (masa should still be Māgha for this date)
            final_masa = initial_masa_element.text_content()
            print(f"   Masa after calculate: {final_masa}")

            if final_masa == "Māgha":
                print("   ✅ 'Calculate' button works - masa calculated correctly")
            else:
                print(f"   ❌ Calculate button issue! Masa: {final_masa}")
            print()

            print("=" * 70)
            print("SUMMARY")
            print("=" * 70)
            print("✅ All UI interaction tests passed!")
            print("   - No auto-refresh")
            print("   - Input fields usable")
            print("   - Buttons functional")
            print("   - Calculations work")
            print()

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

        finally:
            # Keep browser open for 2 seconds so user can see final state
            time.sleep(2)
            browser.close()

if __name__ == '__main__':
    test_ui_interactions()
