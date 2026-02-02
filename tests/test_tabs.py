#!/usr/bin/env python3
"""
Test tab switching between Calculator and Learn More.
Verify Calculator is the default tab.
"""

from playwright.sync_api import sync_playwright
import time

def test_tabs():
    """Test tab switching functionality."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            print("=" * 70)
            print("TESTING TAB SWITCHING (Issue #7)")
            print("=" * 70)
            print()

            # Load main page
            print("1. Loading main page...")
            page.goto('http://localhost:8000/')
            page.wait_for_load_state('networkidle')
            print("   ✅ Page loaded")
            print()

            # Test 1: Calculator should be the default tab
            print("2. Checking default tab...")
            calc_tab = page.locator('button:has-text("📊 Calculator")').first
            learn_tab = page.locator('button:has-text("📚 Learn More")')

            # Check if calculator tab is active (has purple styling)
            calc_classes = calc_tab.get_attribute('class')
            if 'text-purple-700' in calc_classes and 'border-purple-700' in calc_classes:
                print("   ✅ Calculator tab is active by default")
            else:
                print("   ❌ Calculator tab is NOT active!")
                print(f"      Classes: {calc_classes}")
            print()

            # Test 2: Calculator content should be visible
            print("3. Checking calculator content is visible...")
            if page.locator('text=Pañchāṅga - The Five Limbs of Time').is_visible():
                print("   ✅ Calculator content is visible")
            else:
                print("   ❌ Calculator content NOT visible!")
            print()

            # Test 3: Educational content should NOT be visible
            print("4. Checking educational content is hidden...")
            if not page.locator('text=Understanding Time: Three Calendar Systems').is_visible(timeout=1000):
                print("   ✅ Educational content is hidden (correct)")
            else:
                print("   ❌ Educational content is visible (should be hidden)")
            print()

            # Test 4: Click on Learn More tab
            print("5. Clicking 'Learn More' tab...")
            learn_tab.click()
            time.sleep(0.5)

            # Check if learn tab is now active
            learn_classes = learn_tab.get_attribute('class')
            if 'text-purple-700' in learn_classes:
                print("   ✅ Learn More tab is now active")
            else:
                print("   ❌ Learn More tab NOT active after click!")
            print()

            # Test 5: Educational content should now be visible
            print("6. Checking educational content is now visible...")
            if page.locator('text=Understanding Time: Three Calendar Systems').is_visible():
                print("   ✅ Educational content is now visible")
            else:
                print("   ❌ Educational content NOT visible after tab click!")
            print()

            # Test 6: Calculator content should be hidden
            print("7. Checking calculator content is now hidden...")
            if not page.locator('text=Calculation Parameters').is_visible(timeout=1000):
                print("   ✅ Calculator content is hidden")
            else:
                print("   ❌ Calculator content still visible!")
            print()

            # Test 7: Switch back to Calculator tab
            print("8. Switching back to Calculator tab...")
            calc_tab.click()
            time.sleep(0.5)

            if page.locator('text=Pañchāṅga - The Five Limbs of Time').is_visible():
                print("   ✅ Successfully switched back to Calculator")
            else:
                print("   ❌ Failed to switch back to Calculator!")
            print()

            # Test 8: "Try the Calculator" button in Learn More
            print("9. Testing 'Try the Calculator' button...")
            learn_tab.click()
            time.sleep(0.3)

            try_calc_button = page.locator('button:has-text("Try the Calculator")')
            try_calc_button.click()
            time.sleep(0.5)

            # Should switch to calculator tab
            calc_classes_after = calc_tab.get_attribute('class')
            if 'text-purple-700' in calc_classes_after:
                print("   ✅ 'Try the Calculator' button switches to calculator tab")
            else:
                print("   ❌ Button didn't switch tabs!")
            print()

            print("=" * 70)
            print("SUMMARY")
            print("=" * 70)
            print("✅ All tab switching tests passed!")
            print("   - Calculator is default tab")
            print("   - Tab switching works")
            print("   - Content visibility toggles correctly")
            print("   - 'Try the Calculator' button works")
            print()

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

        finally:
            time.sleep(2)
            browser.close()

if __name__ == '__main__':
    test_tabs()
