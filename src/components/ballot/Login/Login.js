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
const PATH_TO_IMG = window.__ENV == "development"
    ? "../img/"
    : "./img/"
window.BrowserSolc = BrowserSolc;

@inject('accountStore') @observer
class Login extends React.Component {
    
    @observable step = 0;
    @observable substep = 0;
    @observable previousStep = [];
    @observable selected = 0;
    @observable sol = ''
    @observable config = {};
    @observable passwordMatches = new Array(5);
    @observable ERC20 = {
        hash: '',
        symbol:'',
        name:'',
        totalSupply: ''
    }

    @observable date = ''
    @observable txHash = ''

    @observable seed = [];
    @observable hiddenSeed = '';
    @observable showSeed = false;
    @observable contract = {
        name: '',
        hash: ''
    }
    @observable wallets = {}
    @observable account = {
        password:"",
        passwordCheck:"",
        randomSeed:"",
        balances:[],
        addresses:[],
        keystore: {},
        web3KS:{}
    };

  
    
    componentWillMount(){
        window.onerror = (e) =>{
            return;
        }

        let config = window.__ENV == 'development'
        ? JSON.parse(fs.readFileSync("C:/Users/User/Documents/git/voter/src/config.json", 'utf8'))
        : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), 'utf8'))

        web3.setProvider(config.host);
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
                            <button className={`${styles.login__back} ${this.step == 0? styles.hidden : ''} btn btn--white`} onClick={this.goBack}> Вернуться </button>
                            {/* Окно логина */}
                            <div className={`${styles.login__form} ${this.step !== 0 ? styles.hidden : ''}`}>
                                <h3>Вход в систему</h3>
                                <p>Приготовьтесь к новой эре в сфере голосования</p>
                                <form name="login_form" onSubmit={this.handleSubmit}>
                                    <div className={styles.login__select}>
                                        <label> 
                                            <Select
                                                multi={false}
                                                searchable={false}
                                                clearable={false}
                                                placeholder="Выберите файл со своим кошельком"
                                                value={this.selected}
                                                onChange={this.handleSelect}
                                                options={accountStore.options} />
                                        </label>
                                        <label>
                                            
                                            <SimpleInput type="password" name="password" placeholder="Введите пароль" required onChange={this.getPassword}/>
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
                            <div className={`${styles.seed__form} recoverSeed ${(this.step !== 2 && this.step!== 13)? styles.hidden : ''}`}>
                                {this.step == 2? <h3>Восстановление кошелька по резервной фразе</h3>: ''}
                                {this.step == 13? <h3>Проверка резервной фразы</h3>: ''}
                                <form name="seed" onSubmit={this.step == 2 ?this.recoverFromSeed: this.checkCreatedSeed}>
                                    <div className={styles.login__select}>
                                        { 
                                            this.seed.map((el, index)=>{
                                                return (<label key={index+1} className="small">
                                                            <SimpleInput required={true} 
                                                                         index={index} 
                                                                         onChange={this.handleInputSeed} 
                                                                         onFocus={this.focusSeedInput}
                                                                         onBlur={this.blurSeedInput}/> 
                                                                <span>{index+1}</span>  
                                                        </label>)
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

                            <div className={`${styles.seed__form} ${(this.step !== 38)? styles.hidden : ''}`} style={{height: '100%'}}>
                                <div className={`${this.step !== 38  ? styles.hidden : ''}`}>
                                    <div className={`${styles.seed__key} `} style={{textAlign: 'center'}}>
                                        <div className={styles.login__select}> 
                                            <div style={{marginBottom: 80+'px', marginTop: 40+'px'}}>
                                                <h4>Шаг 2</h4>
                                                <h4>Проверка контракта</h4>
                                                <div style={{display: 'inline-block'}}>
                                                    <div className={`${styles.login__progress} active`}></div>
                                                    <div className={`${styles.login__progress} active`}></div>
                                                    <div className={`${styles.login__progress} `}></div>
                                                </div>
                                            </div>
                                                

                                            </div>
                                            <h3>Контракт проверен</h3>
                                        <div className={styles.seed__token}>
                                            Название
                                            <br/>
                                            <strong className="note">{this.ERC20.symbol}</strong>
                                        </div>
                                        <div className={styles.seed__token}>
                                            Всего токенов: 
                                            <br/>
                                            <strong className="note">{this.ERC20.totalSupply}</strong>
                                        </div>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button onClick={this.continueDeploy} type="button" className={`btn btn--block btn--blue ${this.step !== 38 ? styles.hidden : ''}`}>Продолжить</button>
                                    </div>
                                </div>
                            </div>
                            
                            {/** Установка пароля для ключа step: 23 - для существуюего ключа, 1 - для нового */}
                            <div className={`${styles.seed__form} ${((this.step != 23) && (this.step != 1)) ? styles.hidden : ''}`}>
                                <h3>Для начала  установите&nbsp;пароль</h3>
                                <p>Рекомендуем установить такой пароль, чтобы вам было легко его запомнить, но посторонние не могли его угадать</p>
                                <form name="password_input" className={styles.login__select} onSubmit={this.step !== 1? this.handleSaveKey : this.continueCreateKey}>
                                    <label key="password"  className=""> 
                                        <SimpleInput name="password" placeholder="Введите пароль" required={true} onChange={this.setPassword} type="password"/> 
                                    </label>
                                    <label key="password_confirm" required className=""> 
                                        <SimpleInput  name="password_confirm" placeholder="Повторите пароль" required={true} onChange={this.getPasswordCheck} type="password"/> 
                                    </label>

                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Создать</button>
                                    </div>
                                </form>
                            </div>
                            
                            {/** Окно записи сида step: 12 - Видимое */}
                            <div className={`${styles.seed__form} ${this.step !== 12 ? styles.hidden : ''}`}>
                                <h3>Запишите резервную фразу</h3>
                                <div className={styles.login__select} style={{textAlign: 'center'}}> 
                                    <p>
                                        Она нужна для восстановления ключа
                                    </p>
                                    <p className={styles.seed__seed}>
                                        {this.showSeed ? this.account.randomSeed : this.hiddenSeed}
                                    </p>
                                    <a onClick={this.toggleSeed}> {this.showSeed ? "Скрыть слова": "Показать слова"} </a>
                                </div>
                                <div className={styles.login__submit}>
                                    <button onClick={this.inputCreatedSeed} type="button" className="btn btn--block btn--blue">Я записал. Честно.</button>
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
                                <div className={this.step != 31? "": ""}>
                                    <h3>Добавление проекта</h3>
                                    <div className={styles.login__select}> 
                                        <p className='deploy__desc'>
                                            Вы можете добавить проект, чтобы принимать участие в голосованиях по нему
                                        </p>
                                        <p className={`${styles.deploy__select} ${this.step!= 31? 'hidden' : ''}`}>
                                            <div>
                                                <button onClick={this.newProject} type="button" className="btn btn--block btn--blue">Создать</button>
                                                <p>Я хочу создать <span className="note">новый&nbsp;проект</span></p>
                                            </div>
                                            <div>
                                                <button onClick={this.existingProject} type="button" className="btn btn--block btn--blue">Подключить</button>
                                                <p>У меня есть <span className="note">адрес&nbsp;проекта</span></p>
                                            </div>
                                        </p>
                                        <p className={`${styles.deploy__select} ${this.step!= 35? 'hidden' : ''}`}>
                                            <div>
                                                <button onClick={this.newAddress} type="button" className="btn btn--block btn--blue">Владеют</button>
                                                <p>Владельцы проекта уже владеют токенами</p>
                                            </div>
                                            <div>
                                                <button onClick={this.toCreateToken} type="button" className="btn btn--block btn--blue">Не владеют</button>
                                                <p>Владельцы проекта еще не владеют токенами</p>                         
                                            </div>
                                           
                                        </p>
                                    </div>
                                </div>

                                <div className={"hidden"}>
                                    <h3>Создание нового проекта</h3>
                                    <div className={styles.login__select}> 
                                        <h4>
                                            Шаг 1
                                        </h4>
                                        <p>
                                            Назначение владельцев проекта
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
                                            Вы можете добавить проект, и принимать участие в голосованиях по нему
                                        </p>
                                        <label> 
                                            <SimpleInput maxLength="20" placeholder="Укажите название проекта" required onChange={this.getProjectName}/>
                                        </label>

                                        <label> 
                                            <SimpleInput required placeholder="Укажите адрес проекта" onChange={this.getProjectHash}/>
                                        </label>
                                        
                                        <div className={styles.login__submit}>
                                            <button  type="submit" className="btn btn--block btn--blue">Добавить</button>
                                            <a href="#" onClick={this.selectDeploy}>Вернуться к выбору типа проектов</a>
                                        </div> 
                                    </div>
                                </form>
                            </div>
                            
                            {/** Новый адрес */}
                            <div className={`${styles.seed__form} ${this.step !== 36  ? styles.hidden : ''}`} style={{height: '100%'}}>
                                
                                <form name="checkERC" onSubmit={this.checkExistingERC}>
                                    <div className={styles.login__select}> 
                                        <div style={{marginBottom: 80+'px', marginTop:40+'px'}}>
                                            <h4>
                                                Шаг 1 из 3
                                            </h4>
                                            <h4>
                                                Добавление владельцев
                                            </h4>
                                            <div style={{marginLeft: '50%', display: 'inline-block', transform: ' translateX(-50%)'}}>
                                                <div className={`${styles.login__progress} active`}></div>
                                                <div className={`${styles.login__progress} `}></div>
                                                <div className={`${styles.login__progress} `}></div>
                                            </div>
                                        </div>

                                        <h3>Добавьте адрес контракта владельцев</h3>
                                        
                                        <div className={styles.deploy__input}>
                                            <label>
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
                            <div className={`${styles.seed__form} ${this.step !== 39  ? styles.hidden : ''}`} style={{height: '100%'}}>
                                
                                <form name="deploy_step_2" onSubmit={this.deploySolidity}>                                
                                    <div className={styles.login__select}> 
                                        <div style={{marginBottom: 80+'px', marginTop: 40+'px'}}>
                                            <h4>
                                                Шаг 3
                                            </h4>
                                            <h4>
                                                Загрузка контракта проекта
                                            </h4>
                                            <div style={{marginLeft: '50%', display: 'inline-block', transform: ' translateX(-50%)'}}>
                                                    <div className={`${styles.login__progress} active`}></div>
                                                    <div className={`${styles.login__progress} active`}></div>
                                                    <div className={`${styles.login__progress} active`}></div>
                                            </div>
                                        </div>
                                        
                                        <h3>Укажите данные контракта</h3>
                                        <div className={styles.deploy__input}>
                                            <label>
                                            <SimpleInput maxLength="20"  required placeholder="Укажите название проекта" onChange={this.getProjectName}/>
                                            </label>
                                            <label>
                                            <SimpleInput required type='password' placeholder="Введите пароль ключа" onChange={this.getPasswordCheck}/>
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
                                
                                <form name="deploy_project" onSubmit={this.createTokenContract}>
                                    <div className={styles.login__select}> 
                                        <h3>Создание нового проекта</h3>
                                        <div className={styles.deploy__input}>
                                            <label>
                                            <SimpleInput required placeholder="Укажите название токена"  onChange={this.getTokenName}/>
                                            </label>
                                            <label> 
                                            <SimpleInput required placeholder="Укажите символ токена" onChange={this.getTokenChar}/>
                                            </label>
                                            <label>
                                            <SimpleInput required placeholder="Укажите общее количество токенов" onChange={this.getTokenCount}/>
                                            </label>
                                            <label>
                                            <SimpleInput name="password" type='password' required placeholder="Введите пароль ключа" onChange={this.getPasswordCheck}/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                    </div> 
                                </form>
                                
                            </div>

                        </div>

                        <div className={`${styles.seed__loader + " " + styles.seed__form} 
                                        ${((this.step != 21) 
                                        && (this.step != 22) 
                                        && (this.step != 11) 
                                        && (this.step != 24) 
                                        && (this.step != 25)
                                        && (this.step != 33)
                                        && (this.step != 34)
                                        && (this.step != 37)
                                        && (this.step != 40)
                                        && (this.step != 41)
                                        && (this.step != 51)
                                        && (this.step != 52)) ? styles.hidden : ''}`}>
                                
                                <div className={`${ ((this.step != 21) && (this.step != 11)  && (this.step != 24) && (this.step != 33) && (this.step != 37) && (this.step != 40) && (this.step != 51)) ? styles.hidden : ''}`}>
                                    <div id="loader-walk" className={this.step == 40? 'hidden' : ''}>
                                        <div class="dot"></div>
                                        <div class="dot"></div>
                                        <div class="dot"></div>
                                        <div class="dot"></div>
                                        <div class="dot"></div>
                                    </div>
                                    { this.step == 21? <h3>Проверяем резервную фразу</h3> : ''}
                                    { this.step == 24? <h3>Идет сохранение ключа</h3> : ''}
                                    { this.step == 11? <h3>Идет создание ключа</h3> : ''}
                                    { this.step == 33? <h3>Проверяем адрес проекта</h3>: ''}
                                    { this.step == 37? <h3>Производим проверку контракта ERC20</h3>: ''}
                                    { this.step == 51? <div><h3>Загружаем контракт ERC20 <p className='subtext'>Это может занять до 5 минут</p></h3></div>: ''}
                                    { this.step == 40? 
                                        <div>
                                            <h3 style={{marginBottom: '20px'}}>Производим загрузку контракта</h3> 
                                            <p className='subtext' style={{marginBottom: '30px'}}>Это может занять до 5 минут</p>
                                            <div className="progress">
                                                <div className={`progress-block  ${this.substep == 1? 'active' : ''} ${this.substep > 1? "success": ''}`}>
                                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                                        <polyline class="line-cornered stroke-still" points="5,0 80,0 80,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-still" points="0,0 0,80 75,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" stroke-width="10" fill="none"></polyline>
                                                    </svg>
                                                    <img src={PATH_TO_IMG+'code.png'}></img>
                                                    <p>Компиляция</p>
                                                    <div className="progress-line"></div>
                                                </div>
                                                <div className={`progress-block  ${this.substep == 2? 'active' : ''} ${this.substep > 2? "success": ''}`}>
                                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline class="line-cornered stroke-still" points="5,0 80,0 80,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-still" points="0,0 0,80 75,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" stroke-width="10" fill="none"></polyline>
                                                    </svg>
                                                    <img src={PATH_TO_IMG+'drone.png'}></img>
                                                    <p>Отправка</p>
                                                    <div className="progress-line"></div>
                                                </div>
                                                <div className={`progress-block  ${this.substep == 2? 'active' : ''} ${this.substep > 2? "success": ''}`}>
                                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                                        <polyline class="line-cornered stroke-still" points="5,0 80,0 80,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-still" points="0,0 0,80 75,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" stroke-width="10" fill="none"></polyline>
                                                    </svg>
                                                    <img src={PATH_TO_IMG+'etherium.png'}></img>
                                                    <p>Получение хэша</p>
                                                    <div className="progress-line"></div>
                                                </div>
                                                <div className={`progress-block  ${this.substep == 2? 'active' : ''} ${this.substep > 2? "success": ''}`}>
                                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline class="line-cornered stroke-still" points="5,0 80,0 80,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-still" points="0,0 0,80 75,80" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" stroke-width="10" fill="none"></polyline>
                                                        <polyline class="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" stroke-width="10" fill="none"></polyline>
                                                    </svg>
                                                    <img src={PATH_TO_IMG+'/reciept.png'}></img>
                                                    <p>Получение чека</p>
                                                </div>
                                            </div>

                                            
                                            
                                        </div>: ''}
                                </div>

                                <div className={`${ (this.step != 22) 
                                                    && (this.step != 25)
                                                    && (this.step != 34) 
                                                    && (this.step != 41) 
                                                    && (this.step != 52)? styles.hidden : ''}`}>
                                    <img src={`${PATH_TO_IMG}contract.png`}></img>
                                </div>

                                <div className={`${styles.seed__key} ${ (this.step != 22) ? styles.hidden : ''}`}>
                                    <h3>Резервная фраза проверена, ваш ключ:</h3>
                                    <div className={styles.seed__wallet}>
                                        <p>Ваш ключ: <strong className="note">{this.account.addresses[0]}</strong></p>  
                                        <p>Баланс: <strong className="note">{this.account.balances[0] / 1.0e18} Eth</strong></p>
                                    </div>

                                </div>
                                
                                <div className={`${styles.seed__key} ${ (this.step != 25) ? styles.hidden : ''}`}>
                                    <h3>Ключ успешно сохранен</h3>
                                </div>
                                
                                <div className={`${styles.seed__key} ${ (this.step != 34) ? styles.hidden : ''}`}>
                                    <h3>Адрес проекта проверен</h3>
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
                                    <button onClick={this.continueDeploy} type="button" className={`btn btn--block btn--blue ${this.step !== 52 ? styles.hidden : ''}`}>Продолжить</button>
                                </div>
                            </div>

                        <div className={styles.login__description}>
                            <div className={`${styles.content} ${this.step !== 0 ? 'hidden': '' }`} style={{'max-width':"350px"}}>
                                <img src={`${PATH_TO_IMG}rocket.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Задача организации, в особенности же укрепление и развитие структуры позволяет выполнять важные задания по разработке систем массового участия.</p>
                                    <p>Не следует, однако забывать, что рамки и место обучения кадров позволяет оценить значение направлений прогрессивного развития.</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 1) && (this.step !== 23 ) ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}safe.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Пароль должен состоять как минимум из <strong className={`${this.passwordMatches[4]? 'note' : ''} `}>6 символов.</strong></p>
                                    <table className={styles.content__password}>
                                        <thead>
                                            <tr>
                                                <td>Язык раскладки</td>
                                                <td> Содержать</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <img src={PATH_TO_IMG+'GBF.png'}></img>
                                                    <strong className={`${this.passwordMatches[5]? 'match note': ''} `}>aнглийский</strong>
                                                </td>
                                                <td><strong className={`${this.passwordMatches[2]? 'match note': ''} `}>123</strong>цифру</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td><strong className={`${this.passwordMatches[0]? 'match note': ''} `}>Aa</strong>заглавную букву</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td><strong className={`${this.passwordMatches[3]? 'match note': ''} `}>!&$%&?</strong>спецсимвол</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 12) && (this.step!==13) ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}letter.png`}></img>
                                <div className={styles.content__description}>
                                    <p> Резервная фраза состоит из <strong className="note">12 слов</strong></p>
                                    <p> <strong className="warning">Обязательно запишите</strong> эти слова и не сообщайте их никому</p>
                                    <p> <strong className="note">Помните!</strong> Эта фраза дает полный контроль над вашим ключом</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 2 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}lifebuoy.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Нужно ввести последовательно все <strong className="note">слова полученные при регистрации.</strong></p>
                                    <p>Вы ведь их сохранили или записали?</p>
                                    <p>Если введете верно, то увидите номер кошелька и получите к нему доступ.</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 3 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}sextant.png`}></img>
                                <div className={styles.content__description}>
                                    <p>За что проголосуем на этот раз?</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 31 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}briefcase.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Cоздайте новый проект либо подключите уже существующий </p>   
                                    <p>Вы могли получить адрес проекта <span className="note">где-то там</span></p>   
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 32 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}cloud.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis </p>   
                                    
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 35 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}structure.png`}></img>
                                <div className={styles.content__description}>
                                    <p>При создании проекта необходимо указать его владельцев </p>   
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 36 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}map.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Вводить вручную необязательно, можно скопировать и вставить</p>   
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 38 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}check-list.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Всё идет хорошо</p>   
                                    <p>Можно продолжать</p>   
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 39 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}document.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Контракт проекта будет загружен в сеть при помощи кошелька</p>   
                                    <p>Название проекта будет записано в блокчейн</p>   
                                    <p>Для загрузки необходимо наличие на кошельке средств, в размере <br/><strong className="note">~ 0.0001 Eth</strong> </p>   
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 5 ? 'hidden': '' }`}>
                                <img src={`${PATH_TO_IMG}document.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Контракт ERC20 будет загружен в сеть при помощи кошелька, указанного ниже</p>
                                    <p>{this.account.addresses[0]}</p>   
                                    <p>
                                        <strong>Баланс: </strong> 
                                        <strong className="note">{Number((this.account.balances[0]/ 1.0e18)).toFixed(4)} ETH</strong>
                                    </p>
                                    <p>Для загрузки необходимо наличие на кошельке средств, в размере примерно 0.0001 Eth.</p>
                                    <p>Все ERC20 токены будут начислены на этот кошелек, после чего их можно будет распределить на необходимые адреса.</p>   
                                </div>
                            </div>


                        </div>
                    </div>
                    
                </Container>
            </div>
        );
    }

    // -- KeyStore handlers
    @action
    toggleSeed = (e)=>{
        e.preventDefault();
        this.showSeed = !this.showSeed;
    }
    @action
    getPassword = (e) => {
        this.account.password = e.target.value;
        e.target.classList.remove('field__input--error');

    }
    @action
    focusSeedInput = (e) => {
        e.target.classList.add('focused')
        let parent = e.target.parentElement.parentElement;
        parent.querySelector('span').classList.add('focused');
        
    }
    @action
    blurSeedInput = (e) => {
        let index = e.target.getAttribute('data-index');
        if (this.seed[index] != ''){
            return
        } else {
            e.target.classList.remove('focused')
            let parent = e.target.parentElement.parentElement;
            parent.querySelector('span').classList.remove('focused');
        }
       
        
    }
    @action
    setPassword = (e) => {
        let regex_High = new RegExp(/^(?=[^A-Z]*[A-Z]).{1,}$/g)
        let regex_low = new RegExp(/^(?=[^a-z]*[a-z]).{1,}$/g)
        let regex_num = new RegExp(/^(?=[^0-9]*[0-9]).{1,}$/g)
        let regex_char = new RegExp(/^(?=.*[!&$%&? "]).{1,}$/g)
        let regex_length = new RegExp(/^.{6,}$/g)
        let regex_cyr = new RegExp(/^(?=.*[\u0400-\u04FF]).{1,}/)

        let regex_array = [regex_High, regex_low, regex_num, regex_char, regex_length, regex_cyr]

        regex_array.map((regex, index)=>{
            if (index != 5){
                this.passwordMatches[index] = regex.test(e.target.value)
            } else {
                this.passwordMatches[index] = !regex.test(e.target.value)
            }
        })

        let unique = [...new Set(this.passwordMatches)]
        if ((unique.length == 1) && (unique[0]==true)){
            this.account.password = e.target.value
            console.log(this.account.password)
        } else {
            this.account.password = '';
        }
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
                    this.newAddresses();
                    this.setWeb3Provider(this.account.keystore);
                    console.info(ks)
                    this.step = 12;

                    let pwDerKey = this.account.keystore.keyFromPassword (this.account.password, (err, pwDerivedKey) => {
                        this.account.randomSeed = this.account.keystore.getSeed(pwDerivedKey);
                        this.seed = this.account.randomSeed.split(' ')
                        this.seed.map(word=>{
                            let length = word.length;
                            let hiddenWord = '*'.repeat(length)
                            this.hiddenSeed += ` ${hiddenWord}`
                        })
                        this.account.keystore.generateNewAddress(pwDerivedKey,  "1");
                        let addresses = this.account.keystore.getAddresses();
                        let name = `UTC--${this.date}--${addresses[0].replace(/^0x/, '')}`
                        this.wallets = window.__ENV == 'development'
                            ? JSON.parse(fs.readFileSync(`C:/Users/User/Documents/git/voter/src/wallets/${name}.json`, 'utf8'))
                            : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, `wallets/${name}.json`), 'utf8'))
                        console.log(this.wallets)
                    })

                    

                    
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

            let privateKey = this.account.keystore.exportPrivateKey(addresses[0], pwDerivedKey);

            let account = web3.eth.accounts.privateKeyToAccount(`0x${privateKey}`);
            let wallet = web3.eth.accounts.wallet.add(account);
            let encKeystore = web3.eth.accounts.wallet.encrypt(this.account.password)[0];


            this.account.addresses = addresses
            this.wallets[addresses[0]] = {
                wallet_object:{},
                name: ""
            };
            this.wallets[addresses[0]].wallet_object = this.account.keystore;
            this.wallets[addresses[0]].name = 'Sample';
            

            let name = `UTC--${this.date}--${addresses[0].replace(/^0x/, '')}`
            this.getBalance();
            if (window.__ENV == 'development'){
                fs.writeFileSync(`C:/Users/User/Documents/git/voter/src/wallets/${name}.json`, JSON.stringify(encKeystore), 'utf8')
            } else {
                fs.writeFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, `wallets/${name}.json`), JSON.stringify(encKeystore), 'utf8')
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
                result? this.substep = 2:'';

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
        this.substep = 1;
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

        let privateKey = web3.eth.accounts.wallet[0].privateKey
        web3.eth.accounts.signTransaction(options, privateKey).then( data =>{
            this.substep = 3;
            web3.eth.sendSignedTransaction(data.rawTransaction)
            .on('error', (err)=>{ console.log(err)})
            .on('transactionHash', (txHash)=>{
                this.txHash = txHash
                console.log(`txhash - ${this.txHash}`)
            })


            setTimeout(()=>{
                this.substep = 4;
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
        
    }

    @action
    checkContractAddress = () => {
        let address = web3.eth.getCode(this.contract.hash).then(data=>{
            data !== '0x'? alert('Адрес валидный'): alert('Адрес не валидный');
        })
    }

    // -- Трансформации окон
    @action
    goBack = ()=>{
        length = this.previousStep.length
        this.step = this.previousStep[length-1]
        this.previousStep.splice(length-1, 1)
    }

    @action
    handleSelect = (selected) => {
        this.selected = selected.value;
        this.account.web3KS = accountStore.accounts[this.selected]
        console.log(this.account)
    }
    @action
    handleGetSeed = (e) => {
        e.preventDefault();
       this.previousStep.push(this.step)
        this.step = 2;
    }
    @action 
    handleCreateKey = (e) => {
        e.preventDefault();
        let date = new Date();
        this.date = `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCDay()}T${date.getUTCHours()}-${date.getUTCMinutes()}-${date.getUTCSeconds()}.${date.getMilliseconds()*1000000}Z`
        this.previousStep.push(this.step)
        this.step = 1;
    }
    @action 
    continueCreateKey = (e)=>{
        e.preventDefault();
       this.previousStep.push(this.step)
        console.log(e.target.password.value)
        let regex = new RegExp(/^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9])(?=.*[!&$%&? "]).{6,}$/g)
        if (regex.test(e.target.password.value) && (e.target.password.value == e.target.password_confirm.value)){
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
       this.previousStep.push(this.step)
        this.step = 12;
    }
    @action 
    inputCreatedSeed = ()=>{
       this.previousStep.push(this.step)
        this.step = 13;
    }
    @action 
    checkCreatedSeed = (e) =>{
        e.preventDefault();
       this.previousStep.push(this.step)
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
       this.previousStep.push(this.step)
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
       this.previousStep.push(this.step)
        this.step = 23;
    }
    @action
    handleSaveKey = (e) => {
        e.preventDefault();
       this.previousStep.push(this.step)
        this.step = 24;
        this.recoverWallet();
        setTimeout(()=>{
            this.step = 25;
        }, 5000);
    }
    @action
    recoverFromSeed =(e) => {
        e.preventDefault();
       this.previousStep.push(this.step)
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
       this.previousStep.push(this.step)
        if (e.target.password.value != ''){
            let web3KS = JSON.stringify(this.account.web3KS)
            let account = web3.eth.accounts.decrypt(web3KS, this.account.password)
            
            if (account){
                web3.eth.accounts.wallet.add(account)
                this.step = 3
                this.account.addresses[0] = web3.eth.accounts.wallet[0].address;
                web3.eth.getBalance(this.account.addresses[0]).then(data=>{this.account.balances[0] = data})
            } else {
                document.forms.login_form.password.classList.add('field__input--error')
            }
        }
       
    }
    @action
    selectDeploy = () =>{
       this.previousStep.push(this.step)
        this.step = 31;
    }
    @action
    existingProject = ()=>{
       this.previousStep.push(this.step)
        this.step = 32;
    }
    @action
    newProject = ()=>{
       this.previousStep.push(this.step)
        this.step = 35;
    }
    @action
    newAddress = ()=>{
       this.previousStep.push(this.step)
        this.step = 36;
    }
    @action
    checkExistingERC = (e)=>{
        e.preventDefault();
       this.previousStep.push(this.step)
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
       this.previousStep.push(this.step)
        this.step = 39;
    }
    @action
    sendDeploy = ()=>{
       this.previousStep.push(this.step)
        this.step = 40;
        setTimeout(()=>{
            this.step = 41;
        }, 5000);
    }

    @action 
    checkExistingAddress = (e) =>{
        e.preventDefault();
       this.previousStep.push(this.step)
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
       this.previousStep.push(this.step)
        this.step = 3;
    }
    @action 
    toCreateToken = () =>{
       this.previousStep.push(this.step)
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