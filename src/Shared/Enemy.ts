///<reference path="./PickableNode.ts" />

namespace Platform_Editor {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    export class Enemy extends fudgeAid.NodeSprite implements PickableNode {
        private static animations: fudgeAid.SpriteSheetAnimations;
        color: fudge.Color;

        constructor() {
            super("Enemy");
        }

        getRectWorld(): fudge.Rectangle[] {
            return [Utils.getRectWorld(this)];
        }

        public initialize(translation: fudge.Vector3 = new fudge.Vector3(-0.5, -1, 0)): void {
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
      
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
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;

            this.dispatchEvent(new Event(fudge.EVENT.NODE_DESERIALIZED));

            return this;
        }
    }
}