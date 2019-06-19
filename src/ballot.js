/*-------------------------------------------------------*/
import 'bootstrap-4-grid/scss/grid/bootstrap-grid.scss';
import './styles/ballot/basic.scss'

// LOCALES

import React from "react";
import { render } from "react-dom";
import { Provider } from 'mobx-react';
import { ENV } from './constants/common';
// STORES
//import web3ManagerStore from "./models/Web3Manager/Web3ManagerInstance";
import accountStore from "./models/BallotAccount/AccountModel";


// MODELS
//import HashParser from './components/ballot/HashParser/HashParser';
import LocalizedRouter from './components/ballot/LocalizedRouter/LocalizedRouter';
import SimpleRouter from './routes/simpleRouter';
import contractModel from './models/ContractModel';


const stores = { 
	contractModel,
	accountStore,
};

window.stores = stores;
window.__ENV = ENV;
window.web3 = require('web3');

render(
	<Provider {...stores}>
		<div>
			<SimpleRouter/>
		</div>
	</Provider>,
	document.getElementById("root")
);