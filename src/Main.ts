namespace Platform_Editor {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    fudge.RenderManager.initialize(true, true);
    export let viewport: fudge.Viewport;
    export let editorViewport: fudge.Viewport;
    window.addEventListener("load", editorLoad);

    let oldX: number;
    let oldY: number;

    function editorLoad(_event: Event): void {
        let cameraZ: number = 10;
        let graph: fudge.Node = new fudge.Node("graph");
        let editorGraph: fudge.Node = new fudge.Node("Editor Graph");
        const canvas: HTMLCanvasElement = document.querySelector("#scene_canvas");
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        
        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        fudgeAid.addStandardLightComponents(editorGraph, new fudge.Color(0.5, 0.5, 0.5));

        viewport = new fudge.Viewport();

        viewport.initialize("Viewport", graph, cmpCamera, canvas);

        viewport.addEventListener(fudge.EVENT_POINTER.MOVE, pointerMove);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.MOVE, true);

        const editorCanvas: HTMLCanvasElement = document.querySelector("#editor_canvas");

        editorViewport = new fudge.Viewport();
        
        let editorCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);

        editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        new BaseNode();
        new Enemy();

        editorViewport.draw();

        // tslint:disable-next-line: no-unused-expression
        new ViewportControl(cameraZ);

        viewport.draw();
    }

    function pointerMove(_event: fudge.EventPointer): void {
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let scale: number = 0.005;
            let xChange: number = (_event.canvasX - oldX) * scale;
            let yChange: number = (_event.canvasY - oldY) * scale;
    
            viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
            viewport.draw();
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
}