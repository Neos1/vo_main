import Personal from 'web3-eth-personal';
import { ETH_NODE } from '../../constants';
import { Web3ManagerModel } from './Web3ManagerModel';

// TODO: remove before production
// tools to send transactions right from console
// 1. add personal
class Web3ManagerModelWithPersonal extends Web3ManagerModel {

    /**
     * web3 personal interface for account manipulations
     * through rpc connections 
     * @type {object}
     */
    personal;
    
    constructor() {
        super();
        this.personal = new Personal(ETH_NODE);
    }

}

export default Web3ManagerModelWithPersonal;
export {
    Web3ManagerModelWithPersonal
}