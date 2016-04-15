(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Camera = require("./Camera");
var scene = require("./scene");
SupRuntime.registerPlugin("Camera", Camera);
SupRuntime.registerPlugin("scene", scene);

},{"./Camera":2,"./scene":3}],2:[function(require,module,exports){
function setupComponent(player, component, config) {
    component.setOrthographicMode(config.mode === "orthographic");
    component.setFOV(config.fov);
    component.setOrthographicScale(config.orthographicScale);
    component.setDepth(config.depth);
    component.setNearClippingPlane(config.nearClippingPlane);
    component.setFarClippingPlane(config.farClippingPlane);
    component.setViewport(config.viewport.x, config.viewport.y, config.viewport.width, config.viewport.height);
}
exports.setupComponent = setupComponent;

},{}],3:[function(require,module,exports){
function loadAsset(player, entry, callback) {
    player.getAssetData("assets/" + entry.storagePath + "/scene.json", "json", callback);
}
exports.loadAsset = loadAsset;
function createOuterAsset(player, asset) {
    return new window.Sup.Scene(asset);
}
exports.createOuterAsset = createOuterAsset;

},{}]},{},[1]);
