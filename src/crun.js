"use strict";
var Platform_Edtior;
(function (Platform_Edtior) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    fudge.RenderManager.initialize(true, true);
    window.addEventListener("load", editorLoad);
    let oldX;
    let oldY;
    function editorLoad(_event) {
        let graph = new fudge.Node("graph");
        const canvas = document.querySelector("#scene_canvas");
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(5);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        let testCube = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshQuad);
        graph.addChild(testCube);
        Platform_Edtior.viewport = new fudge.Viewport();
        Platform_Edtior.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Edtior.viewport.addEventListener("\u0192pointermove" /* MOVE */, pointerMove);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        const editorCanvas = document.querySelector("#editor_canvas");
        Platform_Edtior.editorViewport = new fudge.Viewport();
        let testNode = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshCube);
        let testCamera = new fudge.ComponentCamera();
        testCamera.pivot.translateZ(5);
        testCamera.pivot.lookAt(fudge.Vector3.ZERO());
        testCamera.backgroundColor = fudge.Color.CSS("White");
        Platform_Edtior.editorViewport.initialize("Test", testNode, testCamera, editorCanvas);
        Platform_Edtior.editorViewport.draw();
        Platform_Edtior.viewport.draw();
    }
    function pointerMove(_event) {
        let scale = 0.005;
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let xChange = (_event.canvasX - oldX) * scale;
            let yChange = (_event.canvasY - oldY) * scale;
            Platform_Edtior.viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
        Platform_Edtior.viewport.draw();
    }
    function convertToMainViewport(selectedNode) {
        Platform_Edtior.viewport.getGraph().removeChild(selectedNode);
        Platform_Edtior.editorViewport.getGraph().addChild(selectedNode);
    }
})(Platform_Edtior || (Platform_Edtior = {}));
//# sourceMappingURL=crun.js.map