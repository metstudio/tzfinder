import {
    booleanPointInPolygon as BooleanPointInPolygon, 
    point as Point
}  from '@turf/turf';
import tzPolygons from './ne_10m_time_zones.json' with { type: 'json' };


function getTimeZoneOffsetByLatLng(lat, lon){


    if (typeof(lat) !== 'number' || isNaN(lat) || typeof(lon) !== 'number' || isNaN(lon)) {
        console.error("tzfinder: Invalid latitude or longitude.");
        return null;
    }

    const point = Point([lon, lat]);


    for (const feature of tzPolygons.features){
        
        if (BooleanPointInPolygon(point, feature)){

            return feature.properties

        }
    }

    console.error(`tzfinder: No timezone found for the given coordinates: (lat: ${lat}, lon: ${lon})`);
    
    return null;
}


export {getTimeZoneOffsetByLatLng}

