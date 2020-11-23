import { Scene} from '@babylonjs/core/scene';
import { Engine } from '@babylonjs/core/Engines/engine';
import React, { useEffect } from 'react';

const BaseScene = (props) => {
  let canvas, engine;
  const onResizeWindow = () => {
    if (engine) {
      engine.resize();
    }
  }
  const onCanvasLoaded = (c) => {
    if (c !== null) {
      canvas = c;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  useEffect(() => {
    engine = new Engine(canvas, true, props.engineOptions, props.adaptToDeviceRatio);
    let scene = new Scene(engine);
    if (typeof props.onSceneMount === 'function') {
      props.onSceneMount({ scene, engine, canvas });
    } else {
      console.error('onSceneMount function not available');
    }
    // Resize the babylon engine when the window is resized
    window.addEventListener('resize', onResizeWindow);
    return () => {
      window.removeEventListener('resize', onResizeWindow);
    }
  }, []);
  return (
    <canvas
      // id="renderCanvas"
      ref={onCanvasLoaded}
    />
  )
}

export default BaseScene