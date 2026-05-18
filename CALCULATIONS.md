# Panchanga Explorer - Calculation Methodology

This document explains the astronomical calculations used in Panchanga Explorer, including data sources, algorithms, assumptions, precision levels, and known limitations.

## Table of Contents
1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Ayanamsa (Precession Correction)](#ayanamsa-precession-correction)
4. [Planetary Positions](#planetary-positions)
5. [Tithi (Lunar Day)](#tithi-lunar-day)
6. [Nakshatra (Lunar Mansion)](#nakshatra-lunar-mansion)
7. [Masa (Lunar Month)](#masa-lunar-month)
8. [Timeline View Bands](#timeline-view-bands)
9. [Precision and Reliability](#precision-and-reliability)
10. [Known Issues](#known-issues)
11. [Reference Sites for Validation](#reference-sites-for-validation)

---

## Overview

Panchanga Explorer calculates Vedic calendar elements using:
- **Primary source**: [astronomy-engine](https://github.com/cosinekitty/astronomy) library — an **analytical planetary theory** implementation
- **Fallback**: Simplified orbital mechanics formulas when astronomy-engine is unavailable
- **Ayanamsa**: Lahiri (Chitrapaksha) system

The app performs real-time astronomical calculations in the browser — no server-side computation, external API calls, or ephemeris data files required.

---

## Data Sources

### Important: Analytical Theory vs. Numerical Ephemeris

This app does **not** use a numerical ephemeris (pre-computed position tables like JPL DE440 or Swiss Ephemeris). Instead, it uses **analytical planetary theory** — mathematical models that compute positions from formulas at runtime.

| Approach | What We Use | What drik-panchanga Uses |
|----------|-------------|------------------------|
| **Method** | Analytical theory (VSOP87/ELP2000) | Numerical ephemeris (Swiss Ephemeris) |
| **How it works** | Mathematical series evaluated at query time | Pre-computed tables interpolated at query time |
| **Data files** | None — formulas embedded in JS code | Requires external `.se1` data files |
| **Precision** | Sub-arcsecond for Sun/Moon | Sub-arcsecond (slightly higher) |
| **Tradeoff** | Compact, fast, fully self-contained | Larger data footprint, marginally more precise |

For panchanga purposes, the precision difference between the two approaches is negligible — both achieve sub-arcsecond accuracy for Sun and Moon. The bigger accuracy concerns are our ayanamsa model and binary search precision for new/full moon detection.

### Primary: astronomy-engine Library
- **Type**: JavaScript analytical planetary theory library
- **Method**: Implements VSOP87 (Sun) and ELP2000 (Moon) as mathematical series
- **Accuracy**: Sub-arcsecond precision for Sun/Moon positions
- **Range**: Valid for dates between years -5000 to +10000
- **Data**: No external files — all coefficients are embedded in the JS source
- **Source**: https://github.com/cosinekitty/astronomy

### Fallback: Simplified Formulas
Used only when astronomy-engine fails (rare edge cases):
- Sun: Low-precision orbital elements from J2000.0 epoch
- Moon: Simplified mean longitude with 5 major perturbation terms
- Accuracy: ~1° for Sun, ~2-3° for Moon
- These are textbook approximations, not ephemeris data

---

## Ayanamsa (Precession Correction)

### What is Ayanamsa?
The angular difference between the tropical zodiac (used in Western astronomy) and the sidereal zodiac (used in Vedic astrology). This accounts for the precession of Earth's axis.

### Implementation
```javascript
// Lahiri (Chitrapaksha) Ayanamsa
LAHIRI_AYANAMSA_2000 = 23.8506°  // Value at J2000.0 epoch
AYANAMSA_RATE = 0.0139713°/year  // Annual precession rate

ayanamsa = 23.8506 + (yearsSinceJ2000 × 0.0139713)
```

### Calculation Details
- **Epoch**: J2000.0 (January 1, 2000, 12:00 TT)
- **Method**: Linear interpolation from epoch value
- **Source**: Lahiri ayanamsa as published by Indian Ephemeris

### Precision
- **Accuracy**: ±0.01° for dates within ±100 years of J2000
- **Limitation**: Linear approximation; actual precession has small periodic terms
- **Impact**: Could contribute to ~1 minute error in tithi/nakshatra timing per decade from epoch

### Potential Issue for Masa Discrepancy
Different panchanga sources use slightly different ayanamsa values:
- Lahiri: 23.8506° at J2000 (used here)
- Krishnamurti: 23.8167° at J2000
- Raman: 22.4° at J2000
- True Chitrapaksha: May differ by ~0.01° due to nutation

A 0.1° ayanamsa difference translates to ~3 minutes of nakshatra timing difference.

---

## Planetary Positions

### Sun Longitude

**Primary Method** (astronomy-engine):
```javascript
const ecliptic = Astronomy.Ecliptic(Astronomy.SunPosition(date));
const tropicalLong = ecliptic.elon;  // Tropical longitude
const sidereal = (tropicalLong - ayanamsa + 360) % 360;  // Sidereal longitude
```

**Fallback Method** (simplified):
```javascript
// Days since J2000.0
const days = (date - J2000) / 86400000;
// Mean longitude
const L = (280.460 + 0.9856474 × days) % 360;
// Mean anomaly
const g = (357.528 + 0.9856003 × days) × π/180;
// Ecliptic longitude with equation of center
const lambda = L + 1.915 × sin(g) + 0.020 × sin(2g);
```

### Moon Longitude

**Primary Method** (astronomy-engine):
```javascript
const geoMoon = Astronomy.GeoMoon(date);
const ecliptic = Astronomy.Ecliptic(geoMoon);
const tropicalLong = ecliptic.elon;
const sidereal = (tropicalLong - ayanamsa + 360) % 360;
```

**Fallback Method** (simplified):
```javascript
const days = (date - J2000) / 86400000;
// Mean longitude
const L = (218.316 + 13.176396 × days) % 360;
// Mean anomaly
const M = (134.963 + 13.064993 × days) × π/180;
// Solar mean anomaly
const Ms = (357.529 + 0.985600 × days) × π/180;
// Mean elongation
const D = (297.850 + 12.190749 × days) × π/180;

// Longitude with major perturbations
const lambda = L + 6.289×sin(M) + 1.274×sin(2D-M) + 0.658×sin(2D) + 0.214×sin(2M) - 0.186×sin(Ms);
```

---

## Tithi (Lunar Day)

### Definition
A tithi is 1/30th of the synodic month, defined by the angular separation between Moon and Sun.

### Calculation
```javascript
// Sun-Moon elongation (sidereal)
const angle = (moonSidereal - sunSidereal + 360) % 360;

// Tithi number (1-30)
const tithiNumber = Math.floor(angle / 12) + 1;

// Progress within current tithi (0-1)
const tithiProgress = (angle % 12) / 12;
```

### Tithi Names
- **Shukla Paksha** (waxing, tithis 1-15): Pratipad through Pūrṇimā
- **Krishna Paksha** (waning, tithis 16-30): Pratipad through Amāvāsyā

### Boundary Detection
Tithi boundaries are found using binary search:
```javascript
// Search backwards/forwards up to 26 hours (max tithi duration)
// Precision: Within 1 minute
while ((high - low) > 60000) {
    const mid = (low + high) / 2;
    if (getTithi(mid).number === currentTithi) {
        // Narrow search range
    }
}
```

### Precision
- **Tithi number**: Accurate to the minute boundary
- **Progress**: Accurate to ~0.1% within tithi
- **Boundary timing**: ±30 seconds

---

## Nakshatra (Lunar Mansion)

### Definition
The 27 nakshatras divide the ecliptic into equal 13°20' (13.333...°) segments, based on the Moon's sidereal position.

### Calculation
```javascript
// Moon's sidereal longitude
const moonSidereal = getMoonLongitude(date).sidereal;

// Nakshatra number (1-27)
const nakshatraNumber = Math.floor(moonSidereal / 13.333333) + 1;

// Progress within nakshatra (0-1)
const nakshatraProgress = (moonSidereal % 13.333333) / 13.333333;
```

### Nakshatra List
1. Aśvinī, 2. Bharaṇī, 3. Kṛttikā, 4. Rohiṇī, 5. Mṛgaśīrṣa, 6. Ārdrā,
7. Punarvasu, 8. Puṣya, 9. Āśleṣā, 10. Maghā, 11. Pūrva Phālgunī, 12. Uttara Phālgunī,
13. Hasta, 14. Chitrā, 15. Svātī, 16. Viśākhā, 17. Anurādhā, 18. Jyeṣṭhā,
19. Mūla, 20. Pūrva Āṣāḍhā, 21. Uttara Āṣāḍhā, 22. Śravaṇa, 23. Dhaniṣṭhā, 24. Śatabhiṣā,
25. Pūrva Bhādrapadā, 26. Uttara Bhādrapadā, 27. Revatī

### Precision
- **Nakshatra number**: Accurate within segment
- **Boundary timing**: ±30 seconds (binary search to 1 minute)
- **Duration**: ~23-25 hours per nakshatra

---

## Masa (Lunar Month)

### Definition
The masa (lunar month) is determined by the nakshatra in which the full moon (pūrṇimā) occurs during that lunar month.

### Calculation Method: Amanta System
```javascript
// 1. Find lunar month boundaries
const prevNewMoon = findNewMoonBefore(date);  // Previous amāvāsyā
const nextNewMoon = findNewMoonAfter(date);   // Next amāvāsyā

// 2. Find full moon within this lunar month
const fullMoon = findFullMoonBetween(prevNewMoon, nextNewMoon);

// 3. Get nakshatra at full moon
const nakshatraAtFullMoon = getNakshatra(fullMoon);

// 4. Map nakshatra to masa name
const masaName = getMasaFromNakshatra(nakshatraAtFullMoon.number);
```

### Nakshatra-to-Masa Mapping
| Nakshatra at Full Moon | Masa Name |
|------------------------|-----------|
| 1 Aśvinī, 2 Bharaṇī | Āśvina |
| 3 Kṛttikā, 4 Rohiṇī | Kārtika |
| 5 Mṛgaśīrṣa, 6 Ārdrā, 7 Punarvasu | Mārgaśīrṣa |
| 8 Puṣya, 9 Āśleṣā | Pauṣa |
| 10 Maghā | Māgha |
| 11 Pūrva Phālgunī, 12 Uttara Phālgunī, 27 Revatī | Phālguna |
| 13 Hasta, 14 Chitrā | Chaitra |
| 15 Svātī, 16 Viśākhā | Vaiśākha |
| 17 Anurādhā, 18 Jyeṣṭhā | Jyeṣṭha |
| 19 Mūla, 20 Pūrva Āṣāḍhā, 21 Uttara Āṣāḍhā | Āṣāḍha |
| 22 Śravaṇa, 23 Dhaniṣṭhā | Śrāvaṇa |
| 24 Śatabhiṣā, 25 Pūrva Bhādrapadā, 26 Uttara Bhādrapadā | Bhādrapada |

### New Moon Detection
```javascript
// Binary search for sun-moon elongation ≈ 0°
while ((high - low) > 3600000) {  // Within 1 hour precision
    const mid = (low + high) / 2;
    const elongation = getSunMoonElongation(mid);
    if (elongation < 180) {
        high = mid;
    } else {
        low = mid;
    }
}
```

### Full Moon Detection
```javascript
// Binary search for sun-moon elongation ≈ 180°
while ((high - low) > 3600000) {  // Within 1 hour precision
    const mid = (low + high) / 2;
    const elongation = getSunMoonElongation(mid);
    if (elongation < 180) {
        low = mid;
    } else {
        high = mid;
    }
}
```

### Known Limitations (Potential Masa Discrepancy Sources)
1. **New/Full Moon Precision**: ±30 minutes (1 hour binary search limit)
2. **Nakshatra Boundary Cases**: If full moon is very close to nakshatra boundary, small timing errors could place it in adjacent nakshatra
3. **Adhika Masa (Intercalary Month)**: Not currently handled - occurs when two new moons fall in same solar month
4. **Kshaya Masa (Lost Month)**: Not currently handled - when no new moon falls in a solar month
5. **Regional Variations**: North India (Purnimant) vs South India (Amanta) systems

---

## Timeline View Bands

### Solar Band
**Method**: Estimated day/night based on local hour
```javascript
// Simple 6am-6pm day estimate (LOCAL TIME)
if (hour >= 7 && hour < 17) return 1;      // Full daylight
if (hour >= 6 && hour < 7) return hour-6;  // Dawn
if (hour >= 17 && hour < 18) return 18-hour; // Dusk
return 0;  // Night
```

**Limitations**:
- Uses local system time, not actual sunrise/sunset
- Does not account for latitude/longitude
- Fixed 6am/6pm transitions regardless of season
- TODO: Implement actual astronomical sunrise/sunset

### Lunar Band
**Method**: Moon illumination from sun-moon elongation
```javascript
// Elongation: 0° = new moon, 180° = full moon
const illumination = (1 - cos(elongation × π/180)) / 2;
```

**Precision**: Accurate illumination based on actual elongation

### Tithi Band
**Method**: Iterates through time range, finding each tithi boundary
**Precision**: ±1 minute boundary accuracy

### Nakshatra Band
**Method**: Same iteration approach as tithi
**Precision**: ±1 minute boundary accuracy

---

## Precision and Reliability

### Summary Table

| Calculation | Primary Source | Precision | Confidence |
|-------------|----------------|-----------|------------|
| Sun Position | astronomy-engine | < 1 arcsecond | HIGH |
| Moon Position | astronomy-engine | < 1 arcsecond | HIGH |
| Ayanamsa | Linear from Lahiri | ±0.01° | MEDIUM |
| Tithi Number | Derived | Exact within boundary | HIGH |
| Tithi Boundary | Binary search | ±30 seconds | HIGH |
| Nakshatra Number | Derived | Exact within boundary | HIGH |
| Nakshatra Boundary | Binary search | ±30 seconds | HIGH |
| New/Full Moon | Binary search | ±30 minutes | MEDIUM |
| Masa Name | Derived from above | See limitations | MEDIUM |
| Solar Band | Hour estimate | Not astronomical | LOW |

### Error Propagation
1. Moon position error → Nakshatra error → Masa error (if near boundary)
2. Ayanamsa error → All sidereal calculations
3. New moon timing error → Full moon timing → Masa determination

---

## Known Issues

### GH #14: Masa Calculation Discrepancy
- **Symptom**: Masa differs from reference apps by 1-2 days in some cases
- **Possible Causes**:
  1. New/full moon timing precision (±30 min)
  2. Nakshatra boundary edge cases
  3. Ayanamsa differences between sources
  4. Adhika/Kshaya masa not handled
- **Status**: Under investigation

### Solar Band Accuracy
- Currently uses fixed 6am/6pm, not actual sunrise/sunset
- Seasonal variation not accounted for
- Latitude/longitude not considered

---

## Reference Sites for Validation

### Recommended for Comparison Testing

1. **Drik Panchang** - https://www.drikpanchang.com/
   - Widely used, well-documented methodology
   - Provides tithi, nakshatra, masa with timings
   - High precision calculations
   - Sample data (Feb 2, 2026): Tithi: Pratipada until 11:52 PM, Nakshatra: Ashlesha until 8:47 PM

2. **MyPanchang.com** - https://www.mypanchang.com/
   - Vedic High Precision Nirayana Panchangam
   - Free for individual use
   - Regional variations available

3. **Prokerala** - https://www.prokerala.com/astrology/panchang/
   - Clean interface
   - Provides detailed timings

### APIs for Automated Testing

1. **AstrologyAPI.com** - https://astrologyapi.com/docs/api-ref/15/basic_panchang
   - `basic_panchang` endpoint: tithi, nakshatra, yoga, karan, sunrise/sunset
   - `advanced_panchang` endpoint: detailed timings, moonrise/moonset
   - Multi-language support (English, Hindi, Tamil, Telugu, etc.)

2. **DivineAPI** - https://divineapi.com/indian-astrology/panchang-api
   - Daily Panchang API
   - 7-day free trial
   - Tithi, nakshatra, yoga, karana, paksha details

3. **Free Astrology API** - https://freeastrologyapi.com/api-reference/complete-panchang
   - Complete panchang data
   - Includes Lunar Month, Ritu, Saka/Vikrama year

4. **Panchang.Click** - https://panchang.click/panchang-api
   - Free basic plan (5 elements + Sun/Moon degrees)
   - Premium plans with Rahukaalam, Muhuratas, Vrat

### Open Source Alternative

**drik-panchanga** - https://github.com/webresh/drik-panchanga
- Python library using Swiss Ephemeris
- Computes tithi, nakshatra with end times
- Accurate for years 5000 BCE to 5000 CE
- Install: `pip install pyswisseph`
- Good for local validation without API dependencies

### Automated Testing Approach
```javascript
// Suggested test structure
const testCases = [
    { date: '2026-01-29', expectedMasa: 'Māgha', source: 'DrikPanchang' },
    { date: '2026-02-02', expectedTithi: 'Pratipada', expectedNakshatra: 'Ashlesha', source: 'DrikPanchang' },
    { date: '2026-02-12', expectedMasa: 'Phālguna', source: 'DrikPanchang' },
    // Add more test cases from reference sites
];

// Python validation using drik-panchanga
// pip install pyswisseph
// from drik_panchanga import panchanga
// result = panchanga.get_panchanga(date, location)
```

---

## Changelog

- **2026-02-03**: Initial documentation created (GH #14)
