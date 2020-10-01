import React, { memo, useState } from "react";

const Tertiary = (props) => {
    const [count, setCount] = useState(0);
    console.log('Tertiary')
    return(
        <button onClick={() => { setCount(count + 1) }}>
            click{count}
        </button> 
    );
}
export default memo(Tertiary);