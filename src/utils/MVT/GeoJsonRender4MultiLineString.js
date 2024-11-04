
import GeoJsonRender from "./GeoJsonRender.js";
import GeoJsonHelper from "./GeoJsonHelper.js";
import {
    GroundPolylinePrimitive, PolylineMaterialAppearance, Material
} from './cesiumAdapter.js';

const polylinAppearance = new PolylineMaterialAppearance({
    translucent: false,
    material: Material.fromType(
        Material.PolylineGlowType
    ),
});

export default class GeoJsonRender4MultiLineString extends GeoJsonRender {
    constructor(geoJson, options) {
        super(geoJson, options)
    }

    getRect() {
        const geometry = this.json.geometry;
        if (!geometry) {
            return null;
        }

        const coordinates = geometry.coordinates
        return GeoJsonHelper.coordsToRect([coordinates]);
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
                const entity = GeoJsonHelper.coordsToPolylineInstance(coordinates[i]);
                if (entity) {
                    entity.geoJson = this.json;
                    ec.push(entity);
                }
            }

            return ec;
        }
    }

    get type() {
        return 'MultiLineString'
    }

    /**
     * 是否为贴地渲染
     */
    static get isGroundPrimitive() {
        return true;
    }

    static instancesToPrimitive(intances) {

        if (!intances || !intances.length) {
            return null;
        }
        
        for (let i = 0, il = intances.length; i < il; i++) {
            intances[i].id = i;
        }

        const gpp = new GroundPolylinePrimitive({
            geometryInstances: intances,
            appearance: polylinAppearance,
            asynchronous: true,
            releaseGeometryInstances: true,
        });
        
        const _propertiesArray = intances.map(_ => {
            const pps = _.geoJson;
            delete _.geoJson;
            return pps;
        });
        
        gpp.getMvtGeoJson = (pickedFeature) => {
            return _propertiesArray[pickedFeature.id];
        }

        return gpp;
    }
}