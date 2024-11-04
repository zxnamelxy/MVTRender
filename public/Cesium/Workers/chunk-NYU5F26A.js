/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.123
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import{f as j}from"./chunk-AODSXSC5.js";import{a as E}from"./chunk-IISQCXJ5.js";import{a as C}from"./chunk-WHQYJFDH.js";import{b as n}from"./chunk-OYWUGDKS.js";import{e as O}from"./chunk-DRYFJEFT.js";function l(r,o,t){return t<0&&(t+=1),t>1&&(t-=1),t*6<1?r+(o-r)*6*t:t*2<1?o:t*3<2?r+(o-r)*(2/3-t)*6:r}function e(r,o,t,f){this.red=C(r,1),this.green=C(o,1),this.blue=C(t,1),this.alpha=C(f,1)}e.fromCartesian4=function(r,o){return n.typeOf.object("cartesian",r),O(o)?(o.red=r.x,o.green=r.y,o.blue=r.z,o.alpha=r.w,o):new e(r.x,r.y,r.z,r.w)};e.fromBytes=function(r,o,t,f,s){return r=e.byteToFloat(C(r,255)),o=e.byteToFloat(C(o,255)),t=e.byteToFloat(C(t,255)),f=e.byteToFloat(C(f,255)),O(s)?(s.red=r,s.green=o,s.blue=t,s.alpha=f,s):new e(r,o,t,f)};e.fromAlpha=function(r,o,t){return n.typeOf.object("color",r),n.typeOf.number("alpha",o),O(t)?(t.red=r.red,t.green=r.green,t.blue=r.blue,t.alpha=o,t):new e(r.red,r.green,r.blue,o)};var A,g,m;j.supportsTypedArrays()&&(A=new ArrayBuffer(4),g=new Uint32Array(A),m=new Uint8Array(A));e.fromRgba=function(r,o){return g[0]=r,e.fromBytes(m[0],m[1],m[2],m[3],o)};e.fromHsl=function(r,o,t,f,s){r=C(r,0)%1,o=C(o,0),t=C(t,0),f=C(f,1);let c=t,b=t,i=t;if(o!==0){let S;t<.5?S=t*(1+o):S=t+o-t*o;let F=2*t-S;c=l(F,S,r+1/3),b=l(F,S,r),i=l(F,S,r-1/3)}return O(s)?(s.red=c,s.green=b,s.blue=i,s.alpha=f,s):new e(c,b,i,f)};e.fromRandom=function(r,o){r=C(r,C.EMPTY_OBJECT);let t=r.red;if(!O(t)){let b=C(r.minimumRed,0),i=C(r.maximumRed,1);n.typeOf.number.lessThanOrEquals("minimumRed",b,i),t=b+E.nextRandomNumber()*(i-b)}let f=r.green;if(!O(f)){let b=C(r.minimumGreen,0),i=C(r.maximumGreen,1);n.typeOf.number.lessThanOrEquals("minimumGreen",b,i),f=b+E.nextRandomNumber()*(i-b)}let s=r.blue;if(!O(s)){let b=C(r.minimumBlue,0),i=C(r.maximumBlue,1);n.typeOf.number.lessThanOrEquals("minimumBlue",b,i),s=b+E.nextRandomNumber()*(i-b)}let c=r.alpha;if(!O(c)){let b=C(r.minimumAlpha,0),i=C(r.maximumAlpha,1);n.typeOf.number.lessThanOrEquals("minimumAlpha",b,i),c=b+E.nextRandomNumber()*(i-b)}return O(o)?(o.red=t,o.green=f,o.blue=s,o.alpha=c,o):new e(t,f,s,c)};var a=/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i,z=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i,p=/^rgba?\s*\(\s*([0-9.]+%?)\s*[,\s]+\s*([0-9.]+%?)\s*[,\s]+\s*([0-9.]+%?)(?:\s*[,\s/]+\s*([0-9.]+))?\s*\)$/i,R=/^hsla?\s*\(\s*([0-9.]+)\s*[,\s]+\s*([0-9.]+%)\s*[,\s]+\s*([0-9.]+%)(?:\s*[,\s/]+\s*([0-9.]+))?\s*\)$/i;e.fromCssColorString=function(r,o){n.typeOf.string("color",r),O(o)||(o=new e),r=r.trim();let t=e[r.toUpperCase()];if(O(t))return e.clone(t,o),o;let f=a.exec(r);return f!==null?(o.red=parseInt(f[1],16)/15,o.green=parseInt(f[2],16)/15,o.blue=parseInt(f[3],16)/15,o.alpha=parseInt(C(f[4],"f"),16)/15,o):(f=z.exec(r),f!==null?(o.red=parseInt(f[1],16)/255,o.green=parseInt(f[2],16)/255,o.blue=parseInt(f[3],16)/255,o.alpha=parseInt(C(f[4],"ff"),16)/255,o):(f=p.exec(r),f!==null?(o.red=parseFloat(f[1])/(f[1].substr(-1)==="%"?100:255),o.green=parseFloat(f[2])/(f[2].substr(-1)==="%"?100:255),o.blue=parseFloat(f[3])/(f[3].substr(-1)==="%"?100:255),o.alpha=parseFloat(C(f[4],"1.0")),o):(f=R.exec(r),f!==null?e.fromHsl(parseFloat(f[1])/360,parseFloat(f[2])/100,parseFloat(f[3])/100,parseFloat(C(f[4],"1.0")),o):(o=void 0,o))))};e.packedLength=4;e.pack=function(r,o,t){return n.typeOf.object("value",r),n.defined("array",o),t=C(t,0),o[t++]=r.red,o[t++]=r.green,o[t++]=r.blue,o[t]=r.alpha,o};e.unpack=function(r,o,t){return n.defined("array",r),o=C(o,0),O(t)||(t=new e),t.red=r[o++],t.green=r[o++],t.blue=r[o++],t.alpha=r[o],t};e.byteToFloat=function(r){return r/255};e.floatToByte=function(r){return r===1?255:r*256|0};e.clone=function(r,o){if(O(r))return O(o)?(o.red=r.red,o.green=r.green,o.blue=r.blue,o.alpha=r.alpha,o):new e(r.red,r.green,r.blue,r.alpha)};e.equals=function(r,o){return r===o||O(r)&&O(o)&&r.red===o.red&&r.green===o.green&&r.blue===o.blue&&r.alpha===o.alpha};e.equalsArray=function(r,o,t){return r.red===o[t]&&r.green===o[t+1]&&r.blue===o[t+2]&&r.alpha===o[t+3]};e.prototype.clone=function(r){return e.clone(this,r)};e.prototype.equals=function(r){return e.equals(this,r)};e.prototype.equalsEpsilon=function(r,o){return this===r||O(r)&&Math.abs(this.red-r.red)<=o&&Math.abs(this.green-r.green)<=o&&Math.abs(this.blue-r.blue)<=o&&Math.abs(this.alpha-r.alpha)<=o};e.prototype.toString=function(){return`(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`};e.prototype.toCssColorString=function(){let r=e.floatToByte(this.red),o=e.floatToByte(this.green),t=e.floatToByte(this.blue);return this.alpha===1?`rgb(${r},${o},${t})`:`rgba(${r},${o},${t},${this.alpha})`};e.prototype.toCssHexString=function(){let r=e.floatToByte(this.red).toString(16);r.length<2&&(r=`0${r}`);let o=e.floatToByte(this.green).toString(16);o.length<2&&(o=`0${o}`);let t=e.floatToByte(this.blue).toString(16);if(t.length<2&&(t=`0${t}`),this.alpha<1){let f=e.floatToByte(this.alpha).toString(16);return f.length<2&&(f=`0${f}`),`#${r}${o}${t}${f}`}return`#${r}${o}${t}`};e.prototype.toBytes=function(r){let o=e.floatToByte(this.red),t=e.floatToByte(this.green),f=e.floatToByte(this.blue),s=e.floatToByte(this.alpha);return O(r)?(r[0]=o,r[1]=t,r[2]=f,r[3]=s,r):[o,t,f,s]};e.prototype.toRgba=function(){return m[0]=e.floatToByte(this.red),m[1]=e.floatToByte(this.green),m[2]=e.floatToByte(this.blue),m[3]=e.floatToByte(this.alpha),g[0]};e.prototype.brighten=function(r,o){return n.typeOf.number("magnitude",r),n.typeOf.number.greaterThanOrEquals("magnitude",r,0),n.typeOf.object("result",o),r=1-r,o.red=1-(1-this.red)*r,o.green=1-(1-this.green)*r,o.blue=1-(1-this.blue)*r,o.alpha=this.alpha,o};e.prototype.darken=function(r,o){return n.typeOf.number("magnitude",r),n.typeOf.number.greaterThanOrEquals("magnitude",r,0),n.typeOf.object("result",o),r=1-r,o.red=this.red*r,o.green=this.green*r,o.blue=this.blue*r,o.alpha=this.alpha,o};e.prototype.withAlpha=function(r,o){return e.fromAlpha(this,r,o)};e.add=function(r,o,t){return n.typeOf.object("left",r),n.typeOf.object("right",o),n.typeOf.object("result",t),t.red=r.red+o.red,t.green=r.green+o.green,t.blue=r.blue+o.blue,t.alpha=r.alpha+o.alpha,t};e.subtract=function(r,o,t){return n.typeOf.object("left",r),n.typeOf.object("right",o),n.typeOf.object("result",t),t.red=r.red-o.red,t.green=r.green-o.green,t.blue=r.blue-o.blue,t.alpha=r.alpha-o.alpha,t};e.multiply=function(r,o,t){return n.typeOf.object("left",r),n.typeOf.object("right",o),n.typeOf.object("result",t),t.red=r.red*o.red,t.green=r.green*o.green,t.blue=r.blue*o.blue,t.alpha=r.alpha*o.alpha,t};e.divide=function(r,o,t){return n.typeOf.object("left",r),n.typeOf.object("right",o),n.typeOf.object("result",t),t.red=r.red/o.red,t.green=r.green/o.green,t.blue=r.blue/o.blue,t.alpha=r.alpha/o.alpha,t};e.mod=function(r,o,t){return n.typeOf.object("left",r),n.typeOf.object("right",o),n.typeOf.object("result",t),t.red=r.red%o.red,t.green=r.green%o.green,t.blue=r.blue%o.blue,t.alpha=r.alpha%o.alpha,t};e.lerp=function(r,o,t,f){return n.typeOf.object("start",r),n.typeOf.object("end",o),n.typeOf.number("t",t),n.typeOf.object("result",f),f.red=E.lerp(r.red,o.red,t),f.green=E.lerp(r.green,o.green,t),f.blue=E.lerp(r.blue,o.blue,t),f.alpha=E.lerp(r.alpha,o.alpha,t),f};e.multiplyByScalar=function(r,o,t){return n.typeOf.object("color",r),n.typeOf.number("scalar",o),n.typeOf.object("result",t),t.red=r.red*o,t.green=r.green*o,t.blue=r.blue*o,t.alpha=r.alpha*o,t};e.divideByScalar=function(r,o,t){return n.typeOf.object("color",r),n.typeOf.number("scalar",o),n.typeOf.object("result",t),t.red=r.red/o,t.green=r.green/o,t.blue=r.blue/o,t.alpha=r.alpha/o,t};e.ALICEBLUE=Object.freeze(e.fromCssColorString("#F0F8FF"));e.ANTIQUEWHITE=Object.freeze(e.fromCssColorString("#FAEBD7"));e.AQUA=Object.freeze(e.fromCssColorString("#00FFFF"));e.AQUAMARINE=Object.freeze(e.fromCssColorString("#7FFFD4"));e.AZURE=Object.freeze(e.fromCssColorString("#F0FFFF"));e.BEIGE=Object.freeze(e.fromCssColorString("#F5F5DC"));e.BISQUE=Object.freeze(e.fromCssColorString("#FFE4C4"));e.BLACK=Object.freeze(e.fromCssColorString("#000000"));e.BLANCHEDALMOND=Object.freeze(e.fromCssColorString("#FFEBCD"));e.BLUE=Object.freeze(e.fromCssColorString("#0000FF"));e.BLUEVIOLET=Object.freeze(e.fromCssColorString("#8A2BE2"));e.BROWN=Object.freeze(e.fromCssColorString("#A52A2A"));e.BURLYWOOD=Object.freeze(e.fromCssColorString("#DEB887"));e.CADETBLUE=Object.freeze(e.fromCssColorString("#5F9EA0"));e.CHARTREUSE=Object.freeze(e.fromCssColorString("#7FFF00"));e.CHOCOLATE=Object.freeze(e.fromCssColorString("#D2691E"));e.CORAL=Object.freeze(e.fromCssColorString("#FF7F50"));e.CORNFLOWERBLUE=Object.freeze(e.fromCssColorString("#6495ED"));e.CORNSILK=Object.freeze(e.fromCssColorString("#FFF8DC"));e.CRIMSON=Object.freeze(e.fromCssColorString("#DC143C"));e.CYAN=Object.freeze(e.fromCssColorString("#00FFFF"));e.DARKBLUE=Object.freeze(e.fromCssColorString("#00008B"));e.DARKCYAN=Object.freeze(e.fromCssColorString("#008B8B"));e.DARKGOLDENROD=Object.freeze(e.fromCssColorString("#B8860B"));e.DARKGRAY=Object.freeze(e.fromCssColorString("#A9A9A9"));e.DARKGREEN=Object.freeze(e.fromCssColorString("#006400"));e.DARKGREY=e.DARKGRAY;e.DARKKHAKI=Object.freeze(e.fromCssColorString("#BDB76B"));e.DARKMAGENTA=Object.freeze(e.fromCssColorString("#8B008B"));e.DARKOLIVEGREEN=Object.freeze(e.fromCssColorString("#556B2F"));e.DARKORANGE=Object.freeze(e.fromCssColorString("#FF8C00"));e.DARKORCHID=Object.freeze(e.fromCssColorString("#9932CC"));e.DARKRED=Object.freeze(e.fromCssColorString("#8B0000"));e.DARKSALMON=Object.freeze(e.fromCssColorString("#E9967A"));e.DARKSEAGREEN=Object.freeze(e.fromCssColorString("#8FBC8F"));e.DARKSLATEBLUE=Object.freeze(e.fromCssColorString("#483D8B"));e.DARKSLATEGRAY=Object.freeze(e.fromCssColorString("#2F4F4F"));e.DARKSLATEGREY=e.DARKSLATEGRAY;e.DARKTURQUOISE=Object.freeze(e.fromCssColorString("#00CED1"));e.DARKVIOLET=Object.freeze(e.fromCssColorString("#9400D3"));e.DEEPPINK=Object.freeze(e.fromCssColorString("#FF1493"));e.DEEPSKYBLUE=Object.freeze(e.fromCssColorString("#00BFFF"));e.DIMGRAY=Object.freeze(e.fromCssColorString("#696969"));e.DIMGREY=e.DIMGRAY;e.DODGERBLUE=Object.freeze(e.fromCssColorString("#1E90FF"));e.FIREBRICK=Object.freeze(e.fromCssColorString("#B22222"));e.FLORALWHITE=Object.freeze(e.fromCssColorString("#FFFAF0"));e.FORESTGREEN=Object.freeze(e.fromCssColorString("#228B22"));e.FUCHSIA=Object.freeze(e.fromCssColorString("#FF00FF"));e.GAINSBORO=Object.freeze(e.fromCssColorString("#DCDCDC"));e.GHOSTWHITE=Object.freeze(e.fromCssColorString("#F8F8FF"));e.GOLD=Object.freeze(e.fromCssColorString("#FFD700"));e.GOLDENROD=Object.freeze(e.fromCssColorString("#DAA520"));e.GRAY=Object.freeze(e.fromCssColorString("#808080"));e.GREEN=Object.freeze(e.fromCssColorString("#008000"));e.GREENYELLOW=Object.freeze(e.fromCssColorString("#ADFF2F"));e.GREY=e.GRAY;e.HONEYDEW=Object.freeze(e.fromCssColorString("#F0FFF0"));e.HOTPINK=Object.freeze(e.fromCssColorString("#FF69B4"));e.INDIANRED=Object.freeze(e.fromCssColorString("#CD5C5C"));e.INDIGO=Object.freeze(e.fromCssColorString("#4B0082"));e.IVORY=Object.freeze(e.fromCssColorString("#FFFFF0"));e.KHAKI=Object.freeze(e.fromCssColorString("#F0E68C"));e.LAVENDER=Object.freeze(e.fromCssColorString("#E6E6FA"));e.LAVENDAR_BLUSH=Object.freeze(e.fromCssColorString("#FFF0F5"));e.LAWNGREEN=Object.freeze(e.fromCssColorString("#7CFC00"));e.LEMONCHIFFON=Object.freeze(e.fromCssColorString("#FFFACD"));e.LIGHTBLUE=Object.freeze(e.fromCssColorString("#ADD8E6"));e.LIGHTCORAL=Object.freeze(e.fromCssColorString("#F08080"));e.LIGHTCYAN=Object.freeze(e.fromCssColorString("#E0FFFF"));e.LIGHTGOLDENRODYELLOW=Object.freeze(e.fromCssColorString("#FAFAD2"));e.LIGHTGRAY=Object.freeze(e.fromCssColorString("#D3D3D3"));e.LIGHTGREEN=Object.freeze(e.fromCssColorString("#90EE90"));e.LIGHTGREY=e.LIGHTGRAY;e.LIGHTPINK=Object.freeze(e.fromCssColorString("#FFB6C1"));e.LIGHTSEAGREEN=Object.freeze(e.fromCssColorString("#20B2AA"));e.LIGHTSKYBLUE=Object.freeze(e.fromCssColorString("#87CEFA"));e.LIGHTSLATEGRAY=Object.freeze(e.fromCssColorString("#778899"));e.LIGHTSLATEGREY=e.LIGHTSLATEGRAY;e.LIGHTSTEELBLUE=Object.freeze(e.fromCssColorString("#B0C4DE"));e.LIGHTYELLOW=Object.freeze(e.fromCssColorString("#FFFFE0"));e.LIME=Object.freeze(e.fromCssColorString("#00FF00"));e.LIMEGREEN=Object.freeze(e.fromCssColorString("#32CD32"));e.LINEN=Object.freeze(e.fromCssColorString("#FAF0E6"));e.MAGENTA=Object.freeze(e.fromCssColorString("#FF00FF"));e.MAROON=Object.freeze(e.fromCssColorString("#800000"));e.MEDIUMAQUAMARINE=Object.freeze(e.fromCssColorString("#66CDAA"));e.MEDIUMBLUE=Object.freeze(e.fromCssColorString("#0000CD"));e.MEDIUMORCHID=Object.freeze(e.fromCssColorString("#BA55D3"));e.MEDIUMPURPLE=Object.freeze(e.fromCssColorString("#9370DB"));e.MEDIUMSEAGREEN=Object.freeze(e.fromCssColorString("#3CB371"));e.MEDIUMSLATEBLUE=Object.freeze(e.fromCssColorString("#7B68EE"));e.MEDIUMSPRINGGREEN=Object.freeze(e.fromCssColorString("#00FA9A"));e.MEDIUMTURQUOISE=Object.freeze(e.fromCssColorString("#48D1CC"));e.MEDIUMVIOLETRED=Object.freeze(e.fromCssColorString("#C71585"));e.MIDNIGHTBLUE=Object.freeze(e.fromCssColorString("#191970"));e.MINTCREAM=Object.freeze(e.fromCssColorString("#F5FFFA"));e.MISTYROSE=Object.freeze(e.fromCssColorString("#FFE4E1"));e.MOCCASIN=Object.freeze(e.fromCssColorString("#FFE4B5"));e.NAVAJOWHITE=Object.freeze(e.fromCssColorString("#FFDEAD"));e.NAVY=Object.freeze(e.fromCssColorString("#000080"));e.OLDLACE=Object.freeze(e.fromCssColorString("#FDF5E6"));e.OLIVE=Object.freeze(e.fromCssColorString("#808000"));e.OLIVEDRAB=Object.freeze(e.fromCssColorString("#6B8E23"));e.ORANGE=Object.freeze(e.fromCssColorString("#FFA500"));e.ORANGERED=Object.freeze(e.fromCssColorString("#FF4500"));e.ORCHID=Object.freeze(e.fromCssColorString("#DA70D6"));e.PALEGOLDENROD=Object.freeze(e.fromCssColorString("#EEE8AA"));e.PALEGREEN=Object.freeze(e.fromCssColorString("#98FB98"));e.PALETURQUOISE=Object.freeze(e.fromCssColorString("#AFEEEE"));e.PALEVIOLETRED=Object.freeze(e.fromCssColorString("#DB7093"));e.PAPAYAWHIP=Object.freeze(e.fromCssColorString("#FFEFD5"));e.PEACHPUFF=Object.freeze(e.fromCssColorString("#FFDAB9"));e.PERU=Object.freeze(e.fromCssColorString("#CD853F"));e.PINK=Object.freeze(e.fromCssColorString("#FFC0CB"));e.PLUM=Object.freeze(e.fromCssColorString("#DDA0DD"));e.POWDERBLUE=Object.freeze(e.fromCssColorString("#B0E0E6"));e.PURPLE=Object.freeze(e.fromCssColorString("#800080"));e.RED=Object.freeze(e.fromCssColorString("#FF0000"));e.ROSYBROWN=Object.freeze(e.fromCssColorString("#BC8F8F"));e.ROYALBLUE=Object.freeze(e.fromCssColorString("#4169E1"));e.SADDLEBROWN=Object.freeze(e.fromCssColorString("#8B4513"));e.SALMON=Object.freeze(e.fromCssColorString("#FA8072"));e.SANDYBROWN=Object.freeze(e.fromCssColorString("#F4A460"));e.SEAGREEN=Object.freeze(e.fromCssColorString("#2E8B57"));e.SEASHELL=Object.freeze(e.fromCssColorString("#FFF5EE"));e.SIENNA=Object.freeze(e.fromCssColorString("#A0522D"));e.SILVER=Object.freeze(e.fromCssColorString("#C0C0C0"));e.SKYBLUE=Object.freeze(e.fromCssColorString("#87CEEB"));e.SLATEBLUE=Object.freeze(e.fromCssColorString("#6A5ACD"));e.SLATEGRAY=Object.freeze(e.fromCssColorString("#708090"));e.SLATEGREY=e.SLATEGRAY;e.SNOW=Object.freeze(e.fromCssColorString("#FFFAFA"));e.SPRINGGREEN=Object.freeze(e.fromCssColorString("#00FF7F"));e.STEELBLUE=Object.freeze(e.fromCssColorString("#4682B4"));e.TAN=Object.freeze(e.fromCssColorString("#D2B48C"));e.TEAL=Object.freeze(e.fromCssColorString("#008080"));e.THISTLE=Object.freeze(e.fromCssColorString("#D8BFD8"));e.TOMATO=Object.freeze(e.fromCssColorString("#FF6347"));e.TURQUOISE=Object.freeze(e.fromCssColorString("#40E0D0"));e.VIOLET=Object.freeze(e.fromCssColorString("#EE82EE"));e.WHEAT=Object.freeze(e.fromCssColorString("#F5DEB3"));e.WHITE=Object.freeze(e.fromCssColorString("#FFFFFF"));e.WHITESMOKE=Object.freeze(e.fromCssColorString("#F5F5F5"));e.YELLOW=Object.freeze(e.fromCssColorString("#FFFF00"));e.YELLOWGREEN=Object.freeze(e.fromCssColorString("#9ACD32"));e.TRANSPARENT=Object.freeze(new e(0,0,0,0));var h=e;export{h as a};
