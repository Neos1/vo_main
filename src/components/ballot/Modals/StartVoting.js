import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {SimpleInput} from '../Input/index'
import styles from './style.scss';
import close from '../../../img/modal-close.svg' 

@inject('contractModel')@observer
class StartVotingmodal extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }

  render() { 
    const {contractModel, visible, submit, closeWindow} = this.props;
    return ( 
      <div className={`modal modal-voting ${visible ? '' :'hidden'}`}>
        <div className={'modal-content'}>
          <div className={styles['modal-head']}>
          <p>Начать голосование</p>
          <div className={styles['modal-head__close']} onClick={closeWindow}>
              <img src={close}/>
            </div>
          </div>
          <div className={styles['modal-body']}>
            <div className={styles['modal-body__form']}>
              <p>Введите пароль, чтобы начать голосование</p>
              <form name='startVoting' onSubmit={submit}>
                <label>
                  <p>Пароль</p>
                  <SimpleInput type='password'/>
                  <button className={'btn btn--blue'} > ПОДТВЕРДИТЬ </button>
                </label>
              </form>
            </div>
          </div>
          <div className={styles['modal-footer']}></div>
        </div>
      </div>
     );
  }
}

export default StartVotingmodal;