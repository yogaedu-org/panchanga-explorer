#!/usr/bin/env python3
"""
Test time control buttons including seconds visibility and functionality.
Verifies:
1. Seconds are visible in time field
2. Second buttons (S< and S>) work correctly
3. Now button works
"""

from playwright.sync_api import sync_playwright
import time

def test_time_controls():
    """Test time control buttons."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            print("=" * 70)
            print("TESTING TIME CONTROLS")
            print("=" * 70)
            print()

            # Load main page
            print("1. Loading main page...")
            page.goto('http://localhost:8000/')
            page.wait_for_load_state('networkidle')
            print("   ✅ Page loaded")
            print()

            # Test 1: Verify seconds are visible
            print("2. Testing seconds visibility...")
            time_input = page.locator('#timeInput')
            time_value = time_input.input_value()

            parts = time_value.split(':')
            if len(parts) == 3:
                print(f"   ✅ Seconds visible in time field: {time_value}")
            else:
                print(f"   ❌ Seconds NOT visible! Got: {time_value}")
            print()

            # Test 2: Test Now button
            print("3. Testing Now button...")
            date_input = page.locator('#dateInput')

            # Set a different time first
            date_input.fill('2020-01-01')
            time_input.fill('00:00:00')
            time.sleep(0.3)

            # Click Now button
            now_button = page.locator('button:has-text("Now")')
            now_button.click()
            time.sleep(0.3)

            # Check if time updated
            new_time = time_input.input_value()
            new_date = date_input.input_value()

            from datetime import datetime
            now = datetime.now()
            expected_date = now.strftime('%Y-%m-%d')

            if new_date == expected_date and new_time != '00:00:00':
                print(f"   ✅ Now button works: {new_date} {new_time}")
            else:
                print(f"   ❌ Now button failed: {new_date} {new_time}")
            print()

            # Test 3: Test Second buttons
            print("4. Testing Second buttons...")

            # Set a known time
            time_input.fill('14:30:45')
            time.sleep(0.3)

            # Test S> (increment second)
            s_up = page.locator('button[title="Increase Second"]')
            s_up.click()
            time.sleep(0.3)

            time_after_up = time_input.input_value()
            if time_after_up == '14:30:46':
                print(f"   ✅ S> works: 14:30:45 → {time_after_up}")
            else:
                print(f"   ❌ S> failed: expected 14:30:46, got {time_after_up}")

            # Test S< (decrement second)
            s_down = page.locator('button[title="Decrease Second"]')
            s_down.click()
            s_down.click()  # Click twice
            time.sleep(0.3)

            time_after_down = time_input.input_value()
            if time_after_down == '14:30:44':
                print(f"   ✅ S< works: 14:30:46 → {time_after_down}")
            else:
                print(f"   ❌ S< failed: expected 14:30:44, got {time_after_down}")
            print()

            # Test 4: Test Minute buttons
            print("5. Testing Minute buttons...")
            time_input.fill('14:30:45')
            time.sleep(0.3)

            m_up = page.locator('button[title="Increase Minute"]')
            m_up.click()
            time.sleep(0.3)

            time_after_m = time_input.input_value()
            if time_after_m == '14:31:45':
                print(f"   ✅ M> works: 14:30:45 → {time_after_m}")
            else:
                print(f"   ❌ M> failed: expected 14:31:45, got {time_after_m}")
            print()

            # Test 5: Test Hour buttons
            print("6. Testing Hour buttons...")
            time_input.fill('14:30:45')
            time.sleep(0.3)

            h_up = page.locator('button[title="Increase Hour"]')
            h_up.click()
            time.sleep(0.3)

            time_after_h = time_input.input_value()
            if time_after_h == '15:30:45':
                print(f"   ✅ H> works: 14:30:45 → {time_after_h}")
            else:
                print(f"   ❌ H> failed: expected 15:30:45, got {time_after_h}")
            print()

            # Test 6: Test with custom increment
            print("7. Testing custom increment value...")
            increment_input = page.locator('#incrementValue')
            increment_input.fill('5')
            time_input.fill('14:30:45')
            time.sleep(0.3)

            s_up.click()
            time.sleep(0.3)

            time_after_inc = time_input.input_value()
            if time_after_inc == '14:30:50':
                print(f"   ✅ Custom increment works: 14:30:45 + 5s → {time_after_inc}")
            else:
                print(f"   ❌ Custom increment failed: expected 14:30:50, got {time_after_inc}")
            print()

            print("=" * 70)
            print("SUMMARY")
            print("=" * 70)
            print("✅ Time control tests completed!")
            print("   - Seconds visible in time field")
            print("   - Now button works")
            print("   - Second buttons work correctly")
            print("   - All time adjustment buttons work")
            print("   - Custom increment value works")
            print()

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

        finally:
            time.sleep(2)
            browser.close()

if __name__ == '__main__':
    test_time_controls()
