namespace Platform_Editor {
    import fudge = FudgeCore;
    export abstract class PickableNode extends fudge.Node {
        constructor(name: string) {
            super(name);
            this.addComponent(new ComponentPicker());
        }
    }
}