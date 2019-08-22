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

  getFormula(rawFormula) {
    let f = rawFormula.map(text => Number(text));
    let r = [];
    let ready = '( )'
    f[0] === 0 ? r.push('group( ') : r.push('user(0x298e231fcf67b4aa9f41f902a5c5e05983e1d5f8) => condition( ');
    f[1] === 1 ? r.push('Owner) => condition(') : r.push('Custom) => condition(');
    f[2] === 0 ? r.push('quorum') : r.push('positive');
    f[3] === 0 ? r.push(' <= ') : r.push(' >= ');
    f.length == 6 ? r.push(`${f[4]} %`) : r.push(`${f[4]} % )`)
    if (f.length == 6) {
      f[5] === 0 ? r.push(' of quorum)') : r.push(' of all)');
    }

    let formula = r.join('');
    ready = ready.replace(' ', formula);
    return ready;
  }

  render() {
    const { contractModel } = this.props
    const { votingTemplate, questions, userVote } = contractModel;
    const { descision, questionId } = userVote;
    let questionName = Number(questionId) ? contractModel.questions[questionId - 1].caption : '';
    let votingParameters = userVote.parameters.map((param, index) => {
      let parameter;
      if (web3.utils.hexToUtf8(param[0]) == 'Formula') {
        parameter = this.getFormula(param[1])
      } else if (web3.utils.hexToUtf8(param[0]) == 'parameters') {
        parameter = param[1].map((subParam, index) => {
          if (index % 2 == 0) return (
            <span key={index} className={styles['modal-body__data--subparameter']}>
              <span>{web3.utils.hexToUtf8(subParam)}</span>
              <span> - </span>
              <span>{web3.utils.hexToUtf8(param[1][index + 1])}</span>
            </span>
          )
        })
      } else {
        parameter = param[1]
      }
      return (
        <p key={index} className={styles['modal-body__data--parameter']}>
          <span>{web3.utils.hexToUtf8(param[0])}</span>
          <span>{parameter}</span>
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
