export function ComparisonView(currentTime, panchanga) {
    const solarDay = currentTime.getDate();
    // Calculate days in current month
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calculate lunar day within the ~29.53 day cycle
    const lunarCycleLength = 29.53;
    const lunarDay = Math.round((currentTime.getTime() / (1000 * 60 * 60 * 24 * lunarCycleLength)) * lunarCycleLength) % lunarCycleLength;
    const lunarDayDisplay = lunarDay === 0 ? lunarCycleLength : lunarDay.toFixed(1);

    return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
            <div class="flex justify-center mb-4">
                <i data-lucide="sun" class="text-yellow-500" style="width: 64px; height: 64px;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Solar Day</h3>
            <div class="text-4xl font-bold text-yellow-600 mb-2">${solarDay}/${daysInMonth}</div>
            <p class="text-sm text-gray-600">Day of month</p>
            <p class="text-xs text-gray-500 mt-2">Fixed 24-hour period</p>
            <p class="text-xs text-gray-500">Midnight to midnight</p>
        </div>

        <div class="text-center">
            <div class="flex justify-center mb-4">
                <i data-lucide="moon" class="text-blue-500" style="width: 64px; height: 64px;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Lunar Day</h3>
            <div class="text-4xl font-bold text-blue-600 mb-2">${lunarDayDisplay}/29.5</div>
            <p class="text-sm text-gray-600">Day in lunar cycle</p>
            <p class="text-xs text-gray-500 mt-2">Synodic month cycle</p>
            <p class="text-xs text-gray-500">New moon to new moon</p>
        </div>

        <div class="text-center">
            <div class="flex justify-center mb-4">
                <i data-lucide="calendar" class="text-purple-500" style="width: 64px; height: 64px;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Tithi</h3>
            <div class="text-4xl font-bold text-purple-600 mb-2">${panchanga.tithi.number}/30</div>
            <p class="text-sm text-gray-600">${panchanga.tithi.name}</p>
            <p class="text-xs text-gray-500 mt-2">Variable duration</p>
            <p class="text-xs text-gray-500">19-26 hours typically</p>
        </div>
    </div>
    `;
}
