import React, { useContext } from "react";
// import { store } from '../store';
// import Secondary from './secondary';
// import Tertiary from './tertiary';
// import ModelCarMoving from './ModelCarMoving';
import Weapons from './weapons/weapons';
// import WebPageLoader from './WebPageLoader';

const Main = (props) => {
    // const { state, dispatch } = useContext(store);
    console.log('Main');
    return(
            // hello {state.key}
            // <Secondary/>
            // <Tertiary/>
            // <ModelCarMoving />
            <Weapons/>
            // <WebPageLoader />
    );
}
export default Main;