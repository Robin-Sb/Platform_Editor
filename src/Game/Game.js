"use strict";
var Platform_Game;
(function (Platform_Game) {
    var fudge = FudgeCore;
    window.addEventListener("load", gameLoad);
    function gameLoad() {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
        const canvas = document.querySelector("canvas");
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
            console.log(reconstruction);
        };
        reader.readAsText(file);
    }
})(Platform_Game || (Platform_Game = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class PickableNode extends fudge.Node {
        constructor(name) {
            super(name);
            this.addComponent(new Platform_Editor.ComponentPicker());
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
    var fudge = FudgeCore;
    class ComponentPicker extends fudge.Component {
        constructor(_radius = 0.5) {
            super();
            this.radius = 0.5;
            this.radius = _radius;
            this.singleton = false;
        }
        drawPickRadius(_viewport) {
            let pickData = this.getPickData(_viewport);
            let crc2 = _viewport.getContext();
            crc2.save();
            crc2.beginPath();
            crc2.arc(pickData.canvas.x, pickData.canvas.y, pickData.radius.magnitude, 0, 2 * Math.PI);
            crc2.strokeStyle = "#000000";
            crc2.fillStyle = "#ffffff80";
            crc2.stroke();
            crc2.fill();
        }
        pick(_client, viewport) {
            let pickData = this.getPickData(viewport);
            let distance = fudge.Vector2.DIFFERENCE(_client, pickData.canvas);
            if (distance.magnitudeSquared < pickData.radius.magnitudeSquared)
                return pickData;
            return null;
        }
        getPickData(currentViewport) {
            let node = this.getContainer();
            let projection = currentViewport.camera.project(node.mtxWorld.translation);
            let posClient = currentViewport.pointClipToClient(projection.toVector2());
            let projectionRadius = fudge.Vector3.X(this.radius * node.mtxWorld.scaling.magnitude); // / 1.414);
            projectionRadius.transform(currentViewport.camera.pivot, false);
            projectionRadius = currentViewport.camera.project(fudge.Vector3.SUM(node.mtxWorld.translation, projectionRadius));
            let posRadius = currentViewport.pointClipToClient(projectionRadius.toVector2());
            return { clip: projection, canvas: posClient, radius: fudge.Vector2.DIFFERENCE(posRadius, posClient) };
        }
    }
    Platform_Editor.ComponentPicker = ComponentPicker;
})(Platform_Editor || (Platform_Editor = {}));
var Platform_Editor;
(function (Platform_Editor) {
    var fudge = FudgeCore;
    class Enemy extends Platform_Editor.PickableNode {
        constructor() {
            super("Enemy");
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
            let cmpMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            this.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(Enemy.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("Red");
            this.addComponent(cmpMaterial);
        }
    }
    Enemy.material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());
    Platform_Editor.Enemy = Enemy;
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