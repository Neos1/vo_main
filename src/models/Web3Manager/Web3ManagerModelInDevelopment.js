import { Web3ManagerModelWithPersonal } from './Web3ManagerModelWithPersonal';

// TODO: remove before production
// tools to send transactions right from console
// 1. add personal to web3 instance
// 2. store web3 instance as global variable
// 3. store Buffer as global variable
// 4. store Tx as global variable 

const Buffer = require('buffer/').Buffer;
const Tx = require('ethereumjs-tx')
window.Buffer = Buffer;
window.Tx = Tx;

class Web3ManagerModelInDevelopment extends Web3ManagerModelWithPersonal {
    constructor() {
        super();
        this.web3.personal = this.personal;
        window.web3 = this.web3;
    }
}

export default Web3ManagerModelInDevelopment;
export {
    Web3ManagerModelInDevelopment
}