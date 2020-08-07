namespace Platform_Editor {
    import fudge = FudgeCore;
    export class Utils {
        static getRectWorld(node: fudge.Node): fudge.Rectangle {
            let rect: fudge.Rectangle = fudge.Rectangle.GET(0, 0, 100, 100);
            let topleft: fudge.Vector3 = new fudge.Vector3(-0.5, 0.5, 0);
            let bottomright: fudge.Vector3 = new fudge.Vector3(0.5, -0.5, 0);
            
            let pivot: fudge.Matrix4x4 = node.getComponent(fudge.ComponentMesh).pivot;
            let mtxResult: fudge.Matrix4x4 = fudge.Matrix4x4.MULTIPLICATION(node.mtxWorld, pivot);
            
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
      
            let size: fudge.Vector2 = new fudge.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
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