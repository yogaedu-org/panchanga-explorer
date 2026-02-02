export function OrbitalView(panchanga) {
    const angle = panchanga.tithi.angle;
    const angleRad = angle * Math.PI / 180;

    return `
    <div class="flex flex-col items-center">
        <h3 class="text-xl font-semibold text-gray-800 mb-6">Sun-Moon Angle: ${Math.round(angle)}°</h3>
        <div class="relative w-96 h-96">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <i data-lucide="sun" class="text-yellow-500" style="width: 48px; height: 48px;"></i>
            </div>

            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-gray-300 rounded-full"></div>

            <div
                class="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2"
                style="transform: translate(-50%, -50%) rotate(${angle}deg) translateX(128px)"
            >
                <i data-lucide="moon" class="text-blue-500" style="width: 32px; height: 32px;"></i>
            </div>

            <svg class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64" viewBox="0 0 256 256">
                <path
                    d="M 128 128 L 128 0 A 128 128 0 ${angle > 180 ? '1' : '0'} 1 ${128 + 128 * Math.sin(angleRad)} ${128 - 128 * Math.cos(angleRad)} Z"
                    fill="rgba(147, 51, 234, 0.2)"
                    stroke="rgb(147, 51, 234)"
                    stroke-width="2"
                />
            </svg>
        </div>
        <p class="text-sm text-gray-600 mt-6 text-center max-w-md">
            Each tithi represents 12° of angular separation between the Sun and Moon.
            The Moon completes 30 tithis (360°) in one lunar month.
        </p>
    </div>
    `;
}
