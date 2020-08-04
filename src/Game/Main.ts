namespace Platform_Game {

    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;
    window.addEventListener("load", gameLoad);

    export let viewport: fudge.Viewport;
    let player: Player;

    function gameLoad(): void {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
    }

    function initialize(graph: fudge.Node): void {
        let button: HTMLButtonElement = document.querySelector("#file-input");
        button.parentNode.removeChild(button);

        const canvas: HTMLCanvasElement = document.querySelector("canvas");

        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(10);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));

        viewport = new fudge.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);

        if (graph.getChildrenByName("EndPole")[0].mtxLocal.translation.x < 0) {
            Parameters.isRightSided = false;
        }

        for (let floor of graph.getChildrenByName("Floor")) {
            let tileY: number = floor.mtxLocal.translation.y;
            if (tileY < Parameters.lowestTile) 
                Parameters.lowestTile = tileY;
        }

        Player.generateSprite();

        player = new Player();
        viewport.getGraph().addChild(player);
        viewport.draw();

        fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, update);
        fudge.Loop.start(fudge.LOOP_MODE.TIME_GAME, 60);
    }

    function update(): void {
        processInput();
        viewport.draw();
    }
    function processInput(): void {
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.A, fudge.KEYBOARD_CODE.ARROW_LEFT]))
          player.act(ACTION.WALK, DIRECTION.LEFT);
        else if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.D, fudge.KEYBOARD_CODE.ARROW_RIGHT]))
          player.act(ACTION.WALK, DIRECTION.RIGHT);
        else
          player.act(ACTION.IDLE);

        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SPACE]))
            player.act(ACTION.JUMP);
    }
    
    

    function readSingleFile(event: any): void {
        var file = event.target.files[0];
        if (!file) {
          return;
        }
        var reader: FileReader  = new FileReader();
        reader.onload = function(event) {
          var contents: string | ArrayBuffer = event.target.result; 
          let coreSerialization: Platform_Editor.Serialization = JSON.parse(contents.toString());
          fudge.Serializer.registerNamespace(Platform_Editor);
          fudge.ResourceManager.deserialize(coreSerialization.resources);
          let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(coreSerialization.graph);
          // let serialization: fudge.Serialization = fudge.Serializer.parse(contents.toString());
          // let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(serialization);
          let graph: fudge.Node = <fudge.Node> reconstruction;
          initialize(graph);
        };
        reader.readAsText(file);
    }
}