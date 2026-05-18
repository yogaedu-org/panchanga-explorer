/**
 * Simple performance profiler for measuring calculation and rendering times.
 *
 * Usage:
 *   import { Profiler } from './utils/Profiler.js';
 *
 *   Profiler.start('tithi-calc');
 *   // ... do work
 *   Profiler.end('tithi-calc');
 *
 *   // Get summary
 *   Profiler.summary();
 *
 * Enable/disable via:
 *   Profiler.enabled = true/false;
 */

export const Profiler = {
    enabled: true,
    timings: {},
    history: {},

    /**
     * Start timing a labeled operation
     * @param {string} label - Unique identifier for this timing
     */
    start(label) {
        if (!this.enabled) return;
        this.timings[label] = performance.now();
    },

    /**
     * End timing and record the duration
     * @param {string} label - Must match a previous start() call
     * @returns {number} Duration in milliseconds
     */
    end(label) {
        if (!this.enabled) return 0;

        const startTime = this.timings[label];
        if (startTime === undefined) {
            console.warn(`Profiler: No start time for "${label}"`);
            return 0;
        }

        const duration = performance.now() - startTime;
        delete this.timings[label];

        // Record in history
        if (!this.history[label]) {
            this.history[label] = {
                count: 0,
                total: 0,
                min: Infinity,
                max: -Infinity,
                recent: []
            };
        }

        const h = this.history[label];
        h.count++;
        h.total += duration;
        h.min = Math.min(h.min, duration);
        h.max = Math.max(h.max, duration);
        h.recent.push(duration);

        // Keep only last 100 measurements
        if (h.recent.length > 100) {
            h.recent.shift();
        }

        return duration;
    },

    /**
     * Time a function execution
     * @param {string} label - Label for this timing
     * @param {Function} fn - Function to execute
     * @returns {*} Return value of fn
     */
    time(label, fn) {
        this.start(label);
        const result = fn();
        this.end(label);
        return result;
    },

    /**
     * Time an async function execution
     * @param {string} label - Label for this timing
     * @param {Function} fn - Async function to execute
     * @returns {Promise<*>} Return value of fn
     */
    async timeAsync(label, fn) {
        this.start(label);
        const result = await fn();
        this.end(label);
        return result;
    },

    /**
     * Get average duration for a label
     * @param {string} label
     * @returns {number} Average in ms
     */
    average(label) {
        const h = this.history[label];
        if (!h || h.count === 0) return 0;
        return h.total / h.count;
    },

    /**
     * Log a summary of all timings to console
     */
    summary() {
        if (Object.keys(this.history).length === 0) {
            console.log('Profiler: No timings recorded');
            return;
        }

        console.log('\n=== PROFILER SUMMARY ===');
        console.table(
            Object.entries(this.history).map(([label, h]) => ({
                Label: label,
                Count: h.count,
                'Avg (ms)': (h.total / h.count).toFixed(2),
                'Min (ms)': h.min.toFixed(2),
                'Max (ms)': h.max.toFixed(2),
                'Total (ms)': h.total.toFixed(2)
            }))
        );
        console.log('========================\n');
    },

    /**
     * Get summary as object (for debug view)
     * @returns {Object}
     */
    getSummaryData() {
        return Object.entries(this.history).map(([label, h]) => ({
            label,
            count: h.count,
            avg: h.total / h.count,
            min: h.min,
            max: h.max,
            total: h.total,
            recent: h.recent.slice(-10) // Last 10 measurements
        }));
    },

    /**
     * Clear all history
     */
    reset() {
        this.timings = {};
        this.history = {};
    },

    /**
     * Mark a point in the browser's performance timeline
     * (visible in DevTools Performance tab)
     * @param {string} name
     */
    mark(name) {
        if (!this.enabled) return;
        performance.mark(`panchanga-${name}`);
    },

    /**
     * Measure between two marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name
     */
    measure(name, startMark, endMark) {
        if (!this.enabled) return;
        try {
            performance.measure(
                `panchanga-${name}`,
                `panchanga-${startMark}`,
                `panchanga-${endMark}`
            );
        } catch (e) {
            console.warn(`Profiler.measure failed: ${e.message}`);
        }
    }
};

// Make globally available for console debugging
if (typeof window !== 'undefined') {
    window.Profiler = Profiler;
}
