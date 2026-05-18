export function OrbitalView(panchanga) {
    const angle = panchanga.tithi.angle;
    const angleRad = angle * Math.PI / 180;

    // Calculate moon phase based on Sun-Moon angle
    // angle = 0° (New Moon), 90° (First Quarter), 180° (Full Moon), 270° (Last Quarter)
    const illumination = (1 - Math.cos(angleRad)) / 2; // 0 (new) to 1 (full)

    // Determine phase name
    let phaseName = '';
    if (angle < 22.5 || angle >= 337.5) phaseName = 'New Moon';
    else if (angle < 67.5) phaseName = 'Waxing Crescent';
    else if (angle < 112.5) phaseName = 'First Quarter';
    else if (angle < 157.5) phaseName = 'Waxing Gibbous';
    else if (angle < 202.5) phaseName = 'Full Moon';
    else if (angle < 247.5) phaseName = 'Waning Gibbous';
    else if (angle < 292.5) phaseName = 'Last Quarter';
    else phaseName = 'Waning Crescent';

    // Layout constants
    const earthX = 150, earthY = 220;
    const moonOrbitR = 90;
    const sunX = 150, sunY = 40;
    const moonR = 14;

    // Moon position on orbit around Earth
    // angle=0° → toward Sun (top) = New Moon
    // angle=180° → away from Sun (bottom) = Full Moon
    const moonX = earthX + moonOrbitR * Math.sin(angleRad);
    const moonY = earthY - moonOrbitR * Math.cos(angleRad);

    // Angle arc (small arc at Earth between Sun direction and Moon direction)
    const arcR = 40;
    const arcStartX = earthX; // Sun direction = straight up
    const arcStartY = earthY - arcR;
    const arcEndX = earthX + arcR * Math.sin(angleRad);
    const arcEndY = earthY - arcR * Math.cos(angleRad);
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Label position for angle text (midpoint of arc)
    const labelAngle = (angle / 2) * Math.PI / 180;
    const labelR = arcR + 14;
    const labelX = earthX + labelR * Math.sin(labelAngle);
    const labelY = earthY - labelR * Math.cos(labelAngle);

    return `
    <div class="flex flex-col items-center">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Sun-Moon Angle: ${Math.round(angle)}°</h3>
        <p class="text-sm text-gray-600 mb-6">${phaseName} • ${Math.round(illumination * 100)}% illuminated</p>

        <svg class="w-full max-w-sm" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
            <!-- Sun at top (fixed, outside Moon's orbit) -->
            <g transform="translate(${sunX}, ${sunY})">
                <circle cx="0" cy="0" r="28" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
                <circle cx="0" cy="0" r="22" fill="#fef08a" opacity="0.8"/>
                <!-- Sun rays -->
                ${[0, 45, 90, 135, 180, 225, 270, 315].map(rayAngle => {
                    const rayRad = rayAngle * Math.PI / 180;
                    const x1 = Math.cos(rayRad) * 30;
                    const y1 = Math.sin(rayRad) * 30;
                    const x2 = Math.cos(rayRad) * 38;
                    const y2 = Math.sin(rayRad) * 38;
                    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fbbf24" stroke-width="2.5"/>`;
                }).join('')}
                <text x="0" y="56" text-anchor="middle" font-size="11" fill="#4b5563" font-weight="500">Sun</text>
            </g>

            <!-- Dashed line from Earth toward Sun (shows Sun direction) -->
            <line x1="${earthX}" y1="${earthY - 20}" x2="${sunX}" y2="${sunY + 42}"
                  stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="4 4"/>

            <!-- Dashed line from Earth toward Moon (shows Moon direction) -->
            <line x1="${earthX}" y1="${earthY}" x2="${moonX}" y2="${moonY}"
                  stroke="#9333ea" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/>

            <!-- Moon orbital path around Earth -->
            <circle cx="${earthX}" cy="${earthY}" r="${moonOrbitR}"
                    fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="4 4"/>

            <!-- Angle arc at Earth -->
            ${angle > 0.5 ? `
                <path
                    d="M ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}"
                    fill="none" stroke="#9333ea" stroke-width="2"
                />
                <path
                    d="M ${earthX} ${earthY} L ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY} Z"
                    fill="rgba(147, 51, 234, 0.08)"
                />
                <text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="10" fill="#7c3aed" font-weight="600">
                    ${Math.round(angle)}°
                </text>
            ` : ''}

            <!-- Earth -->
            <circle cx="${earthX}" cy="${earthY}" r="16" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
            <circle cx="${earthX}" cy="${earthY}" r="12" fill="#93c5fd" opacity="0.7"/>
            <text x="${earthX}" y="${earthY + 28}" text-anchor="middle" font-size="11" fill="#4b5563" font-weight="500">Earth</text>

            <!-- Moon with phase -->
            <g transform="translate(${moonX.toFixed(1)}, ${moonY.toFixed(1)})">
                <!-- Moon base (dark side) -->
                <circle cx="0" cy="0" r="${moonR}" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>

                <!-- Illuminated portion using terminator arc -->
                <!-- Dark half is always facing Sun, lit half faces away -->
                <!-- We draw the lit portion as a path combining a semicircle and an elliptical arc -->
                ${illumination > 0.01 ? `
                    <path d="${getMoonPhasePath(moonR, angle, illumination)}"
                          fill="#e2e8f0"/>
                ` : ''}

                <text x="0" y="${moonR + 16}" text-anchor="middle" font-size="11" fill="#4b5563" font-weight="500">Moon</text>
            </g>

            <!-- Direction arrow on orbit (small triangle showing orbital direction) -->
            <g transform="translate(${(earthX + moonOrbitR).toFixed(0)}, ${earthY}) rotate(90)">
                <polygon points="0,-4 6,0 0,4" fill="#9ca3af"/>
            </g>
        </svg>

        <div class="mt-6 max-w-md space-y-2 text-sm text-gray-600">
            <p class="text-center font-semibold">${phaseName}</p>
            <ul class="text-xs space-y-1">
                <li>• Each tithi represents 12° of angular separation between Sun and Moon</li>
                <li>• Moon completes 30 tithis (360°) in one lunar month (~29.5 days)</li>
                <li>• Moon phase shows illumination as seen from Earth</li>
                <li>• Diagram is schematic — Sun is much farther away than shown</li>
            </ul>
        </div>
    </div>
    `;
}

/**
 * Generate SVG path for moon phase (lit portion)
 * Uses two arcs: one semicircle edge + one elliptical terminator
 * @param {number} r - Moon radius
 * @param {number} angle - Sun-Moon elongation in degrees
 * @param {number} illumination - Fraction illuminated (0-1)
 * @returns {string} SVG path d attribute
 */
function getMoonPhasePath(r, angle, illumination) {
    // The lit side depends on phase:
    // Waxing (0-180°): lit on the right side (as seen from Earth in northern hemisphere)
    // Waning (180-360°): lit on the left side
    const isWaxing = angle < 180;

    // The terminator is the boundary between lit and dark.
    // It's an ellipse whose x-radius varies with illumination:
    // - At new/full moon, terminatorRx = r (full circle = semicircle matches edge)
    // - At quarters, terminatorRx = 0 (straight line)
    // The formula: terminatorRx = |cos(angle)| * r
    // But we need to know which way the terminator curves.
    const angleRad = angle * Math.PI / 180;
    const terminatorRx = Math.abs(Math.cos(angleRad)) * r;

    if (isWaxing) {
        // Lit on right side
        // Right semicircle arc (from top to bottom going right)
        // Then terminator arc back from bottom to top
        const sweepOuter = 1; // clockwise semicircle on right
        const sweepTerminator = illumination > 0.5 ? 1 : 0;

        return `M 0 ${-r}
                A ${r} ${r} 0 0 ${sweepOuter} 0 ${r}
                A ${terminatorRx} ${r} 0 0 ${sweepTerminator} 0 ${-r}`;
    } else {
        // Lit on left side
        // Left semicircle arc (from top to bottom going left)
        // Then terminator arc back from bottom to top
        const sweepOuter = 0; // counter-clockwise semicircle on left
        const sweepTerminator = illumination > 0.5 ? 0 : 1;

        return `M 0 ${-r}
                A ${r} ${r} 0 0 ${sweepOuter} 0 ${r}
                A ${terminatorRx} ${r} 0 0 ${sweepTerminator} 0 ${-r}`;
    }
}
