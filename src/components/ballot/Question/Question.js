import React, { Component } from 'react';
import start from '../../../img/start_icon.svg'
import styles from './style.scss';
class Question extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
    }
  }

  expand(){
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render() { 
    const {data, index} = this.props;
    return ( 
      <div className={styles.question + ' ' + `${this.state.expanded ? "opened":''}`} onClick={this.expand.bind(this)}>
        <div className={styles['question-about']}>
          <div>
            <span className={styles['question-id']}>{index}</span>
            <h1 className={styles['question-caption']}>{data.caption}</h1>
            <p className={styles['question-text']}>{data.text}</p>
            <p className={styles['question-duration']}>Продолжительность <strong>{data.time}</strong> (~ {Number(data.timeInMinutes)/60} часа(ов))</p>
          </div>
        </div>
        <div className={styles['question-expanded'] }>
          <div className={styles['question-expanded__split']}>
            <div className={styles['question-expanded__split-info']}>
              <p>
                <span>Продолжительность тиража в блоках</span>
                <span> - </span>
                <span>{data.time}</span>
              </p>
              <p>
                <span>Дата применения</span>
                <span> - </span>
                <span></span>
              </p>
              <p>
                <span>Новый адрес контракта</span>
                <span> - </span>
                <span>{data.target}</span>
              </p>
            </div>
            <div className={styles['question-expanded__split-start']}>
                <label>
                  <span>
                    Начать
                    <br/>
                    голосование
                  </span>
                  <button className="btn btn--blue">
                    <img src={start}></img>
                  </button>
                </label>
            </div>
          </div>
          <div className={styles['question-expanded__formula']}>
            <p className={styles['question-expanded__formula-heading']}>Формула голосования</p>
            <p  className={styles['question-expanded__formula-formula']}>{data.formula}</p>
          </div>
        </div>
      </div>
     );
  }
}
 
export default Question;