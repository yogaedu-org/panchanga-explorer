export function DebugView(debugData) {
    const copyToClipboard = () => {
        const text = JSON.stringify(debugData, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            alert('Debug data copied to clipboard!');
        });
    };

    return `
    <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Debug Calculation Data</h2>
            <button
                onclick="(${copyToClipboard})()"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Copy to Clipboard
            </button>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-blue-800 mb-2">ℹ Calculation Status</h3>
            <p class="text-sm text-blue-700 mb-2">Using <strong>astronomy-engine</strong> library for planetary positions.</p>
            <p class="text-xs text-blue-600">Source: ${debugData.calculationSource?.sun || 'astronomy-engine'}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">Timestamp & Ayanamsa</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Time:</strong> ${debugData.timestamp}</p>
                    <p><strong>Lahiri Ayanamsa:</strong> ${debugData.ayanamsa.toFixed(4)}°</p>
                    <p><strong>Source:</strong> ${debugData.calculationSource?.sun || 'unknown'}</p>
                </div>
            </div>

            <div class="bg-yellow-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">☉ Sun Position</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Tropical Long:</strong> ${debugData.sun.tropical.toFixed(4)}°</p>
                    <p><strong>Sidereal Long:</strong> ${debugData.sun.sidereal.toFixed(4)}°</p>
                    <p><strong>Rashi:</strong> ${debugData.sun.rashi + 1}</p>
                </div>
            </div>

            <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">☽ Moon Position</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Tropical Long:</strong> ${debugData.moon.tropical.toFixed(4)}°</p>
                    <p><strong>Sidereal Long:</strong> ${debugData.moon.sidereal.toFixed(4)}°</p>
                </div>
            </div>

            <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">Tithi Calculation</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Sun-Moon Angle:</strong> ${debugData.tithi.angle.toFixed(4)}°</p>
                    <p><strong>Tithi:</strong> ${debugData.tithi.name} (${debugData.tithi.number})</p>
                    <p><strong>Paksha:</strong> ${debugData.tithi.paksha}</p>
                    <p><strong>Complete:</strong> ${debugData.tithi.percentComplete}%</p>
                    <p><strong>Remaining:</strong> ${debugData.tithi.percentRemaining}%</p>
                </div>
            </div>

            <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">Nakshatra</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Name:</strong> ${debugData.nakshatra.name} (${debugData.nakshatra.number})</p>
                    <p><strong>Complete:</strong> ${debugData.nakshatra.percentComplete}%</p>
                    <p><strong>Remaining:</strong> ${debugData.nakshatra.percentRemaining}%</p>
                </div>
            </div>

            <div class="bg-orange-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">Masa (Lunar Month)</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Name:</strong> ${debugData.masa.name}</p>
                    <p><strong>Method:</strong> ${debugData.masa.calculationMethod || 'amanta'}</p>
                    ${debugData.masa.fullMoonDate ? `
                        <p><strong>Full Moon:</strong> ${new Date(debugData.masa.fullMoonDate).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                        <p><strong>FM Nakshatra:</strong> ${debugData.masa.fullMoonNakshatra} (#${debugData.masa.fullMoonNakshatraNumber})</p>
                        <p><strong>Prev New Moon:</strong> ${new Date(debugData.masa.prevNewMoon).toLocaleString('en-US', {month: 'short', day: 'numeric'})}</p>
                        <p><strong>Next New Moon:</strong> ${new Date(debugData.masa.nextNewMoon).toLocaleString('en-US', {month: 'short', day: 'numeric'})}</p>
                    ` : ''}
                    ${debugData.masa.sunRashi !== undefined ? `<p><strong>Sun's Rashi:</strong> ${debugData.masa.sunRashi + 1}</p>` : ''}
                    ${debugData.masa.error ? `<p class="text-red-600"><strong>Error:</strong> ${debugData.masa.error}</p>` : ''}
                </div>
            </div>
        </div>

        <div class="bg-gray-100 rounded-lg p-4 mt-6">
            <h3 class="font-semibold text-gray-800 mb-3">Full JSON Data</h3>
            <pre class="text-xs bg-white p-4 rounded overflow-auto max-h-96 border">${JSON.stringify(debugData, null, 2)}</pre>
        </div>
    </div>
    `;
}
