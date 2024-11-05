import {
    Cartesian3, GeometryInstance, PolygonHierarchy,
    PolygonGeometry, GroundPolylineGeometry, Rectangle, Color, ColorGeometryInstanceAttribute
} from "./cesiumAdapter.js";

export default class GeoJsonHelper {


    static coordsToPolylineInstance(coordinates, width){
        if (!coordinates || coordinates.length < 2) {
            return null
        }

        var geometry = new GroundPolylineGeometry({
            positions: coordinatesArrayToCartesianArray(coordinates),
            width: width,
        });

        return new GeometryInstance({
            geometry: geometry,
        })

    }

    static coordsToPolygonInstance(coordinates) {
        if (!coordinates || coordinates.length < 1) {
            return null
        }

        const holes = [];
        for (let i = 1, len = coordinates.length; i < len; i++) {
            holes.push(
                new PolygonHierarchy(coordinatesArrayToCartesianArray(coordinates[i]))
            );
        }

        var geometry = new PolygonGeometry({
            polygonHierarchy: new PolygonHierarchy(
                coordinatesArrayToCartesianArray(coordinates[0]),
                holes),
            closeTop: true,
            closeBottom: false,

        });
        return new GeometryInstance({
            geometry: geometry,
        })
    }
    
    static coordsToRect(coordinates) {
        if (!coordinates || coordinates.length < 1) {
            return null
        }
    
        const fst = coordinates[0];
        let west = fst[0][0], south = fst[0][1], east = fst[0][0], north = fst[0][1]
        for (let i = 1; i < fst.length; i++) {
    
            const x = fst[i][0];
            const y = fst[i][1];
    
            west = Math.min(west, x);
            east = Math.max(east, x);
    
            south = Math.min(south, y);
            north = Math.max(north, y);
        }
    
        return Rectangle.fromDegrees(west, south, east, north);
    }
}



function defaultCrsFunction(coordinates) {
    return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates.length > 2 ? coordinates[2] : 0);
}

function coordinatesArrayToCartesianArray(coordinates, crsFunction = defaultCrsFunction) {
    const positions = new Array(coordinates.length);
    for (let i = 0; i < coordinates.length; i++) {
        positions[i] = crsFunction(coordinates[i]);
    }
    return positions;
}