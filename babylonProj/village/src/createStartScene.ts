 //-----IMPORTS  --  START-----\\

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
    Sound,
  } from "@babylonjs/core";
  //-----IMPORTS  --  END-----\\
  

 //-----FUNCTIONS  --  START-----\\
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

  //Light\\
  function createLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  //Spotlight\\
  function createSpotlight(scene: Scene, px: number, py: number, pz: number) {
    var light = new SpotLight("spotLight", new Vector3(0, 30, -10), new Vector3(0, -1, 0), Math.PI / 3, 2, scene);
  	light.diffuse = new Color3(1, 0, 0);
	  light.specular = new Color3(0, 1, 0);
    light.intensity = 1;
    return light;
  }
   
  //Sounds\\
  function createSound(scene: Scene) {
    const bounce = new Sound("bounce", "sounds/bounce.wav", scene);
   setInterval(() => bounce.play(), 7000);
   return bounce;
  }

  //Textures\\
 

  //Ground\\
  function createGround(scene: Scene) {
    const ground = MeshBuilder.CreateGround("ground",{ width: 20, height: 20 }, scene);
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseColor = new Color3(0.08, 0.39, 0.08)
    ground.material = groundMat;
    return ground;
  }

  //Box\\
  function createBox(scene: Scene) {
    const boxMat = new StandardMaterial("boxMat");
    boxMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/cubehouse.png")


    //options parameter to set different images on each side
    const faceUV: Vector4[] = [];
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    // top 4 and bottom 5 not seen so not set


    /**** World Objects *****/
    const box = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true});
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
  }
  
  //Roof\\
  function createRoof(scene: Scene)  {
    const roof = MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
    const roofMat = new StandardMaterial("roofMat");
    roofMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roof.material = roofMat;
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;
    return roof;
  }


//-----FUNCTIONS  --  END-----\\


//-----RENDER  --  START-----\\
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      roof?: Mesh;
      faceBox?: Mesh;
      light?: Light;
      bounce?: Sound;
      spotlight?: SpotLight;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posx, posy, posz, scalx, scaly, scalz)
    that.box = createBox(that.scene);
    that.roof = createRoof(that.scene);
    that.light = createLight(that.scene);
    that.spotlight = createSpotlight(that.scene, 0, 9, 0);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    that.bounce = createSound(that.scene);
    return that;
  }
//-----RENDER  --  END-----\\