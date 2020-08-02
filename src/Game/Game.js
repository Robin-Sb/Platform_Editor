"use strict";
var Platform_Game;
(function (Platform_Game) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    window.addEventListener("load", gameLoad);
    function gameLoad() {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
    }
    function initialize(graph) {
        const canvas = document.querySelector("canvas");
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(10);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");
        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));
        Platform_Game.viewport = new fudge.Viewport();
        Platform_Game.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Platform_Game.viewport.draw();
    }
    function readSingleFile(event) {
        var file = event.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (event) {
            var contents = event.target.result;
            let coreSerialization = JSON.parse(contents.toString());
            fudge.Serializer.registerNamespace(Platform_Editor);
            fudge.ResourceManager.deserialize(coreSerialization.resources);
            let reconstruction = fudge.Serializer.deserialize(coreSerialization.graph);
            // let serialization: fudge.Serialization = fudge.Serializer.parse(contents.toString());
            // let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(serialization);
            let graph = reconstruction;
            initialize(graph);
        };
        reader.readAsText(file);
    }
})(Platform_Game || (Platform_Game = {}));
var Platform_Game;
(function (Platform_Game) {
    var fudge = FudgeCore;
    var fudgeAid = FudgeAid;
    let ACTION;
    (function (ACTION) {
        ACTION["IDLE"] = "Idle";
        ACTION["WALK"] = "Walk";
        ACTION["JUMP"] = "Jump";
    })(ACTION = Platform_Game.ACTION || (Platform_Game.ACTION = {}));
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 0] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 1] = "RIGHT";
    })(DIRECTION = Platform_Game.DIRECTION || (Platform_Game.DIRECTION = {}));
    class Player extends fudgeAid.NodeSprite {
        constructor(_name = "Hare") {
            super(_name);
            this.speed = fudge.Vector3.ZERO();
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000;
                this.speed.y += Player.gravity.y * timeFrame;
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                this.cmpTransform.local.translate(distance);
                this.checkCollision();
            };
            this.addComponent(new fudge.ComponentTransform());
            this.show(ACTION.IDLE);
            this.generateSprite();
            fudge.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        generateSprite() {
            let walkImg = new Image();
            walkImg.src = "../../assets/Owlet_Monster/Owlet_Monster_Walk_6.png";
            let walkSheet = fudgeAid.createSpriteSheet("Walk", walkImg);
            Player.animations = {};
            let sprite = new ƒAid.SpriteSheetAnimation(ACTION.WALK, walkSheet);
            sprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Player.animations[ACTION.WALK] = sprite;
        }
        show(_action) {
            // show only the animation defined for the action
            if (_action == ACTION.JUMP)
                return;
            this.setAnimation(Player.animations[_action]);
        }
        checkCollision() {
            for (let floor of Platform_Game.viewport.getGraph().getChildrenByName("PickableNodes")[0].getChildren()) {
                let rect = floor.getRectWorld();
                let hit = rect.isInside(this.cmpTransform.local.translation.toVector2());
                if (hit) {
                    let translation = this.cmpTransform.local.translation;
                    translation.y = rect.y;
                    this.cmpTransform.local.translation = translation;
                    this.speed.y = 0;
                }
            }
        }
    }
    Player.speedMax = new fudge.Vector2(1.5, 5); // units per second
    Player.gravity = fudge.Vector2.Y(-3);
    Platform_Game.Player = Player;
})(Platform_Game || (Platform_Game = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Enemy extends Platform_Editor.PickableNode {
        constructor() {
            super("Enemy");
        }
        initialize() {
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(Enemy.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("Red");
            this.addComponent(cmpMaterial);
        }
    }
    Enemy.material = new fudge.Material("EnemyMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.Enemy = Enemy;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class PickableNode extends fudge.Node {
        constructor(name) {
            super(name);
        }
    }
    Platform_Editor.PickableNode = PickableNode;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class BaseNode extends Platform_Editor.PickableNode {
        constructor() {
            super("BaseNode");
        }
        initialize() {
            let cmpTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 1.4, 0)));
            this.addComponent(cmpTransform);
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(BaseNode.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);
        }
    }
    BaseNode.material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.BaseNode = BaseNode;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    class Serialization {
    }
    Platform_Editor.Serialization = Serialization;
})(Platform_Editor || (Platform_Editor = {}));
///<reference path="./PickableNode.ts" />
var Platform_Editor;
///<reference path="./PickableNode.ts" />
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class BaseNode extends Platform_Editor.PickableNode {
        constructor() {
            super("BaseNode");
        }
        initialize() {
            let cmpTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 1.4, 0)));
            this.addComponent(cmpTransform);
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(BaseNode.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);
        }
    }
    BaseNode.material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.BaseNode = BaseNode;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    class Serialization {
    }
    Platform_Editor.Serialization = Serialization;
})(Platform_Editor || (Platform_Editor = {}));
//# sourceMappingURL=Game.js.map