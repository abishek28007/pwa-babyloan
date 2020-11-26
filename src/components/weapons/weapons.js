import React from 'react';
import '@babylonjs/loaders/glTF';
// import '@babylonjs/inspector';
// import "@babylonjs/core/Debug/debugLayer"; 

import { 
    Space,
    Color3,
    Vector3
} from '@babylonjs/core/Maths/math';
import { InterpolateValueAction, StateCondition, CombineAction, SetValueAction, DoNothingAction, SetStateAction } from '@babylonjs/core/Actions';
import { Mesh, StandardMaterial } from '@babylonjs/core';
import { PointLight } from '@babylonjs/core/Lights'
import { Tools } from '@babylonjs/core/misc/tools';
import { SineEase } from '@babylonjs/core/Animations/easing';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { Animation } from '@babylonjs/core/Animations/animation';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { EasingFunction } from '@babylonjs/core/Animations/easing';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents';
import { NoiseProceduralTexture } from '@babylonjs/core/Materials/Textures/Procedurals/noiseProceduralTexture';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';

import BabylonScene from '../SceneComponent';
import { toAxe, weaponAxe, activateAxeMagic } from './axe';
import { toSword, weaponSword, activateSwordMagic }  from './sword';
import { toDagger, weaponDagger, activateDaggerMagic, } from './dagger';
import controls from './Controls';

// for each easing function, you can choose between EASEIN (default), EASEOUT, EASEINOUT
var easingFunction = new SineEase();
easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

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
function playAnimation(scene, parameter, animValue, animKeys, animLooping, useEasing, linkAnimation, linkParameter, linkAnimValue, linkAnimKeys, linkAnimLooping, linkUseEasing) {

    // create animation clips
    var linkParamAnim = null;
    var paramAnim = new Animation("paramAnim", animValue, 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    if (linkAnimation) {
        linkParamAnim = new Animation("linkParamAnim", linkAnimValue, 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
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

const Weapons = (props) => {
    const setup = (e) => {
        const { canvas, scene } = e;
        // create and position arc-rotate camera
        var camera = new ArcRotateCamera("ArcRotateCamera", Tools.ToRadians(-270), Math.PI / 2, 90, new Vector3(0, 0, 0), scene);

        // camera controls
        var cameraControl = false;
        scene.onKeyboardObservable.add(evt => {
            if (evt.type !== KeyboardEventTypes.KEYDOWN) {
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
        scene.clearColor = new Color3(0.1, 0.1, 0.1);

        // create light
        var dirLight1 = new DirectionalLight("dirLight1", new Vector3(0, 0, 0), scene);
        dirLight1.direction = new Vector3(-0.5, 0.38, 0.67);
        dirLight1.position = camera.position;
        dirLight1.parent = camera;


        // Dagger
        var daggerMagicActive = false;
        // Sword
        var swordMagicActive = false;
        //Axe
        var axeMagicActive = false;

        (async ()=>{
            // scene position meshes
            var weaponsParent = new AbstractMesh("weaponsParent", scene);
            weaponsParent.position = new Vector3(0, 0, 0);
            var activeWeapon = "dagger";
            var gl = new GlowLayer("glow", scene, {
                mainTextureFixedSize: 1024,
                blurKernelSize: 64
            });
            gl.intensity = 1.25;

            /**
             * DAGGER
             */
            const { daggerEmbers, daggerParent } = await weaponDagger(scene, gl, weaponsParent, noiseTexture)            
            /**
             * SWORD
             */
            const { swordParent, swordGlow, swordBladeReverseWipe } = await weaponSword(scene, gl, weaponsParent)

            /**
             * AXE
             */
            const { axeParent, axeSnow, axeVapor } = await weaponAxe(scene, gl, weaponsParent, noiseTexture)

            // active mesh
            var focusedMesh = daggerParent;
            // mesh parameter objects
            var sceneAnimParameters = {
                "animationTarget": weaponsParent,
                "daggerRadius": "0.9",
                "toDagger": [
                    { frame: 0, value: 0 },
                    { frame: 90, value: 0 }
                ],
                "zoomDagger": [
                    { frame: 0, value: 0 },
                    { frame: 90, value: 90 }
                ],
                "swordRadius": "2",
                "toSword": [
                    { frame: 0, value: 0 },
                    { frame: 90, value: -400 }
                ],
                "zoomSword": [
                    { frame: 0, value: 0 },
                    { frame: 90, value: 220 }
                ],
                "axeRadius": "1.25",
                "toAxe": [
                    { frame: 0, value: 0 },
                    { frame: 90, value: -800 }
                ],
                "zoomAxe": [
                    { frame: 0, value: 0 },
                    { frame: 90, value: 120 }
                ]
            };
            // particle noise
            var noiseTexture = new NoiseProceduralTexture("perlin", 256, scene);
            noiseTexture.animationSpeedFactor = 5;
            noiseTexture.persistence = 2;
            noiseTexture.brightness = 0.5;
            noiseTexture.octaves = 6;

            // new render pipeline
            var pipeline = new DefaultRenderingPipeline("renderPass", true, scene, scene.camera);
            pipeline.imageProcessingEnabled = false;
            // glow layer
            pipeline.glowLayerEnabled = true;

            function playParticleSystem() {
                if (activeWeapon == "dagger") {
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
            let x = 0;

            // update visible weapon
            function updateWeaponsPosition(button) { // left arrow key
                if(button.changedTouches){
                    let newX = button.changedTouches['0'].screenX;
                    button = x < newX ? 'left' : 'right';
                    x = newX;
                }
                if ((event.keyCode == 37 || button == "left") && acceptInput) {
                    if (activeWeapon == "dagger") {
                        if (daggerMagicActive) {
                            activateDaggerMagic(false, playAnimation, scene);
                            daggerMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 500);
                            setTimeout(inputDelay, 3500);
                            setTimeout(playParticleSystem, 500);
                            setTimeout(()=>{
                                toSword(sceneAnimParameters, camera, playAnimation, scene);
                            }, 3500);
                            setTimeout(inputDelay, 3500);
                        } else {
                            toSword(sceneAnimParameters, camera, playAnimation, scene);
                            activeWeapon = "sword";
                            focusedMesh = swordParent;
                        }

                    } else if (activeWeapon == "sword") {
                        if (swordMagicActive) {
                            activateSwordMagic(false, swordBladeReverseWipe, playAnimation, scene);
                            swordMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 200);
                            setTimeout(inputDelay, 3500);
                            setTimeout(playParticleSystem, 200);
                            setTimeout(() => {
                                toAxe(false, sceneAnimParameters, camera, playAnimation, scene);
                                activeWeapon = "axe";
                                focusedMesh = axeParent;
                            }, 3500);
                            setTimeout(inputDelay, 2000);
                        } else {
                            toAxe(false, sceneAnimParameters, camera, playAnimation, scene);
                            activeWeapon = "axe";
                            focusedMesh = axeParent;
                        }
                    } else if (activeWeapon == "axe") {
                        if (axeMagicActive) {
                            activateAxeMagic(false, playAnimation, scene);
                            axeMagicActive = false;
                            acceptInput = false;
                            setTimeout(function () {
                                toDagger(true, sceneAnimParameters, camera, playAnimation, scene);
                                activeWeapon = "dagger";
                                focusedMesh = daggerParent;
                            }, 3500);
                            setTimeout(inputDelay, 2000);
                        } else {
                            toDagger(true, sceneAnimParameters, camera, playAnimation, scene);
                            activeWeapon = "dagger";
                            focusedMesh = daggerParent;
                        }
                    } else {
                        return;
                    }
                }
                if ((event.keyCode == 39 || button == "right") && acceptInput) { // right arrow key
                    if (activeWeapon == "dagger") {
                        if (daggerMagicActive) {
                            activateDaggerMagic(false, playAnimation, scene);
                            daggerMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 500);
                            setTimeout(inputDelay, 3500);
                            setTimeout(playParticleSystem, 500);
                            setTimeout(function () {
                                toAxe(true, sceneAnimParameters, camera, playAnimation, scene);
                                activeWeapon = "axe";
                                focusedMesh = axeParent;
                            }, 3500);
                            setTimeout(inputDelay, 3500);
                        } else {
                            toAxe(true, sceneAnimParameters, camera, playAnimation, scene);
                            activeWeapon = "axe";
                            focusedMesh = axeParent;
                        }
                    } else if (activeWeapon == "axe") {
                        if (axeMagicActive) {
                            activateAxeMagic(false, playAnimation, scene);
                            axeMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 50);
                            setTimeout(inputDelay, 1500);
                            setTimeout(toSword, 2500);
                            setTimeout(inputDelay, 2000);
                        } else {
                            toSword(sceneAnimParameters, camera, playAnimation, scene);
                            activeWeapon = "sword";
                            focusedMesh = swordParent;
                        }
                    } else if (activeWeapon == "sword") {
                        if (swordMagicActive) {
                            activateSwordMagic(false, swordBladeReverseWipe, playAnimation, scene);
                            swordMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 200);
                            setTimeout(inputDelay, 2500);
                            setTimeout(()=>{
                                toDagger(false, sceneAnimParameters, camera, playAnimation, scene);
                            }, 2500);
                            setTimeout(inputDelay, 2000);
                        } else {
                            toDagger(false, sceneAnimParameters, camera, playAnimation, scene);
                            activeWeapon = "dagger";
                            focusedMesh = daggerParent;
                        }

                    } else {
                        return;
                    }
                }
            }

            // update magic effects 
            function updateWeaponState(button) {
                if ((event.keyCode == 32 || button == true || button.type == "touchstart") && acceptInput) { // space bar to activate magic 
                    if (activeWeapon == "dagger") {
                        if (daggerMagicActive) {
                            activateDaggerMagic(false, playAnimation, scene);
                            daggerMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 500);
                            setTimeout(inputDelay, 3500);
                        } else {
                            activateDaggerMagic(true, playAnimation, scene);
                            daggerMagicActive = true;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 2000);
                            setTimeout(inputDelay, 3500);
                        }
                    } else if (activeWeapon == "sword") {
                        if (swordMagicActive) {
                            activateSwordMagic(false, swordBladeReverseWipe, playAnimation, scene);
                            swordMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 200);
                            setTimeout(inputDelay, 2500);
                        } else {
                            activateSwordMagic(true, swordBladeReverseWipe, playAnimation, scene);
                            swordMagicActive = true;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 600);
                            setTimeout(inputDelay, 1500);
                        }
                    } else if (activeWeapon == "axe") {
                        if (axeMagicActive) {
                            activateAxeMagic(false, playAnimation, scene);
                            axeMagicActive = false;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 50);
                            setTimeout(inputDelay, 1500);
                        } else {
                            activateAxeMagic(true, playAnimation, scene);
                            axeMagicActive = true;
                            acceptInput = false;
                            setTimeout(playParticleSystem, 1500);
                            setTimeout(inputDelay, 1500);
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

                if (evt.type === PointerEventTypes.POINTERDOWN) {
                    mouseDown = true;
                    if (Vector3.Dot(focusedMesh.up, camera.getWorldMatrix().getRotationMatrix().getRow(1)) >= 0) {
                        xRotationSign = -1;
                    } else {
                        xRotationSign = 1;
                    }
                    return;
                }
                if (evt.type === PointerEventTypes.POINTERUP) {
                    mouseDown = false;
                    return;
                }

                if (!mouseDown || evt.type !== PointerEventTypes.POINTERMOVE) {
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
            // document.addEventListener('touchstart', updateWeaponState);
            document.addEventListener('touchmove', updateWeaponsPosition);

            // remove listeners when scene disposed
            scene.onDisposeObservable.add(function () {
                document.removeEventListener('keydown', updateWeaponState);
                document.removeEventListener('keydown', updateWeaponsPosition);
            });

            // run every frame
            scene.registerBeforeRender(function () {
                if (cameraControl) {
                    return;
                }
                focusedMesh.rotate(Vector3.UpReadOnly, inertialAlpha, Space.LOCAL);
                focusedMesh.rotate(Vector3.Left(), inertialBeta, Space.WORLD);

                inertialAlpha *= inertia;
                inertialBeta *= inertia;
            });

            // GUI
            // controls({ acceptInput, updateWeaponState, updateWeaponsPosition })
        })();
        // scene.debugLayer.show();
    }
    const debug = (e) => {
        const { canvas, scene } = e;
        var camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, 0, 0), scene);
        camera.setPosition(new Vector3(20, 200, 400));
        camera.attachControl(canvas, true);
    
    
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;
        camera.lowerRadiusLimit = 150;
    
        scene.clearColor = new Color3(0, 0, 0);
    
        var redLight = new PointLight("omni", new Vector3(0, 50, 0), scene);
        var greenLight = new PointLight("omni", new Vector3(0, 50, 0), scene);
        var blueLight = new PointLight("omni", new Vector3(0, 50, 0), scene);
    
        redLight.diffuse = Color3.Red();
        greenLight.diffuse = Color3.Green();
        blueLight.diffuse = Color3.Blue();
    
        // Define states
        redLight.state = "on";
        greenLight.state = "on";
        blueLight.state = "on";
    
        // Ground
        var ground = Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
        var groundMaterial = new StandardMaterial("ground", scene);
        groundMaterial.specularColor = Color3.Black();
        ground.material = groundMaterial;
    
        // Boxes
        var redBox = Mesh.CreateBox("red", 20, scene);
        var redMat = new StandardMaterial("ground", scene);
        redMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
        redMat.specularColor = new Color3(0.4, 0.4, 0.4);
        redMat.emissiveColor = Color3.Red();
        redBox.material = redMat;
        redBox.position.x -= 100;
    
        var greenBox = Mesh.CreateBox("green", 20, scene);
        var greenMat = new StandardMaterial("ground", scene);
        greenMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
        greenMat.specularColor = new Color3(0.4, 0.4, 0.4);
        greenMat.emissiveColor = Color3.Green();
        greenBox.material = greenMat;
        greenBox.position.z -= 100;
    
        var blueBox = Mesh.CreateBox("blue", 20, scene);
        var blueMat = new StandardMaterial("ground", scene);
        blueMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
        blueMat.specularColor = new Color3(0.4, 0.4, 0.4);
        blueMat.emissiveColor = Color3.Blue();
        blueBox.material = blueMat;
        blueBox.position.x += 100;
    
        // Sphere
        var sphere = Mesh.CreateSphere("sphere", 16, 20, scene);
        var sphereMat = new StandardMaterial("ground", scene);
        sphereMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
        sphereMat.specularColor = new Color3(0.4, 0.4, 0.4);
        sphereMat.emissiveColor = Color3.Purple();
        sphere.material = sphereMat;
        sphere.position.z += 100;
    
        // Rotating donut
        //var donut = Mesh.CreateTorus("donut", 20, 8, 16, scene);
    
        // On pick interpolations
        var prepareButton = function (mesh, color, light) {
            var goToColorAction = new InterpolateValueAction(ActionManager.OnPickTrigger, light, "diffuse", color, 1000, null, true);
    
            mesh.actionManager = new ActionManager(scene);
            mesh.actionManager.registerAction(
                new InterpolateValueAction(ActionManager.OnPickTrigger, light, "diffuse", Color3.Black(), 1000))
                .then(new CombineAction(ActionManager.NothingTrigger, [ // Then is used to add a child action used alternatively with the root action. 
                    goToColorAction,                                                 // First click: root action. Second click: child action. Third click: going back to root action and so on...   
                    new SetValueAction(ActionManager.NothingTrigger, mesh.material, "wireframe", false)
                ]));
            mesh.actionManager.registerAction(new SetValueAction(ActionManager.OnPickTrigger, mesh.material, "wireframe", true))
                .then(new DoNothingAction());
            mesh.actionManager.registerAction(new SetStateAction(ActionManager.OnPickTrigger, light, "off"))
                .then(new SetStateAction(ActionManager.OnPickTrigger, light, "on"));
            
        }
        var customAction = function (mesh) {
            mesh.actionManager = new ActionManager(scene);
            mesh.actionManager.registerAction(
                new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
                    console.log('jahan chaha wahan raha');
                }));
        }
        
        
        
        // customAction(redBox);
        prepareButton(redBox, Color3.Red(), redLight);
        prepareButton(greenBox, Color3.Green(), greenLight);
        prepareButton(blueBox, Color3.Blue(), blueLight);
    
        // Conditions
        sphere.actionManager = new ActionManager(scene);
        var condition1 = new StateCondition(sphere.actionManager, redLight, "off");
        var condition2 = new StateCondition(sphere.actionManager, redLight, "on");
    
        sphere.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnLeftPickTrigger, camera, "alpha", 0, 500, condition1));
        sphere.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnLeftPickTrigger, camera, "alpha", Math.PI, 500, condition2));
    
        // Over/Out
        var makeOverOut = function (mesh) {
            mesh.actionManager.registerAction(new SetValueAction(ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor));
            mesh.actionManager.registerAction(new SetValueAction(ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", Color3.White()));
            //mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOutTrigger, mesh, "scaling", new Vector3(1, 1, 1), 150));
            //mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOverTrigger, mesh, "scaling", new Vector3(1.1, 1.1, 1.1), 150));
        }
    
        
    
        makeOverOut(redBox);
        makeOverOut(greenBox);
        makeOverOut(blueBox);
        makeOverOut(sphere);
    
        // scene's actions
        scene.actionManager = new ActionManager(scene);
        scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyUpTrigger,
            function () {
                if (message.light) {
                    redLight.diffuse = Color3.Black();
                } else {
                    redLight.diffuse = Color3.Red();
                } console.log(message.light);
            }
            ));
    }
    const run = (e) => {
        const { scene, engine } = e;
        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });
    };

    const onSceneMount = (e) => {
        setup(e);
        run(e);
    };

    return (
        <BabylonScene onSceneMount={onSceneMount} />
    )
}

export default Weapons