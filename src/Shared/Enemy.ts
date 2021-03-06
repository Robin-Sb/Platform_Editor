///<reference path="./PickableNode.ts" />

namespace Platform_Editor {
    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;

    export class Enemy extends fudgeAid.NodeSprite implements PickableNode {
        private static animations: fudgeAid.SpriteSheetAnimations;
        private static speed: fudge.Vector3 = new fudge.Vector3(1, 0, 0);
        private currentDirection: Platform_Game.DIRECTION = Platform_Game.DIRECTION.RIGHT;
        private adjacentFloors: Floor[] = [];

        constructor() {
            super("Enemy");
        }

        getRectWorld(): fudge.Rectangle[] {
            return [Utils.getRectWorld(this)];
        }

        public initialize(translation: fudge.Vector3 = new fudge.Vector3(-0.5, -1, 0)): void {
            this.addComponent(new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation)));
            Enemy.animations = {};

            let img: HTMLImageElement = document.querySelector("#enemy_idle");
            let spritesheet: fudge.CoatTextured = fudgeAid.createSpriteSheet("Enemy", img);
            let sprite: fudgeAid.SpriteSheetAnimation = new fudgeAid.SpriteSheetAnimation("Idle", spritesheet);
            sprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 4, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.IDLE] = sprite;

            let walkImg: HTMLImageElement = document.querySelector("#enemy_walk");
            let walksheet: fudge.CoatTextured = fudgeAid.createSpriteSheet("Enemy", walkImg);
            let walkSprite: fudgeAid.SpriteSheetAnimation = new fudgeAid.SpriteSheetAnimation("Walk", walksheet);
            walkSprite.generateByGrid(fudge.Rectangle.GET(0, 0, 32, 32), 6, fudge.Vector2.ZERO(), 32, fudge.ORIGIN2D.BOTTOMCENTER);
            Enemy.animations[Platform_Game.ACTION.WALK] = walkSprite;

            this.setAnimation(<fudgeAid.SpriteSheetAnimation> Enemy.animations[Platform_Game.ACTION.IDLE]);
        }

        public serialize(): fudge.Serialization {
            let serialization: fudge.Serialization = {
                name: this.name,
                translation: this.mtxLocal.translation
            };
            return serialization;
        }

        public deserialize(_serialization: fudge.Serialization): fudge.Serializable {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0));
            this.name = _serialization.name;

            this.dispatchEvent(new Event(fudge.EVENT.NODE_DESERIALIZED));

            return this;
        }

        public preProcessEnemy(floors: Floor[]): void {
            let closestDistance: number = Number.MAX_VALUE;
            let nearestFloor: number;
            for (let i: number = 0; i < floors.length; i++) {
                let distance: fudge.Vector3 = fudge.Vector3.DIFFERENCE(this.mtxLocal.translation, floors[i].mtxLocal.translation);
                if (distance.magnitudeSquared < closestDistance) {
                    nearestFloor = i;
                    closestDistance = distance.magnitudeSquared;
                }
            }
            this.mtxLocal.translation = new fudge.Vector3(this.mtxLocal.translation.x, floors[nearestFloor].mtxLocal.translation.y + (floors[nearestFloor].mtxLocal.scaling.y / 2), 0); 
            fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, this.update);
            this.findAdjacentFloors(floors[nearestFloor], floors, nearestFloor);
            this.adjacentFloors.sort(this.compare);
            this.setAnimation(<fudgeAid.SpriteSheetAnimation> Enemy.animations[Platform_Game.ACTION.WALK]);
        }

        public removeListener(): void {
            fudge.Loop.removeEventListener(fudge.EVENT.LOOP_FRAME, this.update);
        }

        private findAdjacentFloors(startFloor: Floor, floors: Floor[], thisIndex: number): void {
            floors.splice(thisIndex, 1);
            this.adjacentFloors.push(startFloor);

            for (let i: number = 0; i < floors.length; i++) {
                let startFloorMtx: fudge.Matrix4x4 = startFloor.mtxLocal;
                let currentFloorMtx: fudge.Matrix4x4 = floors[i].mtxLocal;

                if (Math.abs((startFloorMtx.translation.y + startFloorMtx.scaling.y) - (currentFloorMtx.translation.y + currentFloorMtx.scaling.y)) < 0.05) {
                    if (startFloorMtx.translation.x > currentFloorMtx.translation.x) {
                        if (currentFloorMtx.translation.x + currentFloorMtx.scaling.x / 2 + startFloorMtx.scaling.x / 2 - startFloorMtx.translation.x >= 0) {
                            this.findAdjacentFloors(floors[i], floors, i);
                        }
                    } else {
                        if (currentFloorMtx.translation.x - currentFloorMtx.scaling.x / 2 - startFloorMtx.scaling.x / 2 - startFloorMtx.translation.x <= 0) {
                            this.findAdjacentFloors(floors[i], floors, i);
                        }
                    }
                }
            }
        }

        private compare(floorA: Floor, floorB: Floor): number {
            return floorA.mtxLocal.translation.x - floorB.mtxLocal.translation.x;
        }

        private update = (): void => {
            let direction: number = (this.currentDirection == Platform_Game.DIRECTION.RIGHT ? 1 : -1);
            this.cmpTransform.local.rotation = fudge.Vector3.Y(90 - 90 * direction);

            let timeFrame: number = fudge.Loop.timeFrameGame / 500;
            let distance: fudge.Vector3 = fudge.Vector3.SCALE(Enemy.speed, timeFrame);
            this.cmpTransform.local.translate(distance);
            let adjacentFloorMtx: fudge.Matrix4x4;
            if (this.currentDirection == Platform_Game.DIRECTION.LEFT) {
                adjacentFloorMtx = this.adjacentFloors[0].mtxLocal;
                if (this.mtxLocal.translation.x < adjacentFloorMtx.translation.x - adjacentFloorMtx.scaling.x / 2) {
                    this.mtxLocal.translation.x = adjacentFloorMtx.translation.x - adjacentFloorMtx.scaling.x / 2;
                    this.currentDirection = Platform_Game.DIRECTION.RIGHT;
                }
            } else {
                adjacentFloorMtx = this.adjacentFloors[this.adjacentFloors.length - 1].mtxLocal;
                if (this.mtxLocal.translation.x > adjacentFloorMtx.translation.x + adjacentFloorMtx.scaling.x / 2) {
                    this.mtxLocal.translation.x = adjacentFloorMtx.translation.x + adjacentFloorMtx.scaling.x / 2;
                    this.currentDirection = Platform_Game.DIRECTION.LEFT;
                }
            }
        }
    }
}