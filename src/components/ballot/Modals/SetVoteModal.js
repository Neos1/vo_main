import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import styles from './style.scss';
import { SimpleInput } from '../Input/index'

import positive from '../../../img/user_vote_positive.svg'
import negative from '../../../img/user_vote_negative.svg'
import close from '../../../img/modal-close.svg'
import votePositive from '../../../img/set_positive.svg'
import voteNegative from '../../../img/set_negative.svg'


@inject('contractModel') @observer
class SetVoteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  closeModal() {
    const { contractModel } = this.props;
    contractModel.userVote.prepared = false;
  }
  sendVote(e) {
    e.preventDefault();
    const { contractModel } = this.props;
    const { userVote } = contractModel;
    contractModel.switchFromVoteToStatus();
  }

  render() {
    const { contractModel } = this.props
    const { votingTemplate, questions, userVote } = contractModel;
    const { descision, questionId } = userVote;
    let questionName = Number(questionId) ? contractModel.questions[questionId - 1].caption : '';
    let votingParameters = userVote.parameters.map((param, index) => {
      return (
        <p key={index}>
          <span>{web3.utils.hexToUtf8(param[0])}</span>
          <span>{param[1]}</span>
        </p>
      )
    })


    let text = descision ? "ЗA" : "ПРОТИВ";
    return (
      <div className={`modal ${!userVote.prepared ? 'hidden' : ''}`}>
        <div className={'modal-content'}>
          <div className={styles['modal-head']}>
            <p>{`Голосовать ${text}`}</p>
            <div className={styles['modal-head__close']} onClick={this.closeModal.bind(this)}>
              <img src={close} />
            </div>
          </div>
          <div className={styles['modal-body']}>
            <img className={styles['modal-body__image']} src={descision ? positive : negative} />
            <div className={styles['modal-body__notification']}>
              <p>Вы точно хотите проголосовать <strong className={descision ? 'note' : 'negative'}>{text}</strong> вопрос{descision ? '' : 'а'} </p>
              <p><strong className='note'>{questionId}</strong> {questionName}</p>
            </div>
            <div className={styles['modal-body__data']}>
              <div className={styles['modal-body__data-parameters']}>
                {
                  votingParameters
                }
              </div>
            </div>
            <div className={styles['modal-body__form']}>
              <h2>{`Я голосую ${text}`}</h2>
              <form name='userVote' onSubmit={this.sendVote.bind(this)}>
                <label>
                  <p>Пароль</p>
                  <SimpleInput type='password' />
                  <button className={
                    descision
                      ? 'btn btn--positive'
                      : 'btn btn--red'
                  }>
                    <img src={descision ? votePositive : voteNegative}></img>
                  </button>
                </label>
              </form>
            </div>
          </div>
          <div className={styles['modal-footer']}>
            <a href='#' onClick={this.closeModal.bind(this)}> Отмена </a>
          </div>
        </div>
      </div>
    );
  }
}




export default SetVoteModal;
