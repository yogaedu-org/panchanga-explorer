
# Panchanga Explorer - Project Context & Specification

## Project Overview

**Panchanga Explorer** is an educational web application that helps users understand the difference between three calendar systems: Solar Days, Lunar Days, and Tithis (Vedic lunar phase units). The app provides real-time panchanga (Vedic almanac) calculations with interactive visualizations.

### Primary Goal
Enable beginners to grasp fundamental astronomical concepts underlying Vedic timekeeping while providing accurate calculations for spiritual practitioners planning sadhana across timezones.

### Target Audience
1. **Beginners** - People new to Hindu/Vedic calendar systems
2. **Practitioners** - Users who need accurate tithi/nakshatra timing for spiritual practice
3. **Educators** - Teachers explaining astronomical concepts

## Core Features

### 1. Educational Overview (Landing Page)
- Clear explanation of Solar Days (Gregorian calendar system)
- Lunar Days (moon phase cycles)
- Tithi system (12° sun-moon angular separation units)
- Why these matter: festivals, sadhana timing, astronomical precision
- Skip option to jump directly to main app

### 2. Live Panchanga Display
Real-time display of five key Vedic time elements:
- **Tithi** - Current lunar day (1-30) with paksha (Shukla/Krishna)
- **Nakshatra** - Lunar mansion (1-27)
- **Masa** - Lunar month
- **Progress bars** - Visual completion percentage for tithi and nakshatra
- **Location awareness** - Calculations adjust for user's coordinates

### 3. Interactive Visualizations (User-Toggleable)

#### Comparison View
Side-by-side display of:
- Solar day (fixed 24-hour period)
- Lunar day (position in 29.5-day cycle)
- Tithi (variable 19-26 hour period)

#### Orbital View
Geometric visualization showing:
- Sun-Moon angular separation
- Current tithi as wedge angle (0-360°)
- Moon position on orbit circle

#### Timeline View
Temporal comparison showing:
- Solar day progress (midnight to midnight)
- Current tithi progress (start to end)
- Explanation of why tithis "float" across solar days

#### Debug View
**Critical for development and verification:**
- Complete calculation breakdown
- Timestamp and ayanamsa used
- Sun position (tropical, sidereal, rashi)
- Moon position (tropical, sidereal)
- Tithi calculation (angle, progress %, remaining %)
- Nakshatra calculation (progress %, remaining %)
- Masa determination logic
- Calculation source indicator
- Copy-to-clipboard for sharing with developers
- Comparison instructions for verification

### 4. Location Management
- Default: Honolulu, Hawaii (21.3099°N, 157.8581°W)
- User input for custom locations
- Display coordinates for verification
- Timezone-aware time display
- **Future**: Geocoding service integration for lat/lon lookup

### 5. Time Conversion (Planned)
- Show when tithi begins/ends in different timezones
- Critical for global spiritual communities coordinating events

## Technical Architecture

### Modular Code Structure

```
panchanga-explorer/
├── index.html                          # Main app shell
├── CONTEXT.md                          # This file
├── README.md                           # User-facing documentation
├── js/
│   ├── services/
│   │   └── VedicCalendarService.js    # Core astronomical calculations
│   ├── components/
│   │   ├── EducationalOverview.js     # Landing page component
│   │   ├── MainApp.js                 # Main application container
│   │   ├── ComparisonView.js          # Side-by-side calendar comparison
│   │   ├── OrbitalView.js             # Geometric sun-moon visualization
│   │   ├── TimelineView.js            # Temporal progress bars
│   │   └── DebugView.js               # Developer debug data
│   └── main.js                        # App initialization & state management
└── styles/
    └── main.css                        # Tailwind utilities + custom styles

### Why This Structure?

**Separation of Concerns:**
- **Services** - Pure calculation logic, no UI dependencies
- **Components** - UI rendering, consumes services
- **Main** - State management and coordination

**Benefits:**
1. **Debugging** - Issues isolated to specific files
2. **Reusability** - VedicCalendarService can be used in other projects
3. **Testing** - Each module testable independently
4. **Collaboration** - Clear ownership ("check DebugView.js line 45")
5. **Version Control** - Clean git diffs, file-level history
6. **AI Assistance** - I can reference specific files/functions

## Astronomical Calculation Requirements

### Critical: Use Proper Astronomy Library

**DO NOT use simplified approximations.** This app requires professional-grade calculations.

**Required Library: astronomy-engine**
- CDN: `https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.min.js`
- Why: Accurate planetary positions using JPL ephemeris data
- License: MIT (free for commercial use)

**Alternative: astronomy-bundle** (if astronomy-engine has issues)

### Calculation Specifications

#### Ayanamsa (Precession Correction)
- **System**: Lahiri Ayanamsa (standard for Vedic astrology)
- **J2000.0 value**: 23.8506° 
- **Annual rate**: 0.0139713° per year
- **Formula**: `ayanamsa = 23.8506 + (0.0139713 × years_since_2000)`

#### Sidereal Positions
All calculations must use **sidereal** (fixed star) coordinates, not tropical:
- **Sidereal = Tropical - Ayanamsa**

#### Sun Position
- Use library's heliocentric → geocentric → ecliptic conversion
- Apply ayanamsa to get sidereal longitude
- Accuracy target: ±0.01° (adequate for panchanga)

#### Moon Position  
- Use library's geocentric moon position
- Convert equatorial → ecliptic coordinates
- Apply ayanamsa to get sidereal longitude
- **Critical**: Moon moves ~13°/day, so precision matters
- Accuracy target: ±0.05° (adequate for nakshatra/tithi)

#### Tithi Calculation
```
sun_moon_angle = (moon_sidereal - sun_sidereal + 360) % 360
tithi_number = floor(sun_moon_angle / 12) + 1
tithi_progress = (sun_moon_angle % 12) / 12
paksha = tithi_number <= 15 ? "Shukla" : "Krishna"
```

**Tithi ranges:**
- 1-15: Shukla Paksha (waxing)
- 16-30: Krishna Paksha (waning)

**Tithi names:**
1. Pratipad, 2. Dvitīyā, 3. Tritīyā, 4. Chaturthī, 5. Pañchamī,
6. Ṣaṣṭhī, 7. Saptamī, 8. Aṣṭamī, 9. Navamī, 10. Daśamī,
11. Ekādaśī, 12. Dvādaśī, 13. Trayodaśī, 14. Chaturdaśī, 
15. Pūrṇimā (full moon) / 30. Amāvāsyā (new moon)

#### Nakshatra Calculation
```
nakshatra_number = floor(moon_sidereal / 13.333333) + 1
nakshatra_progress = (moon_sidereal % 13.333333) / 13.333333
```

**Nakshatra names (27 total):**
Aśvinī, Bharaṇī, Kṛttikā, Rohiṇī, Mṛgaśīrṣa, Ārdrā, Punarvasu, Puṣya, Āśleṣā, Maghā, Pūrva Phālgunī, Uttara Phālgunī, Hasta, Chitrā, Svātī, Viśākhā, Anurādhā, Jyeṣṭhā, Mūla, Pūrva Āṣāḍhā, Uttara Āṣāḍhā, Śravaṇa, Dhaniṣṭhā, Śatabhiṣā, Pūrva Bhādrapadā, Uttara Bhādrapadā, Revatī

#### Masa (Lunar Month) Calculation
**System**: Amanta (new moon to new moon)

```
sun_rashi = floor(sun_sidereal / 30)
masa_names = [
  "Chaitra", "Vaiśākha", "Jyeṣṭha", "Āṣāḍha", 
  "Śrāvaṇa", "Bhādrapada", "Āśvina", "Kārtika", 
  "Mārgaśīrṣa", "Pauṣa", "Māgha", "Phālguna"
]
masa = masa_names[sun_rashi]
```

**Note**: Masa changes at new moon, not at rashi boundary. Requires detecting new moon events for precise masa transitions.

## Location Data Requirements

### Current Implementation
- Static location data (city name, lat, lon, timezone)
- User manual input

### Future: Geocoding Integration

**Recommended Service: OpenCage Geocoder**
- Free tier: 2,500 requests/day
- Returns: coordinates, timezone
- Usage: `city name → {lat, lon, timezone}`

**Alternative: browser geolocation API**
```javascript
navigator.geolocation.getCurrentPosition(position => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
});
```

### Timezone Handling
- Use Intl.DateTimeFormat for display
- Store timezone identifier (e.g., "Pacific/Honolulu")
- Critical for accurate "when does this tithi start here?" questions

## Development Guidelines

### Code Style
- ES6+ modules (`import`/`export`)
- Functional where possible, classes for services
- JSDoc comments for complex functions
- Descriptive variable names (`sunSiderealLongitude`, not `ssl`)

### State Management
- Pure functions in services (no side effects)
- State in main.js, passed down to components
- Update frequency: 1Hz (every second) for real-time feel

### Error Handling
- Graceful degradation if astronomy library fails
- Log errors to console with context
- User-friendly messages (never show stack traces to users)

### Performance
- Calculations are cheap (~1ms total)
- No optimization needed unless >100 calculations/second
- Cache ayanamsa within same day (changes slowly)

## Testing & Verification

### Manual Verification Process
1. Run app at known date/time
2. Click "Debug View"
3. Copy debug data to clipboard
4. Compare with trusted source:
   - **DrikPanchang.com** (most reliable)
   - **Prokerala.com** 
   - **AstroSage.com**
5. Check:
   - Tithi number and progress
   - Nakshatra number and progress
   - Masa name
   - Sun/Moon sidereal longitudes

### Known Test Cases

**Test Case 1:**
- Date: Thursday, January 29, 2026, 6:27:17 PM
- Expected: Shukla Dvādaśī (12th), 94.33% complete
- Expected: Ārdrā nakshatra, 20.6% complete
- Expected: Māgha masa

### Accuracy Targets
- Tithi: Within 1% of verified source
- Nakshatra: Within 1% of verified source
- Masa: Exact match (changes infrequently)

## Known Issues & Limitations

### Current Challenges
1. **Masa calculation** - Current implementation uses sun's rashi, should detect new moon events
2. **Tithi progress** - May be off by 1-2% due to moon position accuracy
3. **No leap months** - Doesn't handle Adhika Masa (intercalary month)

### Future Improvements
1. **Date picker** - Select any date, not just "now"
2. **Tithi timeline** - Show when tithi starts/ends across 24 hours
3. **Festival calendar** - Show upcoming important tithis
4. **Multi-location** - Compare panchanga for multiple cities
5. **Time conversion** - "When does Ekādaśī start in Tokyo if I'm in New York?"
6. **Panchaka support** - Add vara (weekday) and yoga
7. **Export/Share** - Generate shareable links or iCal events
8. **Offline mode** - Cache calculations for use without internet

## Deployment

### GitHub Pages (Recommended)
1. Push code to GitHub
2. Enable GitHub Pages in repo settings
3. URL: `https://USERNAME.github.io/panchanga-explorer`

### Requirements
- Must serve via HTTP/HTTPS (not file://)
- ES6 modules require web server context

### Build Process
**None required!** This is vanilla HTML/JS/CSS.

## License & Attribution

### Code License
MIT License (permissive, allows commercial use)

### Library Licenses
- astronomy-engine: MIT
- lucide-react (if used): ISC
- Tailwind CSS: MIT

### Data Attribution
Astronomical calculations based on:
- JPL Ephemeris (via astronomy-engine)
- Lahiri Ayanamsa (standard in Vedic astrology)

## Contact & Contribution

**Maintainer**: [Your name/GitHub username]

**How to Contribute**:
1. Fork the repository
2. Create feature branch
3. Submit pull request with:
   - Description of change
   - Test results (debug output comparison)
   - Updated documentation if needed

**Reporting Issues**:
Include debug output (from Debug View) when reporting calculation errors.

---

## Quick Start for Developers

# Clone the repo
git clone https://github.com/YOUR_USERNAME/panchanga-explorer.git
cd panchanga-explorer

# Serve locally (pick one):
python -m http.server 8000
# OR
npx serve

# Open browser
open http://localhost:8000

No build step, no npm install, just serve and code!

---

**Last Updated**: January 2026  
**Version**: 1.0.0-alpha

This CONTEXT.md file is designed to:
1. ✅ Give you (or any developer) complete understanding of the project
2. ✅ Help me (Claude) provide better assistance by understanding all decisions
3. ✅ Be specific about astronomical requirements and libraries
4. ✅ Document the modular architecture for debugging/reusability
5. ✅ Serve as both spec and development guide
6. ✅ Include verification procedures with actual test case

