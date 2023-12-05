//----------------------------------------------------------\\
//-------------------IMPORTS  -  START----------------------\\
//----------------------------------------------------------\\
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
  } from "@babylonjs/core";
//----------------------------------------------------------\\
//-------------------IMPORTS  -  END------------------------\\
//----------------------------------------------------------\\
  

//----------------------------------------------------------\\
//-----------------FUNCTIONS  -  START----------------------\\
//----------------------------------------------------------\\

  //---------------------Create Box-------------------------\\
  function createBox(scene: Scene, px: number, py: number, pz: number, sx: number, sy: number, sz: number, rotation: boolean) {
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);
    box.position = new Vector3(px, py, pz);
    box.scaling = new Vector3(sx, sy, sz);

    //Rotation\\
    if (rotation) {
      scene.registerAfterRender(function () {
        box.rotate(new Vector3(4, 8, 2)/*axis*/, 0.02/*angle*/, Space.LOCAL);
      });
    }
    return box;
  }
  //-------------------------END----------------------------\\

  //--------------------Create FacedBox---------------------\\
  function createFacedBox(scene: Scene, px: number, py: number, pz: number) {
    //Textures\\
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://assets.babylonjs.com/environments/numbers.jpg");
    mat.diffuseTexture = texture;

    var columns = 6;
    var rows = 1;

    //Wrap\\
    const faceUV = new Array(6);

    for (let i = 0; i < 6; i++) {
        faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    }

    const options = {
        faceUV: faceUV,
        wrap: true
    };

    //Create\\
    let box = MeshBuilder.CreateBox("tiledBox", options, scene);
    box.material = mat;
    box.position = new Vector3(px, py, pz);

    //Rotate\\
    scene.registerAfterRender(function () {
        box.rotate(new Vector3(2, 6, 4)/*axis*/, 0.02/*angle*/, Space.LOCAL);
    });
    return box;
  }
  //-------------------------END----------------------------\\

  //---------------------Create Torus-----------------------\\
  function createTorus(scene: Scene, px: number, py: number, pz: number) {
    const torus = MeshBuilder.CreateTorus("torus", {});
    torus.position = new Vector3(px, py, pz);
    //Rotate\\
    scene.registerAfterRender(function () {
      torus.rotate(new Vector3(4, 8, 2)/*axis*/, 0.02/*angle*/, Space.LOCAL);
    });
    return torus;
  }
  //-------------------------END----------------------------\\

  //---------------------Create Polyhedra-------------------\\
  function createPolyhedra(scene: Scene, t: number, s: number, px: number, py: number, pz: number) {
    const polyhedra = MeshBuilder.CreatePolyhedron("shape", {type: t, size: s}, scene);
    polyhedra.position = new Vector3(px, py, pz);
    //Rotate\\
    scene.registerAfterRender(function () {
      polyhedra.rotate(new Vector3(4, 8, 2)/*axis*/, 0.02/*angle*/, Space.LOCAL);
    });
    return polyhedra;
  }
  //-------------------------END----------------------------\\

  //--------------------Create AnyLight---------------------\\
  function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
    switch (index) {
      case 1: //Hemisperic Light\\
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
        hemiLight.intensity = 0.1;
        return hemiLight;
        break;
      case 2: //Spot Light\\
        const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3, 10, scene);
        spotLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        let shadowGenerator = new ShadowGenerator(1024, spotLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return spotLight;
        break;
      case 3: //Point Light\\
        const pointLight = new PointLight("pointLight", new Vector3(px, py, pz), scene);
        pointLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        shadowGenerator = new ShadowGenerator(1024, pointLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return pointLight;
        break;
    }
  }
  //-------------------------END----------------------------\\

  //-------------------Create HemiLight---------------------\\
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.3;
    return light;
  }
  //-------------------------END----------------------------\\

  //--------------------Create Sphere-----------------------\\
  function createSphere(scene: Scene) {
    let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene );
    sphere.position.y = 1;
    return sphere;
  }
  //-------------------------END----------------------------\\

  //--------------------Create Ground-----------------------\\
  function createGround(scene: Scene, w: number, h: number, px: number) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: w, height: h },
      scene,
    );
    //Shadows\\
    ground.receiveShadows = true;
    ground.position.x = px;
    return ground;
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
    camera.attachControl(true);
    return camera;
  }
  //-------------------------END----------------------------\\

//----------------------------------------------------------\\
//-----------------FUNCTIONS  -  END------------------------\\
//----------------------------------------------------------\\
  

//----------------------------------------------------------\\
//-------------------RENDER  -  START-----------------------\\
//----------------------------------------------------------\\
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      faceBox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      sphere?: Mesh;
      torus?: Mesh;
      polyhedra?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //--Lighting & Camera--\\
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);

    //--Environment--\\
    that.ground = createGround(that.scene, 25, 10, -0.5);

    //--Content--\\
    //shape 1 and light
    that.faceBox = createFacedBox(that.scene, -10, 2, 0);
    that.light = createAnyLight(that.scene, 2, -10, 5, 0, 0.75, 0.12, 0.91, that.faceBox);

    //shape 2 and light
    that.box = createBox(that.scene, -5, 2, 0, 3, 2, 1, true);

    //shape 3 and light
    that.torus = createTorus(that.scene, 0, 2, 0);
    that.light = createAnyLight(that.scene, 2, 0, 5, 0, 0.12, 0.64, 0.86, that.torus);

    //shape 4 and light
    that.polyhedra = createPolyhedra(that.scene, 1, 1, 5, 2, 0);

    //shape 5 and light
    that.polyhedra = createPolyhedra(that.scene, 12, 1, 10, 2, 0);
    that.light = createAnyLight(that.scene, 2, 10, 5, 0, 0.24, 0.24, 0.91, that.polyhedra);

    //walls (scene, px, py, pz, sx, sy, sz)
    that.box = createBox(that.scene, -13, 2.5, 0, 0.5, 5, 9, false); //wall 
    that.box = createBox(that.scene, -8, 2.5, 0, 0.5, 5, 9, false); //wall
    that.box = createBox(that.scene, -3, 2.5, 0, 0.5, 5, 9, false); //wall 
    that.box = createBox(that.scene, 2, 2.5, 0, 0.5, 5, 9, false); //wall 
    that.box = createBox(that.scene, 7, 2.5, 0, 0.5, 5, 9, false); //wall 
    that.box = createBox(that.scene, 12, 2.5, 0, 0.5, 5, 9, false); //wall 
    
    return that;
  }
//----------------------------------------------------------\\
//-------------------RENDER  -  END-------------------------\\
//----------------------------------------------------------\\