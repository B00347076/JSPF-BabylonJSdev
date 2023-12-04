//-----------------------------------------------------
//TOP - IMPORTING BABYLONJS
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    Vector4,
    SpotLight,
    Color3,
  } from "@babylonjs/core";
 //----------------------------------------------------- 
  
 //-----------------------------------------------------
 //MIDDLE - FUNCTIONS


//Dice 01\\
function createFacedBox(scene: Scene, px: number, py: number, pz: number) {
  const mat = new StandardMaterial("mat");
  const texture = new Texture("https://assets.babylonjs.com/environments/numbers.jpg");
  mat.diffuseTexture = texture;

  var columns = 6;
  var rows = 1;

  const faceUV = new Array(6);

  for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
  }

  const options = {
      faceUV: faceUV,
      wrap: true
  };

  let box = MeshBuilder.CreateBox("tiledBox", options, scene);
  box.material = mat;
  box.position = new Vector3(px, py, pz);
  return box;
}
//Dice 02\\
function createFacedBox2(scene: Scene, px: number, py: number, pz: number) {
  const mat = new StandardMaterial("mat");
  const texture = new Texture("https://assets.babylonjs.com/environments/numbers.jpg");
  mat.diffuseTexture = texture;

  var columns = 6;
  var rows = 1;

  const faceUV = new Array(6);

  for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
  }

  const options = {
      faceUV: faceUV,
      wrap: true
  };

  let box = MeshBuilder.CreateBox("tiledBox", options, scene);
  box.material = mat;
  box.position = new Vector3(px, py, pz);
  return box;
}
  //Light\\
  function createLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  // Spotlight
  function createSpotlight(scene: Scene, px: number, py: number, pz: number) {
    var light = new SpotLight("spotLight", new Vector3(0, 30, -10), new Vector3(0, -1, 0), Math.PI / 3, 2, scene);
  	light.diffuse = new Color3(1, 0, 0);
	  light.specular = new Color3(0, 1, 0);
    light.intensity = 1;
    return light;
  }
   
  //Ground\\
  function createGround(scene: Scene) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 20, height: 20 },
      scene,
    );
    return ground;
  }
  
  //Camera\\
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  //--------------------------------------------------

  //--------------------------------------------------
  //BOTTOM - RENDER
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      faceBox?: Mesh;
      light?: Light;
      spotlight?: SpotLight;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posx, posy, posz, scalx, scaly, scalz)

    that.faceBox = createFacedBox(that.scene, 0, 2, 0)
    that.faceBox = createFacedBox2(that.scene, 0, 4, 0)
    that.light = createLight(that.scene);
    that.spotlight = createSpotlight(that.scene, 0, 9, 0);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
//----------------------------------------------------