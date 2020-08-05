namespace Platform_Editor {
    import fudge = FudgeCore;
    export class Utils {
        static getRectWorld(node: fudge.Node): fudge.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            
            let pivot: ƒ.Matrix4x4 = node.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(node.mtxWorld, pivot);
            
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
      
            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
      
            return rect;
        }

        static generateTextureFromId(textureId: string): fudge.CoatTextured {
            let coatTextured: fudge.CoatTextured = new fudge.CoatTextured(); 
            let img: HTMLImageElement = document.querySelector(textureId);
            let textureImage: fudge.TextureImage = new fudge.TextureImage();
            textureImage.image = img;
            coatTextured.texture = textureImage;
            return coatTextured;
        }
    }
}