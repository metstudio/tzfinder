# Geo Timezone Lookup (`tzfinder`)

[![NPM version](https://img.shields.io/npm/v/tzfinder.svg?style=flat)](https://www.npmjs.com/package/tzfinder)
[![NPM downloads](https://img.shields.io/npm/dm/tzfinder.svg?style=flat)](https://www.npmjs.com/package/tzfinder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/munim110/tzfinder.svg)](https://github.com/munim110/tzfinder/issues)
[![GitHub stars](https://img.shields.io/github/stars/munim110/tzfinder.svg)](https://github.com/munim110/tzfinder/stargazers)

**`tzfinder`** is a Node.js library designed to determine the IANA timezone name (e.g., "America/New_York") and current UTC offset (e.g., "UTC-05:00") from geographic coordinates (latitude and longitude). It utilizes a bundled GeoJSON file containing timezone boundary data (derived from sources like Natural Earth) and leverages [Turf.js](https://turfjs.org/) for spatial analysis.

This package is ideal for server-side applications or build processes where you need to efficiently look up timezone information based on location without relying on external APIs for each lookup.

## Key Features

* **Offline Lookup:** Performs timezone lookups locally using a bundled GeoJSON data file.
* **IANA Timezone Name & UTC Offset:** Returns both the descriptive timezone name and its current UTC offset.
* **Simple API:** Easy to initialize and use with a straightforward `getTimeOffsetAndName(lat, lon)` method.
* **ES Module:** Modern JavaScript module for easy integration.
* **Dependency on Turf.js:** Uses the robust Turf.js library for point-in-polygon operations.

## Prerequisites

* Node.js (Version 14.x or higher recommended, as it uses ES Modules and modern JavaScript features).

## Installation

Install the package using npm or yarn:

```bash
npm install tzfinder
# or
yarn add tzfinder
```

## Usage
```javascript
import { TimezoneLookup } from 'tzfinder'; // Replace 'tzfinder' with the actual package name

async function main() {
    const tzLookup = new TimezoneLookup();

    try {
        // 1. Initialize the service.
        // This loads the 'timezones.geojson' file bundled with the package.
        // You can optionally pass a different filename if you've customized the package.
        await tzLookup.initialize();
        console.log("Timezone lookup service initialized successfully.");

        // 2. Perform lookups
        const coordinates1 = { lat: 40.7128, lon: -74.0060 }; // Example: New York City
        const result1 = tzLookup.getTimeOffsetAndName(coordinates1.lat, coordinates1.lon);

        if (result1) {
            console.log(`Timezone for (${coordinates1.lat}, ${coordinates1.lon}):`);
            console.log(`  Name: ${result1.name}`);
            console.log(`  Offset: ${result1.offset}`);
        } else {
            console.log(`No timezone information found for (${coordinates1.lat}, ${coordinates1.lon}). This might be an ocean or an area not covered.`);
        }

        const coordinates2 = { lat: 34.0522, lon: -118.2437 }; // Example: Los Angeles
        const result2 = tzLookup.getTimeOffsetAndName(coordinates2.lat, coordinates2.lon);

        if (result2) {
            console.log(`\nTimezone for (${coordinates2.lat}, ${coordinates2.lon}):`);
            console.log(`  Name: ${result2.name}`);
            console.log(`  Offset: ${result2.offset}`);
        } else {
            console.log(`\nNo timezone information found for (${coordinates2.lat}, ${coordinates2.lon}).`);
        }

    } catch (error) {
        console.error("An error occurred:", error);
        // Handle initialization or lookup errors
    }
}

main();
```