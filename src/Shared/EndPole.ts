namespace Platform_Editor {
    import fudge = FudgeCore;
    export class EndPole extends fudge.Node implements PickableNode {
        color: fudge.Color;

        constructor() {
            super("EndPole");
        }

        initialize(translation: fudge.Vector3 = new fudge.Vector3(0.7, -1, 0)): void {
            let base: fudge.Node = new fudge.Node("Base");
            let sizeY: number = 2;

            let baseTransform: fudge.ComponentTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 0, 0)));
            base.addComponent(baseTransform);

            let baseMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            base.addComponent(baseMesh);
            base.mtxLocal.scale(new fudge.Vector3(0.4, sizeY - 0.1, 0));

            let baseTextured: fudge.CoatTextured = Utils.generateTextureFromId("#polebase_text");
            let material: fudge.Material = new fudge.Material("PoleMtr", fudge.ShaderTexture, baseTextured);
            let baseMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(material);
            base.addComponent(baseMaterial);   

            let top: fudge.Node = new fudge.Node("Top");
            let topTransform: fudge.ComponentTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, sizeY / 2, 0)));
            top.addComponent(topTransform);
            top.mtxLocal.scale(fudge.Vector3.ONE(0.8));

            let topMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            top.addComponent(topMesh);

            let topTextured: fudge.CoatTextured = Utils.generateTextureFromId("#poletop_text");
            let topMaterial: fudge.Material = new fudge.Material("PoleMtr", fudge.ShaderTexture, topTextured);
            let topcmpMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(topMaterial);
            top.addComponent(topcmpMaterial);   

            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
            this.addChild(base);
            this.addChild(top);
        }
        getRectWorld(): fudge.Rectangle[] {
            let rects: fudge.Rectangle[] = [];
            for (let node of this.getChildren()) {
                rects.push(Utils.getRectWorld(node));
            }
      
            return rects;
        }
        
        public serialize(): fudge.Serialization {
            let serialization: fudge.Serialization = {
                name: this.name,
                translation: this.mtxLocal.translation
            };
            return serialization;
        }

        public deserialize(_serialization: fudge.Serialization): fudge.Serializable {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;

            this.dispatchEvent(new Event(fudge.EVENT.NODE_DESERIALIZED));

            return this;
        }
    } 
}