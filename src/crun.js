"use strict";
var Platform_Edtior;
(function (Platform_Edtior) {
    var fudge = FudgeCore;
    class BaseNode extends fudge.Node {
        constructor() {
            super("Test");
            this.addComponent(new ƒ.ComponentTransform(new fudge.Matrix4x4()));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad);
            this.addComponent(cmpMesh);
            let cmpMaterial = new ƒ.ComponentMaterial(new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(new fudge.Color(0, 1, 0))));
            this.addComponent(cmpMaterial);
            this.addComponent(new Platform_Edtior.ComponentPicker());
        }
    }
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
    let selectedNode;
    let cameraZ = 5;
    function editorLoad(_event) {
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
        //let testCube: fudge.Node = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshQuad); 
        //graph.addChild(testCube);
        Platform_Edtior.viewport = new fudge.Viewport();
        Platform_Edtior.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Edtior.viewport.addEventListener("\u0192pointermove" /* MOVE */, pointerMove);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        Platform_Edtior.viewport.addEventListener("\u0192pointermove" /* MOVE */, dragNode);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        Platform_Edtior.viewport.addEventListener("\u0192pointerdown" /* DOWN */, pickSceneNode);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
        Platform_Edtior.viewport.addEventListener("\u0192pointerup" /* UP */, releaseNode);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointerup" /* UP */, true);
        const editorCanvas = document.querySelector("#editor_canvas");
        Platform_Edtior.editorViewport = new fudge.Viewport();
        let editorCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);
        editorGraph.addChild(new Platform_Edtior.BaseNode());
        Platform_Edtior.editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        Platform_Edtior.editorViewport.draw();
        Platform_Edtior.editorViewport.addEventListener("\u0192pointerdown" /* DOWN */, pickEditorNode);
        Platform_Edtior.editorViewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
        // add pointer move and pointer down to standard viewport
        Platform_Edtior.viewport.draw();
        // fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, update);
        // fudge.Loop.start(fudge.LOOP_MODE.TIME_REAL, 2);
    }
    // function update(): void {
    //     viewport.draw();
    //     editorViewport.draw();
    // }
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
    function convertToMainViewport(selectedNode) {
        Platform_Edtior.editorViewport.getGraph().removeChild(selectedNode);
        selectedNode.mtxLocal.translation = new fudge.Vector3(Platform_Edtior.viewport.camera.pivot.translation.x, Platform_Edtior.viewport.camera.pivot.translation.y, 0);
        Platform_Edtior.viewport.getGraph().addChild(selectedNode);
    }
    function pickSceneNode(_event) {
        let pickedNodes = pickNodes(_event.canvasX, _event.canvasY, Platform_Edtior.viewport);
        if (pickedNodes) {
            selectedNode = pickedNodes[0];
        }
    }
    function dragNode(_event) {
        let posMouse = new fudge.Vector2(_event.canvasX, _event.canvasY);
        if (selectedNode) {
            let cmpMaterial = selectedNode.getComponent(fudge.ComponentMaterial);
            cmpMaterial.clrPrimary = fudge.Color.CSS("yellow");
            let rayEnd = convertClientToRay(posMouse);
            console.log(rayEnd);
            let cmpTransform = selectedNode.getComponent(fudge.ComponentTransform);
            cmpTransform.local.translation = rayEnd;
            Platform_Edtior.viewport.draw();
        }
    }
    function releaseNode(_event) {
        if (selectedNode) {
            let cmpMaterial = selectedNode.getComponent(fudge.ComponentMaterial);
            cmpMaterial.clrPrimary = fudge.Color.CSS("green");
            selectedNode = null;
            Platform_Edtior.viewport.draw();
        }
    }
    function convertClientToRay(_mousepos) {
        let posProjection = Platform_Edtior.viewport.pointClientToProjection(_mousepos);
        let ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
        let camera = Platform_Edtior.viewport.camera;
        // scale by z direction
        ray.direction.scale(cameraZ);
        ray.origin.transform(camera.pivot);
        ray.direction.transform(camera.pivot, false);
        let rayEnd = fudge.Vector3.SUM(ray.origin, ray.direction);
        return rayEnd;
    }
    function pickEditorNode(_event) {
        let pickedNodes = pickNodes(_event.canvasX, _event.canvasY, Platform_Edtior.editorViewport);
        // maybe think of some logic to find the most senseful item (z-index?)
        for (let node of pickedNodes) {
            convertToMainViewport(node);
        }
        Platform_Edtior.viewport.draw();
        Platform_Edtior.editorViewport.draw();
    }
    function pickNodes(x, y, usedViewport) {
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
//# sourceMappingURL=crun.js.map