import React, { Component } from 'react';
import start from '../../../img/start_icon.svg'
import styles from './style.scss';
import { observer, inject } from 'mobx-react';
import { Redirect } from 'react-router';

@inject('contractModel') @observer
class Question extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      redirect: false,
    }
  }

  toggleExpand() {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  getUtfParams(data) {
    let params = [];
    for (let i = 0; i < data.length; i += 2) {
      let param = [web3.utils.hexToUtf8(data[i]), web3.utils.hexToUtf8(data[i + 1])];
      params.push(param);
    }
    return params;
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

  prepareVoting(index, params) {
    const { contractModel } = this.props;
    console.log(index);
    contractModel.prepareVoting(index, params);
    this.setState({
      redirect: true
    })
  }

  render() {
    const { data, index } = this.props;
    const { redirect } = this.state;

    if (redirect) {
      return <Redirect to="/votings" />
    }

    const vars = {
      int: 'Число',
      string: 'Строка',
      address: 'Адрес',
    }

    const params = this.getUtfParams(data._parameters);

    let questionParameters = params.map((param, index) => {
      return (
        <p key={index}>
          <span>{param[0]}</span>
          <span> - </span>
          <span>{vars[param[1]]}</span>
        </p>
      )
    })

    let formula = this.getFormula(data._formula);
    return (
      <div className={styles.question + ' ' + `${this.state.expanded ? "opened" : ''}`} >
        <div className={styles['question-about']} onClick={this.toggleExpand.bind(this)}>
          <div>
            <span className={styles['question-id']}>{data.questionId}</span>
            <h1 className={styles['question-caption']}>{data.caption}</h1>
            <p className={styles['question-text']}>{data.text}</p>
            <p className={styles['question-duration']}>Продолжительность <strong>{Math.ceil((data.time / 60) * 100) / 100}</strong> часа(ов)</p>
          </div>
        </div>
        <div className={styles['question-expanded']}>
          <div className={styles['question-expanded__split']}>
            <div className={styles['question-expanded__split-info']}>
              {
                questionParameters
              }
            </div>
            <div className={styles['question-expanded__split-start']}>
              <label>
                <span>
                  Начать
                    <br />
                  голосование
                  </span>
                <button className="btn btn--blue" onClick={this.prepareVoting.bind(this, index, params)}>
                  <img src={start}></img>
                </button>
              </label>
            </div>
          </div>
          <div className={styles['question-expanded__formula']}>
            <p className={styles['question-expanded__formula-heading']}>Формула голосования</p>
            <p className={styles['question-expanded__formula-formula']}>{formula}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Question;