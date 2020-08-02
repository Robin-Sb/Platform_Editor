namespace Platform_Game {

    import fudge = FudgeCore;
    import fudgeAid = FudgeAid;
    window.addEventListener("load", gameLoad);

    export let viewport: fudge.Viewport;

    function gameLoad(): void {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
<<<<<<< Updated upstream
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
=======
    }

    function initialize(graph: fudge.Node): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");

        let cmpCamera: fudge.ComponentCamera = new fudge.ComponentCamera();
        cmpCamera.pivot.translateZ(10);
        cmpCamera.pivot.lookAt(fudge.Vector3.ZERO());
        cmpCamera.backgroundColor = fudge.Color.CSS("LightSkyBlue");

        fudgeAid.addStandardLightComponents(graph, new fudge.Color(0.5, 0.5, 0.5));

        viewport = new fudge.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);

        viewport.draw();

>>>>>>> Stashed changes
    }

    function readSingleFile(event: any): void {
        var file = event.target.files[0];
        if (!file) {
          return;
        }
        var reader: FileReader  = new FileReader();
        reader.onload = function(event) {
          var contents: string | ArrayBuffer = event.target.result; 
          let coreSerialization: Platform_Editor.Serialization = JSON.parse(contents.toString());
          fudge.Serializer.registerNamespace(Platform_Editor);
          fudge.ResourceManager.deserialize(coreSerialization.resources);
          let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(coreSerialization.graph);
          // let serialization: fudge.Serialization = fudge.Serializer.parse(contents.toString());
          // let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(serialization);
          let graph: fudge.Node = <fudge.Node> reconstruction;
          initialize(graph);
        };
        reader.readAsText(file);
    }
}