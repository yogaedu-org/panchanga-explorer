import { ComparisonView } from './ComparisonView.js';
import { OrbitalView } from './OrbitalView.js';
import { TimelineView } from './TimelineView.js';

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

    const activeView = state.activeView || 'comparison';

    let visualizationContent = '';
    if (activeView === 'comparison') {
        visualizationContent = ComparisonView(currentTime, { tithi, nakshatra, masa });
    } else if (activeView === 'orbital') {
        visualizationContent = OrbitalView({ tithi, nakshatra, masa });
    } else if (activeView === 'timeline') {
        visualizationContent = TimelineView(currentTime, { tithi, nakshatra, masa }, service, state.timelineZoom, state.timelineUnit);
    }

    return `
    <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 p-4">
        <!-- TOP ROW: Input Fields -->
        <div class="bg-white rounded-lg shadow-lg p-3 mb-3">
            <div class="grid grid-cols-1 lg:grid-cols-7 gap-3">
                <!-- City -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <input
                        type="text"
                        id="cityInput"
                        value="${location.city}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                        placeholder="City"
                    />
                </div>
                <!-- Custom Name -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Custom Name</label>
                    <input
                        type="text"
                        id="customNameInput"
                        value="${location.customName || ''}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                        placeholder="Optional"
                    />
                </div>
                <!-- Latitude -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                    <input
                        type="number"
                        id="latInput"
                        value="${location.lat}"
                        step="0.0001"
                        onchange="window.handleCoordinateChange()"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    />
                </div>
                <!-- Longitude -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                    <input
                        type="number"
                        id="lonInput"
                        value="${location.lon}"
                        step="0.0001"
                        onchange="window.handleCoordinateChange()"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    />
                </div>
                <!-- Timezone -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
                    <input
                        type="text"
                        id="tzInput"
                        value="${location.tz}"
                        readonly
                        class="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
                    />
                </div>
                <!-- Date -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
                    <input
                        type="date"
                        id="dateInput"
                        value="${formatDate(currentTime)}"
                        onchange="window.handleDateTimeChange()"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    />
                </div>
                <!-- Time -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Time</label>
                    <input
                        type="time"
                        id="timeInput"
                        step="1"
                        value="${formatTime(currentTime)}"
                        onchange="window.handleDateTimeChange()"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    />
                </div>
            </div>
        </div>

        <!-- SECOND ROW: Control Buttons -->
        <div class="bg-white rounded-lg shadow-lg p-3 mb-3">
            <div class="flex flex-wrap items-center gap-2">
                <!-- Calculate Button -->
                <button
                    onclick="window.updateDateTime(); window.updateLocation(); window.calculate();"
                    class="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded hover:from-orange-600 hover:to-purple-700 transition-all font-semibold shadow-md text-sm"
                >
                    <div class="flex flex-col items-center gap-0.5">
                        <span>Calculate</span>
                        <span class="text-xs opacity-90">${formatDate(currentTime)} ${formatTime(currentTime)}</span>
                    </div>
                </button>

                <!-- Now Button -->
                <button
                    onclick="window.setNow()"
                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                    Now ⏰
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

                <!-- Time Navigation Buttons - Decrease -->
                <div class="flex gap-1">
                    <button onclick="window.adjustTime('year', 'down')" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" title="Decrease Year">Y&lt;</button>
                    <button onclick="window.adjustTime('day', 'down')" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" title="Decrease Day">D&lt;</button>
                    <button onclick="window.adjustTime('hour', 'down')" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" title="Decrease Hour">H&lt;</button>
                    <button onclick="window.adjustTime('minute', 'down')" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" title="Decrease Minute">M&lt;</button>
                    <button onclick="window.adjustTime('second', 'down')" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" title="Decrease Second">S&lt;</button>
                </div>

                <!-- Time Navigation Buttons - Increase -->
                <div class="flex gap-1">
                    <button onclick="window.adjustTime('year', 'up')" class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" title="Increase Year">Y&gt;</button>
                    <button onclick="window.adjustTime('day', 'up')" class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" title="Increase Day">D&gt;</button>
                    <button onclick="window.adjustTime('hour', 'up')" class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" title="Increase Hour">H&gt;</button>
                    <button onclick="window.adjustTime('minute', 'up')" class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" title="Increase Minute">M&gt;</button>
                    <button onclick="window.adjustTime('second', 'up')" class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" title="Increase Second">S&gt;</button>
                </div>

                <!-- Increment Value -->
                <input
                    type="number"
                    id="incrementValue"
                    value="1"
                    min="1"
                    class="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <!-- Location Display -->
                <div class="bg-purple-50 rounded px-3 py-1 border border-purple-200 ml-auto">
                    <div class="text-xs flex items-center gap-2 text-gray-700">
                        <div class="flex items-center gap-1">
                            <i data-lucide="map-pin" class="text-purple-600" style="width: 12px; height: 12px;"></i>
                            <strong>${location.customName || location.city}</strong> (${location.lat.toFixed(4)}°, ${location.lon.toFixed(4)}°)
                        </div>
                        <div class="flex items-center gap-1">
                            <i data-lucide="globe" class="text-purple-600" style="width: 12px; height: 12px;"></i>
                            ${location.tz}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTTOM SECTION: Split View -->
        <div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-3">
            <!-- LEFT PANEL: Visualization Selector + Panchanga Cards -->
            <div class="flex flex-col gap-3">
                <!-- Visualization Selector -->
                <div class="bg-white rounded-lg shadow-md p-3">
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">Visualization</h3>
                    <div class="flex flex-col gap-2">
                        <button
                            onclick="window.updateAppState({ activeView: 'comparison' })"
                            class="px-3 py-2 rounded text-sm ${activeView === 'comparison' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        >
                            Side-by-Side Comparison
                        </button>
                        <button
                            onclick="window.updateAppState({ activeView: 'orbital' })"
                            class="px-3 py-2 rounded text-sm ${activeView === 'orbital' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        >
                            Orbital View
                        </button>
                        <button
                            onclick="window.updateAppState({ activeView: 'timeline' })"
                            class="px-3 py-2 rounded text-sm ${activeView === 'timeline' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        >
                            Timeline View
                        </button>
                    </div>
                </div>

                <!-- Panchanga Values Cards -->
                <div class="bg-white rounded-lg shadow-md p-3 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xs font-semibold text-gray-600">TITHI</h3>
                        <p class="text-lg font-bold text-purple-700">${tithi.name}</p>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>${tithi.paksha} Pakṣa - ${tithi.number}/30</span>
                        <span class="text-gray-500">${Math.round(tithi.progress * 100)}%</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-2">
                        <div class="bg-purple-600 h-2 rounded-full transition-all" style="width: ${tithi.progress * 100}%"></div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-3 border-l-4 border-blue-500">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xs font-semibold text-gray-600">NAKSHATRA</h3>
                        <p class="text-lg font-bold text-blue-700">${nakshatra.name}</p>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>${nakshatra.number}/27</span>
                        <span class="text-gray-500">${Math.round(nakshatra.progress * 100)}%</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${nakshatra.progress * 100}%"></div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-3 border-l-4 border-orange-500">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xs font-semibold text-gray-600">MASA</h3>
                        <p class="text-lg font-bold text-orange-700">${masa.name}</p>
                    </div>
                    <div class="flex items-center justify-end text-xs text-gray-600 mt-1">
                        <span>Lunar Month</span>
                    </div>
                </div>
            </div>

            <!-- RIGHT PANEL: Visualization -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                ${visualizationContent}
            </div>
        </div>
    </div>
    `;
}
