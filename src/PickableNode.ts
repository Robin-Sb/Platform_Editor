namespace Platform_Editor {
    import fudge = FudgeCore;
    export abstract class PickableNode extends fudge.Node {
        constructor(name: string) {
            super(name);
            editorViewport.getGraph().addChild(this);
            this.addComponent(new ComponentPicker());
        }

        public abstract create(): void;
    }

}
