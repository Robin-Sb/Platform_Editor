namespace Platform_Game {

    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    export enum ACTION {
      IDLE = "Idle",
      WALK = "Walk",
      JUMP = "Jump"
    }
  
    export enum DIRECTION {
      LEFT, RIGHT
    }
  
    export class Player extends fudgeAid.NodeSprite {
        private static animations: fudgeAid.SpriteSheetAnimations;
        private static speedMax: fudge.Vector2 = new fudge.Vector2(1.5, 5); // units per second
        private static gravity: fudge.Vector2 = fudge.Vector2.Y(-3);
        public speed: fudge.Vector3 = fudge.Vector3.ZERO();
        private action: ACTION;

        constructor(_name: string = "Hare") {
            super(_name);
            this.addComponent(new fudge.ComponentTransform());
            this.show(ACTION.IDLE);
            this.cmpTransform.local.translateZ(0.1); 
            fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, this.update);
        }

        public static generateSprite(): void {
            let walkImg: HTMLImageElement = document.querySelector("#player_walk");
            Player.animations = {};
            Player.appendSprite(walkImg, ACTION.WALK, 6);

            let idleImg: HTMLImageElement = document.querySelector("#player_idle");
            let sprite: fudgeAid.SpriteSheetAnimation = Player.appendSprite(idleImg, ACTION.IDLE, 4);
            sprite.frames[2].timeScale = 10;            
            // let idleSheet: fudge.CoatTextured = fudgeAid.createSpriteSheet("Walk", idleImg);

            // sprite = new fudgeAid.SpriteSheetAnimation(ACTION.IDLE, idleSheet);
            // sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 4, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            // Player.animations[ACTION.IDLE] = sprite;
            
        }

        private static appendSprite(image: HTMLImageElement, action: ACTION, frames: number): fudgeAid.SpriteSheetAnimation {
            let spritesheet: fudge.CoatTextured = fudgeAid.createSpriteSheet("Player", image);

            let sprite: fudgeAid.SpriteSheetAnimation = new fudgeAid.SpriteSheetAnimation(ACTION.WALK, spritesheet);
            sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), frames, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Player.animations[action] = sprite;
            return sprite;
        }

        public act(_action: ACTION, _direction?: DIRECTION): void {
            switch (_action) {
              case ACTION.IDLE:
                this.speed.x = 0;
                break;
              case ACTION.WALK:
                let direction: number = (_direction == DIRECTION.RIGHT ? 1 : -1);
                this.speed.x = Player.speedMax.x; // * direction;
                this.cmpTransform.local.rotation = fudge.Vector3.Y(90 - 90 * direction);
                break;
              case ACTION.JUMP:
                this.speed.y = 2;
                break;
            }
            if (_action == this.action)
              return;
      
            this.action = _action;
            this.show(_action);
        }


        public show(_action: ACTION): void {
            //show only the animation defined for the action
            if (_action == ACTION.JUMP)
               return;
            this.setAnimation(<fudgeAid.SpriteSheetAnimation> Player.animations[_action]);
        }

        private update = (_event: fudge.Eventƒ): void => {
            let timeFrame: number = fudge.Loop.timeFrameGame / 500;
            this.speed.y += Player.gravity.y * timeFrame;
            let distance: fudge.Vector3 = fudge.Vector3.SCALE(this.speed, timeFrame);
            this.cmpTransform.local.translate(distance);
      
            this.checkCollision();
        }

        private checkCollision(): void {
            let nodes: fudge.Node[] = viewport.getGraph().getChildren();
            for (let floor of nodes) {
                if (!(floor instanceof Platform_Editor.Floor))
                    continue;
                
                let rect: fudge.Rectangle = (<Platform_Editor.Floor> floor).getRectWorld();
                let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
                if (hit) {
                    let translation: fudge.Vector3 = this.cmpTransform.local.translation;
                    translation.y = rect.y;
                    this.cmpTransform.local.translation = translation;
                    this.speed.y = 0;
                }
            }
        }
    }
}