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

The library must be initialized before it can be used. Initialization involves fetching the `timezones.geojson` file. By default, it fetches this file from a CDN (jsDelivr) pointing to the version hosted in the package's GitHub repository.

```javascript
import { TimezoneLookup } from 'tzfinder';

async function main() {
    const tzLookup = new TimezoneLookup();

    try {
        // Initialize the service.
        // By default, it fetches the GeoJSON from:
        // [https://cdn.jsdelivr.net/gh/metstudio/tzfinder@master/timezones.geojson](https://cdn.jsdelivr.net/gh/metstudio/tzfinder@master/timezones.geojson)
        // You can pass a custom URL if you host the GeoJSON elsewhere:
        // await tzLookup.initialize('YOUR_CUSTOM_GEOJSON_URL_HERE');
        await tzLookup.initialize(); 
        
        console.log("Timezone lookup service initialized successfully.");
        // Example coordinates for New York City
        const lat = 40.7128; // Latitude for New York City
        const lon = -74.0060; // Longitude for New York City
        const { timezoneName, utcOffset } = await tzLookup.getTimeOffsetAndName(lat, lon);
        console.log(`Timezone Name: ${timezoneName}`); // e.g., "America/New_York"
        console.log(`UTC Offset: ${utcOffset}`); // e.g., "UTC-05:00"

    } catch (error) {
        console.error("An error occurred:", error);
    }
}
main();
```
