import '@babylonjs/core/Loading/loadingScreen';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { NodeMaterial } from '@babylonjs/core/Materials/Node';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { MeshParticleEmitter } from '@babylonjs/core/Particles/EmitterTypes/meshParticleEmitter';


var daggerGemParams = {};
var daggerBladeParams = {};
var daggerParent;
function weaponDagger(scene, gl, weaponsParent, noiseTexture) {
    var promises =[];
    // create node materials
    var daggerHandleMat = new NodeMaterial("daggerHandleMat", scene, { emitComments: false });
    var daggerGemMat = new NodeMaterial("daggerGemMat", scene, { emitComments: false });
    var daggerBladeMat = new NodeMaterial("daggerBladeMat", scene, { emitComments: false });
    // load assets 
    promises.push(SceneLoader.AppendAsync("/public/assets/meshes/moltenDagger.glb"));
    promises.push(daggerHandleMat.loadAsync("/public/assets/shaders/daggerHandleMat.json"));
    promises.push(daggerBladeMat.loadAsync("/public/assets/shaders/daggerBladeMat.json"));
    promises.push(daggerGemMat.loadAsync("/public/assets/shaders/daggerGemMat.json"));
    return Promise
        .all(promises)
        .then(() => {
            const daggerHandle = scene.getMeshByName("daggerHandle_low");
            const daggerBlade = scene.getMeshByName("daggerBlade_low");
            const daggerGem = scene.getMeshByName("daggerGem_low");
            daggerParent = daggerHandle.parent;
            daggerParent.parent = weaponsParent;
            // build and assign node materials
            daggerHandleMat.build(false);
            daggerHandle.material = daggerHandleMat;

            daggerBladeMat.build(false);
            daggerBlade.material = daggerBladeMat;

            daggerGemMat.build(false);
            daggerGem.material = daggerGemMat;
            // textures
            const daggerDiffuseTex = new Texture("/public/assets/textures/moltenDagger_diffuse.png", scene, false, false);
            const daggerSpecularTex = new Texture("/public/assets/textures/moltenDagger_specular.png", scene, false, false);
            const daggerGlossTex = new Texture("/public/assets/textures/moltenDagger_gloss.png", scene, false, false);
            const daggerEmissiveTex = new Texture("/public/assets/textures/moltenDagger_emissive.png", scene, false, false);
            const daggerMaskTex = new Texture("/public/assets/textures/moltenDagger_mask.png", scene, false, false);
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
            // glow parameters
            var daggerBladeGlowMask = daggerBladeMat.getBlockByName("glowMask");
            var daggerGemGlowMask = daggerGemMat.getBlockByName("glowMask");
            // mesh parameter objects
            daggerGemParams = {
                "emissiveParam": daggerGemMat.getBlockByName("emissiveStrength"),
                "glowStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 90, value: 1.0 }
                ],
                "glowFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 120, value: 0.0 }
                ]
            };

            daggerBladeParams = {
                "emissiveParam": daggerBladeMat.getBlockByName("emissiveStrength"),
                "heatLevelParam": daggerBladeMat.getBlockByName("heatLevel"),
                "charLevelParam": daggerBladeMat.getBlockByName("charLevel"),
                "uOffsetParam": daggerBladeMat.getBlockByName("uOffset"),
                "flickerStrengthParam": daggerBladeMat.getBlockByName("flickerStrength"),
                "glowStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 20, value: 0.0 },
                    { frame: 90, value: 1.0 }
                ],
                "glowLoopKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 70, value: 0.75 },
                    { frame: 140, value: 1.0 }
                ],
                "glowFinishKeys": [
                    { frame: 0, value: 0.75 },
                    { frame: 90, value: 0.0 }
                ],
                "heatStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 40, value: 0.0 },
                    { frame: 160, value: 0.67 }
                ],
                "heatFinishKeys": [
                    { frame: 0, value: 0.67 },
                    { frame: 40, value: 0.67 },
                    { frame: 160, value: 0.0 }
                ],
                "charStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 80, value: 0.0 },
                    { frame: 160, value: 1.0 }
                ],
                "charFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 60, value: 1.0 },
                    { frame: 160, value: 0.0 }
                ],
                "animStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 180, value: 1.0 }
                ],
                "animStopKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 10, value: 0.0 }
                ],
                "flickerStrengthStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 40, value: 0.0 },
                    { frame: 160, value: 0.65 }
                ],
                "flickerStrengthFinishKeys": [
                    { frame: 0, value: 0.65 },
                    { frame: 40, value: 0.65 },
                    { frame: 160, value: 0.0 }
                ]
            };
            // dagger blade mesh emitter
            var daggerMeshEmitter = new MeshParticleEmitter(daggerBlade);
            daggerMeshEmitter.useMeshNormalsForDirection = false;
            daggerMeshEmitter.direction1 = new Vector3(1, 0, 0);
            daggerMeshEmitter.direction2 = new Vector3(1, 0.2, 0);

            // dagger embers particle system
            var daggerEmbers = new ParticleSystem("daggerEmbers", 1000, scene);
            daggerEmbers.particleTexture = new Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/sparks.png", scene);
            daggerEmbers.minSize = 0.2;
            daggerEmbers.maxSize = 0.6;
            daggerEmbers.particleEmitterType = daggerMeshEmitter;
            daggerEmbers.emitter = daggerBlade;
            daggerEmbers.minLifeTime = 4.0;
            daggerEmbers.maxLifeTime = 4.0;
            daggerEmbers.emitRate = 30;
            daggerEmbers.addColorGradient(0.0, new Color4(0.9245, 0.6540, 0.0915, 0));
            daggerEmbers.addColorGradient(0.04, new Color4(0.9062, 0.6132, 0.0942, 0.1));
            daggerEmbers.addColorGradient(0.4, new Color4(0.7968, 0.3685, 0.1105, 1));
            daggerEmbers.addColorGradient(0.7, new Color4(0.6886, 0.1266, 0.1266, 1));
            daggerEmbers.addColorGradient(0.9, new Color4(0.3113, 0.0367, 0.0367, 0.6));
            daggerEmbers.addColorGradient(1.0, new Color4(0.3113, 0.0367, 0.0367, 0));
            daggerEmbers.blendMode = ParticleSystem.BLENDMODE_ADD;
            daggerEmbers.gravity = new Vector3(0, 5, 0);
            daggerEmbers.noiseTexture = noiseTexture;
            daggerEmbers.noiseStrength = new Vector3(6, 6, 4);
            daggerEmbers.minEmitPower = 4;
            daggerEmbers.maxEmitPower = 6;
            daggerEmbers.updateSpeed = 1 / 60;
            //render order
            daggerEmbers.renderingGroupId = 1;
            daggerBlade.renderingGroupId = 1;
            daggerGem.renderingGroupId = 1;
            daggerHandle.renderingGroupId = 1;
            // glow mask switch for node material emissive texture to be accessible to the glow layer
            gl.referenceMeshToUseItsOwnMaterial(daggerBlade);
            gl.referenceMeshToUseItsOwnMaterial(daggerGem);
            gl.onBeforeRenderMeshToEffect.add(() => {
                daggerBladeGlowMask.value = 1.0;
                daggerGemGlowMask.value = 1.0;
            });
            gl.onAfterRenderMeshToEffect.add(() => {
                daggerBladeGlowMask.value = 0.0;
                daggerGemGlowMask.value = 0.0;
            });
            return { daggerEmbers, daggerParent }
        });
}
function toDagger(bypass, sceneAnimParameters, camera, playAnimation, scene) {
    daggerParent.rotation = new Vector3(0, Math.PI, 0);
    var motionKeys = [];
    if (bypass) {
        var midFrame = Math.floor(sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].frame * 0.5);
        var midDistance = Math.abs((sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value - sceneAnimParameters.toSword[sceneAnimParameters.toSword.length - 1].value) * 0.3);
        motionKeys = [
            { frame: 0, value: sceneAnimParameters.animationTarget.position.x },
            { frame: midFrame, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value - midDistance },
            { frame: midFrame + 1, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value + midDistance },
            { frame: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].frame, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value }
        ];
    } else {
        motionKeys = [
            { frame: 0, value: sceneAnimParameters.animationTarget.position.x },
            { frame: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].frame, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value }
        ];
    }
    sceneAnimParameters.zoomDagger[0].value = camera.radius;
    playAnimation(scene, sceneAnimParameters.animationTarget, "position.x", motionKeys, false, true, false);
    playAnimation(scene, camera, "radius", sceneAnimParameters.zoomDagger, false, true, false);
}
// dagger magic FX animations
function activateDaggerMagic(trigger, playAnimation, scene) {
    if (trigger) {
        playAnimation(scene, daggerGemParams.emissiveParam, "value", daggerGemParams.glowStartKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.emissiveParam, "value", daggerBladeParams.glowStartKeys, false, true, true, daggerBladeParams.emissiveParam, "value", daggerBladeParams.glowLoopKeys, true, true);
        playAnimation(scene, daggerBladeParams.heatLevelParam, "value", daggerBladeParams.heatStartKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.charLevelParam, "value", daggerBladeParams.charStartKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.uOffsetParam, "value", daggerBladeParams.animStartKeys, true, false, false);
        playAnimation(scene, daggerBladeParams.flickerStrengthParam, "value", daggerBladeParams.flickerStrengthStartKeys, false, true, false);
    } else {
        daggerBladeParams.glowFinishKeys[0].value = daggerBladeParams.emissiveParam.value;
        playAnimation(scene, daggerGemParams.emissiveParam, "value", daggerGemParams.glowFinishKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.emissiveParam, "value", daggerBladeParams.glowFinishKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.heatLevelParam, "value", daggerBladeParams.heatFinishKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.charLevelParam, "value", daggerBladeParams.charFinishKeys, false, true, false);
        playAnimation(scene, daggerBladeParams.flickerStrengthParam, "value", daggerBladeParams.flickerStrengthFinishKeys, false, true, true, daggerBladeParams.uOffsetParam, "value", daggerBladeParams.animStopKeys, false, false);
    }
}

export {
    toDagger,
    weaponDagger,
    activateDaggerMagic,
}