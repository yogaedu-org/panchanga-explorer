import { ComparisonView } from './ComparisonView.js';
import { OrbitalView } from './OrbitalView.js';
import { TimelineView } from './TimelineView.js';
import { DebugView } from './DebugView.js';

export function MainApp(state, service) {
    const { currentTime, location } = state;

    // Format date/time without timezone conversion
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const tithi = service.getTithi(currentTime);
    const nakshatra = service.getNakshatra(currentTime);
    const masa = service.getMasa(currentTime);
    const debugData = service.getFullDebugData(currentTime);

    const activeView = state.activeView || 'comparison';

    let visualizationContent = '';
    if (activeView === 'comparison') {
        visualizationContent = ComparisonView(currentTime, { tithi, nakshatra, masa });
    } else if (activeView === 'orbital') {
        visualizationContent = OrbitalView({ tithi, nakshatra, masa });
    } else if (activeView === 'timeline') {
        visualizationContent = TimelineView(currentTime, { tithi, nakshatra, masa });
    } else if (activeView === 'debug') {
        visualizationContent = DebugView(debugData);
    }

    return `
    <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 p-8">
        <div class="max-w-6xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">Pañchāṅga - The Five Limbs of Time</h1>

                <!-- Input Controls -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3">Calculation Parameters</h3>

                    <!-- Location Controls -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">City</label>
                            <input
                                type="text"
                                id="cityInput"
                                value="${location.city}"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="City name"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Custom Name (optional)</label>
                            <input
                                type="text"
                                id="customNameInput"
                                value="${location.customName || ''}"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="Display name for this location"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
                            <input
                                type="text"
                                id="tzInput"
                                value="${location.tz}"
                                readonly
                                class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                                placeholder="e.g. Pacific/Honolulu"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                            <input
                                type="number"
                                id="latInput"
                                value="${location.lat}"
                                step="0.0001"
                                onchange="window.handleCoordinateChange()"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="Latitude"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                            <input
                                type="number"
                                id="lonInput"
                                value="${location.lon}"
                                step="0.0001"
                                onchange="window.handleCoordinateChange()"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="Longitude"
                            />
                        </div>
                    </div>

                    <!-- Date/Time Controls -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
                            <input
                                type="date"
                                id="dateInput"
                                value="${formatDate(currentTime)}"
                                onchange="window.handleDateTimeChange()"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Time</label>
                            <input
                                type="time"
                                id="timeInput"
                                step="1"
                                value="${formatTime(currentTime)}"
                                onchange="window.handleDateTimeChange()"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 flex-wrap items-center">
                        <!-- Calculate Button (leftmost) with date/time display -->
                        <button
                            onclick="window.updateDateTime(); window.updateLocation(); window.calculate();"
                            class="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded hover:from-orange-600 hover:to-purple-700 transition-all font-semibold shadow-md flex flex-col items-center gap-1"
                        >
                            <div class="flex items-center gap-2">
                                <i data-lucide="calculator" style="width: 16px; height: 16px;"></i>
                                Calculate Panchanga
                            </div>
                            <div class="text-xs font-normal opacity-90">
                                ${formatDate(currentTime)} ${formatTime(currentTime)}
                            </div>
                        </button>

                        <!-- RT Update Checkbox -->
                        <label class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors">
                            <input
                                type="checkbox"
                                id="rtUpdateCheckbox"
                                ${state.rtUpdate ? 'checked' : ''}
                                onchange="window.toggleRTUpdate()"
                                class="w-4 h-4 text-purple-600 cursor-pointer"
                            />
                            <span class="text-sm font-medium text-gray-700">RT Update</span>
                        </label>

                        <!-- Now Button -->
                        <button
                            onclick="window.setNow()"
                            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-center whitespace-nowrap"
                        >
                            Now ⏰
                        </button>

                        <!-- Decrement Buttons -->
                        <button
                            onclick="window.adjustTime('year', 'down')"
                            class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-mono text-sm"
                            title="Decrease Year"
                        >
                            Y&lt;
                        </button>
                        <button
                            onclick="window.adjustTime('day', 'down')"
                            class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-mono text-sm"
                            title="Decrease Day"
                        >
                            D&lt;
                        </button>
                        <button
                            onclick="window.adjustTime('hour', 'down')"
                            class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-mono text-sm"
                            title="Decrease Hour"
                        >
                            H&lt;
                        </button>
                        <button
                            onclick="window.adjustTime('minute', 'down')"
                            class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-mono text-sm"
                            title="Decrease Minute"
                        >
                            M&lt;
                        </button>
                        <button
                            onclick="window.adjustTime('second', 'down')"
                            class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-mono text-sm"
                            title="Decrease Second"
                        >
                            S&lt;
                        </button>

                        <!-- Increment Buttons -->
                        <button
                            onclick="window.adjustTime('year', 'up')"
                            class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-mono text-sm"
                            title="Increase Year"
                        >
                            Y&gt;
                        </button>
                        <button
                            onclick="window.adjustTime('day', 'up')"
                            class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-mono text-sm"
                            title="Increase Day"
                        >
                            D&gt;
                        </button>
                        <button
                            onclick="window.adjustTime('hour', 'up')"
                            class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-mono text-sm"
                            title="Increase Hour"
                        >
                            H&gt;
                        </button>
                        <button
                            onclick="window.adjustTime('minute', 'up')"
                            class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-mono text-sm"
                            title="Increase Minute"
                        >
                            M&gt;
                        </button>
                        <button
                            onclick="window.adjustTime('second', 'up')"
                            class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-mono text-sm"
                            title="Increase Second"
                        >
                            S&gt;
                        </button>

                        <!-- Increment Value Input -->
                        <div class="flex items-center gap-2">
                            <label class="text-xs font-medium text-gray-600">Increment:</label>
                            <input
                                type="number"
                                id="incrementValue"
                                value="1"
                                min="1"
                                class="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <!-- Current Values Display -->
                <div class="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div class="text-sm space-y-1">
                        <div class="flex items-center gap-2 text-gray-700">
                            <i data-lucide="map-pin" class="text-purple-600" style="width: 14px; height: 14px;"></i>
                            <strong>Location:</strong> ${location.customName || location.city} (${location.lat.toFixed(4)}°, ${location.lon.toFixed(4)}°)
                        </div>
                        <div class="flex items-center gap-2 text-gray-700">
                            <i data-lucide="globe" class="text-purple-600" style="width: 14px; height: 14px;"></i>
                            <strong>Timezone:</strong> ${location.tz}
                        </div>
                        <div class="flex items-center gap-2 text-gray-700">
                            <i data-lucide="clock" class="text-purple-600" style="width: 14px; height: 14px;"></i>
                            <strong>Date/Time:</strong> ${currentTime.toLocaleString('en-US', { timeZone: location.tz, dateStyle: 'full', timeStyle: 'medium' })}
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow-md p-4 border-t-4 border-purple-500">
                    <h3 class="text-sm font-semibold text-gray-600 mb-2">TITHI</h3>
                    <p class="text-2xl font-bold text-purple-700">${tithi.name}</p>
                    <p class="text-sm text-gray-600">${tithi.paksha} Pakṣa - ${tithi.number}/30</p>
                    <div class="mt-2 bg-gray-200 rounded-full h-2">
                        <div class="bg-purple-600 h-2 rounded-full transition-all" style="width: ${tithi.progress * 100}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${Math.round(tithi.progress * 100)}% complete</p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-4 border-t-4 border-blue-500">
                    <h3 class="text-sm font-semibold text-gray-600 mb-2">NAKSHATRA</h3>
                    <p class="text-2xl font-bold text-blue-700">${nakshatra.name}</p>
                    <p class="text-sm text-gray-600">${nakshatra.number}/27</p>
                    <div class="mt-2 bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${nakshatra.progress * 100}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${Math.round(nakshatra.progress * 100)}% complete</p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-4 border-t-4 border-orange-500">
                    <h3 class="text-sm font-semibold text-gray-600 mb-2">MASA</h3>
                    <p class="text-2xl font-bold text-orange-700">${masa.name}</p>
                    <p class="text-sm text-gray-600 mt-4">Lunar Month</p>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">Visualization</h3>
                <div class="flex gap-2 flex-wrap">
                    <button
                        onclick="window.updateAppState({ activeView: 'comparison' })"
                        class="px-4 py-2 rounded ${activeView === 'comparison' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}"
                    >
                        Side-by-Side Comparison
                    </button>
                    <button
                        onclick="window.updateAppState({ activeView: 'orbital' })"
                        class="px-4 py-2 rounded ${activeView === 'orbital' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}"
                    >
                        Orbital View
                    </button>
                    <button
                        onclick="window.updateAppState({ activeView: 'timeline' })"
                        class="px-4 py-2 rounded ${activeView === 'timeline' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}"
                    >
                        Timeline View
                    </button>
                    <button
                        onclick="window.updateAppState({ activeView: 'debug' })"
                        class="px-4 py-2 rounded flex items-center gap-2 ${activeView === 'debug' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}"
                    >
                        <i data-lucide="bug" style="width: 16px; height: 16px;"></i>
                        Debug Data
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-6">
                ${visualizationContent}
            </div>
        </div>
    </div>
    `;
}

// Global function for location update
window.updateLocation = function() {
    const input = document.getElementById('locationInput');
    if (input && input.value.trim()) {
        window.updateAppState({
            location: {
                ...window.appState?.location,
                city: input.value.trim()
            }
        });
        input.value = '';
    }
};
