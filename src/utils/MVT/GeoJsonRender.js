import {
    Color, EllipsoidSurfaceAppearance, Material, Primitive
} from "./cesiumAdapter.js";

const polygonAppearance = new EllipsoidSurfaceAppearance({
    translucent: false,
    material: new Material({
        fabric: {
            type: 'Color',
            uniforms: {
                color: new Color(1.0, 0, 0.0, 1.0)
            }
        }
    })
});

export default class GeoJsonRender{

    constructor(geoJson, options){
        this.json = geoJson;
        this.options = options;
    }

    isGeometryInstance(){
        return true;
    }

    getRect(){

    }

    toInstances(){

    }

    get type(){
        return 'Polygon'
    }

    static instancesToPrimitive(intances){

        if (!intances || !intances.length) {
            return null;
        }

        for (let i = 0, il = intances.length; i < il; i++) {
            intances[i].id = i;
        }
        
        const p = new Primitive({
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


