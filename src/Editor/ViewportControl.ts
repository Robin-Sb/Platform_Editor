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

            viewport.addEventListener(fudge.EVENT_KEYBOARD.DOWN, this.handleKeyboard.bind(this));
            viewport.activateKeyboardEvent(fudge.EVENT_KEYBOARD.DOWN, true);
            viewport.setFocus(true);

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
            selectedNode.mtxLocal.translation = new fudge.Vector3(viewport.camera.pivot.translation.x, viewport.camera.pivot.translation.y, 0.01); 
            viewport.getGraph().addChild(selectedNode);
        }
    
        private pickSceneNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: PickableNode[] = this.pickNodes(_event.canvasX, _event.canvasY, viewport, <PickableNode[]> viewport.getGraph().getChildren());
    
            if (pickedNodes) {
                this.selectedNode = pickedNodes[0];
            }
        }
    
        private dragNode = (_event: fudge.EventPointer): void => {
            let posMouse: fudge.Vector2 = new fudge.Vector2(_event.canvasX, _event.canvasY);
            if (this.selectedNode) {
                let ray: fudge.Ray = viewport.getRayFromClient(posMouse);
                let intersection: fudge.Vector3 = ray.intersectPlane(this.selectedNode.mtxLocal.translation, new fudge.Vector3(0, 0, 1));

                let cmpTransform: fudge.ComponentTransform = this.selectedNode.getComponent(fudge.ComponentTransform);
                cmpTransform.local.translation = new fudge.Vector3(intersection.x, intersection.y, 0.01);
                viewport.draw();
            }
        }
    
        private releaseNode = (_event: fudge.EventPointer): void => {
            if (this.selectedNode) {
                let cmpMaterial: fudge.ComponentMaterial = this.selectedNode.getComponent(fudge.ComponentMaterial);
                //cmpMaterial.clrPrimary = this.selectedNode.color;
                if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.CTRL_LEFT])) {
                    let translation: fudge.Vector3 = this.selectedNode.mtxLocal.translation;
                    translation.x = Math.round(translation.x * 10) / 10;
                    translation.y = Math.round(translation.y * 10) / 10;   
                    this.selectedNode.mtxLocal.translation = new fudge.Vector3(translation.x, translation.y, 0.01);
                }
    
                this.selectedNode = null;
                viewport.draw();
            }
        }

        private handleKeyboard(_event: fudge.EventKeyboard): void {
            if (_event.code == fudge.KEYBOARD_CODE.DELETE) {
                if (this.selectedNode) {
                    viewport.getGraph().removeChild(this.selectedNode);
                    if (this.selectedNode.constructor == EndPole) {
                        let newPole: EndPole = new EndPole();
                        newPole.initialize();
                        editorViewport.getGraph().addChild(newPole);
                        editorViewport.draw();
                    }
                    this.selectedNode = null;
                    viewport.draw();
                }
            }
        }
    
        // private getRayEnd(_mousepos: fudge.Vector2): fudge.Vector3 {
        //     let posProjection: fudge.Vector2 = viewport.pointClientToProjection(_mousepos);
        //     let ray: fudge.Ray = new fudge.Ray(new fudge.Vector3(-posProjection.x, posProjection.y, 1));
        //     let camera: fudge.ComponentCamera = viewport.camera;
    
        //     // scale by z direction of camera
        //     ray.direction.scale(this.cameraZ);
        //     ray.origin.transform(camera.pivot);
        //     ray.direction.transform(camera.pivot, false);
    
        //     let rayEnd: fudge.Vector3 = fudge.Vector3.SUM(ray.origin, ray.direction);
        //     return rayEnd;
        // }
    
        private pickEditorNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: PickableNode[] = this.pickNodes(_event.canvasX, _event.canvasY, editorViewport, <PickableNode[]> editorViewport.getGraph().getChildren());
            // maybe think of some logic to find the most senseful item (z-index?)
            for (let node of pickedNodes) {
                this.convertToMainViewport(node);

                let pickableNode: PickableNode;

                let matched: boolean = true;
                switch (node.constructor) {
                    case Enemy: 
                        pickableNode = new Enemy();
                        break;
                    case Floor: 
                        pickableNode = new Floor();
                        break;
                    default: matched = false;
                }
                if (matched) {
                    pickableNode.initialize();
                    editorViewport.getGraph().addChild(pickableNode);
                }
            }
            
            viewport.draw();
            editorViewport.draw();
        }

    
        private pickNodes(x: number, y: number, usedViewport: fudge.Viewport, nodes: PickableNode[]): PickableNode[] {
            let posMouse: fudge.Vector2 = new fudge.Vector2(x, y);
            let ray: fudge.Ray = usedViewport.getRayFromClient(posMouse);
            let picked: PickableNode[] = [];
            for (let node of nodes) {
                if (node instanceof Floor) {
                    if (!(<Floor> node).isPickable) {
                        continue;
                    }
                }

                //let translation: fudge.Vector3 = node.mtxLocal.translation;
                let intersection: fudge.Vector3 = ray.intersectPlane(new fudge.Vector3(1, 1, 0), new fudge.Vector3(0, 0, 1));

                for (let rect of node.getRectWorld()) {
                    if (rect.isInside(intersection.toVector2())) {
                        picked.push(node);
                    }    
                }
            } 
            
            return picked;
        }    
    }    
}