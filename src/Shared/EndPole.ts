namespace Platform_Editor {
    import fudge = FudgeCore;
    export class EndPole extends fudge.Node implements PickableNode {
        private static material: ƒ.Material = new ƒ.Material("Tower", ƒ.ShaderFlat, new ƒ.CoatColored());
        color: fudge.Color;

        constructor() {
            super("EndPole");
        }

        initialize(): void {
            let base: fudge.Node = new fudge.Node("Base");
            let standardY: number = -2;
            let sizeY: number = 2;

            let baseTransform: fudge.ComponentTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, 0, 0)));
            base.addComponent(baseTransform);

            let baseMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            base.addComponent(baseMesh);
            base.mtxLocal.scale(new fudge.Vector3(0.5, sizeY, 0));

            let baseMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(EndPole.material);
            this.color = fudge.Color.CSS("LimeGreen");
            baseMaterial.clrPrimary = this.color;
            base.addComponent(baseMaterial);   

            let top: fudge.Node = new fudge.Node("Top");
            let topTransform: fudge.ComponentTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(new fudge.Vector3(0, sizeY / 2 + 0.3, 0)));
            top.addComponent(topTransform);

            let topMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshSphere());
            top.addComponent(topMesh);

            let topMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(EndPole.material);
            this.color = fudge.Color.CSS("LimeGreen");
            topMaterial.clrPrimary = this.color;
            top.addComponent(topMaterial);   

            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(new fudge.Vector3(0, standardY, 0))));
            this.addChild(base);
            this.addChild(top);
        }
        getRectWorld(): fudge.Rectangle[] {
            // let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            // let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            // let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            
            // let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            // let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            
            // topleft.transform(mtxResult, true);
            // bottomright.transform(mtxResult, true);
      
            // let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            // rect.position = topleft.toVector2();
            // rect.size = size;
            let rects: fudge.Rectangle[] = [];
            for (let node of this.getChildren()) {
                rects.push(Utils.getRectWorld(node));
            }
      
            return rects;
        }
        
    } 
}