namespace Platform_Editor {
  import fudge = FudgeCore;
  // import fudgeAid = FudgeAid;

  export interface PickData {
    clip: fudge.Vector3;
    canvas: fudge.Vector2;
    radius: fudge.Vector2;
  }

  export class ComponentPicker extends fudge.Component {
    public radius: number = 0.5;

    public constructor(_radius: number = 0.5) {
      super();
      this.radius = _radius;
      this.singleton = false;
      console.log(this.singleton);
    } 

    public drawPickRadius(_viewport: fudge.Viewport): void {
      let pickData: PickData = this.getPickData(_viewport);

      let crc2: CanvasRenderingContext2D = _viewport.getContext();
      crc2.save();
      crc2.beginPath();
      crc2.arc(pickData.canvas.x, pickData.canvas.y, pickData.radius.magnitude, 0, 2 * Math.PI);
      crc2.strokeStyle = "#000000";
      crc2.fillStyle = "#ffffff80";
      crc2.stroke();
      crc2.fill();
    }

    public pick(_client: fudge.Vector2, viewport: fudge.Viewport): PickData {
      let pickData: PickData = this.getPickData(viewport);
      let distance: fudge.Vector2 = fudge.Vector2.DIFFERENCE(_client, pickData.canvas);
      if (distance.magnitudeSquared < pickData.radius.magnitudeSquared)
        return pickData;
      return null;
    }

    private getPickData(currentViewport: fudge.Viewport): PickData {
      let node: fudge.Node = this.getContainer();
      let projection: fudge.Vector3 = currentViewport.camera.project(node.mtxWorld.translation);
      let posClient: fudge.Vector2 = currentViewport.pointClipToClient(projection.toVector2());

      let projectionRadius: fudge.Vector3 = fudge.Vector3.X(this.radius * node.mtxWorld.scaling.magnitude); // / 1.414);
      projectionRadius.transform(currentViewport.camera.pivot, false);
      projectionRadius = currentViewport.camera.project(fudge.Vector3.SUM(node.mtxWorld.translation, projectionRadius));
      let posRadius: fudge.Vector2 = currentViewport.pointClipToClient(projectionRadius.toVector2());

      return { clip: projection, canvas: posClient, radius: fudge.Vector2.DIFFERENCE(posRadius, posClient) };
    }
  }
}