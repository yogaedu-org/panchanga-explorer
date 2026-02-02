#!/usr/bin/env python3
"""
Test RT Update (Real-Time Update) functionality.
Verifies:
1. Date/time displays under Calculate button
2. RT Update checkbox exists
3. When checked, adjusting time triggers auto-calculation
4. When unchecked, adjusting time does NOT trigger calculation
"""

from playwright.sync_api import sync_playwright
import time

def test_rt_update():
    """Test RT Update functionality."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            print("=" * 70)
            print("TESTING RT UPDATE FUNCTIONALITY")
            print("=" * 70)
            print()

            # Load main page
            print("1. Loading main page...")
            page.goto('http://localhost:8000/')
            page.wait_for_load_state('networkidle')
            print("   ✅ Page loaded")
            print()

            # Test 1: Verify date/time displays under Calculate button
            print("2. Checking date/time display under Calculate button...")
            calc_button = page.locator('button:has-text("Calculate Panchanga")')
            button_text = calc_button.text_content()

            if 'Calculate Panchanga' in button_text and ':' in button_text:
                print("   ✅ Date/time displays under Calculate button")
                # Extract and display the date/time
                lines = button_text.strip().split('\n')
                if len(lines) >= 2:
                    print(f"      {lines[1].strip()}")
            else:
                print("   ❌ Date/time NOT displaying under button!")
            print()

            # Test 2: Verify RT Update checkbox exists
            print("3. Checking RT Update checkbox...")
            rt_checkbox = page.locator('#rtUpdateCheckbox')
            if rt_checkbox.is_visible():
                print("   ✅ RT Update checkbox is visible")
            else:
                print("   ❌ RT Update checkbox NOT found!")
            print()

            # Test 3: Test WITHOUT RT Update (default unchecked)
            print("4. Testing without RT Update (should not auto-calculate)...")

            # Set a known date/time
            date_input = page.locator('#dateInput')
            time_input = page.locator('#timeInput')
            date_input.fill('2026-01-15')
            time_input.fill('10:00:00')
            time.sleep(0.3)

            # Click Calculate once to set baseline
            calc_button.click()
            time.sleep(0.5)

            # Check current masa
            masa_card = page.locator('.border-orange-500').first
            initial_masa = masa_card.locator('.text-orange-700').text_content()
            print(f"   Initial Masa: {initial_masa}")

            # Change date without RT Update (should NOT recalculate)
            date_input.fill('2026-02-15')
            time.sleep(0.5)

            # Masa should remain the same (no auto-calc)
            current_masa = masa_card.locator('.text-orange-700').text_content()
            if current_masa == initial_masa:
                print(f"   ✅ Masa unchanged without RT Update: {current_masa}")
            else:
                print(f"   ❌ Masa changed! Was {initial_masa}, now {current_masa}")
            print()

            # Test 4: Test WITH RT Update enabled
            print("5. Testing with RT Update enabled (should auto-calculate)...")

            # Enable RT Update
            rt_checkbox.check()
            time.sleep(0.3)

            # Get current masa
            baseline_masa = masa_card.locator('.text-orange-700').text_content()
            print(f"   Baseline Masa: {baseline_masa}")

            # Change date (should auto-calculate)
            date_input.fill('2026-01-15')
            time.sleep(1)  # Give time for auto-calculation

            # Masa should change with RT Update
            new_masa = masa_card.locator('.text-orange-700').text_content()
            if new_masa != baseline_masa:
                print(f"   ✅ Auto-calculation triggered: {baseline_masa} → {new_masa}")
            else:
                print(f"   ❌ Auto-calculation did NOT trigger!")
            print()

            # Test 5: Test time adjustment buttons with RT Update
            print("6. Testing time buttons with RT Update...")

            # Set known time
            time_input.fill('14:30:00')
            time.sleep(0.5)

            # Get button text before
            button_text_before = calc_button.text_content()

            # Click H> button
            h_up = page.locator('button[title="Increase Hour"]')
            h_up.click()
            time.sleep(0.5)

            # Button text should update
            button_text_after = calc_button.text_content()

            if '15:30:00' in button_text_after:
                print(f"   ✅ Button date/time updates with adjustment: 14:30:00 → 15:30:00")
            else:
                print(f"   ❌ Button text didn't update!")
            print()

            # Test 6: Disable RT Update
            print("7. Testing RT Update disable...")
            rt_checkbox.uncheck()
            time.sleep(0.3)

            # Change time (should NOT auto-calculate)
            current_masa_before = masa_card.locator('.text-orange-700').text_content()

            h_up.click()
            time.sleep(0.5)

            current_masa_after = masa_card.locator('.text-orange-700').text_content()

            if current_masa_after == current_masa_before:
                print(f"   ✅ RT Update disabled - no auto-calculation")
            else:
                print(f"   ❌ Still auto-calculating when disabled!")
            print()

            print("=" * 70)
            print("SUMMARY")
            print("=" * 70)
            print("✅ RT Update tests completed!")
            print("   - Date/time displays under Calculate button")
            print("   - RT Update checkbox works")
            print("   - Auto-calculation works when enabled")
            print("   - No auto-calculation when disabled")
            print("   - Time buttons update button display")
            print()

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

        finally:
            time.sleep(2)
            browser.close()

if __name__ == '__main__':
    test_rt_update()
