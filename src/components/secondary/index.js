import React, { memo, useContext } from "react";
import { store } from '../../store';
import './style.sass';

const Secondary = (props) => {
    const { state, dispatch } = useContext(store);
    console.log('Secondary');
    return(
        <>
            <div className='level'>
                click
        </div>
            <button onClick={() => { dispatch({ type: 'SET_CITY_BFR' }) }}>
                click
        </button>
        </>
    );
}
export default memo(Secondary);