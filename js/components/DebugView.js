import { Profiler } from '../utils/Profiler.js';

export function DebugView(debugData) {
    // Store the JSON string for clipboard copy
    const jsonData = JSON.stringify(debugData, null, 2);

    // Get profiler data
    const profilerData = Profiler.getSummaryData();

    // Make reset profiler function available
    window.resetProfiler = function(button) {
        Profiler.reset();
        button.innerHTML = '✓ Reset!';
        button.className = 'px-3 py-1 bg-green-600 text-white rounded text-sm';
        setTimeout(() => {
            button.innerHTML = 'Reset';
            button.className = 'px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm';
        }, 1500);
    };

    // Make copy function available globally for this instance
    window.copyDebugData = function(button) {
        navigator.clipboard.writeText(jsonData).then(() => {
            // Save original button content
            const originalHTML = button.innerHTML;
            const originalClass = button.className;

            // Update button to show success
            button.innerHTML = '✓ Copied!';
            button.className = 'px-4 py-2 bg-green-600 text-white rounded';
            button.disabled = true;

            // Reset after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.className = originalClass;
                button.disabled = false;
            }, 2000);
        }).catch(err => {
            // Show error state
            button.innerHTML = '✗ Failed';
            button.className = 'px-4 py-2 bg-red-600 text-white rounded';
            setTimeout(() => {
                button.innerHTML = 'Copy to Clipboard';
                button.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700';
            }, 2000);
        });
    };

    return `
    <div class="space-y-4">
        <div class="mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Debug Calculation Data</h2>
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

        <!-- Performance Profiler Section -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-green-800">⏱ Performance Profiler</h3>
                <button
                    onclick="window.resetProfiler(this)"
                    class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                    Reset
                </button>
            </div>
            ${profilerData.length > 0 ? `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-green-300">
                                <th class="text-left py-2 px-2 font-semibold text-green-800">Function</th>
                                <th class="text-right py-2 px-2 font-semibold text-green-800">Count</th>
                                <th class="text-right py-2 px-2 font-semibold text-green-800">Avg (ms)</th>
                                <th class="text-right py-2 px-2 font-semibold text-green-800">Min (ms)</th>
                                <th class="text-right py-2 px-2 font-semibold text-green-800">Max (ms)</th>
                                <th class="text-right py-2 px-2 font-semibold text-green-800">Total (ms)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profilerData.map(item => `
                                <tr class="border-b border-green-100 hover:bg-green-100">
                                    <td class="py-2 px-2 font-mono text-xs">${item.label}</td>
                                    <td class="py-2 px-2 text-right">${item.count}</td>
                                    <td class="py-2 px-2 text-right ${item.avg > 50 ? 'text-red-600 font-bold' : item.avg > 10 ? 'text-orange-600' : 'text-green-700'}">${item.avg.toFixed(2)}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${item.min.toFixed(2)}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${item.max.toFixed(2)}</td>
                                    <td class="py-2 px-2 text-right font-semibold">${item.total.toFixed(1)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <p class="text-xs text-green-600 mt-2">
                    <strong>Color coding:</strong>
                    <span class="text-green-700">Green (&lt;10ms)</span> |
                    <span class="text-orange-600">Orange (10-50ms)</span> |
                    <span class="text-red-600">Red (&gt;50ms)</span>
                </p>
            ` : `
                <p class="text-sm text-green-700">No profiling data yet. Interact with the Timeline View (zoom in/out) to collect timing data.</p>
            `}
        </div>

        <div class="bg-gray-100 rounded-lg p-4 mt-6">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-gray-800">Full JSON Data</h3>
                <button
                    onclick="window.copyDebugData(this)"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                    Copy to Clipboard
                </button>
            </div>
            <pre class="text-xs bg-white p-4 rounded overflow-auto max-h-96 border">${JSON.stringify(debugData, null, 2)}</pre>
        </div>
    </div>
    `;
}
