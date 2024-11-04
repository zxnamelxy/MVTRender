// import KDBush from "kdbush";
import {
    Cartesian2, Cartographic, destroyObject, LabelCollection, Rectangle
} from "./cesiumAdapter.js";

const interedRect = new Rectangle();

/**
 * @class LabelsClusterPrimitive 的集合
 * 旨在提高LabelsClusterPrimitive的渲染效率
 * 
 */
export default class LabelsClusterPrimitiveCollection {
    constructor(scene) {
        this.scene = scene;

        this.clusters = [];
        this.updateIndex = 0;
        this.lastFrameNumber = -1;
        this.lastUpdateFrameNumber = -1;
        this.refrence = 0;

        // 在x y 两个方向的注记数量
        this.xLabelNum = 10;
        this.yLabelNum = 10;

        this.labelCol = new LabelCollection({
            scene,
        });

        this.camHasChanged = true;
        this._removeEventListener = scene.camera.changed.addEventListener(this.camChanged.bind(this));
    }

    camChanged() {
        this.camHasChanged = true;
    }

    add(cluster) {
        this.clusters.push(cluster);
    }

    remove(cluster, destroy = true) {
        this.clusters = this.clusters.filter(_ => _ !== cluster);
        destroy && cluster.destroy();
    }


    update(frameState) {

        // 一帧只渲染一次
        if (this.lastFrameNumber === frameState.frameNumber) {
            return;
        }

        this.lastFrameNumber = frameState.frameNumber

        const { scene, xLabelNum, yLabelNum, labelCol, clusters, camHasChanged } = this;
        const { width, height } = scene.canvas;
        const pdx = width / xLabelNum;
        const pdy = height / yLabelNum;
        const ellipsoid = scene.globe.ellipsoid;
        const camera = scene.camera;

        if (camHasChanged && this.lastUpdateFrameNumber + 60 < frameState.frameNumber) {
            this.camHasChanged = false;
            this.lastUpdateFrameNumber = frameState.frameNumber;
            const allKdLabels = [];

            for (let i = 0; i < xLabelNum; i++) {
                const px = i * pdx;
                const px1 = px + pdx;
                for (let j = 0; j < yLabelNum; j++) {
                    const py = j * pdy;
                    const c1 = camera.pickEllipsoid(new Cartesian2(px, py), ellipsoid);
                    const c2 = camera.pickEllipsoid(new Cartesian2(px1, py + pdy), ellipsoid);
                    if (c1 && c2) {
                        const cc1 = Cartographic.fromCartesian(c1);
                        const cc2 = Cartographic.fromCartesian(c2);

                        const lon1 = cc1.longitude;
                        const lat1 = cc1.latitude;

                        const lon2 = cc2.longitude;
                        const lat2 = cc2.latitude;

                        const minlon = Math.min(lon1, lon2);
                        const maxlon = Math.max(lon1, lon2);
                        const minlat = Math.min(lat1, lat2);
                        const maxlat = Math.max(lat1, lat2);
                        const srect = new Rectangle(minlon, minlat, maxlon, maxlat);
                        for (let i = 0, il = clusters.length; i < il; i++) {
                            const cluster = clusters[i]
                            if (!cluster.kdFinished) {
                                cluster._makeKd();
                                break;
                            }
                            else {
                                const rect = cluster.rect;
                                const inteRes = Rectangle.intersection(srect, rect, interedRect);
                                if (inteRes) {
                                    const label = cluster.getHighLevelLablesByRect(inteRes);
                                    if (label) {
                                        allKdLabels.push(label);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (allKdLabels.length > 0) {
                labelCol.removeAll();
                for (let i = 0, il = allKdLabels.length; i < il; i++) {
                    labelCol.add(allKdLabels[i]);
                }
            }
        }

        labelCol.update(frameState);
    }

    updateold(frameState) {
        // 一帧只渲染一次
        if (this.lastFrameNumber === frameState.frameNumber) {
            return;
        }

        const { clusters } = this;

        this.lastFrameNumber = frameState.frameNumber

        for (let i = 0, il = clusters.length; i < il; i++) {
            clusters[i].update(frameState, i === this.updateIndex)
        }

        this.updateIndex++;
        if (this.updateIndex >= clusters.length) {
            this.updateIndex = 0;
        }
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
        this.refrence--;
        if (this.refrence === 0 && !this.isDestroyed()) {
            this._removeEventListener();
            return destroyObject(this);
        }
    }

    addRefrence() {
        this.refrence++
    }

}