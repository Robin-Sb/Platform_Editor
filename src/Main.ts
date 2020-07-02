namespace Platform_Edtior {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    fudge.RenderManager.initialize(true, true);
    export let viewport: fudge.Viewport;
    export let editorViewport: fudge.Viewport;
    window.addEventListener("load", editorLoad);

    let oldX: number;
    let oldY: number;

    function editorLoad(_event: Event): void {
        let graph: fudge.Node = new fudge.Node("graph");
        const canvas: HTMLCanvasElement = document.querySelector("#scene_canvas");
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        
        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(5);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));

        let testCube: fudge.Node = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshQuad); 
        graph.addChild(testCube);

        viewport = new fudge.Viewport();

        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.addEventListener(fudge.EVENT_POINTER.MOVE, pointerMove);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.MOVE, true);

        const editorCanvas: HTMLCanvasElement = document.querySelector("#editor_canvas");

        editorViewport = new fudge.Viewport();
        let testNode: fudge.Node = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshCube);
        let testCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        testCamera.pivot.translateZ(5);
        testCamera.pivot.lookAt(fudge.Vector3.ZERO());
        testCamera.backgroundColor = fudge.Color.CSS("White");
 
        editorViewport.initialize("Test", testNode, testCamera, editorCanvas);
        editorViewport.draw();

        viewport.draw();
    }

    function pointerMove(_event: fudge.EventPointer): void {
        let scale: number = 0.005;
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let xChange: number = (_event.canvasX - oldX) * scale;
            let yChange: number = (_event.canvasY - oldY) * scale;
    
            viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
        viewport.draw();
    }

    function convertToMainViewport(selectedNode: fudge.Node): void {
        viewport.getGraph().removeChild(selectedNode);
        editorViewport.getGraph().addChild(selectedNode);
    }
}