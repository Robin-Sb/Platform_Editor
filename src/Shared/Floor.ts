///<reference path="./PickableNode.ts" />

namespace Platform_Editor {
    import fudge = FudgeCore; 
    
    export class Floor extends PickableNode {
        private static material: fudge.Material = new fudge.Material("FloorMtr", fudge.ShaderFlat, new fudge.CoatColored());
        private static readonly pivot: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));
        private _isPickable: boolean = true;

        constructor(isPickable: boolean = true) {
            super("Floor");

            if (!isPickable) {
                this._isPickable = false;
            }
        }

        get isPickable(): boolean {
            return this._isPickable;
        }

        public initialize(): void {
            let cmpTransform: fudge.ComponentTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 1.4, 0)));
            this.addComponent(cmpTransform);
      
            let cmpMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);
      
            let cmpMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(Floor.material);
            cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
            this.addComponent(cmpMaterial);   
        }

    }
}