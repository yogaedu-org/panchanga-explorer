import { VedicCalendarService } from './services/VedicCalendarService.js';
import { EducationalOverview } from './components/EducationalOverview.js';
import { MainApp } from './components/MainAppSplit.js';
import { DebugView } from './components/DebugView.js';

// Initialize application state
const appState = {
    showOverview: false,  // Start with calculator (not educational overview)
    activeTab: 'calculator',  // calculator | learn | debug
    currentTime: new Date(),
    rtUpdate: false,  // Real-time update mode
    location: {
        city: 'Honolulu',
        customName: '',  // Optional custom display name
        lat: 21.3099,
        lon: -157.8581,
        tz: 'Pacific/Honolulu'
    },
    // Timeline zoom settings
    timelineZoom: 1.00,  // Number of units to show
    timelineUnit: 'day'  // 'year' | 'month' | 'day' | 'hour' | 'min'
};

const service = new VedicCalendarService();

function render() {
    const app = document.getElementById('app');

    // Create tabbed interface
    const tabbedUI = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
            <!-- Tab Headers -->
            <div class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex gap-1 justify-between items-center">
                        <div class="flex gap-1">
                            <button
                                onclick="window.switchTab('calculator')"
                                class="px-6 py-2 font-semibold transition-all ${appState.activeTab === 'calculator' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
                            >
                                📊 Calculator
                            </button>
                            <button
                                onclick="window.switchTab('learn')"
                                class="px-6 py-2 font-semibold transition-all ${appState.activeTab === 'learn' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
                            >
                                📚 Learn More
                            </button>
                            <button
                                onclick="window.switchTab('debug')"
                                class="px-6 py-2 font-semibold transition-all ${appState.activeTab === 'debug' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
                            >
                                🐛 Debug Data
                            </button>
                        </div>
                        <div class="text-sm font-semibold text-gray-600 py-2">Pañchāṅga Explorer</div>
                    </div>
                </div>
            </div>

            <!-- Tab Content -->
            <div id="tabContent"></div>
        </div>
    `;

    app.innerHTML = tabbedUI;

    // Render active tab content
    const tabContent = document.getElementById('tabContent');
    if (appState.activeTab === 'learn') {
        tabContent.innerHTML = EducationalOverview(() => {
            appState.activeTab = 'calculator';
            render();
        });
    } else if (appState.activeTab === 'debug') {
        const debugData = service.getFullDebugData(appState.currentTime);
        tabContent.innerHTML = DebugView(debugData);
    } else {
        tabContent.innerHTML = MainApp(appState, service);
    }

    // Initialize Lucide icons after render
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Switch between tabs
window.switchTab = (tab) => {
    appState.activeTab = tab;
    render();
};

// Initial render
render();

// Export for components to update state
window.updateAppState = (updates) => {
    Object.assign(appState, updates);
    render();
};

// Manual calculate function
window.calculate = () => {
    render();
};

// Toggle real-time update mode
window.toggleRTUpdate = () => {
    const checkbox = document.getElementById('rtUpdateCheckbox');
    appState.rtUpdate = checkbox ? checkbox.checked : false;
};

// Timeline zoom controls
window.adjustTimelineZoom = (direction) => {
    // Zoom value is always in days
    let baseIncrement;

    const unitToDays = {
        'year': 365,
        'month': 30,
        'day': 1,
        'hour': 1/24,
        'min': 1/1440
    };

    const unitSize = unitToDays[appState.timelineUnit];

    // When INCREMENTING (+): always use full unit size
    // When DECREMENTING (-): if zoom < unit size, use half to avoid going too small
    if (direction === 'in' && appState.timelineUnit !== 'min' && appState.timelineZoom < unitSize) {
        // Decrementing and zoom is less than unit size: use half
        baseIncrement = appState.timelineZoom / 2;
    } else {
        // Incrementing OR zoom >= unit size: use full unit size
        baseIncrement = unitSize;
    }

    const increment = direction === 'in' ? -baseIncrement : baseIncrement;
    const newZoom = Math.max(0.001, appState.timelineZoom + increment);
    appState.timelineZoom = Math.round(newZoom * 1000) / 1000;  // Round to 3 decimals
    render();
};

window.setTimelineZoom = (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
        appState.timelineZoom = Math.round(num * 1000) / 1000;  // Round to 3 decimals
        render();
    }
};

window.setTimelineUnit = (unit) => {
    // Just change the unit, don't change the zoom value
    // Zoom value always represents days
    appState.timelineUnit = unit;
    render();
};

// Set to current time
window.setNow = () => {
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    if (dateInput && timeInput) {
        const now = new Date();
        // Format without timezone conversion
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        dateInput.value = `${year}-${month}-${day}`;
        timeInput.value = `${hours}:${minutes}:${seconds}`;

        // Trigger calculation if RT Update is enabled
        if (appState.rtUpdate) {
            window.updateDateTime();
            window.updateLocation();
            window.calculate();
        }
    }
};

// Update location
window.updateLocation = () => {
    const cityInput = document.getElementById('cityInput');
    const customNameInput = document.getElementById('customNameInput');
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');
    const tzInput = document.getElementById('tzInput');

    if (cityInput) appState.location.city = cityInput.value.trim() || appState.location.city;
    if (customNameInput) appState.location.customName = customNameInput.value.trim();
    if (latInput) appState.location.lat = parseFloat(latInput.value) || appState.location.lat;
    if (lonInput) appState.location.lon = parseFloat(lonInput.value) || appState.location.lon;
    if (tzInput) appState.location.tz = tzInput.value.trim() || appState.location.tz;

    // Don't render here - let calculate() do it at the end
};

// Handle coordinate manual changes
window.handleCoordinateChange = () => {
    const customNameInput = document.getElementById('customNameInput');

    // If customName is empty, auto-populate with "(Manual entry)"
    if (customNameInput && !customNameInput.value.trim()) {
        customNameInput.value = '(Manual entry)';
    }
};

// Update date/time from inputs
window.updateDateTime = () => {
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');

    if (dateInput && timeInput) {
        // Time input now includes seconds (HH:MM:SS)
        const dateTimeString = `${dateInput.value}T${timeInput.value}`;
        appState.currentTime = new Date(dateTimeString);
        // Don't render here - let calculate() do it at the end
    }
};

// Handle manual date/time input changes
window.handleDateTimeChange = () => {
    // Trigger calculation if RT Update is enabled
    if (appState.rtUpdate) {
        window.updateDateTime();
        window.updateLocation();
        window.calculate();
    }
};

// Increment/decrement time by specified amount
window.adjustTime = (unit, direction) => {
    const incrementInput = document.getElementById('incrementValue');
    const increment = incrementInput ? parseInt(incrementInput.value) || 1 : 1;
    const amount = direction === 'up' ? increment : -increment;

    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');

    if (dateInput && timeInput) {
        // Parse current input values (time includes seconds now)
        const dateTimeString = `${dateInput.value}T${timeInput.value}`;
        const currentDate = new Date(dateTimeString);

        // Adjust based on unit
        switch(unit) {
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() + amount);
                break;
            case 'day':
                currentDate.setDate(currentDate.getDate() + amount);
                break;
            case 'hour':
                currentDate.setHours(currentDate.getHours() + amount);
                break;
            case 'minute':
                currentDate.setMinutes(currentDate.getMinutes() + amount);
                break;
            case 'second':
                currentDate.setSeconds(currentDate.getSeconds() + amount);
                break;
        }

        // Update input fields with new values (no timezone conversion)
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        dateInput.value = `${year}-${month}-${day}`;
        timeInput.value = `${hours}:${minutes}:${seconds}`;

        // Trigger calculation if RT Update is enabled
        if (appState.rtUpdate) {
            window.updateDateTime();
            window.updateLocation();
            window.calculate();
        }
    }
};
