/*-------------------------------------------------------*/
/* imports */

import React, { Component } from 'react';
import * as RouterDOM from "react-router-dom";
import {withRouter} from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { preparePath } from '../../../utils/locale';

/*-------------------------------------------------------*/
/* delcarations */

function localizationHelper(props) {
    return {
        lng: props.translationStore.lng,
        props: _.omit(props, 'translationStore', 'match', 'history', 'staticContext')
    };
}

@inject('translationStore') @observer
class Link extends Component {
    render() {
        let { lng, props } = localizationHelper(this.props);
        let { to } = props;
        props.to = preparePath(lng, to);
        return <RouterDOM.Link {...props} />;
    }
}

@withRouter @inject('translationStore') @observer
class NavLink extends Component {
    render() {
        let newProps = _.clone(this.props);
        let { lng, props } = localizationHelper(this.props);
        let { to } = props;
        props.to = preparePath(lng, to);
        return <RouterDOM.NavLink {...props} />
    }
}

@inject('translationStore') @observer
class Redirect extends Component {
    render() {
        let { lng, props } = localizationHelper(this.props);
        let { from, to } = props;
        props.from = preparePath(lng, from);
        props.to = preparePath(lng, to);
        return <RouterDOM.Redirect {...props} />
    }
}

/*-------------------------------------------------------*/
/* exports */

export { Link, NavLink, Redirect };
