namespace Platform_Game {

    import fudge = FudgeCore;
    window.addEventListener("load", gameLoad);

    export let viewport: fudge.Viewport;

    function gameLoad(): void {
        document.querySelector("#file-input").addEventListener("change", readSingleFile, false);
        //const canvas: HTMLCanvasElement = document.querySelector("canvas");
    }

    function readSingleFile(event: any): void {
        var file = event.target.files[0];
        if (!file) {
          return;
        }
        var reader: FileReader  = new FileReader();
        reader.onload = function(event) {
          var contents: string | ArrayBuffer = event.target.result; 
          fudge.Serializer.registerNamespace(Platform_Editor);
          let serialization: fudge.Serialization = fudge.Serializer.parse(contents.toString());
          let reconstruction: fudge.Serializable = fudge.Serializer.deserialize(serialization);
          console.log(reconstruction);
        };
        reader.readAsText(file);
    }
}