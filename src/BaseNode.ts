///<reference path="./PickableNode.ts" />

 namespace Platform_Edtior {
    import fudge = FudgeCore; 
    
    export class BaseNode extends PickableNode {
        private static material: fudge.Material = new fudge.Material("BaseMtr", fudge.ShaderFlat, new fudge.CoatColored());

        constructor() {
            super("BaseNode");
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
      
            let cmpMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
      
            let cmpMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(BaseNode.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);      
        }
    }
}