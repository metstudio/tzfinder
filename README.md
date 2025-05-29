# Geo Timezone Lookup (`tzfinder`)

[![NPM version](https://img.shields.io/npm/v/tzfinder.svg?style=flat)](https://www.npmjs.com/package/tzfinder)
[![NPM downloads](https://img.shields.io/npm/dm/tzfinder.svg?style=flat)](https://www.npmjs.com/package/tzfinder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/munim110/tzfinder.svg)](https://github.com/munim110/tzfinder/issues)
[![GitHub stars](https://img.shields.io/github/stars/munim110/tzfinder.svg)](https://github.com/munim110/tzfinder/stargazers)

**`tzfinder`** is a Node.js library designed to determine the IANA timezone name (e.g., "America/New_York"), current UTC offset (e.g., "UTC-05:00") and similar information from geographic coordinates (latitude and longitude). It utilizes a bundled GeoJSON file containing timezone boundary data (derived from sources like Natural Earth) and leverages [Turf.js](https://turfjs.org/) for spatial analysis.

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
import {getTimeZoneOffsetByLatLng} from 'tzfinder';

function main() {

    try {
        timezoneinfo = getTimeZoneOffsetByLatLng(23,89);
        console.log(`Timezone Name: ${timezoneinfo.tz_name1st}`); // e.g., "Asia/Dhaka"
        console.log(`UTC Offset: ${timezoneinfo.time_zone}`); // e.g., "UTC+06:00"

    } catch (error) {
        console.error("An error occurred:", error);
    }
}
main();
```

## Properties 
* **name:** Timezone offset in string format (e.g. '+6', '-9')
* **zone:** Timezone offset in integer format (e.g. 6, -9)
* **utc_format:** Timezone offset in UTC format string (e.g. 'UTC-02:00', 'UTC+06:00')
* **time_zone:** Timezone offset in UTC format string (e.g. 'UTC-02:00', 'UTC+06:00')
* **iso_8601:** Timezone offset in iso_8601 format string (e.g. 'UTC-02:00', 'UTC+06:00')
* **places:** A list of some places with this timezone (e.g., 'Estonia, Finland, Latvia, Lithuania')
* **tz_name1st:** Timezone name of the timezone (e.g., 'Asia/Dhaka', 'Europe/Helsinki')
