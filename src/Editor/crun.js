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
        //const button: HTMLButtonElement =  document.querySelector("#save_game");
        //button.addEventListener("click", serializeGraph);
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        let startTile = new Platform_Editor.Floor(false);
        startTile.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
        let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
        startTile.addComponent(cmpMesh);
        let cmpMaterial = new fudge.ComponentMaterial(new fudge.Material("EnemyMtr", fudge.ShaderFlat, new fudge.CoatColored()));
        cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
        startTile.addComponent(cmpMaterial);
        startTile.mtxLocal.scaleX(3);
        startTile.mtxLocal.scaleY(0.5);
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
        if (!graph.getChildrenByName("EndPole")) {
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
                    cmpTransform.local.translation = rayEnd;
                    Platform_Editor.viewport.draw();
                    let cmpMesh = this.selectedNode.getComponent(fudge.ComponentMesh);
                    let ray = Platform_Editor.viewport.getRayFromClient(posMouse);
                    console.log("verts: " + cmpMesh.mesh.vertices);
                    console.log("model" + this.selectedNode.mtxLocal);
                    console.log("ray" + ray.intersectPlane(this.selectedNode.mtxLocal.translation, new fudge.Vector3(0, 0, 1)));
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
                        this.selectedNode.mtxLocal.translation = new fudge.Vector3(translation.x, translation.y, 0);
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
            selectedNode.mtxLocal.translation = new fudge.Vector3(Platform_Editor.viewport.camera.pivot.translation.x, Platform_Editor.viewport.camera.pivot.translation.y, 0);
            Platform_Editor.viewport.getGraph().addChild(selectedNode);
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
                // let translation: fudge.Vector3 = node.mtxLocal.translation;
                // let intersection: fudge.Vector3 = ray.intersectPlane(translation, new fudge.Vector3(0, 0, 1));
                // let verts: Float32Array = node.getComponent(fudge.ComponentMesh).mesh.vertices;
                // let maxX: number = translation.x + verts[6];
                // let minX: number = translation.x + verts[0];
                // let maxY: number = translation.y + verts[1];
                // let minY: number = translation.y + verts[4];
                // if (intersection.x > minX && intersection.x < maxX && intersection.y > minY && intersection.y < maxY) {
                //     picked.push(node);
                // }
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
        initialize() {
            let base = new fudge.Node("Base");
            let standardY = -2;
            let sizeY = 2;
            let baseTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 0, 0)));
            base.addComponent(baseTransform);
            let baseMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            base.addComponent(baseMesh);
            base.mtxLocal.scale(new fudge.Vector3(0.5, sizeY, 0));
            let baseMaterial = new fudge.ComponentMaterial(EndPole.material);
            this.color = fudge.Color.CSS("LimeGreen");
            baseMaterial.clrPrimary = this.color;
            base.addComponent(baseMaterial);
            let top = new fudge.Node("Top");
            let topTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, sizeY / 2 + 0.3, 0)));
            top.addComponent(topTransform);
            let topMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            top.addComponent(topMesh);
            let topMaterial = new fudge.ComponentMaterial(EndPole.material);
            this.color = fudge.Color.CSS("LimeGreen");
            topMaterial.clrPrimary = this.color;
            top.addComponent(topMaterial);
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(new fudge.Vector3(0, standardY, 0))));
            this.addChild(base);
            this.addChild(top);
        }
        getRectWorld() {
            // let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            // let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            // let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            // let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            // let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            // topleft.transform(mtxResult, true);
            // bottomright.transform(mtxResult, true);
            // let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            // rect.position = topleft.toVector2();
            // rect.size = size;
            let rects = [];
            for (let node of this.getChildren()) {
                rects.push(Platform_Editor.Utils.getRectWorld(node));
            }
            return rects;
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
            // let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            // let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            // let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            // let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            // let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            // topleft.transform(mtxResult, true);
            // bottomright.transform(mtxResult, true);
            // let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            // rect.position = topleft.toVector2();
            // rect.size = size;
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        initialize() {
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
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
            this.initialize();
            this.name = _serialization.name;
            this.mtxLocal.translation = new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0);
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
        initialize() {
            let cmpTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 1.4, 0)));
            this.addComponent(cmpTransform);
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(Floor.material);
            this.color = fudge.Color.CSS("LimeGreen");
            cmpMaterial.clrPrimary = this.color;
            this.addComponent(cmpMaterial);
        }
        getRectWorld() {
            // let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            // let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            // let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            // //let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            // //let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Floor.pivot);
            // topleft.transform(this.mtxWorld, true);
            // bottomright.transform(this.mtxWorld, true);
            // let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            // rect.position = topleft.toVector2();
            // rect.size = size;
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
    }
    Floor.material = new fudge.Material("FloorMtr", fudge.ShaderFlat, new fudge.CoatColored());
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
    }
    Platform_Editor.Utils = Utils;
})(Platform_Editor || (Platform_Editor = {}));
//# sourceMappingURL=crun.js.map