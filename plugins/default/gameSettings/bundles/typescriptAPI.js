(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../../typescript/typescriptAPI/TypeScriptAPIPlugin.d.ts" />

SupCore.system.registerPlugin("typescriptAPI", "Sup.Game", {
    code: "namespace Sup {\r\n  export namespace Game {\r\n    export function getFPS() { return player.resources.gameSettings.framesPerSecond; }\r\n    export function getScreenRatio() {\r\n      let width = player.resources.gameSettings.ratioNumerator;\r\n      let height = player.resources.gameSettings.ratioDenominator;\r\n      return { width, height };\r\n    }\r\n  }\r\n}\r\n",
    defs: "declare namespace Sup {\r\n  namespace Game {\r\n    function getFPS(): number;\r\n    function getScreenRatio(): { width: number; height: number; };\r\n  }\r\n}\r\n"
});

},{}]},{},[1]);
