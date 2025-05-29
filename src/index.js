
import {booleanPointInPolygon as BooleanPointInPolygon, point as Point}  from '@turf/turf';
import timezonesGeojsonStr from './timezones.geojson.js';

const tzPolygons  = JSON.parse(timezonesGeojsonStr)

function getTimeZoneOffsetByLatLng(lat, lon){


    if (typeof lat !== 'number' || isNaN(lat) || typeof lon !== 'number' || isNaN(lon)) {
        console.error("TimezoneLookup: Invalid latitude or longitude.");
        return null;
    }

    const point = Point([lon, lat]);


    for (const feature of tzPolygons.features){
        
        if (BooleanPointInPolygon(point, feature)){

            return feature.properties

        }
    }
}


export {getTimeZoneOffsetByLatLng}

