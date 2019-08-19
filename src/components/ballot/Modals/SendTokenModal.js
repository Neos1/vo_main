import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import styles from './style.scss';
import { SimpleInput } from '../Input/index'

import close from '../../../img/modal-close.svg'
import Loader from '../../common/Loader';
import resultImage from '../../../img/voting_after_message.svg'



@inject('contractModel', 'accountStore') @observer
class SendTokenModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      addressWho: '',
      count: '',
      password: ''
    }
  }

  inputAddress(e) {
    let addressWho = e.target.value
    e.target.classList.remove('field__input--error')
    this.setState({ addressWho })
  }
  inputCount(e) {
    let count = e.target.value
    e.target.classList.remove('field__input--error')
    this.setState({ count })
  }
  inputPassword(e) {
    let password = e.target.value
    e.target.classList.remove('field__input--error')
    this.setState({ password })
  }

  getModalBody() {
    const { address } = this.props;
    return (
      <div>
        <div className={styles['modal-body__form']}>
          <h2></h2>
          <form name='sendToken' onSubmit={this.validateInputs.bind(this)}>
            <p>{address}</p>
            <label>
              <p>Куда перевести</p>
              <SimpleInput type='text' name='address' onChange={this.inputAddress.bind(this)} />
            </label>
            <label>
              <p>Количество</p>
              <SimpleInput type='text' name='int' onChange={this.inputCount.bind(this)} />
            </label>
            <label>
              <p>Пароль</p>
              <SimpleInput type='password' name='password' onChange={this.inputPassword.bind(this)} />
            </label>
            <button className='btn btn--block btn--blue'> Перевести </button>
          </form>
        </div>
      </div>
    )
  }

  getSuccessMessage() {
    const { onclose } = this.props;
    return (
      <div style={{ 'textAlign': 'center' }}>
        <img className={styles['modal-body__image']} src={resultImage} />
        <div className={styles['modal-body__notification']}>
          <p>Вы успешно перевели токены на указанный адрес</p>
        </div>
        <button className="btn btn--block btn--blue" onClick={onclose}> ПРОДОЛЖИТЬ </button>
      </div>
    )
  }

  validateInputs(e) {
    e.preventDefault();
    let inputs = document.sendToken.querySelectorAll("input");
    let valids = [];
    inputs.forEach(input => {
      let name = input.getAttribute("name");
      let valid = false;
      switch (name) {
        case "int":
          valid = Boolean(Number(input.value));
          break;
        case "address":
          valid = Boolean(
            input.value.match(new RegExp(/(0x)+([0-9 a-f A-F]){40}/g))
          );
          break;
        case "bytes4":
          valid = Boolean(
            input.value.length == 10 && input.value.match(new RegExp(/(0x)+([0-9 a-f A-F]){8}/g))
          );
          break;
        default:
          valid = true;
          break;
      }
      if (valid == false) {
        input.classList.add("field__input--error");
      }
      valids.push(valid);
    });

    if (valids.length == 2) {
      if (valids[0] == false || valids[1] == false) {
        return false;
      } else {
        this.sendToken();
      }
    } else {
      if (valids[0] == false) {
        return false;
      } else {
        this.sendToken();
      }
    }

  }


  sendToken() {
    const { contractModel, address: fromAddress, type, contractAddress } = this.props;
    const { addressWho, count } = this.state;
    const address = web3.eth.accounts.wallet[0].address

    this.setState({ step: 1 })
    if (type !== 'Custom') {
      const abi = window.__ENV == 'development'
        ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, '/contracts/ERC20.abi'), 'utf8'))
        : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/ERC20.abi'), 'utf8'));
      const customContract = new web3.eth.Contract(abi, contractAddress);
      customContract.methods.transfer(addressWho, count).send({ from: address, gas: 8000000, gasPrice: window.gasPrice })
        .on('receipt', async receipt => {
          await this.setState({ step: 2 });
          contractModel.updateBalance(type, contractAddress, address)
        })
    } else {
      const abi = window.__ENV == 'development'
        ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, '/contracts/MERC20.abi'), 'utf8'))
        : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/MERC20.abi'), 'utf8'))
      const customContract = window.customContract = new web3.eth.Contract(abi, contractAddress);
      customContract.methods.transferFrom(fromAddress, addressWho, count).send({ from: address, gas: 8000000, gasPrice: window.gasPrice })
        .on('receipt', async receipt => {
          await this.setState({ step: 2 });
          contractModel.updateBalance(type, contractAddress, fromAddress)
          contractModel.updateBalance(type, contractAddress, addressWho)
        })
    }

  }

  render() {
    const { accountStore, onclose } = this.props;
    const { step } = this.state;
    const bodyContent = step == 0
      ? this.getModalBody()
      : step == 1
        ? <Loader />
        : step == 2
          ? this.getSuccessMessage()
          : "";

    return (
      <div className={`modal ${styles['modal-send']} `}>
        <div className={'modal-content'}>
          <div className={styles['modal-head']}>
            <p>{`Перевод токенов`}</p>
            <div className={`${styles['modal-head__close']} ${step == 1 ? 'hidden' : ''}`} onClick={onclose}>
              <img src={close} />
            </div>
          </div>
          <div className={styles['modal-body']}>
            {
              bodyContent
            }
          </div>
          <div className={styles['modal-footer']}>
          </div>
        </div>
      </div>
    );
  }
}




export default SendTokenModal;
