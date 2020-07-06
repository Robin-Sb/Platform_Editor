namespace Platform_Edtior {
    import fudge = FudgeCore;
    export class ViewportControl {
        private selectedNode: PickableNode;
        private cameraZ: number;

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
        }

        private convertToMainViewport(selectedNode: fudge.Node): void {
            editorViewport.getGraph().removeChild(selectedNode);
            selectedNode.mtxLocal.translation = new fudge.Vector3(viewport.camera.pivot.translation.x, viewport.camera.pivot.translation.y, 0); 
            viewport.getGraph().addChild(selectedNode);
        }
    
        private pickSceneNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: fudge.Node[] = this.pickNodes(_event.canvasX, _event.canvasY, viewport);
    
            if (pickedNodes) {
                this.selectedNode = pickedNodes[0];
            }
        }
    
        private dragNode = (_event: fudge.EventPointer): void => {
            let posMouse: fudge.Vector2 = new fudge.Vector2(_event.canvasX, _event.canvasY);
            if (this.selectedNode) {
                let cmpMaterial: fudge.ComponentMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                cmpMaterial.clrPrimary = fudge.Color.CSS("yellow");
    
                let rayEnd: fudge.Vector3 = this.convertClientToRay(posMouse);
                console.log(rayEnd);
                let cmpTransform: fudge.ComponentTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                cmpTransform.local.translation = rayEnd;
                viewport.draw();
            }
        }
    
        private releaseNode = (_event: fudge.EventPointer): void => {
            if (this.selectedNode) {
                let cmpMaterial: fudge.ComponentMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                cmpMaterial.clrPrimary = fudge.Color.CSS("green");
    
                this.selectedNode = null;
                viewport.draw();
            }
        }
    
        private convertClientToRay(_mousepos: fudge.Vector2): fudge.Vector3 {
            let posProjection: fudge.Vector2 = viewport.pointClientToProjection(_mousepos);
            let ray: fudge.Ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
            let camera: fudge.ComponentCamera = viewport.camera;
    
            // scale by z direction
            ray.direction.scale(this.cameraZ);
            ray.origin.transform(camera.pivot);
            ray.direction.transform(camera.pivot, false);
    
            let rayEnd: fudge.Vector3 = fudge.Vector3.SUM(ray.origin, ray.direction);
            return rayEnd;
        }
    
        private pickEditorNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: fudge.Node[] = this.pickNodes(_event.canvasX, _event.canvasY, editorViewport);
            // maybe think of some logic to find the most senseful item (z-index?)
            for (let node of pickedNodes) {
                this.convertToMainViewport(node);
            }
            viewport.draw();
            editorViewport.draw();
        }
    
        private pickNodes(x: number, y: number, usedViewport: fudge.Viewport): fudge.Node[] {
            let posMouse: fudge.Vector2 = new fudge.Vector2(x, y);
            let nodes: fudge.Node[] = usedViewport.getGraph().getChildren();
            let picked: fudge.Node[] = [];
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
