import {
    Grid,
    Button,
    Control,
    AdvancedDynamicTexture 
} from '@babylonjs/gui/2D';

const buttons = [{
    name: "left",
    width: "55px",
    column: 0,
    imageUrl: "https://models.babylonjs.com/Demos/weaponsDemo/textures/leftButton.png",
    verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    onPointerClickObservable: (acceptInput, updateWeaponState, updateWeaponsPosition) => {
        if (acceptInput) {
            updateWeaponsPosition("left");
        }
    }
}, {
    name: "activate",
    width: "130px",
    column: 1,
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
    column: 2,
    imageUrl: "https://models.babylonjs.com/Demos/weaponsDemo/textures/rightButton.png",
    verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    onPointerClickObservable: (acceptInput, updateWeaponState, updateWeaponsPosition) => {
        if (acceptInput) {
            updateWeaponsPosition("right");
        }
    }
}];


const controls = ({ acceptInput, updateWeaponState, updateWeaponsPosition }) => {
    // GUI
    var guiLayer = AdvancedDynamicTexture.CreateFullscreenUI("guiLayer");
    var guiContainer = new Grid("uiGrid");
    guiContainer.addRowDefinition(1, false);
    guiContainer.addColumnDefinition(1 / 3, false);
    guiContainer.addColumnDefinition(1 / 3, false);
    guiContainer.addColumnDefinition(1 / 3, false);
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