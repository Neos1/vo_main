import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import Select from 'react-select';

import '../../../styles/ballot/basic.scss';
import styles from './style.scss';
import lists from '../../../img/lists.png';
import groupIcon from '../../../img/addGroup_Icon.svg'
import questionIcon from '../../../img/addQuestion_Icon.svg'
import Question from '../Question/Question';

@inject('accountStore', 'contractModel') @observer
class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedType: '',
      selectedRange: ''
    }
  }

  @observable questions = []

  componentWillMount() {
    this.getData();
  }

  async getData() {
    const { contractModel, accountStore } = this.props;
    const { address } = accountStore;
    const { contract } = contractModel;
    let questions = [];
    let length = await contract.methods.getCount().call({from: address})
      
    for (let i = 1; i <= (length-1); i++) {
      let question = await contract.methods.question(i).call({from: address})
      console.log(question)
      questions.push(question)
    }
    this.questions = questions;
    this.setState({
      loading: false
    })
  }

  getLoader() {
    return (
      <div id="loader-walk" className={this.step == 40? 'hidden' : ''}>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>  
    )
  }

  selectType(selected) {
    this.setState({selectedType: selected.value});
  }
  selectRange(selected) {
    this.setState({selectedRange: selected.value});
  }

  render() { 

    let renderQuestions = this.questions.map((question, index)=> <Question key={index+1} data={question} index={index+1}/>)
    let loader = this.getLoader();

    return ( 
      <div className={styles.wrapper}>
        <section className={`${styles.section} ${styles['section-vote']}`}>
          <div className={styles['section-vote__content']}>
            <img src={lists}/>
            <div className={styles['section-vote__buttons']}>
              <label>
                <span> добавить <br/> группу</span>
                <button className={'btn btn--blue btn--small'}> 
                  <img src={groupIcon}/> 
                </button>
              </label>
              <label>
                <button className={'btn btn--blue btn--small'}> 
                  <img src={questionIcon}/> 
                </button>
                <span> добавить <br/> вопрос</span>
              </label>
            </div>
            
           
          </div>

        </section>

        <section className={`${styles.section} ${styles['section-questions']}`}>
          <div className={styles['section-questions__filters']}>
            <label className={styles['section-questions__filters-numbers']}>
              <span> Номера </span>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                value={0}
                placeholder={'0-10'}
                value={this.state.selectedRange}
                onChange={this.selectRange.bind(this)}
                options={[{value: 0, label: "0-10"}, {value: 1, label: "10-20"}]}
              />
            </label>

            <label className={styles['section-questions__filters-groups']}>
            <span> Группа вопросов </span>

              <Select
                multi={false}
                searchable={false}
                clearable={false}
                placeholder="Тип вопросов"
                value={this.state.selectedType}
                onChange={this.selectType.bind(this)}
                options={[{value: 0, label: "Системные"}, {value: 1, label: "Другие"}]}
              />
            </label>
          </div>

          { 
            this.state.loading ? loader : renderQuestions
          }
        </section>
      </div>
     );
  }
}
 
export default Questions;