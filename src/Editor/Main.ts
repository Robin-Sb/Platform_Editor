namespace Platform_Editor {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;
    
    export let viewport: fudge.Viewport;
    export let editorViewport: fudge.Viewport;
    window.addEventListener("load", editorLoad);

    let oldX: number;
    let oldY: number;
    let graph: fudge.Node = new fudge.Node("graph");
 

    function editorLoad(_event: Event): void {
        let cameraZ: number = 10;
        const canvas: HTMLCanvasElement = document.querySelector("#scene_canvas");
        const button: HTMLButtonElement =  document.querySelector("#save_game");
        button.addEventListener("click", serializeGraph);
        
        oldX = canvas.width / 2;
        oldY = canvas.height / 2;
        
        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));

        let startTile: Floor = new Floor(false);
        startTile.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
      
        let cmpMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
        startTile.addComponent(cmpMesh);

        let cmpMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(new fudge.Material("EnemyMtr", fudge.ShaderFlat, new fudge.CoatColored()));
        cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
        startTile.addComponent(cmpMaterial);
        startTile.mtxLocal.scaleX(3);
        startTile.mtxLocal.scaleY(0.5);
        graph.addChild(startTile);

        viewport = new fudge.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);

        viewport.addEventListener(fudge.EVENT_POINTER.MOVE, pointerMove);
        viewport.activatePointerEvent(fudge.EVENT_POINTER.MOVE, true);


        initializeEditorViewport();
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

    function serializeGraph(): void {
        fudge.Serializer.registerNamespace(Platform_Editor);
        let serializedGraph: fudge.Serialization = fudge.Serializer.serialize(graph);
        let json: string = fudge.Serializer.stringify(serializedGraph);
        let serializedResources: fudge.SerializationOfResources = fudge.ResourceManager.serialize();
        let resourceString: string = fudge.Serializer.stringify(serializedResources); // JSON.stringify(resources);
        let serialization: Serialization = new Serialization();
        serialization.graph = serializedGraph;
        serialization.resources = serializedResources;
        let finalJson: string = JSON.stringify(serialization, null, 2);
        console.log(resourceString);
        console.log(json);
        save(finalJson, "text.json");
    }

    function save(_content: string, _filename: string): void {
        let blob: Blob = new Blob([_content], { type: "text/plain" });
        let url: string = window.URL.createObjectURL(blob);
        //*/ using anchor element for download
        let downloader: HTMLAnchorElement;
        downloader = document.createElement("a");
        downloader.setAttribute("href", url);
        downloader.setAttribute("download", _filename);
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
        window.URL.revokeObjectURL(url);
    }    

    function initializeEditorViewport(): void {
        const editorCanvas: HTMLCanvasElement = document.querySelector("#editor_canvas");
        let editorGraph: fudge.Node = new fudge.Node("Editor Graph");
        fudgeAid.addStandardLightComponents(editorGraph, new fudge.Color(0.5, 0.5, 0.5));

        editorViewport = new fudge.Viewport();
        
        let editorCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        editorCamera.pivot.translateZ(5);
        editorCamera.pivot.lookAt(fudge.Vector3.ZERO());
        editorCamera.backgroundColor = new fudge.Color(1, 1, 1, 0.1);

        editorViewport.initialize("Test", editorGraph, editorCamera, editorCanvas);
        let baseNode: Floor = new Floor();
        baseNode.initialize();
        let enemy: Enemy = new Enemy();
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
}