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
        save(finalJson, "text.json");
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
        let editorGraph = new fudge.Node("Editor Graph");
        fudgeAid.addStandardLightComponents(editorGraph, new fudge.Color(0.5, 0.5, 0.5));
        Platform_Editor.editorViewport = new fudge.Viewport();
        let editorCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);
        Platform_Editor.editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        let baseNode = new Platform_Editor.Floor();
        baseNode.initialize();
        let enemy = new Platform_Editor.Enemy();
        enemy.initialize();
        editorGraph.addChild(baseNode);
        editorGraph.addChild(enemy);
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
                    let cmpMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                    cmpMaterial.clrPrimary = fudge.Color.CSS("red");
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
                    cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
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
                    switch (node.constructor) {
                        case Platform_Editor.Enemy:
                            pickableNode = new Platform_Editor.Enemy();
                            break;
                        case Platform_Editor.Floor:
                            pickableNode = new Platform_Editor.Floor();
                            break;
                    }
                    pickableNode.initialize();
                    Platform_Editor.editorViewport.getGraph().addChild(pickableNode);
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
                let translation = node.mtxLocal.translation;
                let intersection = ray.intersectPlane(translation, new fudge.Vector3(0, 0, 1));
                if (node.getRectWorld().isInside(intersection.toVector2())) {
                    picked.push(node);
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
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class PickableNode extends fudge.Node {
        constructor(name) {
            super(name);
        }
        getRectWorld() {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright = new ƒ.Vector3(0.5, -0.5, 0);
            //let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            //let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Floor.pivot);
            topleft.transform(this.mtxWorld, true);
            bottomright.transform(this.mtxWorld, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
    }
    Platform_Editor.PickableNode = PickableNode;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Enemy extends Platform_Editor.PickableNode {
        constructor() {
            super("Enemy");
        }
        initialize() {
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(Enemy.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("Red");
            this.addComponent(cmpMaterial);
        }
    }
    Enemy.material = new fudge.Material("EnemyMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.Enemy = Enemy;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Floor extends Platform_Editor.PickableNode {
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
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);
        }
    }
    Floor.material = new fudge.Material("FloorMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Floor.pivot = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));
    Platform_Editor.Floor = Floor;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    class Serialization {
    }
    Platform_Editor.Serialization = Serialization;
})(Platform_Editor || (Platform_Editor = {}));
//# sourceMappingURL=crun.js.map