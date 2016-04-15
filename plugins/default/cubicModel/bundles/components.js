(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CubicModelRenderer_1 = require("./CubicModelRenderer");
SupEngine.registerComponentClass("CubicModelRenderer", CubicModelRenderer_1.default);

},{"./CubicModelRenderer":2}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var CubicModelRendererUpdater_1 = require("./CubicModelRendererUpdater");
var CubicModelRenderer = (function (_super) {
    __extends(CubicModelRenderer, _super);
    // castShadow = false;
    // receiveShadow = false;
    function CubicModelRenderer(actor) {
        _super.call(this, actor, "ModelRenderer");
        this.materialType = "basic";
    }
    CubicModelRenderer.prototype._clearMesh = function () {
        this.actor.threeObject.remove(this.threeRoot);
        this.threeRoot.traverse(function (obj) { if (obj.dispose != null)
            obj.dispose(); });
        this.threeRoot = null;
        this.byNodeId = null;
    };
    CubicModelRenderer.prototype._destroy = function () {
        if (this.asset != null)
            this._clearMesh();
        this.asset = null;
        _super.prototype._destroy.call(this);
    };
    CubicModelRenderer.prototype.setCubicModel = function (asset, materialType, customShader) {
        var _this = this;
        if (this.asset != null)
            this._clearMesh();
        this.asset = asset;
        if (asset == null)
            return;
        // Nodes
        this.threeRoot = new THREE.Object3D();
        this.threeRoot.scale.set(1 / asset.pixelsPerUnit, 1 / asset.pixelsPerUnit, 1 / asset.pixelsPerUnit);
        this.byNodeId = {};
        var walkNode = function (node, parentRendererNode, parentOffset) {
            var rendererNode = _this._makeNode(node, parentRendererNode, parentOffset);
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                walkNode(childNode, rendererNode, node.shape.offset);
            }
        };
        for (var _i = 0, _a = asset.nodes; _i < _a.length; _i++) {
            var rootNode = _a[_i];
            walkNode(rootNode, null, { x: 0, y: 0, z: 0 });
        }
        this.actor.threeObject.add(this.threeRoot);
        this.threeRoot.updateMatrixWorld(false);
    };
    CubicModelRenderer.prototype._makeNode = function (node, parentRendererNode, parentOffset) {
        var pivot;
        var material = new THREE.MeshBasicMaterial({
            map: this.asset.textures["map"],
            side: THREE.DoubleSide,
            transparent: true
        });
        pivot = new THREE.Object3D();
        pivot.name = node.name;
        pivot.userData.cubicNodeId = node.id;
        var shape;
        if (node.shape.type === "box") {
            var size = node.shape.settings.size;
            var boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            this.updateBoxNodeUv(boxGeometry, node);
            shape = new THREE.Mesh(boxGeometry, material);
            shape.scale.set(node.shape.settings.stretch.x, node.shape.settings.stretch.y, node.shape.settings.stretch.z);
        }
        if (shape != null) {
            shape.position.set(node.shape.offset.x, node.shape.offset.y, node.shape.offset.z);
            pivot.add(shape);
        }
        var rendererNode = { pivot: pivot, shape: shape, nodeId: node.id, children: [] };
        this.byNodeId[node.id] = rendererNode;
        if (parentRendererNode != null)
            parentRendererNode.children.push(rendererNode);
        pivot.position.set(node.position.x + parentOffset.x, node.position.y + parentOffset.y, node.position.z + parentOffset.z);
        pivot.quaternion.set(node.orientation.x, node.orientation.y, node.orientation.z, node.orientation.w);
        // NOTE: Hierarchical scale is not supported for now, we'll see if the need arises
        // nodeObject.scale.set(node.scale.x, node.scale.y, node.scale.z);
        if (parentRendererNode == null)
            this.threeRoot.add(pivot);
        else
            parentRendererNode.pivot.add(pivot);
        pivot.updateMatrixWorld(false);
        return rendererNode;
    };
    CubicModelRenderer.prototype.updateBoxNodeUv = function (geometry, node) {
        var width = this.asset.textureWidth;
        var height = this.asset.textureHeight;
        var size = node.shape.settings.size;
        var offset;
        var bottomLeft = new THREE.Vector2();
        var bottomRight = new THREE.Vector2();
        var topLeft = new THREE.Vector2();
        var topRight = new THREE.Vector2();
        // Left Face
        offset = node.shape.textureLayout["left"].offset;
        bottomLeft.set((offset.x) / width, (height - offset.y - size.y) / height);
        bottomRight.set((offset.x + size.z) / width, (height - offset.y - size.y) / height);
        topLeft.set((offset.x) / width, (height - offset.y) / height);
        topRight.set((offset.x + size.z) / width, (height - offset.y) / height);
        geometry.faceVertexUvs[0][2][0].copy(topLeft);
        geometry.faceVertexUvs[0][2][1].copy(bottomLeft);
        geometry.faceVertexUvs[0][2][2].copy(topRight);
        geometry.faceVertexUvs[0][3][0].copy(bottomLeft);
        geometry.faceVertexUvs[0][3][1].copy(bottomRight);
        geometry.faceVertexUvs[0][3][2].copy(topRight);
        // Front Face
        offset = node.shape.textureLayout["front"].offset;
        bottomLeft.set((offset.x) / width, (height - offset.y - size.y) / height);
        bottomRight.set((offset.x + size.x) / width, (height - offset.y - size.y) / height);
        topLeft.set((offset.x) / width, (height - offset.y) / height);
        topRight.set((offset.x + size.x) / width, (height - offset.y) / height);
        geometry.faceVertexUvs[0][8][0].copy(topLeft);
        geometry.faceVertexUvs[0][8][1].copy(bottomLeft);
        geometry.faceVertexUvs[0][8][2].copy(topRight);
        geometry.faceVertexUvs[0][9][0].copy(bottomLeft);
        geometry.faceVertexUvs[0][9][1].copy(bottomRight);
        geometry.faceVertexUvs[0][9][2].copy(topRight);
        // Right Face
        offset = node.shape.textureLayout["right"].offset;
        bottomLeft.set((offset.x) / width, (height - offset.y - size.y) / height);
        bottomRight.set((offset.x + size.z) / width, (height - offset.y - size.y) / height);
        topLeft.set((offset.x) / width, (height - offset.y) / height);
        topRight.set((offset.x + size.z) / width, (height - offset.y) / height);
        geometry.faceVertexUvs[0][0][0].copy(topLeft);
        geometry.faceVertexUvs[0][0][1].copy(bottomLeft);
        geometry.faceVertexUvs[0][0][2].copy(topRight);
        geometry.faceVertexUvs[0][1][0].copy(bottomLeft);
        geometry.faceVertexUvs[0][1][1].copy(bottomRight);
        geometry.faceVertexUvs[0][1][2].copy(topRight);
        // Back Face
        offset = node.shape.textureLayout["back"].offset;
        bottomLeft.set((offset.x) / width, (height - offset.y - size.y) / height);
        bottomRight.set((offset.x + size.x) / width, (height - offset.y - size.y) / height);
        topLeft.set((offset.x) / width, (height - offset.y) / height);
        topRight.set((offset.x + size.x) / width, (height - offset.y) / height);
        geometry.faceVertexUvs[0][10][0].copy(topLeft);
        geometry.faceVertexUvs[0][10][1].copy(bottomLeft);
        geometry.faceVertexUvs[0][10][2].copy(topRight);
        geometry.faceVertexUvs[0][11][0].copy(bottomLeft);
        geometry.faceVertexUvs[0][11][1].copy(bottomRight);
        geometry.faceVertexUvs[0][11][2].copy(topRight);
        // Top Face
        offset = node.shape.textureLayout["top"].offset;
        bottomLeft.set((offset.x) / width, (height - offset.y - size.z) / height);
        bottomRight.set((offset.x + size.x) / width, (height - offset.y - size.z) / height);
        topLeft.set((offset.x) / width, (height - offset.y) / height);
        topRight.set((offset.x + size.x) / width, (height - offset.y) / height);
        geometry.faceVertexUvs[0][4][0].copy(topLeft);
        geometry.faceVertexUvs[0][4][1].copy(bottomLeft);
        geometry.faceVertexUvs[0][4][2].copy(topRight);
        geometry.faceVertexUvs[0][5][0].copy(bottomLeft);
        geometry.faceVertexUvs[0][5][1].copy(bottomRight);
        geometry.faceVertexUvs[0][5][2].copy(topRight);
        // Bottom Face
        offset = node.shape.textureLayout["bottom"].offset;
        bottomLeft.set((offset.x) / width, (height - offset.y - size.z) / height);
        bottomRight.set((offset.x + size.x) / width, (height - offset.y - size.z) / height);
        topLeft.set((offset.x) / width, (height - offset.y) / height);
        topRight.set((offset.x + size.x) / width, (height - offset.y) / height);
        geometry.faceVertexUvs[0][6][0].copy(topLeft);
        geometry.faceVertexUvs[0][6][1].copy(bottomLeft);
        geometry.faceVertexUvs[0][6][2].copy(topRight);
        geometry.faceVertexUvs[0][7][0].copy(bottomLeft);
        geometry.faceVertexUvs[0][7][1].copy(bottomRight);
        geometry.faceVertexUvs[0][7][2].copy(topRight);
        geometry.uvsNeedUpdate = true;
    };
    CubicModelRenderer.prototype.setIsLayerActive = function (active) { if (this.threeRoot != null)
        this.threeRoot.visible = active; };
    CubicModelRenderer.Updater = CubicModelRendererUpdater_1.default;
    return CubicModelRenderer;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CubicModelRenderer;

},{"./CubicModelRendererUpdater":3}],3:[function(require,module,exports){
var THREE = SupEngine.THREE;
var CubicModelRendererUpdater = (function () {
    function CubicModelRendererUpdater(client, cubicModelRenderer, config, receiveAssetCallbacks, editAssetCallbacks) {
        var _this = this;
        this.cubicModelAsset = null;
        this.cubicModelSubscriber = {
            onAssetReceived: this._onCubicModelAssetReceived.bind(this),
            onAssetEdited: this._onCubicModelAssetEdited.bind(this),
            onAssetTrashed: this._onCubicModelAssetTrashed.bind(this)
        };
        this._onEditCommand_moveNode = function (id, parentId, index) {
            var rendererNode = _this.cubicModelRenderer.byNodeId[id];
            var pivot = rendererNode.pivot;
            var matrix = pivot.matrixWorld.clone();
            var previousParentId = pivot.parent.userData.cubicNodeId;
            if (previousParentId != null) {
                var parentNode = _this.cubicModelRenderer.byNodeId[previousParentId];
                parentNode.children.splice(parentNode.children.indexOf(rendererNode), 1);
            }
            var parent = (parentId != null) ? _this.cubicModelRenderer.byNodeId[parentId].pivot : _this.cubicModelRenderer.threeRoot;
            parent.add(pivot);
            matrix.multiplyMatrices(new THREE.Matrix4().getInverse(parent.matrixWorld), matrix);
            matrix.decompose(pivot.position, pivot.quaternion, pivot.scale);
            pivot.updateMatrixWorld(false);
        };
        this._onEditCommand_moveNodePivot = function (id, value) {
            var rendererNode = _this.cubicModelRenderer.byNodeId[id];
            var node = _this.cubicModelAsset.nodes.byId[id];
            var parentNode = _this.cubicModelAsset.nodes.parentNodesById[id];
            var parentOffset = (parentNode != null) ? parentNode.shape.offset : { x: 0, y: 0, z: 0 };
            rendererNode.pivot.position.set(value.x + parentOffset.x, value.y + parentOffset.y, value.z + parentOffset.z);
            rendererNode.pivot.quaternion.set(node.orientation.x, node.orientation.y, node.orientation.z, node.orientation.w);
            rendererNode.shape.position.set(node.shape.offset.x, node.shape.offset.y, node.shape.offset.z);
            var walk = function (rendererNode, parentOffset) {
                var node = _this.cubicModelAsset.nodes.byId[rendererNode.nodeId];
                rendererNode.pivot.position.set(node.position.x + parentOffset.x, node.position.y + parentOffset.y, node.position.z + parentOffset.z);
                for (var _i = 0, _a = rendererNode.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    walk(child, node.shape.offset);
                }
            };
            for (var _i = 0, _a = rendererNode.children; _i < _a.length; _i++) {
                var child = _a[_i];
                walk(child, node.shape.offset);
            }
            rendererNode.pivot.updateMatrixWorld(false);
        };
        this._onEditCommand_setNodeProperty = function (id, path, value) {
            var rendererNode = _this.cubicModelRenderer.byNodeId[id];
            var node = _this.cubicModelAsset.nodes.byId[id];
            switch (path) {
                case "name":
                    rendererNode.pivot.name = value;
                    break;
                case "position":
                    var parentNode = _this.cubicModelAsset.nodes.parentNodesById[id];
                    var parentOffset = (parentNode != null) ? parentNode.shape.offset : { x: 0, y: 0, z: 0 };
                    rendererNode.pivot.position.set(value.x + parentOffset.x, value.y + parentOffset.y, value.z + parentOffset.z);
                    rendererNode.pivot.updateMatrixWorld(false);
                    break;
                case "orientation":
                    rendererNode.pivot.quaternion.set(value.x, value.y, value.z, value.w);
                    rendererNode.pivot.updateMatrixWorld(false);
                    break;
                case "shape.offset":
                    rendererNode.shape.position.set(value.x, value.y, value.z);
                    var walk = function (rendererNode, parentOffset) {
                        var node = _this.cubicModelAsset.nodes.byId[rendererNode.nodeId];
                        rendererNode.pivot.position.set(node.position.x + parentOffset.x, node.position.y + parentOffset.y, node.position.z + parentOffset.z);
                        for (var _i = 0, _a = rendererNode.children; _i < _a.length; _i++) {
                            var child = _a[_i];
                            walk(child, node.shape.offset);
                        }
                    };
                    for (var _i = 0, _a = rendererNode.children; _i < _a.length; _i++) {
                        var child = _a[_i];
                        walk(child, node.shape.offset);
                    }
                    rendererNode.pivot.updateMatrixWorld(false);
                    break;
                default: {
                    switch (node.shape.type) {
                        case "box":
                            switch (path) {
                                case "shape.settings.size":
                                    var geometry = rendererNode.shape.geometry = new THREE.BoxGeometry(value.x, value.y, value.z);
                                    _this.cubicModelRenderer.updateBoxNodeUv(geometry, node);
                                    break;
                                case "shape.settings.stretch":
                                    rendererNode.shape.scale.set(value.x, value.y, value.z);
                                    rendererNode.shape.updateMatrixWorld(false);
                                    break;
                            }
                            break;
                    }
                    break;
                }
            }
        };
        this._onEditCommand_duplicateNode = function (rootNode, newNodes) {
            for (var _i = 0; _i < newNodes.length; _i++) {
                var newNode = newNodes[_i];
                _this._createRendererNode(newNode.node);
            }
        };
        this._onEditCommand_removeNode = function (id) {
            _this._recurseClearNode(id);
        };
        this._onEditCommand_changeTextureWidth = function () { _this._onChangeTextureSize(); };
        this._onEditCommand_changeTextureHeight = function () { _this._onChangeTextureSize(); };
        this.client = client;
        this.cubicModelRenderer = cubicModelRenderer;
        this.receiveAssetCallbacks = receiveAssetCallbacks;
        this.editAssetCallbacks = editAssetCallbacks;
        this.cubicModelAssetId = config.cubicModelAssetId;
        if (this.cubicModelAssetId != null)
            this.client.subAsset(this.cubicModelAssetId, "cubicModel", this.cubicModelSubscriber);
    }
    CubicModelRendererUpdater.prototype.destroy = function () {
        if (this.cubicModelAssetId != null)
            this.client.unsubAsset(this.cubicModelAssetId, this.cubicModelSubscriber);
    };
    CubicModelRendererUpdater.prototype._onCubicModelAssetReceived = function (assetId, asset) {
        this.cubicModelAsset = asset;
        this._setCubicModel();
        if (this.receiveAssetCallbacks != null)
            this.receiveAssetCallbacks.cubicModel();
    };
    CubicModelRendererUpdater.prototype._setCubicModel = function () {
        if (this.cubicModelAsset == null) {
            this.cubicModelRenderer.setCubicModel(null);
            return;
        }
        this.cubicModelRenderer.setCubicModel(this.cubicModelAsset.pub);
    };
    CubicModelRendererUpdater.prototype._onCubicModelAssetEdited = function (id, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var commandCallback = this[("_onEditCommand_" + command)];
        if (commandCallback != null)
            commandCallback.apply(this, args);
        if (this.editAssetCallbacks != null) {
            var editCallback = this.editAssetCallbacks.cubicModel[command];
            if (editCallback != null)
                editCallback.apply(null, args);
        }
    };
    CubicModelRendererUpdater.prototype._onEditCommand_setProperty = function (path, value) {
        switch (path) {
            case "pixelsPerUnit":
                var scale = 1 / value;
                this.cubicModelRenderer.threeRoot.scale.set(scale, scale, scale);
                this.cubicModelRenderer.threeRoot.updateMatrixWorld(false);
                break;
        }
    };
    CubicModelRendererUpdater.prototype._onEditCommand_addNode = function (node, parentId, index) {
        this._createRendererNode(node);
    };
    CubicModelRendererUpdater.prototype._createRendererNode = function (node) {
        var parentNode = this.cubicModelAsset.nodes.parentNodesById[node.id];
        var parentRendererNode = (parentNode != null) ? this.cubicModelRenderer.byNodeId[parentNode.id] : null;
        var offset = (parentNode != null) ? parentNode.shape.offset : { x: 0, y: 0, z: 0 };
        this.cubicModelRenderer._makeNode(node, parentRendererNode, offset);
    };
    CubicModelRendererUpdater.prototype._recurseClearNode = function (nodeId) {
        var rendererNode = this.cubicModelRenderer.byNodeId[nodeId];
        for (var _i = 0, _a = rendererNode.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            this._recurseClearNode(childNode.nodeId);
        }
        var parentPivot = rendererNode.pivot.parent;
        var parentNodeId = parentPivot.userData.cubicNodeId;
        if (parentNodeId != null) {
            var parentRendererNode = this.cubicModelRenderer.byNodeId[parentNodeId];
            parentRendererNode.children.splice(parentRendererNode.children.indexOf(rendererNode), 1);
        }
        rendererNode.shape.parent.remove(rendererNode.shape);
        rendererNode.shape.geometry.dispose();
        rendererNode.shape.material.dispose();
        rendererNode.pivot.parent.remove(rendererNode.pivot);
        delete this.cubicModelRenderer.byNodeId[nodeId];
    };
    CubicModelRendererUpdater.prototype._onEditCommand_moveNodeTextureOffset = function (nodeIds, offset) {
        for (var _i = 0; _i < nodeIds.length; _i++) {
            var id = nodeIds[_i];
            var node = this.cubicModelAsset.nodes.byId[id];
            var geometry = this.cubicModelRenderer.byNodeId[id].shape.geometry;
            this.cubicModelRenderer.updateBoxNodeUv(geometry, node);
        }
    };
    CubicModelRendererUpdater.prototype._onChangeTextureSize = function () {
        for (var id in this.cubicModelAsset.nodes.byId) {
            var node = this.cubicModelAsset.nodes.byId[id];
            var shape = this.cubicModelRenderer.byNodeId[id].shape;
            this.cubicModelRenderer.updateBoxNodeUv(shape.geometry, node);
            var material = shape.material;
            material.map = this.cubicModelAsset.pub.textures["map"];
            material.needsUpdate = true;
        }
    };
    CubicModelRendererUpdater.prototype._onCubicModelAssetTrashed = function () {
        this.cubicModelAsset = null;
        this.cubicModelRenderer.setCubicModel(null);
        // FIXME: the updater shouldn't be dealing with SupClient.onAssetTrashed directly
        if (this.editAssetCallbacks != null)
            SupClient.onAssetTrashed();
    };
    CubicModelRendererUpdater.prototype.config_setProperty = function (path, value) {
        switch (path) {
            case "cubicModelAssetId":
                if (this.cubicModelAssetId != null)
                    this.client.unsubAsset(this.cubicModelAssetId, this.cubicModelSubscriber);
                this.cubicModelAssetId = value;
                this.cubicModelAsset = null;
                this.cubicModelRenderer.setCubicModel(null, null);
                if (this.cubicModelAssetId != null)
                    this.client.subAsset(this.cubicModelAssetId, "cubicModel", this.cubicModelSubscriber);
                break;
        }
    };
    return CubicModelRendererUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CubicModelRendererUpdater;

},{}]},{},[1]);
