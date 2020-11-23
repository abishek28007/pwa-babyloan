import {
    Grid,
    Button,
    Control,
    AdvancedDynamicTexture 
} from '@babylonjs/gui/2D';
import { 
    Space,
    Vector3
} from '@babylonjs/core/Maths/math';

const buttons = [{
    name: "left",
    width: "55px",
    column: 1,
    imageUrl: "https://models.babylonjs.com/Demos/weaponsDemo/textures/leftButton.png",
    onPointerClickObservable: (acceptInput, updateWeaponState, updateWeaponsPosition) => {
        if (acceptInput) {
            updateWeaponsPosition("left");
        }
    }
}, {
    name: "activate",
    width: "130px",
    column: 2,
    imageUrl: "https://models.babylonjs.com/Demos/weaponsDemo/textures/activateButton.png",
    verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    onPointerClickObservable: (acceptInput, updateWeaponState) => {
        if (acceptInput) {
            updateWeaponState(true);
        }
    }
}, {
    name: "right",
    width: "55px",
    column: 3,
    imageUrl: "https://models.babylonjs.com/Demos/weaponsDemo/textures/rightButton.png",
    onPointerClickObservable: (acceptInput, updateWeaponState, updateWeaponsPosition) => {
        if (acceptInput) {
            updateWeaponsPosition("right");
        }
    }
}];


const controls = ({ acceptInput, scene, cameraControl, focusedMesh, updateWeaponState, updateWeaponsPosition }) => {
    var inertialAlpha = 0;
    var inertialBeta = 0;
    var inertia = 0.95;

    // add listener for key press
    document.addEventListener('keydown', updateWeaponState);
    document.addEventListener('keydown', updateWeaponsPosition);

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
    var guiLayer = AdvancedDynamicTexture.CreateFullscreenUI("guiLayer");
    var guiContainer = new Grid("uiGrid");
    guiContainer.addRowDefinition(1, false);
    guiContainer.addColumnDefinition(1 / 5, false);
    guiContainer.addColumnDefinition(1 / 5, false);
    guiContainer.addColumnDefinition(1 / 5, false);
    guiContainer.addColumnDefinition(1 / 5, false);
    guiContainer.addColumnDefinition(1 / 5, false);
    guiContainer.paddingTop = "50px";
    guiContainer.paddingLeft = "50px";
    guiContainer.paddingRight = "50px";
    guiContainer.paddingBottom = "50px";
    guiLayer.addControl(guiContainer);

    // Buttons
    buttons.forEach(function (button) {
        const btn = Button.CreateImageOnlyButton(button.name, button.imageUrl);
        btn.width = button.width;
        btn.height = "55px";
        btn.thickness = 0;
        console.log(button.horizontalAlignment,Control.HORIZONTAL_ALIGNMENT_LEFT)
        if (button.verticalAlignment)
            btn.verticalAlignment = button.verticalAlignment;
        btn.onPointerClickObservable.add(() => {
            button.onPointerClickObservable(acceptInput, updateWeaponState, updateWeaponsPosition);
        });
        // add button to GUI
        guiContainer.addControl(btn, 0, button.column);
    });
}

export default controls