
/**
 * 使用方式
 * const dayNight = new DayAndNight({ map: map // map 地图对象})
 * 修改类型
 * dayNight.setConfigProperty(value)
 */
export class DayAndNight {
    constructor(sdMap) {
      this.map = sdMap.map;
  
      this.initStyle();
    }
  
    // 初始化时添加必要样式
    initStyle() {
      const map = this.map;
  
      // 添加一个方向灯
      map.setLights([
        {
          id: "ambient",
          type: "ambient",
          properties: {
            color: [
              "match",
              ["config", "lightPreset"],
              "dawn",
              "hsl(28, 98%, 93%)",
              "day",
              "hsl(0, 0%, 100%)",
              "dusk",
              "hsl(228, 27%, 29%)",
              "night",
              "hsl(217, 100%, 11%)",
              "hsl(0, 0%, 100%)",
            ],
            intensity: [
              "match",
              ["config", "lightPreset"],
              "dawn",
              0.75,
              "day",
              0.8,
              "dusk",
              0.8,
              "night",
              0.5,
              0.8,
            ],
          },
        },
        {
          id: "directional",
          type: "directional",
          properties: {
            direction: [
              "match",
              ["config", "lightPreset"],
              "dawn",
              ["literal", [120, 50]],
              "day",
              ["literal", [180, 20]],
              "dusk",
              ["literal", [240, 80]],
              "night",
              ["literal", [270, 20]],
              ["literal", [180, 20]],
            ],
            color: [
              "match",
              ["config", "lightPreset"],
              "dawn",
              "hsl(33, 98%, 77%)",
              "day",
              "hsl(0, 0%, 100%)",
              "dusk",
              "hsl(30, 98%, 76%)",
              "night",
              "hsl(0, 0%, 29%)",
              "hsl(0, 0%, 100%)",
            ],
            intensity: [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              [
                "match",
                ["config", "lightPreset"],
                "dawn",
                0.5,
                "day",
                0.2,
                "dusk",
                0,
                "night",
                0,
                0.2,
              ],
              14,
              [
                "match",
                ["config", "lightPreset"],
                "dawn",
                0.5,
                "day",
                0.2,
                "dusk",
                0.2,
                "night",
                0.5,
                0.2,
              ],
            ],
            "cast-shadows": true,
            "shadow-intensity": [
              "match",
              ["config", "lightPreset"],
              "night",
              0.5,
              1,
            ],
          },
        },
      ]);
      // 添加雾
      map.setFog({
        "vertical-range": [30, 120],
        range: [
          "interpolate",
          ["linear"],
          ["zoom"],
          13,
          ["literal", [1, 10]],
          15,
          ["literal", [1, 4]],
        ],
        color: [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          [
            "interpolate",
            ["linear"],
            ["measure-light", "brightness"],
            0.1,
            "hsla(240, 9%, 55%, 1)",
            0.4,
            "hsla(0, 0%, 100%, 1)",
          ],
          7,
          [
            "interpolate",
            ["linear"],
            ["measure-light", "brightness"],
            0.02,
            "hsla(213, 63%, 20%, 0.9)",
            0.03,
            "hsla(30, 65%, 60%, 0.5)",
            0.4,
            "hsla(10, 79%, 88%, 0.95)",
            0.45,
            "hsla(200, 60%, 98%, 0.9)",
          ],
        ],
        "high-color": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          [
            "interpolate",
            ["linear"],
            ["measure-light", "brightness"],
            0.1,
            "hsla(215, 100%, 20%, 1)",
            0.4,
            "hsla(215, 100%, 51%, 1)",
          ],
          7,
          [
            "interpolate",
            ["linear"],
            ["measure-light", "brightness"],
            0,
            "hsla(228, 38%, 20%, 1)",
            0.05,
            "hsla(360, 100%, 85%, 1)",
            0.2,
            "hsla(205, 88%, 86%, 1)",
            0.4,
            "hsla(270, 65%, 85%, 1)",
            0.45,
            "hsla(0, 0%, 100%, 1)",
          ],
        ],
        "space-color": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          "hsl(211, 84%, 9%)",
          7,
          [
            "interpolate",
            ["linear"],
            ["measure-light", "brightness"],
            0,
            "hsl(211, 84%, 17%)",
            0.2,
            "hsl(210, 40%, 30%)",
            0.4,
            "hsl(270, 45%, 98%)",
            0.45,
            "hsl(210, 100%, 80%)",
          ],
        ],
        "horizon-blend": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.01,
          7,
          [
            "interpolate",
            ["exponential", 1.2],
            ["measure-light", "brightness"],
            0.35,
            0.03,
            0.4,
            0.1,
            0.45,
            0.03,
          ],
        ],
        "star-intensity": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.4,
          7,
          [
            "interpolate",
            ["exponential", 1.2],
            ["measure-light", "brightness"],
            0.1,
            0.2,
            0.3,
            0,
          ],
        ],
      });
      // 修改相机类型
      map.setCamera({
        "camera-projection": "orthographic", // perspective 默认
      });
      // 默认白天
      map.setConfigProperty("", "lightPreset", "day");
    }
  
    /**
     * 修改
     * @param {*} value
     * day    白天
     * night  夜晚
     * dawn   破晓
     * dusk   黄昏
     */
    setConfigProperty(value) {
      const map = this.map;
  
      map.setConfigProperty("", "lightPreset", value);
    }
  }