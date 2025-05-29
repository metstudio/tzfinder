// File: timezoneLookup.js (in your tzfinder package)
import * as turf from '@turf/turf';

// --- Define the default URL for your GeoJSON file ---
// Using jsDelivr pointing to your GitHub repo's master branch.
// For production stability, consider using a specific Git tag or commit hash instead of @master
// e.g., https://cdn.jsdelivr.net/gh/metstudio/tzfinder@v1.0.2/timezones.geojson (if v1.0.2 is a tag)
const DEFAULT_GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/metstudio/tzfinder@master/timezones.geojson';

export class TimezoneLookup {
    constructor() {
        this.timezoneFeatures = null;
        this.isReady = false;

        if (!turf || typeof turf.point !== 'function') {
            const errorMsg = "Turf.js module not loaded correctly.";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Initializes the module by fetching and parsing the GeoJSON data.
     * Must be called and awaited before getTimeOffsetAndName can be used.
     * @param {string} [geojsonUrl=DEFAULT_GEOJSON_URL] - The URL from where the timezones.geojson file can be fetched.
     * Defaults to the jsDelivr URL pointing to the package's GeoJSON.
     * @returns {Promise<void>}
     */
    async initialize(geojsonUrl = DEFAULT_GEOJSON_URL) {
        if (this.isReady) {
            console.log("TimezoneLookup is already initialized.");
            return;
        }
        if (!geojsonUrl || typeof geojsonUrl !== 'string') {
            this.isReady = false;
            const errorMsg = "TimezoneLookup: geojsonUrl parameter must be a valid string.";
            console.error(errorMsg, "Received:", geojsonUrl);
            throw new Error(errorMsg);
        }

        try {
            console.log(`TimezoneLookup: Fetching GeoJSON from ${geojsonUrl}`);
            const response = await fetch(geojsonUrl);
            if (!response.ok) {
                this.isReady = false;
                throw new Error(`Failed to fetch GeoJSON from ${geojsonUrl}: ${response.status} ${response.statusText}`);
            }
            const geojsonData = await response.json();

            if (!geojsonData || !geojsonData.features || !Array.isArray(geojsonData.features)) {
                this.isReady = false;
                throw new Error("Invalid GeoJSON data structure from fetched file.");
            }
            this.timezoneFeatures = geojsonData.features;
            this.isReady = true;
            console.log(`TimezoneLookup: Initialized with ${this.timezoneFeatures.length} features from ${geojsonUrl}.`);
        } catch (e) {
            this.isReady = false;
            console.error(`TimezoneLookup: Error initializing with GeoJSON from '${geojsonUrl}':`, e);
            throw e;
        }
    }

    /**
     * Finds the timezone name and UTC offset for the given geographic coordinates.
     * (Internal logic of this method remains the same)
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     * @returns {{name: string, offset: string}|null}
     */
    getTimeOffsetAndName(lat, lon) {
        if (!this.isReady || !this.timezoneFeatures) {
            console.error("TimezoneLookup: Not initialized. Call initialize() first.");
            return null;
        }
        if (typeof lat !== 'number' || isNaN(lat) || typeof lon !== 'number' || isNaN(lon)) {
            console.error("TimezoneLookup: Invalid latitude or longitude.");
            return null;
        }

        const point = turf.point([lon, lat]);

        for (const feature of this.timezoneFeatures) {
            if (feature.geometry && feature.properties) {
                try {
                    if (turf.booleanPointInPolygon(point, feature.geometry)) {
                        const props = feature.properties;
                        let offsetString = null;
                        let nameString = null;

                        // Determine offset
                        if (props.utc_format && typeof props.utc_format === 'string') offsetString = props.utc_format;
                        else if (props.time_zone && typeof props.time_zone === 'string') offsetString = props.time_zone;
                        else if (typeof props.zone === 'number' && !isNaN(props.zone)) {
                            const o = props.zone;
                            offsetString = `UTC${o<0?'-':'+'}${String(Math.floor(Math.abs(o))).padStart(2,'0')}:${String(Math.round((Math.abs(o)%1)*60)).padStart(2,'0')}`;
                        } else if (props.name && typeof props.name === 'string' && !props.name.toUpperCase().startsWith("UTC") && !isNaN(parseFloat(props.name))) {
                            const o = parseFloat(props.name);
                            offsetString = `UTC${o<0?'-':'+'}${String(Math.floor(Math.abs(o))).padStart(2,'0')}:${String(Math.round((Math.abs(o)%1)*60)).padStart(2,'0')}`;
                        }
                        
                        if (!offsetString) continue;

                        // Determine name
                        if (props.tz_name1st && typeof props.tz_name1st === 'string') nameString = props.tz_name1st;
                        else if (props.places && typeof props.places === 'string') nameString = props.places;
                        else if (props.name && typeof props.name === 'string') nameString = props.name;
                        else nameString = offsetString;
                        
                        return { name: nameString, offset: offsetString };
                    }
                } catch (e) {
                    console.error("TimezoneLookup: Error in pointInPolygon:", e);
                }
            }
        }
        return null;
    }
}