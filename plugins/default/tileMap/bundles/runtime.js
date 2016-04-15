(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TileMapRenderer = require("./TileMapRenderer");
var tileMap = require("./tileMap");
var tileSet = require("./tileSet");
SupRuntime.registerPlugin("TileMapRenderer", TileMapRenderer);
SupRuntime.registerPlugin("tileMap", tileMap);
SupRuntime.registerPlugin("tileSet", tileSet);

},{"./TileMapRenderer":5,"./tileMap":6,"./tileSet":7}],2:[function(require,module,exports){
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

},{"events":2}],4:[function(require,module,exports){
var TileSet = (function () {
    function TileSet(data) {
        this.data = data;
    }
    return TileSet;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSet;

},{}],5:[function(require,module,exports){
function setupComponent(player, component, config) {
    if (config.tileMapAssetId == null)
        return;
    var tileMap = player.getOuterAsset(config.tileMapAssetId);
    var shader;
    if (config.materialType === "shader") {
        if (config.shaderAssetId != null) {
            var shaderAsset = player.getOuterAsset(config.shaderAssetId);
            if (shaderAsset == null)
                return;
            shader = shaderAsset.__inner;
        }
    }
    component.castShadow = config.castShadow;
    component.receiveShadow = config.receiveShadow;
    component.setTileMap(tileMap.__inner, config.materialType, shader);
    var tileSetId = (config.tileSetAssetId != null) ? config.tileSetAssetId : tileMap.__inner.data.tileSetId;
    var tileSet = player.getOuterAsset(tileSetId);
    component.setTileSet(tileSet.__inner);
}
exports.setupComponent = setupComponent;

},{}],6:[function(require,module,exports){
var TileMap_1 = require("../components/TileMap");
function loadAsset(player, entry, callback) {
    player.getAssetData("assets/" + entry.storagePath + "/tilemap.json", "json", function (err, data) {
        callback(null, new TileMap_1.default(data));
    });
}
exports.loadAsset = loadAsset;
function createOuterAsset(player, asset) {
    return new window.Sup.TileMap(asset);
}
exports.createOuterAsset = createOuterAsset;

},{"../components/TileMap":3}],7:[function(require,module,exports){
var TileSet_1 = require("../components/TileSet");
function loadAsset(player, entry, callback) {
    player.getAssetData("assets/" + entry.storagePath + "/tileset.json", "json", function (err, data) {
        var img = new Image();
        img.onload = function () {
            data.texture = new SupEngine.THREE.Texture(img);
            data.texture.needsUpdate = true;
            data.texture.magFilter = SupEngine.THREE.NearestFilter;
            data.texture.minFilter = SupEngine.THREE.NearestFilter;
            callback(null, new TileSet_1.default(data));
        };
        img.onerror = function () { callback(null, new TileSet_1.default(data)); };
        img.src = player.dataURL + "assets/" + entry.storagePath + "/image.dat";
    });
}
exports.loadAsset = loadAsset;
function createOuterAsset(player, asset) {
    return new window.Sup.TileSet(asset);
}
exports.createOuterAsset = createOuterAsset;

},{"../components/TileSet":4}]},{},[1]);
