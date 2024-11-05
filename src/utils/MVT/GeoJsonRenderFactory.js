import GeoJsonRender4Point from "./GeoJsonRender4Point.js"
import GeoJsonRender4Polygon from "./GeoJsonRender4Polygon.js"
import GeoJsonRender4MultiPolygon from "./GeoJsonRender4MultiPolygon.js"
import GeoJsonRender4LineString from "./GeoJsonRender4LineString.js"
import GeoJsonRender4MultiLineString from "./GeoJsonRender4MultiLineString.js"

const geoJsonRenders = {
    Point: GeoJsonRender4Point,
    Polygon: GeoJsonRender4Polygon,
    MultiPolygon: GeoJsonRender4MultiPolygon,
    LineString: GeoJsonRender4LineString,
    MultiLineString: GeoJsonRender4MultiLineString,
}


export default class GeoJsonRenderFactory {

    static getRender(geoJson, options) {

        if (!geoJson || !geoJson.geometry) {
            return null
        }
        var type = geoJson.geometry.type;
        if (type) {
            const render = geoJsonRenders[type]
            if (render) {
                let typeOptions = {}
                if(options != null){
                    // typeOptions =  options[type]
                    typeOptions =  options
                } 
                return new render(geoJson, typeOptions);
            }
            else{
                var msg = `不支持 MVT点服务类型：【${type}】 ！`;
                // alert(msg);
                throw msg;
            }
        }

        return null;
    }

    static getRenderClass(type){
        return geoJsonRenders[type];
    }
}