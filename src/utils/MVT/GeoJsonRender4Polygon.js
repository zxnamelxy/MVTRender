

import GeoJsonRender from "./GeoJsonRender.js"
import GeoJsonHelper from "./GeoJsonHelper.js"

export default class GeoJsonRender4Polygone extends GeoJsonRender{
    constructor(geoJson, options){
        super(geoJson, options)
    }

    
    getRect(){
        const geometry = this.json.geometry;
        if (!geometry) {
            return null;
        }
    
        const coordinates = geometry.coordinates
        return GeoJsonHelper.coordsToRect(coordinates);
    }

    toInstances(){
        const {geometry, properties} = this.json;

        if (!geometry) {
            return null;
        }
    
        const coordinates = geometry.coordinates;
        const pi = GeoJsonHelper.coordsToPolygonInstance(coordinates);
        pi.geoJson = this.json;
        return [pi];
    }
    
}
