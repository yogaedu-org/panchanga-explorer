export function TimelineView(currentTime, panchanga) {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const dayProgress = (hour * 60 + minute) / (24 * 60);

    return `
    <div class="space-y-8">
        <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Solar Day (24 hours)</h3>
            <div class="relative h-12 bg-gradient-to-r from-gray-800 via-yellow-400 to-gray-800 rounded-lg">
                <div
                    class="absolute top-0 h-full w-1 bg-red-500"
                    style="left: ${dayProgress * 100}%"
                >
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-red-600">
                        Now
                    </div>
                </div>
                <div class="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs font-semibold">00:00</div>
                <div class="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-semibold">24:00</div>
            </div>
        </div>

        <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Current Tithi Progress</h3>
            <div class="relative h-12 bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700 rounded-lg">
                <div
                    class="absolute top-0 h-full w-1 bg-white"
                    style="left: ${panchanga.tithi.progress * 100}%"
                >
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-purple-700">
                        Now
                    </div>
                </div>
                <div class="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs font-semibold">Start</div>
                <div class="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-semibold">End</div>
            </div>
            <p class="text-sm text-gray-600 mt-2">
                ${panchanga.tithi.name} tithi • ${Math.round(panchanga.tithi.progress * 100)}% complete
            </p>
        </div>

        <div class="bg-purple-50 rounded-lg p-4">
            <h4 class="font-semibold text-gray-800 mb-2">Key Difference:</h4>
            <p class="text-sm text-gray-700">
                Notice how the tithi can begin and end at any time during a solar day.
                A single solar day (midnight to midnight) may contain parts of two different tithis,
                or sometimes an entire tithi might fit within one solar day. This is why festival
                dates "shift" on the Gregorian calendar from year to year.
            </p>
        </div>
    </div>
    `;
}
