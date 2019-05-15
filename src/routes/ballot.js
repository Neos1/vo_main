import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import SwitchFactory from '../components/common/SwitchFactory/SwitchFactory';
import Login from '../components/ballot/Login/Login';
import Main from "../components/ballot/Main/Main";


export default () => (
    <div>
        <SwitchFactory
            routes={[
                { path: "", exact: true, component: withRouter(Main) },
                { path: "/cabinet", component:  withRouter(Main)},
                { component: function () { return (<div>404</div>) } },
            ]}
            redirects = {[]}
        />
    </div>
);
