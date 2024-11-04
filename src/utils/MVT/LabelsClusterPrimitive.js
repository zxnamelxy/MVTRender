import KDBush from "kdbush";

import {
    Cartesian2,
    Cartographic, defined,
    destroyObject, LabelCollection, Rectangle
} from "./cesiumAdapter.js";

const oneTimeKdCount = 500;

const rectBuffer = new Rectangle();

export default class LabelsClusterPrimitive {

    /**
     * 
     * @param {*} scene 
     * @param {*} labels 
     * @param {*} options 注记调度参数
     * @param {*} [options.minLabelNum = 10] 最小注记数量，如果分块内的注记数量，小于该值，则不进行调度
     */
    constructor(scene, labels, options) {
        this.scene = scene;
        this.labels = labels;
        this.options = { ...options };
        this.options.minLabelNum = options.minLabelNum || 10

        // 在x y 两个方向的注记数量
        this.xLabelNum = 4;
        this.yLabelNum = 4;

        this.minScale = Math.min(1 / this.xLabelNum, 1 / this.yLabelNum);

        if (labels && labels.length > 0) {
            this.kd = new KDBush(labels.length);
            this.kdFinished = false;
            // this._removeEventListener = scene.camera.changed.addEventListener(this.camChanged.bind(this));
            this.camHasChanged = false;
            this.rect = new Rectangle(Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            this.labelCol = new LabelCollection({
                scene,
            });
        }
    }



    /**
     * 获取精细级别的注记集合
     */
    getHighLevelLabels() {

        const { scene, kd, xLabelNum, yLabelNum, rect, labels, minScale } = this;

        const { width, height } = scene.canvas;

        let highLevelLabels = [];
        if (labels.length > this.options.minLabelNum) {

            const pdx = width / xLabelNum;
            const pdy = height / yLabelNum;
            const ellipsoid = scene.globe.ellipsoid;
            const camera = scene.camera;
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

                        const indexs = kd.range(minlon, minlat, maxlon, maxlat);
                        if (indexs && indexs.length > 0) {

                            let l = labels[indexs[0]];
                            highLevelLabels.push(l);
                        }
                    }
                }
            }
        }
        else {
            highLevelLabels = labels;
        }

        return highLevelLabels;
    }

    getHighLevelLablesByRect(rect){
        const { kd, labels } = this;

        const indexs = kd.range(rect.west, rect.south, rect.east, rect.north);
        if (indexs && indexs.length > 0) {
            return labels[indexs[0]];
        }
    }

    /**
     * 获取二次筛选的粗略级别的注记集合
     */
    getLowLevelLabels(highLevelLabels, labelCol) {
        const { scene, xLabelNum, yLabelNum } = this;

        if (highLevelLabels && highLevelLabels.length > 0) {

            labelCol.removeAll();
            const ltl = highLevelLabels.length;
            for (let i = 0; i < ltl; i++) {
                labelCol.add(highLevelLabels[i]);
            }

            // // 小于minLabelNum个注记，直接显示
            // if (ltl > this.options.minLabelNum) {
            //     const screenLabels = [];
            //     for (let i = 0, il = ltl; i < il; i++) {
            //         const item = labelCol.get(i);

            //         const coord = item.computeScreenSpacePosition(scene);
            //         if (!Cesium.defined(coord)) {
            //             continue;
            //         }

            //         screenLabels.push({ coord, item: highLevelLabels[i] });
            //     }

            //     const tindex = new KDBush(screenLabels.length);

            //     const rect = new Rectangle(Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            //     for (let i = 0, il = screenLabels.length; i < il; i++) {

            //         const coord = screenLabels[i].coord;

            //         tindex.add(coord.x, coord.y)
            //         rect.west = Math.min(rect.west, coord.x);
            //         rect.east = Math.max(rect.east, coord.x);

            //         rect.south = Math.min(rect.south, coord.y);
            //         rect.north = Math.max(rect.north, coord.y);
            //     }

            //     tindex.finish();

            //     labelCol.removeAll();

            //     const { width, height } = rect;

            //     const { clientWidth, clientHeight } = scene.canvas;
            //     const dx = clientHeight / xLabelNum * 6;
            //     const dy = clientWidth / yLabelNum * 2;

            //     const xn = width / dx;
            //     const yn = height / dy;
            //     for (let i = 0; i < xn; i++) {
            //         const x = rect.west + i * dx;
            //         for (let j = 0; j < yn; j++) {
            //             const y = rect.south + j * dy;
            //             const indexs = tindex.range(x, y, x + dx, y + dy);
            //             if (indexs && indexs.length > 0) {
            //                 labelCol.add(screenLabels[indexs[0]].item);
            //             }
            //         }
            //     }
            // }
        }
    }

    update(frameState, updateLabels = true) {
        if (!this.kdFinished) {
            this._makeKd();
            return;
        }

        const { labelCol } = this;
        if (updateLabels && this.camHasChanged) {

            // 获取高级别的密集注记集合
            const highLevelLabels = this.getHighLevelLabels();

            // 后去二次采样的低级别的稀疏注记集合，用于渲染
            this.getLowLevelLabels(highLevelLabels, labelCol);

            this.camHasChanged = false;
        }

        labelCol.update(frameState)
    }

    camChanged() {
        this.camHasChanged = true;
    }

    _makeKd() {
        if (!defined(this.kdedCount)) {
            this.kdedCount = 0;
        }

        if (this.kdedCount < this.labels.length) {
            const kd = this.kd;
            const fcount = Math.min(this.kdedCount + oneTimeKdCount, this.labels.length)
            const rect = this.rect;
            for (let i = this.kdedCount; i < fcount; i++) {
                const l = this.labels[i]
                kd.add(l.x, l.y);
                rect.west = Math.min(rect.west, l.x)
                rect.east = Math.max(rect.east, l.x)
                rect.south = Math.min(rect.south, l.y)
                rect.north = Math.max(rect.north, l.y)
                this.kdedCount++;
            }

            if (this.kdedCount >= this.labels.length) {
                kd.finish();
                this.kdFinished = true;
                this.camHasChanged = true;
            }
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
        // this._removeEventListener();

        return destroyObject(this);
    }
} 