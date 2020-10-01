import React, { memo, useState, useRef } from "react";

const WebPageLoader = (props) => {
    const iframeRef = useRef(null);
    const [url, setUrl] = useState('');
    const [loadUrl, setLoadUrl] = useState('');
    const [loadHtml, setHtml] = useState('');
    const [prefix, setPrefix] = useState('http');
    
    return(
        <>
            <select value={prefix} onChange={(e) => { setPrefix(e.target.value) }}>
                <option value="http">http</option>
                <option value="https">https</option>
            </select>
            ://<input onChange={(e) => { setUrl(e.target.value) }}></input>
            <button onClick={() => {
                setLoadUrl(`${prefix}://${url}`)
            }}>Load</button>
            <button onClick={() => {
                console.log(iframeRef.current); 
                window.open("https://clri-ltc.ca/files/2018/09/TEMP-PDF-Document.pdf","_blank");
            }}>Inspect</button>
            {loadUrl && <iframe ref={iframeRef} src={loadUrl} style={{height:'100vh', width:'-webkit-fill-available'}}></iframe>}
            {/* {loadHtml && loadHtml} */}
        </>
    );
}
export default memo(WebPageLoader);