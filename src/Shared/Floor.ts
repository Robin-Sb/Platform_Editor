///<reference path="./PickableNode.ts" />

namespace Platform_Editor {
    import fudge = FudgeCore; 
    import fudgeAid = FudgeAid;
    
    export class Floor extends fudge.Node implements PickableNode  {
        private static material: fudge.Material = new fudge.Material("FloorMtr", fudge.ShaderFlat, new fudge.CoatColored());
        private static readonly pivot: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));
        color: fudge.Color;
        private _isPickable: boolean = true;

        constructor (isPickable: boolean = true) {
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
            this.color = fudge.Color.CSS("LimeGreen");
            cmpMaterial.clrPrimary = this.color;
            this.addComponent(cmpMaterial);   
        }

        public getRectWorld(): fudge.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            
            //let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            //let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Floor.pivot);
            
            topleft.transform(this.mtxWorld, true);
            bottomright.transform(this.mtxWorld, true);
      
            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
      
            return rect;
        }

    }
}