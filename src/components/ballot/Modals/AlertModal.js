import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Loader from '../../common/Loader';
import styles from './style.scss';
import close from '../../../img/modal-close.svg' 
import alertImage from '../../../img/voting_succeed_message.svg'
import errorImage from '../../../img/voting_error_message.svg'
import resultImage from '../../../img/voting_after_message.svg'

@inject('contractModel')@observer
class AlertModal extends Component {
  constructor(props) {
    super(props);
    this.state = { 

     }
  }
  closeWindow(){
    const {contractModel} = this.props;
    contractModel.userVote.voted = false;
    contractModel.userVote.status = 0;
  }
  sendVote(){
    contractModel.sendVote()
  }

  getAlertMessage(){
    const {contractModel} = this.props;
    return(
        <div>
          <div className={styles['modal-head']}>
            <p>Внимание!</p>
            <div className={styles['modal-head__close']} onClick={this.closeWindow.bind(this)}>
              <img src={close}/>
            </div>
          </div>
          <div className={styles['modal-body']}>
            <img className={styles['modal-body__image']} src={alertImage}/>
            <div className={styles['modal-body__notification']}>
              <p>Ваши действия понесут последствия, лучше хорошенько подумайте, потом не получится повернуть время вспять</p>
            </div>
          </div>
          <div className={styles['modal-footer']}>
            <button className='btn btn--white' onClick={this.closeWindow.bind(this)}> Вернуться </button>
            <button className='btn btn--blue' onClick={this.sendVote.bind(this)}> Продолжить </button>
          </div>
        </div>
    ) 
  }
  getErrorMessage(){
    return(
        <div>
          <div className={styles['modal-head']}>
            <p>Ошибка!</p>
            <div className={styles['modal-head__close']} onClick={this.closeWindow.bind(this)}>
              <img src={close}/>
            </div>
          </div>
          <div className={styles['modal-body']}>
            <img className={styles['modal-body__image']} src={errorImage}/>
            <div className={styles['modal-body__notification']}>
              <p>Что то пошло не так и не туда, но вы не расстраивайтесь, всё будет хорошо, если нажать на кнопку ниже</p>
            </div>
          </div>
          <div className={styles['modal-footer']}>
           <button className='btn btn--blue' onClick={this.closeWindow.bind(this)}> ПОДТВЕРДИТЬ </button>
           </div>
        </div>
    )
  }
  getResultMessage(descision){
    const text = descision ? "ЗА" : "ПРОТИВ"
    return(
        <div>
          <div className={styles['modal-head']}>
            <p>Голосовать {text}</p>
            <div className={styles['modal-head__close']} onClick={this.closeWindow.bind(this)}>
              <img src={close}/>
            </div>
          </div>
          <div className={styles['modal-body']}>
            <img className={styles['modal-body__image']} src={resultImage}/>
            <div className={styles['modal-body__notification']}>
              <p>Вы успешно проголосовали {text}</p>
            </div>
          </div>
          <div className={styles['modal-footer']}>
            <button className='btn btn--white' onClick={this.closeWindow.bind(this)}> Продолжить </button>
          </div>
        </div>
    )
  }
  getLoader(descision){
    const text = descision ? "ЗА" : "ПРОТИВ"
    return( 
      <div>
          <div className={styles['modal-head']}>
            <p>Голосовать {text}</p>
          </div>
          <div className={styles['modal-body']}>
            <Loader/>
          </div>
          <div className={styles['modal-footer']}>
          </div>
        </div>
    )

  }

  render() { 

    const {contractModel} = this.props;
    const { userVote } = contractModel;
    const { status, voted, descision } = userVote; 
    const alert = this.getAlertMessage();
    const error = this.getErrorMessage();
    const result = this.getResultMessage(descision);
    const loader = this.getLoader(descision);

    return ( 
      <div className={`modal modal-alert ${contractModel.userVote.voted ? '' : 'hidden'}`}>
        <div className={'modal-content'}>
          {
            
            status == 0 
              ? alert  
              : status == 1 
                ? result 
                : status == 2 
                  ? error  
                  : status == 3
                    ? loader
                    : ''
          }
        </div>
      </div>
     );
  }
}

export default AlertModal; 