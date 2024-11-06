import {
    defaultValue,
    defined,
    destroyObject, GeographicProjection,
    JulianDate, PrimitiveCollection,
    Rectangle,
    WebMercatorTilingScheme,
    WebMercatorProjection
} from "./cesiumAdapter.js";

import NumberKeyHelper from './NumberKeyHelper.js';
import GeoJsonRenderFactory from './GeoJsonRenderFactory.js';

const tempTime = new JulianDate()

// 每个Primitive中包含的最大Instance数量
const maxUnitPerPrimitive = 4000;

window.pauseMVTRender = false;

class MVTDynamicPrimitive {
    /**
     * 实现一个MVT服务动态加载的Primitive
     * 主要特性如下：
     * 0.使用Cesium原生Primitive矢量渲染，画面清晰
     * 1.支持MVT矢量区服务渲染
     * 2.高效快速加载不掉帧
     * 3.自动剔除极小的要素
     * 4.瓦片层级切换丝滑
     * 5.支持要素级别拾取和高亮
     * 
     * TODO:
     * 优先加载屏幕中心区域
     * 
     * 【问题较大，需要优化】在保持层级不变的情况下，场景旋转，位于旋转锚点或者相机焦点处的注记会时隐时现。
     *
     * @alias MVTDynamicPrimitive
     * @constructor
     *
     * @param {Cesium.Scene} [scene] viewer.scene
     * @param {string} [url] mvt服务的模板url
     * @param {object} [options] 其他选项
     * @param {number} [options.maxZoom] 最大层级，可选
     * @param {number} [options.minZoom] 最小层级，可选
     * @param {number} [options.tileSize] 瓦片大小，可选
     * @param {boolean} [options.flyTo = true] 自动跳转
     * @param {number} [options.offsetZoom = 0] 层级偏移
     * @param {object} [options.renderOptions] 渲染选项，点线区的渲染选项，可以分别设置
     * @param {object} [options.renderOptions.Point] 点渲染选项
     * @param {string} [options.renderOptions.Point.textField] 点渲染时的注记字段，不设置该值，或者字段无效，则不显示注记
     * @param {boolean} [options.renderOptions.Point.showPoint = true] 点渲染时是否显示点位
     * @param {string} [options.renderOptions.Point.minLabelNum = 10] 最小注记数量，如果分块内的注记数量，小于该值，则不进行调度
     * @param {Cesium.Label.ConstructorOptions} [options.renderOptions.Point.textOptions] 点渲染时的注记选项
     * @param {object} [options.renderOptions.Line] 线渲染选项
     * @param {object} [options.renderOptions.Polygon] 区渲染选项
     *
     * @example
     * 
     * const mvtUrl = "http://localhost:8084/api/v1/vector-tiles/f9daf1be8c864da1c9b4eb78fa5502fc/tiles/{z}/{x}/{y}";
     * 
     * const mvtp = new MVTDynamicPrimitive(viewer.scene, mvtUrl, {
     *  // minZoom: 5,
     *  offsetZoom: -5,
     *  renderOptions:
     *  {
     *      Point: {
     *          // textField: 'name'
     *          textField: 'NAME',
     *          // showPoint: false,
     *          textOptions: {
     *              fillColor: Cesium.Color.BLACK,
     *              outlineColor: Cesium.Color.WHITE,
     *              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
     *              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
     *              pixelOffset: new Cesium.Cartesian2(0, -16),
     *              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
     *              outlineWidth: 5,
     *              font: "20px sans-serif"
     *          }
     *      }
     *  });
     * viewer.scene.primitives.add(mvtp);
     */
    constructor(scene, url, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this.scene = scene;
        this.url = url;
        this.options = options;
        this.loadedTiles = new Map();
        this.loadedPrimitives = new Map();
        this.rendingPrimitives = new Map();
        this.loadingTiles = new Map();
        this.removingTiles = new Map();
        this.tempGeoJsons = new Map();
        this.currentTiles = new Map();
        this.failedTiles = new Map();
        this._primitive = new PrimitiveCollection();
        this.show = true;
        this.maxZoom = options.maxZoom || NumberKeyHelper.maxLevel;
        this.minZoom = options.minZoom || 0;
        this.tileSize = options.tileSize || 256;
        this.offsetZoom = options.offsetZoom || 0;

        this.lastTime = JulianDate.now(tempTime).clone();
        this.lastPrimitiveTime = JulianDate.now(tempTime).clone();

        this.renderOptions =
        {
            // Point: {
            //     textField: 'name'
            // }
        };//

        if (options.renderOptions) {
            Object.assign(this.renderOptions, options.renderOptions);
        }

        this.fetchMetaData();

        window.mvtp = this;
    }

    async fetchMetaData() {
        const { options, url } = this;
        if (!defined(options.maxZoom) || !defined(options.minZoom)) {
            const metaUrl = getMetaDataUrl(url);
            if (metaUrl) {
                const metaTmp = await fetch(metaUrl)
                if (metaTmp) {
                    const metaJson = await metaTmp.json();
                    if (metaJson) {
                        this.minZoom = metaJson.minzoom || this.minZoom
                        this.minZoom = +this.minZoom
                        this.maxZoom = metaJson.maxzoom || this.maxZoom
                        this.maxZoom = +this.maxZoom
                        this.maxZoom = Math.min(this.maxZoom, NumberKeyHelper.maxLevel);

                        const flyTo = options.flyTo || true;
                        let bounds = metaJson.bounds;
                        if (flyTo && bounds && this.scene) {

                            bounds = bounds.split(",")

                            const rect = Rectangle.fromDegrees(bounds[0], bounds[1], bounds[2], bounds[3])
                            this.scene.camera.flyTo({ destination: rect });
                        }
                    }
                }
            }
        }
    }

    /**
     * @private
     */
    async update(frameState) {
        if (!this.show) {
            return;
        }

        const { scene, loadingTiles, failedTiles, loadedTiles, _primitive, url, tempGeoJsons, rendingPrimitives} = this;
        const globe = scene.globe;

        removeOutScreenTiles(this);

        let now = JulianDate.now(tempTime);
        let primitiveRenderResult = null;
        if (JulianDate.secondsDifference(now, this.lastPrimitiveTime) < 0.02){
            primitiveRenderResult = pickAPrimitiveToRender(this);
        }

        _primitive.update(frameState);

        this.lastPrimitiveTime = JulianDate.now(tempTime).clone();

        if(primitiveRenderResult){
            const {key, primitives} = primitiveRenderResult
            rendingPrimitives.set(key, primitives);
            await Promise.allSettled(primitives.map(_ => _.readyPromise));
            loadedTiles.set(key, primitives);
            rendingPrimitives.delete(key);
        }
        else if (JulianDate.secondsDifference(now, this.lastPrimitiveTime) < 0.02){
            // console.time('calcVisibleTiles');
            calcVisibleTiles(this);
            // console.timeEnd('calcVisibleTiles');
        }

        if (window.pauseMVTRender) {
            return;
        }

        // 确保执行后续操作的时间间隔大于50ms,以避免造成渲染卡顿
        if (JulianDate.secondsDifference(now, this.lastTime) < 0.05) {
            return;
        }

        if (tempGeoJsons.size > 0) {
            pickAGeoJsonToPrimitives(this);
        }

        await pickATileAndParseToGeoJson.bind(this)(loadingTiles, failedTiles, globe, frameState, tempGeoJsons, url)

        this.lastTime = JulianDate.now(tempTime).clone();
    }

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <p>
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     * </p>
     *
     * @returns {boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     *
     * @see MVTDynamicPrimitive#destroy
     */
    isDestroyed() {
        return false;
    }

    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <p>
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     * </p>
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @example
     * p = p && p.destroy();
     *
     * @see MVTDynamicPrimitive#isDestroyed
     */
    destroy() {
        this._primitive = this._primitive && this._primitive.destroy();
        return destroyObject(this);
    }
}

const tempMap = new Map();
function parseTilesToRender(globe, tileSize, minZoom, maxZoom, offsetZoom) {

    tempMap.clear();
    var tiles = globe._surface._tilesToRender
    if (tiles && tiles.length > 0) {
        const tp = globe.terrainProvider;
        for (let i = 0, il = tiles.length; i < il; i++) {
            const tile = tiles[i];
            const { rectangle, level } = tile;

            const mvtTiles = calcMvtXYZ(tp, level, rectangle, tileSize, minZoom, maxZoom, offsetZoom);
            if (mvtTiles) {
                for (let j = 0, jl = mvtTiles.length; j < jl; j++) {

                    const mtile = mvtTiles[j];
                    const { level, x, y } = mtile;
                    const key = NumberKeyHelper.make(x, y, level);
                    tempMap.set(key, mtile)
                }
            }
        }
    }

    return tempMap;
}

const WMTilingScheme = new WebMercatorTilingScheme();
function calcMvtXYZ(terrainProvider, terrainLevel, rectangle, tileSize, minZoom, maxZoom, offsetZoom) {

    if (rectangle.north >= WebMercatorProjection.MaximumLatitude ||
        rectangle.south <= -WebMercatorProjection.MaximumLatitude) {
        return null;
    }

    let latitudeClosestToEquator = 0.0;
    if (rectangle.south > 0.0) {
        latitudeClosestToEquator = rectangle.south;
    } else if (rectangle.north < 0.0) {
        latitudeClosestToEquator = rectangle.north;
    }

    const errorRatio = 1.0;
    const targetGeometricError =
        errorRatio * terrainProvider.getLevelMaximumGeometricError(terrainLevel);
    let z = getLevelWithMaximumTexelSpacing(
        WMTilingScheme, // 
        tileSize, // 
        targetGeometricError,
        latitudeClosestToEquator
    );

    // TODO offsetZoom

    z += offsetZoom

    if(minZoom) z = Math.max(z, minZoom)
    if(maxZoom) z = Math.min(z, maxZoom)

    const northwestTC = WMTilingScheme.positionToTileXY(
        Rectangle.northwest(rectangle),
        z
    );
    const southeastTC = WMTilingScheme.positionToTileXY(
        Rectangle.southeast(rectangle),
        z
    );

    const tiles = [];
    for (let i = northwestTC.x; i <= southeastTC.x; i++) {
        for (let j = northwestTC.y; j <= southeastTC.y; j++) {

            var crc = WMTilingScheme.tileXYToRectangle(i, j, z, new Rectangle());

            tiles.push({
                level: z,
                x: i,
                y: j,
                rectangle: crc
            });
        }
    }

    return tiles;
}

/**
 * Gets the level with the specified world coordinate spacing between texels, or less.
 *
 * @param {ImageryLayer} layer The imagery layer to use.
 * @param {number} texelSpacing The texel spacing for which to find a corresponding level.
 * @param {number} latitudeClosestToEquator The latitude closest to the equator that we're concerned with.
 * @returns {number} The level with the specified texel spacing or less.
 * @private
 */
function getLevelWithMaximumTexelSpacing(
    tilingScheme,
    tileWidth,
    texelSpacing,
    latitudeClosestToEquator
) {
    // PERFORMANCE_IDEA: factor out the stuff that doesn't change.
    const ellipsoid = tilingScheme.ellipsoid;
    const latitudeFactor = !(
        tilingScheme.projection instanceof GeographicProjection
    )
        ? Math.cos(latitudeClosestToEquator)
        : 1.0;
    const tilingSchemeRectangle = tilingScheme.rectangle;
    const levelZeroMaximumTexelSpacing =
        (ellipsoid.maximumRadius * tilingSchemeRectangle.width * latitudeFactor) /
        (tileWidth * tilingScheme.getNumberOfXTilesAtLevel(0));

    const twoToTheLevelPower = levelZeroMaximumTexelSpacing / texelSpacing;
    const level = Math.log(twoToTheLevelPower) / Math.log(2);
    const rounded = Math.round(level);
    return rounded | 0;
}

function renderData(geoJsons, scene, renderOptions, mvtUrl) {
    if (geoJsons) {

        const instanceMap = new Map();

        for (let i = 0, il = geoJsons.length; i < il; i++) {

            const render = GeoJsonRenderFactory.getRender(geoJsons[i], renderOptions);
            if (render) {
                const instances = render.toInstances(scene);
                if (instances) {

                    if (!instanceMap.has(render.type)) {
                        instanceMap.set(render.type, instances)
                    }
                    else {
                        let finalInstance = instanceMap.get(render.type)
                        finalInstance = finalInstance.concat(instances)
                        instanceMap.set(render.type, finalInstance)
                    }
                }
            }
        }

        if (instanceMap.size > 0) {
            const primitives = [];

            instanceMap.forEach((finalInstance, type, m) => {

                const renderClass = GeoJsonRenderFactory.getRenderClass(type);
                if (renderClass) {

                    const fil = finalInstance.length
                    const count = Math.ceil(fil / maxUnitPerPrimitive);
                    for (let i = 0; i < count; i++) {
                        const s = i * maxUnitPerPrimitive;
                        const e = s + maxUnitPerPrimitive;
                        const subInstaces = finalInstance.slice(s, e);

                        const primitive = renderClass.instancesToPrimitive(subInstaces, scene, mvtUrl, renderOptions);
                        primitives.push(primitive);
                    }
                }
            })

            return primitives;
        }

    }
    return null;
}

async function getTileGeoJsons(tile, url, pixelScale) {
    const { level, x, y } = tile;
    // "http://localhost:8084/api/v1/vector-tiles/f9daf1be8c864da1c9b4eb78fa5502fc/tiles/{z}/{x}/{y}";
    const realUrl = url.replace("{z}", level).replace("{x}", x).replace("{y}", y)
    return await decodePbfToGeoJsonsAndFilter.bind(this)(realUrl, level, x, y, pixelScale);
}

import decodePbfToGeoJsons from './decodePbfToGeoJsons.js';

/**
 * 根据pbf的url，获取数据，并转换为GeoJson数据
 * @param {*} pbfurl 
 * @param {*} level 
 * @param {*} x 
 * @param {*} y 
 * @param {*} pixelScale 
 * @returns 
 */
async function decodePbfToGeoJsonsAndFilter(pbfurl, level, x, y, pixelScale) {
    const resGS = await decodePbfToGeoJsons(pbfurl, level, x, y);
    if (resGS) {
        resGS.filter(geoJson => {
            const render = GeoJsonRenderFactory.getRender(geoJson, this.options.renderOptions);
            if (render) {
                const rect = render.getRect();

                if (rect) {
                    const length = Math.max(rect.width, rect.height);
                    return length > pixelScale
                }
            }

            return false;
        });
    }

    return resGS;
}

const tileFlag = "tiles/{z}/{x}/{y}"
const tileMetaData = "metadata"
function getMetaDataUrl(url) {
    // 元数据：http://localhost:8084/api/v1/vector-tiles/6856969a7990b9f69b6679e6174e0d5a/metadata
    // url:   http://localhost:8084/api/v1/vector-tiles/6856969a7990b9f69b6679e6174e0d5a/tiles/{z}/{x}/{y}

    if (url.indexOf(tileFlag) > 0) {
        return url.replace(tileFlag, tileMetaData);
    }

    return void 0;
}

/**
 * 选择一个GeoJson转换为Primitive
 * @param {*} tempGeoJsons geoJson队列
 * @param {*} loadedPrimitives primitive队列
 */
function pickAGeoJsonToPrimitives(mvtPrimitive) {
    const { tempGeoJsons, loadedPrimitives, scene, renderOptions } = mvtPrimitive
    const iterator1 = tempGeoJsons.keys();
    let sk = iterator1.next().value;

    let sv = tempGeoJsons.get(sk)

    while (!sv && sk){
        sk = iterator1.next().value;
        sv = tempGeoJsons.get(sk)
    }

    tempGeoJsons.delete(sk);
    const pritives = renderData(sv, scene, renderOptions, mvtPrimitive.url, renderOptions);
    if (pritives && pritives.length > 0) {
        loadedPrimitives.set(sk, pritives)
    }
}

/**
 * 挑选一个Primitive进行渲染
 * @param {*} loadedPrimitives 
 * @param {*} _primitive 
 * @param {*} loadedTiles 
 */
function pickAPrimitiveToRender(mvtPrimitive) {
    if (mvtPrimitive.loadedPrimitives.size > 0) {
        const { loadedPrimitives, _primitive } = mvtPrimitive
        const iter = loadedPrimitives.keys();
        const sk = iter.next().value;
        const primitives = loadedPrimitives.get(sk)
        if (primitives.length > 0) {

            for(let i = 0, il = primitives.length; i < il; i++){
                
                const fst = primitives[i]
                if (fst) {
                    _primitive.add(fst);
                }
                else{
                    debugger;
                }
            }

            loadedPrimitives.delete(sk);
            return { key: sk, primitives }
        }
    }
}

function removeOutScreenTiles(mvtPrimitive) {
    if (mvtPrimitive.removingTiles.size > 0) {
        const {
            removingTiles, _primitive, loadedTiles, 
        } = mvtPrimitive

        const iter = removingTiles.keys();
        let sk = iter.next().value;
        const items = removingTiles.get(sk)
        if (items) {
            for (let i = 0, il = items.length; i < il; i++) {
                const item = items[i]
                _primitive.remove(item)
            }
        }
        loadedTiles.delete(sk);
        removingTiles.delete(sk);
    }
}

/**
 * 挑选一个Tile并解析数据为GeoJson
 * @param {*} loadingTiles 
 * @param {*} loadedTiles 
 * @param {*} globe 
 * @param {*} frameState 
 * @param {*} tempGeoJsons 
 * @param {*} url 
 */
async function pickATileAndParseToGeoJson(loadingTiles, failedTiles, globe, frameState, tempGeoJsons, url) {
    const tilesToRender = globe._surface._tilesToRender;
    if (tilesToRender && tilesToRender.length > 0) {
        const globeMesh = tilesToRender[0].data.mesh;
        if (globeMesh && globeMesh.boundingSphere3D) {
            if (loadingTiles.size > 0) {
                const iterator1 = loadingTiles.keys();
                const sk = iterator1.next().value;

                const sv = loadingTiles.get(sk)
                loadingTiles.delete(sk);
                tempGeoJsons.set(sk, null);

                const firstbs = globeMesh.boundingSphere3D
                const pixelScale = frameState.camera.getPixelSize(
                    firstbs,
                    frameState.context.drawingBufferWidth,
                    frameState.context.drawingBufferHeight
                );

                // renderData _primitive
                // 6378166 为一弧度对应的近似距离米数
                // 3189083 = 6378166 / 2
                const geoJsons = await getTileGeoJsons.bind(this)(sv, url, pixelScale / 3189083);
                if (geoJsons) {
                    tempGeoJsons.set(sk, geoJsons);
                }
                else{
                    failedTiles.set(sk, true);
                    tempGeoJsons.delete(sk);
                }
            }
        }
    }
}

/**
 * 计算当前可见的瓦片集合
 * @param {*} mvtPrimitive 
 */
function calcVisibleTiles(mvtPrimitive) {
    const { tileSize, minZoom, maxZoom, offsetZoom} = mvtPrimitive;
    const { scene, failedTiles, loadingTiles, tempGeoJsons, loadedPrimitives, rendingPrimitives , loadedTiles, removingTiles } = mvtPrimitive;
    const globe = scene.globe;
    const currentTiles = parseTilesToRender(globe, tileSize, minZoom, maxZoom, offsetZoom);

    const size = currentTiles.size;
    if (size < 1) {
        return;
    }

    failedTiles.forEach((v, k) => {
        if(currentTiles.has(k)){
            currentTiles.delete(k);
        }
    });

    const currentTilesCopy = new Map();
    currentTiles.forEach((v, k) => {
        currentTilesCopy.set(k, v)
    })


    loadingTiles.forEach((v, k,) => {
        if (currentTiles.has(k)) {
            currentTiles.delete(k);
        }
    })
    
    tempGeoJsons.forEach((v, k) => {
        if (currentTiles.has(k)) {
            currentTiles.delete(k);
        }
    })

    loadedPrimitives.forEach((v, k) => {
        if (currentTiles.has(k)) {
            currentTiles.delete(k);
        }
    })

    rendingPrimitives.forEach((v, k,) => {
        if (currentTiles.has(k)) {
            currentTiles.delete(k);
        }
    })

    loadedTiles.forEach((v, k) => {
        if (currentTiles.has(k)) {
            currentTiles.delete(k);
        }
    })

    removingTiles.forEach((v, k) => {
        if (currentTiles.has(k)) {
            loadedTiles.set(k, removingTiles.get(k))
            removingTiles.delete(k)
            currentTiles.delete(k);
        }
    })


    const needsToRemvingTiles = [];
    loadingTiles.forEach((v, k, m) => {
        if (!currentTilesCopy.has(k)) {
            needsToRemvingTiles.push({ v, k });
        }
    })

    for (let i = 0, il = needsToRemvingTiles.length; i < il; i++) {
        let item = needsToRemvingTiles[i]
        // item.v.destroy();
        loadingTiles.delete(item.k);
    }
    
    
    const needsToRemvingPs = []
    loadedPrimitives.forEach((v, k, m) => {
        if (!currentTilesCopy.has(k)) {
            needsToRemvingPs.push({ v, k });
        }
    })

    for (let i = 0, il = needsToRemvingPs.length; i < il; i++) {
        let item = needsToRemvingPs[i]
        loadedPrimitives.delete(item.k);
    }

    currentTiles.forEach((v, k, m) => {
        loadingTiles.set(k, v);
    })


    findCanRemoveTiles(mvtPrimitive, currentTilesCopy);
    
}

function findCanRemoveTiles(mvtPrimitive, currentTiles){
    
    const {loadedTiles, removingTiles} = mvtPrimitive;

    
    // loadedTiles.forEach((v, k, m) => {
    //     if (!currentTiles.has(k)) {
    //         removingTiles.set(k, v)
    //     }
    // })

    const unloadedKeys = [];
    currentTiles.forEach((v, k, m) => {
        if (!loadedTiles.has(k)) {
            unloadedKeys.push(k);
        }
    })

    const revovingKeys = new Map();
    let maxz = 0;
    let minz = 100;
    loadedTiles.forEach((v, k, m) => {
        if (!currentTiles.has(k)) {
            revovingKeys.set(k, v);
            const xyz = NumberKeyHelper.xyz(k)
            minz = Math.min(xyz.z, minz);
            maxz = Math.max(xyz.z, maxz);
        }
    })

    for(let i = 0, il = unloadedKeys.length; i < il; i++){
        const key = unloadedKeys[i];
        const xyz = NumberKeyHelper.xyz(key)
        let tr = deleteParentRemoveingTiles(xyz.x, xyz.y, xyz.z, revovingKeys, Math.max(minz, xyz.z - 3));
        if(!tr){
            deleteChildRemoveingTiles(xyz.x, xyz.y, xyz.z, revovingKeys, Math.min(maxz, xyz.z + 3));
        }
    }

    revovingKeys.forEach((v, k, m) => {
        removingTiles.set(k, v)
    })
}

function deleteChildRemoveingTiles(tx, ty, tz, revovingKeys, maxz){
    if(revovingKeys.size < 1){
        return false;
    }

    let cz = tz + 1;

    if(cz > maxz){
        return false;
    }

    let cx = tx * 2, cy = ty * 2;
    let tk = NumberKeyHelper.make(cx, cy, cz);
    if(revovingKeys.has(tk)){
        revovingKeys.delete(tk);
    }
    else{
        deleteChildRemoveingTiles( cx, cy, cz, revovingKeys, maxz);
    }

    cx = tx * 2 + 1, cy = ty * 2;
    tk = NumberKeyHelper.make(cx, cy, cz);
    if(revovingKeys.has(tk)){
        revovingKeys.delete(tk);
    }
    else{
        deleteChildRemoveingTiles(cx, cy, cz, revovingKeys, maxz);
    }

    cx = tx * 2, cy = ty * 2 + 1;
    tk = NumberKeyHelper.make(cx, cy, cz);
    if(revovingKeys.has(tk)){
        revovingKeys.delete(tk);
    }
    else{
        deleteChildRemoveingTiles( cx, cy, cz, revovingKeys, maxz);
    }

    cx = tx * 2 + 1, cy = ty * 2 + 1;
    tk = NumberKeyHelper.make(cx, cy, cz);
    if(revovingKeys.has(tk)){
        revovingKeys.delete(tk);
    }
    else{
        deleteChildRemoveingTiles( cx, cy, cz, revovingKeys, maxz);
    }
}

function deleteParentRemoveingTiles(tx, ty, tz, revovingKeys, minz){
    if(revovingKeys.size < 1){
        return false;
    }

    tx = Math.floor(tx / 2)
    ty = Math.floor(ty / 2)
    tz = tz - 1
    if(tz < minz){
        return false;
    }


    let tk = NumberKeyHelper.make(tx, ty, tz);
    if(revovingKeys.has(tk)){
        revovingKeys.delete(tk);
        return true;
    }
    else{
        return deleteParentRemoveingTiles( tx, ty, tz, revovingKeys, minz);
    }
}

function transTileCoord(tile, dstLevel) {
    const { x, y, level } = tile
    const delta = dstLevel - level;

    const s = Math.pow(2, delta);

    return {
        x: x * s,
        y: y * s
    }
}

export default MVTDynamicPrimitive;
