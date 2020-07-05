namespace Platform_Edtior {
    import fudge = FudgeCore;
    export class BaseNode extends fudge.Node {
        constructor() {
            super("Test");
            this.addComponent(new ƒ.ComponentTransform(new fudge.Matrix4x4()));
      
            let cmpMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad);
            this.addComponent(cmpMesh);
      
            let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(new fudge.Material("TestMtr", fudge.ShaderFlat, new fudge.CoatColored(new fudge.Color(0, 1, 0))));
            this.addComponent(cmpMaterial);
      
            this.addComponent(new ComponentPicker());
        }
    }
}