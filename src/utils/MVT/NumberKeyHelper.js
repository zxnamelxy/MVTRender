/* eslint-disable */
// Number 的有效二进制为 为 53位， 
// 瓦片坐标的 z 不超过32，故可以用其中5位标识
// x使用24为
// y使用24位
// 正好是53位

// y使用高24位，x使用低24位，z使用最低的5位
const flagxy = new Uint32Array(2);
/* eslint-disable */
flagxy[0] = 0b1_1111_1111_1111_1111_1111_1111;

const offsetxy = 24;
const xymax = 1 << offsetxy;
const offsetz = 5;
const zmax = 1 << offsetz;
const offsetxyz = offsetxy + offsetz;

function convertIntegerToFloat(integer) {
    // 计算整数的位数
    const integerLength = integer.toString().length;

    // 推断小数位数
    const decimalPlaces = integerLength - 1;

    // 计算需要除以的基数
    const divisor = Math.pow(10, decimalPlaces);

    // 将整数转换为浮点数
    const floatNumber = integer / divisor;

    return floatNumber;
}

function convertFloatToInteger(floatNumberString) {
    const exp = floatNumberString.length - 2;
    return +floatNumberString * Math.pow(10, exp);
}


export default class NumberKeyHelper {

    constructor() {
        if (!NumberKeyHelper.maxLevel) {
            NumberKeyHelper.maxLevel = offsetxy;
        }
        if (!NumberKeyHelper.maxTileCoord) {
            NumberKeyHelper.maxTileCoord = xymax;
        }
    }

    static make(x, y, z) {
        return `${x}_${y}_${z}`
    }

    static xyz(key) {
        const t = key.split("_");
        return {x: +t[0], y: +t[1], z: +t[2]};
    }

    static z(key) {
        const t = key.split("_");
        return +t[2];
    }

    static x(key) {
        const t = key.split("_");
        return +t[0];
    }

    static y(key) {
        const t = key.split("_");
        return +t[1];
    }
}


window.NumberKeyHelper = NumberKeyHelper;