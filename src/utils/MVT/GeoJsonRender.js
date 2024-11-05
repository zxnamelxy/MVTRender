export default class GeoJsonRender {

    constructor(geoJson, options) {
        this.json = geoJson;
        this.options = options;
    }

    isGeometryInstance () {
        return true;
    }

    getRect () {

    }

    toInstances () {

    }

    get type () {
        return 'Polygon'
    }
}


