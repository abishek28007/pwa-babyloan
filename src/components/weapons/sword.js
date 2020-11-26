import {
    Color4,
    Vector3
} from '@babylonjs/core/Maths/math';
import { SceneLoader } from '@babylonjs/core/Loading';
import { NodeMaterial } from '@babylonjs/core/Materials/Node';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { MeshParticleEmitter } from '@babylonjs/core/Particles/EmitterTypes/meshParticleEmitter';

// mesh parameter objects
var swordHandleGemParams = {};
var swordGuardGemsParams = {};
var swordBladeParams = {};
var swordParent;

function weaponSword(scene, gl, weaponsParent) {
    var promises =[];
    // create node materials
    var swordHiltMat = new NodeMaterial("swordHiltMat", scene, { emitComments: false });
    var swordHandleGemMat = new NodeMaterial("swordHandleGemMat", scene, { emitComments: false });
    var swordGuardGemsMat = new NodeMaterial("swordGuardGemsMat", scene, { emitComments: false });
    var swordBladeMat = new NodeMaterial("swordBladeMat", scene, { emitComments: false });
    // load assets 
    promises.push(SceneLoader.AppendAsync("/public/assets/meshes/runeSword.glb"));
    promises.push(swordBladeMat.loadAsync("/public/assets/shaders/swordBladeMat.json"));
    promises.push(swordGuardGemsMat.loadAsync("/public/assets/shaders/swordGuardGemsMat.json"));
    promises.push(swordHandleGemMat.loadAsync("/public/assets/shaders/swordHandleGemMat.json"));
    promises.push(swordHiltMat.loadAsync("/public/assets/shaders/swordHiltMat.json"));
    return Promise
        .all(promises)
        .then(() => {
            const swordHilt = scene.getMeshByName("swordHilt_low");
            const swordBlade = scene.getMeshByName("swordBlade_low");
            const swordGuardGems = scene.getMeshByName("swordGuardGems_low");
            const swordHandleGem = scene.getMeshByName("swordHandleGem_low");
            swordParent = swordHilt.parent;
            swordParent.position = new Vector3(400, 0, 0);
            swordParent.scaling = new Vector3(100, 100, 100);
            swordParent.parent = weaponsParent;
            // build and assign node materials
            swordBladeMat.build(false);
            swordBlade.material = swordBladeMat;

            swordGuardGemsMat.build(false);
            swordGuardGems.material = swordGuardGemsMat;

            swordHandleGemMat.build(false);
            swordHandleGem.material = swordHandleGemMat;

            swordHiltMat.build(false);
            swordHilt.material = swordHiltMat;
            // textures
            const swordDiffuseTex = new Texture("/public/assets/textures/runeSword_diffuse-min.png", scene, false, false);
            const swordSpecularTex = new Texture("/public/assets/textures/runeSword_specular.png", scene, false, false);
            const swordGlossTex = new Texture("/public/assets/textures/runeSword_gloss.png", scene, false, false);
            const swordEmissiveTex = new Texture("/public/assets/textures/runeSword_emissive.png", scene, false, false);
            const swordHandleGemNormalTex = new Texture("/public/assets/textures/swordHandleGem_normal-min.png", scene, false, false);
            const swordHandleGemPositionTex = new Texture("/public/assets/textures/swordHandleGem_position-min.png", scene, false, false);
            // get shader parameters
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
            // assign textures
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
            // glow parameters
            var swordHandleGemGlowMask = swordHandleGemMat.getBlockByName("glowMask");
            var swordBladeGlowMask = swordBladeMat.getBlockByName("glowMask");
            var swordGuardGemsGlowMask = swordGuardGemsMat.getBlockByName("glowMask");
            var swordBladeReverseWipe = swordBladeMat.getBlockByName("reverseWipe");
            // mesh parameter objects
            swordHandleGemParams = {
                "emissiveParam": swordHandleGemMat.getBlockByName("emissiveStrength"),
                "glowStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 90, value: 0.9 }
                ],
                "glowLoopKeys": [
                    { frame: 0, value: 0.9 },
                    { frame: 70, value: 0.3 },
                    { frame: 140, value: 0.9 }
                ],
                "glowFinishKeys": [
                    { frame: 0, value: 0.9 },
                    { frame: 90, value: 0.0 }
                ]
            };

            swordGuardGemsParams = {
                "emissiveParam": swordGuardGemsMat.getBlockByName("emissiveStrength"),
                "glowStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 90, value: 1.0 }
                ],
                "glowFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 90, value: 0.0 }
                ]
            };

            swordBladeParams = {
                "wipeMaskParam": swordBladeMat.getBlockByName("wipeMask"),
                "yOffsetParam": swordBladeMat.getBlockByName("yOffset"),
                "bladeRampVisibleParam": swordBladeMat.getBlockByName("bladeRampVisible"),
                "glowStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 90, value: 1.0 }
                ],
                "glowFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 90, value: 0 }
                ],
                "flareLoopKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 120, value: 1.0 }
                ],
                "rampStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 90, value: 1.0 }
                ],
                "rampFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 180, value: 0 }
                ]
            };
            // sword blade mesh emitter
            var swordMeshEmitter = new MeshParticleEmitter(swordBlade);
            swordMeshEmitter.useMeshNormalsForDirection = true;

            // sword glow system
            var swordGlow = new ParticleSystem("swordGlow", 1500, scene);
            swordGlow.particleTexture = new Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/glowParticleAlpha.png", scene);
            swordGlow.minInitialRotation = -2 * Math.PI;
            swordGlow.maxInitialRotation = 2 * Math.PI;
            swordGlow.particleEmitterType = swordMeshEmitter;
            swordGlow.emitter = swordBlade;
            swordGlow.addColorGradient(0, new Color4(0.12, 0.21, 0.041, 0.0));
            swordGlow.addColorGradient(0.5, new Color4(0.243, 0.424, 0.082, 0.3));
            swordGlow.addColorGradient(1.0, new Color4(0.12, 0.21, 0.041, 0.0));
            swordGlow.minScaleX = 14;
            swordGlow.minScaleY = 16;
            swordGlow.maxScaleX = 20;
            swordGlow.maxScaleY = 24;
            swordGlow.minLifeTime = 1.0;
            swordGlow.maxLifeTime = 1.0;
            swordGlow.emitRate = 600;
            swordGlow.blendMode = ParticleSystem.BLENDMODE_STANDARD;
            swordGlow.gravity = new Vector3(0, 0, 0);
            swordGlow.minAngularSpeed = -3.0;
            swordGlow.maxAngularSpeed = 3.0;
            swordGlow.minEmitPower = 0.0;
            swordGlow.maxEmitPower = 0.0;
            swordGlow.isBillboardBased = true;
            swordGlow.isLocal = true;
            //render order
            swordGlow.renderingGroupId = 0;
            swordBlade.renderingGroupId = 1;
            swordHandleGem.renderingGroupId = 1;
            swordHilt.renderingGroupId = 1;
            swordGuardGems.renderingGroupId = 1;
            // glow mask switch for node material emissive texture to be accessible to the glow layer
            gl.referenceMeshToUseItsOwnMaterial(swordHandleGem);
            gl.referenceMeshToUseItsOwnMaterial(swordBlade);
            gl.referenceMeshToUseItsOwnMaterial(swordGuardGems);
            
            gl.onBeforeRenderMeshToEffect.add(() => {
                swordHandleGemGlowMask.value = 1.0;
                swordBladeGlowMask.value = 1.0;
                swordGuardGemsGlowMask.value = 1.0;
            });
            gl.onAfterRenderMeshToEffect.add(() => {
                swordHandleGemGlowMask.value = 0.0;
                swordBladeGlowMask.value = 0.0;
                swordGuardGemsGlowMask.value = 0.0;
            });
            return { swordParent, swordGlow, swordBladeReverseWipe };
        });
}
function toSword(sceneAnimParameters, camera, playAnimation, scene) {
    swordParent.rotation = new Vector3(0, 0, 0);
    sceneAnimParameters.toSword[0].value = sceneAnimParameters.animationTarget.position.x;
    sceneAnimParameters.zoomSword[0].value = camera.radius;
    playAnimation(scene, sceneAnimParameters.animationTarget, "position.x", sceneAnimParameters.toSword, false, true, false);
    playAnimation(scene, camera, "radius", sceneAnimParameters.zoomSword, false, true, false);
}
// sword magic FX animations
function activateSwordMagic(trigger, swordBladeReverseWipe, playAnimation, scene) {
    if (trigger) {
        swordBladeReverseWipe.value = false;
        playAnimation(scene, swordBladeParams.wipeMaskParam, "value", swordBladeParams.glowStartKeys, false, true, true, swordBladeParams.yOffsetParam, "value", swordBladeParams.flareLoopKeys, true, false);
        playAnimation(scene, swordHandleGemParams.emissiveParam, "value", swordHandleGemParams.glowStartKeys, false, true, true, swordHandleGemParams.emissiveParam, "value", swordHandleGemParams.glowLoopKeys, true, true);
        playAnimation(scene, swordGuardGemsParams.emissiveParam, "value", swordGuardGemsParams.glowStartKeys, false, true, false);
        playAnimation(scene, swordBladeParams.bladeRampVisibleParam, "value", swordBladeParams.rampStartKeys, false, true, false);
    } else {
        swordBladeReverseWipe.value = true;
        var remainingGemKeys = [
            { frame: 0, value: swordHandleGemParams.emissiveParam.value },
            { frame: swordHandleGemParams.glowFinishKeys[swordHandleGemParams.glowFinishKeys.length - 1].frame * (swordHandleGemParams.emissiveParam.value), value: 0 }
        ];
        playAnimation(scene, swordHandleGemParams.emissiveParam, "value", remainingGemKeys, false, true, false);
        var remainingBladeKeys = [
            { frame: 0, value: swordBladeParams.yOffsetParam.value },
            { frame: swordBladeParams.flareLoopKeys[swordBladeParams.flareLoopKeys.length - 1].frame * (1 - swordBladeParams.yOffsetParam.value), value: 1 }
        ];
        playAnimation(scene, swordBladeParams.yOffsetParam, "value", remainingBladeKeys, false, false, true, swordBladeParams.wipeMaskParam, "value", swordBladeParams.glowFinishKeys, false, true, false);
        playAnimation(scene, swordGuardGemsParams.emissiveParam, "value", swordGuardGemsParams.glowFinishKeys, false, true, false);
        playAnimation(scene, swordBladeParams.bladeRampVisibleParam, "value", swordBladeParams.rampFinishKeys, false, true, false);
    }
}

export {
    toSword,
    weaponSword,
    activateSwordMagic,
}