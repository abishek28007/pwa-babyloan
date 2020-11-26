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
var axeParameters = {};
// for morph targets, not allowing the influence to reach 0 prevents the shader from re-compiling and keeps animation smooth
var axeIceParameters = {};
var axeParent;

function weaponAxe(scene, gl, weaponsParent, noiseTexture) {
    var promises =[];
    // create node materials
    var axeMat = new NodeMaterial("axeMat", scene, { emitComments: false });
    var axeIceMat = new NodeMaterial("axeIceMat", scene, { emitComments: false });
    // load assets 
    promises.push(SceneLoader.AppendAsync("/public/assets/meshes/frostAxe.glb"));
    promises.push(axeMat.loadAsync("/public/assets/shaders/axeMat.json"));
    promises.push(axeIceMat.loadAsync("/public/assets/shaders/axeIceMat.json"));
    return Promise
        .all(promises)
        .then(() => {
            const axe = scene.getMeshByName("frostAxe_low");
            const axeIce = scene.getMeshByName("frostAxeIce_low");
            axeParent = axe.parent;
            axeParent.position = new Vector3(800, 0, 0);
            axeParent.scaling = new Vector3(100, 100, 100);
            axeParent.parent = weaponsParent;
            var freezeMorph = axeIce.morphTargetManager.getTarget(0);
            var iceBladeMorph = axeIce.morphTargetManager.getTarget(1);
            freezeMorph.influence = 1.0;
            iceBladeMorph.influence = 1.0;
            // mesh parameter objects
            axeParameters = {
                "frostColorParam": axeMat.getBlockByName("frostColor"),
                "emissiveParam": axeMat.getBlockByName("emissiveStrength"),
                "freezeStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 30, value: 1.0 }
                ],
                "freezeFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 30, value: 0.0 }
                ],
                "glowStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 40, value: 1.0 }
                ],
                "glowFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 110, value: 0.0 }
                ]
            };

            // for morph targets, not allowing the influence to reach 0 prevents the shader from re-compiling and keeps animation smooth
            axeIceParameters = {
                "freezeParam": freezeMorph,
                "iceBladeParam": iceBladeMorph,
                "iceTranslucencyParam": axeIceMat.getBlockByName("iceTranslucency"),
                "iceTranslucencyStartKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 45, value: 0.0 },
                    { frame: 90, value: 1.0 }
                ],
                "iceTranslucencyFinishKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 45, value: 0.0 }
                ],
                "freezeStartKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 50, value: 0.001 }
                ],
                "freezeFinishKeys": [
                    { frame: 0, value: 0.001 },
                    { frame: 30, value: 0.001 },
                    { frame: 70, value: 1.0 }
                ],
                "iceBladeStartKeys": [
                    { frame: 0, value: 1.0 },
                    { frame: 40, value: 1.0 },
                    { frame: 90, value: 0.001 }
                ],
                "iceBladeFinishKeys": [
                    { frame: 0, value: 0.0 },
                    { frame: 45, value: 1.0 }
                ]
            };
            // build and assign node materials
            axeMat.build(false);
            axe.material = axeMat;

            axeIceMat.build(false);
            axeIce.material = axeIceMat;
            // textures
            const axeDiffuseTex = new Texture("/public/assets/textures/frostAxe_diffuse.png", scene, false, false);
            const axeSpecularTex = new Texture("/public/assets/textures/frostAxe_specular.png", scene, false, false);
            const axeGlossTex = new Texture("/public/assets/textures/frostAxe_gloss.png", scene, false, false);
            const axeMaskTex = new Texture("/public/assets/textures/frostAxe_masks.png", scene, false, false);
            const axeEmissiveTex = new Texture("/public/assets/textures/frostAxe_emissive.png", scene, false, false);
            // get shader parameters
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
            var axeGlowMask = axeMat.getBlockByName("glowMask");
            gl.onBeforeRenderMeshToEffect.add(() => {
                axeGlowMask.value = 1.0;
            });
            gl.onAfterRenderMeshToEffect.add(() => {
                axeGlowMask.value = 0.0;
            });
            // axe blade mesh emitter
            var axeMeshEmitter = new MeshParticleEmitter(axeIce);
            axeMeshEmitter.useMeshNormalsForDirection = true;

            // axe snow system
            var axeSnow = new ParticleSystem("axeSnow", 600, scene);
            axeSnow.particleTexture = new Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/snowParticle.png", scene);
            axeSnow.particleEmitterType = axeMeshEmitter;
            axeSnow.emitter = axeIce;
            axeSnow.addColorGradient(0, new Color4(0.8, 0.8, 0.9, 0.0));
            axeSnow.addColorGradient(0.1, new Color4(0.8, 0.8, 0.9, 0.6));
            axeSnow.addColorGradient(0.5, new Color4(0.8, 0.8, 0.9, 0.6));
            axeSnow.addColorGradient(1.0, new Color4(0.8, 0.8, 0.9, 0.0));
            axeSnow.minSize = 0.3;
            axeSnow.maxSize = 0.6;
            axeSnow.minLifeTime = 1.5;
            axeSnow.maxLifeTime = 2.0;
            axeSnow.emitRate = 100;
            axeSnow.blendMode = ParticleSystem.BLENDMODE_STANDARD;
            axeSnow.noiseTexture = noiseTexture;
            axeSnow.noiseStrength = new Vector3(10, 2, 10);
            axeSnow.gravity = new Vector3(0, -9.8, 0);
            axeSnow.minEmitPower = 0;
            axeSnow.maxEmitPower = 0;

            // axe vapor system
            var axeVapor = new ParticleSystem("axeSnow", 300, scene);
            axeVapor.particleEmitterType = axeMeshEmitter;
            axeVapor.emitter = axeIce;
            axeVapor.minInitialRotation = -2 * Math.PI;
            axeVapor.maxInitialRotation = 2 * Math.PI;
            axeVapor.minAngularSpeed = -0.5;
            axeVapor.maxAngularSpeed = 0.5;
            axeVapor.addColorGradient(0, new Color4(0.8, 0.8, 0.9, 0.0));
            axeVapor.addColorGradient(0.35, new Color4(0.8, 0.8, 0.9, 0.1));
            axeVapor.addColorGradient(1.0, new Color4(0.8, 0.8, 0.9, 0.0));
            axeVapor.minSize = 8;
            axeVapor.maxSize = 12;
            axeVapor.minLifeTime = 2.0;
            axeVapor.maxLifeTime = 3.5;
            axeVapor.emitRate = 25;
            axeVapor.blendMode = ParticleSystem.BLENDMODE_ADD;
            axeVapor.gravity = new Vector3(0, -2, 0);
            axeVapor.minEmitPower = 0;
            axeVapor.maxEmitPower = 0;

            // particle sprite sheet
            axeVapor.isAnimationSheetEnabled = true;
            axeVapor.particleTexture = new Texture("https://models.babylonjs.com/Demos/weaponsDemo/textures/vaporParticles.png", scene, false, false);
            axeVapor.spriteCellWidth = 256;
            axeVapor.spriteCellHeight = 256;
            axeVapor.startSpriteCellID = 0;
            axeVapor.endSpriteCellID = 3;
            axeVapor.spriteCellChangeSpeed = 0;
            axeVapor.spriteRandomStartCell = true;
            axeVapor.updateSpeed = 1 / 30;
            // render order
            axe.renderingGroupId = 1;
            axeIce.renderingGroupId = 1;
            axeSnow.renderingGroupId = 1;
            axeVapor.renderingGroupId = 1;
            // glow mask switch for node material emissive texture to be accessible to the glow layer
            gl.referenceMeshToUseItsOwnMaterial(axe);
            return { axeParent, axeSnow, axeVapor };
        });
}
function toAxe(bypass, sceneAnimParameters, camera, playAnimation, scene) {
    axeParent.rotation = new Vector3(0, Math.PI, 0);
    var motionKeys = [];
    if (bypass) {
        var midFrame = Math.floor(sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].frame * 0.5);
        var midDistance = Math.abs((sceneAnimParameters.toSword[sceneAnimParameters.toSword.length - 1].value - sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value) * 0.3);
        motionKeys = [
            { frame: 0, value: sceneAnimParameters.animationTarget.position.x },
            { frame: midFrame, value: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].value + midDistance },
            { frame: midFrame + 1, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value - midDistance },
            { frame: sceneAnimParameters.toDagger[sceneAnimParameters.toDagger.length - 1].frame, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value }
        ];
    } else {
        motionKeys = [
            { frame: 0, value: sceneAnimParameters.animationTarget.position.x },
            { frame: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].frame, value: sceneAnimParameters.toAxe[sceneAnimParameters.toAxe.length - 1].value }
        ];
    }
    sceneAnimParameters.zoomAxe[0].value = camera.radius;
    playAnimation(scene, sceneAnimParameters.animationTarget, "position.x", motionKeys, false, true, false);
    playAnimation(scene, camera, "radius", sceneAnimParameters.zoomAxe, false, true, false);    
}
function activateAxeMagic(trigger, playAnimation, scene) {
    if (trigger) {
        playAnimation(scene, axeParameters.frostColorParam, "value", axeParameters.freezeStartKeys, false, true, false);
        playAnimation(scene, axeParameters.emissiveParam, "value", axeParameters.glowStartKeys, false, true, false);
        playAnimation(scene, axeIceParameters.freezeParam, "influence", axeIceParameters.freezeStartKeys, false, true, false);
        playAnimation(scene, axeIceParameters.iceBladeParam, "influence", axeIceParameters.iceBladeStartKeys, false, true, false);
        playAnimation(scene, axeIceParameters.iceTranslucencyParam, "value", axeIceParameters.iceTranslucencyStartKeys, false, true, false);
    } else {
        playAnimation(scene, axeIceParameters.iceBladeParam, "influence", axeIceParameters.iceBladeFinishKeys, false, true, false);
        playAnimation(scene, axeParameters.emissiveParam, "value", axeParameters.glowFinishKeys, false, true, false);
        playAnimation(scene, axeIceParameters.freezeParam, "influence", axeIceParameters.freezeFinishKeys, false, true, false);
        playAnimation(scene, axeIceParameters.iceTranslucencyParam, "value", axeIceParameters.iceTranslucencyFinishKeys, false, true, true, axeParameters.frostColorParam, "value", axeParameters.freezeFinishKeys, false, true);
    }
}

export {
    toAxe,
    weaponAxe,
    activateAxeMagic,
}