import { observable, computed, action, runInAction } from "mobx";

//import contracts from '../../contracts';
import storage from "../../utils/storage";

import avatar from '../../img/avatar.png';
import eventEmitter from "../../utils/event-emitter";



window.fs = window.require('fs');

const path = require('path')
const PATH_TO_WALLETS = window.__ENV == 'development'
    ? "C:/Users/User/Documents/git/voter/src/wallets.json"
    : path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'wallets/wallets.json')




class AccountModel {
    @observable name;
    @observable address;
    @observable wallet_object;
    @observable account_type;
    @observable tokens = 0;
    @observable accounts = JSON.parse(window.fs.readFileSync(PATH_TO_WALLETS, 'utf8'));


    constructor() {
        const _self = this;
        const address = storage.getItem('account');
        window.fs.watchFile(PATH_TO_WALLETS, (curr, prev)=>{
            _self.accounts = JSON.parse(window.fs.readFileSync(PATH_TO_WALLETS, 'utf8'))
        }) 

        if (!address) return;

        if (web3.currentProvider && web3.currentProvider.connected) {
            _self.setAccount(address);
        } else {
            _self.unsubscribe = eventEmitter.subscribe('web3:connected', (data) => {
                _self.setAccount(address);
                _self.unsubscribe();
            })
        }
    }

    @computed
    get authorized() {
        return this.address ? true : false;
    }

    @computed
    get current() {
        return this.address ? this.address : 0;
    }

    @computed 
    get options() {
       return Object.keys(this.accounts).map(item => ({
            value: item,
            label: this.accounts[item].name + ' - ' + item
        }))
    }

    @computed 
    get type() {
       if (this.account_type === 0) return 'Упр. ';
       if (this.account_type === 1) return 'Адм. ';
       return '';
    }

    @computed 
    get avatar() {
        return avatar;
    }

    @action
    setAccount(address) {
        if (!this.accounts[address]) return null;
        const _self = this;
        _self.name = this.accounts[address].name;
        _self.address = address;
        _self.wallet_object = this.accounts[address].wallet_object;
        storage.setItem('account', address);
        runInAction(() => {
            _self.getAccountType()
                .then((type) => {
                    _self
                        .getTokens().catch(e => {
                            console.log('web3 error getTokens: ' + e.message)
                        })
                }).catch(e => {
                    console.log('web3 error getAccountType: ' + e.message)
                    _self.account_type = undefined;
                    _self.tokens = 0;
                })
        })
    }

    @action
    unsetAccount() {
        this.name = undefined;
        this.address = undefined;
        this.wallet_object = undefined;
        this.account_type = undefined;
        this.tokens = 0;
        storage.removeItem('account');
    }

    @action
    getAccountType() {
        const _self = this;
    }

    @action
    getTokens() {
        const _self = this;
        
    }
}

const accountStore = new AccountModel(); 
export default accountStore;