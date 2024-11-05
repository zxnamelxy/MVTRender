/* eslint-disable */
import * as Cesium from 'cesium';

export const {
    VERSION,
    Billboard,
    BillboardCollection,
    BoundingRectangle,
    Cartesian2,
    Cartesian3,
    Cartographic,
    Color,
    defined,
    defaultValue,
    destroyObject,
    EllipsoidSurfaceAppearance,
    GeometryInstance,
    GroundPolylineGeometry,
    GroundPolylinePrimitive,
    GeographicProjection,
    HorizontalOrigin,
    JulianDate,
    LabelCollection,
    LabelStyle,
    Material,
    Math,
    PolygonHierarchy,
    PolygonGeometry,
    PolylineMaterialAppearance,
    Primitive,
    PrimitiveCollection,
    Rectangle,
    VerticalOrigin,
    WebMercatorTilingScheme,
    WebMercatorProjection,
    PointPrimitiveCollection
} = Cesium;

optimizeBillboard();

/**
 * 优化 billboard 的渲染逻辑，解决在 1.106.1 中，清除公告板，再动态添加公告板闪烁的问题
 * 次问题包括注记的渲染，也有类似的问题
 */
function optimizeBillboard () {
    if (VERSION === "1.106.1") {

        const IMAGE_INDEX_INDEX = Billboard.IMAGE_INDEX_INDEX;

        function makeDirty (billboard, propertyChanged) {
            const billboardCollection = billboard._billboardCollection;
            if (defined(billboardCollection)) {
                billboardCollection._updateBillboard(billboard, propertyChanged);
                billboard._dirty = true;
            }
        }

        Billboard.prototype._loadImage = function () {
            const atlas = this._billboardCollection._textureAtlas;

            const imageId = this._imageId;
            const image = this._image;
            const imageSubRegion = this._imageSubRegion;
            let imageIndexPromise;

            const that = this;
            function completeImageLoad (index) {
                if (
                    that._imageId !== imageId ||
                    that._image !== image ||
                    !BoundingRectangle.equals(that._imageSubRegion, imageSubRegion)
                ) {
                    // another load occurred before this one finished, ignore the index
                    return;
                }

                // fill in imageWidth and imageHeight
                const textureCoordinates = atlas.textureCoordinates[index];
                that._imageWidth = atlas.texture.width * textureCoordinates.width;
                that._imageHeight = atlas.texture.height * textureCoordinates.height;

                that._imageIndex = index;
                that._ready = true;
                that._image = undefined;
                that._imageIndexPromise = undefined;
                makeDirty(that, IMAGE_INDEX_INDEX);
            }

            if (defined(image)) {
                imageIndexPromise = atlas.addImage(imageId, image);
            }
            if (defined(imageSubRegion)) {
                imageIndexPromise = atlas.addSubRegion(imageId, imageSubRegion);
            }

            this._imageIndexPromise = imageIndexPromise;

            if (!defined(imageIndexPromise)) {
                return;
            }

            // If the promise has already successfully resolved, we can return immediately without waiting a frame
            const index = atlas.getImageIndex(imageId);
            if (defined(index) && !defined(imageSubRegion)) {
                completeImageLoad(index);
                return;
            }

            imageIndexPromise.then(completeImageLoad).catch(function (error) {
                console.error(`Error loading image for billboard: ${error}`);
                that._imageIndexPromise = undefined;
            });
        };
    }

}
