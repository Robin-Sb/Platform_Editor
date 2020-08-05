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
        new Platform_Editor.ViewportControl(cameraZ);
        Platform_Editor.viewport.draw();
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
        if (graph.getChildrenByName("EndPole").length != 1) {
            alert("The endpole must be set!");
            return;
        }
        fudge.Serializer.registerNamespace(Platform_Editor);
        let serializedGraph = fudge.Serializer.serialize(graph);
        let json = fudge.Serializer.stringify(serializedGraph);
        let serializedResources = fudge.ResourceManager.serialize();
        let resourceString = fudge.Serializer.stringify(serializedResources); // JSON.stringify(resources);
        let serialization = new Platform_Editor.Serialization();
        serialization.graph = serializedGraph;
        serialization.resources = serializedResources;
        let finalJson = JSON.stringify(serialization, null, 2);
        console.log(resourceString);
        console.log(json);
        save(finalJson, "game.json");
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
    // function event(): void {
    //     let node: fudge.Node = new fudge.Node("node");
    //     let child: fudge.Node = new fudge.Node("child");
    //     child.addEventListener("callChild", callChild, true);
    //     node.broadcastEvent(new CustomEvent("call Child"));
    //     // up event with dispatch event
    // }
    // function callChild(_event: Event): void {
    //     console.log(_event.target);
    // }
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class ViewportControl {
        // look at mutators again and serialization
        //private states: Array<{funct: (node: fudge.Node) => void, object: fudge.Node}> = new Array<{funct: (node: fudge.Node) => void, object: fudge.Node}>();
        //private states: Array<fudge.Node> = new Array<fudge.Node>();
        constructor(cameraZ) {
            this.pickSceneNode = (_event) => {
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Editor.viewport, Platform_Editor.viewport.getGraph().getChildren());
                if (pickedNodes) {
                    this.selectedNode = pickedNodes[0];
                }
            };
            this.dragNode = (_event) => {
                let posMouse = new fudge.Vector2(_event.canvasX, _event.canvasY);
                if (this.selectedNode) {
                    // let cmpMaterial: fudge.ComponentMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                    // cmpMaterial.clrPrimary = fudge.Color.CSS("red");
                    let rayEnd = this.getRayEnd(posMouse);
                    let cmpTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                    cmpTransform.local.translation = new fudge.Vector3(rayEnd.x, rayEnd.y, 0.01);
                    Platform_Editor.viewport.draw();
                }
            };
            this.releaseNode = (_event) => {
                if (this.selectedNode) {
                    let cmpMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                    //cmpMaterial.clrPrimary = this.selectedNode.color;
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
                // maybe think of some logic to find the most senseful item (z-index?)
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
            this.cameraZ = cameraZ;
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
            //document.addEventListener("keydown", this.control.bind(viewport.getGraph()));
        }
        // public appendState(state: fudge.Node[]): void {
        //     this.states.push(state);
        // }
        // private control = (event: KeyboardEvent): void => {
        //     if (event.ctrlKey && event.key === "z") {
        //         this.this.states[this.states.length - 1].funct
        //         viewport.draw();
        //     }
        // }
        convertToMainViewport(selectedNode) {
            Platform_Editor.editorViewport.getGraph().removeChild(selectedNode);
            selectedNode.mtxLocal.translation = new fudge.Vector3(Platform_Editor.viewport.camera.pivot.translation.x, Platform_Editor.viewport.camera.pivot.translation.y, 0.01);
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
        getRayEnd(_mousepos) {
            let posProjection = Platform_Editor.viewport.pointClientToProjection(_mousepos);
            let ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
            let camera = Platform_Editor.viewport.camera;
            // scale by z direction of camera
            ray.direction.scale(this.cameraZ);
            ray.origin.transform(camera.pivot);
            ray.direction.transform(camera.pivot, false);
            let rayEnd = fudge.Vector3.SUM(ray.origin, ray.direction);
            return rayEnd;
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
                //let translation: fudge.Vector3 = node.mtxLocal.translation;
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
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class EndPole extends fudge.Node {
        constructor() {
            super("EndPole");
        }
        initialize(translation = new fudge.Vector3(0.7, -1, 0)) {
            let base = new fudge.Node("Base");
            let standardY = -2;
            let sizeY = 2;
            let baseTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 0, 0)));
            base.addComponent(baseTransform);
            let baseMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            base.addComponent(baseMesh);
            base.mtxLocal.scale(new fudge.Vector3(0.5, sizeY, 0));
            let baseTextured = Platform_Editor.Utils.generateTextureFromId("#polebase_text");
            let material = new fudge.Material("PoleMtr", fudge.ShaderTexture, baseTextured);
            let baseMaterial = new fudge.ComponentMaterial(material);
            base.addComponent(baseMaterial);
            let top = new fudge.Node("Top");
            let topTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, sizeY / 2 + 0.3, 0)));
            top.addComponent(topTransform);
            let topMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            top.addComponent(topMesh);
            let topTextured = Platform_Editor.Utils.generateTextureFromId("#poletop_text");
            let topMaterial = new fudge.Material("PoleMtr", fudge.ShaderTexture, topTextured);
            let topcmpMaterial = new fudge.ComponentMaterial(topMaterial);
            top.addComponent(topcmpMaterial);
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(translation)));
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
    EndPole.material = new ƒ.Material("Tower", ƒ.ShaderFlat, new ƒ.CoatColored());
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
        }
        getRectWorld() {
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        initialize(translation = new fudge.Vector3(-0.5, -1, 0)) {
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
            let img = document.querySelector("#enemy_idle");
            let spritesheet = fudgeAid.createSpriteSheet("Enemy", img);
            Enemy.animations = {};
            let sprite = new fudgeAid.SpriteSheetAnimation("Idle", spritesheet);
            sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 4, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.IDLE] = sprite;
            this.setAnimation(Enemy.animations[Platform_Game.ACTION.IDLE]);
            this.color = this.getComponent(fudge.ComponentMaterial).clrPrimary;
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
            // this.color = fudge.Color.CSS("LimeGreen");
            // cmpMaterial.clrPrimary = this.color;
            this.addComponent(cmpMaterial);
        }
        getRectWorld() {
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation,
                textureId: this.textureId
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0), _serialization.textureId);
            this.name = _serialization.name;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
    }
    Platform_Editor.Floor = Floor;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    class Serialization {
    }
    Platform_Editor.Serialization = Serialization;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Utils {
        static getRectWorld(node) {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright = new ƒ.Vector3(0.5, -0.5, 0);
            let pivot = node.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult = ƒ.Matrix4x4.MULTIPLICATION(node.mtxWorld, pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
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