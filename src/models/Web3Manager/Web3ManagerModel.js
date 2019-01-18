import { observable, computed, action } from "mobx";
import Web3 from 'web3';
import { WS_ETH_NODE, WS_AUTO_RECONNECT } from '../../constants';
import eventEmitter from "../../utils/event-emitter";

/**
 * web3 socket provider class
 * @type {object}
 */
const { providers: { WebsocketProvider } } = Web3;

/**
 * Class representing a web3 connection manager
 * @class Web3ManagerModel
 */
class Web3ManagerModel {

    /**
     * first load flag
     * @type {boolean}
     */
    @observable initiallyConnected;

    /**
     * current state
     * @type {boolean}
     */
    @observable connected;

    /**
     * reconnection attempts counter
     * @type {number}
     */
    @observable reconnect_attempt = 0;

    /**
     * web3 instance
     * @type {object}
     */
    web3;

    /**
     * current web3 socket provider instance
     * @type {object}
     */
    provider;

    /**
     * reconnection attempts timeout id
     * @type {number}
     */
    timeout;
    
    /**
     * Web3ManagerModel constructor
     */
    constructor() {
        // init connection
        this.createProvider(WS_ETH_NODE)
            .then((provider) => {
                this.setProvider(provider);
            })
            .catch(e => console.log('web3 error: createProvider', e));
        // save current we3 instance to class property
        this.web3 = new Web3();
    }

    @computed
    /**
     * current state
     * @type {boolean}
     */
    get state() {
        return this.connected;
    }

    @computed
    /**
     * loading state
     * @type {boolean}
     */
    get loading() {
        return !this.initiallyConnected;
    }

    @action
    /**
     * creates and stores web3 provider instance
     * @method createProvider 
     * @param {string} url web3 socket connection url
     * @return {Promise<object>} web3 provider instance
     */
    createProvider(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('no provider is specified'));
            }
            const provider = new WebsocketProvider(url);
            // handle provider events
            this.initProviderListeners(provider);
            resolve(provider);
        })
    }
    
    @action
    /**
     * sets web3 provider instance
     * inits connection
     * @method setProvider 
     * @param {string} url web3 socket connection url
     */
    setProvider(provider) {
        this.provider = provider;
        this.web3.setProvider(provider);        
    }

    @action
    /**
     * init provider listeners to handle provider messages and errors
     * inits connection
     * @method initProviderListeners 
     * @param {object} provider web3 socket connection url
     */
    initProviderListeners(provider) {
        if (!provider) {
            throw(new Error('no provider is specified'));
        }
        provider.on("end", this.handleDirtyClose.bind(this));
        provider.on("connect", this.handleConnection.bind(this));
    }

    @action
    /**
     * make attempt to reconnect to web3 socket provider
     * @method reconnect 
     */
    reconnect() {
        console.log('web3 reconnecting...');
        // increment reconncetion attempts
        this.reconnect_attempt += 1;
        this.createProvider(WS_ETH_NODE)
            .then((provider) => {
                this.setProvider(provider);
            })
            .catch(e => console.log('web3 error: createProvider', e));
    }

    @action
    /**
     * handles connection close
     * @method handleDirtyClose
     * @param {object} e event object
     * @emits {web3:closed} when connection is closed
     */
    handleDirtyClose(e) {
        const _self = this;
        // close event is normally provided
        if (e && e.code != 1000 && e.wasClean) {
            return;
        }
        // reset connectino state
        this.connected = false;
        // fire event
        eventEmitter.emit('web3:closed');
        // do nothing if 5 reconnection attempts were made
        if (this.reconnect_attempt >= 5) {
            return;
        }
        console.log(`web3 reconnect in ${WS_AUTO_RECONNECT}ms`);
        // give it another try after timeout
        this.timeout = setTimeout(() => {
            this.reconnect();            
        }, WS_AUTO_RECONNECT);
        // make reconnection try immediatly
        if (this.reconnect_attempt == 0) {
            this.reconnect();
        }
    } 

    /**
     * handles connection establishment
     * @method handleConnection
     * @param {object} e event object
     * @emits {web3:connected} when connection is connected
     */
    handleConnection(e) {
        console.log('web3 connected');
        // fire event
        eventEmitter.emit('web3:connected', this.web3.currentProvider);
        // self loading state to loaded
        if (!this.initiallyConnected) {
            this.initiallyConnected = true;
        }
        // reset reconnection timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        // resest reconnection attempts counter
        this.reconnect_attempt = 0;
        // set current state as connected
        this.connected = true;
    }
}

export default Web3ManagerModel;
export {
    Web3ManagerModel
}