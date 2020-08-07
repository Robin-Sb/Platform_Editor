namespace Platform_Editor {
    import fudge = FudgeCore;
    export interface PickableNode extends fudge.Node {
        initialize(): void;
        getRectWorld(): fudge.Rectangle[];
    }
}