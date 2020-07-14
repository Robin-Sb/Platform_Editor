namespace Platform_Editor {
    import fudge = FudgeCore;
    export class ViewportControl {
        private selectedNode: PickableNode;
        private cameraZ: number;

        // look at mutators again and serialization

        //private states: Array<{funct: (node: fudge.Node) => void, object: fudge.Node}> = new Array<{funct: (node: fudge.Node) => void, object: fudge.Node}>();
        //private states: Array<fudge.Node> = new Array<fudge.Node>();

        constructor(cameraZ: number) {
            this.cameraZ = cameraZ;
            viewport.addEventListener(fudge.EVENT_POINTER.MOVE, this.dragNode);
            viewport.activatePointerEvent(fudge.EVENT_POINTER.MOVE, true);
    
            viewport.addEventListener(fudge.EVENT_POINTER.DOWN, this.pickSceneNode);
            viewport.activatePointerEvent(fudge.EVENT_POINTER.DOWN, true);
    
            viewport.addEventListener(fudge.EVENT_POINTER.UP, this.releaseNode);
            viewport.activatePointerEvent(fudge.EVENT_POINTER.UP, true);

            editorViewport.addEventListener(fudge.EVENT_POINTER.DOWN, this.pickEditorNode);
            editorViewport.activatePointerEvent(fudge.EVENT_POINTER.DOWN, true);

            //document.addEventListener("keydown", this.control.bind(viewport.getGraph()));
        }

        // public appendState(state: fudge.Node[]): void {
        //     this.states.push(state);
        // }


        // private control = (event: KeyboardEvent): void => {
        //     if (event.ctrlKey && event.key === "z") {
        //         this.this.states[this.states.length - 1].funct

        //         viewport.draw();
        //     }
        // }

        private convertToMainViewport(selectedNode: fudge.Node): void {
            editorViewport.getGraph().removeChild(selectedNode);
            selectedNode.mtxLocal.translation = new fudge.Vector3(viewport.camera.pivot.translation.x, viewport.camera.pivot.translation.y, 0); 
            viewport.getGraph().addChild(selectedNode);
        }
    
        private pickSceneNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: PickableNode[] = this.pickNodes(_event.canvasX, _event.canvasY, viewport);
    
            if (pickedNodes) {
                this.selectedNode = pickedNodes[0];
            }
        }
    
        private dragNode = (_event: fudge.EventPointer): void => {
            let posMouse: fudge.Vector2 = new fudge.Vector2(_event.canvasX, _event.canvasY);
            if (this.selectedNode) {
                let cmpMaterial: fudge.ComponentMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                cmpMaterial.clrPrimary = fudge.Color.CSS("red");
    
                let rayEnd: fudge.Vector3 = this.convertClientToRay(posMouse);
                let cmpTransform: fudge.ComponentTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                cmpTransform.local.translation = rayEnd;
                viewport.draw();
            }
        }
    
        private releaseNode = (_event: fudge.EventPointer): void => {
            if (this.selectedNode) {
                let cmpMaterial: fudge.ComponentMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                cmpMaterial.clrPrimary = fudge.Color.CSS("LimeGreen");
    
                this.selectedNode = null;
                viewport.draw();
            }
        }
    
        // might do the same thing as getRayFromClient
        private convertClientToRay(_mousepos: fudge.Vector2): fudge.Vector3 {
            let posProjection: fudge.Vector2 = viewport.pointClientToProjection(_mousepos);
            let ray: fudge.Ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
            let camera: fudge.ComponentCamera = viewport.camera;
    
            // scale by z direction of camera
            ray.direction.scale(this.cameraZ);
            ray.origin.transform(camera.pivot);
            ray.direction.transform(camera.pivot, false);
    
            let rayEnd: fudge.Vector3 = fudge.Vector3.SUM(ray.origin, ray.direction);
            return rayEnd;
        }
    
        private pickEditorNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: PickableNode[] = this.pickNodes(_event.canvasX, _event.canvasY, editorViewport);
            // maybe think of some logic to find the most senseful item (z-index?)
            for (let node of pickedNodes) {
                this.convertToMainViewport(node);

                let pickableNode: PickableNode;

                switch (node.constructor) {
                    case Enemy: 
                        pickableNode = new Enemy();
                        break;
                    case BaseNode: 
                        pickableNode = new BaseNode();
                        break;
                }
                editorViewport.getGraph().addChild(pickableNode);
                // node.constructor.apply(node.create());
            }
            
            viewport.draw();
            editorViewport.draw();
        }

    
        private pickNodes(x: number, y: number, usedViewport: fudge.Viewport): PickableNode[] {
            let posMouse: fudge.Vector2 = new fudge.Vector2(x, y);
            let nodes: PickableNode[] = <PickableNode[]> usedViewport.getGraph().getChildren();
            let picked: PickableNode[] = [];
            for (let node of nodes) {
                let cmpPicker: ComponentPicker = node.getComponent(ComponentPicker);
                let pickData: PickData = cmpPicker.pick(posMouse, usedViewport);
                if (pickData) {
                    picked.push(node);
                    console.log(pickData);
                }
            } 
            
            return picked;
        }    
    }    
}