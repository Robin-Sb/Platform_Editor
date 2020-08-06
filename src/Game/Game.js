"use strict";
var Platform_Game;
(function (Platform_Game) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    window.addEventListener("load", gameLoad);
    let player;
    let cameraZ = 10;
    Platform_Game.lowestTile = Number.MAX_VALUE;
    Platform_Game.isRightSided = true;
    Platform_Game.audioComponents = {};
    async function gameLoad() {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
        let playerFailAudio = await fudge.Audio.load("../audio/PlayerFail.mp3");
        let playerFailAudioCmp = new fudge.ComponentAudio(playerFailAudio, false);
        playerFailAudioCmp.connect(true);
        playerFailAudioCmp.volume = 3;
        Platform_Game.audioComponents["PlayerFail"] = playerFailAudioCmp;
        let enemyHitAudio = await fudge.Audio.load("../audio/EnemyHit.mp3");
        let enemyHitAudioCmp = new fudge.ComponentAudio(enemyHitAudio, false);
        enemyHitAudioCmp.connect(true);
        enemyHitAudioCmp.volume = 3;
        Platform_Game.audioComponents["EnemyHit"] = enemyHitAudioCmp;
        let finishLevelAudio = await fudge.Audio.load("../audio/FinishLevel.mp3");
        let finishLevelAudioCmp = new fudge.ComponentAudio(finishLevelAudio, false);
        finishLevelAudioCmp.connect(true);
        finishLevelAudioCmp.volume = 3;
        Platform_Game.audioComponents["FinishLevel"] = finishLevelAudioCmp;
        let bgAudio = await fudge.Audio.load("../audio/Background.mp3");
        let cmpAudioBG = new fudge.ComponentAudio(bgAudio, true, false);
        cmpAudioBG.connect(true);
        cmpAudioBG.volume = 1;
        Platform_Game.audioComponents["Background"] = cmpAudioBG;
    }
    async function initialize(graph) {
        let button = document.querySelector("#file-input");
        button.parentNode.removeChild(button);
        Platform_Game.audioComponents["Background"].play(true);
        const canvas = document.querySelector("canvas");
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(cameraZ);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        Platform_Game.viewport = new fudge.Viewport();
        Platform_Game.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Game.viewport.addEventListener("\u0192keydown" /* DOWN */, musisControl);
        Platform_Game.viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
        Platform_Game.viewport.setFocus(true);
        if (graph.getChildrenByName("EndPole")[0].mtxLocal.translation.x < 0) {
            Platform_Game.isRightSided = false;
        }
        for (let floor of graph.getChildrenByName("Floor")) {
            let tileY = floor.mtxLocal.translation.y;
            if (tileY < Platform_Game.lowestTile)
                Platform_Game.lowestTile = tileY;
        }
        let enemies = graph.getChildrenByName("Enemy");
        for (let enemy of enemies) {
            enemy.preProcessEnemy(graph.getChildrenByName("Floor"));
        }
        Player.generateSprite();
        player = new Player();
        Platform_Game.viewport.getGraph().addChild(player);
        Platform_Game.viewport.draw();
        fudge.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        fudge.Loop.start(fudge.LOOP_MODE.TIME_GAME, 30);
    }
    function update() {
        processInput();
        moveCamera();
        Platform_Game.viewport.draw();
    }
    function moveCamera() {
        Platform_Game.viewport.camera.pivot.translation = new fudge.Vector3(player.mtxLocal.translation.x, player.mtxLocal.translation.y, cameraZ);
    }
    function processInput() {
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.A, fudge.KEYBOARD_CODE.ARROW_LEFT]))
            player.act(Platform_Game.ACTION.WALK, Platform_Game.DIRECTION.LEFT);
        else if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.D, fudge.KEYBOARD_CODE.ARROW_RIGHT]))
            player.act(Platform_Game.ACTION.WALK, Platform_Game.DIRECTION.RIGHT);
        else
            player.act(Platform_Game.ACTION.IDLE);
        if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.SPACE]))
            player.act(Platform_Game.ACTION.JUMP);
    }
    function musisControl(_event) {
        if (_event.code == fudge.KEYBOARD_CODE.M) {
            Platform_Game.audioComponents["Background"].play(false);
        }
    }
    function readSingleFile(event) {
        var file = event.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (event) {
            var contents = event.target.result;
            fudge.Serializer.registerNamespace(Platform_Editor);
            let serialization = fudge.Serializer.parse(contents.toString());
            let reconstruction = fudge.Serializer.deserialize(serialization);
            let graph = reconstruction;
            initialize(graph);
        };
        reader.readAsText(file);
    }
})(Platform_Game || (Platform_Game = {}));
var Platform_Game;
(function (Platform_Game) {
    let ACTION;
    (function (ACTION) {
        ACTION["IDLE"] = "Idle";
        ACTION["WALK"] = "Walk";
        ACTION["JUMP"] = "Jump";
    })(ACTION = Platform_Game.ACTION || (Platform_Game.ACTION = {}));
})(Platform_Game || (Platform_Game = {}));
var Platform_Game;
(function (Platform_Game) {
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 0] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 1] = "RIGHT";
    })(DIRECTION = Platform_Game.DIRECTION || (Platform_Game.DIRECTION = {}));
})(Platform_Game || (Platform_Game = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class EndPole extends fudge.Node {
        constructor() {
            super("EndPole");
        }
        initialize(translation = new fudge.Vector3(0.7, -1, 0)) {
            let base = new fudge.Node("Base");
            let sizeY = 2;
            let baseTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 0, 0)));
            base.addComponent(baseTransform);
            let baseMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            base.addComponent(baseMesh);
            base.mtxLocal.scale(new fudge.Vector3(0.5, sizeY, 0));
            let baseTextured = Platform_Editor.Utils.generateTextureFromId("#polebase_text");
            let material = new fudge.Material("PoleMtr", fudge.ShaderTexture, baseTextured);
            let baseMaterial = new fudge.ComponentMaterial(material);
            base.addComponent(baseMaterial);
            let top = new fudge.Node("Top");
            let topTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, sizeY / 2 + 0.3, 0)));
            top.addComponent(topTransform);
            let topMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            top.addComponent(topMesh);
            let topTextured = Platform_Editor.Utils.generateTextureFromId("#poletop_text");
            let topMaterial = new fudge.Material("PoleMtr", fudge.ShaderTexture, topTextured);
            let topcmpMaterial = new fudge.ComponentMaterial(topMaterial);
            top.addComponent(topcmpMaterial);
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(translation)));
            this.addChild(base);
            this.addChild(top);
        }
        getRectWorld() {
            let rects = [];
            for (let node of this.getChildren()) {
                rects.push(Platform_Editor.Utils.getRectWorld(node));
            }
            return rects;
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
    }
    Platform_Editor.EndPole = EndPole;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    class Enemy extends fudgeAid.NodeSprite {
        constructor() {
            super("Enemy");
            this.currentDirection = Platform_Game.DIRECTION.RIGHT;
            this.adjacentFloors = [];
            this.update = () => {
                let direction = (this.currentDirection == Platform_Game.DIRECTION.RIGHT ? 1 : -1);
                this.cmpTransform.local.rotation = fudge.Vector3.Y(90 - 90 * direction);
                let timeFrame = fudge.Loop.timeFrameGame / 500;
                let distance = fudge.Vector3.SCALE(Enemy.speed, timeFrame);
                this.cmpTransform.local.translate(distance);
                let adjacentFloorMtx;
                if (this.currentDirection == Platform_Game.DIRECTION.LEFT) {
                    adjacentFloorMtx = this.adjacentFloors[0].mtxLocal;
                    if (this.mtxLocal.translation.x < adjacentFloorMtx.translation.x - adjacentFloorMtx.scaling.x / 2) {
                        this.mtxLocal.translation.x = adjacentFloorMtx.translation.x - adjacentFloorMtx.scaling.x / 2;
                        this.currentDirection = Platform_Game.DIRECTION.RIGHT;
                    }
                }
                else {
                    adjacentFloorMtx = this.adjacentFloors[this.adjacentFloors.length - 1].mtxLocal;
                    if (this.mtxLocal.translation.x > adjacentFloorMtx.translation.x + adjacentFloorMtx.scaling.x / 2) {
                        this.mtxLocal.translation.x = adjacentFloorMtx.translation.x + adjacentFloorMtx.scaling.x / 2;
                        this.currentDirection = Platform_Game.DIRECTION.LEFT;
                    }
                }
            };
        }
        getRectWorld() {
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        initialize(translation = new fudge.Vector3(-0.5, -1, 0)) {
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
            Enemy.animations = {};
            let img = document.querySelector("#enemy_idle");
            let spritesheet = fudgeAid.createSpriteSheet("Enemy", img);
            let sprite = new fudgeAid.SpriteSheetAnimation("Idle", spritesheet);
            sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 4, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.IDLE] = sprite;
            let walkImg = document.querySelector("#enemy_walk");
            let walksheet = fudgeAid.createSpriteSheet("Enemy", walkImg);
            let walkSprite = new fudgeAid.SpriteSheetAnimation("Walk", walksheet);
            walkSprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 6, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.WALK] = walkSprite;
            this.setAnimation(Enemy.animations[Platform_Game.ACTION.IDLE]);
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation,
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
        preProcessEnemy(floors) {
            let closestDistance = Number.MAX_VALUE;
            let nearestFloor;
            for (let i = 0; i < floors.length; i++) {
                let distance = fudge.Vector3.DIFFERENCE(this.mtxLocal.translation, floors[i].mtxLocal.translation);
                if (distance.magnitudeSquared < closestDistance) {
                    nearestFloor = i;
                    closestDistance = distance.magnitudeSquared;
                }
            }
            this.mtxLocal.translation = new fudge.Vector3(this.mtxLocal.translation.x, floors[nearestFloor].mtxLocal.translation.y + (floors[nearestFloor].mtxLocal.scaling.y / 2), 0);
            fudge.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            this.findAdjacentFloors(floors[nearestFloor], floors, nearestFloor);
            this.adjacentFloors.sort(this.compare);
            this.setAnimation(Enemy.animations[Platform_Game.ACTION.WALK]);
        }
        removeListener() {
            fudge.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        findAdjacentFloors(startFloor, floors, thisIndex) {
            floors.splice(thisIndex, 1);
            this.adjacentFloors.push(startFloor);
            for (let i = 0; i < floors.length; i++) {
                let startFloorMtx = startFloor.mtxLocal;
                let currentFloorMtx = floors[i].mtxLocal;
                if (Math.abs((startFloorMtx.translation.y + startFloorMtx.scaling.y) - (currentFloorMtx.translation.y + currentFloorMtx.scaling.y)) < 0.05) {
                    if (startFloorMtx.translation.x > currentFloorMtx.translation.x) {
                        if (currentFloorMtx.translation.x + currentFloorMtx.scaling.x / 2 + startFloorMtx.scaling.x / 2 - startFloorMtx.translation.x >= 0) {
                            this.findAdjacentFloors(floors[i], floors, i);
                        }
                    }
                    else {
                        if (currentFloorMtx.translation.x - currentFloorMtx.scaling.x / 2 - startFloorMtx.scaling.x / 2 - startFloorMtx.translation.x <= 0) {
                            this.findAdjacentFloors(floors[i], floors, i);
                        }
                    }
                }
            }
        }
        compare(floorA, floorB) {
            return floorA.mtxLocal.translation.x - floorB.mtxLocal.translation.x;
        }
    }
    Enemy.speed = new fudge.Vector3(1, 0, 0);
    Platform_Editor.Enemy = Enemy;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Floor extends fudge.Node {
        constructor(isPickable = true) {
            super("Floor");
            this._isPickable = true;
            if (!isPickable) {
                this._isPickable = false;
            }
        }
        get isPickable() {
            return this._isPickable;
        }
        initialize(translation = new fudge.Vector3(0, 1.5, 0), textureId = "#grass_text") {
            this.textureId = textureId;
            let cmpTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation));
            this.addComponent(cmpTransform);
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let coatTextured = Platform_Editor.Utils.generateTextureFromId(textureId);
            let material = new fudge.Material("FloorMtr", fudge.ShaderTexture, coatTextured);
            let cmpMaterial = new fudge.ComponentMaterial(material);
            this.mtxLocal.scaleX(3);
            this.mtxLocal.scaleY(0.5);
            this.addComponent(cmpMaterial);
        }
        getRectWorld() {
            return [Platform_Editor.Utils.getRectWorld(this)];
        }
        serialize() {
            let serialization = {
                name: this.name,
                translation: this.mtxLocal.translation,
                textureId: this.textureId,
                isPickable: this.isPickable
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0), _serialization.textureId);
            this.name = _serialization.name;
            this._isPickable = _serialization.isPickable;
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
    }
    Platform_Editor.Floor = Floor;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Utils {
        static getRectWorld(node) {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright = new ƒ.Vector3(0.5, -0.5, 0);
            let pivot = node.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult = ƒ.Matrix4x4.MULTIPLICATION(node.mtxWorld, pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
        static generateTextureFromId(textureId) {
            let coatTextured = new fudge.CoatTextured();
            let img = document.querySelector(textureId);
            let textureImage = new fudge.TextureImage();
            textureImage.image = img;
            coatTextured.texture = textureImage;
            return coatTextured;
        }
    }
    Platform_Editor.Utils = Utils;
})(Platform_Editor || (Platform_Editor = {}));
//# sourceMappingURL=Game.js.map