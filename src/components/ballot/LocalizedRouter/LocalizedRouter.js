/*-------------------------------------------------------*/
import React, {Component} from 'react';
import { HashRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import Routes from '../../../routes/ballot';

/*-------------------------------------------------------*/
@observer
export default class LocalizedRouter extends React.Component {
	render() {
		return (
			<HashRouter>
				<div id="app">
					<Routes />
				</div>
			</HashRouter>
		)
	}
}