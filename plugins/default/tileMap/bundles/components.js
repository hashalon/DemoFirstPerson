(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TileMapRenderer_1 = require("./TileMapRenderer");
var TileSetRenderer_1 = require("./TileSetRenderer");
SupEngine.registerComponentClass("TileMapRenderer", TileMapRenderer_1.default);
SupEngine.registerEditorComponentClass("TileSetRenderer", TileSetRenderer_1.default);

},{"./TileMapRenderer":5,"./TileSetRenderer":8}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var TileLayerGeometry = (function (_super) {
    __extends(TileLayerGeometry, _super);
    function TileLayerGeometry(width, height, widthSegments, heightSegments) {
        _super.call(this);
        this.type = "TileLayerGeometry";
        var vertices = new Float32Array(widthSegments * heightSegments * 4 * 3);
        var normals = new Float32Array(widthSegments * heightSegments * 4 * 3);
        var uvs = new Float32Array(widthSegments * heightSegments * 4 * 2);
        var indices;
        if (vertices.length / 3 > 65535)
            indices = new Uint32Array(widthSegments * heightSegments * 6);
        else
            indices = new Uint16Array(widthSegments * heightSegments * 6);
        var offset = 0;
        var offset2 = 0;
        var offset3 = 0;
        for (var iy = 0; iy < heightSegments; iy++) {
            var y = iy * height / heightSegments;
            for (var ix = 0; ix < widthSegments; ix++) {
                var x = ix * width / widthSegments;
                // Left bottom
                vertices[offset + 0] = x;
                vertices[offset + 1] = y;
                normals[offset + 2] = 1;
                uvs[offset2 + 0] = ix / widthSegments;
                uvs[offset2 + 1] = iy / heightSegments;
                // Right bottom
                vertices[offset + 3] = x + width / widthSegments;
                vertices[offset + 4] = y;
                normals[offset + 5] = 1;
                uvs[offset2 + 2] = (ix + 1) / widthSegments;
                uvs[offset2 + 3] = iy / heightSegments;
                // Right top
                vertices[offset + 6] = x + width / widthSegments;
                vertices[offset + 7] = y + height / heightSegments;
                normals[offset + 8] = 1;
                uvs[offset2 + 4] = (ix + 1) / widthSegments;
                uvs[offset2 + 5] = (iy + 1) / heightSegments;
                // Left Top
                vertices[offset + 9] = x;
                vertices[offset + 10] = y + height / heightSegments;
                normals[offset + 11] = 1;
                uvs[offset2 + 6] = ix / widthSegments;
                uvs[offset2 + 7] = (iy + 1) / heightSegments;
                var ref = (ix + iy * widthSegments) * 4;
                // Bottom right corner
                indices[offset3 + 0] = ref + 0;
                indices[offset3 + 1] = ref + 1;
                indices[offset3 + 2] = ref + 2;
                // Top left corner
                indices[offset3 + 3] = ref + 0;
                indices[offset3 + 4] = ref + 2;
                indices[offset3 + 5] = ref + 3;
                offset += 4 * 3;
                offset2 += 4 * 2;
                offset3 += 6;
            }
        }
        this.setIndex(new THREE.BufferAttribute(indices, 1));
        this.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
        this.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
        this.addAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    }
    return TileLayerGeometry;
})(THREE.BufferGeometry);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileLayerGeometry;

},{}],4:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var TileMap = (function (_super) {
    __extends(TileMap, _super);
    function TileMap(data) {
        _super.call(this);
        this.data = data;
    }
    TileMap.prototype.getWidth = function () { return this.data.width; };
    TileMap.prototype.getHeight = function () { return this.data.height; };
    TileMap.prototype.getPixelsPerUnit = function () { return this.data.pixelsPerUnit; };
    TileMap.prototype.getLayersDepthOffset = function () { return this.data.layerDepthOffset; };
    TileMap.prototype.getLayersCount = function () { return this.data.layers.length; };
    TileMap.prototype.getLayerId = function (index) { return this.data.layers[index].id; };
    TileMap.prototype.setTileAt = function (layer, x, y, value) {
        if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height)
            return;
        var index = y * this.data.width + x;
        this.data.layers[layer].data[index] = (value != null) ? value : 0;
        this.emit("setTileAt", layer, x, y);
    };
    TileMap.prototype.getTileAt = function (layer, x, y) {
        if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height)
            return 0;
        var index = y * this.data.width + x;
        return this.data.layers[layer].data[index];
    };
    return TileMap;
})(events_1.EventEmitter);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileMap;

},{"events":2}],5:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var TileLayerGeometry_1 = require("./TileLayerGeometry");
var TileMapRendererUpdater_1 = require("./TileMapRendererUpdater");
var TileMapRenderer = (function (_super) {
    __extends(TileMapRenderer, _super);
    function TileMapRenderer(actor) {
        var _this = this;
        _super.call(this, actor, "TileMapRenderer");
        this.castShadow = false;
        this.receiveShadow = false;
        this.materialType = "basic";
        this._onSetTileAt = function (layerIndex, x, y) { _this.refreshTileAt(layerIndex, x, y); };
    }
    TileMapRenderer.prototype.setTileMap = function (asset, materialType, customShader) {
        if (this.layerMeshes != null)
            this._clearLayerMeshes();
        this.tileMap = asset;
        if (materialType != null)
            this.materialType = materialType;
        this.customShader = customShader;
        if (this.tileSet == null || this.tileSet.data.texture == null || this.tileMap == null)
            return;
        this._createLayerMeshes();
    };
    TileMapRenderer.prototype.setTileSet = function (asset) {
        if (this.layerMeshes != null)
            this._clearLayerMeshes();
        this.tileSet = asset;
        if (this.tileSet == null || this.tileSet.data.texture == null)
            return;
        this.tilesPerRow = this.tileSet.data.texture.image.width / this.tileSet.data.grid.width;
        this.tilesPerColumn = this.tileSet.data.texture.image.height / this.tileSet.data.grid.height;
        if (this.tileMap != null)
            this._createLayerMeshes();
    };
    TileMapRenderer.prototype._createLayerMeshes = function () {
        this.layerMeshes = [];
        this.layerMeshesById = {};
        this.layerVisibleById = {};
        for (var layerIndex = 0; layerIndex < this.tileMap.getLayersCount(); layerIndex++) {
            var layerId = this.tileMap.getLayerId(layerIndex);
            this.addLayer(layerId, layerIndex);
        }
        this.setCastShadow(this.castShadow);
        this.tileMap.on("setTileAt", this._onSetTileAt);
    };
    TileMapRenderer.prototype._clearLayerMeshes = function () {
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.geometry.dispose();
            layerMesh.material.dispose();
            this.actor.threeObject.remove(layerMesh);
        }
        this.layerMeshes = null;
        this.layerMeshesById = null;
        this.layerVisibleById = null;
        this.tileMap.removeListener("setTileAt", this._onSetTileAt);
    };
    TileMapRenderer.prototype._destroy = function () {
        if (this.layerMeshes != null)
            this._clearLayerMeshes();
        this.tileMap = null;
        this.tileSet = null;
        _super.prototype._destroy.call(this);
    };
    TileMapRenderer.prototype.addLayer = function (layerId, layerIndex) {
        var width = this.tileMap.getWidth() * this.tileSet.data.grid.width;
        var height = this.tileMap.getHeight() * this.tileSet.data.grid.height;
        var geometry = new TileLayerGeometry_1.default(width, height, this.tileMap.getWidth(), this.tileMap.getHeight());
        var material;
        if (this.materialType === "shader") {
            material = SupEngine.componentClasses["Shader"].createShaderMaterial(this.customShader, { map: this.tileSet.data.texture }, geometry);
            material.map = this.tileSet.data.texture;
        }
        else {
            if (this.materialType === "basic")
                material = new THREE.MeshBasicMaterial();
            else if (this.materialType === "phong")
                material = new THREE.MeshPhongMaterial();
            material.map = this.tileSet.data.texture;
            material.alphaTest = 0.1;
            material.side = THREE.DoubleSide;
            material.transparent = true;
        }
        var layerMesh = new THREE.Mesh(geometry, material);
        layerMesh.receiveShadow = this.receiveShadow;
        var scaleRatio = 1 / this.tileMap.getPixelsPerUnit();
        layerMesh.scale.set(scaleRatio, scaleRatio, 1);
        layerMesh.updateMatrixWorld(false);
        this.layerMeshes.splice(layerIndex, 0, layerMesh);
        this.layerMeshesById[layerId] = layerMesh;
        this.layerVisibleById[layerId] = true;
        this.actor.threeObject.add(layerMesh);
        for (var y = 0; y < this.tileMap.getHeight(); y++) {
            for (var x = 0; x < this.tileMap.getWidth(); x++) {
                this.refreshTileAt(layerIndex, x, y);
            }
        }
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.deleteLayer = function (layerIndex) {
        this.actor.threeObject.remove(this.layerMeshes[layerIndex]);
        this.layerMeshes.splice(layerIndex, 1);
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.moveLayer = function (layerId, newIndex) {
        var layer = this.layerMeshesById[layerId];
        var oldIndex = this.layerMeshes.indexOf(layer);
        this.layerMeshes.splice(oldIndex, 1);
        if (oldIndex < newIndex)
            newIndex--;
        this.layerMeshes.splice(newIndex, 0, layer);
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.setCastShadow = function (castShadow) {
        this.castShadow = castShadow;
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.castShadow = castShadow;
        }
        if (!castShadow)
            return;
        this.actor.gameInstance.threeScene.traverse(function (object) {
            var material = object.material;
            if (material != null)
                material.needsUpdate = true;
        });
    };
    TileMapRenderer.prototype.setReceiveShadow = function (receiveShadow) {
        this.receiveShadow = receiveShadow;
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.receiveShadow = receiveShadow;
            layerMesh.material.needsUpdate = true;
        }
    };
    TileMapRenderer.prototype.refreshPixelsPerUnit = function (pixelsPerUnit) {
        var scaleRatio = 1 / this.tileMap.getPixelsPerUnit();
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.scale.set(scaleRatio, scaleRatio, 1);
            layerMesh.updateMatrixWorld(false);
        }
    };
    TileMapRenderer.prototype.refreshLayersDepth = function () {
        for (var layerMeshIndex = 0; layerMeshIndex < this.layerMeshes.length; layerMeshIndex++) {
            var layerMesh = this.layerMeshes[layerMeshIndex];
            layerMesh.position.setZ(layerMeshIndex * this.tileMap.getLayersDepthOffset());
            layerMesh.updateMatrixWorld(false);
        }
    };
    TileMapRenderer.prototype.refreshEntireMap = function () {
        for (var layerIndex = 0; layerIndex < this.tileMap.getLayersCount(); layerIndex++) {
            for (var y = 0; y < this.tileMap.getWidth(); y++) {
                for (var x = 0; x < this.tileMap.getHeight(); x++) {
                    this.refreshTileAt(layerIndex, x, y);
                }
            }
        }
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.refreshTileAt = function (layerIndex, x, y) {
        var tileX = -1;
        var tileY = -1;
        var flipX = false;
        var flipY = false;
        var angle = 0;
        var tileInfo = this.tileMap.getTileAt(layerIndex, x, y);
        if (tileInfo !== 0) {
            tileX = tileInfo[0];
            tileY = tileInfo[1];
            flipX = tileInfo[2];
            flipY = tileInfo[3];
            angle = tileInfo[4];
        }
        if (tileX == -1 || tileY == -1 || tileX >= this.tilesPerRow || tileY >= this.tilesPerColumn ||
            (tileX === this.tilesPerRow - 1 && tileY === this.tilesPerColumn - 1)) {
            tileX = this.tilesPerRow - 1;
            tileY = this.tilesPerColumn - 1;
        }
        var image = this.tileSet.data.texture.image;
        var left = (tileX * this.tileSet.data.grid.width + 0.2) / image.width;
        var right = ((tileX + 1) * this.tileSet.data.grid.width - 0.2) / image.width;
        var bottom = 1 - ((tileY + 1) * this.tileSet.data.grid.height - 0.2) / image.height;
        var top = 1 - (tileY * this.tileSet.data.grid.height + 0.2) / image.height;
        if (flipX) {
            var temp = right;
            right = left;
            left = temp;
        }
        if (flipY) {
            var temp = bottom;
            bottom = top;
            top = temp;
        }
        var quadIndex = (x + y * this.tileMap.getWidth());
        var layerMesh = this.layerMeshes[layerIndex];
        var uvs = layerMesh.geometry.getAttribute("uv");
        uvs.needsUpdate = true;
        switch (angle) {
            case 0:
                uvs.array[quadIndex * 8 + 0] = left;
                uvs.array[quadIndex * 8 + 1] = bottom;
                uvs.array[quadIndex * 8 + 2] = right;
                uvs.array[quadIndex * 8 + 3] = bottom;
                uvs.array[quadIndex * 8 + 4] = right;
                uvs.array[quadIndex * 8 + 5] = top;
                uvs.array[quadIndex * 8 + 6] = left;
                uvs.array[quadIndex * 8 + 7] = top;
                break;
            case 90:
                uvs.array[quadIndex * 8 + 0] = left;
                uvs.array[quadIndex * 8 + 1] = top;
                uvs.array[quadIndex * 8 + 2] = left;
                uvs.array[quadIndex * 8 + 3] = bottom;
                uvs.array[quadIndex * 8 + 4] = right;
                uvs.array[quadIndex * 8 + 5] = bottom;
                uvs.array[quadIndex * 8 + 6] = right;
                uvs.array[quadIndex * 8 + 7] = top;
                break;
            case 180:
                uvs.array[quadIndex * 8 + 0] = right;
                uvs.array[quadIndex * 8 + 1] = top;
                uvs.array[quadIndex * 8 + 2] = left;
                uvs.array[quadIndex * 8 + 3] = top;
                uvs.array[quadIndex * 8 + 4] = left;
                uvs.array[quadIndex * 8 + 5] = bottom;
                uvs.array[quadIndex * 8 + 6] = right;
                uvs.array[quadIndex * 8 + 7] = bottom;
                break;
            case 270:
                uvs.array[quadIndex * 8 + 0] = right;
                uvs.array[quadIndex * 8 + 1] = bottom;
                uvs.array[quadIndex * 8 + 2] = right;
                uvs.array[quadIndex * 8 + 3] = top;
                uvs.array[quadIndex * 8 + 4] = left;
                uvs.array[quadIndex * 8 + 5] = top;
                uvs.array[quadIndex * 8 + 6] = left;
                uvs.array[quadIndex * 8 + 7] = bottom;
                break;
        }
    };
    TileMapRenderer.prototype.setIsLayerActive = function (active) {
        if (this.layerMeshes == null)
            return;
        for (var layerId in this.layerMeshesById)
            this.layerMeshesById[layerId].visible = active && this.layerVisibleById[layerId];
    };
    TileMapRenderer.Updater = TileMapRendererUpdater_1.default;
    return TileMapRenderer;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileMapRenderer;

},{"./TileLayerGeometry":3,"./TileMapRendererUpdater":6}],6:[function(require,module,exports){
var THREE = SupEngine.THREE;
var TileMap_1 = require("./TileMap");
var TileSet_1 = require("./TileSet");
var TileMapRendererUpdater = (function () {
    function TileMapRendererUpdater(client, tileMapRenderer, config, receiveAssetCallbacks, editAssetCallbacks) {
        var _this = this;
        this.shaderSubscriber = {
            onAssetReceived: this._onShaderAssetReceived.bind(this),
            onAssetEdited: this._onShaderAssetEdited.bind(this),
            onAssetTrashed: this._onShaderAssetTrashed.bind(this)
        };
        this._onTileMapAssetReceived = function (assetId, asset) {
            _this.tileMapAsset = asset;
            _this._setTileMap();
            if (_this.tileMapAsset.pub.tileSetId != null)
                _this.client.subAsset(_this.tileMapAsset.pub.tileSetId, "tileSet", _this.tileSetSubscriber);
            if (_this.receiveAssetCallbacks != null && _this.receiveAssetCallbacks.tileMap != null)
                _this.receiveAssetCallbacks.tileMap();
        };
        this._onTileMapAssetEdited = function (id, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (_this.tileSetAsset != null || command === "changeTileSet") {
                var commandFunction = _this[("_onEditCommand_" + command)];
                if (commandFunction != null)
                    commandFunction.apply(_this, args);
            }
            if (_this.editAssetCallbacks != null && _this.editAssetCallbacks.tileMap != null) {
                var editCallback = _this.editAssetCallbacks.tileMap[command];
                if (editCallback != null)
                    editCallback.apply(null, args);
            }
        };
        this._onTileMapAssetTrashed = function (assetId) {
            _this.tileMapRenderer.setTileMap(null);
            if (_this.editAssetCallbacks != null) {
                // FIXME: We should probably have a this.trashAssetCallback instead
                // and let editors handle things how they want
                SupClient.onAssetTrashed();
            }
        };
        this._onTileSetAssetReceived = function (assetId, asset) {
            _this._prepareTexture(asset.pub.texture, function () {
                _this.tileSetAsset = asset;
                _this.tileMapRenderer.setTileSet(new TileSet_1.default(asset.pub));
                if (_this.receiveAssetCallbacks != null && _this.receiveAssetCallbacks.tileSet != null)
                    _this.receiveAssetCallbacks.tileSet();
            });
        };
        this._onTileSetAssetEdited = function (id, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var commandFunction = _this[("_onTileSetEditCommand_" + command)];
            if (commandFunction != null)
                commandFunction.apply(_this, args);
            if (_this.editAssetCallbacks != null && _this.editAssetCallbacks.tileSet != null) {
                var editCallback = _this.editAssetCallbacks.tileSet[command];
                if (editCallback != null)
                    editCallback.apply(null, args);
            }
        };
        this._onTileSetAssetTrashed = function (assetId) {
            _this.tileMapRenderer.setTileSet(null);
        };
        this.client = client;
        this.tileMapRenderer = tileMapRenderer;
        this.receiveAssetCallbacks = receiveAssetCallbacks;
        this.editAssetCallbacks = editAssetCallbacks;
        this.tileMapAssetId = config.tileMapAssetId;
        this.tileSetAssetId = config.tileSetAssetId;
        this.materialType = config.materialType;
        this.shaderAssetId = config.shaderAssetId;
        this.tileMapSubscriber = {
            onAssetReceived: this._onTileMapAssetReceived,
            onAssetEdited: this._onTileMapAssetEdited,
            onAssetTrashed: this._onTileMapAssetTrashed
        };
        this.tileSetSubscriber = {
            onAssetReceived: this._onTileSetAssetReceived,
            onAssetEdited: this._onTileSetAssetEdited,
            onAssetTrashed: this._onTileSetAssetTrashed
        };
        this.tileMapRenderer.receiveShadow = config.receiveShadow;
        if (this.tileMapAssetId != null)
            this.client.subAsset(this.tileMapAssetId, "tileMap", this.tileMapSubscriber);
        if (this.shaderAssetId != null)
            this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
    }
    TileMapRendererUpdater.prototype.destroy = function () {
        if (this.tileMapAssetId != null)
            this.client.unsubAsset(this.tileMapAssetId, this.tileMapSubscriber);
        if (this.tileSetAssetId != null) {
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        }
        if (this.shaderAssetId != null)
            this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
    };
    TileMapRendererUpdater.prototype._setTileMap = function () {
        if (this.tileMapAsset == null || (this.materialType === "shader" && this.shaderPub == null)) {
            this.tileMapRenderer.setTileMap(null);
            return;
        }
        this.tileMapRenderer.setTileMap(new TileMap_1.default(this.tileMapAsset.pub), this.materialType, this.shaderPub);
    };
    TileMapRendererUpdater.prototype._onEditCommand_changeTileSet = function () {
        if (this.tileSetAssetId != null)
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        this.tileSetAsset = null;
        this.tileMapRenderer.setTileSet(null);
        this.tileSetAssetId = this.tileMapAsset.pub.tileSetId;
        if (this.tileSetAssetId != null)
            this.client.subAsset(this.tileSetAssetId, "tileSet", this.tileSetSubscriber);
    };
    TileMapRendererUpdater.prototype._onEditCommand_resizeMap = function () { this._setTileMap(); };
    TileMapRendererUpdater.prototype._onEditCommand_moveMap = function () {
        this.tileMapRenderer.refreshEntireMap();
    };
    TileMapRendererUpdater.prototype._onEditCommand_setProperty = function (path, value) {
        switch (path) {
            case "pixelsPerUnit":
                this.tileMapRenderer.refreshPixelsPerUnit(value);
                break;
            case "layerDepthOffset":
                this.tileMapRenderer.refreshLayersDepth();
                break;
        }
    };
    TileMapRendererUpdater.prototype._onEditCommand_editMap = function (layerId, edits) {
        var index = this.tileMapAsset.pub.layers.indexOf(this.tileMapAsset.layers.byId[layerId]);
        for (var _i = 0; _i < edits.length; _i++) {
            var edit = edits[_i];
            this.tileMapRenderer.refreshTileAt(index, edit.x, edit.y);
        }
    };
    TileMapRendererUpdater.prototype._onEditCommand_newLayer = function (layer, index) {
        this.tileMapRenderer.addLayer(layer.id, index);
    };
    TileMapRendererUpdater.prototype._onEditCommand_deleteLayer = function (id, index) {
        this.tileMapRenderer.deleteLayer(index);
    };
    TileMapRendererUpdater.prototype._onEditCommand_moveLayer = function (id, newIndex) {
        this.tileMapRenderer.moveLayer(id, newIndex);
    };
    TileMapRendererUpdater.prototype._prepareTexture = function (texture, callback) {
        if (texture == null) {
            callback();
            return;
        }
        if (texture.image.complete)
            callback();
        else
            texture.image.addEventListener("load", callback);
    };
    TileMapRendererUpdater.prototype._onTileSetEditCommand_upload = function () {
        var _this = this;
        this._prepareTexture(this.tileSetAsset.pub.texture, function () {
            _this.tileMapRenderer.setTileSet(new TileSet_1.default(_this.tileSetAsset.pub));
        });
    };
    TileMapRendererUpdater.prototype._onTileSetEditCommand_setProperty = function () {
        this.tileMapRenderer.setTileSet(new TileSet_1.default(this.tileSetAsset.pub));
    };
    TileMapRendererUpdater.prototype._onShaderAssetReceived = function (assetId, asset) {
        this.shaderPub = asset.pub;
        this._setTileMap();
    };
    TileMapRendererUpdater.prototype._onShaderAssetEdited = function (id, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (command !== "editVertexShader" && command !== "editFragmentShader")
            this._setTileMap();
    };
    TileMapRendererUpdater.prototype._onShaderAssetTrashed = function () {
        this.shaderPub = null;
        this._setTileMap();
    };
    TileMapRendererUpdater.prototype.config_setProperty = function (path, value) {
        switch (path) {
            case "tileMapAssetId":
                if (this.tileMapAssetId != null)
                    this.client.unsubAsset(this.tileMapAssetId, this.tileMapSubscriber);
                this.tileMapAssetId = value;
                this.tileMapAsset = null;
                this.tileMapRenderer.setTileMap(null);
                if (this.tileSetAssetId != null)
                    this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
                this.tileSetAsset = null;
                this.tileMapRenderer.setTileSet(null);
                if (this.tileMapAssetId != null)
                    this.client.subAsset(this.tileMapAssetId, "tileMap", this.tileMapSubscriber);
                break;
            // case "tileSetAssetId":
            case "castShadow":
                this.tileMapRenderer.setCastShadow(value);
                break;
            case "receiveShadow":
                this.tileMapRenderer.setReceiveShadow(value);
                break;
            case "materialType":
                this.materialType = value;
                this._setTileMap();
                break;
            case "shaderAssetId":
                if (this.shaderAssetId != null)
                    this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
                this.shaderAssetId = value;
                this.shaderPub = null;
                this.tileMapRenderer.setTileMap(null);
                if (this.shaderAssetId != null)
                    this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
                break;
        }
    };
    return TileMapRendererUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileMapRendererUpdater;

},{"./TileMap":4,"./TileSet":7}],7:[function(require,module,exports){
var TileSet = (function () {
    function TileSet(data) {
        this.data = data;
    }
    return TileSet;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSet;

},{}],8:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var TileSetRendererUpdater_1 = require("./TileSetRendererUpdater");
var TileSetRenderer = (function (_super) {
    __extends(TileSetRenderer, _super);
    function TileSetRenderer(actor, asset) {
        _super.call(this, actor, "TileSetRenderer");
        var gridActor = new SupEngine.Actor(this.actor.gameInstance, "Grid");
        gridActor.setLocalPosition(new THREE.Vector3(0, 0, 1));
        this.gridRenderer = new SupEngine.editorComponentClasses["GridRenderer"](gridActor, {
            width: 1, height: 1,
            direction: -1, orthographicScale: 10,
            ratio: { x: 1, y: 1 }
        });
        this.selectedTileActor = new SupEngine.Actor(this.actor.gameInstance, "Selection", null, { visible: false });
        new SupEngine.editorComponentClasses["FlatColorRenderer"](this.selectedTileActor, 0x900090, 1, 1);
        this.setTileSet(asset);
    }
    TileSetRenderer.prototype.setTileSet = function (asset) {
        this._clearMesh();
        this.asset = asset;
        if (this.asset == null)
            return;
        var geometry = new THREE.PlaneBufferGeometry(asset.data.texture.image.width, asset.data.texture.image.height);
        var material = new THREE.MeshBasicMaterial({ map: asset.data.texture, alphaTest: 0.1, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(geometry, material);
        this.actor.threeObject.add(this.mesh);
        this.refreshScaleRatio();
        this.selectedTileActor.threeObject.visible = true;
    };
    TileSetRenderer.prototype.select = function (x, y, width, height) {
        if (width === void 0) { width = 1; }
        if (height === void 0) { height = 1; }
        var ratio = this.asset.data.grid.width / this.asset.data.grid.height;
        this.selectedTileActor.setLocalPosition(new THREE.Vector3(x, -y / ratio, 2));
        this.selectedTileActor.setLocalScale(new THREE.Vector3(width, -height / ratio, 1));
    };
    TileSetRenderer.prototype.refreshScaleRatio = function () {
        var scaleX = 1 / this.asset.data.grid.width;
        var scaleY = 1 / this.asset.data.grid.height;
        this.mesh.scale.set(scaleX, scaleX, 1);
        var material = this.mesh.material;
        this.mesh.position.setX(material.map.image.width / 2 * scaleX);
        this.mesh.position.setY(-material.map.image.height / 2 * scaleX);
        this.mesh.updateMatrixWorld(false);
        this.select(0, 0);
    };
    TileSetRenderer.prototype._clearMesh = function () {
        if (this.mesh == null)
            return;
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.actor.threeObject.remove(this.mesh);
        this.mesh = null;
        this.selectedTileActor.threeObject.visible = false;
    };
    TileSetRenderer.prototype._destroy = function () {
        this._clearMesh();
        this.actor.gameInstance.destroyActor(this.gridRenderer.actor);
        this.actor.gameInstance.destroyActor(this.selectedTileActor);
        this.asset = null;
        _super.prototype._destroy.call(this);
    };
    TileSetRenderer.prototype.setIsLayerActive = function (active) { if (this.mesh != null)
        this.mesh.visible = active; };
    TileSetRenderer.Updater = TileSetRendererUpdater_1.default;
    return TileSetRenderer;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSetRenderer;

},{"./TileSetRendererUpdater":9}],9:[function(require,module,exports){
var THREE = SupEngine.THREE;
var TileSet_1 = require("./TileSet");
var TileSetRendererUpdater = (function () {
    function TileSetRendererUpdater(client, tileSetRenderer, config, receiveAssetCallbacks, editAssetCallbacks) {
        var _this = this;
        this._onTileSetAssetReceived = function (assetId, asset) {
            _this._prepareTexture(asset.pub.texture, function () {
                _this.tileSetAsset = asset;
                if (asset.pub.texture != null) {
                    _this.tileSetRenderer.setTileSet(new TileSet_1.default(asset.pub));
                    _this.tileSetRenderer.gridRenderer.setGrid({
                        width: asset.pub.texture.image.width / asset.pub.grid.width,
                        height: asset.pub.texture.image.height / asset.pub.grid.height,
                        direction: -1,
                        orthographicScale: 10,
                        ratio: { x: 1, y: asset.pub.grid.width / asset.pub.grid.height }
                    });
                }
                if (_this.receiveAssetCallbacks != null && _this.receiveAssetCallbacks.tileSet != null)
                    _this.receiveAssetCallbacks.tileSet();
            });
        };
        this._onTileSetAssetEdited = function (id, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var callEditCallback = true;
            var commandFunction = _this[("_onEditCommand_" + command)];
            if (commandFunction != null) {
                if (commandFunction.apply(_this, args) === false)
                    callEditCallback = false;
            }
            if (callEditCallback && _this.editAssetCallbacks != null) {
                var editCallback = _this.editAssetCallbacks.tileSet[command];
                if (editCallback != null)
                    editCallback.apply(null, args);
            }
        };
        this._onTileSetAssetTrashed = function (assetId) {
            _this.tileSetRenderer.setTileSet(null);
            if (_this.editAssetCallbacks != null) {
                // FIXME: We should probably have a this.trashAssetCallback instead
                // and let editors handle things how they want
                SupClient.onAssetTrashed();
            }
        };
        this.client = client;
        this.tileSetRenderer = tileSetRenderer;
        this.receiveAssetCallbacks = receiveAssetCallbacks;
        this.editAssetCallbacks = editAssetCallbacks;
        this.tileSetAssetId = config.tileSetAssetId;
        this.tileSetSubscriber = {
            onAssetReceived: this._onTileSetAssetReceived,
            onAssetEdited: this._onTileSetAssetEdited,
            onAssetTrashed: this._onTileSetAssetTrashed
        };
        if (this.tileSetAssetId != null)
            this.client.subAsset(this.tileSetAssetId, "tileSet", this.tileSetSubscriber);
    }
    TileSetRendererUpdater.prototype.destroy = function () {
        if (this.tileSetAssetId != null) {
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        }
    };
    TileSetRendererUpdater.prototype.changeTileSetId = function (tileSetId) {
        if (this.tileSetAssetId != null)
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        this.tileSetAssetId = tileSetId;
        this.tileSetAsset = null;
        this.tileSetRenderer.setTileSet(null);
        this.tileSetRenderer.gridRenderer.resize(1, 1);
        if (this.tileSetAssetId != null)
            this.client.subAsset(this.tileSetAssetId, "tileSet", this.tileSetSubscriber);
    };
    TileSetRendererUpdater.prototype._prepareTexture = function (texture, callback) {
        if (texture == null) {
            callback();
            return;
        }
        if (texture.image.complete)
            callback();
        else
            texture.image.addEventListener("load", callback);
    };
    TileSetRendererUpdater.prototype._onEditCommand_upload = function () {
        var _this = this;
        var texture = this.tileSetAsset.pub.texture;
        this._prepareTexture(texture, function () {
            _this.tileSetRenderer.setTileSet(new TileSet_1.default(_this.tileSetAsset.pub));
            var width = texture.image.width / _this.tileSetAsset.pub.grid.width;
            var height = texture.image.height / _this.tileSetAsset.pub.grid.height;
            _this.tileSetRenderer.gridRenderer.resize(width, height);
            _this.tileSetRenderer.gridRenderer.setRatio({ x: 1, y: _this.tileSetAsset.pub.grid.width / _this.tileSetAsset.pub.grid.height });
            var editCallback = (_this.editAssetCallbacks != null) ? _this.editAssetCallbacks.tileSet["upload"] : null;
            if (editCallback != null)
                editCallback();
        });
    };
    TileSetRendererUpdater.prototype._onEditCommand_setProperty = function (key, value) {
        switch (key) {
            case "grid.width":
            case "grid.height":
                this.tileSetRenderer.refreshScaleRatio();
                var width = this.tileSetAsset.pub.texture.image.width / this.tileSetAsset.pub.grid.width;
                var height = this.tileSetAsset.pub.texture.image.height / this.tileSetAsset.pub.grid.height;
                this.tileSetRenderer.gridRenderer.resize(width, height);
                this.tileSetRenderer.gridRenderer.setRatio({ x: 1, y: this.tileSetAsset.pub.grid.width / this.tileSetAsset.pub.grid.height });
                break;
        }
    };
    return TileSetRendererUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSetRendererUpdater;

},{"./TileSet":7}]},{},[1]);
