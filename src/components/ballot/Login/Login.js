import React from 'react';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import Container from '../Container';
import { SimpleInput } from '../Input/index';
import Select from 'react-select';
import Loader from '../../common/Loader';
import styles from './Login.scss';
import walletWorker from '../../../workers/wallet.worker';
import accountWorker from '../../../workers/login.worker';
import { unite } from './combiner';
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";


const fs = window.require('fs');
const path = window.path = window.require('path');
window.ejsWallet = require('ethereumjs-wallet');
window.hdKey = require('ethereumjs-wallet/hdkey');
window.bip39 = require('bip39')
const Web3 = require('web3');



const BrowserSolc = require('../../../assets/browser-solc.min')
const PATH_TO_IMG = window.__ENV == "development"
    ? "../img/"
    : "./img/"
window.BrowserSolc = BrowserSolc;

@inject('accountStore', 'contractModel') @observer
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
        symbol: '',
        name: '',
        totalSupply: ''
    }

    @observable date = ''
    @observable txHash = ''

    @observable seed = [];
    @observable hiddenSeed = '';
    @observable showSeed = false;
    @observable contract = {
        name: '',
        hash: '',
        total: '',
        deployed: 0
    }
    @observable wallets = {}
    @observable account = {
        wallet: {},
        password: "",
        passwordCheck: "",
        randomSeed: "",
        balances: [],
        addresses: '',
        keystore: ''
    };



    componentWillMount() {
        window.onerror = (e) => {
            return;
        }
        let config = window.__ENV == 'development'
            ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "./config.json"), "utf8"))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), "utf8"))
        const web3 = new Web3(config.host); //window.__ENV == 'development'? new Web3('ws://localhost:7545') :  new Web3(config.host);
        window.web3 = web3;
        this.config = window.config = config;
        window.gasPrice = config.gasPrice;
    }

    componentDidMount() {
        document.body.classList.toggle('body-login')
        for (let i = 0; i < 12; i++) {
            this.seed[i] = '';
        }
    }

    componentWillUnmount() {
        document.body.classList.remove('body-login')
    }

    render() {
        const props = this.props;
        const accountStore = props.accountStore;
        const contractModel = props.accountStore;
        let projects = this.config.projects.map((project, index) => {
            return <li key={index}>
                <Link to="/cabinet">
                    <button className="btn btn--block btn--blue" data-project={index} onClick={this.handleGoToProject}>{project.name}</button>
                </Link>
            </li>
        })



        if (accountStore.authorized) return <Redirect to="/votings" />
        return (
            <div className={styles.login}>
                <Container>
                    <div className={styles.login__container}>
                        <button className={`
                            ${styles.login__back} 
                            ${((this.step == 0)
                                || (this.step == 3)
                                || (this.step == 12)
                                || (this.step == 21)
                                || (this.step == 24)
                                || (this.step == 11)
                                || (this.step == 33)
                                || (this.step == 37)
                                || (this.step == 8)
                                || (this.step == 51)
                                || (this.step == 40))
                                ? styles.hidden : ''} btn btn--white`} onClick={this.goBack}> Вернуться </button>
                        <div className={styles.login__welcome}>


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

                                            <SimpleInput type="password" name="password" placeholder="Введите пароль" required onChange={this.getPassword} />
                                        </label>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue btn--arrow">Войти</button>
                                        <a href="#" onClick={this.handleGetSeed}> У меня есть резервная фраза </a>
                                        <a href="#" onClick={this.handleCreateKey}> Хочу создать новый ключ </a>
                                    </div>
                                </form>
                            </div>

                            {/** Восстановление по сиду */}
                            <div className={`${styles.seed__form} recoverSeed ${(this.step !== 2 && this.step !== 13) ? styles.hidden : ''}`}>
                                {this.step == 2 ? <h3>Восстановление кошелька по резервной фразе</h3> : ''}
                                {this.step == 13 ? <h3>Проверка резервной фразы</h3> : ''}
                                <form name="seed" onSubmit={this.step == 2 ? this.recoverFromSeed : this.checkCreatedSeed}>
                                    <div className={styles.login__select}>
                                        {
                                            this.seed.map((el, index) => {
                                                return (<label key={index + 1} className="small">
                                                    <SimpleInput required={true}
                                                        index={index}
                                                        onChange={this.handleInputSeed}
                                                        onFocus={this.focusSeedInput}
                                                        onBlur={this.blurSeedInput} />
                                                    <span>{index + 1}</span>
                                                </label>)
                                            })
                                        }
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                        {this.step == 2 ? <a href="#" onClick={this.backToStart}> Вернуться к выбору ключа </a> : ''}
                                        {this.step == 13 ? <a href="#" onClick={this.handleShowSeed}> Я забыл резервную фразу </a> : ''}
                                    </div>
                                </form>
                            </div>

                            {/** Окно загрузки  step: 21 - Проверка сида, 22 - сид проверен, 11 - создание ключа */}

                            <div className={`${styles.seed__form} ${(this.step !== 38) ? styles.hidden : ''}`} style={{ height: '100%' }}>
                                <div className={`${this.step !== 38 ? styles.hidden : ''}`}>
                                    <div className={`${styles.seed__key} `} style={{ textAlign: 'center' }}>
                                        <div className={styles.login__select}>
                                            <div style={{ marginBottom: 80 + 'px', marginTop: 40 + 'px' }}>
                                                <h4>Шаг 2</h4>
                                                <h4>Проверка контракта</h4>
                                                <div style={{ display: 'inline-block' }}>
                                                    <div className={`${styles.login__progress} active`}></div>
                                                    <div className={`${styles.login__progress} active`}></div>
                                                    <div className={`${styles.login__progress} `}></div>
                                                </div>
                                            </div>


                                        </div>
                                        <h3>Контракт проверен</h3>
                                        <div className={styles.seed__token}>
                                            Название
                                            <br />
                                            <strong className="note">{this.ERC20.symbol}</strong>
                                        </div>
                                        <div className={styles.seed__token}>
                                            Всего токенов:
                                            <br />
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
                                <form name="password_input" className={styles.login__select} onSubmit={this.step !== 1 ? this.handleSaveKey : this.continueCreateKey}>
                                    <label key="password" className="">
                                        <SimpleInput name="password" placeholder="Введите пароль" required={true} onChange={this.setPassword} type="password" />
                                    </label>
                                    <label key="password_confirm" required className="">
                                        <SimpleInput name="password_confirm" placeholder="Повторите пароль" required={true} onChange={this.getPasswordCheck} type="password" />
                                    </label>

                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Создать</button>
                                    </div>
                                </form>
                            </div>

                            {/** Окно записи сида step: 12 - Видимое */}
                            <div className={`${styles.seed__form} ${this.step !== 12 ? styles.hidden : ''}`}>
                                <h3>Запишите резервную фразу</h3>
                                <div className={styles.login__select} style={{ textAlign: 'center' }}>
                                    <p>
                                        Она нужна для восстановления ключа
                                    </p>
                                    <p className={styles.seed__seed}>
                                        {this.showSeed ? this.account.randomSeed : this.hiddenSeed}
                                    </p>
                                    <a onClick={this.toggleSeed}> {this.showSeed ? "Скрыть слова" : "Показать слова"} </a>
                                </div>
                                <div className={styles.login__submit}>
                                    <button onClick={this.inputCreatedSeed} type="button" className="btn btn--block btn--blue">Я записал. Честно.</button>
                                </div>
                            </div>

                            {/** Окно выбора проекта */}
                            <div className={`${styles.seed__form} ${this.step !== 3 ? styles.hidden : ''}`}>
                                <h3>Выбор проекта</h3>
                                <div className={styles.login__select} style={{
                                    "overflowY": "auto",
                                    "maxHeight": "35%"
                                }}>
                                    <ul className={styles.login__projects}>
                                        {projects}
                                    </ul>
                                </div>
                                <div className={styles.login__submit}>
                                    <a href="#" onClick={this.selectDeploy}>Добавить проект</a>
                                </div>
                            </div>

                            {/** Окно выбора деплоя: step = 31 - окно добавления проекта, 35 - выбор типа проекта */}
                            <div className={`${styles.seed__form} ${(this.step !== 31) && (this.step !== 35) ? styles.hidden : ''}`}>
                                <div className={this.step != 31 ? "" : ""}>
                                    <h3>Добавление проекта</h3>
                                    <div className={styles.login__select}>
                                        <p className='deploy__desc'>
                                            Вы можете добавить проект, чтобы принимать участие в голосованиях по нему
                                        </p>
                                        <p className={`${styles.deploy__select} ${this.step != 31 ? 'hidden' : ''}`}>
                                            <div>
                                                <button onClick={this.newProject} type="button" className="btn btn--block btn--blue">Создать</button>
                                                <p>Я хочу создать <span className="note">новый&nbsp;проект</span></p>
                                            </div>
                                            <div>
                                                <button onClick={this.existingProject} type="button" className="btn btn--block btn--blue">Подключить</button>
                                                <p>У меня есть <span className="note">адрес&nbsp;проекта</span></p>
                                            </div>
                                        </p>
                                        <p className={`${styles.deploy__select} ${this.step != 35 ? 'hidden' : ''}`}>
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
                            <div className={`${styles.seed__form} ${this.step !== 32 ? styles.hidden : ''}`}>
                                <h3>Добавить проект</h3>
                                <form name="existing_project" onSubmit={this.checkExistingAddress}>
                                    <div className={styles.login__select}>
                                        <p>
                                            Вы можете добавить проект, и принимать участие в голосованиях по нему
                                        </p>
                                        <label>
                                            <SimpleInput maxLength="20" name='name' placeholder="Укажите название проекта" required onChange={this.getProjectName} />
                                        </label>

                                        <label>
                                            <SimpleInput required name='address' placeholder="Укажите адрес проекта" onChange={this.getProjectHash} />
                                        </label>

                                        <div className={styles.login__submit}>
                                            <button type="submit" className="btn btn--block btn--blue">Добавить</button>
                                            <a href="#" onClick={this.selectDeploy}>Вернуться к выбору типа проектов</a>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/** Новый адрес */}
                            <div className={`${styles.seed__form} ${this.step !== 36 ? styles.hidden : ''}`} style={{ height: '100%' }}>

                                <form name="checkERC" onSubmit={this.checkExistingERC}>
                                    <div className={styles.login__select}>
                                        <div style={{ marginBottom: 80 + 'px', marginTop: 40 + 'px' }}>
                                            <h4>
                                                Шаг 1 из 3
                                            </h4>
                                            <h4>
                                                Добавление владельцев
                                            </h4>
                                            <div style={{ marginLeft: '50%', display: 'inline-block', transform: ' translateX(-50%)' }}>
                                                <div className={`${styles.login__progress} active`}></div>
                                                <div className={`${styles.login__progress} `}></div>
                                                <div className={`${styles.login__progress} `}></div>
                                            </div>
                                        </div>

                                        <h3>Добавьте адрес контракта владельцев</h3>

                                        <div className={styles.deploy__input}>
                                            <label>
                                                <SimpleInput required onChange={this.getERC20Hash} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.login__submit}>
                                        <button type="submit" className="btn btn--block btn--blue">Продолжить</button>
                                    </div>
                                </form>
                            </div>

                            {/** Шаг 2 деплоя существующего ERC20 */}
                            <div className={`${styles.seed__form} ${this.step !== 39 ? styles.hidden : ''}`} style={{ height: '100%' }}>

                                <form name="deploy_step_2" onSubmit={this.deploySolidity}>
                                    <div className={styles.login__select}>
                                        <div style={{ marginBottom: 80 + 'px', marginTop: 40 + 'px' }}>
                                            <h4>
                                                Шаг 3
                                            </h4>
                                            <h4>
                                                Загрузка контракта проекта
                                            </h4>
                                            <div style={{ marginLeft: '50%', display: 'inline-block', transform: ' translateX(-50%)' }}>
                                                <div className={`${styles.login__progress} active`}></div>
                                                <div className={`${styles.login__progress} active`}></div>
                                                <div className={`${styles.login__progress} active`}></div>
                                            </div>
                                        </div>

                                        <h3>Укажите данные контракта</h3>
                                        <div className={styles.deploy__input}>
                                            <label>
                                                <SimpleInput maxLength="20" required placeholder="Укажите название проекта" onChange={this.getProjectName} />
                                            </label>
                                            <label>
                                                <SimpleInput required type='password' placeholder="Введите пароль ключа" onChange={this.getPasswordCheck} />
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
                                        <h3>Создание контракта токенов</h3>
                                        <div className={styles.deploy__input}>
                                            <label>
                                                <SimpleInput placeholder="Укажите название токена" name='token' onChange={this.getTokenName} />
                                            </label>
                                            <label>
                                                <SimpleInput placeholder="Укажите символ токена" name='tokenSymbol' onChange={this.getTokenChar} />
                                            </label>
                                            <label>
                                                <SimpleInput placeholder="Укажите общее количество токенов" name='count' onChange={this.getTokenCount} />
                                            </label>
                                            <label>
                                                <SimpleInput name="password" type='password' placeholder="Введите пароль ключа" onChange={this.getPasswordCheck} />
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
                                && (this.step != 52)
                                && (this.step != 8)) ? styles.hidden : ''} 
                                
                                ${(this.step == 8) ? '' : "fullwidth"}`}>

                            <div className={`${((this.step != 21) && (this.step != 11) && (this.step != 24) && (this.step != 33) && (this.step != 37) && (this.step != 40) && (this.step != 51) && (this.step != 8)) ? styles.hidden : ''}`}>
                                <Loader className={this.step == 40 ? 'hidden' : ''} />
                                {this.step == 21 ? <h3>Проверяем резервную фразу</h3> : ''}
                                {this.step == 24 ? <h3>Идет сохранение ключа</h3> : ''}
                                {this.step == 11 ? <h3>Идет создание ключа</h3> : ''}
                                {this.step == 33 ? <h3>Проверяем адрес проекта</h3> : ''}
                                {this.step == 37 ? <h3>Производим проверку контракта ERC20</h3> : ''}
                                {this.step == 8 ? <h3 style={{
                                    'position': 'absolute',
                                    'font-weight': '400',
                                    'top': '55%',
                                    'left': '50%',
                                    'font-size': '14px',
                                    'display': 'inline-block',
                                    'width': '170px',
                                    'transform': 'translate(-50%, -50%)',
                                    'opacity': '0.4',
                                }}>Выполняется вход в систему</h3> : ''}
                                {this.step == 51 ? <div><h3>Загружаем контракт ERC20 <p className='subtext'>Это может занять до 5 минут</p></h3></div> : ''}
                                {this.step == 40 ?
                                    <div >
                                        <h3 style={{ marginBottom: '20px' }}>Производим загрузку контракта</h3>
                                        <p className='subtext' style={{ marginBottom: '30px' }}>Это может занять до 5 минут</p>
                                        <div className="progress">
                                            <div className={`progress-block  ${this.substep == 1 ? 'active' : ''} ${this.substep > 1 ? "success" : ''}`}>
                                                <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline className="line-cornered stroke-still" points="5,0 80,0 80,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-still" points="0,0 0,80 75,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" strokeWidth="10" fill="none"></polyline>
                                                </svg>
                                                <img src={PATH_TO_IMG + 'code.png'}></img>
                                                <p>Компиляция</p>
                                                <div className="progress-line"></div>
                                            </div>
                                            <div className={`progress-block  ${this.substep == 2 ? 'active' : ''} ${this.substep > 2 ? "success" : ''}`}>
                                                <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline className="line-cornered stroke-still" points="5,0 80,0 80,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-still" points="0,0 0,80 75,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" strokeWidth="10" fill="none"></polyline>
                                                </svg>
                                                <img src={PATH_TO_IMG + 'drone.png'}></img>
                                                <p>Отправка</p>
                                                <div className="progress-line"></div>
                                            </div>
                                            <div className={`progress-block  ${this.substep == 3 ? 'active' : ''} ${this.substep > 3 ? "success" : ''}`}>
                                                <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline className="line-cornered stroke-still" points="5,0 80,0 80,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-still" points="0,0 0,80 75,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" strokeWidth="10" fill="none"></polyline>
                                                </svg>
                                                <img src={PATH_TO_IMG + 'etherium.png'}></img>
                                                <p>Получение хэша</p>
                                                <div className="progress-line"></div>
                                            </div>
                                            <div className={`progress-block  ${this.substep == 4 ? 'active' : ''} ${this.substep > 4 ? "success" : ''}`}>
                                                <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline className="line-cornered stroke-still" points="5,0 80,0 80,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-still" points="0,0 0,80 75,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" strokeWidth="10" fill="none"></polyline>
                                                </svg>
                                                <img src={PATH_TO_IMG + '/reciept.png'}></img>
                                                <p>Получение чека</p>
                                                <div className="progress-line"></div>
                                            </div>
                                            <div className={`progress-block  ${this.substep == 5 ? 'active' : ''} ${this.substep > 5 ? "success" : ''}`}>
                                                <svg width="80" height="80" viewBox="0 0 80 80">
                                                    <polyline className="line-cornered stroke-still" points="5,0 80,0 80,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-still" points="0,0 0,80 75,80" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,0 80,0 80,40" strokeWidth="10" fill="none"></polyline>
                                                    <polyline className="line-cornered stroke-animation" points="0,40 0,80 80,80 80,40" strokeWidth="10" fill="none"></polyline>
                                                </svg>
                                                <img src={PATH_TO_IMG + '/questions.png'}></img>
                                                <p>Загрузка вопросов</p>
                                                <strong>{`Загружено ${this.contract.deployed} из  ${this.contract.total}`}</strong>
                                            </div>
                                        </div>



                                    </div> : ''}
                            </div>

                            <div className={`${(this.step != 22)
                                && (this.step != 25)
                                && (this.step != 34)
                                && (this.step != 41)
                                && (this.step != 52) ? styles.hidden : ''}`}>
                                <img src={`${PATH_TO_IMG}contract.png`}></img>
                            </div>

                            <div className={`${styles.seed__key} ${(this.step != 22) ? styles.hidden : ''}`}>
                                <h3>Резервная фраза проверена, ваш ключ:</h3>
                                <div className={styles.seed__wallet}>
                                    <p>Ваш ключ: <strong className="note">{this.account.addresses}</strong></p>
                                    <p>Баланс: <strong className="note">{this.account.balances / 1.0e18} Eth</strong></p>
                                </div>

                            </div>

                            <div className={`${styles.seed__key} ${(this.step != 25) ? styles.hidden : ''}`}>
                                <h3>Ключ успешно сохранен</h3>
                            </div>

                            <div className={`${styles.seed__key} ${(this.step != 34) ? styles.hidden : ''}`}>
                                <h3>Адрес проекта проверен</h3>
                            </div>

                            <div className={`${styles.seed__key} ${(this.step != 41) ? styles.hidden : ''}`}>
                                <h3>Контракт успешно загружен, теперь вы можете выбрать этот проект в списке проектов</h3>
                            </div>
                            <div className={`${styles.seed__key} ${(this.step != 52) ? styles.hidden : ''}`}>
                                <h3>Контракт успешно загружен</h3>
                            </div>

                            <div className={styles.login__submit}>
                                <button onClick={this.handleChangePassword} type="button" className={`btn btn--block btn--blue ${this.step !== 22 ? styles.hidden : ''}`}>Далее</button>
                                <button onClick={this.backToStart} type="button" className={`btn btn--block btn--blue ${this.step !== 25 ? styles.hidden : ''}`}>Далее</button>
                                <button onClick={this.backToProjects} type="button" className={`btn btn--block btn--blue ${(this.step !== 34) && (this.step !== 41) ? styles.hidden : ''}`}>Продолжить</button>
                                <button onClick={this.continueDeploy} type="button" className={`btn btn--block btn--blue ${this.step !== 52 ? styles.hidden : ''}`}>Продолжить</button>
                            </div>
                        </div>

                        <div className={styles.login__description}>
                            <div className={`${styles.content} ${(this.step !== 0) && (this.step !== 8) ? 'hidden' : ''}`} style={{ 'maxWidth': "350px" }}>
                                <img src={`${PATH_TO_IMG}rocket.png`}></img>
                                <div className={styles.content__description}>
                                    <p> An open source voting system V4Vote will allow you to connect to decision-making those whose help you need. </p>
                                    <p>Connect the project owners, company employees, management, holders of tokens purchased on ICO. </p>
                                    <p>Use the opportunities of decentralized transparent voting for the growth of the project by taking into account the views of stakeholders.</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 1) && (this.step !== 23) ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}safe.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Пароль должен состоять как минимум из <strong className={`${this.passwordMatches[4] ? 'note' : ''} `}>6 символов.</strong></p>
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
                                                    <img src={PATH_TO_IMG + 'GBF.png'}></img>
                                                    <strong className={`${this.passwordMatches[5] ? 'match note' : ''} `}>aнглийский</strong>
                                                </td>
                                                <td><strong className={`${this.passwordMatches[2] ? 'match note' : ''} `}>123</strong>цифру</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td><strong className={`${this.passwordMatches[0] ? 'match note' : ''} `}>Aa</strong>заглавную букву</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td><strong className={`${this.passwordMatches[3] ? 'match note' : ''} `}>!&$%&?</strong>спецсимвол</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 12) && (this.step !== 13) ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}letter.png`}></img>
                                <div className={styles.content__description}>
                                    <p> Резервная фраза состоит из <strong className="note">12 слов</strong></p>
                                    <p> <strong className="warning">Обязательно запишите</strong> эти слова и не сообщайте их никому</p>
                                    <p> <strong className="note">Помните!</strong> Эта фраза дает полный контроль над вашим ключом</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 2) ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}lifebuoy.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Нужно ввести последовательно все <strong className="note">слова полученные при регистрации.</strong></p>
                                    <p>Вы ведь их сохранили или записали?</p>
                                    <p>Если введете верно, то увидите номер кошелька и получите к нему доступ.</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 3 ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}sextant.png`}></img>
                                <div className={styles.content__description}>
                                    <p>За что проголосуем на этот раз?</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 31 ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}briefcase.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Cоздайте новый проект либо подключите уже существующий </p>
                                    <p>Вы могли получить адрес проекта <span className="note">где-то там</span></p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 32) ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}cloud.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis </p>

                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 35 ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}structure.png`}></img>
                                <div className={styles.content__description}>
                                    <p>При создании проекта необходимо указать его владельцев </p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${(this.step !== 36) ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}map.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Вводить вручную необязательно, можно скопировать и вставить</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 38 ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}check-list.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Всё идет хорошо</p>
                                    <p>Можно продолжать</p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 39 ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}document.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Контракт проекта будет загружен в сеть при помощи кошелька</p>
                                    <p>Название проекта будет записано в блокчейн</p>
                                    <p>Для загрузки необходимо наличие на кошельке средств, в размере <br /><strong className="note">~ 0.0001 Eth</strong> </p>
                                </div>
                            </div>
                            <div className={`${styles.content} ${this.step !== 5 ? 'hidden' : ''}`}>
                                <img src={`${PATH_TO_IMG}document.png`}></img>
                                <div className={styles.content__description}>
                                    <p>Контракт ERC20 будет загружен в сеть при помощи кошелька, указанного ниже</p>
                                    <p>{this.account.addresses}</p>
                                    <p>
                                        <strong>Баланс: </strong>
                                        <strong className="note">{Number((this.account.balances / 1.0e18)).toFixed(4)} ETH</strong>
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
    toggleSeed = (e) => {
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
        if (this.seed[index] != '') {
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

        regex_array.map((regex, index) => {
            if (index != 5) {
                this.passwordMatches[index] = regex.test(e.target.value)
            } else {
                this.passwordMatches[index] = !regex.test(e.target.value)
            }
        })

        let unique = [...new Set(this.passwordMatches)]
        if ((unique.length == 1) && (unique[0] == true)) {
            this.account.password = e.target.value
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
    createWallet = () => {
        if (this.account.password === this.account.passwordCheck) {
            let worker = new walletWorker();
            let mnemonic = bip39.generateMnemonic();
            let address;
            let privKey;
            this.account.randomSeed = mnemonic;
            this.seed = mnemonic.split(' ');

            let message = {
                action: 'create',
                mnemonic: mnemonic,
                password: this.account.password
            }


            worker.postMessage({ payload: message });

            worker.onmessage = (e) => {
                let { wallet, privateKey, v3wallet } = e.data;
                this.account.wallet = wallet;
                window.wall = wallet;
                this.account.keystore = v3wallet;
                this.account.addresses = v3wallet.address
                address = this.account.addresses;
                privKey = privateKey;
                this.seed.map(word => {
                    let length = word.length;
                    let hiddenWord = '*'.repeat(length)
                    this.hiddenSeed += ` ${hiddenWord}`
                })


                this.newAddresses(address, privKey);
                this.setWeb3Provider(this.account.keystore);

                let name = `UTC--${this.date}--${address}`

                this.wallets = window.__ENV == 'development'
                    ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, `./wallets/${name}.json`), "utf8"))
                    : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, `wallets/${name}.json`), "utf8"))

                this.handleShowSeed();
                worker.terminate();
            }
        }
    }
    @action
    recoverWallet = (method) => {
        try {

            let mnemonic = this.seed.join(' ');
            let worker = new walletWorker();
            let address;
            let privKey;
            let message = {
                action: method,
                password: this.account.password,
                mnemonic,
            };
            worker.postMessage({ payload: message });

            worker.onmessage = (e) => {
                let { action, wallet, privateKey, v3wallet } = e.data;
                this.account.wallet = wallet;
                window.wall = wallet;
                this.account.keystore = v3wallet;
                this.account.addresses = v3wallet.address;
                address = this.account.addresses;
                privKey = privateKey;
                this.newAddresses(address, privKey);

                switch (action) {
                    case "create":
                        this.step = 25;
                        break;
                    case "recover":
                        this.step = 22;
                        break;
                    default:
                        break;
                }
                worker.terminate();
            }

        } catch (err) {
            console.log(err)
        }

    }
    @action
    setWeb3Provider = (keystore) => {
        web3.setProvider(this.config.host);
    }
    @action
    newAddresses = (address, privKey) => {

        let account = web3.eth.accounts.privateKeyToAccount(privKey);
        let wallet = web3.eth.accounts.wallet.add(account);
        this.account.addresses = address
        this.wallets[address] = {};
        this.wallets[address] = this.account.keystore;

        let name = `UTC--${this.date}--${address}`
        this.getBalance();
        if (window.__ENV == 'development') {
            fs.writeFileSync(path.join(window.process.env.INIT_CWD, `./wallets/${name}.json`), JSON.stringify(this.account.keystore, null, '\t'), "utf8")
        } else {
            fs.writeFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, `wallets/${name}.json`), JSON.stringify(this.account.keystore, null, '\t'), "utf8")
        }

    }
    @action getBalance = () => {
        web3.eth.getBalance(this.account.addresses).then(data => { this.account.balances = data })
    }
    @action
    getProjectName = (e) => {
        e.target.classList.remove('field__input--error')
        this.contract.name = e.target.value
    }
    @action
    getProjectHash = (e) => {
        e.target.classList.remove('field__input--error')
        this.contract.hash = e.target.value
    }
    @action
    getERC20Hash = (e) => {
        e.target.classList.remove('field__input--error')
        this.ERC20.hash = e.target.value
    }

    @action
    getTokenName = (e) => {
        this.ERC20.name = e.target.value
    }
    @action
    getTokenChar = (e) => {
        e.target.classList.remove('field__input--error')
        this.ERC20.symbol = e.target.value
    }
    @action
    getTokenCount = (e) => {
        e.target.classList.remove('field__input--error')
        this.ERC20.totalSupply = e.target.value
    }
    @action
    createTokenContract = (e) => {
        e.preventDefault();
        if (e.target.password.value == this.account.password) {
            if ((this.ERC20.name != "") && (this.ERC20.symbol != "") && (!isNaN(Number(this.ERC20.totalSupply))) && (Number(this.ERC20.totalSupply) >= 0)) {
                if (this.account.balances / 1.0e18 > 0.001) {
                    this.step = 51;
                    this.deployToken("token");
                } else alert("Недостаточно средств на кошельке, пополните баланс")
            } else {
                if (this.ERC20.name == "") {
                    document.deploy_project.token.classList.add('field__input--error')
                }
                if (this.ERC20.symbol == "") {
                    document.deploy_project.tokenSymbol.classList.add('field__input--error')
                }
                if (isNaN(Number(this.ERC20.totalSupply)) || (Number(this.ERC20.totalSupply) < 0)) {
                    document.deploy_project.count.classList.add('field__input--error')
                }
                alert("Введите корректные данные")
            }
        } else {
            document.deploy_project.password.classList.add('field__input--error')
            if (this.ERC20.name == "") {
                document.deploy_project.token.classList.add('field__input--error')
            }
            if (this.ERC20.symbol == "") {
                document.deploy_project.tokenSymbol.classList.add('field__input--error')
            }
            if (isNaN(Number(this.ERC20.totalSupply)) || (Number(this.ERC20.totalSupply) < 0)) {
                document.deploy_project.count.classList.add('field__input--error')
            }
        }
    }

    @action deployToken = (type) => {

        unite(type);
        let ERC20 = window.__ENV === 'production'
            ? fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/output.sol'), "utf8")
            : fs.readFileSync(path.join(window.process.env.INIT_CWD, "./contracts/output.sol"), "utf8");

        let questions = window.__ENV === 'production'
            ? JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/sysQuestions.json'), "utf8"))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "./contracts/sysQuestions.json"), "utf8"));
        this.contract.total = Object.keys(questions).length;

        let project = window.__ENV === 'production'
            ? fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts/Voter/output.sol'), "utf8")
            : fs.readFileSync(path.join(window.process.env.INIT_CWD, "./contracts/Voter/output.sol"), "utf8");

        let abi = window.__ENV === 'production'
            ? JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts/Voter.abi'), "utf8"))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "./contracts/Voter.abi"), "utf8"))


        window.BrowserSolc.getVersions((soljsonSources, soljsonReleases) => {
            let version = soljsonReleases["0.4.24"];
            let contract = type === 'token' ? ERC20 : project;
            let contractID = type === 'token' ? ':ERC20' : ':Voter';

            window.BrowserSolc.loadVersion(version, (c) => {
                let compiler = c;
                console.info("Solc Version Loaded: " + version);
                console.info("Solc loaded.  Compiling...");
                window.result = compiler.compile(contract);
                console.log(result);
                result ? this.substep = 2 : '';
                if (result.contracts[contractID].interface !== "") {
                    let bytecode = result.contracts[contractID].bytecode;
                    let metadata = JSON.parse(result.contracts[contractID].metadata);
                    let compiled_abi = JSON.stringify(metadata.output.abi);
                    let old_abi = JSON.stringify(abi);
                    if (compiled_abi != old_abi) {
                        abi = JSON.parse(compiled_abi);
                    }
                    let contract = new web3.eth.Contract(abi);
                    let deployArgs = type === 'token' ? [this.ERC20.name, this.ERC20.symbol, this.ERC20.totalSupply] : [this.ERC20.hash];
                    this.sendTx(contract.deploy({ data: `0x${bytecode}`, arguments: deployArgs }), type, key, abi);
                };
            });
        });
    }
    @action deploySolidity = (e) => {
        e.preventDefault();
        const { password, passwordCheck } = this.account;

        if (password === passwordCheck) {
            if (this.account.balances / 1.0e18 > 0.001) {
                this.step = 40
                this.substep = 1;
                this.deployToken('contract')
            } else alert("Недостаточно средств на кошельке, пополните баланс")
        } else {
            document.deploy_step_2.querySelectorAll('input')[1].classList.add('field__input--error');
        }
    }
    @action
    sendTx = (transaction, type, key, abi) => {

        let options = {
            data: transaction.encodeABI(),
            gasPrice: web3.utils.toHex(window.gasPrice),
            gasLimit: web3.utils.toHex(8000000),
            value: '0x0'
        };



        let privateKey = web3.eth.accounts.wallet[0].privateKey
        web3.eth.accounts.signTransaction(options, privateKey).then(data => {
            this.substep = 3;
            web3.eth.sendSignedTransaction(data.rawTransaction)
                .on('error', (err) => { console.log(err) })
                .on('transactionHash', (txHash) => {
                    this.txHash = txHash
                })
                .on('receipt', (data) => {
                    console.log(data)
                })


            setTimeout(() => {
                this.substep = 4;
                let interval = setInterval(() => {
                    web3.eth.getTransactionReceipt(this.txHash)
                        .then((data) => {
                            if (data.contractAddress) {
                                this.substep = 5;
                                let contract = new web3.eth.Contract(abi, data.contractAddress);
                                window.contract = contract;
                                let project = type !== 'token' ? { "name": this.contract.name, "address": data.contractAddress } : "";
                                clearInterval(interval)
                                if (type !== "token") {
                                    this.config.projects.push(project);
                                    if (window.__ENV == 'development') {
                                        fs.writeFile(path.join(window.process.env.INIT_CWD, './config.json'), JSON.stringify(this.config, null, '\t'), "utf8", (err) => {
                                            if (err) throw err;
                                        })
                                        fs.writeFile(path.join(window.process.env.INIT_CWD, './contracts/Voter.abi'), JSON.stringify(abi, null, '\t'), "utf8", (err) => {
                                            if (err) throw err;
                                        })
                                    } else {
                                        fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), JSON.stringify(this.config, null, '\t'), "utf8", (err) => {
                                            if (err) throw err;
                                        })
                                        fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts/Voter.abi'), JSON.stringify(abi, null, '\t'), "utf8", (err) => {
                                            if (err) throw err;
                                        })
                                    }

                                    let questionsLength;
                                    contract.methods.getCount().call({ from: web3.eth.accounts.wallet[0].address }).then((res) => {
                                        questionsLength = res;

                                        const sysQuestion = window.__ENV === 'production'
                                            ? JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/sysQuestions.json'), "utf8"))
                                            : JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "/contracts/sysQuestions.json"), "utf8"));
                                        let sysQuestionsLength = Object.keys(sysQuestion).length;

                                        if (questionsLength <= sysQuestionsLength) {
                                            let i = 1;
                                            this.sendQuestion(i, sysQuestion, sysQuestionsLength, contract, data.contractAddress, privateKey);
                                        }
                                    })
                                } else {
                                    this.ERC20.hash = data.contractAddress;
                                    this.step = 52;
                                }

                            }
                        })
                }, 5000)
            }, 5000)
        });
    }
    @action prepareFormula(formula) {
        const FORMULA_REGEXP = new RegExp(/(group)|((?:[a-zA-Z0-9]{1,}))|((quorum|positive))|(>=|<=)|([0-9%]{1,})|(quorum|all)/g);
        let matched = formula.match(FORMULA_REGEXP);

        let convertedFormula = [];

        matched[0] == 'group' ? convertedFormula.push(0) : convertedFormula.push(1)
        matched[1] == 'Owners' ? convertedFormula.push(1) : convertedFormula.push(2)
        matched[3] == 'quorum' ? convertedFormula.push(0) : convertedFormula.push(1)
        matched[4] == '<=' ? convertedFormula.push(0) : convertedFormula.push(1)
        convertedFormula.push(Number(matched[5]))

        if (matched.length == 9) {
            matched[8] == 'quorum' ? convertedFormula.push(0) : convertedFormula.push(1)
        }
        return convertedFormula;
    }

    @action sendQuestion = (index, sysQuestion, sysQuestionsLength, contract, contractAddress, privateKey) => {
        if (index <= sysQuestionsLength) {
            let nonce;

            web3.eth.getTransactionCount(web3.eth.accounts.wallet[0].address, 'pending', (err, data) => {
                nonce = Number(data);
            });


            let question = contract.methods.question(index)
                .call({ from: web3.eth.accounts.wallet[0].address }).then(async (question) => {
                    if (question.caption == '') {
                        let id = sysQuestion[index].id;
                        let group = sysQuestion[index].group;
                        let name = sysQuestion[index].name;
                        let caption = sysQuestion[index].caption;
                        let time = sysQuestion[index].time;
                        let method = sysQuestion[index].method;

                        let formula = await this.prepareFormula(sysQuestion[index].formula);

                        let params = sysQuestion[index].parameters.map(param => {
                            return web3.utils.utf8ToHex(param)
                        });
                        let dataTx = contract.methods.saveNewQuestion([id, group, time], 0, name, caption, contractAddress, method, formula, params).encodeABI();

                        let rawTx = {
                            to: contractAddress,
                            data: dataTx,
                            gasPrice: web3.utils.toHex(window.gasPrice),
                            gasLimit: web3.utils.toHex(8000000),
                            value: '0x0',
                            nonce: web3.utils.toHex(nonce),
                        }
                        nonce += 1;


                        web3.eth.accounts.signTransaction(rawTx, privateKey).then(data => {
                            web3.eth.sendSignedTransaction(data.rawTransaction)
                                .on('receipt', (receipt) => {
                                    index += 1;
                                    this.contract.deployed = index - 1;
                                    this.sendQuestion(index, sysQuestion, sysQuestionsLength, contract, contractAddress, privateKey);
                                })
                                .on('error', (err) => {
                                    console.error(err);
                                    this.sendQuestion(index, sysQuestion, sysQuestionsLength, contract, contractAddress, privateKey);
                                })
                        })
                    } else {
                        index += 1;
                        this.sendQuestion(index, sysQuestion, sysQuestionsLength, contract, contractAddress, privateKey);
                    }
                });
        } else {
            this.step = 41;
        }
    }

    @action
    checkContractAddress = () => {
        let address = web3.eth.getCode(this.contract.hash).then(data => {
            data !== '0x' ? alert('Адрес валидный') : alert('Адрес не валидный');
        })
    }

    // -- Трансформации окон
    @action
    goBack = () => {
        length = this.previousStep.length
        this.step = this.previousStep[length - 1]
        this.previousStep.splice(length - 1, 1)
    }

    @action
    handleSelect = (selected) => {
        this.selected = selected.value;
        this.account.keystore = accountStore.accounts[this.selected]
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
        this.date = `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCDay()}T${date.getUTCHours()}-${date.getUTCMinutes()}-${date.getUTCSeconds()}.${date.getMilliseconds() * 1000000}Z`
        this.previousStep.push(this.step)
        this.step = 1;
    }
    @action
    continueCreateKey = (e) => {
        e.preventDefault();
        this.previousStep.push(this.step)
        let regex = new RegExp(/^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9])(?=.*[!&$%&? "]).{6,}$/g)
        if (regex.test(e.target.password.value) && (e.target.password.value == e.target.password_confirm.value)) {
            e.target.password.classList.remove('field__input--error')
            e.target.password_confirm.classList.remove('field__input--error')
            this.step = 11;
            document.forms.password_input.reset();
            this.createWallet();
        } else {
            e.target.password.classList.add('field__input--error')
            e.target.password_confirm.classList.add('field__input--error')
        }

    }
    @action
    handleShowSeed = () => {
        this.previousStep.push(this.step)
        this.step = 12;
    }
    @action
    inputCreatedSeed = () => {
        this.previousStep.push(this.step)
        this.step = 13;
    }
    @action
    checkCreatedSeed = (e) => {
        e.preventDefault();
        let seed = this.seed.join(' ');
        if (bip39.validateMnemonic(seed)) {
            this.previousStep.push(this.step)
            document.forms.seed.reset()
            this.step = 21;
            let inputs = document.forms.seed.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('active');
            })
            let privKey = web3.eth.accounts.wallet[0].privateKey
            this.newAddresses(this.account.addresses, privKey);
            setTimeout(() => {
                this.step = 0;
            }, 1500)
        } else alert('Проверьте правильность ввода')
    }
    @action
    backToStart = () => {
        this.previousStep.push(this.step)
        this.step = 0;
    }
    @action
    handleInputSeed = (e) => {
        let index = Number(e.target.getAttribute("data-index"));
        e.target.addEventListener('keydown', (k) => {
            if (k.keyCode == 13) {
                if (index !== 11) {
                    document.querySelector(`input[data-index="${index + 1}"]`).focus()
                } else {
                    this.step == 2 ? this.recoverFromSeed : this.checkCreatedSeed
                }
            }
        })
        this.seed[index] = e.target.value.replace(/\s+/g, '');
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
        let regex = new RegExp(/^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9])(?=.*[!&$%&? "]).{6,}$/g)
        if (regex.test(e.target.password.value) && (e.target.password.value == e.target.password_confirm.value)) {
            e.target.password.classList.remove('field__input--error')
            e.target.password_confirm.classList.remove('field__input--error')
            document.forms.password_input.reset();
            this.step = 24;
            this.recoverWallet('create');
        } else {
            e.target.password.classList.add('field__input--error')
            e.target.password_confirm.classList.add('field__input--error')
        }
    }
    @action
    recoverFromSeed = (e) => {
        e.preventDefault();
        this.previousStep.push(this.step)
        let seed = this.seed.join(' ');
        if (bip39.validateMnemonic(seed)) {
            document.forms.seed.reset();
            let inputs = document.forms.seed.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('active');
            })
            this.step = 21;
            this.recoverWallet('recover');
        } else alert("Проверьте правильность ввода")
    }
    @action
    handleSubmit = (e) => {
        e.preventDefault();
        if ((e.target.password.value != '') && (this.account.keystore != '')) {
            let loginWorker = new accountWorker();
            this.previousStep.push(this.step);
            this.step = 8;
            loginWorker.postMessage(JSON.stringify({
                keystore: this.account.keystore,
                password: this.account.password
            }));
            loginWorker.onmessage = async (e) => {
                const { privateKey, error } = e.data;
                if (privateKey != null) {
                    let account = await web3.eth.accounts.privateKeyToAccount(privateKey)
                    web3.eth.accounts.wallet.add(account)
                    this.step = 3
                    this.account.addresses = web3.eth.accounts.wallet[0].address;
                    web3.eth.getBalance(this.account.addresses).then(data => {
                        this.account.balances = data
                    })
                    loginWorker.terminate();
                } else {
                    document.forms.login_form.password.classList.add('field__input--error')
                    this.step = 0;
                    alert('Проверьте правильность ввода пароля')
                    loginWorker.terminate();
                }
            }
        } else {
            document.forms.login_form.querySelector('.Select').classList.add('field__input--error');
            document.forms.login_form.password.classList.add('field__input--error');
        }
    }
    @action
    selectDeploy = () => {
        this.previousStep.push(this.step);
        this.step = 31;
        let abi = window.__ENV === 'production'
            ? JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts/Voter.abi'), "utf8"))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "./contracts/Voter.abi"), "utf8"))
        let address = this.contract.hash;
        let name = this.contract.name;
        let contract = new web3.eth.Contract(abi, address);
        contract.methods.getERCAddress().call({ from: web3.eth.accounts.wallet[0].address }).then(result => {
            if (result == address) {
                let project = { "name": this.contract.name, "address": address };
                this.config.projects.push(project);
                if (window.__ENV == 'development') {
                    fs.writeFile(path.join(window.process.env.INIT_CWD, '/config.json'), JSON.stringify(this.config, null, '\t'), "utf8", (err) => {
                        if (err) throw err;
                    })
                } else {
                    fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), JSON.stringify(this.config, null, '\t'), "utf8", (err) => {
                        if (err) throw err;
                    })
                }
                this.step = 34;
            }
        })
    }
    @action
    existingProject = () => {
        this.previousStep.push(this.step)
        this.step = 32;
    }
    @action
    newProject = () => {
        this.previousStep.push(this.step)
        this.step = 35;
    }
    @action
    newAddress = () => {
        this.previousStep.push(this.step)
        this.step = 36;
    }
    @action
    checkExistingERC = async (e) => {
        e.preventDefault();
        if (this.ERC20.hash.match(/(0x)+([0-9 a-f A-F]){40}/g) !== null) {
            this.previousStep.push(this.step)
            this.step = 37;
            let defaultABI = window.__ENV === 'development'
                ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "/contracts/ERC20.abi"), "utf8"))
                : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/ERC20.abi'), "utf8"))

            let contract = new web3.eth.Contract(defaultABI, this.ERC20.hash);

            this.ERC20.totalSupply = await contract.methods.totalSupply().call({ from: this.account.addresses })
            this.ERC20.symbol = await contract.methods.symbol().call({ from: this.account.addresses })

            if ((this.ERC20.totalSupply == "") && (this.ERC20.symbol == "")) {
                this.step = 36;
                document.checkERC.querySelector('input').classList.add('field__input--error');
            } else {
                this.step = 38
            }
        } else {
            document.checkERC.querySelector('input').classList.add('field__input--error');
        }
    }
    @action
    continueDeploy = () => {
        this.previousStep.push(this.step)
        this.step = 39;
    }
    @action
    sendDeploy = () => {
        this.previousStep.push(this.step)
        this.step = 40;
        setTimeout(() => {
            this.step = 41;
        }, 5000);
    }

    @action
    checkExistingAddress = (e) => {
        e.preventDefault();
        let address;

        if (Boolean(this.contract.hash.match(new RegExp(/(0x)+([0-9 a-z A-Z]){40}/g)))) {
            if (document.existing_project.name != '') {
                this.previousStep.push(this.step)
                this.step = 33;
                address = web3.eth.getCode(this.contract.hash).then(data => {
                    if (data !== '0x') {
                        writeToProjects()
                    } else {
                        this.step = 32
                        alert('Адрес не валидный');
                    }
                })
            } else {
                document.existing_project.name.classList.add('field__input--error');
            }
        } else {
            document.existing_project.address.classList.add('field__input--error');
        }

        let writeToProjects = () => {
            let project = {
                name: this.contract.name,
                address: this.contract.hash
            }
            this.config.projects.push(project)
            if (window.__ENV == 'development') {
                fs.writeFile(path.join(window.process.env.INIT_CWD, '/config.json'), JSON.stringify(this.config, null, '\t'), "utf8", (err) => {
                    if (err) throw err;
                })
            } else {
                fs.writeFile(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './config.json'), JSON.stringify(this.config, null, '\t'), "utf8", (err) => {
                    if (err) throw err;
                })
            }
            this.step = 34
        }
    }
    @action
    backToProjects = () => {
        this.previousStep.push(this.step)
        this.step = 3;
    }
    @action
    toCreateToken = () => {
        this.previousStep.push(this.step)
        this.step = 5;
    }
    @action checkQuestions = (contract, address, selected) => {
        const props = this.props;
        const contractModel = props.contractModel;
        let questionCount
        contract.methods.getCount().call({ from: web3.eth.accounts.wallet[0].address })
            .then((count) => {
                questionCount = Number(count);
                const sysQuestion = window.__ENV === 'production'
                    ? JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'contracts/sysQuestions.json'), "utf8"))
                    : JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "/contracts/sysQuestions.json"), "utf8"));
                let sysQuestionsLength = Object.keys(sysQuestion).length;

                this.contract.deployed = questionCount
                this.contract.total = sysQuestionsLength
                let privateKey = web3.eth.accounts.wallet[0].privateKey;
                if (questionCount <= sysQuestionsLength) {
                    this.step = 40;
                    this.substep = 5;
                    let i = 1;
                    this.sendQuestion(i, sysQuestion, sysQuestionsLength, contract, address, privateKey);
                } else {
                    contractModel.setContract(contract);
                    accountStore.setAccount(selected);
                }
            })
    }

    @action
    handleGoToProject = async (e) => {
        e.preventDefault();
        if (!this.selected) return;
        const props = this.props;
        const accountStore = props.accountStore;
        const projectId = e.target.getAttribute('data-project');
        const project = this.config.projects[projectId]
        const abi = await window.__ENV === 'production'
            ? JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts/Voter.abi'), "utf8"))
            : JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, "./contracts/Voter.abi"), "utf8"))
        const address = project.address
        let contract = new web3.eth.Contract(abi, address);
        this.checkQuestions(contract, address, this.selected)
    }
    // -- Трансформации окон
}

export default Login;