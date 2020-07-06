"use strict";
var Platform_Edtior;
(function (Platform_Edtior) {
    var fudge = FudgeCore;
    class PickableNode extends fudge.Node {
        constructor(name) {
            super(name);
            this.addComponent(new Platform_Edtior.ComponentPicker());
        }
    }
    Platform_Edtior.PickableNode = PickableNode;
})(Platform_Edtior || (Platform_Edtior = {}));
///<reference path="./PickableNode.ts" />
var Platform_Edtior;
///<reference path="./PickableNode.ts" />
(function (Platform_Edtior) {
    var fudge = FudgeCore;
    class BaseNode extends Platform_Edtior.PickableNode {
        constructor() {
            super("BaseNode");
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(BaseNode.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);
        }
    }
    BaseNode.material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Edtior.BaseNode = BaseNode;
})(Platform_Edtior || (Platform_Edtior = {}));
var Platform_Edtior;
(function (Platform_Edtior) {
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
    Platform_Edtior.ComponentPicker = ComponentPicker;
})(Platform_Edtior || (Platform_Edtior = {}));
var Platform_Edtior;
(function (Platform_Edtior) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    fudge.RenderManager.initialize(true, true);
    window.addEventListener("load", editorLoad);
    let oldX;
    let oldY;
    function editorLoad(_event) {
        let cameraZ = 5;
        let graph = new fudge.Node("graph");
        let editorGraph = new fudge.Node("Editor Graph");
        const canvas = document.querySelector("#scene_canvas");
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        fudgeAid.addStandardLightComponents(editorGraph, new fudge.Color(0.5, 0.5, 0.5));
        Platform_Edtior.viewport = new fudge.Viewport();
        Platform_Edtior.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Edtior.viewport.addEventListener("\u0192pointermove" /* MOVE */, pointerMove);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        const editorCanvas = document.querySelector("#editor_canvas");
        Platform_Edtior.editorViewport = new fudge.Viewport();
        let editorCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);
        editorGraph.addChild(new Platform_Edtior.BaseNode());
        Platform_Edtior.editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        Platform_Edtior.editorViewport.draw();
        // tslint:disable-next-line: no-unused-expression
        new Platform_Edtior.ViewportControl(cameraZ);
        Platform_Edtior.viewport.draw();
    }
    function pointerMove(_event) {
        let scale = 0.005;
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let xChange = (_event.canvasX - oldX) * scale;
            let yChange = (_event.canvasY - oldY) * scale;
            Platform_Edtior.viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
            Platform_Edtior.viewport.draw();
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
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
})(Platform_Edtior || (Platform_Edtior = {}));
var Platform_Edtior;
(function (Platform_Edtior) {
    var fudge = FudgeCore;
    class ViewportControl {
        constructor(cameraZ) {
            this.pickSceneNode = (_event) => {
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Edtior.viewport);
                if (pickedNodes) {
                    this.selectedNode = pickedNodes[0];
                }
            };
            this.dragNode = (_event) => {
                let posMouse = new fudge.Vector2(_event.canvasX, _event.canvasY);
                if (this.selectedNode) {
                    let cmpMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                    cmpMaterial.clrPrimary = fudge.Color.CSS("yellow");
                    let rayEnd = this.convertClientToRay(posMouse);
                    console.log(rayEnd);
                    let cmpTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                    cmpTransform.local.translation = rayEnd;
                    Platform_Edtior.viewport.draw();
                }
            };
            this.releaseNode = (_event) => {
                if (this.selectedNode) {
                    let cmpMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                    cmpMaterial.clrPrimary = fudge.Color.CSS("green");
                    this.selectedNode = null;
                    Platform_Edtior.viewport.draw();
                }
            };
            this.pickEditorNode = (_event) => {
                let pickedNodes = this.pickNodes(_event.canvasX, _event.canvasY, Platform_Edtior.editorViewport);
                // maybe think of some logic to find the most senseful item (z-index?)
                for (let node of pickedNodes) {
                    this.convertToMainViewport(node);
                }
                Platform_Edtior.viewport.draw();
                Platform_Edtior.editorViewport.draw();
            };
            this.cameraZ = cameraZ;
            Platform_Edtior.viewport.addEventListener("\u0192pointermove" /* MOVE */, this.dragNode);
            Platform_Edtior.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            Platform_Edtior.viewport.addEventListener("\u0192pointerdown" /* DOWN */, this.pickSceneNode);
            Platform_Edtior.viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            Platform_Edtior.viewport.addEventListener("\u0192pointerup" /* UP */, this.releaseNode);
            Platform_Edtior.viewport.activatePointerEvent("\u0192pointerup" /* UP */, true);
            Platform_Edtior.editorViewport.addEventListener("\u0192pointerdown" /* DOWN */, this.pickEditorNode);
            Platform_Edtior.editorViewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
        }
        convertToMainViewport(selectedNode) {
            Platform_Edtior.editorViewport.getGraph().removeChild(selectedNode);
            selectedNode.mtxLocal.translation = new fudge.Vector3(Platform_Edtior.viewport.camera.pivot.translation.x, Platform_Edtior.viewport.camera.pivot.translation.y, 0);
            Platform_Edtior.viewport.getGraph().addChild(selectedNode);
        }
        convertClientToRay(_mousepos) {
            let posProjection = Platform_Edtior.viewport.pointClientToProjection(_mousepos);
            let ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
            let camera = Platform_Edtior.viewport.camera;
            // scale by z direction
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
                let cmpPicker = node.getComponent(Platform_Edtior.ComponentPicker);
                let pickData = cmpPicker.pick(posMouse, usedViewport);
                if (pickData) {
                    picked.push(node);
                    console.log(pickData);
                }
            }
            return picked;
        }
    }
    Platform_Edtior.ViewportControl = ViewportControl;
})(Platform_Edtior || (Platform_Edtior = {}));
//# sourceMappingURL=crun.js.map