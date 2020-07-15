namespace Platform_Editor {
    import fudge = FudgeCore;
    export abstract class PickableNode extends fudge.Node {
        constructor(name: string) {
            super(name);
            let picker: ComponentPicker = new ComponentPicker();
            this.addComponent(picker);
        }
    }
}