// for each easing function, you can choose between EASEIN (default), EASEOUT, EASEINOUT
var easingFunction = new BABYLON.SineEase();
easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

var scene;

/**
 * 
 * @param {*} parameter is the target parameter for animation
 * @param {string} animValue is the property to animate
 * @param {*} animKeys list of the keys for the animation
 * @param {boolean} animLooping should this animation loop 
 * @param {boolean} useEasing should this animation use easing
 * @param {boolean} linkAnimation should another animation be played when the first finishes
 * @param {*} linkParameter is the target parameter for linked animation
 * @param {string} linkAnimValue is the linked property to animate
 * @param {*} linkAnimKeys list of keys for following animation
 * @param {boolean} linkAnimLooping should the following animation loop
 * @param {boolean} linkUseEasing should the following animation use easing
 */
function playAnimation(parameter, animValue, animKeys, animLooping, useEasing, linkAnimation, linkParameter, linkAnimValue, linkAnimKeys, linkAnimLooping, linkUseEasing) {

    // create animation clips
    var linkParamAnim = null;
    var paramAnim = new BABYLON.Animation("paramAnim", animValue, 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    if (linkAnimation) {
        linkParamAnim = new BABYLON.Animation("linkParamAnim", linkAnimValue, 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    }

    // set up easing
    if (useEasing) {
        paramAnim.setEasingFunction(easingFunction);
    }
    if (linkAnimation && linkUseEasing) {
        linkParamAnim.setEasingFunction(easingFunction);
    }

    // create animation
    scene.stopAnimation(parameter);
    if (linkAnimation) {
        paramAnim.setKeys(animKeys);
        linkParamAnim.setKeys(linkAnimKeys);
        scene.beginDirectAnimation(parameter, [paramAnim], 0, animKeys[animKeys.length - 1].frame, animLooping, 1, function() {
            scene.stopAnimation(linkParameter);
            scene.beginDirectAnimation(linkParameter, [linkParamAnim], 0, linkAnimKeys[linkAnimKeys.length - 1].frame, linkAnimLooping, 1);
        });
    } else {
        paramAnim.setKeys(animKeys);
        scene.beginDirectAnimation(parameter, [paramAnim], 0, animKeys[animKeys.length - 1].frame, animLooping, 1);
    }
}

// create scene
var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    scene = new BABYLON.Scene(engine);

    // async loading list
    var promises = [];

    // create and position arc-rotate camera
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", BABYLON.Tools.ToRadians(-270), Math.PI/2, 90, new BABYLON.Vector3(0,0,0), scene);

    // camera controls
    var cameraControl = false;
    scene.onKeyboardObservable.add(evt => {
        if (evt.type !== BABYLON.KeyboardEventTypes.KEYDOWN) {
            return;
        }
        if (evt.event.keyCode === 67) { // c key to switch between camera rotation and object rotation
            cameraControl = !cameraControl;

            if (cameraControl) {
                camera.attachControl(canvas, true);
            } else {
                camera.detachControl(canvas);
            }
        }        
    });
    
    // clear color
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // create light
    var dirLight1 = new BABYLON.DirectionalLight("dirLight1", new BABYLON.Vector3(0, 0, 0), scene);
    dirLight1.direction = new BABYLON.Vector3(-0.5, 0.38, 0.67);
    dirLight1.position = camera.position;
    dirLight1.parent = camera;

    var daggerMagicActive = false;
    var swordMagicActive = false;
    var axeMagicActive = false;

    // create node materials
    var daggerHandleMat = new BABYLON.NodeMaterial("daggerHandleMat", scene, { emitComments: false });
    var daggerGemMat = new BABYLON.NodeMaterial("daggerGemMat", scene, { emitComments: false });
    var daggerBladeMat = new BABYLON.NodeMaterial("daggerBladeMat", scene, { emitComments: false });

    var swordHiltMat = new BABYLON.NodeMaterial("swordHiltMat", scene, { emitComments: false });
    var swordHandleGemMat = new BABYLON.NodeMaterial("swordHandleGemMat", scene, { emitComments: false });
    var swordGuardGemsMat = new BABYLON.NodeMaterial("swordGuardGemsMat", scene, { emitComments: false });
    var swordBladeMat = new BABYLON.NodeMaterial("swordBladeMat", scene, { emitComments: false });

    var axeMat = new BABYLON.NodeMaterial("axeMat", scene, {emitComments: false});
    var axeIceMat = new BABYLON.NodeMaterial("axeIceMat", scene, {emitComments: false});

    // load assets 
    promises.push(BABYLON.SceneLoader.AppendAsync("https://models.babylonjs.com/Demos/weaponsDemo/meshes/moltenDagger.glb"));
    promises.push(BABYLON.SceneLoader.AppendAsync("https://models.babylonjs.com/Demos/weaponsDemo/meshes/runeSword.glb"));
    promises.push(BABYLON.SceneLoader.AppendAsync("https://models.babylonjs.com/Demos/weaponsDemo/meshes/frostAxe.glb"));
    promises.push(daggerHandleMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/daggerHandleMat.json"));
    promises.push(daggerBladeMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/daggerBladeMat.json"));
    promises.push(daggerGemMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/daggerGemMat.json"));
    promises.push(swordBladeMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/swordBladeMat.json"));
    promises.push(swordGuardGemsMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/swordGuardGemsMat.json"));
    promises.push(swordHandleGemMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/swordHandleGemMat.json"));
    promises.push(swordHiltMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/swordHiltMat.json"));
    promises.push(axeMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/axeMat.json"));
    promises.push(axeIceMat.loadAsync("https://models.babylonjs.com/Demos/weaponsDemo/shaders/axeIceMat.json"));

    // callback when assets are loaded
    Promise.all(promises).then(function() {

        // scene position meshes
        var weaponsParent = new BABYLON.AbstractMesh("weaponsParent", scene);
        weaponsParent.position = new BABYLON.Vector3(0, 0, 0);
        var activeWeapon = "dagger";

         // dagger mesh
        const daggerHandle = scene.getMeshByName("daggerHandle_low");
        const daggerBlade = scene.getMeshByName("daggerBlade_low");
        const daggerGem = scene.getMeshByName("daggerGem_low");
        const daggerParent = daggerHandle.parent;
        daggerParent.parent = weaponsParent;

        // sword mesh
        const swordHilt = scene.getMeshByName("swordHilt_low");
        const swordBlade = scene.getMeshByName("swordBlade_low");
        const swordGuardGems = scene.getMeshByName("swordGuardGems_low");
        const swordHandleGem = scene.getMeshByName("swordHandleGem_low");
        const swordParent = swordHilt.parent;
        swordParent.position = new BABYLON.Vector3(400, 0, 0);
        swordParent.scaling = new BABYLON.Vector3(100, 100, 100);
        swordParent.parent = weaponsParent;

        // axe mesh
        const axe = scene.getMeshByName("frostAxe_low");
        const axeIce = scene.getMeshByName("frostAxeIce_low");
        const axeParent = axe.parent;
        axeParent.position = new BABYLON.Vector3(800, 0, 0);
        axeParent.scaling = new BABYLON.Vector3(100, 100, 100);
        axeParent.parent = weaponsParent;
        var freezeMorph = axeIce.morphTargetManager.getTarget(0);
        var iceBladeMorph = axeIce.morphTargetManager.getTarget(1);
        freezeMorph.influence = 1.0;
        iceBladeMorph.influence = 1.0;

        // active mesh
        var focusedMesh = daggerParent;

        // build and assign node materials
        daggerHandleMat.build(false);
        daggerHandle.material = daggerHandleMat;

        daggerBladeMat.build(false);
        daggerBlade.material = daggerBladeMat;

        daggerGemMat.build(false);
        daggerGem.material = daggerGemMat;

        swordBladeMat.build(false);
        swordBlade.material = swordBladeMat;

        swordGuardGemsMat.build(false);
        swordGuardGems.material = swordGuardGemsMat;

        swordHandleGemMat.build(false);
        swordHandleGem.material = swordHandleGemMat;

        swordHiltMat.build(false);
        swordHilt.material = swordHiltMat;

        axeMat.build(false);
        axe.material = axeMat;

        axeIceMat.build(false);
        axeIce.material = axeIceMat;
        
        // textures
        const daggerDiffuseTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/moltenDagger_diffuse.png", scene, false, false);
        const daggerSpecularTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/moltenDagger_specular.png", scene, false, false);
        const daggerGlossTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/moltenDagger_gloss.png", scene, false, false);
        const daggerEmissiveTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/moltenDagger_emissive.png", scene, false, false);
        const daggerMaskTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/moltenDagger_mask.png", scene, false, false);
        const swordDiffuseTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/runeSword_diffuse.png", scene, false, false);
        const swordSpecularTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/runeSword_specular.png", scene, false, false);
        const swordGlossTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/runeSword_gloss.png", scene, false, false);
        const swordEmissiveTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/runeSword_emissive.png", scene, false, false);
        const swordHandleGemNormalTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/swordHandleGem_normal.png", scene, false, false);
        const swordHandleGemPositionTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/swordHandleGem_position.png", scene, false, false);
        const axeDiffuseTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/frostAxe_diffuse.png", scene, false, false);
        const axeSpecularTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/frostAxe_specular.png", scene, false, false);
        const axeGlossTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/frostAxe_gloss.png", scene, false, false);
        const axeMaskTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/frostAxe_masks.png", scene, false, false);
        const axeEmissiveTex = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/frostAxe_emissive.png", scene, false, false);

        // get shader parameters
        var daggerBladeDiffuse = daggerBladeMat.getBlockByName("diffuseTexture");
        var daggerBladeSpecular = daggerBladeMat.getBlockByName("specularTexture");
        var daggerBladeGloss = daggerBladeMat.getBlockByName("glossTexture");
        var daggerBladeEmissive = daggerBladeMat.getBlockByName("emissiveTexture");
        var daggerBladeMask = daggerBladeMat.getBlockByName("maskTexture");
        var daggerBladeAnim = daggerBladeMat.getBlockByName("animTexture");
        var daggerHandleDiffuse = daggerHandleMat.getBlockByName("diffuseTexture");
        var daggerHandleSpecular = daggerHandleMat.getBlockByName("specularTexture");
        var daggerHandleGloss = daggerHandleMat.getBlockByName("glossTexture");
        var daggerGemEmissive = daggerGemMat.getBlockByName("emissiveTexture");
        var swordBladeDiffuse = swordBladeMat.getBlockByName("diffuseTexture");
        var swordBladeSpecular = swordBladeMat.getBlockByName("specularTexture");
        var swordBladeGloss = swordBladeMat.getBlockByName("glossTexture");
        var swordBladeEmissive = swordBladeMat.getBlockByName("emissiveTexture");
        var swordHandleGemNormal = swordHandleGemMat.getBlockByName("normalTexture");
        var swordHandleGemPosition = swordHandleGemMat.getBlockByName("positionTexture");
        var swordHiltDiffuse = swordHiltMat.getBlockByName("diffuseTexture");
        var swordHiltSpecular = swordHiltMat.getBlockByName("specularTexture");
        var swordHiltGloss = swordHiltMat.getBlockByName("glossTexture");
        var swordGuardGemsEmissive = swordGuardGemsMat.getBlockByName("emissiveTexture"); 
        var axeDiffuse = axeMat.getBlockByName("diffuseTexture"); 
        var axeSpecular = axeMat.getBlockByName("specularTexture"); 
        var axeGloss = axeMat.getBlockByName("glossTexture"); 
        var axeIceDiffuse = axeIceMat.getBlockByName("diffuseTexture"); 
        var axeIceSpecular = axeIceMat.getBlockByName("specularTexture"); 
        var axeIceGloss = axeIceMat.getBlockByName("glossTexture"); 
        var axeMask = axeMat.getBlockByName("axeMaskTexture");
        var axeEmissive = axeMat.getBlockByName("emissiveTexture");
        var axeIceMask = axeIceMat.getBlockByName("axeMasksTexture");

        // assign textures
        daggerBladeDiffuse.texture = daggerDiffuseTex;
        daggerBladeSpecular.texture = daggerSpecularTex;
        daggerBladeGloss.texture = daggerGlossTex;
        daggerBladeEmissive.texture = daggerEmissiveTex;
        daggerBladeMask.texture = daggerMaskTex;
        daggerBladeAnim.texture = daggerMaskTex;
        daggerHandleDiffuse.texture = daggerDiffuseTex;
        daggerHandleSpecular.texture = daggerSpecularTex;
        daggerHandleGloss.texture = daggerGlossTex;
        daggerGemEmissive.texture = daggerEmissiveTex;
        swordBladeDiffuse.texture = swordDiffuseTex;
        swordBladeSpecular.texture = swordSpecularTex;
        swordBladeGloss.texture = swordGlossTex;
        swordBladeEmissive.texture = swordEmissiveTex;
        swordHandleGemNormal.texture = swordHandleGemNormalTex;
        swordHandleGemPosition.texture = swordHandleGemPositionTex;
        swordHiltDiffuse.texture = swordDiffuseTex;
        swordHiltSpecular.texture = swordSpecularTex;
        swordHiltGloss.texture = swordGlossTex;
        swordGuardGemsEmissive.texture = swordEmissiveTex;
        axeDiffuse.texture = axeDiffuseTex;
        axeSpecular.texture = axeSpecularTex;
        axeGloss.texture = axeGlossTex;
        axeIceDiffuse.texture = axeDiffuseTex;
        axeIceSpecular.texture = axeSpecularTex;
        axeIceGloss.texture = axeGlossTex;
        axeMask.texture = axeMaskTex;
        axeEmissive.texture = axeEmissiveTex;
        axeIceMask.texture = axeMaskTex;

        // glow parameters
        var daggerBladeGlowMask = daggerBladeMat.getBlockByName("glowMask");
        var daggerGemGlowMask = daggerGemMat.getBlockByName("glowMask");
        var swordHandleGemGlowMask = swordHandleGemMat.getBlockByName("glowMask");
        var swordBladeGlowMask = swordBladeMat.getBlockByName("glowMask");
        var swordGuardGemsGlowMask = swordGuardGemsMat.getBlockByName("glowMask");
        var axeGlowMask = axeMat.getBlockByName("glowMask");
        var swordBladeReverseWipe = swordBladeMat.getBlockByName("reverseWipe");

        // mesh parameter objects
        var sceneAnimParameters = {
            "animationTarget": weaponsParent,
            "daggerRadius": "0.9",
            "swordRadius": "2",
            "axeRadius": "1.25",
            "toDagger": [
                {frame: 0, value: 0},
                {frame: 90, value: 0}
            ],
            "toSword": [
                {frame: 0, value: 0},
                {frame: 90, value: -400}
            ],
            "toAxe": [
                {frame: 0, value: 0},
                {frame: 90, value: -800}
            ],
            "zoomDagger": [
                {frame: 0, value: 0},
                {frame: 90, value: 90}
            ],
            "zoomSword": [
                {frame: 0, value: 0},
                {frame: 90, value: 220}
            ],
            "zoomAxe": [
                {frame: 0, value: 0},
                {frame: 90, value: 120}
            ]
        };

        var daggerGemParams = {
            "emissiveParam": daggerGemMat.getBlockByName("emissiveStrength"),
            "glowStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 90, value: 1.0}
            ],
            "glowFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 120, value: 0.0}
            ]
        };

        var daggerBladeParams = {
            "emissiveParam": daggerBladeMat.getBlockByName("emissiveStrength"),
            "heatLevelParam": daggerBladeMat.getBlockByName("heatLevel"),
            "charLevelParam": daggerBladeMat.getBlockByName("charLevel"),
            "uOffsetParam": daggerBladeMat.getBlockByName("uOffset"),
            "flickerStrengthParam": daggerBladeMat.getBlockByName("flickerStrength"),
            "glowStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 20, value: 0.0},
                {frame: 90, value: 1.0}
            ],
            "glowLoopKeys": [
                {frame: 0, value: 1.0},
                {frame: 70, value: 0.75},
                {frame: 140, value: 1.0}
            ],
            "glowFinishKeys": [
                {frame: 0, value: 0.75},
                {frame: 90, value: 0.0}
            ],
            "heatStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 40, value: 0.0},
                {frame: 160, value: 0.67}
            ],
            "heatFinishKeys": [
                {frame: 0, value: 0.67},
                {frame: 40, value: 0.67},
                {frame: 160, value: 0.0}
            ],
            "charStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 80, value: 0.0},
                {frame: 160, value: 1.0}
            ],
            "charFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 60, value: 1.0},
                {frame: 160, value: 0.0}
            ],
            "animStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 180, value: 1.0}
            ],
            "animStopKeys": [
                {frame: 0, value: 0.0},
                {frame: 10, value: 0.0}
            ],
            "flickerStrengthStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 40, value: 0.0},
                {frame: 160, value: 0.65}
            ],
            "flickerStrengthFinishKeys": [
                {frame: 0, value: 0.65},
                {frame: 40, value: 0.65},
                {frame: 160, value: 0.0}
            ]
        };

        var swordHandleGemParams = {
            "emissiveParam": swordHandleGemMat.getBlockByName("emissiveStrength"),
            "glowStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 90, value: 0.9}
            ],
            "glowLoopKeys": [
                {frame: 0, value: 0.9},
                {frame: 70, value: 0.3},
                {frame: 140, value: 0.9}
            ],
            "glowFinishKeys": [
                {frame: 0, value: 0.9},
                {frame: 90, value: 0.0}
            ]
        };

        var swordGuardGemsParams = {
            "emissiveParam": swordGuardGemsMat.getBlockByName("emissiveStrength"),
            "glowStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 90, value: 1.0}
            ],
            "glowFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 90, value: 0.0}
            ]
        };

        var swordBladeParams = {
            "wipeMaskParam": swordBladeMat.getBlockByName("wipeMask"),
            "yOffsetParam": swordBladeMat.getBlockByName("yOffset"),
            "bladeRampVisibleParam": swordBladeMat.getBlockByName("bladeRampVisible"),
            "glowStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 90, value: 1.0}
            ],
            "glowFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 90, value: 0}
            ],
            "flareLoopKeys": [
                {frame: 0, value: 0.0},
                {frame: 120, value: 1.0}
            ],
            "rampStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 90, value: 1.0}
            ],
            "rampFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 180, value: 0}
            ]
        };

        var axeParameters = {
            "frostColorParam": axeMat.getBlockByName("frostColor"),
            "emissiveParam": axeMat.getBlockByName("emissiveStrength"),
            "freezeStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 30, value: 1.0}
            ],
            "freezeFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 30, value: 0.0}
            ],
            "glowStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 40, value: 1.0}
            ],
            "glowFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 110, value: 0.0}
            ]
        };

        // for morph targets, not allowing the influence to reach 0 prevents the shader from re-compiling and keeps animation smooth
        var axeIceParameters = {
            "freezeParam": freezeMorph,
            "iceBladeParam": iceBladeMorph,
            "iceTranslucencyParam": axeIceMat.getBlockByName("iceTranslucency"),
            "iceTranslucencyStartKeys": [
                {frame: 0, value: 0.0},
                {frame: 45, value: 0.0},
                {frame: 90, value: 1.0}
            ],
            "iceTranslucencyFinishKeys": [
                {frame: 0, value: 1.0},
                {frame: 45, value: 0.0}
            ],         
            "freezeStartKeys": [
                {frame: 0, value: 1.0},
                {frame: 50, value: 0.001}
            ],
            "freezeFinishKeys": [
                {frame: 0, value: 0.001},
                {frame: 30, value: 0.001},
                {frame: 70, value: 1.0}
            ],
            "iceBladeStartKeys": [
                {frame: 0, value: 1.0},
                {frame: 40, value: 1.0},
                {frame: 90, value: 0.001}
            ],
            "iceBladeFinishKeys": [
                {frame: 0, value: 0.0},
                {frame: 45, value: 1.0}
            ]
        };        

        // particle noise
        var noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, scene);
        noiseTexture.animationSpeedFactor = 5;
        noiseTexture.persistence = 2;
        noiseTexture.brightness = 0.5;
        noiseTexture.octaves = 6;
    
        // dagger blade mesh emitter
        var daggerMeshEmitter = new BABYLON.MeshParticleEmitter(daggerBlade);
        daggerMeshEmitter.useMeshNormalsForDirection = false;
        daggerMeshEmitter.direction1 = new BABYLON.Vector3(1, 0, 0);
        daggerMeshEmitter.direction2 = new BABYLON.Vector3(1, 0.2, 0);

        // dagger embers particle system
        var daggerEmbers = new BABYLON.ParticleSystem("daggerEmbers", 1000, scene);
        daggerEmbers.particleTexture = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/sparks.png", scene);
        daggerEmbers.minSize = 0.2;
        daggerEmbers.maxSize = 0.6;
        daggerEmbers.particleEmitterType = daggerMeshEmitter;
        daggerEmbers.emitter = daggerBlade;
        daggerEmbers.minLifeTime = 4.0;
        daggerEmbers.maxLifeTime = 4.0;
        daggerEmbers.emitRate = 30;
        daggerEmbers.addColorGradient(0.0, new BABYLON.Color4(0.9245, 0.6540, 0.0915, 0));
        daggerEmbers.addColorGradient(0.04, new BABYLON.Color4(0.9062, 0.6132, 0.0942, 0.1));
        daggerEmbers.addColorGradient(0.4, new BABYLON.Color4(0.7968, 0.3685, 0.1105, 1));
        daggerEmbers.addColorGradient(0.7, new BABYLON.Color4(0.6886, 0.1266, 0.1266, 1));
        daggerEmbers.addColorGradient(0.9, new BABYLON.Color4(0.3113, 0.0367, 0.0367, 0.6));
        daggerEmbers.addColorGradient(1.0, new BABYLON.Color4(0.3113, 0.0367, 0.0367, 0));
        daggerEmbers.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        daggerEmbers.gravity = new BABYLON.Vector3(0, 5, 0);
        daggerEmbers.noiseTexture = noiseTexture;
        daggerEmbers.noiseStrength = new BABYLON.Vector3(6, 6, 4);
        daggerEmbers.minEmitPower = 4;
        daggerEmbers.maxEmitPower = 6;
        daggerEmbers.updateSpeed = 1/60;

        // sword blade mesh emitter
        var swordMeshEmitter = new BABYLON.MeshParticleEmitter(swordBlade);
        swordMeshEmitter.useMeshNormalsForDirection = true;

        // sword glow system
        var swordGlow = new BABYLON.ParticleSystem("swordGlow", 1500, scene);
        swordGlow.particleTexture = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/glowParticleAlpha.png", scene);
        swordGlow.minInitialRotation = -2 * Math.PI;
        swordGlow.maxInitialRotation = 2 * Math.PI;
        swordGlow.particleEmitterType = swordMeshEmitter;
        swordGlow.emitter = swordBlade;
        swordGlow.addColorGradient(0, new BABYLON.Color4(0.12, 0.21, 0.041, 0.0));
        swordGlow.addColorGradient(0.5, new BABYLON.Color4(0.243, 0.424, 0.082, 0.3));
        swordGlow.addColorGradient(1.0, new BABYLON.Color4(0.12, 0.21, 0.041, 0.0));
        swordGlow.minScaleX = 14;
        swordGlow.minScaleY = 16;
        swordGlow.maxScaleX = 20;
        swordGlow.maxScaleY = 24;
        swordGlow.minLifeTime = 1.0;
        swordGlow.maxLifeTime= 1.0;
        swordGlow.emitRate = 600;
        swordGlow.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        swordGlow.gravity = new BABYLON.Vector3(0, 0, 0);
        swordGlow.minAngularSpeed = -3.0;
        swordGlow.maxAngularSpeed = 3.0;
        swordGlow.minEmitPower = 0.0;
        swordGlow.maxEmitPower = 0.0;
        swordGlow.isBillboardBased = true;
        swordGlow.isLocal = true;

        // axe blade mesh emitter
        var axeMeshEmitter = new BABYLON.MeshParticleEmitter(axeIce);
        axeMeshEmitter.useMeshNormalsForDirection = true;
        
        // axe snow system
        var axeSnow = new BABYLON.ParticleSystem("axeSnow", 600, scene);
        axeSnow.particleTexture = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/snowParticle.png", scene);
        axeSnow.particleEmitterType = axeMeshEmitter;
        axeSnow.emitter = axeIce;
        axeSnow.addColorGradient(0, new BABYLON.Color4(0.8, 0.8, 0.9, 0.0));
        axeSnow.addColorGradient(0.1, new BABYLON.Color4(0.8, 0.8, 0.9, 0.6));
        axeSnow.addColorGradient(0.5, new BABYLON.Color4(0.8, 0.8, 0.9, 0.6));
        axeSnow.addColorGradient(1.0, new BABYLON.Color4(0.8, 0.8, 0.9, 0.0));
        axeSnow.minSize = 0.3;
        axeSnow.maxSize = 0.6;
        axeSnow.minLifeTime = 1.5;
        axeSnow.maxLifeTime= 2.0;
        axeSnow.emitRate = 100;
        axeSnow.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        axeSnow.noiseTexture = noiseTexture;
        axeSnow.noiseStrength = new BABYLON.Vector3(10, 2, 10);
        axeSnow.gravity = new BABYLON.Vector3(0, -9.8, 0);
        axeSnow.minEmitPower = 0;
        axeSnow.maxEmitPower = 0;

        // axe vapor system
        var axeVapor = new BABYLON.ParticleSystem("axeSnow", 300, scene);
        axeVapor.particleEmitterType = axeMeshEmitter;
        axeVapor.emitter = axeIce;
        axeVapor.minInitialRotation = -2 * Math.PI;
        axeVapor.maxInitialRotation = 2 * Math.PI;
        axeVapor.minAngularSpeed = -0.5;
        axeVapor.maxAngularSpeed = 0.5;
        axeVapor.addColorGradient(0, new BABYLON.Color4(0.8, 0.8, 0.9, 0.0));
        axeVapor.addColorGradient(0.35, new BABYLON.Color4(0.8, 0.8, 0.9, 0.1));
        axeVapor.addColorGradient(1.0, new BABYLON.Color4(0.8, 0.8, 0.9, 0.0));
        axeVapor.minSize = 8;
        axeVapor.maxSize = 12;
        axeVapor.minLifeTime = 2.0;
        axeVapor.maxLifeTime= 3.5;
        axeVapor.emitRate = 25;
        axeVapor.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        axeVapor.gravity = new BABYLON.Vector3(0, -2, 0);
        axeVapor.minEmitPower = 0;
        axeVapor.maxEmitPower = 0;

        // particle sprite sheet
        axeVapor.isAnimationSheetEnabled = true;
        axeVapor.particleTexture = new BABYLON.Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/vaporParticles.png", scene, false, false);
        axeVapor.spriteCellWidth = 256;
        axeVapor.spriteCellHeight = 256;
        axeVapor.startSpriteCellID = 0;
        axeVapor.endSpriteCellID = 3;
        axeVapor.spriteCellChangeSpeed = 0;    
        axeVapor.spriteRandomStartCell = true; 
        axeVapor.updateSpeed = 1/30;      


        //render order
        swordGlow.renderingGroupId = 0;
        swordBlade.renderingGroupId = 1;
        swordHandleGem.renderingGroupId = 1;
        swordHilt.renderingGroupId = 1;
        swordGuardGems.renderingGroupId = 1;
        daggerEmbers.renderingGroupId = 1;
        daggerBlade.renderingGroupId = 1;
        daggerGem.renderingGroupId = 1;
        daggerHandle.renderingGroupId = 1;
        axe.renderingGroupId = 1;
        axeIce.renderingGroupId = 1;
        axeSnow.renderingGroupId = 1;
        axeVapor.renderingGroupId = 1;
    
        // new render pipeline
        var pipeline = new BABYLON.DefaultRenderingPipeline("renderPass", true, scene, scene.camera);
        pipeline.imageProcessingEnabled = false;

        // glow layer
        pipeline.glowLayerEnabled = true;
        var gl = new BABYLON.GlowLayer("glow", scene, { 
            mainTextureFixedSize: 1024,
            blurKernelSize: 64
        });
        gl.intensity = 1.25;

        // glow mask switch for node material emissive texture to be accessible to the glow layer
        gl.referenceMeshToUseItsOwnMaterial(daggerBlade);
        gl.referenceMeshToUseItsOwnMaterial(daggerGem);
        gl.referenceMeshToUseItsOwnMaterial(swordHandleGem);
        gl.referenceMeshToUseItsOwnMaterial(swordBlade);
        gl.referenceMeshToUseItsOwnMaterial(swordGuardGems);
        gl.referenceMeshToUseItsOwnMaterial(axe);

        gl.onBeforeRenderMeshToEffect.add(() => {
            daggerBladeGlowMask.value = 1.0;
            daggerGemGlowMask.value = 1.0;
            swordHandleGemGlowMask.value = 1.0;
            swordBladeGlowMask.value = 1.0;
            swordGuardGemsGlowMask.value = 1.0;
            axeGlowMask.value = 1.0;
        });
        gl.onAfterRenderMeshToEffect.add(() => {
            daggerBladeGlowMask.value = 0.0;
            daggerGemGlowMask.value = 0.0;
            swordHandleGemGlowMask.value = 0.0;
            swordBladeGlowMask.value = 0.0;
            swordGuardGemsGlowMask.value = 0.0;
            axeGlowMask.value = 0.0;
        });

        function playParticleSystem() {
            if (activeWeapon == "dagger"){ 
                if (daggerMagicActive) {
                    daggerEmbers.start();
                } else {
                    daggerEmbers.stop();
                }
            } else if (activeWeapon == "sword") {
                if (swordMagicActive) {
                    swordGlow.start();
                } else {
                    swordGlow.stop();
                }
            } else if (activeWeapon == "axe") {
                if (axeMagicActive) {
                    axeSnow.start();
                    axeVapor.start();
                } else {
                    axeSnow.stop();
                    axeVapor.stop();
                }
            } else {
                return;
            }
        }

        // prevent animation desync by limiting how often to accept input
        var acceptInput = true;
        function inputDelay() {
        acceptInput = true;
        }

        function toDagger(bypass) {
            daggerParent.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            var motionKeys = [];
            if (bypass) {
                var midFrame = Math.floor(sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].frame * 0.5);
                var midDistance = Math.abs((sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value - sceneAnimParameters.toSword[sceneAnimParameters.toSword.length - 1].value) * 0.3);
                motionKeys = [
                    {frame: 0, value: weaponsParent.position.x},
                    {frame: midFrame, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value - midDistance},
                    {frame: midFrame + 1, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value + midDistance},
                    {frame: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].frame, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value}
                ];
            } else {
                motionKeys = [
                    {frame: 0, value: weaponsParent.position.x},
                    {frame: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].frame, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value}
                ];
            }
            sceneAnimParameters.zoomDagger[0].value = camera.radius;
            playAnimation(sceneAnimParameters.animationTarget, "position.x", motionKeys, false, true, false);
            playAnimation(camera, "radius", sceneAnimParameters.zoomDagger, false, true, false);
            activeWeapon = "dagger";
            focusedMesh = daggerParent;
        }

        function toSword() {
            swordParent.rotation = new BABYLON.Vector3(0, 0, 0);
            sceneAnimParameters.toSword[0].value = weaponsParent.position.x;
            sceneAnimParameters.zoomSword[0].value = camera.radius;
            playAnimation(sceneAnimParameters.animationTarget, "position.x", sceneAnimParameters.toSword, false, true, false);
            playAnimation(camera, "radius", sceneAnimParameters.zoomSword, false, true, false);
            activeWeapon = "sword";
            focusedMesh = swordParent;
        }

        function toAxe(bypass) {
            axeParent.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            var motionKeys = [];
            if (bypass) {
                var midFrame = Math.floor(sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].frame * 0.5);
                var midDistance = Math.abs((sceneAnimParameters.toSword[sceneAnimParameters.toSword.length - 1].value - sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value) * 0.3);
                motionKeys = [
                    {frame: 0, value: weaponsParent.position.x},
                    {frame: midFrame, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value + midDistance},
                    {frame: midFrame + 1, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value - midDistance},
                    {frame: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].frame, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value}
                ];
            } else {
                motionKeys = [
                    {frame: 0, value: weaponsParent.position.x},
                    {frame: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].frame, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value}
                ];
            }
            sceneAnimParameters.zoomAxe[0].value = camera.radius;
            playAnimation(sceneAnimParameters.animationTarget, "position.x", motionKeys, false, true, false);
            playAnimation(camera, "radius", sceneAnimParameters.zoomAxe, false, true, false);
            activeWeapon = "axe";
            focusedMesh = axeParent;
        }

        // update visible weapon
        function updateWeaponsPosition(button) { // left arrow key
            if ((event.keyCode == 37 || button == "left") && acceptInput) {
                if (activeWeapon == "dagger") {
                    if (daggerMagicActive) {
                        activateDaggerMagic(false);
                        setTimeout(playParticleSystem, 500);
                        setTimeout(toSword, 3500);
                        setTimeout(inputDelay, 3500);        
                    } else {
                        toSword();
                    }

                } else if (activeWeapon == "sword") {
                    if (swordMagicActive) {
                        activateSwordMagic(false);
                        setTimeout(toAxe, 2500);    
                        setTimeout(inputDelay, 2000);
                    } else {
                        toAxe();
                    }

                } else if (activeWeapon == "axe") {
                    if (axeMagicActive) {
                        activateAxeMagic(false);
                        setTimeout(function() {
                            toDagger(true);
                        }, 2500);    
                        setTimeout(inputDelay, 2000);
                    } else {
                        toDagger(true);
                    }
                } else {
                    return;
                }
            }
            if ((event.keyCode == 39 || button == "right") && acceptInput) { // right arrow key
                if (activeWeapon == "dagger") {
                    if (daggerMagicActive) {
                        activateDaggerMagic(false);
                        setTimeout(playParticleSystem, 500);
                        setTimeout(function() {
                            toAxe(true);
                        }, 3500);    
                        setTimeout(inputDelay, 3500);
                    } else {
                        toAxe(true);
                    }

                } else if (activeWeapon == "sword") {
                    if (swordMagicActive) {
                        activateSwordMagic(false);
                        setTimeout(toDagger, 2500);    
                        setTimeout(inputDelay, 2000);
                    } else {
                        toDagger();
                    }

                } else if (activeWeapon == "axe") {
                    if (axeMagicActive) {
                        activateAxeMagic(false);
                        setTimeout(toSword, 2500);    
                        setTimeout(inputDelay, 2000);
                    } else {
                        toSword();
                    }
                } else {
                    return;
                }
            }
        }

        // dagger magic FX animations
        function activateDaggerMagic(trigger) {
            if (trigger) {
                playAnimation(daggerGemParams.emissiveParam, "value", daggerGemParams.glowStartKeys, false, true, false);
                playAnimation(daggerBladeParams.emissiveParam, "value", daggerBladeParams.glowStartKeys, false, true, true, daggerBladeParams.emissiveParam, "value", daggerBladeParams.glowLoopKeys, true, true);
                playAnimation(daggerBladeParams.heatLevelParam, "value", daggerBladeParams.heatStartKeys, false, true, false);
                playAnimation(daggerBladeParams.charLevelParam, "value", daggerBladeParams.charStartKeys, false, true, false);
                playAnimation(daggerBladeParams.uOffsetParam, "value", daggerBladeParams.animStartKeys, true, false, false);
                playAnimation(daggerBladeParams.flickerStrengthParam, "value", daggerBladeParams.flickerStrengthStartKeys, false, true, false);
                daggerMagicActive = true;
                acceptInput = false;
                setTimeout(playParticleSystem, 2000);
                setTimeout(inputDelay, 3500);
            } else {
                daggerBladeParams.glowFinishKeys[0].value = daggerBladeParams.emissiveParam.value;
                playAnimation(daggerGemParams.emissiveParam, "value", daggerGemParams.glowFinishKeys, false, true, false);
                playAnimation(daggerBladeParams.emissiveParam, "value", daggerBladeParams.glowFinishKeys, false, true, false);
                playAnimation(daggerBladeParams.heatLevelParam, "value", daggerBladeParams.heatFinishKeys, false, true, false);
                playAnimation(daggerBladeParams.charLevelParam, "value", daggerBladeParams.charFinishKeys, false, true, false);
                playAnimation(daggerBladeParams.flickerStrengthParam, "value", daggerBladeParams.flickerStrengthFinishKeys, false, true, true, daggerBladeParams.uOffsetParam, "value", daggerBladeParams.animStopKeys, false, false);
                daggerMagicActive = false;
                acceptInput = false;
                setTimeout(playParticleSystem, 500);
                setTimeout(inputDelay, 3500);
            }
        }

        // sword magic FX animations
        function activateSwordMagic(trigger) {
            if (trigger) {
                swordBladeReverseWipe.value = false;
                playAnimation(swordBladeParams.wipeMaskParam, "value", swordBladeParams.glowStartKeys, false, true, true, swordBladeParams.yOffsetParam, "value", swordBladeParams.flareLoopKeys, true, false);
                playAnimation(swordHandleGemParams.emissiveParam, "value", swordHandleGemParams.glowStartKeys, false, true, true, swordHandleGemParams.emissiveParam, "value", swordHandleGemParams.glowLoopKeys, true, true);
                playAnimation(swordGuardGemsParams.emissiveParam, "value", swordGuardGemsParams.glowStartKeys, false, true, false);
                playAnimation(swordBladeParams.bladeRampVisibleParam, "value", swordBladeParams.rampStartKeys, false, true, false);
                swordMagicActive = true;
                acceptInput = false;
                setTimeout(playParticleSystem, 600);
                setTimeout(inputDelay, 1500);
            } else {
                swordBladeReverseWipe.value = true;
                var remainingGemKeys = [
                    {frame: 0, value: swordHandleGemParams.emissiveParam.value},
                    {frame: swordHandleGemParams.glowFinishKeys[swordHandleGemParams.glowFinishKeys.length - 1].frame * (swordHandleGemParams.emissiveParam.value), value: 0}
                ];
                playAnimation(swordHandleGemParams.emissiveParam, "value", remainingGemKeys, false, true, false);
                var remainingBladeKeys = [
                    {frame: 0, value: swordBladeParams.yOffsetParam.value},
                    {frame: swordBladeParams.flareLoopKeys[swordBladeParams.flareLoopKeys.length - 1].frame * (1 - swordBladeParams.yOffsetParam.value), value: 1}
                ];
                playAnimation(swordBladeParams.yOffsetParam, "value", remainingBladeKeys, false, false, true, swordBladeParams.wipeMaskParam, "value", swordBladeParams.glowFinishKeys, false, true, false);
                playAnimation(swordGuardGemsParams.emissiveParam, "value", swordGuardGemsParams.glowFinishKeys, false, true, false);
                playAnimation(swordBladeParams.bladeRampVisibleParam, "value", swordBladeParams.rampFinishKeys, false, true, false);
                swordMagicActive = false;
                acceptInput = false;
                setTimeout(playParticleSystem, 200);
                setTimeout(inputDelay, 2500);
            }
        }

        function activateAxeMagic(trigger) {
            if (trigger) {
                playAnimation(axeParameters.frostColorParam, "value", axeParameters.freezeStartKeys, false, true, false);
                playAnimation(axeParameters.emissiveParam, "value", axeParameters.glowStartKeys, false, true, false);
                playAnimation(axeIceParameters.freezeParam, "influence", axeIceParameters.freezeStartKeys, false, true, false);
                playAnimation(axeIceParameters.iceBladeParam, "influence", axeIceParameters.iceBladeStartKeys, false, true, false);
                playAnimation(axeIceParameters.iceTranslucencyParam, "value", axeIceParameters.iceTranslucencyStartKeys, false, true, false);
                axeMagicActive = true;
                acceptInput = false;
                setTimeout(playParticleSystem, 1500);
                setTimeout(inputDelay, 1500);
            } else {
                playAnimation(axeIceParameters.iceBladeParam, "influence", axeIceParameters.iceBladeFinishKeys, false, true, false);
                playAnimation(axeParameters.emissiveParam, "value", axeParameters.glowFinishKeys, false, true, false);
                playAnimation(axeIceParameters.freezeParam, "influence", axeIceParameters.freezeFinishKeys, false, true, false);
                playAnimation(axeIceParameters.iceTranslucencyParam, "value", axeIceParameters.iceTranslucencyFinishKeys, false, true, true, axeParameters.frostColorParam, "value", axeParameters.freezeFinishKeys, false, true);
                axeMagicActive = false;
                acceptInput = false;
                setTimeout(playParticleSystem, 50);
                setTimeout(inputDelay, 1500);
            }
        }
        
        // update magic effects 
        function updateWeaponState(button) {
            if ((event.keyCode == 32 || button == true) && acceptInput) { // space bar to activate magic 
                if (activeWeapon == "dagger") {
                    if (daggerMagicActive) {
                        activateDaggerMagic(false);
                    } else {
                        activateDaggerMagic(true);
                    }     
                } else if (activeWeapon == "sword") {
                    if (swordMagicActive) {
                        activateSwordMagic (false);
                    } else {
                        activateSwordMagic(true);
                    }
                } else if (activeWeapon == "axe") {
                    if (axeMagicActive) {
                        activateAxeMagic (false);
                    } else {
                        activateAxeMagic(true);
                    }
                } else {
                    return;
                }
            }
        }
    
        // mesh rotation with inertia
        var inertialAlpha = 0;
        var inertialBeta = 0;
        var inertia = 0.95;
        var angularSpeed = 0.0005;
        var xRotationSign = -1;
    
        var mouseDown = false;
        scene.onPointerObservable.add(evt => {
            if (cameraControl) {
                return;
            }
    
            if (evt.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                mouseDown = true;
                if (BABYLON.Vector3.Dot(focusedMesh.up, camera.getWorldMatrix().getRotationMatrix().getRow(1)) >= 0) {
                    xRotationSign = -1;
                } else {
                    xRotationSign = 1;
                }
                return;
            }
            if (evt.type === BABYLON.PointerEventTypes.POINTERUP) {
                mouseDown = false;
                return;
            }
    
            if (!mouseDown || evt.type !== BABYLON.PointerEventTypes.POINTERMOVE) {
                return;
            }
    
            var offsetX = evt.event.movementX ||
                            evt.event.mozMovementX ||
                            evt.event.webkitMovementX ||
                            evt.event.msMovementX ||
                            0;
            var offsetY = evt.event.movementY ||
                            evt.event.mozMovementY ||
                            evt.event.webkitMovementY ||
                            evt.event.msMovementY ||
                            0;
    
            inertialAlpha += xRotationSign * offsetX * angularSpeed;
            inertialBeta -= offsetY * angularSpeed;     
        });

        // add listener for key press
        document.addEventListener('keydown', updateWeaponState);
        document.addEventListener('keydown', updateWeaponsPosition);

        // remove listeners when scene disposed
        scene.onDisposeObservable.add(function() {
            document.removeEventListener('keydown', updateWeaponState);
            document.removeEventListener('keydown', updateWeaponsPosition);
        });

        // run every frame
        scene.registerBeforeRender(function () {
            if (cameraControl) {
                return;
            }
            focusedMesh.rotate(BABYLON.Vector3.UpReadOnly, inertialAlpha, BABYLON.Space.LOCAL);
            focusedMesh.rotate(BABYLON.Vector3.Left(), inertialBeta, BABYLON.Space.WORLD);

            inertialAlpha *= inertia;
            inertialBeta *= inertia;
        });

        // GUI
        var guiLayer = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("guiLayer");
        var guiContainer = new BABYLON.GUI.Grid();
        guiContainer.name = "uiGrid";
        guiContainer.addRowDefinition(1, false);
        guiContainer.addColumnDefinition(1/3, false);
        guiContainer.addColumnDefinition(1/3, false);
        guiContainer.addColumnDefinition(1/3, false);
        guiContainer.paddingTop = "50px";
        guiContainer.paddingLeft = "50px";
        guiContainer.paddingRight = "50px";
        guiContainer.paddingBottom = "50px";        
        guiLayer.addControl(guiContainer);

        // Buttons
        activateBtn = BABYLON.GUI.Button.CreateImageOnlyButton("activate", "https://models.babylonjs.com/Demos/weaponsDemo/textures/activateButton.png");
        activateBtn.width = "130px";
        activateBtn.height = "55px";
        activateBtn.thickness = 0;
        activateBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        activateBtn.onPointerClickObservable.add(() => {
            if  (acceptInput) {
                updateWeaponState(true);
            }
        });

        leftBtn = BABYLON.GUI.Button.CreateImageOnlyButton("left", "https://models.babylonjs.com/Demos/weaponsDemo/textures/leftButton.png");
        leftBtn.width = "55px";
        leftBtn.height = "55px";
        leftBtn.thickness = 0;
        leftBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftBtn.onPointerClickObservable.add(() => { 
            if (acceptInput) {
                updateWeaponsPosition("left");
            }
        });

        rightBtn = BABYLON.GUI.Button.CreateImageOnlyButton("right", "https://models.babylonjs.com/Demos/weaponsDemo/textures/rightButton.png");
        rightBtn.width = "55px";
        rightBtn.height = "55px";
        rightBtn.thickness = 0;
        rightBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightBtn.onPointerClickObservable.add(() => { 
            if (acceptInput) {
                updateWeaponsPosition("right");
            }
        });

        // add button to GUI
        guiContainer.addControl(leftBtn, 0, 0);   
        guiContainer.addControl(activateBtn, 0, 1);   
        guiContainer.addControl(rightBtn, 0, 2);  
    });
    
    // display loading screen while loading assets
    engine.displayLoadingUI();  
    scene.executeWhenReady(function() {
        engine.hideLoadingUI();
    });

    return scene;
};