(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var P2Body_1 = require("./P2Body");
var P2BodyMarker_1 = require("./P2BodyMarker");
SupEngine.registerComponentClass("P2Body", P2Body_1.default);
SupEngine.registerEditorComponentClass("P2BodyMarker", P2BodyMarker_1.default);

},{"./P2Body":2,"./P2BodyMarker":3}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var P2Body = (function (_super) {
    __extends(P2Body, _super);
    function P2Body(actor) {
        _super.call(this, actor, "P2Body");
        this.actorPosition = new THREE.Vector3();
        this.actorAngles = new THREE.Euler();
        this.body = new window.p2.Body();
        SupEngine.P2.World.addBody(this.body);
    }
    P2Body.prototype.setIsLayerActive = function (active) { };
    P2Body.prototype.setup = function (config) {
        this.mass = (config.mass != null) ? config.mass : 0;
        this.fixedRotation = (config.fixedRotation != null) ? config.fixedRotation : false;
        this.offsetX = (config.offsetX != null) ? config.offsetX : 0;
        this.offsetY = (config.offsetY != null) ? config.offsetY : 0;
        this.actor.getGlobalPosition(this.actorPosition);
        this.actor.getGlobalEulerAngles(this.actorAngles);
        this.body.mass = this.mass;
        this.body.type = (this.mass === 0) ? window.p2.Body.STATIC : window.p2.Body.DYNAMIC;
        this.body.material = SupEngine.P2.World.defaultMaterial;
        this.body.fixedRotation = this.fixedRotation;
        this.body.updateMassProperties();
        this.shape = config.shape;
        switch (this.shape) {
            case "box":
                {
                    this.width = (config.width != null) ? config.width : 0.5;
                    this.height = (config.height != null) ? config.height : 0.5;
                    this.body.addShape(new window.p2.Box({ width: this.width, height: this.height }));
                }
                break;
            case "circle":
                {
                    this.radius = (config.radius != null) ? config.radius : 1;
                    this.body.addShape(new window.p2.Circle({ radius: this.radius }));
                }
                break;
        }
        this.body.position = [this.actorPosition.x, this.actorPosition.y];
        this.body.shapes[0].position = [this.offsetX, this.offsetY];
        this.body.angle = this.actorAngles.z;
    };
    P2Body.prototype.update = function () {
        this.actorPosition.x = this.body.position[0];
        this.actorPosition.y = this.body.position[1];
        this.actor.setGlobalPosition(this.actorPosition);
        this.actorAngles.z = this.body.angle;
        this.actor.setGlobalEulerAngles(this.actorAngles);
    };
    P2Body.prototype._destroy = function () {
        SupEngine.P2.World.removeBody(this.body);
        this.body = null;
        _super.prototype._destroy.call(this);
    };
    return P2Body;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = P2Body;

},{}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var P2BodyMarkerUpdater_1 = require("./P2BodyMarkerUpdater");
var P2BodyMarker = (function (_super) {
    __extends(P2BodyMarker, _super);
    function P2BodyMarker(actor) {
        _super.call(this, actor, "P2BodyMarker");
        this.offset = new THREE.Vector3(0, 0, 0);
    }
    P2BodyMarker.prototype.setIsLayerActive = function (active) {
        if (this.mesh != null)
            this.mesh.visible = active;
    };
    P2BodyMarker.prototype.setBox = function (width, height) {
        if (this.mesh != null)
            this._clearRenderer();
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-width / 2, -height / 2, 0), new THREE.Vector3(width / 2, -height / 2, 0), new THREE.Vector3(width / 2, height / 2, 0), new THREE.Vector3(-width / 2, height / 2, 0), new THREE.Vector3(-width / 2, -height / 2, 0));
        var material = new THREE.LineBasicMaterial({ color: 0xf459e4 });
        this.mesh = new THREE.Line(geometry, material);
        this.actor.threeObject.add(this.mesh);
        this.mesh.position.copy(this.offset);
        this.mesh.updateMatrixWorld(false);
    };
    P2BodyMarker.prototype.setCircle = function (radius) {
        if (this.mesh != null)
            this._clearRenderer();
        var geometry = new THREE.CircleGeometry(radius, 16);
        var material = new THREE.MeshBasicMaterial({ color: 0xf459e4, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.actor.threeObject.add(this.mesh);
        this.mesh.position.copy(this.offset);
        this.mesh.updateMatrixWorld(false);
    };
    P2BodyMarker.prototype.setOffset = function (xOffset, yOffset) {
        this.offset.set(xOffset, yOffset, 0);
        this.mesh.position.copy(this.offset);
        this.mesh.updateMatrixWorld(false);
    };
    P2BodyMarker.prototype._clearRenderer = function () {
        this.actor.threeObject.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
    };
    P2BodyMarker.prototype._destroy = function () {
        if (this.mesh != null)
            this._clearRenderer();
        _super.prototype._destroy.call(this);
    };
    P2BodyMarker.Updater = P2BodyMarkerUpdater_1.default;
    return P2BodyMarker;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = P2BodyMarker;

},{"./P2BodyMarkerUpdater":4}],4:[function(require,module,exports){
var P2BodyMarkerUpdater = (function () {
    function P2BodyMarkerUpdater(client, bodyRenderer, config) {
        this.bodyRenderer = bodyRenderer;
        this.config = config;
        switch (this.config.shape) {
            case "box":
                {
                    this.bodyRenderer.setBox(this.config.width, this.config.height);
                }
                break;
            case "circle":
                {
                    this.bodyRenderer.setCircle(this.config.radius);
                }
                break;
        }
        this.bodyRenderer.setOffset(this.config.offsetX, this.config.offsetY);
    }
    P2BodyMarkerUpdater.prototype.destroy = function () { };
    P2BodyMarkerUpdater.prototype.config_setProperty = function (path, value) {
        if (path === "width" || path === "height" || (path === "shape" && value === "box")) {
            this.bodyRenderer.setBox(this.config.width, this.config.height);
        }
        if (path === "radius" || (path === "shape" && value === "circle")) {
            this.bodyRenderer.setCircle(this.config.radius);
        }
        if (path === "offsetX" || path === "offsetY") {
            this.bodyRenderer.setOffset(this.config.offsetX, this.config.offsetY);
        }
    };
    return P2BodyMarkerUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = P2BodyMarkerUpdater;

},{}]},{},[1]);
