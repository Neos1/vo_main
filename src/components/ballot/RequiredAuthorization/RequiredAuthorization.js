import React from 'react';
import { observer, inject } from 'mobx-react';
import {BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';

@inject('accountStore') @observer
class RequiredAuthorization extends React.Component {
    render() {
        const props = this.props;
        const accountStore = props.accountStore;
        if (!accountStore.authorized) return <Redirect to="/"/>
        return this.props.children
    }
}

export default RequiredAuthorization;