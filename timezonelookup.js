// File: timezoneLookup.js
import * as turf from '@turf/turf';
import fs from 'node:fs/promises'; // For reading files in Node.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper to get the directory name in ES modules (equivalent to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TimezoneLookup {
    constructor() {
        this.timezoneFeatures = null;
        this.isReady = false;

        // Turf.js is now an NPM dependency, so this check might be less critical
        // as module resolution failure would typically prevent the script from running.
        if (!turf || typeof turf.point !== 'function') {
            const errorMsg = "Turf.js module not loaded correctly.";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Initializes the module by loading the bundled GeoJSON data.
     * Must be called and awaited before getTimeOffsetAndName can be used.
     * @param {string} geojsonFilename - The name of the GeoJSON file bundled with the package.
     * Defaults to 'timezones.geojson'.
     * @returns {Promise<void>}
     */
    async initialize(geojsonFilename = 'timezones.geojson') {
        if (this.isReady) {
            console.log("TimezoneLookup is already initialized.");
            return;
        }

        // Construct the absolute path to the GeoJSON file within the package
        const internalGeojsonPath = path.join(__dirname, geojsonFilename);

        try {
            const fileContent = await fs.readFile(internalGeojsonPath, 'utf-8');
            const geojsonData = JSON.parse(fileContent);

            if (!geojsonData || !geojsonData.features || !Array.isArray(geojsonData.features)) {
                this.isReady = false;
                throw new Error("Invalid GeoJSON data structure in the bundled file.");
            }
            this.timezoneFeatures = geojsonData.features;
            this.isReady = true;
            console.log(`TimezoneLookup: Initialized with ${this.timezoneFeatures.length} features from ${internalGeojsonPath}.`);
        } catch (e) {
            this.isReady = false;
            console.error(`TimezoneLookup: Error initializing with GeoJSON file '${internalGeojsonPath}':`, e);
            throw new Error(`Failed to load or parse bundled GeoJSON: ${e.message}`);
        }
    }

    /**
     * Finds the timezone name and UTC offset for the given coordinates.
     * Call after initialize() has completed.
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