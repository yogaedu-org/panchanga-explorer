import { Profiler } from '../utils/Profiler.js';

export function TimelineView(currentTime, panchanga, service, zoomValue = 1.00, zoomUnit = 'day') {
    Profiler.start('TimelineView-total');

    // Calculate timeline range based on zoom settings
    // zoomValue is ALWAYS in days, regardless of selected unit
    const oneDayMs = 24 * 60 * 60 * 1000;

    // ===== GRADIENT HELPER FUNCTIONS =====

    /**
     * Calculate moon illumination from sun-moon elongation
     * @param {number} elongation - Sun-moon angle in degrees (0-360)
     * @returns {number} Illumination fraction (0-1)
     */
    const calculateIllumination = (elongation) => {
        // 0° = new moon (0% illumination)
        // 180° = full moon (100% illumination)
        return (1 - Math.cos(elongation * Math.PI / 180)) / 2;
    };

    /**
     * Get solar brightness for a given time (0 = night, 1 = day)
     * Currently uses simple 6am-6pm estimate.
     *
     * TODO: Replace with accurate sunrise/sunset calculation
     * Future implementation should:
     * - Accept latitude/longitude parameters
     * - Use astronomical calculation for actual sunrise/sunset times
     * - Support offline calculation (no API dependency)
     * - Consider twilight periods for smooth transitions
     *
     * @param {Date} date - The time to check
     * @returns {number} Brightness fraction (0-1)
     */
    const getSolarBrightness = (date) => {
        const hour = date.getHours() + date.getMinutes() / 60;

        // Simple estimate: 6am-6pm = day
        // TODO: Replace with actual sunrise/sunset calculation
        // const { sunrise, sunset } = calculateSunriseSunset(date, latitude, longitude);
        // return hour >= sunrise && hour < sunset ? 1 : 0;

        // Current simple implementation with smooth transitions
        if (hour >= 7 && hour < 17) {
            // Full daylight (7am - 5pm)
            return 1;
        } else if (hour >= 6 && hour < 7) {
            // Dawn transition (6am - 7am)
            return (hour - 6);
        } else if (hour >= 17 && hour < 18) {
            // Dusk transition (5pm - 6pm)
            return (18 - hour);
        } else {
            // Night
            return 0;
        }
    };

    /**
     * Generate CSS linear gradient for solar band based on day/night
     * @param {number} startTimeMs - Timeline start in ms
     * @param {number} endTimeMs - Timeline end in ms
     * @returns {string} CSS gradient string
     */
    const generateSolarGradient = (startTimeMs, endTimeMs) => {
        const stops = [];
        const numSamples = 48; // Sample every ~30 min for a day

        for (let i = 0; i <= numSamples; i++) {
            const timeMs = startTimeMs + (i / numSamples) * (endTimeMs - startTimeMs);
            const date = new Date(timeMs);
            const brightness = getSolarBrightness(date);
            const position = (i / numSamples) * 100;

            // Interpolate between night color (dark indigo) and day color (warm yellow)
            // Night: rgb(30, 27, 75) - indigo-950
            // Day: rgb(254, 249, 195) - yellow-100
            const r = Math.round(30 + brightness * (254 - 30));
            const g = Math.round(27 + brightness * (249 - 27));
            const b = Math.round(75 + brightness * (195 - 75));

            stops.push(`rgb(${r}, ${g}, ${b}) ${position.toFixed(1)}%`);
        }

        return `linear-gradient(to right, ${stops.join(', ')})`;
    };

    /**
     * Generate CSS linear gradient for lunar band based on moon illumination
     * @param {number} startTimeMs - Visible start in ms
     * @param {number} endTimeMs - Visible end in ms
     * @param {object} service - VedicCalendarService instance
     * @returns {string} CSS gradient string
     */
    const generateLunarGradient = (startTimeMs, endTimeMs, service) => {
        const stops = [];
        const numSamples = 24; // Sample points across the visible range

        for (let i = 0; i <= numSamples; i++) {
            const timeMs = startTimeMs + (i / numSamples) * (endTimeMs - startTimeMs);
            const date = new Date(timeMs);
            const elongation = service.getSunMoonElongation(date);
            const illumination = calculateIllumination(elongation);
            const position = (i / numSamples) * 100;

            // Interpolate between new moon (dark) and full moon (bright)
            // New moon: rgb(30, 27, 75) - indigo-950
            // Full moon: rgb(224, 231, 255) - indigo-100
            const r = Math.round(30 + illumination * (224 - 30));
            const g = Math.round(27 + illumination * (231 - 27));
            const b = Math.round(75 + illumination * (255 - 75));

            stops.push(`rgb(${r}, ${g}, ${b}) ${position.toFixed(1)}%`);
        }

        return `linear-gradient(to right, ${stops.join(', ')})`;
    };
    const timelineRangeMs = zoomValue * oneDayMs;
    const centerTimeMs = currentTime.getTime();
    const startTimeMs = centerTimeMs - (timelineRangeMs / 2);
    const endTimeMs = centerTimeMs + (timelineRangeMs / 2);

    const startTime = new Date(startTimeMs);
    const endTime = new Date(endTimeMs);

    // Helper: Convert time to position (0-1 range, 0.5 = center)
    const timeToPosition = (timeMs) => {
        return (timeMs - startTimeMs) / timelineRangeMs;
    };

    // Helper: Format time for display
    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // ===== SOLAR DAY BAND =====
    // Generate time markers based on zoom level
    const solarMarkers = [];
    let markerInterval, markerCount, formatMarker;

    switch(zoomUnit) {
        case 'year':
            markerInterval = 30 * 24 * 60 * 60 * 1000;  // 1 month
            markerCount = Math.ceil(zoomValue * 12) + 1;
            formatMarker = (date) => date.toLocaleDateString('en-US', { month: 'short' });
            break;
        case 'month':
            markerInterval = 24 * 60 * 60 * 1000;  // 1 day
            markerCount = Math.ceil(zoomValue * 30) + 1;
            formatMarker = (date) => String(date.getDate());
            break;
        case 'day':
            markerInterval = 60 * 60 * 1000;  // 1 hour
            markerCount = Math.ceil(zoomValue * 24) + 1;
            formatMarker = formatTime;
            break;
        case 'hour':
            markerInterval = 60 * 1000;  // 1 minute
            markerCount = Math.ceil(zoomValue * 60) + 1;
            formatMarker = formatTime;
            break;
        case 'min':
            markerInterval = 1000;  // 1 second
            markerCount = Math.ceil(zoomValue * 60) + 1;
            formatMarker = (date) => {
                const sec = String(date.getSeconds()).padStart(2, '0');
                return `:${sec}`;
            };
            break;
    }

    const halfCount = Math.floor(markerCount / 2);
    for (let i = -halfCount; i <= halfCount; i++) {
        const markerTime = new Date(centerTimeMs + (i * markerInterval));
        const pos = timeToPosition(markerTime.getTime());
        if (pos >= 0 && pos <= 1) {
            solarMarkers.push({
                time: markerTime,
                position: pos,
                label: formatMarker(markerTime),
                isCurrent: i === 0,
                visible: true
            });
        }
    }

    // Thin labels when too many would overlap (GH #11)
    // minLabelGap is the minimum spacing between labels as a fraction of container width
    const minLabelGap = 0.05; // ~40px at 800px container width
    if (solarMarkers.length > 1) {
        const avgGap = 1 / solarMarkers.length;
        if (avgGap < minLabelGap) {
            const showEveryNth = Math.ceil(minLabelGap / avgGap);
            const currentIdx = solarMarkers.findIndex(m => m.isCurrent);
            const anchor = currentIdx >= 0 ? currentIdx : 0;
            solarMarkers.forEach((marker, i) => {
                marker.visible = (Math.abs(i - anchor) % showEveryNth === 0);
            });
        }
    }

    // ===== TITHI BAND =====
    // Generate ALL visible tithis by iterating through the visible time range
    Profiler.start('tithi-iteration');
    const tithiBlocks = [];
    const currentTithiStartTime = service.findTithiStartTime(currentTime);
    const currentTithiEndTime = service.findTithiEndTime(currentTime);

    // Start from the beginning of visible range and iterate forward
    let tithiScanTime = new Date(startTimeMs);
    let iterations = 0;
    const maxIterations = 500; // Safety limit for very long time ranges

    while (tithiScanTime.getTime() < endTimeMs && iterations < maxIterations) {
        iterations++;

        // Get tithi at this time
        const tithiInfo = service.getTithi(tithiScanTime);
        const tithiStart = service.findTithiStartTime(tithiScanTime);
        const tithiEnd = service.findTithiEndTime(tithiScanTime);

        const startPos = timeToPosition(tithiStart.getTime());
        const endPos = timeToPosition(tithiEnd.getTime());

        // Only add if visible
        if (endPos > 0 && startPos < 1) {
            const isCurrent = tithiScanTime.getTime() >= currentTithiStartTime.getTime() &&
                              tithiScanTime.getTime() < currentTithiEndTime.getTime();

            tithiBlocks.push({
                number: tithiInfo.number,
                name: tithiInfo.name,
                paksha: tithiInfo.paksha,
                startPos: Math.max(0, startPos),
                endPos: Math.min(1, endPos),
                isCurrent: isCurrent
            });
        }

        // Move to next tithi (add 1ms past the end)
        tithiScanTime = new Date(tithiEnd.getTime() + 1);
    }
    Profiler.end('tithi-iteration');

    // ===== NAKSHATRA BAND =====
    // Generate ALL visible nakshatras by iterating through the visible time range
    Profiler.start('nakshatra-iteration');
    const nakshatraBlocks = [];
    const currentNakshatraStartTime = service.findNakshatraStartTime(currentTime);
    const currentNakshatraEndTime = service.findNakshatraEndTime(currentTime);

    // Start from the beginning of visible range and iterate forward
    let nakshatraScanTime = new Date(startTimeMs);
    let nakshatraIterations = 0;

    while (nakshatraScanTime.getTime() < endTimeMs && nakshatraIterations < maxIterations) {
        nakshatraIterations++;

        // Get nakshatra at this time
        const nakshatraInfo = service.getNakshatra(nakshatraScanTime);
        const nakshatraStart = service.findNakshatraStartTime(nakshatraScanTime);
        const nakshatraEnd = service.findNakshatraEndTime(nakshatraScanTime);

        const startPos = timeToPosition(nakshatraStart.getTime());
        const endPos = timeToPosition(nakshatraEnd.getTime());

        // Only add if visible
        if (endPos > 0 && startPos < 1) {
            const isCurrent = nakshatraScanTime.getTime() >= currentNakshatraStartTime.getTime() &&
                              nakshatraScanTime.getTime() < currentNakshatraEndTime.getTime();

            nakshatraBlocks.push({
                number: nakshatraInfo.number,
                name: nakshatraInfo.name,
                startPos: Math.max(0, startPos),
                endPos: Math.min(1, endPos),
                isCurrent: isCurrent
            });
        }

        // Move to next nakshatra (add 1ms past the end)
        nakshatraScanTime = new Date(nakshatraEnd.getTime() + 1);
    }
    Profiler.end('nakshatra-iteration');

    // ===== LUNAR DAY BAND =====
    // Calculate days since new moon (synodic month progress)
    const prevNewMoon = service.findNewMoonBefore(currentTime);
    const nextNewMoon = service.findNewMoonAfter(currentTime);
    const lunarMonthDurationMs = nextNewMoon.getTime() - prevNewMoon.getTime();
    const lunarDayProgress = (centerTimeMs - prevNewMoon.getTime()) / lunarMonthDurationMs;
    const lunarDay = lunarDayProgress * 29.53;

    // Calculate visible portion of lunar month
    const prevNewMoonPos = timeToPosition(prevNewMoon.getTime());
    const nextNewMoonPos = timeToPosition(nextNewMoon.getTime());

    // End profiling (HTML template is very fast, main cost is above calculations)
    Profiler.end('TimelineView-total');

    return `
    <div class="space-y-4">
        <!-- Header with Zoom Controls -->
        <div class="flex justify-between items-center mb-4 gap-4">
            <h3 class="text-lg font-semibold text-gray-800">Multi-Band Timeline</h3>

            <!-- Zoom Controls -->
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-gray-600">Zoom:</span>
                    <button onclick="window.adjustTimelineZoom('in')" class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">−</button>
                    <input
                        type="number"
                        value="${zoomValue.toFixed(2)}"
                        onchange="window.setTimelineZoom(this.value)"
                        step="0.25"
                        min="0.25"
                        class="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button onclick="window.adjustTimelineZoom('out')" class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">+</button>
                </div>

                <!-- Unit Radio Buttons -->
                <div class="flex items-center gap-2 text-xs">
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="timelineUnit" value="year" ${zoomUnit === 'year' ? 'checked' : ''} onchange="window.setTimelineUnit('year')" class="cursor-pointer" />
                        <span>Year</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="timelineUnit" value="month" ${zoomUnit === 'month' ? 'checked' : ''} onchange="window.setTimelineUnit('month')" class="cursor-pointer" />
                        <span>Month</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="timelineUnit" value="day" ${zoomUnit === 'day' ? 'checked' : ''} onchange="window.setTimelineUnit('day')" class="cursor-pointer" />
                        <span>Day</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="timelineUnit" value="hour" ${zoomUnit === 'hour' ? 'checked' : ''} onchange="window.setTimelineUnit('hour')" class="cursor-pointer" />
                        <span>Hour</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="timelineUnit" value="min" ${zoomUnit === 'min' ? 'checked' : ''} onchange="window.setTimelineUnit('min')" class="cursor-pointer" />
                        <span>Min</span>
                    </label>
                </div>
            </div>

            <div class="text-sm text-gray-600 whitespace-nowrap">
                ${startTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} — ${endTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>

        <!-- BANDS CONTAINER (relative positioning for center line and time labels) -->
        <div class="relative">
            <!-- TIME LABELS ROW (above all bands) -->
            <div class="relative h-6 mb-2">
                ${solarMarkers.filter(marker => marker.visible).map(marker => `
                    <div class="absolute -translate-x-1/2 text-xs ${marker.isCurrent ? 'font-bold text-gray-800' : 'text-gray-500'}" style="left: ${marker.position * 100}%">
                        ${marker.label}
                    </div>
                `).join('')}
            </div>

            <!-- SOLAR DAY BAND -->
            <div class="mb-3">
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="sun" class="text-yellow-500" style="width: 14px; height: 14px;"></i>
                    <h4 class="text-xs font-semibold text-gray-600">Solar</h4>
                </div>
                <div class="relative h-8 rounded" style="background: ${generateSolarGradient(startTimeMs, endTimeMs)}">
                </div>
            </div>

            <!-- LUNAR DAY BAND -->
            <div class="mb-3">
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="moon" class="text-indigo-500" style="width: 14px; height: 14px;"></i>
                    <h4 class="text-xs font-semibold text-gray-600">Lunar</h4>
                </div>
                <div class="relative h-8 bg-gray-300 rounded overflow-hidden">
                    <!-- Full lunar month background with dynamic illumination gradient -->
                    <div
                        class="absolute top-0 h-full"
                        style="left: ${Math.max(0, prevNewMoonPos) * 100}%; width: ${Math.min((nextNewMoonPos - prevNewMoonPos), (1 - Math.max(0, prevNewMoonPos))) * 100}%; background: ${generateLunarGradient(
                            Math.max(prevNewMoon.getTime(), startTimeMs),
                            Math.min(nextNewMoon.getTime(), endTimeMs),
                            service
                        )}"
                    >
                        <div class="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold drop-shadow-md">
                            Day ${lunarDay.toFixed(1)} / 29.5
                        </div>
                    </div>
                    <!-- New moon markers (black line demarcation) -->
                    ${prevNewMoonPos > 0 && prevNewMoonPos < 1 ? `
                        <div class="absolute top-0 h-full w-0.5 bg-black z-10" style="left: ${prevNewMoonPos * 100}%"></div>
                    ` : ''}
                    ${nextNewMoonPos > 0 && nextNewMoonPos < 1 ? `
                        <div class="absolute top-0 h-full w-0.5 bg-black z-10" style="left: ${nextNewMoonPos * 100}%"></div>
                    ` : ''}
                </div>
            </div>

            <!-- TITHI BAND -->
            <div class="mb-3">
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="calendar" class="text-purple-500" style="width: 14px; height: 14px;"></i>
                    <h4 class="text-xs font-semibold text-gray-600">Tithi</h4>
                </div>
                <div class="relative h-8 bg-gray-300 rounded overflow-hidden">
                    ${tithiBlocks.map(tithi => `
                        <div
                            class="absolute top-0 h-full ${tithi.isCurrent ? 'bg-purple-600' : 'bg-purple-400'} border-r border-black"
                            style="left: ${tithi.startPos * 100}%; width: ${(tithi.endPos - tithi.startPos) * 100}%"
                        >
                            <div class="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold overflow-hidden whitespace-nowrap">
                                ${(tithi.endPos - tithi.startPos) > 0.05 ? tithi.name : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- NAKSHATRA BAND -->
            <div class="mb-3">
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="star" class="text-blue-500" style="width: 14px; height: 14px;"></i>
                    <h4 class="text-xs font-semibold text-gray-600">Nakshatra</h4>
                </div>
                <div class="relative h-8 bg-gray-300 rounded overflow-hidden">
                    ${nakshatraBlocks.map(nakshatra => `
                        <div
                            class="absolute top-0 h-full ${nakshatra.isCurrent ? 'bg-blue-600' : 'bg-blue-400'} border-r border-black"
                            style="left: ${nakshatra.startPos * 100}%; width: ${(nakshatra.endPos - nakshatra.startPos) * 100}%"
                        >
                            <div class="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold overflow-hidden whitespace-nowrap">
                                ${(nakshatra.endPos - nakshatra.startPos) > 0.05 ? nakshatra.name : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- CENTER TIME MARKER (spans all bands) -->
            <div class="absolute top-6 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none" style="left: 50%"></div>
        </div>

        <!-- Info Panel -->
        <div class="bg-purple-50 rounded-lg p-4 mt-6">
            <h4 class="font-semibold text-gray-800 mb-2">Timeline View:</h4>
            <ul class="text-sm text-gray-700 space-y-1">
                <li>• <strong>Red line</strong> marks your selected calculation time</li>
                <li>• <strong>Darker blocks</strong> show current tithi and nakshatra</li>
                <li>• All timelines centered on calc time, showing context before and after</li>
                <li>• Tithi ${panchanga.tithi.number}/30: ${panchanga.tithi.name} (${Math.round(panchanga.tithi.progress * 100)}% complete)</li>
                <li>• Nakshatra ${panchanga.nakshatra.number}/27: ${panchanga.nakshatra.name} (${Math.round(panchanga.nakshatra.progress * 100)}% complete)</li>
            </ul>
        </div>
    </div>
    `;
}
