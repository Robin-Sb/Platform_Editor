///<reference path="./PickableNode.ts" />

namespace Platform_Editor {
    import fudge = FudgeCore; 
    
    export class Floor extends fudge.Node implements PickableNode  {
        private _isPickable: boolean = true;
        private textureId: string;

        constructor (isPickable: boolean = true) {
            super("Floor");
            if (!isPickable) {
                this._isPickable = false;
            }
        }

        get isPickable(): boolean {
            return this._isPickable;
        }

        public initialize(translation: fudge.Vector3 = new fudge.Vector3(0, 1.5, 0), textureId: string = "#grass_text"): void {
            this.textureId = textureId;
            let cmpTransform: fudge.ComponentTransform = new fudge.ComponentTransform(fudge.Matrix4x4.TRANSLATION(translation));
            this.addComponent(cmpTransform);
      
            let cmpMesh: fudge.ComponentMesh = new fudge.ComponentMesh(new fudge.MeshQuad());
            this.addComponent(cmpMesh);

            let coatTextured: fudge.CoatTextured = Utils.generateTextureFromId(textureId); 

            let material: fudge.Material = new fudge.Material("FloorMtr", fudge.ShaderTexture, coatTextured);
            let cmpMaterial: fudge.ComponentMaterial = new fudge.ComponentMaterial(material);

            this.mtxLocal.scaleX(3);
            this.mtxLocal.scaleY(0.5);
            this.addComponent(cmpMaterial);   
        }

        public getRectWorld(): fudge.Rectangle[] {      
            return [Utils.getRectWorld(this)];
        }

        public serialize(): fudge.Serialization {
            let serialization: fudge.Serialization = {
                name: this.name,
                translation: this.mtxLocal.translation,
                textureId: this.textureId
            };
            return serialization;
        }

        public deserialize(_serialization: fudge.Serialization): fudge.Serializable {
            this.initialize(new fudge.Vector3(_serialization.translation.data[0], _serialization.translation.data[1], 0), _serialization.textureId);
            this.name = _serialization.name;
            this.dispatchEvent(new Event(fudge.EVENT.NODE_DESERIALIZED));

            return this;
        }
    }
}