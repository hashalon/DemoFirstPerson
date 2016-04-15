(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
SupRuntime.registerPlugin("sound", require("./sound"));

},{"./sound":2}],2:[function(require,module,exports){
function loadAsset(player, entry, callback) {
    var sound = { buffer: null };
    if (player.gameInstance.audio.getContext() == null) {
        setTimeout(function () { callback(null, sound); }, 0);
        return;
    }
    player.getAssetData("assets/" + entry.storagePath + "/sound.json", "json", function (err, data) {
        player.getAssetData("assets/" + entry.storagePath + "/sound.dat", "arraybuffer", function (err, soundData) {
            if (err != null) {
                callback(err);
                return;
            }
            if (data.streaming) {
                var typedArray = new Uint8Array(soundData);
                var blob = new Blob([typedArray], { type: "audio/*" });
                sound.buffer = URL.createObjectURL(blob);
                setTimeout(function () { callback(null, sound); }, 0);
            }
            else {
                var onLoad = function (buffer) { sound.buffer = buffer; callback(null, sound); };
                var onError = function () { callback(null, sound); };
                player.gameInstance.audio.getContext().decodeAudioData(soundData, onLoad, onError);
            }
        });
    });
}
exports.loadAsset = loadAsset;
function createOuterAsset(player, asset) { return new window.Sup.Sound(asset); }
exports.createOuterAsset = createOuterAsset;

},{}]},{},[1]);
