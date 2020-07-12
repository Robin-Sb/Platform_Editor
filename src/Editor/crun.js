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
        Platform_Editor.viewport = new fudge.Viewport();
        Platform_Editor.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Editor.viewport.addEventListener("\u0192pointermove" /* MOVE */, pointerMove);
        Platform_Editor.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        const editorCanvas = document.querySelector("#editor_canvas");
        let editorGraph = new fudge.Node("Editor Graph");
        fudgeAid.addStandardLightComponents(editorGraph, new fudge.Color(0.5, 0.5, 0.5));
        Platform_Editor.editorViewport = new fudge.Viewport();
        let editorCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);
        Platform_Editor.editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        editorGraph.addChild(new Platform_Editor.BaseNode());
        editorGraph.addChild(new Platform_Editor.Enemy());
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
        let serialization = fudge.Serializer.serialize(graph);
        let json = fudge.Serializer.stringify(serialization);
        console.log(json);
        save(json, "text.json");
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
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Editor.viewport);
                if (pickedNodes) {
                    this.selectedNode = pickedNodes[0];
                }
            };
            this.dragNode = (_event) => {
                let posMouse = new fudge.Vector2(_event.canvasX, _event.canvasY);
                if (this.selectedNode) {
                    let cmpMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                    cmpMaterial.clrPrimary = fudge.Color.CSS("red");
                    let rayEnd = this.convertClientToRay(posMouse);
                    let cmpTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                    cmpTransform.local.translation = rayEnd;
                    Platform_Editor.viewport.draw();
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
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Editor.editorViewport);
                // maybe think of some logic to find the most senseful item (z-index?)
                for (let node of pickedNodes) {
                    this.convertToMainViewport(node);
                    let pickableNode;
                    switch (node.constructor) {
                        case Platform_Editor.Enemy:
                            pickableNode = new Platform_Editor.Enemy();
                            break;
                        case Platform_Editor.BaseNode:
                            pickableNode = new Platform_Editor.BaseNode();
                            break;
                    }
                    Platform_Editor.editorViewport.getGraph().addChild(pickableNode);
                    // node.constructor.apply(node.create());
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
        // might do the same thing as getRayFromClient
        convertClientToRay(_mousepos) {
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
        pickNodes(x, y, usedViewport) {
            let posMouse = new fudge.Vector2(x, y);
            let nodes = usedViewport.getGraph().getChildren();
            let picked = [];
            for (let node of nodes) {
                let cmpPicker = node.getComponent(Platform_Editor.ComponentPicker);
                let pickData = cmpPicker.pick(posMouse, usedViewport);
                if (pickData) {
                    picked.push(node);
                    console.log(pickData);
                }
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
            this.addComponent(new Platform_Editor.ComponentPicker());
        }
    }
    Platform_Editor.PickableNode = PickableNode;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class BaseNode extends Platform_Editor.PickableNode {
        constructor() {
            super("BaseNode");
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 1.4, 0))));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(BaseNode.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);
        }
    }
    BaseNode.material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.BaseNode = BaseNode;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class ComponentPicker extends fudge.Component {
        constructor(_radius = 0.5) {
            super();
            this.radius = 0.5;
            this.radius = _radius;
        }
        drawPickRadius(_viewport) {
            let pickData = this.getPickData(_viewport);
            let crc2 = _viewport.getContext();
            crc2.save();
            crc2.beginPath();
            crc2.arc(pickData.canvas.x, pickData.canvas.y, pickData.radius.magnitude, 0, 2 * Math.PI);
            crc2.strokeStyle = "#000000";
            crc2.fillStyle = "#ffffff80";
            crc2.stroke();
            crc2.fill();
        }
        pick(_client, viewport) {
            let pickData = this.getPickData(viewport);
            let distance = fudge.Vector2.DIFFERENCE(_client, pickData.canvas);
            if (distance.magnitudeSquared < pickData.radius.magnitudeSquared)
                return pickData;
            return null;
        }
        getPickData(currentViewport) {
            let node = this.getContainer();
            let projection = currentViewport.camera.project(node.mtxWorld.translation);
            let posClient = currentViewport.pointClipToClient(projection.toVector2());
            let projectionRadius = fudge.Vector3.X(this.radius * node.mtxWorld.scaling.magnitude); // / 1.414);
            projectionRadius.transform(currentViewport.camera.pivot, false);
            projectionRadius = currentViewport.camera.project(fudge.Vector3.SUM(node.mtxWorld.translation, projectionRadius));
            let posRadius = currentViewport.pointClipToClient(projectionRadius.toVector2());
            return { clip: projection, canvas: posClient, radius: fudge.Vector2.DIFFERENCE(posRadius, posClient) };
        }
    }
    Platform_Editor.ComponentPicker = ComponentPicker;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Enemy extends Platform_Editor.PickableNode {
        constructor() {
            super("Enemy");
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(Enemy.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("Red");
            this.addComponent(cmpMaterial);
        }
    }
    Enemy.material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.Enemy = Enemy;
})(Platform_Editor || (Platform_Editor = {}));
//# sourceMappingURL=crun.js.map