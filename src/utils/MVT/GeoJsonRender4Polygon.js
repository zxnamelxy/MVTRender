
import {
    Color, EllipsoidSurfaceAppearance, Material, Primitive, GroundPrimitive
} from "./cesiumAdapter.js";

import GeoJsonRender from "./GeoJsonRender.js"
import GeoJsonHelper from "./GeoJsonHelper.js"

const defaultMaterial = new Material({
    fabric: {
        type: 'Color',
        uniforms: {
            color: new Color(1.0, 0, 0.0, 1.0)
        }
    }
})
export default class GeoJsonRender4Polygon extends GeoJsonRender {
    constructor(geoJson, options) {
        super(geoJson, options)
    }


    getRect () {
        const geometry = this.json.geometry;
        if (!geometry) {
            return null;
        }

        const coordinates = geometry.coordinates
        return GeoJsonHelper.coordsToRect(coordinates);
    }

    toInstances () {
        const { geometry, properties } = this.json;

        if (!geometry) {
            return null;
        }

        const coordinates = geometry.coordinates;
        const pi = GeoJsonHelper.coordsToPolygonInstance(coordinates);
        pi.geoJson = this.json;
        return [pi];
    }

    static instancesToPrimitive (intances, scene, mvtUrl, renderOptions) {
        const polygonAppearance = new EllipsoidSurfaceAppearance({
            translucent: false,
            material: defaultMaterial,
        });
        Object.assign(polygonAppearance, renderOptions)

        if (!intances || !intances.length) {
            return null;
        }

        for (let i = 0, il = intances.length; i < il; i++) {
            intances[i].id = i;
        }

        const p = new GroundPrimitive({
            geometryInstances: intances,
            appearance: polygonAppearance,
            asynchronous: true,
            releaseGeometryInstances: true,
        });

        const _propertiesArray = intances.map(_ => {
            const pps = _.geoJson;
            delete _.geoJson;
            return pps;
        });

        p.getMvtGeoJson = (pickedFeature) => {
            return _propertiesArray[pickedFeature.id];
        }

        return p;
    }
}
