
import GeoJsonRender from "./GeoJsonRender.js";
import GeoJsonHelper from "./GeoJsonHelper.js";
import {
    GroundPolylinePrimitive, PolylineMaterialAppearance, Material
} from './cesiumAdapter.js';

export default class GeoJsonRender4LineString extends GeoJsonRender {
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
        const width = this.options.width || 5.0;
        const coordinates = geometry.coordinates
        var instance = GeoJsonHelper.coordsToPolylineInstance(coordinates, width);
        instance.geoJson = this.json;
        
        return [instance];
    }

    get type() {
        return 'LineString'
    }

    /**
     * 是否为贴地渲染
     */
    static get isGroundPrimitive() {
        return true;
    }

    static instancesToPrimitive(intances, scene, mvtUrl, renderOptions) {
        const polylinAppearance = new PolylineMaterialAppearance({
            translucent: false,
            material: Material.fromType(
                Material.PolylineGlowType
            ),
        });
        // console.log(renderOptions);
        Object.assign(polylinAppearance, renderOptions)

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