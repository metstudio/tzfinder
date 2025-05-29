// File: timezoneLookup.js
import * as turf from 'https://esm.sh/@turf/turf@6'; // Imports Turf.js as an ES module

export class TimezoneLookup {
    constructor() {
        this.timezoneFeatures = null;
        this.isReady = false;

        if (!turf || typeof turf.point !== 'function') {
            const errorMsg = "Turf.js did not load correctly. The TimezoneLookup module cannot function.";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Initializes the module by fetching and parsing the GeoJSON data.
     * Must be called and awaited before getTimeOffsetAndName can be used.
     * @param {string} geojsonPath - Relative path to the GeoJSON file.
     * @returns {Promise<void>} A promise that resolves when data is loaded, or rejects on error.
     */
    async initialize(geojsonPath = './timezones.geojson') {
        if (this.isReady) {
            console.log("TimezoneLookup is already initialized.");
            return;
        }
        try {
            const response = await fetch(geojsonPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch GeoJSON from ${geojsonPath}: ${response.status} ${response.statusText}`);
            }
            const geojsonData = await response.json();

            if (!geojsonData || !geojsonData.features || !Array.isArray(geojsonData.features)) {
                this.isReady = false;
                throw new Error("Invalid GeoJSON data structure. Expected a FeatureCollection.");
            }
            this.timezoneFeatures = geojsonData.features;
            this.isReady = true;
            console.log(`TimezoneLookup: Successfully initialized with ${this.timezoneFeatures.length} features from ${geojsonPath}.`);
        } catch (e) {
            this.isReady = false;
            console.error("TimezoneLookup: Error during initialization:", e);
            throw e; // Re-throw the error to be caught by the caller
        }
    }

    /**
     * Finds the timezone name and UTC offset for the given coordinates.
     * Call after initialize() has completed.
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     * @returns {{name: string, offset: string}|null} An object with timezone name and offset string, or null if not found or not ready.
     */
    getTimeOffsetAndName(lat, lon) {
        if (!this.isReady || !this.timezoneFeatures) {
            console.error("TimezoneLookup: Not initialized or data not loaded. Call initialize() first.");
            return null;
        }
        if (typeof lat !== 'number' || isNaN(lat) || typeof lon !== 'number' || isNaN(lon)) {
            console.error("TimezoneLookup: Invalid latitude or longitude provided.");
            return null;
        }

        const point = turf.point([lon, lat]); // Turf.js uses [longitude, latitude]

        for (const feature of this.timezoneFeatures) {
            if (feature.geometry && feature.properties) {
                try {
                    if (turf.booleanPointInPolygon(point, feature.geometry)) {
                        const props = feature.properties;
                        let offsetString = null;
                        let nameString = null;

                        // Determine offset string
                        if (props.utc_format && typeof props.utc_format === 'string') {
                            offsetString = props.utc_format;
                        } else if (props.time_zone && typeof props.time_zone === 'string') {
                            offsetString = props.time_zone;
                        } else if (typeof props.zone === 'number' && !isNaN(props.zone)) {
                            const offsetVal = props.zone;
                            const sign = offsetVal < 0 ? "-" : "+";
                            const absOffset = Math.abs(offsetVal);
                            const hours = Math.floor(absOffset);
                            const minutes = Math.round((absOffset - hours) * 60);
                            offsetString = `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        } else if (props.name && typeof props.name === 'string' && !props.name.toUpperCase().startsWith("UTC") && !isNaN(parseFloat(props.name))) {
                            // If props.name is like "-10" or "5.5"
                            const numName = parseFloat(props.name);
                            const sign = numName < 0 ? "-" : "+";
                            const absOffset = Math.abs(numName);
                            const hours = Math.floor(absOffset);
                            const minutes = Math.round((absOffset - hours) * 60);
                            offsetString = `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        }
                        
                        if (!offsetString) { // If no offset could be determined, we can't proceed for this feature
                             console.warn("TimezoneLookup: Found polygon, but could not determine offset string from properties:", props);
                             continue; // Try next feature if this one is problematic for offset
                        }

                        // Determine name string
                        // Priority: IANA name, places, descriptive name, then offset as name
                        if (props.tz_name1st && typeof props.tz_name1st === 'string') {
                            nameString = props.tz_name1st;
                        } else if (props.places && typeof props.places === 'string') {
                            nameString = props.places;
                        } else if (props.name && typeof props.name === 'string') { // Could be like "-10" or "America/New_York" from some sources
                            nameString = props.name;
                        } else {
                            nameString = offsetString; // Fallback to offset string if no other name is suitable
                        }
                        
                        return { name: nameString, offset: offsetString };
                    }
                } catch (e) {
                    console.error("TimezoneLookup: Error during point in polygon check:", feature, e);
                    // Potentially invalid geometry in the GeoJSON, continue to next feature
                }
            }
        }
        console.log("TimezoneLookup: No timezone found for coordinates:", lat, lon);
        return null; // No timezone found for the given coordinates
    }
}