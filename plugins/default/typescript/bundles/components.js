(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Behavior_1 = require("./Behavior");
var BehaviorMarker_1 = require("./BehaviorMarker");
SupEngine.registerComponentClass("Behavior", Behavior_1.default);
SupEngine.registerEditorComponentClass("BehaviorMarker", BehaviorMarker_1.default);

},{"./Behavior":2,"./BehaviorMarker":3}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Behavior = (function (_super) {
    __extends(Behavior, _super);
    function Behavior(actor, funcs) {
        this.funcs = funcs;
        _super.call(this, actor, "Behavior");
    }
    Behavior.prototype.awake = function () { if (this.funcs.awake != null)
        this.funcs.awake(); };
    Behavior.prototype.start = function () { if (this.funcs.start != null)
        this.funcs.start(); };
    Behavior.prototype.update = function () { if (this.funcs.update != null)
        this.funcs.update(); };
    Behavior.prototype._destroy = function () {
        if (this.funcs.onDestroy != null)
            this.funcs.onDestroy();
        this.funcs = null;
        _super.prototype._destroy.call(this);
    };
    Behavior.prototype.setIsLayerActive = function (active) { };
    return Behavior;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Behavior;

},{}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BehaviorUpdater_1 = require("./BehaviorUpdater");
var BehaviorMarker = (function (_super) {
    __extends(BehaviorMarker, _super);
    function BehaviorMarker(actor) {
        _super.call(this, actor, "BehaviorMarker");
    }
    BehaviorMarker.prototype.setIsLayerActive = function (active) { };
    BehaviorMarker.Updater = BehaviorUpdater_1.default;
    return BehaviorMarker;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BehaviorMarker;

},{"./BehaviorUpdater":4}],4:[function(require,module,exports){
var BehaviorUpdater = (function () {
    function BehaviorUpdater(client, behavior, config) {
    }
    BehaviorUpdater.prototype.destroy = function () { };
    return BehaviorUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BehaviorUpdater;

},{}]},{},[1]);
