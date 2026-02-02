export function EducationalOverview(onSkip) {
    return `
    <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
                Understanding Time: Three Calendar Systems
            </h1>

            <div class="space-y-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div class="flex items-start gap-4">
                        <i data-lucide="sun" class="text-yellow-600 mt-1 flex-shrink-0" style="width: 32px; height: 32px;"></i>
                        <div>
                            <h2 class="text-2xl font-semibold text-gray-800 mb-3">Solar Days</h2>
                            <p class="text-gray-700 mb-2">
                                Based on the Sun's apparent movement across the sky. One solar day = one rotation of Earth (24 hours).
                                This is what most modern calendars use - the Gregorian calendar divides the solar year into 12 months of varying lengths.
                            </p>
                            <p class="text-gray-600 italic">Fixed duration, tied to Earth's rotation.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div class="flex items-start gap-4">
                        <i data-lucide="moon" class="text-blue-600 mt-1 flex-shrink-0" style="width: 32px; height: 32px;"></i>
                        <div>
                            <h2 class="text-2xl font-semibold text-gray-800 mb-3">Lunar Days</h2>
                            <p class="text-gray-700 mb-2">
                                Based on the Moon's phases. One lunar month = new moon to new moon (~29.5 solar days).
                                Islamic and some East Asian calendars are purely lunar, causing their months to drift through the seasons.
                            </p>
                            <p class="text-gray-600 italic">Tied to Moon's orbit, ~29.5 day cycles.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div class="flex items-start gap-4">
                        <i data-lucide="calendar" class="text-purple-600 mt-1 flex-shrink-0" style="width: 32px; height: 32px;"></i>
                        <div>
                            <h2 class="text-2xl font-semibold text-gray-800 mb-3">Tithi (Lunar Phase Units)</h2>
                            <p class="text-gray-700 mb-2">
                                The angle between Sun and Moon, divided into 30 parts (tithis). Each tithi = 12° of relative motion.
                                Since the Moon's orbital speed varies, tithis have variable duration (19-26 hours). A tithi can begin and end at any time of day or night.
                            </p>
                            <p class="text-gray-600 italic">Variable duration based on Sun-Moon geometry, not Earth's rotation.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-r from-orange-100 to-purple-100 rounded-lg p-6 mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-3">Why Does This Matter?</h3>
                <div class="space-y-2 text-gray-700">
                    <p><strong>• Festivals & Holy Days:</strong> Most Hindu festivals are timed to specific tithis (Ekādaśī, Pūrṇimā, Amāvāsyā), not solar dates. This is why they "move" on the Gregorian calendar.</p>
                    <p><strong>• Spiritual Practice (Sādhanā):</strong> Certain tithis and nakshatras are considered auspicious or powerful for specific practices. Practitioners need to know when these occur in their local time.</p>
                    <p><strong>• Astronomical Precision:</strong> The tithi system reflects actual celestial mechanics rather than arbitrary time divisions, connecting spiritual practice to cosmic rhythms.</p>
                </div>
            </div>

            <button
                onclick="window.switchTab('calculator')"
                class="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                Try the Calculator
                <i data-lucide="chevron-right" style="width: 24px; height: 24px;"></i>
            </button>
        </div>
    </div>
    `;
}
