import React from 'react';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import Container from '../Container';
import {SimpleInput} from '../Input/index';
import Select from 'react-select';
import { Redirect } from '../../common/Navigation/Navigation';
import styles from './Login.scss';
import * as async from 'async';


const fs = window.require('fs');
const path  = window.require('path');

const Web3 = require('web3');

window.web3 = web3;
const lightwallet = require('../../../assets/lightwallet.min')
const txutils = lightwallet.txutils
const signing = lightwallet.signing
const HookedWeb3Provider = require("hooked-web3-provider");
const web3 = window.web3 = new Web3();
const BrowserSolc = require('../../../assets/browser-solc.min')

window.BrowserSolc = BrowserSolc;

@inject('accountStore') @observer
class Login extends React.Component {
    
    @observable step = 0;
    @observable selected = 0;
    @observable sol = ''
    @observable config = {};
    @observable wallets = {};

    @observable ERC20 = {
        hash: '',
        symbol:'',
        name:'',
        totalSupply: ''
    }
    @observable txHash = ''

    @observable seed = [];

    @observable contract = {
        name: '',
        hash: ''
    }
    @observable account = {
        password:"",
        passwordCheck:"",
        randomSeed:"",
        balances:[],
        addresses:[],
        keystore: {},
    };

  
    
    componentWillMount(){
        window.onerror = (e) =>{
            return;
        }

        let wallets = window.__ENV == 'development'
            ? JSON.parse(fs.readFileSync("C:/Users/User/Documents/git/voter/src/wallets.json", 'utf8'))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'wallets/wallets.json'), 'utf8'))
        
        
        this.wallets = wallets;

        let config = window.__ENV == 'development'
        ? JSON.parse(fs.readFileSync("C:/Users/User/Documents/git/voter/src/config.json", 'utf8'))
        : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), 'utf8'))

        web3.setProvider(new Web3.providers.HttpProvider(config.host));
        this.config = window.config = config;
    }

    componentDidMount() {
        document.body.classList.toggle('body-login')
        for (let i = 0; i < 12 ; i++){
            this.seed[i] = '';
        }  
    }

    componentWillUnmount() {
        document.body.classList.remove('body-login')
    }

    render() {
        const props = this.props;
        const accountStore = props.accountStore;
        let projects = this.config.projects.map((project, index)=>{
            return  <li key={index}><button type="button" className="btn btn--block btn--blue">{project.name}</button></li>
        })
       

        if (accountStore.authorized) return <Redirect to="/cabinet" />
        return (
            <div className={styles.login}>
                <Container>
                    <div className={styles.login__container}>
                        <div className={styles.login__welcome}>
                            {/* Окно логина */}
                            <div className={`${styles.login__form} ${this.step !== 0 ? styles.hidden : ''}`}>
                                <h3>Вход в систему голосования</h3>
                                <form name="login_form" onSubmit={this.handleSubmit}>
                                    <div className={styles.login__select}>
                                        <label> Выберите ваш ключ
                                            <Select
                                                multi={false}
                                                searchable={false}
                                                clearable={false}
                                                placeholder="Выберите файл со своим кошельком"
                                                value={this.selected}
                                                onChange={this.handleSelect}
                                                options={accountStore.options} />
                                        </label>
                                        <label> Введите пароль
                                            <SimpleInput type="password" name="password" required onChange={this.getPassword}/>
                                        </label>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button  type="submit" className="btn btn--block btn--blue btn--arrow">Войти</button>
                                        <a href="#" onClick={this.handleGetSeed}> У меня есть резервная фраза </a>
                                        <a href="#" onClick={this.handleCreateKey}> Хочу создать новый ключ </a>
                                    </div>
                                </form>
                            </div>
                            
                            {/** Восстановление по сиду */}
                            <div className={`${styles.seed__form} ${(this.step !== 2 && this.step!== 13)? styles.hidden : ''}`}>
                                {this.step == 2? <h3>Восстановление кошелька по резервной фразе</h3>: ''}
                                {this.step == 13? <h3>Проверка резервной фразы</h3>: ''}
                                <form name="seed" onSubmit={this.step == 2 ?this.recoverFromSeed: this.checkCreatedSeed}>
                                    <div className={styles.login__select}>
                                        { 
                                            this.seed.map((el, index)=>{
                                                return (<label key={index+1} className="small"> Слово №{index+1} <SimpleInput required={true} index={index} onChange={this.handleInputSeed}/> </label>)
                                            }) 
                                        }
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                        {this.step == 2? <a href="#" onClick={this.backToStart}> Вернуться к выбору ключа </a>: ''}
                                        {this.step == 13?<a href="#" onClick={this.handleShowSeed}> Я забыл резервную фразу </a> : ''}
                                    </div>
                                </form>
                            </div>
                            
                            {/** Окно загрузки  step: 21 - Проверка сида, 22 - сид проверен, 11 - создание ключа */}
                            <div className={`${styles.seed__loader + " " + styles.seed__form} 
                                        ${((this.step != 21) 
                                        && (this.step != 22) 
                                        && (this.step != 11) 
                                        && (this.step != 24) 
                                        && (this.step != 25)
                                        && (this.step != 33)
                                        && (this.step != 34)
                                        && (this.step != 37)
                                        && (this.step != 38)
                                        && (this.step != 40)
                                        && (this.step != 41)
                                        && (this.step != 51)
                                        && (this.step != 52)) ? styles.hidden : ''}`}>
                                
                                <div className={`${ ((this.step != 21) && (this.step != 11)  && (this.step != 24) && (this.step != 33) && (this.step != 37) && (this.step != 40) && (this.step != 51)) ? styles.hidden : ''}`}>
                                    <div className="cssload-aim"></div>
                                    { this.step == 21? <h3>Проверяем резервную фразу</h3> : ''}
                                    { this.step == 24? <h3>Идет сохранение ключа</h3> : ''}
                                    { this.step == 11? <h3>Идет создание ключа</h3> : ''}
                                    { this.step == 33? <h3>Проверяем адрес проекта</h3>: ''}
                                    { this.step == 37? <h3>Производим проверку контракта ERC20...</h3>: ''}
                                    { this.step == 40? <h3>Производим загрузку контракта, это может занять до 5 минут..</h3>: ''}
                                    { this.step == 51? <h3>Производим загрузку контракта ERC20, это может занять до 5 минут..</h3>: ''}
                                </div>

                                <div className={`${styles.seed__key} ${ (this.step != 22) ? styles.hidden : ''}`}>
                                    <h3>Резервная фраза проверена, ваш ключ:</h3>
                                    <div>
                                        <span>{this.account.addresses[0]}</span>  <span>{this.account.balances[0] / 1.0e18} Eth</span>
                                    </div>

                                </div>
                                
                                <div className={`${styles.seed__key} ${ (this.step != 25) ? styles.hidden : ''}`}>
                                    <h3>Ключ успешно сохранен</h3>
                                </div>
                                
                                <div className={`${styles.seed__key} ${ (this.step != 34) ? styles.hidden : ''}`}>
                                    <h3>Адрес проекта проверен</h3>
                                </div>
                                
                                <div className={`${styles.seed__key} ${ (this.step != 38) ? styles.hidden : ''}`}>
                                    <h3>Контракт проверен</h3>
                                    <h3>Общее число токенов: <strong>{this.ERC20.totalSupply}</strong></h3>
                                    <h3>Название: <strong>{this.ERC20.symbol}</strong></h3>
                                </div>

                                <div className={`${styles.seed__key} ${ (this.step != 41) ? styles.hidden : ''}`}>
                                    <h3>Контракт успешно загружен, теперь вы можете выбрать этот проект в списке проектов</h3>
                                </div>
                                <div className={`${styles.seed__key} ${ (this.step != 52) ? styles.hidden : ''}`}>
                                    <h3>Контракт успешно загружен</h3>
                                </div>

                                <div className={styles.login__submit}>
                                    <button onClick={this.handleChangePassword} type="button" className={`btn btn--block btn--blue ${this.step !== 22 ? styles.hidden : ''}`}>Далее</button>
                                    <button onClick={this.backToStart} type="button" className={`btn btn--block btn--blue ${this.step !== 25 ? styles.hidden : ''}`}>Далее</button>
                                    <button onClick={this.backToProjects} type="button" className={`btn btn--block btn--blue ${(this.step !== 34) && (this.step !== 41  ) ? styles.hidden : ''}`}>Продолжить</button>
                                    <button onClick={this.continueDeploy} type="button" className={`btn btn--block btn--blue ${(this.step !== 38) && (this.step !== 52) ? styles.hidden : ''}`}>Продолжить</button>
                                </div>
                            </div>
                            
                            {/** Установка пароля для ключа step: 23 - для существуюего ключа, 1 - для нового */}
                            <div className={`${styles.seed__form} ${((this.step != 23) && (this.step != 1)) ? styles.hidden : ''}`}>
                                <h3>Установка пароля</h3>
                                <form name="password_input" className={styles.login__select} onSubmit={this.step !== 1? this.handleSaveKey : this.continueCreateKey}>
                                    <label key="password"  className=""> Введите пароль
                                        <SimpleInput name="password" required={true} onChange={this.getPassword} type="password"/> 
                                    </label>
                                    <label key="password_confirm" required className=""> Введите пароль еще раз
                                        <SimpleInput  name="password_confirm" required={true} onChange={this.getPasswordCheck} type="password"/> 
                                    </label>

                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Создать</button>
                                    </div>
                                </form>
                            </div>
                            
                            {/** Окно записи сида step: 12 - Видимое */}
                            <div className={`${styles.seed__form} ${this.step !== 12 ? styles.hidden : ''}`}>
                                <h3>Запишите резервную фразу</h3>
                                <div className={styles.login__select}> 
                                    <p>
                                        Резервная фраза состоит из 12 слов, она может вам понадобиться для восстановления вашего ключа. 
                                        Обязательно запишите эти слова и не сообщайте их никому, помните, что эта фраза дает полный контроль над вашим ключом.
                                    </p>
                                    <p className={styles.seed__seed}>
                                        {this.account.randomSeed}
                                    </p>
                                </div>
                                <div className={styles.login__submit}>
                                    <button onClick={this.inputCreatedSeed} type="button" className="btn btn--block btn--blue">Я записал резервную фразу</button>
                                </div>
                            </div>
                            
                            {/** Окно выбора проекта */}
                            <div className={`${styles.seed__form} ${this.step !== 3 ? styles.hidden : ''}`}>
                                <h3>Выбор проекта</h3>
                                <div className={styles.login__select}> 
                                    <ul className={styles.login__projects}>
                                        {projects}
                                    </ul>
                                </div>
                                <div className={styles.login__submit}>
                                    <a href="#" onClick={this.selectDeploy}>Добавить проект</a>
                                </div>
                            </div>
                            
                            {/** Окно выбора деплоя: step = 31 - окно добавления проекта, 35 - выбор типа проекта */}
                            <div className={`${styles.seed__form} ${(this.step !== 31) && (this.step !== 35 )? styles.hidden : ''}`}>
                                <div className={this.step != 31? "hidden": ""}>
                                    <h3>Добавить новый проект</h3>
                                    <div className={styles.login__select}> 
                                        <p>
                                            Вы можете добавить проект, чтобы принимать участие в голосованиях по нему
                                        </p>
                                        <p className={styles.deploy__select}>
                                            <button onClick={this.existingProject} type="button" className="btn btn--block btn--blue">У меня есть адрес существующего проекта </button>
                                            <button onClick={this.newProject} type="button" className="btn btn--block btn--blue">Я хочу создать новый проект</button>
                                        </p>
                                    </div>
                                </div>

                                <div className={this.step != 35? "hidden": ""}>
                                    <h3>Создание нового проекта</h3>
                                    <div className={styles.login__select}> 
                                        <h4>
                                            Шаг 1
                                        </h4>
                                        <h4>
                                            Назначение владельцев проекта
                                        </h4>
                                        <p className={styles.deploy__select}>
                                            <button onClick={this.newAddress} type="button" className="btn btn--block btn--blue">Владельцы проекта уже имеют токены ERC-20, распределенные в соответствии с их долями</button>
                                            <button onClick={this.toCreateToken} type="button" className="btn btn--block btn--blue">Владельцы проекта еще не имеют токенов</button>
                                           
                                        </p>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <a href="#" onClick={this.selectDeploy}>Вернуться к выбору типа проектов</a>
                                    </div> 
                                </div>
                                
                            </div>
                            
                            {/** Существующий проект */}
                            <div className={`${styles.seed__form} ${this.step !== 32  ? styles.hidden : ''}`}>
                                <h3>Добавить проект</h3>
                                <form name="existing_project" onSubmit={this.checkExistingAddress}>
                                    <div className={styles.login__select}> 
                                        <p>
                                            Вы можете добавить проект, чтобы принимать участие в голосованиях по нему
                                        </p>
                                        <label> Укажите название проекта
                                            <SimpleInput maxLength="20" required onChange={this.getProjectName}/>
                                        </label>

                                        <label> Укажите адрес проекта
                                            <SimpleInput required onChange={this.getProjectHash}/>
                                        </label>
                                        
                                        <div className={styles.login__submit}>
                                            <button  type="submit" className="btn btn--block btn--blue">Добавить</button>
                                            <a href="#" onClick={this.selectDeploy}>Вернуться к выбору типа проектов</a>
                                        </div> 
                                    </div>
                                </form>
                            </div>
                            
                            {/** Новый адрес */}
                            <div className={`${styles.seed__form} ${this.step !== 36  ? styles.hidden : ''}`}>
                                <h3>Создание нового проекта</h3>
                                <form name="checkERC" onSubmit={this.checkExistingERC}>
                                    <div className={styles.login__select}> 
                                        <h4>
                                            Шаг 1
                                        </h4>
                                        <h4>
                                            Назначение владельцев проекта
                                        </h4>
                                        <div className={styles.deploy__input}>
                                            <label> Введите адрес ERC-20 контракта владельцев
                                            <SimpleInput required onChange={this.getERC20Hash}/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                    </div> 
                                </form>
                            </div>

                            {/** Шаг 2 деплоя существующего ERC20 */}
                            <div className={`${styles.seed__form} ${this.step !== 39  ? styles.hidden : ''}`}>
                                <h3>Создание нового проекта</h3>
                                <form name="deploy_step_2" onSubmit={this.deploySolidity}>                                
                                    <div className={styles.login__select}> 
                                        <h4>
                                            Шаг 2
                                        </h4>
                                        <h4>
                                            Загрузка контракта проекта
                                        </h4>
                                        <p>
                                            Контракт проекта будет загружен в сеть при помощи кошелька, для загрузки необходимо наличие на кошельке средств, в размере примерно 0.0001 Eth:
                                        </p>
                                        <div className={styles.deploy__input}>
                                            <label> Укажите название проекта (будет записано в блокчейн)
                                            <SimpleInput maxLength="20"  required onChange={this.getProjectName}/>
                                            </label>
                                            <label> Введите пароль ключа
                                            <SimpleInput required type='password' onChange={this.getPasswordCheck}/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                    </div> 
                                </form>
                            </div>
                            
                            {/** Создание ERC20 токена */}
                            <div className={`${styles.seed__form} ${this.step !== 5 ? styles.hidden : ''}`}>
                                <h3>Создание нового проекта</h3>
                                <form name="deploy_project" onSubmit={this.createTokenContract}>
                                    <div className={styles.login__select}> 
                                        <h4>
                                            Шаг 1
                                        </h4>
                                        <h4>
                                            Назначение владельцев проекта  
                                        </h4>
                                        <p>
                                        Контракт ERC20 будет загружен в сеть при помощи кошелька, указанного ниже. Для загрузки необходимо наличие на кошельке средств, в размере примерно 0.0001 Eth. Все ERC20 токены будут начислены на указанный ниже кошелек, после чего их можно будет распределить на необходимые адреса.
                                        </p>
                                        <p>{this.account.addresses[0]}   {Number((this.account.balances[0]/ 1.0e18)).toFixed(4)} ETH</p>
                                        <div className={styles.deploy__input}>
                                            <label> Укажите название токена (будет записано в блокчейн)
                                            <SimpleInput required onChange={this.getTokenName}/>
                                            </label>
                                            <label> Укажите символ токена
                                            <SimpleInput required onChange={this.getTokenChar}/>
                                            </label>
                                            <label> Укажите общее количество токенов
                                            <SimpleInput required onChange={this.getTokenCount}/>
                                            </label>
                                            <label> Введите пароль ключа
                                            <SimpleInput name="password" type='password' required onChange={this.getPasswordCheck}/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                    </div> 
                                </form>
                                
                            </div>

                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // -- KeyStore handlers
    @action
    getPassword = (e) => {
        this.account.password = e.target.value;
        e.target.classList.remove('field__input--error');

    }
    @action
    getPasswordCheck = (e) => {
        this.account.passwordCheck = e.target.value;
        e.target.classList.remove('field__input--error');
    }
    @action 
    createWallet = ()=>{
        if (this.account.password === this.account.passwordCheck){
            this.account.randomSeed = lightwallet.keystore.generateRandomSeed();
            lightwallet.keystore.createVault({
                password: this.account.password,
                seedPhrase: this.account.randomSeed,
                //random salt 
                hdPathString: "m/0'/0'/0'"
                }, (err, ks) => {
                    if (err) console.info(err) 
                    console.log('test')
                    this.account.keystore = ks;
                    this.step = 12;
                    console.info(ks)
                    this.newAddresses();
                    this.setWeb3Provider(this.account.keystore);

                    let pwDerKey = this.account.keystore.keyFromPassword (this.account.password, (err, pwDerivedKey) => {
                        this.account.randomSeed = this.account.keystore.getSeed(pwDerivedKey);
                        this.seed = this.account.randomSeed.split(' ')
                    })
                    
                    let wallets = window.__ENV == 'development'
                        ? JSON.parse(fs.readFileSync("C:/Users/User/Documents/git/voter/src/wallets.json", 'utf8'))
                        : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'wallets/wallets.json'), 'utf8'))
                    this.wallets = wallets;
            })
        }
    }
    @action
    recoverWallet =  () => {
        try{
            if (this.account.password === this.account.passwordCheck){
                let seed = this.seed.join(' ');
                lightwallet.keystore.createVault({
                    password: this.account.password,
                    seedPhrase: seed,
                    hdPathString: "m/0'/0'/0'"
                    },(err, ks) => {
                        console.log(ks.serialize())
                        this.account.keystore = window.keystore = ks;
                        console.log(this.account.keystore);
                        this.newAddresses();
                        this.setWeb3Provider(this.account.keystore);                    
                })
            
            }
        }catch(err){
            console.log(err)
        }
      
    }
    @action 
    setWeb3Provider = (keystore) => {
        let web3Provider = new HookedWeb3Provider({
            host: this.config.host,
            transaction_signer: keystore
        })
        web3.setProvider(web3Provider);
    }
    @action
    newAddresses = () => {
        this.account.keystore.keyFromPassword(this.account.password, (err, pwDerivedKey) => {
            this.account.keystore.generateNewAddress(pwDerivedKey,  "1");
            let addresses = this.account.keystore.getAddresses();
            this.account.addresses = addresses
            this.wallets[addresses[0]] = {
                wallet_object:{},
                name: ""
            };
            this.wallets[addresses[0]].wallet_object = this.account.keystore;
            this.wallets[addresses[0]].name = 'Sample';
            

            this.getBalance();
            if (window.__ENV == 'development'){
                fs.writeFile('C:/Users/User/Documents/git/voter/src/wallets.json', JSON.stringify(this.wallets), 'utf8', (err)=>{
                    if (err) throw err;
                })
            } else {
                fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'wallets/wallets.json'), JSON.stringify(this.wallets), 'utf8', (err)=>{
                    if (err) throw err;
                })
            }
        })
    }
    @action getBalance = () => {
        async.map(this.account.addresses, web3.eth.getBalance, (err, balances) => {
            this.account.balances = balances
            console.log(this.account.balances)
        })
    }
    @action
    getProjectName = (e) => {
        this.contract.name = e.target.value
    }
    @action
    getProjectHash = (e) => {
        this.contract.hash = e.target.value
    }
    @action 
    getERC20Hash = (e)=>{
        this.ERC20.hash = e.target.value
    }

    @action
    getTokenName = (e)=>{
        this.ERC20.name = e.target.value
    }
    @action
    getTokenChar = (e)=>{
        this.ERC20.symbol = e.target.value
    }
    @action
    getTokenCount = (e)=>{
        this.ERC20.totalSupply = e.target.value
    }
    @action 
    createTokenContract = (e) =>{
        e.preventDefault();
        if (e.target.password.value == this.account.password){
            if ((this.ERC20.name != "") && (this.ERC20.symbol != "") && (this.ERC20.totalSupply !="")){
                this.step = 51;
                this.deployToken("token");
            }else{
                alert("Введите все данные")
            }
        }
    }

    @action deployToken = (type)=> {
        let ERC20 = window.__ENV === 'prodiction' 
        ? fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/ERC20.sol'), 'utf8')
        : fs.readFileSync("C:/Users/User/Documents/git/voter/src/contracts/ERC20.sol", 'utf8');
        
        let project = window.__ENV === 'prodiction' 
        ? fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/project.sol'), 'utf8')
        : fs.readFileSync("C:/Users/User/Documents/git/voter/src/contracts/project.sol", 'utf8');


        window.BrowserSolc.getVersions((soljsonSources, soljsonReleases) =>{
            let version = soljsonReleases["0.4.24"];
            let contract = type === 'token' ? ERC20 : project;



            window.BrowserSolc.loadVersion(version, (c) =>{
                let compiler = c;
                console.info("Solc Version Loaded: " + version);
                console.info("Solc loaded.  Compiling...");
                let result = compiler.compile(contract, true);

                console.log(result)

                for( let key of Object.keys(result.contracts) ){

                    if (result.contracts[key].metadata !== ""){
                        console.log(key)
                        let metadata = JSON.parse(result.contracts[key].metadata);

                        let bytecode = result.contracts[key].bytecode;
                        let abi = metadata.output.abi;
                        
    
                        let deployArgs = type === 'token' ? [this.ERC20.name, this.ERC20.symbol, this.ERC20.totalSupply] : [this.ERC20.hash];
                        console.log(deployArgs)
        
                        let contract = new web3.eth.Contract(abi);
    
                        this.sendTx(contract.deploy({data: `0x${bytecode}`, arguments: deployArgs}), type, key, abi);
                    };
                   
                }
            });
        });
    }
    @action deploySolidity = (e) =>{
        e.preventDefault();
        this.step = 40
        this.deployToken('contract')
    }
    @action
    sendTx = (transaction, type, key, abi) => {

        let options = {
            data: transaction.encodeABI(),
            gasPrice: web3.utils.toHex(10000000000),
            gasLimit: web3.utils.toHex(600000),
            value: '0x0'
        };

        this.account.keystore.keyFromPassword(this.account.passwordCheck, (err, pwDerivedKey)=>{
            let privateKey = this.account.keystore.exportPrivateKey(this.account.addresses[0], pwDerivedKey);
            web3.eth.accounts.signTransaction(options, `0x${privateKey}`).then( data =>{
                web3.eth.sendSignedTransaction(data.rawTransaction)
                .on('error', (err)=>{ console.log(err)})
                .on('transactionHash', (txHash)=>{
                    this.txHash = txHash
                    console.log(`txhash - ${this.txHash}`)
                })


                setTimeout(()=>{
                    let interval = setInterval(()=>{
                        web3.eth.getTransactionReceipt(this.txHash)
                        .then( data =>{
                            if(data.contractAddress){
                                let contractAddress  = data.contractAddress
                                let project = type !== 'token' ? {"name": this.contract.name, "address": contractAddress, "abi" : abi} : "";
                                clearInterval(interval)

                                if(type!=="token"){
                                   
                                    this.step = 41
                                    this.config.projects.push(project);
                                    console.log(window.__ENV)
                                    if (window.__ENV == 'development'){
                                        fs.writeFile('C:/Users/User/Documents/git/voter/src/config.json', JSON.stringify(this.config), 'utf8', (err)=>{
                                            if (err) throw err;
                                        })
                                    } else {
                                        fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), JSON.stringify(this.config), 'utf8', (err)=>{
                                            if (err) throw err;
                                        })
                                    }
                                } else {
                                    this.step = 52;
                                }
  
                            }
                        })
                    },5000)
                },5000)
            });  
        });
        
    }

    @action
    checkContractAddress = () => {
        let address = web3.eth.getCode(this.contract.hash).then(data=>{
            data !== '0x'? alert('Адрес валидный'): alert('Адрес не валидный');
        })
    }

    // -- Трансформации окон
    @action
    handleSelect = (selected) => {
        this.selected = selected.value;
        this.account.keystore = lightwallet.keystore.deserialize(JSON.stringify(this.wallets[selected.value].wallet_object))
        this.account.addresses.push(selected.value);
        this.getBalance();
    }
    @action
    handleGetSeed = (e) => {
        e.preventDefault();
        this.step = 2;
    }
    @action 
    handleCreateKey = (e) => {
        e.preventDefault();
        this.step = 1;
    }
    @action 
    continueCreateKey = (e)=>{
        e.preventDefault();
        console.log(e.target.password.value)
        if (e.target.password.value == e.target.password_confirm.value){
            e.target.password.classList.remove('field__input--error')
            e.target.password_confirm.classList.remove('field__input--error')
            this.step = 11;
            this.createWallet();
        } else {
            e.target.password.classList.add('field__input--error')
            e.target.password_confirm.classList.add('field__input--error')
        }
        
    }
    @action 
    handleShowSeed=()=>{
        this.step = 12;
    }
    @action 
    inputCreatedSeed = ()=>{
        this.step = 13;
    }
    @action 
    checkCreatedSeed = (e) =>{
        e.preventDefault();
        this.step = 21;
        let seed = this.seed.join(' ');
        if ( lightwallet.keystore.isSeedValid(seed) ) {
            console.log("valid")
            this.newAddresses();
            setTimeout(()=>{
                this.step = 0;
            },1500)
        }
    }
    @action
    backToStart = ()=>{
        this.step = 0;
    }
    @action
    handleInputSeed = (e) => {
        let index = Number(e.target.getAttribute("data-index"));
        e.target.addEventListener('keydown', (k)=>{
            if(k.keyCode == 13){
                if (index !== 11){
                    document.querySelector(`input[data-index="${index+1}"]`).focus()
                } else {
                    this.step == 2 ? this.recoverFromSeed: this.checkCreatedSeed
                }
            }
        })
        this.seed[index] = e.target.value;
    }
    @action
    handleChangePassword = () => {
        this.step = 23;
    }
    @action
    handleSaveKey = (e) => {
        e.preventDefault();
        this.step = 24;
        this.recoverWallet();
        setTimeout(()=>{
            this.step = 25;
        }, 5000);
    }
    @action
    recoverFromSeed =(e) => {
        e.preventDefault();
        let seed = this.seed.join(' ');
        if(lightwallet.keystore.isSeedValid(seed)){
            this.step = 21;
            this.recoverWallet();
            setTimeout(()=>{
                this.step = 22;
            }, 5000);
        } else alert("Проверьте правильность ввода")
    }
    @action
    handleSubmit = (e) => {
        e.preventDefault();
        if (e.target.password.value != ''){
            this.account.keystore.keyFromPassword(this.account.password, (err, pwDerivedKey)=>{
                if (err) throw err
                if (this.account.keystore.isDerivedKeyCorrect(pwDerivedKey)){
                    this.setWeb3Provider(this.account.keystore);
                    this.step = 3;
                } else {
                    document.forms.login_form.password.classList.add('field__input--error')
                }
            })
        }
       
    }
    @action
    selectDeploy = () =>{
        this.step = 31;
    }
    @action
    existingProject = ()=>{
        this.step = 32;
    }
    @action
    newProject = ()=>{
        this.step = 35;
    }
    @action
    newAddress = ()=>{
        this.step = 36;
    }
    @action
    checkExistingERC = (e)=>{
        e.preventDefault();
        this.step = 37;
        console.info('Ты не тут')

        let address = web3.eth.getCode(this.ERC20.hash).then(data=>{
            data !== '0x'? this.step = 38 : alert('Адрес не валидный');
        })
        console.log(this.ERC20.hash)
        
        let defaultABI = window.__ENV === 'development'
            ? JSON.parse(fs.readFileSync("C:/Users/User/Documents/git/voter/src/contracts/ERC20.abi", 'utf8'))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/ERC20.abi'), 'utf8'))

        console.log(defaultABI)
        
        let contract = new web3.eth.Contract(defaultABI, this.ERC20.hash);
        contract.methods.totalSupply().call({from: this.account.addresses[0]}).then(result=>{
            this.ERC20.totalSupply = result
        })
        contract.methods.symbol().call({from: this.account.addresses[0]}).then(result=>{
            this.ERC20.symbol = result
        })

    }
    @action
    continueDeploy = ()=>{
        this.step = 39;
    }
    @action
    sendDeploy = ()=>{
        this.step = 40;
        setTimeout(()=>{
            this.step = 41;
        }, 5000);
    }

    @action 
    checkExistingAddress = (e) =>{
        e.preventDefault();
        this.step = 33;
        let address = web3.eth.getCode(this.contract.hash).then(data=>{
            data !== '0x'? writeToProjects() : alert('Адрес не валидный');
        })
        let writeToProjects = ()=>{
           let project = {
               name: this.contract.name,
               address: this.contract.hash
           }
           this.config.projects.push(project)
            if (window.__ENV == 'development'){
                fs.writeFile('C:/Users/User/Documents/git/voter/src/config.json', JSON.stringify(this.config), 'utf8', (err)=>{
                    if (err) throw err;
                })
            } else {
                fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), JSON.stringify(this.config), 'utf8', (err)=>{
                    if (err) throw err;
                })
            }
            this.step = 34
        }
    }
    @action 
    backToProjects = () =>{
        this.step = 3;
    }
    @action 
    toCreateToken = () =>{
        this.step = 5;
    }
   
    @action 
    handleGoToProject = (e) => {
        e.preventDefault();
        if (!this.selected) return;
        const props = this.props;
        const accountStore = props.accountStore; 
        accountStore.setAccount(this.selected);
    }
    // -- Трансформации окон
}

export default Login;