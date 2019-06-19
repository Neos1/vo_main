/*-------------------------------------------------------*/
/* imports */

import React from 'react';
import * as RouterDOM from "react-router-dom";
import { observer, inject } from 'mobx-react';
import { preparePath, getDefaultLanguange, getRoutePrefix } from '../../../utils/locale';
import PropTypes from 'prop-types';

/*-------------------------------------------------------*/
/* delcarations */

@observer
class SwitchFactory extends React.Component {
    static propTypes = {
        routes: PropTypes.array.isRequired,
        redirects: PropTypes.array,
    };

    render() {
        const { generateRouting } = this;
        const { routes, redirects } = this.props;
        //this.lng = getDefaultLanguange();
        this.routePrefix = getRoutePrefix();
        return (
            <RouterDOM.Switch>
                {this.generateRouting(routes, redirects)}
            </RouterDOM.Switch>
        );
    }

    generateRouting(routes, redirects) {
        const { lng, routePrefix } = this;
        const routeElemens = routes.map((value, idx) => {
            let newProps = {...value};
            if (newProps.path) newProps.path = preparePath(routePrefix, newProps.path);
            return <RouterDOM.Route key={idx} {...newProps} />
        });
        const redirectElemens = redirects.map((value, idx) => {
            let newProps = {...value};
            newProps.from = preparePath(lng, newProps.from);
            newProps.to = preparePath(lng, newProps.to);
            return <RouterDOM.Redirect key={idx + routeElemens.length} {...newProps} />
        });
        return [...routeElemens, ...redirectElemens];
    }
}

/*-------------------------------------------------------*/
/* exports */

export default SwitchFactory;
