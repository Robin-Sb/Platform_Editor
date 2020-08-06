namespace Platform_Game {

    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;
    window.addEventListener("load", gameLoad);

    export let viewport: fudge.Viewport;
    let player: Player;
    let cameraZ: number = 10;
    export let lowestTile: number = Number.MAX_VALUE;
    export let isRightSided: boolean = true;
    export let audioComponents:  Record<string, fudge.ComponentAudio> = {};

    async function gameLoad(): Promise<void> {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
        let playerFailAudio: fudge.Audio = await fudge.Audio.load("../audio/PlayerFail.mp3");
        let playerFailAudioCmp: fudge.ComponentAudio = new fudge.ComponentAudio(playerFailAudio, false);
        playerFailAudioCmp.connect(true);
        playerFailAudioCmp.volume = 3;
        audioComponents["PlayerFail"] = playerFailAudioCmp;

        let enemyHitAudio: fudge.Audio = await fudge.Audio.load("../audio/EnemyHit.mp3");
        let enemyHitAudioCmp: fudge.ComponentAudio = new fudge.ComponentAudio(enemyHitAudio, false);
        enemyHitAudioCmp.connect(true);
        enemyHitAudioCmp.volume = 3;
        audioComponents["EnemyHit"] = enemyHitAudioCmp;

        let finishLevelAudio: fudge.Audio = await fudge.Audio.load("../audio/FinishLevel.mp3");
        let finishLevelAudioCmp: fudge.ComponentAudio = new fudge.ComponentAudio(finishLevelAudio, false);
        finishLevelAudioCmp.connect(true);
        finishLevelAudioCmp.volume = 3;
        audioComponents["FinishLevel"] = finishLevelAudioCmp;

        let bgAudio: fudge.Audio = await fudge.Audio.load("../audio/Background.mp3");
        let cmpAudioBG: fudge.ComponentAudio = new fudge.ComponentAudio(bgAudio, true, false);
        cmpAudioBG.connect(true);
        cmpAudioBG.volume = 1;
        audioComponents["Background"] = cmpAudioBG;
    }

    async function initialize(graph: fudge.Node): Promise<void> {
        let button: HTMLButtonElement = document.querySelector("#file-input");
        button.parentNode.removeChild(button);

        audioComponents["Background"].play(true);

        const canvas: HTMLCanvasElement = document.querySelector("canvas");

        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));

        viewport = new fudge.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);

        viewport.addEventListener(fudge.EVENT_KEYBOARD.DOWN, musisControl);
        viewport.activateKeyboardEvent(fudge.EVENT_KEYBOARD.DOWN, true);
        viewport.setFocus(true);

        if (graph.getChildrenByName("EndPole")[0].mtxLocal.translation.x < 0) {
            isRightSided = false;
        }

        for (let floor of graph.getChildrenByName("Floor")) {
            let tileY: number = floor.mtxLocal.translation.y;
            if (tileY < lowestTile) 
                lowestTile = tileY;
        }

        let enemies: Platform_Editor.Enemy[] = <Platform_Editor.Enemy[]> graph.getChildrenByName("Enemy");
        for (let enemy of enemies) {
            enemy.preProcessEnemy(<Platform_Editor.Floor[]> graph.getChildrenByName("Floor"));
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
        moveCamera();
        viewport.draw();
    }

    function moveCamera(): void {
        viewport.camera.pivot.translation = new fudge.Vector3(player.mtxLocal.translation.x, player.mtxLocal.translation.y, cameraZ);
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

    function musisControl(_event: fudge.EventKeyboard): void {
        if (_event.code == fudge.KEYBOARD_CODE.M) {
            audioComponents["Background"].play(false);
        }
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
          //fudge.ResourceManager.deserialize(coreSerialization.resources);
          let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(coreSerialization.graph);
          // let serialization: fudge.Serialization = fudge.Serializer.parse(contents.toString());
          // let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(serialization);
          let graph: fudge.Node = <fudge.Node> reconstruction;
          initialize(graph);
        };
        reader.readAsText(file);
    }
}