///<reference path="./PickableNode.ts" />

 namespace Platform_Editor {
    import fudge = FudgeCore; 
    
    export class BaseNode extends PickableNode {
        private static material: fudge.Material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());

        constructor() {
            super("BaseNode");
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 1.4, 0))));
      
            let cmpMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
      
            let cmpMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(BaseNode.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);   
        }

        public create(): void {
            new BaseNode();
        }

    }
}