import { observable, computed, action, runInAction } from "mobx";

//import contracts from '../../contracts';
import storage from "../../utils/storage";

import avatar from '../../img/avatar.png';
import eventEmitter from "../../utils/event-emitter";



window.fs = window.require('fs');

const path = require('path')
const PATH_TO_WALLETS = window.__ENV == 'development'
    ? path.join(window.process.env.INIT_CWD, "./wallets/")
    : path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './wallets/')




class AccountModel {
    @observable name;
    @observable address; //='0xd02b332792c6ebbab85783fea8383c693ae462b2';
    @observable wallet_object;
    @observable account_type;
    @observable tokens = 0;
    @observable accounts = {};

    constructor() {
        const _self = this;
        const address = storage.getItem('account');
        
        let files = window.fs.readdirSync(PATH_TO_WALLETS); 
            files.map( file =>{
                let wallet = JSON.parse(fs.readFileSync(path.join(PATH_TO_WALLETS, file), 'utf8'))
                let wallet_object = {}
                wallet_object[wallet.address] = wallet
                _self.accounts = Object.assign(_self.accounts, wallet_object)
            });

        window.fs.watch(PATH_TO_WALLETS, (evtType, file)=>{
            if (file) {
                if(evtType === 'change'){
                    let wallet = JSON.parse(fs.readFileSync(path.join(PATH_TO_WALLETS, file), 'utf8'))
                    let wallets = _self.accounts
                    this.accounts = {}

                    let wallet_object = {}
                    wallet_object[wallet.address] = wallet

                    this.accounts = Object.assign(wallets, wallet_object)
                }
            } else {
                console.info('filename not provided');
            }
        }) 
        

        if (!address) return;

        /*if (web3.currentProvider && web3.currentProvider.connected) {
            _self.setAccount(address);
        } else {
            _self.unsubscribe = eventEmitter.subscribe('web3:connected', (data) => {
                _self.setAccount(address);
                _self.unsubscribe();
            })
        }*/
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
        return Object.keys(this.accounts).map((item, index) => ({
            value: item,
            label: this.accounts[item].address
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
        _self.name = "Кошелек";
        _self.address = address;
        _self.wallet_object = this.accounts[address];
        storage.setItem('account', address);
        /*runInAction(() => {
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
        })*/
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

const accountStore = window.accountStore = new AccountModel(); 
export default accountStore;