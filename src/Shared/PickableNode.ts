namespace Platform_Editor {
    import fudge = FudgeCore;
    export abstract class PickableNode extends fudge.Node {
        constructor(name: string) {
            super(name);
        }

        public abstract initialize(): void;

        public getRectWorld(): ƒ.Rectangle {
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