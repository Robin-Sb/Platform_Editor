///<reference path="./PickableNode.ts" />

namespace Platform_Editor {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    export class Enemy extends fudgeAid.NodeSprite implements PickableNode {
        private static material: fudge.Material = new fudge.Material("EnemyMtr", fudge.ShaderFlat, new fudge.CoatColored());
        private static animations: fudgeAid.SpriteSheetAnimations;
        private static readonly pivot: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0.5));
        color: fudge.Color;

        constructor() {
            super("Enemy");
        }

        getRectWorld(): fudge.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);
            
            let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
      
            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
      
            return rect;
        }

        public initialize(): void {
            this.addComponent(new fudge.ComponentTransform(new fudge.Matrix4x4()));
      
            let img: HTMLImageElement = document.querySelector("#enemy_idle");
            let spritesheet: fudge.CoatTextured = fudgeAid.createSpriteSheet("Enemy", img);

            Enemy.animations = {};

            let sprite: fudgeAid.SpriteSheetAnimation = new fudgeAid.SpriteSheetAnimation("Idle", spritesheet);
            sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 4, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.IDLE] = sprite;

            this.setAnimation(<fudgeAid.SpriteSheetAnimation> Enemy.animations[Platform_Game.ACTION.IDLE]);
            this.color = this.getComponent(fudge.ComponentMaterial).clrPrimary;
        }

        public serialize(): fudge.Serialization {
            let serialization: fudge.Serialization = {
                name: this.name,
                translation: this.mtxLocal.translation
            }
            return serialization;
        }

        public deserialize(_serialization: fudge.Serialization): fudge.Serializable {
            this.initialize();
            this.name = _serialization.name;
            this.mtxLocal.translation = new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0);

            this.dispatchEvent(new Event(fudge.EVENT.NODE_DESERIALIZED));

            return this;
        }
    }
}