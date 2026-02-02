/**
 * VedicCalendarService
 *
 * Core astronomical calculations for Vedic calendar system.
 * Uses astronomy-engine library for accurate planetary positions.
 */

export class VedicCalendarService {
    constructor() {
        this.LAHIRI_AYANAMSA_2000 = 23.8506;
        this.AYANAMSA_RATE_PER_YEAR = 0.0139713;
    }

    getAyanamsa(date) {
        const J2000 = new Date('2000-01-01T12:00:00Z');
        const daysSinceJ2000 = (date - J2000) / (1000 * 60 * 60 * 24);
        const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
        return this.LAHIRI_AYANAMSA_2000 + (this.AYANAMSA_RATE_PER_YEAR * yearsSinceJ2000);
    }

    getSunLongitude(date) {
        try {
            const ecliptic = Astronomy.Ecliptic(Astronomy.SunPosition(date));
            const tropicalLong = ecliptic.elon;
            const ayanamsa = this.getAyanamsa(date);
            const sidereal = (tropicalLong - ayanamsa + 360) % 360;

            return {
                tropical: tropicalLong,
                sidereal: sidereal,
                ayanamsa: ayanamsa,
                source: 'astronomy-engine'
            };
        } catch (e) {
            console.error('Astronomy error:', e);
            return this.fallbackSunLongitude(date);
        }
    }

    getMoonLongitude(date) {
        try {
            const geoMoon = Astronomy.GeoMoon(date);
            const ecliptic = Astronomy.Ecliptic(geoMoon);
            const tropicalLong = ecliptic.elon;
            const ayanamsa = this.getAyanamsa(date);
            const sidereal = (tropicalLong - ayanamsa + 360) % 360;

            return {
                tropical: tropicalLong,
                sidereal: sidereal,
                source: 'astronomy-engine'
            };
        } catch (e) {
            console.error('Astronomy error:', e);
            return this.fallbackMoonLongitude(date);
        }
    }

    fallbackSunLongitude(date) {
        const J2000 = new Date('2000-01-01T12:00:00Z');
        const days = (date - J2000) / 86400000;
        const L = (280.460 + 0.9856474 * days) % 360;
        const g = ((357.528 + 0.9856003 * days) % 360) * Math.PI / 180;
        const lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
        const ayanamsa = this.getAyanamsa(date);
        return {
            tropical: lambda,
            sidereal: (lambda - ayanamsa + 360) % 360,
            ayanamsa: ayanamsa,
            source: 'fallback'
        };
    }

    fallbackMoonLongitude(date) {
        const J2000 = new Date('2000-01-01T12:00:00Z');
        const days = (date - J2000) / 86400000;
        const L = (218.316 + 13.176396 * days) % 360;
        const M = ((134.963 + 13.064993 * days) % 360) * Math.PI / 180;
        const Ms = ((357.529 + 0.985600 * days) % 360) * Math.PI / 180;
        const D = ((297.850 + 12.190749 * days) % 360) * Math.PI / 180;

        const lambda = L +
            6.289 * Math.sin(M) +
            1.274 * Math.sin(2*D - M) +
            0.658 * Math.sin(2*D) +
            0.214 * Math.sin(2*M) +
            -0.186 * Math.sin(Ms);

        const ayanamsa = this.getAyanamsa(date);
        return {
            tropical: lambda,
            sidereal: (lambda - ayanamsa + 360) % 360,
            source: 'fallback'
        };
    }

    getTithi(date) {
        const sun = this.getSunLongitude(date);
        const moon = this.getMoonLongitude(date);
        const angle = (moon.sidereal - sun.sidereal + 360) % 360;

        const tithiNumber = Math.floor(angle / 12) + 1;
        const tithiProgress = (angle % 12) / 12;
        const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
        const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;

        const tithiNames = [
            'Pratipad', 'Dvitīyā', 'Tritīyā', 'Chaturthī', 'Pañchamī',
            'Ṣaṣṭhī', 'Saptamī', 'Aṣṭamī', 'Navamī', 'Daśamī',
            'Ekādaśī', 'Dvādaśī', 'Trayodaśī', 'Chaturdaśī', 'Pūrṇimā/Amāvāsyā'
        ];

        return {
            number: tithiNumber,
            paksha,
            name: tithiNames[tithiInPaksha - 1],
            progress: tithiProgress,
            angle
        };
    }

    getNakshatra(date) {
        const moon = this.getMoonLongitude(date);
        const nakshatraNumber = Math.floor(moon.sidereal / 13.333333) + 1;
        const nakshatraProgress = (moon.sidereal % 13.333333) / 13.333333;

        const nakshatraNames = [
            'Aśvinī', 'Bharaṇī', 'Kṛttikā', 'Rohiṇī', 'Mṛgaśīrṣa', 'Ārdrā',
            'Punarvasu', 'Puṣya', 'Āśleṣā', 'Maghā', 'Pūrva Phālgunī', 'Uttara Phālgunī',
            'Hasta', 'Chitrā', 'Svātī', 'Viśākhā', 'Anurādhā', 'Jyeṣṭhā',
            'Mūla', 'Pūrva Āṣāḍhā', 'Uttara Āṣāḍhā', 'Śravaṇa', 'Dhaniṣṭhā', 'Śatabhiṣā',
            'Pūrva Bhādrapadā', 'Uttara Bhādrapadā', 'Revatī'
        ];

        return {
            number: nakshatraNumber,
            name: nakshatraNames[nakshatraNumber - 1],
            progress: nakshatraProgress,
            moonLong: moon.sidereal
        };
    }

    /**
     * Find sun-moon elongation (angular separation)
     * Returns value between 0 and 360 degrees
     */
    getSunMoonElongation(date) {
        const sun = this.getSunLongitude(date);
        const moon = this.getMoonLongitude(date);
        return (moon.sidereal - sun.sidereal + 360) % 360;
    }

    /**
     * Find new moon (amavasya) before given date
     * Binary search for when sun-moon elongation ≈ 0°
     */
    findNewMoonBefore(date) {
        let searchDate = new Date(date);
        const elongation = this.getSunMoonElongation(searchDate);

        // If we're very close to new moon, search backwards
        if (elongation < 15 || elongation > 345) {
            searchDate = new Date(date.getTime() - 15 * 24 * 60 * 60 * 1000);
        }

        // Binary search backwards up to 32 days
        let low = new Date(searchDate.getTime() - 32 * 24 * 60 * 60 * 1000);
        let high = searchDate;

        // Find closest point to new moon (elongation ≈ 0° or 360°)
        while ((high - low) > 3600000) { // Within 1 hour
            const mid = new Date((low.getTime() + high.getTime()) / 2);
            const midElongation = this.getSunMoonElongation(mid);

            if (midElongation < 180) {
                high = mid;
            } else {
                low = mid;
            }
        }

        return new Date((low.getTime() + high.getTime()) / 2);
    }

    /**
     * Find new moon (amavasya) after given date
     */
    findNewMoonAfter(date) {
        let searchDate = new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000);
        const elongation = this.getSunMoonElongation(searchDate);

        // If we're past new moon, start search further ahead
        if (elongation > 15 && elongation < 345) {
            const daysToAdd = Math.floor((360 - elongation) / 12) + 1;
            searchDate = new Date(date.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        }

        // Binary search forward up to 32 days
        let low = searchDate;
        let high = new Date(searchDate.getTime() + 32 * 24 * 60 * 60 * 1000);

        while ((high - low) > 3600000) { // Within 1 hour
            const mid = new Date((low.getTime() + high.getTime()) / 2);
            const midElongation = this.getSunMoonElongation(mid);

            if (midElongation < 180) {
                high = mid;
            } else {
                low = mid;
            }
        }

        return new Date((low.getTime() + high.getTime()) / 2);
    }

    /**
     * Find full moon (purnima) between two dates
     * Binary search for when sun-moon elongation ≈ 180°
     */
    findFullMoonBetween(startDate, endDate) {
        let low = startDate;
        let high = endDate;

        while ((high - low) > 3600000) { // Within 1 hour
            const mid = new Date((low.getTime() + high.getTime()) / 2);
            const midElongation = this.getSunMoonElongation(mid);

            if (midElongation < 180) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return new Date((low.getTime() + high.getTime()) / 2);
    }

    /**
     * Map nakshatra number (at full moon) to masa name
     * Based on traditional Vedic calendar system
     */
    getMasaFromNakshatra(nakshatraNumber) {
        const nakshatraToMasa = {
            // Primary mappings from research
            1: 'Āśvina',        // Aśvinī
            3: 'Kārtika',       // Kṛttikā
            5: 'Mārgaśīrṣa',    // Mṛgaśīrṣa
            8: 'Pauṣa',         // Puṣya
            10: 'Māgha',        // Maghā
            11: 'Phālguna',     // Pūrva Phālgunī
            12: 'Phālguna',     // Uttara Phālgunī
            14: 'Chaitra',      // Chitrā
            16: 'Vaiśākha',     // Viśākhā
            18: 'Jyeṣṭha',      // Jyeṣṭhā
            20: 'Āṣāḍha',       // Pūrva Āṣāḍhā
            21: 'Āṣāḍha',       // Uttara Āṣāḍhā
            22: 'Śrāvaṇa',      // Śravaṇa
            25: 'Bhādrapada',   // Pūrva Bhādrapadā
            26: 'Bhādrapada',   // Uttara Bhādrapadā

            // Adjacent nakshatras (full moon near boundary)
            2: 'Āśvina',        // Bharaṇī
            4: 'Kārtika',       // Rohiṇī
            6: 'Mārgaśīrṣa',    // Ārdrā
            7: 'Mārgaśīrṣa',    // Punarvasu
            9: 'Māgha',         // Āśleṣā
            13: 'Chaitra',      // Hasta
            15: 'Vaiśākha',     // Svātī
            17: 'Jyeṣṭha',      // Anurādhā
            19: 'Āṣāḍha',       // Mūla
            23: 'Śrāvaṇa',      // Dhaniṣṭhā
            24: 'Bhādrapada',   // Śatabhiṣā
            27: 'Phālguna'      // Revatī
        };

        return nakshatraToMasa[nakshatraNumber] || 'Unknown';
    }

    /**
     * Get lunar month (masa) using proper amanta system
     * Month is named after nakshatra at full moon
     */
    getMasa(date) {
        try {
            // Find lunar month boundaries (new moon to new moon)
            const prevNewMoon = this.findNewMoonBefore(date);
            const nextNewMoon = this.findNewMoonAfter(date);

            // Find full moon between these boundaries
            const fullMoon = this.findFullMoonBetween(prevNewMoon, nextNewMoon);

            // Get nakshatra at full moon
            const nakshatraAtFullMoon = this.getNakshatra(fullMoon);

            // Map nakshatra to masa name
            const masaName = this.getMasaFromNakshatra(nakshatraAtFullMoon.number);

            return {
                name: masaName,
                fullMoonDate: fullMoon,
                fullMoonNakshatra: nakshatraAtFullMoon.name,
                fullMoonNakshatraNumber: nakshatraAtFullMoon.number,
                prevNewMoon: prevNewMoon,
                nextNewMoon: nextNewMoon
            };
        } catch (error) {
            console.error('Error calculating masa:', error);
            // Fallback to simple calculation
            const sun = this.getSunLongitude(date);
            const rashiNumber = Math.floor(sun.sidereal / 30);
            const masaNames = [
                'Chaitra', 'Vaiśākha', 'Jyeṣṭha', 'Āṣāḍha',
                'Śrāvaṇa', 'Bhādrapada', 'Āśvina', 'Kārtika',
                'Mārgaśīrṣa', 'Pauṣa', 'Māgha', 'Phālguna'
            ];
            return {
                name: masaNames[rashiNumber] + ' (fallback)',
                sunRashi: rashiNumber,
                error: error.message
            };
        }
    }

    getFullDebugData(date) {
        const sun = this.getSunLongitude(date);
        const moon = this.getMoonLongitude(date);
        const tithi = this.getTithi(date);
        const nakshatra = this.getNakshatra(date);
        const masa = this.getMasa(date);

        return {
            timestamp: date.toISOString(),
            ayanamsa: sun.ayanamsa,
            calculationSource: {
                sun: sun.source,
                moon: moon.source
            },
            sun: {
                tropical: sun.tropical,
                sidereal: sun.sidereal,
                rashi: Math.floor(sun.sidereal / 30),
                source: sun.source
            },
            moon: {
                tropical: moon.tropical,
                sidereal: moon.sidereal,
                source: moon.source
            },
            tithi: {
                number: tithi.number,
                name: tithi.name,
                paksha: tithi.paksha,
                angle: tithi.angle,
                progress: tithi.progress,
                percentComplete: (tithi.progress * 100).toFixed(2),
                percentRemaining: ((1 - tithi.progress) * 100).toFixed(2)
            },
            nakshatra: {
                number: nakshatra.number,
                name: nakshatra.name,
                progress: nakshatra.progress,
                percentComplete: (nakshatra.progress * 100).toFixed(2),
                percentRemaining: ((1 - nakshatra.progress) * 100).toFixed(2)
            },
            masa: {
                name: masa.name,
                fullMoonDate: masa.fullMoonDate?.toISOString(),
                fullMoonNakshatra: masa.fullMoonNakshatra,
                fullMoonNakshatraNumber: masa.fullMoonNakshatraNumber,
                prevNewMoon: masa.prevNewMoon?.toISOString(),
                nextNewMoon: masa.nextNewMoon?.toISOString(),
                calculationMethod: masa.error ? 'fallback (sun rashi)' : 'amanta (full moon nakshatra)',
                sunRashi: masa.sunRashi,
                error: masa.error
            }
        };
    }
}
