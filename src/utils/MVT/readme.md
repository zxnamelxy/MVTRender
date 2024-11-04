# 实现MVT服务的矢量渲染

使用说明

## 主入口文件：MVTDynamicPrimitive.js

## 使用步骤

1. 安装必须依赖库：cesium、@mapbox/vector-tile、kdbush、pbf
```json
  "dependencies": {
    "@mapbox/vector-tile": "^2.0.3",
    "kdbush": "^4.0.2",
    "pbf": "^4.0.1",
    "cesium": "^1.106.1"
  }
```

2. 引入必须的依赖库
```js
import "cesium/Build/Cesium/Widgets/widgets.css"
import * as Cesium from 'cesium';
```

3. 初始化Cesium
```js
    viewer = new Cesium.Viewer('cesiumContainer');
```

4. 从cesium-mvt-vector-renderer.min.js中引入MVTDynamicPrimitive对象
```js
    import MVTDynamicPrimitive from "./MVTDynamicPrimitive.js"
```
5. new一个MVTDynamicPrimitive对象，并传入参数

```js
    const mvtUrl = "http://localhost:8084/api/v1/vector-tiles/cad5ae7dd414d76fbeb4897d42907128/tiles/{z}/{x}/{y}";
    const mvtp = new MVTDynamicPrimitive(viewer.scene, mvtUrl, {
        // 矢量瓦片偏移级别
        offsetZoom: -5,
        renderOptions:
        {
            // 点渲染参数
            Point: {
                // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
                textField: 'name',
                //  
                minLabelNum: 500,
                // 是否显示点
                // showPoint: false,
                // 注记参数，详情参考 Cesium.Label.ConstructorOptions
                textOptions: {
                    fillColor: Cesium.Color.BLACK,
                    outlineColor: Cesium.Color.WHITE,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -16),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 5,
                    font: "20px sans-serif",
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                    height: 100,
                    disableDepthTestDistance: 10000000,
                }
            }
        }
    });
```
6. 将MVTDynamicPrimitive添加到scene中
```js
    viewer.scene.primitives.add(mvtp);
```

7. 拾取
```js
// 注册拾取事件
viewer.screenSpaceEventHandler.setInputAction(pickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// 参考拾取事件代码
let pickAction = e => {
    const pick = viewer.scene.pick(e.position);
    if (pick && Cesium.defined(pick.id)) {
        let properties = null;
        if(pick.collection && pick.collection.getMvtGeoJson){
            properties = pick.collection.getMvtGeoJson(pick);
        }
        else if(!properties && pick.primitive && pick.primitive.getMvtGeoJson){
            properties = pick.primitive.getMvtGeoJson(pick);
        }
        
        alert(JSON.stringify(properties));
    }
};

```