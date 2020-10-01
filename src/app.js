import React from "react";
import ReactDOM from "react-dom";
import { StateProvider } from './store';
import Main from './components/main';

ReactDOM.render(
    <StateProvider>
        <Main />
    </StateProvider>
    , document.getElementById("root")
);