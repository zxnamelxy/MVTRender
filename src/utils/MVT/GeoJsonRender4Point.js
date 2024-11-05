
import GeoJsonRender from "./GeoJsonRender.js"
import LabelsClusterPrimitive from "./LabelsClusterPrimitive.js"
import LabelsClusterPrimitiveCollection from "./LabelsClusterPrimitiveCollection.js"

import {
    BillboardCollection,
    Cartesian2,
    Cartesian3,
    Color, defined, LabelStyle, PrimitiveCollection,
    Rectangle, HorizontalOrigin,
    VerticalOrigin,
    Math,
    PointPrimitiveCollection,
    Cartographic,
    Ellipsoid,
    sampleTerrainMostDetailed,
    when
} from "./cesiumAdapter.js"
import * as Cesium from 'cesium';

// const defaultPointImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAALVJREFUOE9jZEADAtNu2zMxMsQx/GdwYGBgUIJK32NgZDjw7z/Dog9ZqgeRtTAic4Sm35nF8P9/KrqhKHxGxtnvMlXSYGJwA4Sm3d7BwMDgjlczQnLnuyxVDxAXbABRNqObDHUJI9jPDAwHiLQZRdk/BgYHRqHpt+cy/GdIIscABkaGeYxC027fRQptUs25BzLgP6m6UKKRGgZQ6AVKA5HiaKQ4IcFClKKkDDeEkswEM4TU7AwAoCRVl8lZL7gAAAAASUVORK5CYII=";

const defaultTextOpitons = {
    fillColor: Color.BLACK,
    outlineColor: Color.WHITE,
    horizontalOrigin: HorizontalOrigin.CENTER,
    verticalOrigin: VerticalOrigin.BOTTOM,
    pixelOffset: new Cartesian2(0, -16),
    style: LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    font: "20px sans-serif"
}

const lcpcMap = new Map();

export default class GeoJsonRender4Point extends GeoJsonRender {
    /**
     * 
     * @param {*} geoJson 
     * @param {*} [options]
     * @param {*} [options.showPoint = true] 是否显示点
     * @param {*} [options.textField = null] 注记字段，如果不设置，则不显示注记，比如 name
     * @param {*} [options.pointImage] 点的图标
     */
    constructor(geoJson, options) {
        options = options || {};
        options.showPoint = defined(options.showPoint) ? options.showPoint : true;

        super(geoJson, options)
        this.pointImage = options.pointImage
        this.iconJson = options.iconJson
        this.pointScale = options.pointScale || 1
    }

    isGeometryInstance () {
        return false;
    }

    getRect () {
        return Rectangle.MAX_VALUE.clone()
    }

    toInstances (scene) {
        const { geometry, properties } = this.json;
        const { showPoint, textField, textOptions, heightField, pointTypeField } = this.options;

        if (!geometry) {
            return null;
        }

        const coordinates = geometry.coordinates
        let h = 0
        let height = 0
        if (heightField && properties) h = properties[heightField] + 70;
        // let cartesian3 = Cartesian3.fromDegrees(coordinates[0], coordinates[1], 0);
        // let cartographic = Cartographic.fromCartesian(cartesian3);
        // const height2 = await viewer.terrainProvider.getHeight(cartographic);
        // var height = scene.globe.getHeight(cartographic);
        // console.log(height);
        // debugger;
        // var cartesian= Cartesian3.fromDegrees(100,20)
        // var ellipsoid = scene.globe.ellipsoid
        // let p = ellipsoid.cartesianToCartographic(cartesian)
        // let promise = sampleTerrainMostDetailed(window.viewer.terrainProvider, [p])
        // console.log(Cesium.when);
        // debugger;
        // Cesium.when(promise, function () {
        //     console.log(Cartographic.toCartesian(p));
        //     debugger;
        // })
        let instances = [];
        const position = Cartesian3.fromDegrees(coordinates[0], coordinates[1], h);
        const instance = {
            position,
            scale: 1,
            geoJson: this.json,
        }
        if (showPoint) {
            let img = null
            if(pointTypeField && properties){
                console.log(properties[pointTypeField]);
                img = this.iconJson[properties[pointTypeField]]
                if(!img){
                    img = this.iconJson['default']
                }
            }
            const _instance = {
                ...instance,
                image: this.pointImage || img,
                scale: this.pointScale,
            }
            if (!_instance.image) {
                delete _instance.image
            }
            instances.push(_instance)
        }

        if (textField && properties) {
            var text = properties[textField]
            if (text) {
                const x = Math.toRadians(coordinates[0])
                const y = Math.toRadians(coordinates[1])
                Object.assign(instance, {
                    text,
                    x,
                    y,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                });
                Object.assign(instance, defaultTextOpitons);
                Object.assign(instance, textOptions);
                instances.push(instance);
            }
        }

        return instances
    }

    get type () {
        return 'Point'
    }

    static instancesToPrimitive (instances, scene, mvtUrl, renderOptions) {
        renderOptions = renderOptions || {};

        if (instances && instances.length > 0) {

            const typeBuf = {
                texts: [],
                images: [],
                defaults: [],
            }
            instances.reduce((a, v) => {
                if (v.image) {
                    typeBuf.images.push(v)
                }
                else if (v.text) {
                    typeBuf.texts.push(v)
                } else {
                    typeBuf.defaults.push(v)
                }

            }, 0);

            const { images, texts, defaults } = typeBuf;

            const pc = new PrimitiveCollection()

            if (images.length > 0) {
                const bc = new BillboardCollection({
                    scene,
                })

                for (let i = 0, il = images.length; i < il; i++) {
                    images[i].id = i;
                    bc.add(images[i])
                }

                const _propertiesArray = images.map(_ => {
                    const pps = _.geoJson;
                    delete _.geoJson;
                    return pps;
                });

                bc.getMvtGeoJson = (pickedFeature) => {
                    return _propertiesArray[pickedFeature.id];
                }

                pc.add(bc)
            }

            if (texts.length > 0) {
                const pointOptions = {};
                Object.assign(pointOptions, renderOptions)

                const lcp = new LabelsClusterPrimitive(scene, texts, pointOptions);

                if (!lcpcMap.has(mvtUrl)) {
                    lcpcMap.set(mvtUrl, new LabelsClusterPrimitiveCollection(scene));
                }

                const lcpc = lcpcMap.get(mvtUrl)
                lcpc.add(lcp);

                lcpc.addRefrence();
                pc.add(lcpc)

                pc.destroyOri = pc.destroy;
                pc.destroy = () => {
                    lcpc.remove(lcp, true);
                    pc.destroyOri();
                    if (lcpc.isDestroyed()) {
                        lcpcMap.delete(mvtUrl);
                    }
                }
            }

            if (defaults.length > 0) {
                const bc = new PointPrimitiveCollection()
                const pointStyle = JSON.parse(JSON.stringify(renderOptions));
                delete pointStyle.textOptions;

                for (let i = 0, il = defaults.length; i < il; i++) {
                    defaults[i].id = i;
                    const instance = {
                        ...defaults[i],
                        ...pointStyle
                    }
                    bc.add(instance)
                }

                const _propertiesArray = defaults.map(_ => {
                    const pps = _.geoJson;
                    delete _.geoJson;
                    return pps;
                });

                bc.getMvtGeoJson = (pickedFeature) => {
                    return _propertiesArray[pickedFeature.id];
                }

                pc.add(bc)
            }

            return pc
        }
    }
}
