import GeoJsonRender from "./GeoJsonRender.js";
import GeoJsonHelper from "./GeoJsonHelper.js";

import {
    Rectangle
} from "./cesiumAdapter.js";


export default class GeoJsonRender4MultiPolygon extends GeoJsonRender {
    constructor(geoJson, options) {
        super(geoJson, options)
    }

    getRect() {

        const geometry = this.json.geometry;
        if (!geometry) {
            return null;
        }

        const coordinates = geometry.coordinates
        if (coordinates && coordinates.length > 0) {

            const res = GeoJsonHelper.coordsToRect(coordinates[0]);
            for (let i = 1, il = coordinates.length; i < il; i++) {

                let entity = GeoJsonHelper.coordsToRect(coordinates[0]);
                if (entity) {
                    Rectangle.union(res, entity, res)
                }
            }

            return res;
        }

        return null;
    }

    toInstances() {

        const {geometry, properties} = this.json;
        if (!geometry) {
            return null;
        }

        const coordinates = geometry.coordinates
        if (coordinates && coordinates.length > 0) {
            const ec = [];

            for (let i = 0, il = coordinates.length; i < il; i++) {
                const entity = GeoJsonHelper.coordsToPolygonInstance(coordinates[i]);
                if (entity) {
                    entity.geoJson = this.json;
                    ec.push(entity);
                }
            }

            return ec;
        }

        return null;
    }
}

