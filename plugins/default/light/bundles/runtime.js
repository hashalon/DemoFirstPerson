(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Light = require("./Light");
var lightSettingsResource = require("./lightSettingsResource");
SupRuntime.registerPlugin("Light", Light);
SupRuntime.registerResource("lightSettings", lightSettingsResource);

},{"./Light":2,"./lightSettingsResource":3}],2:[function(require,module,exports){
var THREE = SupEngine.THREE;
function init(player, callback) {
    switch (player.resources.lightSettings.shadowMapType) {
        case "basic":
            player.gameInstance.threeRenderer.shadowMap.type = THREE.BasicShadowMap;
            break;
        case "pcf":
            player.gameInstance.threeRenderer.shadowMap.type = THREE.PCFShadowMap;
            break;
        case "pcfSoft":
            player.gameInstance.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
            break;
    }
    callback();
}
exports.init = init;
function setupComponent(player, component, config) {
    component.__outer.type = ["ambient", "point", "spot", "directional"].indexOf(config.type);
    component.color = parseInt(config.color, 16);
    component.intensity = config.intensity;
    component.distance = config.distance;
    component.angle = config.angle;
    component.target.set(config.target.x, config.target.y, config.target.z);
    component.castShadow = config.castShadow;
    component.shadow.mapSize.set(config.shadowMapSize.width, config.shadowMapSize.height);
    component.shadow.bias = config.shadowBias;
    component.shadow.darkness = config.shadowDarkness;
    component.shadow.camera.near = config.shadowCameraNearPlane;
    component.shadow.camera.far = config.shadowCameraFarPlane;
    component.shadow.camera.fov = config.shadowCameraFov;
    component.shadow.camera.left = config.shadowCameraSize.left;
    component.shadow.camera.right = config.shadowCameraSize.right;
    component.shadow.camera.top = config.shadowCameraSize.top;
    component.shadow.camera.bottom = config.shadowCameraSize.bottom;
    component.setType(config.type);
}
exports.setupComponent = setupComponent;

},{}],3:[function(require,module,exports){
function loadResource(player, resourceName, callback) {
    player.getAssetData("resources/" + resourceName + "/resource.json", "json", function (err, data) {
        if (err != null) {
            callback(err);
            return;
        }
        callback(null, data);
    });
}
exports.loadResource = loadResource;

},{}]},{},[1]);
