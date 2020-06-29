namespace Platform_Edtior {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    fudge.RenderManager.initialize(true, true);
    export let viewport: fudge.Viewport;
    window.addEventListener("load", editorLoad);

    let oldX: number;
    let oldY: number;

    function editorLoad(_event: Event): void {
        let graph: fudge.Node = new fudge.Node("graph");
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        
        
        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(5);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = ƒ.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new ƒ.Color(0.5, 0.5, 0.5));

        let testCube: fudge.Node = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshCube); 
        graph.addChild(testCube);

        viewport = new fudge.Viewport();

        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, pointerMove);
        viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);

        viewport.draw();
    }

    function pointerMove(_event: fudge.EventPointer): void {
        let scalar: number = 0.005;
        if (!oldX || !oldY) {
            oldX = _event.canvasX;
            oldY = _event.canvasY;
        } else if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let xChange: number = (_event.canvasX - oldX) * scalar;
            let yChange: number = (_event.canvasY - oldY) * scalar;
    
            viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
        viewport.draw();
    }
}

