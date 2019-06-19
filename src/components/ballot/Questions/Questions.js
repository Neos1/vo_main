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
import { Redirect } from 'react-router';

@inject('accountStore', 'contractModel') @observer
class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      redirect: false, 
      selectedType: '',
      selectedRange: '',
      page: 0,
    }
  }

  @observable questions = []

  componentWillMount() {
    this.getData();
  }

  async getData() {
    this.setState({
      loading: true
    })

    const { contractModel, accountStore } = this.props;
    const { address } = accountStore;
    const { contract } = contractModel;
    
    let questions = await contractModel.getQuestions('system');
    this.questions = questions;

    this.setState({
      loading: false,
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
    this.setState({page: selected.value});
    this.filterQuestions()
  }

  filterQuestions() {
    let filters = {
      page: this.state.page
    }
    const { contractModel } = this.props;
    contractModel.filterQuestionsByPage(filters);
  }
  preparePrimaryVotings(id) {
    const { contractModel } = this.props;
    contractModel.prepareVoting(id);
    this.setState({
      redirect: true
    })
  }

  render() { 
    const { contractModel } = this.props;
    const { redirect } = this.state;
    let renderQuestions = this.questions.map((question, index)=> <Question key={index+1} data={question} index={index+1}/>)
    let loader = this.getLoader();

    if (redirect) return <Redirect to='/votings'/>
    return ( 
      <div className={styles.wrapper}>
        <section className={`${styles.section} ${styles['section-vote']}`}>
          <div className={styles['section-vote__content']}>
            <img src={lists}/>
            <div className={styles['section-vote__buttons']}>
              <label>
                <span> добавить <br/> группу</span>
                <button className={'btn btn--blue btn--small'} onClick={this.preparePrimaryVotings.bind(this, 2)}> 
                  <img src={groupIcon}/> 
                </button>
              </label>
              <label>
                <button className={'btn btn--blue btn--small'} onClick={this.preparePrimaryVotings.bind(this, 3)}> 
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
                placeholder={'Выберитe номер'}
                value={this.state.page}
                onChange={this.selectRange.bind(this)}
                options={contractModel.questionsPages}
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