//----------------------------------------------------------\\
//-------------------IMPORTS  -  START----------------------\\
//----------------------------------------------------------\\
import setSceneIndex from "./index";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    SpotLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    Color3,
    Space,
    ShadowGenerator,
    PointLight,
    DirectionalLight,
    CubeTexture,
    Sprite,
    SpriteManager,
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    Sound
  } from "@babylonjs/core";
  import * as GUI from "@babylonjs/gui";

//----------------------------------------------------------\\
//-------------------IMPORTS  -  END------------------------\\
//----------------------------------------------------------\\

  //---------------------Creat  Button----------------------\\
  function createSceneButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
    let button = GUI.Button.CreateSimpleButton(name, index);
      button.left = x;
      button.top = y;
      button.width = "160px";
      button.height = "60px";
      button.color = "white";
      button.cornerRadius = 20;
      button.background = "green";

      const buttonClick = new Sound("MenuClickSFX", "./audio/whistle.wav", scene, null, {
        loop: false,
        autoplay: false,
      });

      button.onPointerUpObservable.add(function() {
        console.log("THE BUTTON HAS BEEN CLICKED");
        buttonClick.play();
        setSceneIndex(1);
      });
        advtex.addControl(button);
        return button;
 }
 //-------------------------END----------------------------\\

  //--------------------Game Title-----------------------\\
  function gameTitle(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
    let game = GUI.Button.CreateSimpleButton(name, index);
      game.left = x;
      game.top = y;
      game.width = "900px";
      game.height = "300px";
      game.color = "white";
      game.cornerRadius = 30;
      game.background = "rgba(0, 0, 0, 0.5)";
      game.fontSize ="140px";
      game.fontStyle ="bold";
          
  
    const buttonClick = new Sound("MenuClickSFX", "./audio/menu-click.wav", scene, null, {
      loop: false,
      autoplay: false,
    });
  
    advtex.addControl(game);
    return game;
  }
  //--------------------------END-----------------------------\\

  //---------------------Create SkyBox----------------------\\
  function createSkybox(scene: Scene) {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:550}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/grass", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.infiniteDistance = true;
	  skybox.material = skyboxMaterial;
    skybox.position.y = -10;
    return skybox;
  }
  //-------------------------END----------------------------\\

  //----------------------Hemi Light------------------------\\
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }
  //-------------------------END----------------------------\\

  //------------------------Camera--------------------------\\
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
    camera.checkCollisions = true;
    camera.collisionRadius = new Vector3(0.1, 0.1, 0.1);
    camera.attachControl(true);
    return camera;
  }
  //-------------------------END----------------------------\\
  
//----------------------------------------------------------\\
//-------------------RENDER  -  START-----------------------\\
//----------------------------------------------------------\\
  //--Imports--\\
  export default function MenuScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    
    //--GUI--\\
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
    let button1 = createSceneButton(that.scene, "but1", "Start Game", "0px", "50px", advancedTexture);
    let game1 = gameTitle(that.scene, "but1", "FITBA '24", "0", "-20%", advancedTexture);

    //--Environment--\\
    that.skybox = createSkybox(that.scene);

    //--Lighting & Camera--\\
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
//----------------------------------------------------------\\
//-------------------RENDER  -  END-------------------------\\
//----------------------------------------------------------\\