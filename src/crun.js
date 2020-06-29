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
        const canvas = document.querySelector("canvas");
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(5);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = ƒ.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new ƒ.Color(0.5, 0.5, 0.5));
        let testCube = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshCube);
        graph.addChild(testCube);
        Platform_Edtior.viewport = new fudge.Viewport();
        Platform_Edtior.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Edtior.viewport.addEventListener("\u0192pointermove" /* MOVE */, pointerMove);
        Platform_Edtior.viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        Platform_Edtior.viewport.draw();
    }
    function pointerMove(_event) {
        let scalar = 0.005;
        if (!oldX || !oldY) {
            oldX = _event.canvasX;
            oldY = _event.canvasY;
        }
        else if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let xChange = (_event.canvasX - oldX) * scalar;
            let yChange = (_event.canvasY - oldY) * scalar;
            Platform_Edtior.viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
        Platform_Edtior.viewport.draw();
    }
})(Platform_Edtior || (Platform_Edtior = {}));
//# sourceMappingURL=crun.js.map