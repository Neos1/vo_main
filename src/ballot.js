/*-------------------------------------------------------*/
import 'bootstrap-4-grid/scss/grid/bootstrap-grid.scss';
import './styles/ballot/basic.scss'

// LOCALES

import React from "react";
import { render } from "react-dom";
import { Provider } from 'mobx-react';

// STORES
import web3ManagerStore from "./models/Web3Manager/Web3ManagerInstance";
import accountStore from "./models/BallotAccount/AccountModel";


// MODELS
//import HashParser from './components/ballot/HashParser/HashParser';
import LocalizedRouter from './components/ballot/LocalizedRouter/LocalizedRouter';

const stores = { 
	web3ManagerStore,
	accountStore,
};

window.stores = stores;

render(
	<Provider {...stores}>
		<div>
			<LocalizedRouter />
		</div>
	</Provider>,
	document.getElementById("root")
);