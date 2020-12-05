import React from 'react';
// import "@babylonjs/core/Animations/animationGroup";
import "@babylonjs/core/Meshes/meshBuilder";
import '@babylonjs/core/Materials/standardMaterial';
import "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
// import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from  '@babylonjs/core/Materials/Textures/cubeTexture'
// import { InterpolateValueAction} from '@babylonjs/core/Actions/interpolateValueAction';
// import {
//     CombineAction,
//     SetValueAction,
//     DoNothingAction,
//     SetStateAction
// } from '@babylonjs/core/Actions/directActions';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { BackgroundMaterial } from '@babylonjs/core/Materials/Background/backgroundMaterial';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';

import BabylonScene from '../SceneComponent';

const customAction = (mesh, scene) => {
    mesh.actionManager = new ActionManager(scene);
    mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
            alert('jahan chaha wahan raha');
            console.log('jahan chaha wahan raha');
        }));
}

const Basic = (props) => {
    const setup = (e) => {
        const { canvas, scene } = e;
        const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 10, Vector3.Zero(), scene);
        camera.minZ = 0.001;
        camera.wheelPrecision = 50;
        camera.attachControl(canvas, true);

        const light = new HemisphericLight('hemi', Vector3.Up(), scene);
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        const cube = Mesh.CreateBox("cube", 2, scene);
        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);

        // Create and tweak the background material.
        const backgroundMaterial = new BackgroundMaterial("backgroundMaterial", scene);
        backgroundMaterial.reflectionTexture = new CubeTexture("public/assets/textures/TropicalSunnyDay", scene);
        backgroundMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skybox.material = backgroundMaterial;
        customAction(cube, scene);
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

export default Basic