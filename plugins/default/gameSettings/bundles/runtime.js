(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var gameSettings = require("./gameSettings");
var gameSettingsResource = require("./gameSettingsResource");
SupRuntime.registerPlugin("gameSettings", gameSettings);
SupRuntime.registerResource("gameSettings", gameSettingsResource);

},{"./gameSettings":2,"./gameSettingsResource":3}],2:[function(require,module,exports){
function init(player, callback) {
    player.gameInstance.framesPerSecond = player.resources.gameSettings.framesPerSecond;
    SupRuntime.Player.updateInterval = 1000 / player.gameInstance.framesPerSecond;
    if (player.resources.gameSettings.ratioNumerator != null && player.resources.gameSettings.ratioDenominator != null) {
        player.gameInstance.setRatio(player.resources.gameSettings.ratioNumerator / player.resources.gameSettings.ratioDenominator);
    }
    // NOTE: Custom layers were introduced in Superpowers 0.8
    if (player.resources.gameSettings.customLayers != null) {
        player.gameInstance.layers = player.gameInstance.layers.concat(player.resources.gameSettings.customLayers);
    }
    callback();
}
exports.init = init;
function lateStart(player, callback) {
    var sceneId = player.resources.gameSettings.startupSceneId;
    if (sceneId != null) {
        var outerAsset = player.getOuterAsset(sceneId);
        if (outerAsset != null && outerAsset.type === "scene")
            window.Sup.loadScene(outerAsset);
    }
    callback();
}
exports.lateStart = lateStart;

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
