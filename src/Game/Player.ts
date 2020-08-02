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
            this.generateSprite();
            fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, this.update);
        }

        public generateSprite(): void {
            let walkImg: HTMLImageElement = new Image();
            walkImg.src = "../../assets/Owlet_Monster/Owlet_Monster_Walk_6.png";
            let walkSheet: fudge.CoatTextured = fudgeAid.createSpriteSheet("Walk", walkImg);

            Player.animations = {};
            let sprite: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(ACTION.WALK, walkSheet);
            sprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Player.animations[ACTION.WALK] = sprite;
        }

        public show(_action: ACTION): void {
            // show only the animation defined for the action
            if (_action == ACTION.JUMP)
              return;
            this.setAnimation(<fudgeAid.SpriteSheetAnimation> Player.animations[_action]);
        }
      


        private update = (_event: ƒ.Eventƒ): void => {
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
            this.speed.y += Player.gravity.y * timeFrame;
            let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
            this.cmpTransform.local.translate(distance);
      
            this.checkCollision();
          }
            


          private checkCollision(): void {
            for (let floor of viewport.getGraph().getChildrenByName("PickableNodes")[0].getChildren()) {
              let rect: ƒ.Rectangle = (<Platform_Editor.Floor> floor).getRectWorld();
              let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
              if (hit) {
                let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
                translation.y = rect.y;
                this.cmpTransform.local.translation = translation;
                this.speed.y = 0;
              }
            }
          }
      

    }
}