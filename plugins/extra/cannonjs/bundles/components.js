(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CannonBody_1 = require("./CannonBody");
var CannonBodyMarker_1 = require("./CannonBodyMarker");
SupEngine.registerComponentClass("CannonBody", CannonBody_1.default);
SupEngine.registerEditorComponentClass("CannonBodyMarker", CannonBodyMarker_1.default);

},{"./CannonBody":2,"./CannonBodyMarker":3}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var CannonBody = (function (_super) {
    __extends(CannonBody, _super);
    function CannonBody(actor) {
        _super.call(this, actor, "CannonBody");
        this.actorPosition = new THREE.Vector3();
        this.actorOrientation = new THREE.Quaternion();
        this.body = new window.CANNON.Body();
        SupEngine.Cannon.World.addBody(this.body);
    }
    CannonBody.prototype.setIsLayerActive = function (active) { };
    CannonBody.prototype.setup = function (config) {
        this.mass = config.mass != null ? config.mass : 0;
        this.fixedRotation = config.fixedRotation != null ? config.fixedRotation : false;
        // NOTE: config.offset was introduced in Superpowers 0.14
        // to merge config.offsetX, .offsetY and .offsetZ
        if (config.offset != null) {
            this.offset = {
                x: config.offset.x,
                y: config.offset.y,
                z: config.offset.z
            };
        }
        else {
            this.offset = {
                x: config.offsetX != null ? config.offsetX : 0,
                y: config.offsetY != null ? config.offsetY : 0,
                z: config.offsetZ != null ? config.offsetZ : 0
            };
        }
        this.actor.getGlobalPosition(this.actorPosition);
        this.actor.getGlobalOrientation(this.actorOrientation);
        this.body.mass = this.mass;
        this.body.type = this.mass === 0 ? window.CANNON.Body.STATIC : window.CANNON.Body.DYNAMIC;
        this.body.material = SupEngine.Cannon.World.defaultMaterial;
        this.body.fixedRotation = this.fixedRotation;
        this.body.updateMassProperties();
        this.shape = config.shape;
        switch (this.shape) {
            case "box":
                // NOTE: config.halfSize was introduced in Superpowers 0.14
                // to merge config.halfWidth, .halfHeight and .halfDepth
                if (config.halfSize != null) {
                    this.halfSize = {
                        x: config.halfSize.x,
                        y: config.halfSize.y,
                        z: config.halfSize.z
                    };
                }
                else {
                    this.halfSize = {
                        x: config.halfWidth != null ? config.halfWidth : 0.5,
                        y: config.halfHeight != null ? config.halfHeight : 0.5,
                        z: config.halfDepth != null ? config.halfDepth : 0.5
                    };
                }
                this.body.addShape(new window.CANNON.Box(new window.CANNON.Vec3().copy(this.halfSize)));
                break;
            case "sphere":
                this.radius = config.radius != null ? config.radius : 1;
                this.body.addShape(new window.CANNON.Sphere(this.radius));
                break;
            case "cylinder":
                this.radius = config.radius != null ? config.radius : 1;
                this.height = config.height != null ? config.height : 1;
                this.body.addShape(new window.CANNON.Cylinder(this.radius, this.radius, this.height, 20));
                break;
        }
        this.body.position.set(this.actorPosition.x, this.actorPosition.y, this.actorPosition.z);
        this.body.shapeOffsets[0].copy(this.offset);
        this.body.quaternion.set(this.actorOrientation.x, this.actorOrientation.y, this.actorOrientation.z, this.actorOrientation.w);
    };
    CannonBody.prototype.update = function () {
        this.actorPosition.set(this.body.position.x, this.body.position.y, this.body.position.z);
        this.actor.setGlobalPosition(this.actorPosition);
        this.actorOrientation.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
        this.actor.setGlobalOrientation(this.actorOrientation);
    };
    CannonBody.prototype._destroy = function () {
        SupEngine.Cannon.World.remove(this.body);
        this.body = null;
        _super.prototype._destroy.call(this);
    };
    return CannonBody;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CannonBody;

},{}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var CannonBodyMarkerUpdater_1 = require("./CannonBodyMarkerUpdater");
var CannonBodyMarker = (function (_super) {
    __extends(CannonBodyMarker, _super);
    function CannonBodyMarker(actor) {
        _super.call(this, actor, "CannonBodyMarker");
    }
    CannonBodyMarker.prototype.setIsLayerActive = function (active) { if (this.mesh != null)
        this.mesh.visible = active; };
    CannonBodyMarker.prototype.setBox = function (halfSize) {
        if (this.mesh != null)
            this._clearRenderer();
        var geometry = new THREE.BoxGeometry(halfSize.x * 2, halfSize.y * 2, halfSize.z * 2);
        var material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xf459e4, transparent: true, opacity: 0.2 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.actor.threeObject.add(this.mesh);
        this.mesh.updateMatrixWorld(false);
    };
    CannonBodyMarker.prototype.setSphere = function (radius) {
        if (this.mesh != null)
            this._clearRenderer();
        var geometry = new THREE.SphereGeometry(radius);
        var material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xf459e4, transparent: true, opacity: 0.2 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.actor.threeObject.add(this.mesh);
        this.mesh.updateMatrixWorld(false);
    };
    CannonBodyMarker.prototype.setCylinder = function (radius, height) {
        if (this.mesh != null)
            this._clearRenderer();
        var geometry = new THREE.CylinderGeometry(radius, radius, height);
        var material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xf459e4, transparent: true, opacity: 0.2 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.actor.threeObject.add(this.mesh);
        this.mesh.updateMatrixWorld(false);
    };
    CannonBodyMarker.prototype.setOffset = function (offset) {
        this.mesh.position.copy(offset);
        this.mesh.updateMatrixWorld(false);
    };
    CannonBodyMarker.prototype._clearRenderer = function () {
        this.actor.threeObject.remove(this.mesh);
        this.mesh.traverse(function (obj) {
            if (obj.dispose != null)
                obj.dispose();
        });
        this.mesh = null;
    };
    CannonBodyMarker.prototype._destroy = function () {
        if (this.mesh != null)
            this._clearRenderer();
        _super.prototype._destroy.call(this);
    };
    CannonBodyMarker.Updater = CannonBodyMarkerUpdater_1.default;
    return CannonBodyMarker;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CannonBodyMarker;

},{"./CannonBodyMarkerUpdater":4}],4:[function(require,module,exports){
var CannonBodyMarkerUpdater = (function () {
    function CannonBodyMarkerUpdater(client, bodyRenderer, config) {
        this.client = client;
        this.bodyRenderer = bodyRenderer;
        this.config = config;
        switch (this.config.shape) {
            case "box":
                this.bodyRenderer.setBox(this.config.halfSize);
                break;
            case "sphere":
                this.bodyRenderer.setSphere(this.config.radius);
                break;
            case "cylinder":
                this.bodyRenderer.setCylinder(this.config.radius, this.config.height);
                break;
        }
        this.bodyRenderer.setOffset(this.config.offset);
    }
    CannonBodyMarkerUpdater.prototype.destroy = function () { };
    CannonBodyMarkerUpdater.prototype.config_setProperty = function (path, value) {
        if (path.indexOf("halfSize") !== -1 || (path === "shape" && value === "box")) {
            this.bodyRenderer.setBox(this.config.halfSize);
            this.bodyRenderer.setOffset(this.config.offset);
        }
        if (path.indexOf("offset") !== -1) {
            this.bodyRenderer.setOffset(this.config.offset);
        }
        if ((path === "radius" && this.config.shape === "cylinder") || (path === "shape" && value === "cylinder") || path === "height") {
            this.bodyRenderer.setCylinder(this.config.radius, this.config.height);
            this.bodyRenderer.setOffset(this.config.offset);
        }
        if ((path === "radius" && this.config.shape === "sphere") || (path === "shape" && value === "sphere")) {
            this.bodyRenderer.setSphere(this.config.radius);
            this.bodyRenderer.setOffset(this.config.offset);
        }
    };
    return CannonBodyMarkerUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CannonBodyMarkerUpdater;

},{}]},{},[1]);
