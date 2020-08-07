namespace Platform_Editor {
    import fudge = FudgeCore;
    export class ViewportControl {
        private selectedNode: PickableNode;
        private states: Array<{serialization: fudge.Serialization, endPoleSet: boolean}> = [];

        constructor() {
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
            document.addEventListener("keydown", this.control.bind(viewport.getGraph()));
        }

        private control = (event: KeyboardEvent): void => {
            if (event.ctrlKey && event.key === "z") { 
                if (this.states.length == 0) 
                    return;
                let state: {serialization: fudge.Serialization, endPoleSet: boolean} = this.states.pop();
                viewport.setGraph(<fudge.Node> fudge.Serializer.deserialize(state.serialization));

                if (state.endPoleSet) {
                    let newPole: EndPole = new EndPole();
                    newPole.initialize();
                    editorViewport.getGraph().addChild(newPole);
                    editorViewport.draw();
                }
                viewport.draw();
            }
        }

        private convertToMainViewport(selectedNode: fudge.Node): void {
            editorViewport.getGraph().removeChild(selectedNode);
            selectedNode.mtxLocal.translation = new fudge.Vector3(viewport.camera.pivot.translation.x, viewport.camera.pivot.translation.y, 0.01); 
            let isEndPool: boolean = selectedNode instanceof EndPole; 
            isEndPool ? this.setState(true) : this.setState(false);
            viewport.getGraph().addChild(selectedNode);
        }
    
        private pickSceneNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: PickableNode[] = this.pickNodes(_event.canvasX, _event.canvasY, viewport, <PickableNode[]> viewport.getGraph().getChildren());
    
            if (pickedNodes) {
                this.setState(false);
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

        private setState(endPoleSet: boolean): void {
            this.states.push({
                serialization: fudge.Serializer.serialize(viewport.getGraph()), 
                endPoleSet: endPoleSet });

            if (this.states.length > 5) {
                this.states.splice(0, 1);
            }
        }
    
        private pickEditorNode = (_event: fudge.EventPointer): void => {
            let pickedNodes: PickableNode[] = this.pickNodes(_event.canvasX, _event.canvasY, editorViewport, <PickableNode[]> editorViewport.getGraph().getChildren());
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