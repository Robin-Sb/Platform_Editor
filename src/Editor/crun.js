"use strict";
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    window.addEventListener("load", editorLoad);
    let oldX;
    let oldY;
    let graph = new fudge.Node("graph");
    function editorLoad(_event) {
        let cameraZ = 10;
        const canvas = document.querySelector("#scene_canvas");
        const button = document.querySelector("#save_game");
        button.addEventListener("click", serializeGraph);
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        let startTile = new Platform_Editor.Floor(false);
        startTile.initialize(new fudge.Vector3(0, 0, 0), "#pavement_text");
        graph.addChild(startTile);
        Platform_Editor.viewport = new fudge.Viewport();
        Platform_Editor.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Editor.viewport.addEventListener("\u0192pointermove" /* MOVE */, pointerMove);
        Platform_Editor.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        initializeEditorViewport();
        Platform_Editor.editorViewport.draw();
        // tslint:disable-next-line: no-unused-expression
        new Platform_Editor.ViewportControl();
        Platform_Editor.viewport.draw();
        fudge.Serializer.registerNamespace(Platform_Editor);
    }
    function initializeEditorViewport() {
        const editorCanvas = document.querySelector("#editor_canvas");
        editorCanvas.height = Platform_Editor.viewport.getCanvasRectangle().height;
        let editorGraph = new fudge.Node("Editor Graph");
        fudgeAid.addStandardLightComponents(editorGraph, new fudge.Color(0.5, 0.5, 0.5));
        Platform_Editor.editorViewport = new fudge.Viewport();
        let editorCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.2);
        Platform_Editor.editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        let baseNode = new Platform_Editor.Floor();
        baseNode.initialize();
        let enemy = new Platform_Editor.Enemy();
        enemy.initialize();
        let endPole = new Platform_Editor.EndPole();
        endPole.initialize();
        editorGraph.addChild(baseNode);
        editorGraph.addChild(enemy);
        editorGraph.addChild(endPole);
    }
    function pointerMove(_event) {
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let scale = 0.005;
            let xChange = (_event.canvasX - oldX) * scale;
            let yChange = (_event.canvasY - oldY) * scale;
            Platform_Editor.viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
            Platform_Editor.viewport.draw();
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
    }
    function serializeGraph() {
        if (Platform_Editor.viewport.getGraph().getChildrenByName("EndPole").length != 1) {
            alert("The endpole must be set!");
            return;
        }
        let serializedGraph = fudge.Serializer.serialize(Platform_Editor.viewport.getGraph());
        let json = fudge.Serializer.stringify(serializedGraph);
        save(json, "game.json");
    }
    function save(_content, _filename) {
        let blob = new Blob([_content], { type: "text/plain" });
        let url = window.URL.createObjectURL(blob);
        //*/ using anchor element for download
        let downloader;
        downloader = document.createElement("a");
        downloader.setAttribute("href", url);
        downloader.setAttribute("download", _filename);
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
        window.URL.revokeObjectURL(url);
    }
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class ViewportControl {
        constructor() {
            this.states = [];
            this.control = (event) => {
                if (event.ctrlKey && event.key === "z") {
                    if (this.states.length == 0)
                        return;
                    let state = this.states.pop();
                    Platform_Editor.viewport.setGraph(fudge.Serializer.deserialize(state.serialization));
                    if (state.endPoleSet) {
                        let newPole = new Platform_Editor.EndPole();
                        newPole.initialize();
                        Platform_Editor.editorViewport.getGraph().addChild(newPole);
                        Platform_Editor.editorViewport.draw();
                    }
                    Platform_Editor.viewport.draw();
                }
            };
            this.pickSceneNode = (_event) => {
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Editor.viewport, Platform_Editor.viewport.getGraph().getChildren());
                if (pickedNodes) {
                    this.setState(false);
                    this.selectedNode = pickedNodes[0];
                }
            };
            this.dragNode = (_event) => {
                let posMouse = new fudge.Vector2(_event.canvasX, _event.canvasY);
                if (this.selectedNode) {
                    let ray = Platform_Editor.viewport.getRayFromClient(posMouse);
                    let intersection = ray.intersectPlane(this.selectedNode.mtxLocal.translation, new fudge.Vector3(0, 0, 1));
                    let cmpTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                    cmpTransform.local.translation = new fudge.Vector3(intersection.x, intersection.y, 0.01);
                    Platform_Editor.viewport.draw();
                }
            };
            this.releaseNode = (_event) => {
                if (this.selectedNode) {
                    if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.CTRL_LEFT])) {
                        let translation = this.selectedNode.mtxLocal.translation;
                        translation.x = Math.round(translation.x * 10) / 10;
                        translation.y = Math.round(translation.y * 10) / 10;
                        this.selectedNode.mtxLocal.translation = new fudge.Vector3(translation.x, translation.y, 0.01);
                    }
                    this.selectedNode = null;
                    Platform_Editor.viewport.draw();
                }
            };
            this.pickEditorNode = (_event) => {
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Editor.editorViewport, Platform_Editor.editorViewport.getGraph().getChildren());
                for (let node of pickedNodes) {
                    this.convertToMainViewport(node);
                    let pickableNode;
                    let matched = true;
                    switch (node.constructor) {
                        case Platform_Editor.Enemy:
                            pickableNode = new Platform_Editor.Enemy();
                            break;
                        case Platform_Editor.Floor:
                            pickableNode = new Platform_Editor.Floor();
                            break;
                        default: matched = false;
                    }
                    if (matched) {
                        pickableNode.initialize();
                        Platform_Editor.editorViewport.getGraph().addChild(pickableNode);
                    }
                }
                Platform_Editor.viewport.draw();
                Platform_Editor.editorViewport.draw();
            };
            Platform_Editor.viewport.addEventListener("\u0192pointermove" /* MOVE */, this.dragNode);
            Platform_Editor.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            Platform_Editor.viewport.addEventListener("\u0192pointerdown" /* DOWN */, this.pickSceneNode);
            Platform_Editor.viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            Platform_Editor.viewport.addEventListener("\u0192pointerup" /* UP */, this.releaseNode);
            Platform_Editor.viewport.activatePointerEvent("\u0192pointerup" /* UP */, true);
            Platform_Editor.viewport.addEventListener("\u0192keydown" /* DOWN */, this.handleKeyboard.bind(this));
            Platform_Editor.viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
            Platform_Editor.viewport.setFocus(true);
            Platform_Editor.editorViewport.addEventListener("\u0192pointerdown" /* DOWN */, this.pickEditorNode);
            Platform_Editor.editorViewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            document.addEventListener("keydown", this.control.bind(Platform_Editor.viewport.getGraph()));
        }
        convertToMainViewport(selectedNode) {
            Platform_Editor.editorViewport.getGraph().removeChild(selectedNode);
            selectedNode.mtxLocal.translation = new fudge.Vector3(Platform_Editor.viewport.camera.pivot.translation.x, Platform_Editor.viewport.camera.pivot.translation.y, 0.01);
            let isEndPool = selectedNode instanceof Platform_Editor.EndPole;
            isEndPool ? this.setState(true) : this.setState(false);
            Platform_Editor.viewport.getGraph().addChild(selectedNode);
        }
        handleKeyboard(_event) {
            if (_event.code == fudge.KEYBOARD_CODE.DELETE) {
                if (this.selectedNode) {
                    Platform_Editor.viewport.getGraph().removeChild(this.selectedNode);
                    if (this.selectedNode.constructor == Platform_Editor.EndPole) {
                        let newPole = new Platform_Editor.EndPole();
                        newPole.initialize();
                        Platform_Editor.editorViewport.getGraph().addChild(newPole);
                        Platform_Editor.editorViewport.draw();
                    }
                    this.selectedNode = null;
                    Platform_Editor.viewport.draw();
                }
            }
        }
        setState(endPoleSet) {
            this.states.push({
                serialization: fudge.Serializer.serialize(Platform_Editor.viewport.getGraph()),
                endPoleSet: endPoleSet
            });
            if (this.states.length > 5) {
                this.states.splice(0, 1);
            }
        }
        pickNodes(x, y, usedViewport, nodes) {
            let posMouse = new fudge.Vector2(x, y);
            let ray = usedViewport.getRayFromClient(posMouse);
            let picked = [];
            for (let node of nodes) {
                if (node instanceof Platform_Editor.Floor) {
                    if (!node.isPickable) {
                        continue;
                    }
                }
                let intersection = ray.intersectPlane(new fudge.Vector3(1, 1, 0), new fudge.Vector3(0, 0, 1));
                for (let rect of node.getRectWorld()) {
                    if (rect.isInside(intersection.toVector2())) {
                        picked.push(node);
                    }
                }
            }
            return picked;
        }
    }
    Platform_Editor.ViewportControl = ViewportControl;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Game;
(function (Platform_Game) {
    let ACTION;
    (function (ACTION) {
        ACTION["IDLE"] = "Idle";
        ACTION["WALK"] = "Walk";
        ACTION["JUMP"] = "Jump";
    })(ACTION = Platform_Game.ACTION || (Platform_Game.ACTION = {}));
})(Platform_Game || (Platform_Game = {}));
var Platform_Game;
(function (Platform_Game) {
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 0] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 1] = "RIGHT";
    })(DIRECTION = Platform_Game.DIRECTION || (Platform_Game.DIRECTION = {}));
})(Platform_Game || (Platform_Game = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class EndPole extends fudge.Node {
        constructor() {
            super("EndPole");
        }
        initialize(translation = new fudge.Vector3(0.7, -1, 0)) {
            let base = new fudge.Node("Base");
            let sizeY = 2;
            let baseTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 0, 0)));
            base.addComponent(baseTransform);
            let baseMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            base.addComponent(baseMesh);
            base.mtxLocal.scale(new fudge.Vector3(0.4, sizeY - 0.1, 0));
            let baseTextured = Platform_Editor.Utils.generateTextureFromId("#polebase_text");
            let material = new fudge.Material("PoleMtr", fudge.ShaderTexture, baseTextured);
            let baseMaterial = new fudge.ComponentMaterial(material);
            base.addComponent(baseMaterial);
            let top = new fudge.Node("Top");
            let topTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, sizeY / 2, 0)));
            top.addComponent(topTransform);
            top.mtxLocal.scale(fudge.Vector3.ONE(0.8));
            let topMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            top.addComponent(topMesh);
            let topTextured = Platform_Editor.Utils.generateTextureFromId("#poletop_text");
            let topMaterial = new fudge.Material("PoleMtr", fudge.ShaderTexture, topTextured);
            let topcmpMaterial = new fudge.ComponentMaterial(topMaterial);
            top.addComponent(topcmpMaterial);
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
            this.addChild(base);
            this.addChild(top);
        }
        getRectWorld() {
            let rects = [];
            for (let node of this.getChildren()) {
                rects.push(Platform_Editor.Utils.getRectWorld(node));
            }
            return rects;
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
    }
    Platform_Editor.EndPole = EndPole;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    class Enemy extends fudgeAid.NodeSprite {
        constructor() {
            super("Enemy");
            this.currentDirection = Platform_Game.DIRECTION.RIGHT;
            this.adjacentFloors = [];
            this.update = () => {
                let direction = (this.currentDirection == Platform_Game.DIRECTION.RIGHT ? 1 : -1);
                this.cmpTransform.local.rotation = fudge.Vector3.Y(90 - 90 * direction);
                let timeFrame = fudge.Loop.timeFrameGame / 500;
                let distance = fudge.Vector3.SCALE(Enemy.speed, timeFrame);
                this.cmpTransform.local.translate(distance);
                let adjacentFloorMtx;
                if (this.currentDirection == Platform_Game.DIRECTION.LEFT) {
                    adjacentFloorMtx = this.adjacentFloors[0].mtxLocal;
                    if (this.mtxLocal.translation.x < adjacentFloorMtx.translation.x - adjacentFloorMtx.scaling.x / 2) {
                        this.mtxLocal.translation.x = adjacentFloorMtx.translation.x - adjacentFloorMtx.scaling.x / 2;
                        this.currentDirection = Platform_Game.DIRECTION.RIGHT;
                    }
                }
                else {
                    adjacentFloorMtx = this.adjacentFloors[this.adjacentFloors.length - 1].mtxLocal;
                    if (this.mtxLocal.translation.x > adjacentFloorMtx.translation.x + adjacentFloorMtx.scaling.x / 2) {
                        this.mtxLocal.translation.x = adjacentFloorMtx.translation.x + adjacentFloorMtx.scaling.x / 2;
                        this.currentDirection = Platform_Game.DIRECTION.LEFT;
                    }
                }
            };
        }
        getRectWorld() {
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        initialize(translation = new fudge.Vector3(-0.5, -1, 0)) {
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
            Enemy.animations = {};
            let img = document.querySelector("#enemy_idle");
            let spritesheet = fudgeAid.createSpriteSheet("Enemy", img);
            let sprite = new fudgeAid.SpriteSheetAnimation("Idle", spritesheet);
            sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 4, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.IDLE] = sprite;
            let walkImg = document.querySelector("#enemy_walk");
            let walksheet = fudgeAid.createSpriteSheet("Enemy", walkImg);
            let walkSprite = new fudgeAid.SpriteSheetAnimation("Walk", walksheet);
            walkSprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 6, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.WALK] = walkSprite;
            this.setAnimation(Enemy.animations[Platform_Game.ACTION.IDLE]);
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
        preProcessEnemy(floors) {
            let closestDistance = Number.MAX_VALUE;
            let nearestFloor;
            for (let i = 0; i < floors.length; i++) {
                let distance = fudge.Vector3.DIFFERENCE(this.mtxLocal.translation, floors[i].mtxLocal.translation);
                if (distance.magnitudeSquared < closestDistance) {
                    nearestFloor = i;
                    closestDistance = distance.magnitudeSquared;
                }
            }
            this.mtxLocal.translation = new fudge.Vector3(this.mtxLocal.translation.x, floors[nearestFloor].mtxLocal.translation.y + (floors[nearestFloor].mtxLocal.scaling.y / 2), 0);
            fudge.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            this.findAdjacentFloors(floors[nearestFloor], floors, nearestFloor);
            this.adjacentFloors.sort(this.compare);
            this.setAnimation(Enemy.animations[Platform_Game.ACTION.WALK]);
        }
        removeListener() {
            fudge.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        findAdjacentFloors(startFloor, floors, thisIndex) {
            floors.splice(thisIndex, 1);
            this.adjacentFloors.push(startFloor);
            for (let i = 0; i < floors.length; i++) {
                let startFloorMtx = startFloor.mtxLocal;
                let currentFloorMtx = floors[i].mtxLocal;
                if (Math.abs((startFloorMtx.translation.y + startFloorMtx.scaling.y) - (currentFloorMtx.translation.y + currentFloorMtx.scaling.y)) < 0.05) {
                    if (startFloorMtx.translation.x > currentFloorMtx.translation.x) {
                        if (currentFloorMtx.translation.x + currentFloorMtx.scaling.x / 2 + startFloorMtx.scaling.x / 2 - startFloorMtx.translation.x >= 0) {
                            this.findAdjacentFloors(floors[i], floors, i);
                        }
                    }
                    else {
                        if (currentFloorMtx.translation.x - currentFloorMtx.scaling.x / 2 - startFloorMtx.scaling.x / 2 - startFloorMtx.translation.x <= 0) {
                            this.findAdjacentFloors(floors[i], floors, i);
                        }
                    }
                }
            }
        }
        compare(floorA, floorB) {
            return floorA.mtxLocal.translation.x - floorB.mtxLocal.translation.x;
        }
    }
    Enemy.speed = new fudge.Vector3(1, 0, 0);
    Platform_Editor.Enemy = Enemy;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Floor extends fudge.Node {
        constructor(isPickable = true) {
            super("Floor");
            this._isPickable = true;
            if (!isPickable) {
                this._isPickable = false;
            }
        }
        get isPickable() {
            return this._isPickable;
        }
        initialize(translation = new fudge.Vector3(0, 1.5, 0), textureId = "#grass_text") {
            this.textureId = textureId;
            let cmpTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation));
            this.addComponent(cmpTransform);
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let coatTextured = Platform_Editor.Utils.generateTextureFromId(textureId);
            let material = new fudge.Material("FloorMtr", fudge.ShaderTexture, coatTextured);
            let cmpMaterial = new fudge.ComponentMaterial(material);
            this.mtxLocal.scaleX(3);
            this.mtxLocal.scaleY(0.5);
            this.addComponent(cmpMaterial);
        }
        getRectWorld() {
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation,
                textureId: this.textureId,
                isPickable: this.isPickable
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0), _serialization.textureId);
            this.name = _serialization.name;
            this._isPickable = _serialization.isPickable;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
    }
    Platform_Editor.Floor = Floor;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Utils {
        static getRectWorld(node) {
            let rect = fudge.Rectangle.GET(0, 0, 100, 100);
            let topleft = new fudge.Vector3(-0.5, 0.5, 0);
            let bottomright = new fudge.Vector3(0.5, -0.5, 0);
            let pivot = node.getComponent(fudge.ComponentMesh).pivot;
            let mtxResult = fudge.Matrix4x4.MULTIPLICATION(node.mtxWorld, pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new fudge.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
        static generateTextureFromId(textureId) {
            let coatTextured = new fudge.CoatTextured();
            let img = document.querySelector(textureId);
            let textureImage = new fudge.TextureImage();
            textureImage.image = img;
            coatTextured.texture = textureImage;
            return coatTextured;
        }
    }
    Platform_Editor.Utils = Utils;
})(Platform_Editor || (Platform_Editor = {}));
//# sourceMappingURL=crun.js.map