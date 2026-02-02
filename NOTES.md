# Panchanga Explorer - Verification Notes

This file tracks verification research against established panchanga sources.

## 2026-01-31 - Masa Calculation Verification

### Issue
User reports seeing "Pauṣa" masa on January 30, 2026, but test case in CONTEXT.md expects "Māgha" for January 29, 2026.

### Current Calculation
- Date: January 30, 2026, ~8:28 PM HST
- App shows: Pauṣa masa
- Expected (per CONTEXT.md): Māgha masa

### Research Needed
Verify against authoritative sources (DrikPanchang.com, Prokerala.com, AstroSage.com) what the correct masa should be for:
- January 29, 2026
- January 30, 2026
- Determine when Māgha masa actually begins in 2026

### Sources to Check
- DrikPanchang.com (noted in CONTEXT.md as "most reliable")
- Prokerala.com
- AstroSage.com

### Findings

#### Verified Against DrikPanchang.com (2026-01-31)

**Source:** [Hindu Festivals and other significant days in January 2026](https://www.drikpanchang.com/festivals/month/festivals-january.html?year=2026)

**Key Data Points:**
- **Pausha Purnima:** January 3, 2026 (Saturday)
- **Magha Month Start:** January 4, 2026
- **Magha Month Events:** Multiple festivals listed throughout January including:
  - January 6: Sakat Chauth (Magha, Krishna Chaturthi)
  - January 14: Makara Sankranti (Magha, Krishna Ekadashi)
  - January 18: Mauni Amavas (Magha, Krishna Amavasya)
  - January 29: Jaya Ekadashi (Magha, Shukla Ekadashi)
- **Magha Purnima:** February 1, 2026

**Conclusion:**
✗ **App is INCORRECT** - Shows Pausha for January 30, 2026
✓ **Should show:** Magha (January 4 - February 1, 2026)

#### Root Cause Analysis

From CONTEXT.md line 192:
> "**Note**: Masa changes at new moon, not at rashi boundary. Requires detecting new moon events for precise masa transitions."

And from CONTEXT.md "Known Issues & Limitations" section (line 275):
> "1. **Masa calculation** - Current implementation uses sun's rashi, should detect new moon events"

**The current implementation is a known simplification that doesn't match real panchanga calculations.**

The actual lunar month (masa) system:
- Amanta system: Masa runs from new moon (amavasya) to new moon
- Masa name is NOT determined solely by sun's rashi
- Traditional method links to the nakshatra where full moon occurs
- Requires detecting lunar phase events (new moon/full moon)

**Action Required:** Implement proper amanta masa calculation with new moon detection.

#### Research: Amanta Masa Calculation Algorithm (2026-01-31)

**Sources:**
- [Difference between North Indian and South Indian Lunar Calendar](https://www.drikpanchang.com/faq/faq-ans8.html) - DrikPanchang.com
- [Amanta vs. Purnimanta: Two Hindu Lunar Month Systems](https://shriastrotime.com/blogs/amanta-vs-purnimanta-understanding-the-two-hindu-lunar-month-systems-in-india)
- [Months of Hindu Calendar](https://www.indianetzone.com/months_hindu_calendar)
- [Solar and Lunar Months](https://vedikheritageblog.wordpress.com/jyotisha-an-introduction/solar-lunar-months/)

**Key Findings:**

1. **Amanta System Definition:**
   - Lunar month runs from new moon (amavasya) to new moon
   - Shukla paksha (waxing) comes first, then Krishna paksha (waning)
   - Primarily used in South India

2. **Month Naming Convention:**
   > "The name of the month is derived from the position of the moon on full moon day. The star closest to the full moon lends it's name to the month."

3. **Complete Nakshatra-to-Masa Mapping:**
   - Chaitra → Chitra nakshatra (#14)
   - Vaiśākha → Viśākhā nakshatra (#16)
   - Jyeṣṭha → Jyeṣṭhā nakshatra (#18)
   - Āṣāḍha → Pūrva/Uttara Āṣāḍhā nakshatras (#20/#21)
   - Śrāvaṇa → Śravaṇa nakshatra (#22)
   - Bhādrapada → Pūrva/Uttara Bhādrapadā nakshatras (#25/#26)
   - Āśvina → Aśvinī nakshatra (#1)
   - Kārtika → Kṛttikā nakshatra (#3)
   - Mārgaśīrṣa → Mṛgaśīrṣa nakshatra (#5)
   - Pauṣa → Puṣya nakshatra (#8)
   - Māgha → Maghā nakshatra (#10)
   - Phālguna → Pūrva/Uttara Phālgunī nakshatras (#11/#12)

4. **Implementation Algorithm:**
   1. Find previous new moon (amavasya) before current date
   2. Find next new moon after current date
   3. Find full moon (purnima) between these two new moons
   4. Determine nakshatra position of moon at full moon
   5. Map nakshatra to corresponding masa name

---

## 2026-02-01 - Implementation Complete & Tested

### Implementation Summary
- Implemented moon phase detection (new moon/full moon) using binary search
- Implemented proper amanta masa calculation based on full moon nakshatra
- Added complete 27-nakshatra to masa mapping (including adjacent nakshatras for boundary cases)

### Test Results (Playwright automated testing)

**Test Date:** February 1, 2026, 18:18 UTC

**Results:**
- ✅ **Masa:** Māgha (CORRECT - was showing "Unknown" before fix)
- ✅ **Full Moon:** Feb 1, 2026, 22:29 UTC
- ✅ **FM Nakshatra:** Āśleṣā (#9) → Māgha masa
- ✅ **Method:** amanta (full moon nakshatra)
- ✅ **Matches DrikPanchang:** Magha Purnima on February 1, 2026

**Key Fix:** Added nakshatra #9 (Āśleṣā) to masa mapping, as full moon can fall in adjacent nakshatras near month boundaries.

### Automated Test Framework Created
- **Location:** `tests/test_playwright.py`
- **API Endpoint:** `api.html` (outputs raw JSON)
- **Tool:** Playwright (Python) for headless browser testing
- **Benefit:** Can now verify calculations programmatically without manual browser checks

### Files Modified
1. [VedicCalendarService.js](js/services/VedicCalendarService.js) - Added moon phase detection & amanta calculation
2. [DebugView.js](js/components/DebugView.js) - Shows full moon date, nakshatra, and calculation method
3. Created `tests/test_playwright.py` - Automated testing
4. Created `api.html` - JSON data endpoint

### Status
✅ **Masa calculation now correct** - using proper amanta system with full moon nakshatra detection

---
