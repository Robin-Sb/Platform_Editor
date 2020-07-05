namespace Platform_Edtior {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    fudge.RenderManager.initialize(true, true);
    export let viewport: fudge.Viewport;
    export let editorViewport: fudge.Viewport;
    window.addEventListener("load", editorLoad);

    let oldX: number;
    let oldY: number;
    let selectedNode: BaseNode;
    let cameraZ: number = 5;

    function editorLoad(_event: Event): void {
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
        //let testCube: fudge.Node = new fudgeAid.Node("Test", new fudge.Matrix4x4(), new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(fudge.Color.CSS("green"))), new fudge.MeshQuad); 
        //graph.addChild(testCube);

        viewport = new fudge.Viewport();

        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.addEventListener(fudge.EVENT_POINTER.MOVE, pointerMove);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.MOVE, true);

        viewport.addEventListener(fudge.EVENT_POINTER.MOVE, dragNode);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.MOVE, true);

        viewport.addEventListener(fudge.EVENT_POINTER.DOWN, pickSceneNode);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.DOWN, true);

        viewport.addEventListener(fudge.EVENT_POINTER.UP, releaseNode);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.UP, true);

        const editorCanvas: HTMLCanvasElement = document.querySelector("#editor_canvas");

        editorViewport = new fudge.Viewport();
        
        let editorCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);
        editorGraph.addChild(new BaseNode());

        editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        editorViewport.draw();

        editorViewport.addEventListener(fudge.EVENT_POINTER.DOWN, pickEditorNode);
        editorViewport.activatePointerEvent(fudge.EVENT_POINTER.DOWN, true);

        // add pointer move and pointer down to standard viewport

        viewport.draw();

        // fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, update);
        // fudge.Loop.start(fudge.LOOP_MODE.TIME_REAL, 2);
    }

    // function update(): void {
    //     viewport.draw();
    //     editorViewport.draw();
    // }

    function pointerMove(_event: fudge.EventPointer): void {
        let scale: number = 0.005;
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SHIFT_LEFT])) {
            let xChange: number = (_event.canvasX - oldX) * scale;
            let yChange: number = (_event.canvasY - oldY) * scale;
    
            viewport.camera.pivot.translate(new fudge.Vector3(xChange, yChange, 0));
            viewport.draw();
        }
        oldX = _event.canvasX;
        oldY = _event.canvasY;
    }

    function convertToMainViewport(selectedNode: fudge.Node): void {
        editorViewport.getGraph().removeChild(selectedNode);
        selectedNode.mtxLocal.translation = new fudge.Vector3(viewport.camera.pivot.translation.x, viewport.camera.pivot.translation.y, 0); 
        viewport.getGraph().addChild(selectedNode);
    }

    function pickSceneNode(_event: fudge.EventPointer): void {
        let pickedNodes: fudge.Node[] = pickNodes(_event.canvasX, _event.canvasY, viewport);

        if (pickedNodes) {
            selectedNode = pickedNodes[0];
        }
    }

    function dragNode(_event: fudge.EventPointer): void {
        let posMouse: fudge.Vector2 = new fudge.Vector2(_event.canvasX, _event.canvasY);
        if (selectedNode) {
            let cmpMaterial: fudge.ComponentMaterial = selectedNode.getComponent(fudge.ComponentMaterial);
            cmpMaterial.clrPrimary = fudge.Color.CSS("yellow");

            let rayEnd: fudge.Vector3 = convertClientToRay(posMouse);
            console.log(rayEnd);
            let cmpTransform: fudge.ComponentTransform = selectedNode.getComponent(fudge.ComponentTransform);
            cmpTransform.local.translation = rayEnd;
            viewport.draw();
        }
    }

    function releaseNode(_event: fudge.EventPointer): void {
        if (selectedNode) {
            let cmpMaterial: fudge.ComponentMaterial = selectedNode.getComponent(fudge.ComponentMaterial);
            cmpMaterial.clrPrimary = fudge.Color.CSS("green");

            selectedNode = null;
            viewport.draw();
        }
    }

    function convertClientToRay(_mousepos: fudge.Vector2): fudge.Vector3 {
        let posProjection: fudge.Vector2 = viewport.pointClientToProjection(_mousepos);
        let ray: fudge.Ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
        let camera: fudge.ComponentCamera = viewport.camera;

        // scale by z direction
        ray.direction.scale(cameraZ);
        ray.origin.transform(camera.pivot);
        ray.direction.transform(camera.pivot, false);

        let rayEnd: fudge.Vector3 = fudge.Vector3.SUM(ray.origin, ray.direction);
        return rayEnd;
    }

    function pickEditorNode(_event: fudge.EventPointer): void {
        let pickedNodes: fudge.Node[] = pickNodes(_event.canvasX, _event.canvasY, editorViewport);
        // maybe think of some logic to find the most senseful item (z-index?)
        for (let node of pickedNodes) {
            convertToMainViewport(node);
        }
        viewport.draw();
        editorViewport.draw();
    }

    function pickNodes(x: number, y: number, usedViewport: fudge.Viewport): fudge.Node[] {
        let posMouse: fudge.Vector2 = new fudge.Vector2(x, y);
        let nodes: fudge.Node[] = usedViewport.getGraph().getChildren();
        let picked: fudge.Node[] = [];
        for (let node of nodes) {
          let cmpPicker: ComponentPicker = node.getComponent(ComponentPicker);
          let pickData: PickData = cmpPicker.pick(posMouse, usedViewport);
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
}