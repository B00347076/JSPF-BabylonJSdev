//----------------------------------------------------------\\
//-------------------IMPORTS  -  START----------------------\\
//----------------------------------------------------------\\
import HavokPhysics from "@babylonjs/havok";
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
    HavokPlugin,
    PhysicsAggregate,
    PhysicsShapeType,
    Sound,
    AssetsManager,
    CascadedShadowGenerator,
    Ray
  } 
  from "@babylonjs/core";
  import * as GUI from "@babylonjs/gui";
  import setSceneIndex from ".";
  
  //-------------------Initialise Havok---------------------\\
  let initializedHavok;
  HavokPhysics().then((havok) => {initializedHavok = havok;});

  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);

  globalThis.HK = await HavokPhysics();
  //-------------------------END----------------------------\\

//----------------------------------------------------------\\
//-------------------IMPORTS  -  END------------------------\\
//----------------------------------------------------------\\
  

//----------------------------------------------------------\\
//-----------------FUNCTIONS  -  START----------------------\\
//----------------------------------------------------------\\

  let keyDownMap: any[] = [];
  let currentSpeed: number = 0.1;
  let walkingSpeed: number = 0.1;
  let runningSpeed: number = 0.4;
  
  //-----------------Footballer Mesh-----------------------\\
  function importFootballerMesh(scene: Scene, collider: Mesh, x: number, y: number, z: number, colX: number, colY: number, colZ: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups) {
    let mesh = newMeshes[0];
    let skeleton = skeletons[0];
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true;
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    skeleton.animationPropertiesOverride.loopMode = 1; 
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = y;
    
    const myMaterial = new StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = new Color3(colX,colY,colZ);
    mesh.material = myMaterial;
    myMaterial.maxSimultaneousLights = 10;
    
    scene.beginAnimation(skeletons[0], 90, 0, true, 1.2);
    
    let playerAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
    playerAggregate.body.disablePreStep = false;
    
    });
    
    return item;
  }
  //-------------------------END----------------------------\\

  //--------------------Player Mesh-------------------------\\
  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number, z: number, colX: number, colY: number, colZ: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups) {
    let mesh = newMeshes[0];
    let skeleton = skeletons[0];
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true;
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    skeleton.animationPropertiesOverride.loopMode = 1; 
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = y;

    const myMaterial = new StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = new Color3(colX,colY,colZ);
    mesh.material = myMaterial;
    myMaterial.maxSimultaneousLights = 10;
    
    let idleRange: any = skeleton.getAnimationRange("YBot_Idle");
    let walkRange: any = skeleton.getAnimationRange("YBot_Run");
    //let runRange: any = skeleton.getAnimationRange("YBot_Run");
    //let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
    //let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");

    //--Player Speed & Rotation--\\
    let speed: number = 0.08;
    let speedBackward: number = 0.05;
    let rotationSpeed = 0.05;

    //--Animation Variables--\\
    let idleAnim: any;
    let walkAnim: any;
    let animating: boolean = true;

    //Key Mapping\\
    scene.onBeforeRenderObservable.add(()=> {
    let keydown: boolean = false;
    if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
      mesh.moveWithCollisions(mesh.forward.scaleInPlace(speed));                
      keydown = true;
    }
    if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
      mesh.rotate(Vector3.Up(), -rotationSpeed);
      keydown = true;
    }
    if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
      mesh.moveWithCollisions(mesh.forward.scaleInPlace(-speedBackward));
      keydown = true;
    }
    if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
      mesh.rotate(Vector3.Up(), rotationSpeed);
      keydown = true;
    }

    let isPlaying: boolean = false;
    if (keydown && !isPlaying) {
      if (!animating) {
          idleAnim = scene.stopAnimation(skeleton);
          walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
          animating = true;
      }
      if (animating) {
        isPlaying = true;
      }
     } else {
      if (animating && !keydown) {
        walkAnim = scene.stopAnimation(skeleton);
        idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
        animating = false;
        isPlaying = false;
      }
    }

    //--Collision Detection--\\
    if (mesh.intersectsMesh(collider)) {
      console.log("COLLIDED"); }
    });

    item = mesh;
    let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
    playerAggregate.body.disablePreStep = false;
    
    });
    
    return item;
  }
  //-------------------------END----------------------------\\

  //--------------------Action Manager----------------------\\
  function actionManager(scene: Scene){
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyDownTrigger,
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
      )
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
      )
    );
    return scene.actionManager;
  } 
  //-------------------------END----------------------------\\

  //---------------------Create Sphere-----------------------\\
  function createSphere(scene: Scene, x: number, y: number, z: number) {
    let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.5, segments: 32 }, scene );
    const myMaterial = new StandardMaterial("myMaterial", scene);
    myMaterial.diffuseTexture = new Texture("textures/ball.jpg", scene);
    myMaterial.maxSimultaneousLights = 6;
    sphere.material = myMaterial;
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
    return sphere;
  }
  //-------------------------END----------------------------\\

  //------------------Create Side Boards--------------------\\
  function sideBoards(scene: Scene, x: number, y: number, z: number) {
    let box: Mesh = MeshBuilder.CreateBox("box", {height: 1.2, width: 50, depth: 0.2, updatable: true});
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0}, scene);
    return box;
  }
  //-------------------------END----------------------------\\

  //------------------Create End Boards---------------------\\
  function endBoards(scene: Scene, x: number, y: number, z: number) {
    let box: Mesh = MeshBuilder.CreateBox("box", {height: 1.2, width: 0.2, depth: 33, updatable: true});
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0}, scene);
    return box;
  }
  //-------------------------END----------------------------\\

  //--------------------Create flags------------------------\\
  function flags(scene: Scene, x: number, y: number, z: number) {
    let flag: Mesh = MeshBuilder.CreateBox("box", {height: 2, width: 0.1, depth: 0.1, updatable: true});
    flag.position.x = x;
    flag.position.y = y;
    flag.position.z = z;
    const boxAggregate = new PhysicsAggregate(flag, PhysicsShapeType.BOX, { mass: 0}, scene);
    return flag;
  }
  //-------------------------END----------------------------\\

  //------------------Create Crossbars----------------------\\
  function crossbars(scene: Scene) {
    let crossbar: Mesh = MeshBuilder.CreateBox("box", {height: 0.2, width: 0.2, depth: 9.2, updatable: true});
    crossbar.position.x = 0;
    crossbar.position.y = 3;
    crossbar.position.z = 0;
    const boxAggregate = new PhysicsAggregate(crossbar, PhysicsShapeType.BOX, { mass: 0}, scene);
    return crossbar;
  }
  //-------------------------END----------------------------\\

  //------------------Create Uprights-----------------------\\
  function uprights(scene: Scene, z :number) {
    let upright: Mesh = MeshBuilder.CreateBox("box", {height: 3, width: 0.2, depth: 0.2, updatable: true});
    upright.position.y = 1.5;
    upright.position.z = z;
    const boxAggregate = new PhysicsAggregate(upright, PhysicsShapeType.BOX, { mass: 0}, scene);
    return upright;
  }
  //-------------------------END----------------------------\\

  //--------------------Create Goals------------------------\\
  function createGoal(scene: Scene, x: number, y: number, z: number) {
    const crossbar = crossbars(scene);
    const upright1 = uprights(scene, -4.5);
    const upright2 = uprights(scene, 4.5);
    const goal: any = Mesh.MergeMeshes([crossbar, upright1, upright2], true, false, undefined, false, true);
    goal.position.x = x;
    goal.position.y = y;
    goal.position.z = z;
    return goal; 
  }
  //-------------------------END----------------------------\\

  //------------------Floodlight Pole-----------------------\\
  function floodPole(scene: Scene) {
    let pole: Mesh = MeshBuilder.CreateBox("box", {height: 10, width: 0.4, depth: 0.4, updatable: true});
    pole.position.y = 5;
    return pole;
  }
  //-------------------------END----------------------------\\

  //------------------Floodlight Lamp-----------------------\\
  function floodLamp(scene: Scene) {
    let lamp: Mesh = MeshBuilder.CreateBox("box", {height: 0.3, width: 4, depth: 3, updatable: true});
    lamp.position.y = 11;
    lamp.position.z = -1;
    lamp.rotation.x = 1;
    return lamp;
  }
  //-------------------------END----------------------------\\

  //------------------Floodlight Base-----------------------\\
  function floodBase(scene: Scene) {
    let base: Mesh = MeshBuilder.CreateBox("box", {height: 0.3, width: 1, depth: 1, updatable: true});
    base.position.y = 0;
    return base;
  }
  //-------------------------END---------------------------\\

  //-------------------Create Floodlight--------------------\\
  function floodLight(scene: Scene, x: number, y: number, z: number, a: number) {
    const pole = floodPole(scene);
    const lamp = floodLamp(scene);
    const base = floodBase(scene);
    const floodlight: any = Mesh.MergeMeshes([pole, lamp, base], true, false, undefined, false, true);
    floodlight.position.x = x;
    floodlight.position.y = y;
    floodlight.position.z = z;
    floodlight.rotation.y = a;
    return floodlight; 
  }
  //-------------------------END----------------------------\\

  //----------------------Stand Box-------------------------\\
  function standBox(scene: Scene, width: number) {
    let box: Mesh = MeshBuilder.CreateBox("box", {height: 8, depth: 5, updatable: true});
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1}, scene);
    box.scaling.x = width;
    return box;
  }
  //-------------------------END----------------------------\\
  
  //---------------------Stand Roof-------------------------\\
  function standRoof(scene: Scene, width: number) {
    const roofMat = new StandardMaterial("roofMat");
    roofMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roofMat.maxSimultaneousLights = 5;
    const roof = MeshBuilder.CreateCylinder("roof", {diameter: 13, height: 1.3, tessellation: 3});
    roof.material = roofMat;
    roof.scaling.x = 0.3;
    roof.scaling.y = width;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 4.5;
    roof.position.z = -2;
    return roof; 
  }
  //-------------------------END----------------------------\\

  //---------------------Stand Crowd------------------------\\
  function standCrowd(scene: Scene, width: number) {
    const crowdMat = new StandardMaterial("crowdMat");
    crowdMat.diffuseTexture = new Texture("textures/crowd.jpg")
    crowdMat.maxSimultaneousLights = 5;
    let crowd: Mesh = MeshBuilder.CreateBox("crowd", {height: 8, depth: 3, updatable: true});
    crowd.material = crowdMat;
    crowd.position.y = -0.5;
    crowd.position.z = -4;
    crowd.rotation.x = 0.6;
    crowd.scaling.x = width;
    return crowd; 
  }
  //-------------------------END----------------------------\\
  
  //--------------------Create Stand------------------------\\
  function createStand(scene: Scene, width: number, x: number, y: number, z: number, a: number) {
    const box = standBox(scene, width);
    const roof = standRoof(scene, width);
    const crowd = standCrowd(scene, width);
    const stand: any = Mesh.MergeMeshes([box, roof, crowd], true, false, undefined, false, true);
    stand.position.x = x;
    stand.position.y = y;
    stand.position.z = z;
    stand.rotation.y = a;
    return stand; 
  }
  //-------------------------END----------------------------\\

  //--------------------Create Pitch------------------------\\
  function createPitch(scene: Scene) {
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("textures/pitch.jpg");
    groundMat.maxSimultaneousLights = 10;
    groundMat.reflectionTexture = null;
    const pitch: Mesh = MeshBuilder.CreateGround("ground", {height: 33, width: 50, subdivisions: 4});
    pitch.material = groundMat;
    pitch.position.y = 0;
    pitch.receiveShadows = true;

    const groundAggregate = new PhysicsAggregate(pitch, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return pitch;
  }
  //-------------------------END----------------------------\\

  //-------------------Create Terrain-----------------------\\
  function createTerrain(scene: Scene) {
    const largeGroundMat = new StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png");
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "textures/villageheightmap.png", {width:250, height:250, subdivisions: 20, minHeight:0, maxHeight: 15});
    largeGround.material = largeGroundMat;
    largeGround.position.y = -0.1;
    largeGround.receiveShadows = true;
    return largeGround; 
  }
  //-------------------------END----------------------------\\

  //---------------------Create SkyBox----------------------\\
  function createSkybox(scene: Scene) {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:550}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.infiniteDistance = true;
	  skybox.material = skyboxMaterial;
    skybox.position.y = 20;
    return skybox;
  }
  //-------------------------END----------------------------\\

  //--------------------Create HemiLight--------------------\\
  function createDayLight(scene: Scene) {
    const day = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    day.intensity = 0.2;
    const adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const panel = new GUI.StackPanel();
    panel.width = "220px";
    panel.top = "50px";
    panel.left = "-660px";
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    adt.addControl(panel);

    const header = new GUI.TextBlock();
    header.text = "Night to Day";
    header.height = "30px";
    header.color = "white";
    panel.addControl(header); 

    const slider = new GUI.Slider();
      slider.minimum = 0;
      slider.maximum = 1;
      slider.borderColor = "black";
      slider.color = "gray";
      slider.background = "white";
      slider.value = 1;
      slider.height = "20px";
      slider.width = "200px";
      slider.onValueChangedObservable.add((value) => {
      if (day) {
          day.intensity = value;
      }
  });
  panel.addControl(slider);
    return day;
  }
  //-------------------------END----------------------------\\

  //--------------------Flood Lighting----------------------\\
  function createPointLight(scene: Scene, px: number, py: number, pz: number, mesh: Mesh, mesh2: Mesh, mesh3: Mesh, mesh4: Mesh, mesh5: Mesh, mesh6: Mesh, mesh7: Mesh, mesh8: Mesh, mesh9: Mesh, mesh10: Mesh, mesh11: Mesh, mesh12: Mesh, mesh13: Mesh, mesh14: Mesh, mesh15: Mesh) {
    const point = new PointLight("pointLight", new Vector3(px, py, pz), scene);
    point.intensity = 0.5;
    let shadowGenerator = new ShadowGenerator(1024, point);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.addShadowCaster(mesh2);
        shadowGenerator.addShadowCaster(mesh3);
        shadowGenerator.addShadowCaster(mesh4);
        shadowGenerator.addShadowCaster(mesh5);
        shadowGenerator.addShadowCaster(mesh6);
        shadowGenerator.addShadowCaster(mesh7);
        shadowGenerator.addShadowCaster(mesh8);
        shadowGenerator.addShadowCaster(mesh9);
        shadowGenerator.addShadowCaster(mesh10);
        shadowGenerator.addShadowCaster(mesh11);
        shadowGenerator.addShadowCaster(mesh12);
        shadowGenerator.addShadowCaster(mesh13);
        shadowGenerator.addShadowCaster(mesh14);
        shadowGenerator.addShadowCaster(mesh15);
        shadowGenerator.useExponentialShadowMap = true;
    return point;
  }
  //-------------------------END----------------------------\\

  //------------------------Camera--------------------------\\
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 25,
      camTarget = new Vector3(0, 1, 0);
    let camera = new ArcRotateCamera("camera1", camAlpha, camBeta, camDist, camTarget, scene);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit =  150;
    camera.upperBetaLimit =  Math.PI /2 -0.1;
    camera.checkCollisions = true;
    camera.collisionRadius = new Vector3(0.1, 0.1, 0.1);
    camera.attachControl(true);
    return camera;
  }
  //-------------------------END----------------------------\\

  //----------------------Menu Button-----------------------\\
  function createSceneButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
    let button = GUI.Button.CreateSimpleButton(name, index);
      button.left = x;
      button.top = y;
      button.width = "100px";
      button.height = "40px";
      button.color = "white";
      button.cornerRadius = 20;
      button.background = "rgba(255, 0, 0, 0.3)";
        
      const buttonClick = new Sound("MenuClickSFX", "./audio/whistle.wav", scene, null, {
        loop: false,
        autoplay: false,
      });

      button.onPointerUpObservable.add(function() {
        console.log("THE BUTTON HAS BEEN CLICKED");
        buttonClick.play();
        setSceneIndex(0);
      });

    advtex.addControl(button);
    return button;
  }
  //-------------------------END--------------------------\\

  //--------------------Score Board-----------------------\\
  function createScoreBoard(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
    let score = GUI.Button.CreateSimpleButton(name, index);
      score.left = x;
      score.top = y;
      score.width = "300px";
      score.height = "100px";
      score.color = "white";
      score.cornerRadius = 30;
      score.background = "rgba(0, 0, 0, 0.3)";
      score.fontSize ="90px";
      score.fontStyle ="bold";
  
    advtex.addControl(score);
    return score;
  }
  //------------------------END-----------------------------\\

//----------------------------------------------------------\\
//-----------------FUNCTIONS  -  END------------------------\\
//----------------------------------------------------------\\
  

//----------------------------------------------------------\\
//-------------------RENDER  -  START-----------------------\\
//----------------------------------------------------------\\

  export default function createStartScene(engine: Engine) {

    //--Element Types--\\
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      sphere?: Mesh;
      faceBox?: Mesh;
      stand?: any;
      stand2?: any;
      stand3?: any;
      stand4?: any;
      roof?: any;
      pitch?: Mesh;
      crowdaudio?: Sound;
      crowd?: Mesh;
      stadium?: Mesh;
      terrain?: Mesh;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      day?: Light;
      floodlight1?: any;
      floodlight2?: any;
      floodlight3?: any;
      floodlight4?: any;
      spotLight?: SpotLight;
      point?: PointLight;
      spotlight?: SpotLight;
      directLight?: DirectionalLight;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      importMesh?: Mesh;
      footballer?: any;
      goal1?: any;
      goal2?: any;
      flag1?: any;
      flag2?: any;
      flag3?: any;
      flag4?: any;
    }
  
    let that: SceneData = { scene: new Scene(engine) };

    //--GUI--\\
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
    let button1 = createSceneButton(that.scene, "but1", "Exit", "0", "45%", advancedTexture);
    let score1 = createScoreBoard(that.scene, "but1", "0 - 0", "0", "-45%", advancedTexture);

    //--Debug--\\
    //that.scene.debugLayer.show();

    //--Environment--\\
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    that.skybox = createSkybox(that.scene);
    that.terrain = createTerrain(that.scene);

    //--Stadium--\\
    that.stand = createStand(that.scene, 50, 0, 2.5, 28, 0);
    that.stand2 = createStand(that.scene, 50, 0, 2.5, -28, 3.15);
    that.stand3 = createStand(that.scene, 30, 38, 2.5, 0, 1.55);
    that.stand4 = createStand(that.scene, 30, -38, 2.5, 0, -1.55);
    that.pitch = createPitch(that.scene);
    that.box = sideBoards(that.scene, 0.1, 0, 16.5);
    that.box = sideBoards(that.scene, 0.1, 0, -16.5);
    that.box = endBoards(that.scene, 25, 0, 0);
    that.box = endBoards(that.scene, -25, 0, 0); 
    that.flag1 = flags(that.scene, 23, 1, 15);
    that.flag2 = flags(that.scene, 23, 1, -15);
    that.flag3 = flags(that.scene, -23, 1, 15);
    that.flag4 = flags(that.scene, -23, 1, -15);
    that.goal1 = createGoal(that.scene, -23,0,0)
    that.goal2 = createGoal(that.scene, 23,0,0)
    that.floodlight1 = floodLight(that.scene, -28,0,18,-0.9);
    that.floodlight2 = floodLight(that.scene, -28,0,-18,-2.1);
    that.floodlight3 = floodLight(that.scene, 28,0,18,0.9);
    that.floodlight4 = floodLight(that.scene, 28,0,-18,2.1);

    //--Ball--\\
    that.sphere = createSphere(that.scene, 0, 0, 0);

    
    //--Player--\\
    that.importMesh = importPlayerMesh(that.scene, that.sphere, 1.5, -1.5, 0, 0, 0, 1);
    that.actionManager = actionManager(that.scene);

    //Home Team\\
    that.footballer = importFootballerMesh(that.scene, that.sphere, 2, -1.5, 10, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 2, -1.5, -10, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 5.5, -1.5, 0, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 10.5, -1.5, 6, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 10.5, -1.5, -6, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 16, -1.5, 3, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 16, -1.5, -3, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 17, -1.5, 12, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 17, -1.5, -12, 0, 0, 1);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, 22, -1.5, 0, 0, 1, 0);
    
    //Away Team\\
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -1.5, 1.5, 0, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -5.5, 1.5, 0, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -2, 1.5, 10, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -2, 1.5, -10, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -10.5, 1.5, 6, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -10.5, 1.5, -6, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -16, 1.5, 3, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -16, 1.5, -3, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -17, 1.5, 12, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -17, 1.5, -12, 1, 0, 0);
    that.importMesh = importFootballerMesh(that.scene, that.sphere, -22, 1.5, 0, 0, 1, 0);


    //--Lighting & Camera--\\
    that.day = createDayLight(that.scene);
    that.point = createPointLight(that.scene, 26, 8, 16, that.stand, that.stand2, that.stand3, that.stand4, that.goal1, that.goal2, that.sphere, that.flag1, that.flag2, that.flag3, that.flag4, that.floodlight1, that.floodlight2, that.floodlight3, that.floodlight4);
    that.point = createPointLight(that.scene, 26, 8, -16, that.stand, that.stand2, that.stand3, that.stand4, that.goal1, that.goal2, that.sphere, that.flag1, that.flag2, that.flag3, that.flag4, that.floodlight1, that.floodlight2, that.floodlight3, that.floodlight4);
    that.point = createPointLight(that.scene, -26, 8, 16, that.stand, that.stand2, that.stand3, that.stand4, that.goal1, that.goal2, that.sphere, that.flag1, that.flag2, that.flag3, that.flag4, that.floodlight1, that.floodlight2, that.floodlight3, that.floodlight4);
    that.point = createPointLight(that.scene, -26, 8, -16, that.stand, that.stand2, that.stand3, that.stand4, that.goal1, that.goal2, that.sphere, that.flag1, that.flag2, that.flag3, that.flag4, that.floodlight1, that.floodlight2, that.floodlight3, that.floodlight4);
    that.camera = createArcRotateCamera(that.scene);
    
    //--Crowd Audio--\\
    let crowdnoise = new Sound("Crowd", "audio/crowd.wav", that.scene, null, { loop: true, autoplay: true });

    return that;
  }
//----------------------------------------------------------\\
//-------------------RENDER  -  END-------------------------\\
//----------------------------------------------------------\\