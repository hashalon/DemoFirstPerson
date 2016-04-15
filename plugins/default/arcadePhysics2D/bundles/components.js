(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var epsilon = 0.0001;
var THREE = SupEngine.THREE;
var ArcadeBody2D_1 = require("./ArcadeBody2D");
var ArcadeBody2DMarker_1 = require("./ArcadeBody2DMarker");
var ArcadePhysics2D;
(function (ArcadePhysics2D) {
    ArcadePhysics2D.allBodies = [];
    ArcadePhysics2D.gravity = new THREE.Vector3(0, 0, 0);
    function intersects(body1, body2) {
        if (body2.type === "tileMap")
            return checkTileMap(body1, body2, { moveBody: false });
        if (body1.right() < body2.left())
            return false;
        if (body1.left() > body2.right())
            return false;
        if (body1.bottom() > body2.top())
            return false;
        if (body1.top() < body2.bottom())
            return false;
        return true;
    }
    ArcadePhysics2D.intersects = intersects;
    function detachFromBox(body1, body2) {
        var insideX = body1.position.x - body2.position.x;
        if (insideX >= 0)
            insideX -= (body1.width + body2.width) / 2;
        else
            insideX += (body1.width + body2.width) / 2;
        var insideY = body1.position.y - body2.position.y;
        if (insideY >= 0)
            insideY -= (body1.height + body2.height) / 2;
        else
            insideY += (body1.height + body2.height) / 2;
        if (Math.abs(insideY) <= Math.abs(insideX)) {
            if (body1.deltaY() / insideY > 0) {
                body1.velocity.y = -body1.velocity.y * body1.bounceY;
                body1.position.y -= insideY;
                if (body1.position.y > body2.position.y)
                    body1.touches.bottom = true;
                else
                    body1.touches.top = true;
            }
        }
        else {
            if (body1.deltaX() / insideX > 0) {
                body1.velocity.x = -body1.velocity.x * body1.bounceX;
                body1.position.x -= insideX;
                if (body1.position.x > body2.position.x)
                    body1.touches.left = true;
                else
                    body1.touches.right = true;
            }
        }
    }
    function checkTileMap(body1, body2, options) {
        function checkX() {
            var x = (body1.deltaX() < 0) ?
                Math.floor((body1.position.x - body2.position.x - body1.width / 2) / body2.mapToSceneFactor.x) :
                Math.floor((body1.position.x - body2.position.x + body1.width / 2 - epsilon) / body2.mapToSceneFactor.x);
            var y = body1.position.y - body2.position.y - body1.height / 2 + epsilon;
            var testedHeight = body1.height - 3 * epsilon;
            var totalPoints = Math.ceil(testedHeight / body2.mapToSceneFactor.y);
            for (var point = 0; point <= totalPoints; point++) {
                for (var _i = 0, _a = body2.layersIndex; _i < _a.length; _i++) {
                    var layer = _a[_i];
                    var tile = body2.tileMapAsset.getTileAt(layer, x, Math.floor((y + point * testedHeight / totalPoints) / body2.mapToSceneFactor.y));
                    var collide = false;
                    if (body2.tileSetPropertyName != null)
                        collide = body2.tileSetAsset.getTileProperties(tile)[body2.tileSetPropertyName] != null;
                    else if (tile !== -1)
                        collide = true;
                    if (!collide)
                        continue;
                    body1.velocity.x = -body1.velocity.x * body1.bounceX;
                    if (body1.deltaX() < 0) {
                        if (options.moveBody)
                            body1.position.x = (x + 1) * body2.mapToSceneFactor.x + body2.position.x + body1.width / 2;
                        body1.touches.left = true;
                    }
                    else {
                        if (options.moveBody)
                            body1.position.x = (x) * body2.mapToSceneFactor.x + body2.position.x - body1.width / 2;
                        body1.touches.right = true;
                    }
                    return true;
                }
            }
            return false;
        }
        function checkY() {
            var x = body1.position.x - body2.position.x - body1.width / 2 + epsilon;
            var y = (body1.deltaY() < 0) ?
                Math.floor((body1.position.y - body2.position.y - body1.height / 2) / body2.mapToSceneFactor.y) :
                Math.floor((body1.position.y - body2.position.y + body1.height / 2 - epsilon) / body2.mapToSceneFactor.y);
            var testedWidth = body1.width - 3 * epsilon;
            var totalPoints = Math.ceil(testedWidth / body2.mapToSceneFactor.x);
            for (var point = 0; point <= totalPoints; point++) {
                for (var _i = 0, _a = body2.layersIndex; _i < _a.length; _i++) {
                    var layer = _a[_i];
                    var tile = body2.tileMapAsset.getTileAt(layer, Math.floor((x + point * testedWidth / totalPoints) / body2.mapToSceneFactor.x), y);
                    var collide = false;
                    if (body2.tileSetPropertyName != null)
                        collide = body2.tileSetAsset.getTileProperties(tile)[body2.tileSetPropertyName] != null;
                    else if (tile !== -1)
                        collide = true;
                    if (!collide)
                        continue;
                    body1.velocity.y = -body1.velocity.y * body1.bounceY;
                    if (body1.deltaY() < 0) {
                        if (options.moveBody)
                            body1.position.y = (y + 1) * body2.mapToSceneFactor.y + body2.position.y + body1.height / 2;
                        body1.touches.bottom = true;
                    }
                    else {
                        if (options.moveBody)
                            body1.position.y = (y) * body2.mapToSceneFactor.y + body2.position.y - body1.height / 2;
                        body1.touches.top = true;
                    }
                    return true;
                }
            }
            return false;
        }
        var x = body1.position.x;
        body1.position.x = body1.previousPosition.x;
        var gotCollision = false;
        if (checkY())
            gotCollision = true;
        body1.position.x = x;
        if (checkX())
            gotCollision = true;
        return gotCollision;
    }
    function collides(body1, bodies) {
        if (body1.type === "tileMap" || !body1.movable)
            throw new Error("The first body must be a movable box in ArcadePhysics2D.collides");
        body1.touches.top = false;
        body1.touches.bottom = false;
        body1.touches.right = false;
        body1.touches.left = false;
        var gotCollision = false;
        for (var _i = 0; _i < bodies.length; _i++) {
            var body2 = bodies[_i];
            if (body2 === body1 || !body2.enabled)
                continue;
            if (body2.type === "box") {
                if (intersects(body1, body2)) {
                    gotCollision = true;
                    detachFromBox(body1, body2);
                }
            }
            else if (body2.type === "tileMap") {
                if (checkTileMap(body1, body2, { moveBody: true }))
                    gotCollision = true;
            }
        }
        if (gotCollision)
            body1.refreshActorPosition();
        return gotCollision;
    }
    ArcadePhysics2D.collides = collides;
})(ArcadePhysics2D || (ArcadePhysics2D = {}));
SupEngine.ArcadePhysics2D = ArcadePhysics2D;
SupEngine.registerEarlyUpdateFunction("ArcadePhysics2D", function () {
    for (var _i = 0, _a = ArcadePhysics2D.allBodies; _i < _a.length; _i++) {
        var body = _a[_i];
        body.earlyUpdate();
    }
});
SupEngine.registerComponentClass("ArcadeBody2D", ArcadeBody2D_1.default);
SupEngine.registerEditorComponentClass("ArcadeBody2DMarker", ArcadeBody2DMarker_1.default);

},{"./ArcadeBody2D":2,"./ArcadeBody2DMarker":3}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var ArcadeBody2D = (function (_super) {
    __extends(ArcadeBody2D, _super);
    function ArcadeBody2D(actor, type) {
        _super.call(this, actor, "ArcadeBody2D");
        this.enabled = true;
        this.movable = false;
        this.width = 1;
        this.height = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.bounceX = 0;
        this.bounceY = 0;
        this.layersIndex = [];
        this.customGravity = { x: null, y: null };
        this.touches = { top: false, bottom: false, right: false, left: false };
        SupEngine.ArcadePhysics2D.allBodies.push(this);
    }
    ArcadeBody2D.prototype.setIsLayerActive = function (active) { };
    ArcadeBody2D.prototype.setupBox = function (config) {
        this.type = "box";
        this.movable = config.movable;
        this.width = config.width;
        this.height = config.height;
        if (config.offset != null) {
            this.offsetX = config.offset.x;
            this.offsetY = config.offset.y;
        }
        if (config.bounceX != null)
            this.bounceX = config.bounceX;
        if (config.bounceY != null)
            this.bounceY = config.bounceY;
        this.actorPosition = this.actor.getGlobalPosition(new THREE.Vector3());
        this.position = this.actorPosition.clone();
        this.position.x += this.offsetX;
        this.position.y += this.offsetY;
        this.previousPosition = this.position.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.velocityMin = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        this.velocityMax = new THREE.Vector3(Infinity, Infinity, Infinity);
        this.velocityMultiplier = new THREE.Vector3(1, 1, 1);
    };
    ArcadeBody2D.prototype.setupTileMap = function (config) {
        this.type = "tileMap";
        this.tileMapAsset = config.tileMapAsset;
        this.tileSetAsset = config.tileSetAsset;
        this.mapToSceneFactor = {
            x: this.tileSetAsset.__inner.data.grid.width / this.tileMapAsset.__inner.data.pixelsPerUnit,
            y: this.tileSetAsset.__inner.data.grid.height / this.tileMapAsset.__inner.data.pixelsPerUnit,
        };
        this.tileSetPropertyName = config.tileSetPropertyName;
        if (config.layersIndex != null) {
            var layers = config.layersIndex.split(",");
            for (var _i = 0; _i < layers.length; _i++) {
                var layer = layers[_i];
                this.layersIndex.push(parseInt(layer.trim(), 10));
            }
        }
        else {
            for (var i = 0; i < this.tileMapAsset.__inner.data.layers.length; i++)
                this.layersIndex.push(i);
        }
        this.position = this.actor.getGlobalPosition(new THREE.Vector3());
    };
    ArcadeBody2D.prototype.earlyUpdate = function () {
        if (this.type === "tileMap")
            return;
        this.previousPosition.copy(this.position);
        if (!this.movable || !this.enabled)
            return;
        this.velocity.x += this.customGravity.x != null ? this.customGravity.x : SupEngine.ArcadePhysics2D.gravity.x;
        this.velocity.x *= this.velocityMultiplier.x;
        this.velocity.x = Math.min(Math.max(this.velocity.x, this.velocityMin.x), this.velocityMax.x);
        this.velocity.y += this.customGravity.y != null ? this.customGravity.y : SupEngine.ArcadePhysics2D.gravity.y;
        this.velocity.y *= this.velocityMultiplier.y;
        this.velocity.y = Math.min(Math.max(this.velocity.y, this.velocityMin.y), this.velocityMax.y);
        this.position.add(this.velocity);
        this.refreshActorPosition();
    };
    ArcadeBody2D.prototype.warpPosition = function (x, y) {
        this.position.x = x + this.offsetX;
        this.position.y = y + this.offsetY;
        this.refreshActorPosition();
    };
    ArcadeBody2D.prototype.refreshActorPosition = function () {
        this.actor.getGlobalPosition(this.actorPosition);
        this.actorPosition.x = this.position.x - this.offsetX;
        this.actorPosition.y = this.position.y - this.offsetY;
        this.actor.setGlobalPosition(this.actorPosition);
    };
    ArcadeBody2D.prototype._destroy = function () {
        SupEngine.ArcadePhysics2D.allBodies.splice(SupEngine.ArcadePhysics2D.allBodies.indexOf(this), 1);
        _super.prototype._destroy.call(this);
    };
    ArcadeBody2D.prototype.right = function () { return this.position.x + this.width / 2; };
    ArcadeBody2D.prototype.left = function () { return this.position.x - this.width / 2; };
    ArcadeBody2D.prototype.top = function () { return this.position.y + this.height / 2; };
    ArcadeBody2D.prototype.bottom = function () { return this.position.y - this.height / 2; };
    ArcadeBody2D.prototype.deltaX = function () { return this.position.x - this.previousPosition.x; };
    ArcadeBody2D.prototype.deltaY = function () { return this.position.y - this.previousPosition.y; };
    return ArcadeBody2D;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArcadeBody2D;

},{}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ArcadeBody2DUpdater_1 = require("./ArcadeBody2DUpdater");
var THREE = SupEngine.THREE;
var tmpVector3 = new THREE.Vector3();
var ArcadeBody2DMarker = (function (_super) {
    __extends(ArcadeBody2DMarker, _super);
    function ArcadeBody2DMarker(actor) {
        _super.call(this, actor, "ArcadeBody2DMarker");
        this.offset = new THREE.Vector3(0, 0, 0);
        this.markerActor = new SupEngine.Actor(this.actor.gameInstance, "Marker", null, { layer: -1 });
    }
    ArcadeBody2DMarker.prototype.setIsLayerActive = function (active) {
        if (this.line != null)
            this.line.visible = active;
    };
    ArcadeBody2DMarker.prototype.update = function () {
        _super.prototype.update.call(this);
        this.markerActor.setGlobalPosition(this.actor.getGlobalPosition(tmpVector3));
    };
    ArcadeBody2DMarker.prototype.setBox = function (width, height) {
        if (this.line != null)
            this._clearRenderer();
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-width / 2, -height / 2, 0.01), new THREE.Vector3(width / 2, -height / 2, 0.01), new THREE.Vector3(width / 2, height / 2, 0.01), new THREE.Vector3(-width / 2, height / 2, 0.01), new THREE.Vector3(-width / 2, -height / 2, 0.01));
        var material = new THREE.LineBasicMaterial({ color: 0xf459e4 });
        this.line = new THREE.Line(geometry, material);
        this.markerActor.threeObject.add(this.line);
        this.setOffset();
    };
    ArcadeBody2DMarker.prototype.setOffset = function (x, y) {
        if (x != null && y != null)
            this.offset.set(x, y, 0);
        this.line.position.set(this.offset.x, this.offset.y, 0);
        this.line.updateMatrixWorld(false);
    };
    ArcadeBody2DMarker.prototype.setTileMap = function () {
        if (this.line != null)
            this._clearRenderer();
        // TODO ?
    };
    ArcadeBody2DMarker.prototype._clearRenderer = function () {
        this.markerActor.threeObject.remove(this.line);
        this.line.geometry.dispose();
        this.line.material.dispose();
        this.line = null;
    };
    ArcadeBody2DMarker.prototype._destroy = function () {
        if (this.line != null)
            this._clearRenderer();
        this.actor.gameInstance.destroyActor(this.markerActor);
        this.markerActor = null;
        _super.prototype._destroy.call(this);
    };
    ArcadeBody2DMarker.Updater = ArcadeBody2DUpdater_1.default;
    return ArcadeBody2DMarker;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArcadeBody2DMarker;

},{"./ArcadeBody2DUpdater":4}],4:[function(require,module,exports){
var ArcadeBody2DUpdater = (function () {
    function ArcadeBody2DUpdater(projectClient, bodyRenderer, config) {
        this.projectClient = projectClient;
        this.bodyRenderer = bodyRenderer;
        this.config = config;
        this.setType();
    }
    ArcadeBody2DUpdater.prototype.destroy = function () { };
    ArcadeBody2DUpdater.prototype.config_setProperty = function (path, value) {
        if (path === "width" || path === "height")
            this.bodyRenderer.setBox(this.config.width, this.config.height);
        if (path === "offset.x" || path === "offset.y")
            this.bodyRenderer.setOffset(this.config.offset.x, this.config.offset.y);
        if (path === "type")
            this.setType();
    };
    ArcadeBody2DUpdater.prototype.setType = function () {
        if (this.config.type === "box") {
            this.bodyRenderer.setBox(this.config.width, this.config.height);
            this.bodyRenderer.setOffset(this.config.offset.x, this.config.offset.y);
        }
        else
            this.bodyRenderer.setTileMap();
    };
    return ArcadeBody2DUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArcadeBody2DUpdater;

},{}]},{},[1]);
