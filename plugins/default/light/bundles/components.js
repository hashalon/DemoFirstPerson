(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Light_1 = require("./Light");
var LightMarker_1 = require("./LightMarker");
SupEngine.registerComponentClass("Light", Light_1.default);
SupEngine.registerEditorComponentClass("LightMarker", LightMarker_1.default);

},{"./Light":2,"./LightMarker":3}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var LightUpdater_1 = require("./LightUpdater");
var Light = (function (_super) {
    __extends(Light, _super);
    function Light(actor) {
        _super.call(this, actor, "Light");
        this.color = 0xffffff;
        this.intensity = 1;
        this.distance = 0;
        this.angle = Math.PI / 3;
        this.target = new THREE.Vector3(0, 0, 0);
        this.castShadow = false;
        this.shadow = {
            mapSize: new THREE.Vector2(512, 512),
            bias: 0,
            // FIXME: Three.js has changed the default to 1.0, should we update?
            darkness: 0.5,
            camera: {
                near: 0.1,
                far: 100,
                fov: 50,
                left: -100,
                right: 100,
                top: 100,
                bottom: -100
            }
        };
        this.actor.gameInstance.threeRenderer.shadowMap.enabled = true;
    }
    Light.prototype.setType = function (type) {
        if (this.light != null)
            this.actor.threeObject.remove(this.light);
        this.type = type;
        switch (type) {
            case "ambient":
                this.light = new THREE.AmbientLight(this.color);
                break;
            case "point":
                this.light = new THREE.PointLight(this.color, this.intensity, this.distance);
                break;
            case "spot":
                var spotLight = new THREE.SpotLight(this.color, this.intensity, this.distance, this.angle * Math.PI / 180);
                spotLight.target.position.copy(this.target);
                spotLight.target.updateMatrixWorld(false);
                spotLight.shadow.mapSize.copy(this.shadow.mapSize);
                spotLight.shadow.bias = this.shadow.bias;
                spotLight.shadow.darkness = this.shadow.darkness;
                spotLight.shadow.camera = new THREE.PerspectiveCamera(this.shadow.camera.fov, this.shadow.mapSize.x / this.shadow.mapSize.y, this.shadow.camera.near, this.shadow.camera.far);
                this.light = spotLight;
                this.setCastShadow(this.castShadow);
                break;
            case "directional":
                var directionalLight = new THREE.DirectionalLight(this.color, this.intensity);
                directionalLight.target.position.copy(this.target);
                directionalLight.target.updateMatrixWorld(false);
                directionalLight.shadow.mapSize.copy(this.shadow.mapSize);
                directionalLight.shadow.bias = this.shadow.bias;
                directionalLight.shadow.darkness = this.shadow.darkness;
                directionalLight.shadow.camera = new THREE.OrthographicCamera(this.shadow.camera.left, this.shadow.camera.right, this.shadow.camera.top, this.shadow.camera.bottom, this.shadow.camera.near, this.shadow.camera.far);
                this.light = directionalLight;
                this.setCastShadow(this.castShadow);
                break;
        }
        this.actor.threeObject.add(this.light);
        this.light.updateMatrixWorld(false);
        this.actor.gameInstance.threeScene.traverse(function (object) {
            var material = object.material;
            if (material != null)
                material.needsUpdate = true;
        });
    };
    Light.prototype.setColor = function (color) {
        this.color = color;
        this.light.color.setHex(this.color);
    };
    Light.prototype.setIntensity = function (intensity) {
        this.intensity = intensity;
        if (this.type !== "ambient")
            this.light.intensity = intensity;
    };
    Light.prototype.setDistance = function (distance) {
        this.distance = distance;
        if (this.type === "point" || this.type === "spot")
            this.light.distance = distance;
    };
    Light.prototype.setAngle = function (angle) {
        this.angle = angle;
        if (this.type === "spot")
            this.light.angle = this.angle * Math.PI / 180;
    };
    Light.prototype.setTarget = function (x, y, z) {
        if (x != null)
            this.target.setX(x);
        if (y != null)
            this.target.setY(y);
        if (z != null)
            this.target.setZ(z);
        if (this.type === "spot" || this.type === "directional") {
            this.light.target.position.copy(this.target);
            this.light.target.updateMatrixWorld(true);
        }
    };
    Light.prototype.setCastShadow = function (castShadow) {
        this.castShadow = castShadow;
        if (this.type !== "spot" && this.type !== "directional")
            return;
        this.light.castShadow = this.castShadow;
        this.actor.gameInstance.threeScene.traverse(function (object) {
            var material = object.material;
            if (material != null)
                material.needsUpdate = true;
        });
    };
    Light.prototype.setShadowMapSize = function (width, height) {
        if (width != null)
            this.shadow.mapSize.x = width;
        if (height != null)
            this.shadow.mapSize.y = height;
        if (this.type !== "spot" && this.type !== "directional")
            return;
        var shadow = this.light.shadow;
        shadow.mapSize.copy(this.shadow.mapSize);
        this.setType(this.type);
    };
    Light.prototype.setShadowBias = function (bias) {
        this.shadow.bias = bias;
        if (this.type !== "spot" && this.type !== "directional")
            return;
        var shadow = this.light.shadow;
        shadow.bias = this.shadow.bias;
    };
    Light.prototype.setShadowDarkness = function (darkness) {
        this.shadow.darkness = darkness;
        if (this.type !== "spot" && this.type !== "directional")
            return;
        var shadow = this.light.shadow;
        shadow.darkness = this.shadow.darkness;
    };
    Light.prototype.setShadowCameraNearPlane = function (near) {
        this.shadow.camera.near = near;
        if (this.type !== "spot" && this.type !== "directional")
            return;
        var shadow = this.light.shadow;
        var camera = shadow.camera;
        camera.near = this.shadow.camera.near;
        camera.updateProjectionMatrix();
    };
    Light.prototype.setShadowCameraFarPlane = function (far) {
        this.shadow.camera.far = far;
        if (this.type !== "spot" && this.type !== "directional")
            return;
        var shadow = this.light.shadow;
        var camera = shadow.camera;
        camera.far = this.shadow.camera.far;
        camera.updateProjectionMatrix();
    };
    Light.prototype.setShadowCameraFov = function (fov) {
        this.shadow.camera.fov = fov;
        if (this.type !== "spot")
            return;
        var shadow = this.light.shadow;
        var camera = shadow.camera;
        camera.fov = this.shadow.camera.fov;
        camera.updateProjectionMatrix();
    };
    Light.prototype.setShadowCameraSize = function (top, bottom, left, right) {
        if (top != null)
            this.shadow.camera.top = top;
        if (bottom != null)
            this.shadow.camera.bottom = bottom;
        if (left != null)
            this.shadow.camera.left = left;
        if (right != null)
            this.shadow.camera.right = right;
        if (this.type !== "directional")
            return;
        var camera = this.light.shadow.camera;
        camera.top = this.shadow.camera.top;
        camera.bottom = this.shadow.camera.bottom;
        camera.left = this.shadow.camera.left;
        camera.right = this.shadow.camera.right;
        camera.updateProjectionMatrix();
    };
    Light.prototype._destroy = function () {
        this.actor.threeObject.remove(this.light);
        if (this.castShadow) {
            this.actor.gameInstance.threeScene.traverse(function (object) {
                var material = object.material;
                if (material != null)
                    material.needsUpdate = true;
            });
        }
        _super.prototype._destroy.call(this);
    };
    Light.prototype.setIsLayerActive = function (active) { this.light.visible = active; };
    Light.Updater = LightUpdater_1.default;
    return Light;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Light;

},{"./LightUpdater":4}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var Light_1 = require("./Light");
var LightMarker = (function (_super) {
    __extends(LightMarker, _super);
    function LightMarker() {
        _super.apply(this, arguments);
    }
    LightMarker.prototype.setType = function (type) {
        if (this.lightMarker != null)
            this.actor.gameInstance.threeScene.remove(this.lightMarker);
        if (this.cameraHelper != null) {
            this.actor.gameInstance.threeScene.remove(this.cameraHelper);
            this.cameraHelper = null;
        }
        _super.prototype.setType.call(this, type);
        switch (type) {
            case "ambient":
                this.lightMarker = null;
                break;
            case "point":
                this.lightMarker = new THREE.PointLightHelper(this.light, 1);
                break;
            case "spot":
                this.lightMarker = new THREE.SpotLightHelper(this.light, 1, 1);
                // if (this.castShadow) this.cameraHelper = new THREE.CameraHelper((<THREE.SpotLight>this.light).shadowCamera);
                break;
            case "directional":
                this.lightMarker = new THREE.DirectionalLightHelper(this.light, 1);
                // if (this.castShadow) this.cameraHelper = new THREE.CameraHelper((<THREE.DirectionalLight>this.light).shadowCamera);
                break;
        }
        if (this.lightMarker != null) {
            this.actor.gameInstance.threeScene.add(this.lightMarker);
            this.lightMarker.updateMatrixWorld(true);
        }
        // if (type === "spot" && this.cameraHelper != null && this.castShadow) this.actor.gameInstance.threeScene.add(this.cameraHelper);
    };
    LightMarker.prototype.setColor = function (color) {
        _super.prototype.setColor.call(this, color);
        if (this.lightMarker != null)
            this.lightMarker.update();
    };
    LightMarker.prototype.setIntensity = function (intensity) {
        _super.prototype.setIntensity.call(this, intensity);
        if (this.lightMarker != null)
            this.lightMarker.update();
    };
    LightMarker.prototype.setDistance = function (distance) {
        _super.prototype.setDistance.call(this, distance);
        if (this.lightMarker != null)
            this.lightMarker.update();
    };
    LightMarker.prototype.setAngle = function (angle) {
        _super.prototype.setAngle.call(this, angle);
        if (this.lightMarker != null)
            this.lightMarker.update();
    };
    LightMarker.prototype.setTarget = function (x, y, z) {
        _super.prototype.setTarget.call(this, x, y, z);
        if (this.lightMarker != null)
            this.lightMarker.update();
    };
    LightMarker.prototype.setCastShadow = function (castShadow) {
        _super.prototype.setCastShadow.call(this, castShadow);
        if (castShadow) {
            this.cameraHelper = new THREE.CameraHelper(this.light.shadow.camera);
            this.actor.gameInstance.threeScene.add(this.cameraHelper);
        }
        else {
            this.actor.gameInstance.threeScene.remove(this.cameraHelper);
            this.cameraHelper = null;
        }
    };
    LightMarker.prototype.setShadowCameraNearPlane = function (near) {
        _super.prototype.setShadowCameraNearPlane.call(this, near);
        if (this.cameraHelper != null)
            this.cameraHelper.update();
    };
    LightMarker.prototype.setShadowCameraFarPlane = function (far) {
        _super.prototype.setShadowCameraFarPlane.call(this, far);
        if (this.cameraHelper != null)
            this.cameraHelper.update();
    };
    LightMarker.prototype.setShadowCameraFov = function (fov) {
        _super.prototype.setShadowCameraFov.call(this, fov);
        if (this.cameraHelper != null)
            this.cameraHelper.update();
    };
    LightMarker.prototype.setShadowCameraSize = function (top, bottom, left, right) {
        _super.prototype.setShadowCameraSize.call(this, top, bottom, left, right);
        if (this.cameraHelper != null)
            this.cameraHelper.update();
    };
    LightMarker.prototype.update = function () {
        // TODO: Only do that when the transform has changed
        if (this.lightMarker != null) {
            this.lightMarker.updateMatrixWorld(true);
            this.lightMarker.update();
        }
        this.actor.gameInstance.threeScene.updateMatrixWorld(false);
    };
    LightMarker.prototype._destroy = function () {
        if (this.lightMarker != null)
            this.actor.gameInstance.threeScene.remove(this.lightMarker);
        if (this.cameraHelper != null)
            this.actor.gameInstance.threeScene.remove(this.cameraHelper);
        _super.prototype._destroy.call(this);
    };
    return LightMarker;
})(Light_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LightMarker;

},{"./Light":2}],4:[function(require,module,exports){
var THREE = SupEngine.THREE;
var LightUpdater = (function () {
    function LightUpdater(projectClient, light, config) {
        this.lightSettingsSubscriber = {
            onResourceReceived: this._onLightResourceRecevied.bind(this),
            onResourceEdited: this._onLightResourceEdited.bind(this)
        };
        this.projectClient = projectClient;
        this.light = light;
        this.light.color = parseInt(config.color, 16);
        this.light.intensity = config.intensity;
        this.light.distance = config.distance;
        this.light.angle = config.angle;
        this.light.target.set(config.target.x, config.target.y, config.target.z);
        this.light.castShadow = config.castShadow;
        this.light.shadow.mapSize.set(config.shadowMapSize.width, config.shadowMapSize.height);
        this.light.shadow.bias = config.shadowBias;
        this.light.shadow.darkness = config.shadowDarkness;
        this.light.shadow.camera.near = config.shadowCameraNearPlane;
        this.light.shadow.camera.far = config.shadowCameraFarPlane;
        this.light.shadow.camera.fov = config.shadowCameraFov;
        this.light.shadow.camera.left = config.shadowCameraSize.left;
        this.light.shadow.camera.right = config.shadowCameraSize.right;
        this.light.shadow.camera.top = config.shadowCameraSize.top;
        this.light.shadow.camera.bottom = config.shadowCameraSize.bottom;
        this.light.setType(config.type);
        this.projectClient.subResource("lightSettings", this.lightSettingsSubscriber);
    }
    LightUpdater.prototype.destroy = function () {
        this.projectClient.unsubResource("lightSettings", this.lightSettingsSubscriber);
    };
    LightUpdater.prototype.config_setProperty = function (path, value) {
        switch (path) {
            case "type":
                this.light.setType(value);
                break;
            case "color":
                this.light.setColor(parseInt(value, 16));
                break;
            case "intensity":
                this.light.setIntensity(value);
                break;
            case "distance":
                this.light.setDistance(value);
                break;
            case "angle":
                this.light.setAngle(value);
                break;
            case "target.x":
                this.light.setTarget(value, null, null);
                break;
            case "target.y":
                this.light.setTarget(null, value, null);
                break;
            case "target.z":
                this.light.setTarget(null, null, value);
                break;
            case "castShadow":
                this.light.setCastShadow(value);
                break;
            case "shadowMapSize.width":
                this.light.setShadowMapSize(value, null);
                break;
            case "shadowMapSize.height":
                this.light.setShadowMapSize(null, value);
                break;
            case "shadowBias":
                this.light.setShadowBias(value);
                break;
            case "shadowDarkness":
                this.light.setShadowDarkness(value);
                break;
            case "shadowCameraNearPlane":
                this.light.setShadowCameraNearPlane(value);
                break;
            case "shadowCameraFarPlane":
                this.light.setShadowCameraFarPlane(value);
                break;
            case "shadowCameraFov":
                this.light.setShadowCameraFov(value);
                break;
            case "shadowCameraSize.top":
                this.light.setShadowCameraSize(value, null, null, null);
                break;
            case "shadowCameraSize.bottom":
                this.light.setShadowCameraSize(null, value, null, null);
                break;
            case "shadowCameraSize.left":
                this.light.setShadowCameraSize(null, null, value, null);
                break;
            case "shadowCameraSize.right":
                this.light.setShadowCameraSize(null, null, null, value);
                break;
        }
    };
    LightUpdater.prototype._updateLightShadowMap = function () {
        switch (this.lightSettings.pub.shadowMapType) {
            case "basic":
                this.light.actor.gameInstance.threeRenderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case "pcf":
                this.light.actor.gameInstance.threeRenderer.shadowMap.type = THREE.PCFShadowMap;
                break;
            case "pcfSoft":
                this.light.actor.gameInstance.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }
        this.light.actor.gameInstance.threeScene.traverse(function (object) {
            var material = object.material;
            if (material != null)
                material.needsUpdate = true;
        });
    };
    LightUpdater.prototype._onLightResourceRecevied = function (resourceId, resource) {
        this.lightSettings = resource;
        this._updateLightShadowMap();
    };
    LightUpdater.prototype._onLightResourceEdited = function (resourceId, command, propertyName) {
        if (command === "setProperty" && propertyName === "shadowMapType")
            this._updateLightShadowMap();
    };
    return LightUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LightUpdater;

},{}]},{},[1]);
