namespace Platform_Editor {
    import fudge = FudgeCore;
    export interface PickableNode extends fudge.Node {
        color: fudge.Color;
        initialize(): void;
        getRectWorld(): ƒ.Rectangle;
    }
}