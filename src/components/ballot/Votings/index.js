import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import Select from 'react-select';
import moment from 'moment';
import close from '../../../img/modal-close.svg' 

import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-day-picker/lib/style.css';

import '../../../styles/ballot/basic.scss';
import styles from './style.scss';
import Question from '../Question/Question';
import { SimpleInput } from '../Input';
import Voting from '../Voting';
import StartVotingmodal from '../Modals/StartVoting';
import SetVoteModal from '../Modals/SetVoteModal';
import AlertModal from '../Modals/AlertModal';
import contractModel from '../../../models/ContractModel';

import VotingActive from '../../../img/voting_active.svg'


@inject('accountStore', 'contractModel') @observer
class Votings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      expanded: true,
      selectedType: '',
      selectedRange: '',
      selected: 0,
      questionId: 0,
      id: null,
      from: undefined,
      to: undefined,
      descision: false,
      startVoting: false,
      createVotingStep: 1,
      additionalInputs: []
    }
  }

  @observable questions = []

  componentWillMount() {
    const { contractModel } = this.props;
    this.setState({
      selected: contractModel.votingTemplate.questionId
    })

    this.getData();

  }

  async getData() {
    
    this.setState({
      loading: true
    })

    const { contractModel, accountStore } = this.props;
    const { address } = accountStore;
    const { contract } = contractModel;

    await contractModel.getQuestions('system');
    await contractModel.getVotings();
    console.log(contractModel.votings);

    this.setState({
      loading: false
    })

    if(contractModel.bufferVotings[0].status == 0) {
      this.setState({
        createVotingStep: 5
      })
    }
  }

  removeError(e) {
    e.target.classList.remove('field__input--error')
  }
  getLoader() {
    const {createVotingStep} = this.state;
    return (
      <div>
        <div id="loader-walk" className={this.step == 40? 'hidden' : ''}>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>   
        <p id="loader-text">
          {
            createVotingStep == 2 
            ? "Отправка транзакции"
            : createVotingStep == 3 
              ? "Получение хэша"
              : createVotingStep == 4 
                ? "Ожидание чека"
                : ""
          }  
        </p> 
      </div>
      
    )
  }
  addInput() {
    const {additionalInputs} = this.state;
    const getInputBlock = ()=>{
      let idx = additionalInputs.length
      console.log(`idx = ${idx}`)
      return (
        <div>
          <SimpleInput/>
          <select> 
            <option value='int'> Число </option>
            <option value='string'> Текст </option>
            <option value='address'> Адрес </option>
            <option value='bytes4'> Строка (4 байта) </option>
          </select>
          <span onClick={this.removeEl.bind(this, idx)}> <img src={close}/> </span>
        </div>
      )
    }
    let input = getInputBlock();

    this.setState({
      additionalInputs: [...additionalInputs, input]
    })
  }

  async removeEl(index) {
    const{additionalInputs} = this.state;
    console.log(`index = ${index}`);
    console.log(`additionalInputs[${index}] = ${additionalInputs[index]}`);

    let inputs = additionalInputs;

    inputs.splice(index, 1);
    console.log(inputs)
    await this.setState({
      additionalInputs: inputs
    })
  }

  getPreparingPanel() {
    const { contractModel } = this.props;
    const { startVoting } = this.state;
    const {votingTemplate} = contractModel

    let types = {
      int: "Число",
      string: "Текст",
      address: "Адрес",
    }

    let inputs = contractModel.votingTemplate.params.map(( param, index )=>{
      let returnField = ()=> {
        return (
          <label>
            <span>{param[0]}</span>
            <SimpleInput type="text" placeholder={types[param[1]]} onChange={this.removeError.bind(this)} required name={param[1]} />
          </label>
        )
      }

      let returnParams = () => {
        return(
          <div className="votings-additionals">
            <h2>Параметры вопроса</h2>
            {this.state.additionalInputs.map(input => input)}
            <button type="button" className='btn btn--blue' onClick={this.addInput.bind(this)}>ДОБАВИТЬ ПАРАМЕТР</button>
          </div>
        )
      }

      let input = param[0] == 'parameters' ? returnParams() : returnField();

      return input;
    })

    return (
      <div>
        <div className={styles['section-parameters__content']}>
          <div>
            <h1 className={styles['section-parameters__content-heading']}>Начать голосование</h1>
              <p className={styles['section-parameters__content-subheading']}>Административные токены</p>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                value={contractModel.votingTemplate.questionId}
                onChange={this.handleSelect.bind(this)}
                placeholder="Вопрос"
                options={contractModel.optionsForVoting}
              />
          </div>

          <div className={styles['section-parameters__buttons']}>
            <form name="votingData" onSubmit={this.toggleSubmit.bind(this)}>
              {inputs}
              <button className='btn btn--blue' disabled={votingTemplate.prepared}>НАЧАТЬ ГОЛОСОВАНИЕ</button> 
            </form>
          </div>
        </div>
      </div>
    )
  }
  getActiveVotingPanel() {
    return (
      <div> 
        <div className={styles['section-parameters__active']}>
          <img src={VotingActive}/>
          <h1>Голосование запущено</h1>
          <p>Вы сможете начать новое голосование, после того как завершится активное</p>
        </div>
      </div>
    )
  }

  selectType(selected) {
    this.setState({selectedType: selected.value});
  }

  selectRange(selected) {
    this.setState({selectedRange: selected.value});
  }

  handleSelect(selected){
    const { contractModel } = this.props;
    console.log(selected.value);
    contractModel.prepareVoting(Number(selected.value));
    this.setState({
      selected: selected.value - 1
    }) 
  }

  prepareFormula(formula) {
        const FORMULA_REGEXP = new RegExp(/(group)|((?:0x*[a-zA-Z0-9]{40}))|((quorum|positive))|(>=|<=)|([0-9%]{1,})|(quorum|all)/g);
        let matched = formula.match(FORMULA_REGEXP);
        console.log(matched)
        
        let convertedFormula = [];
        
        matched[0] == 'group'? convertedFormula.push(0) : convertedFormula.push(1)
        matched[2] == 'quorum'? convertedFormula.push(0) : convertedFormula.push(1)
        matched[3] == '<='? convertedFormula.push(0) : convertedFormula.push(1)
        convertedFormula.push(Number(matched[4].replace('%', '')))

        if (matched.length == 6) {
           matched[5] == 'quorum' ? convertedFormula.push(0) : convertedFormula.push(1)
        }
        console.log(convertedFormula);
        return convertedFormula;
    }


  async createVotingData(target) {
    const { contractModel } = this.props;
    const { questions, votingTemplate } = contractModel;
    const { selected } = this.state;
    
    votingTemplate.prepared = !votingTemplate.prepared;
    this.setState({
      createVotingStep:2
    })

    let mainInputs = target.querySelectorAll('form[name="votingData"] > label input ');
    let additionalInputs = target.querySelectorAll('.votings-additionals input')
    let additionalSelects = target.querySelectorAll('.votings-additionals select')
    console.log(mainInputs, additionalInputs, additionalSelects);

    let methodSelector = questions.system[selected].methodSelector;
    let questionParameters = questions.system[selected]._parameters;
    let values = [];

    hexString += questions.system[selected].methodSelector

    let parametersTypes = questionParameters.map((param, index)=>{
      let type = '';
      if (index%2 != 0) {
        type = web3.utils.hexToUtf8(param)
      }
      return type != "" ? type : '' ;
    })

    parametersTypes = parametersTypes.filter(e=>e);

    if (selected == 0) {
      parametersTypes = ['uint[]','uint8','string','string','address','bytes4','uint[]','bytes32[]']
      let id = await contract.methods.getCount().call({from: web3.eth.accounts.wallet[0].address})
      let groupId = mainInputs[0].value;
      let time = mainInputs[3].value;
      let name = mainInputs[1].value;
      let text = mainInputs[2].value;
      let method = mainInputs[4].value;
      let formula = this.prepareFormula(mainInputs[5].value);
      values.push([Number(id), Number(groupId), Number(time)], 0, name, text, contract._address, method, formula);
      values.push([]);

      for(let i = 0; i < additionalInputs.length; i++) {
        let arrLen = values.length;
        values[arrLen-1].push(web3.utils.utf8ToHex(additionalInputs[i].value), web3.utils.utf8ToHex(additionalSelects[i].value))
      }
    } else {
      mainInputs.forEach(input => {
        values.push(input.value)
      })
      
    }

    console.log(values);
    let hexString = (web3.eth.abi.encodeParameters(parametersTypes, values));

    hexString = hexString.replace('0x', methodSelector);
    return hexString;
  }

  async startVoting(e) {
    e.preventDefault();
    const { contractModel } = this.props;
    const { contract, votingTemplate} = contractModel;
    const { questionId } = votingTemplate;

    let privateKey = web3.eth.accounts.wallet[0].privateKey
    let votingData = await this.createVotingData(document.forms.votingData);
    console.log(votingData);

    let data = contract.methods.startNewVoting(questionId, 0, 0, votingData).encodeABI();
    let options = {
      data,
      to:contract._address,
      gasPrice: web3.utils.toHex(10000000000),
      gasLimit: web3.utils.toHex(6000000),
      value: '0x0'
    };

    web3.eth.accounts.signTransaction(options, privateKey)
    .then( data =>{
        web3.eth.sendSignedTransaction(data.rawTransaction)
        .on('error', (err)=>{ console.log(err)})
        .on('transactionHash', (txHash)=>{
            this.txHash = txHash
            console.log(txHash);
            this.setState({
              createVotingStep:4
            })
        })
        .on('receipt', (data)=> {
            console.log(data)
            this.setState({
              startVoting: false,
              createVotingStep: 5
            })
            contractModel.getVotings();
        })
      })

  } 

  async selectQuestionId(selected){
   await this.setState({
     questionId: Number(selected.value)
    })
    this.filterVotings()
  }
  async selectIdFromTo(selected){
    await this.setState({
      id: selected.value 
    })
    this.filterVotings(selected.value)
  }
  async handleFromChange(from) {
    // Change the from date and focus the "to" input field
    await this.setState({ from });
    this.filterVotings()
  }
  async handleToChange(to) {
   await this.setState({ to });
    this.filterVotings()
  }

  filterVotings() {
    const {contractModel } = this.props;
    let params = {
      questionId: this.state.questionId,
      page: this.state.id,
      from: this.state.from,
      to: this.state.to
    }
    contractModel.filterVotings(params);

  }
  validateInputs(target) {
    let inputs = target.querySelectorAll('input');
    let valids = [];
    inputs.forEach(input => {
      let name = input.getAttribute('name')
      let valid = false;
      switch (name) {
        case('int'):
          valid = Boolean(Number(input.value));
          break;
        case('string'):
          valid = Boolean(String(input.value));
          break;
        case('address'):
          valid = Boolean((input.value).match(new RegExp(/(0x)+([0-9 a-z A-z]){40}/g)))
          break;
        default:
          valid = true;
          break;
      }
      if(valid == false) {
        input.classList.add('field__input--error')
      }
      valids.push(valid)
    })
    return ([...new Set(valids)]);
  }
  toggleSubmit(e) {
    e.preventDefault();
    const { contractModel } = this.props;
    const { votingTemplate } = contractModel;

    let valids = this.validateInputs(document.forms.votingData);

    if (valids.length == 2) {
      if ((valids[0] == false) || (valids[0] == false)) {
        return false
      } else {
        votingTemplate.prepared = !votingTemplate.prepared;
        this.setState({
          startVoting: !this.state.startVoting
        })
      }
    } else {
      if ((valids[0] == false)) {
        return false
      } else {
        votingTemplate.prepared = !votingTemplate.prepared;
        this.setState({
          startVoting: !this.state.startVoting
        })
      }
    }
  }

  hideModal() {
    const { contractModel } = this.props;
    const { votingTemplate } = contractModel;
    votingTemplate.prepared = false;
  }


  render() { 
    const { contractModel } = this.props;
    const { selected, from, to, startVoting, createVotingStep} = this.state;
    const { bufferVotings, votingTemplate, userVote } = contractModel;
    const modifiers = { start: from, end: to };

    let renderVotings = bufferVotings.map((voting, index)=> <Voting key={index+1} data={voting} index={index+1}/>)

    let loader = this.getLoader();
    let rightPanel = createVotingStep == 1 
      ? this.getPreparingPanel() 
      : createVotingStep == 5 
        ? this.getActiveVotingPanel()
        : this.getLoader()

    

    return ( 
      <div className={styles.wrapper}>
        <section className={`${styles.section} ${styles['section-parameters']}`}>
          {rightPanel}
        </section>

        <section className={`${styles.section} ${styles['section-votings']}`}>
          <div className={styles['section-votings__filters']}>
            <label className={`${styles['section-votings__filters-numbers']} 
                               ${styles['section-votings__filters-numbers--questions']}`
                              }>

              <span> Вопрос </span>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                placeholder={'Выберите вопрос'}
                value={this.state.questionId}
                onChange={this.selectQuestionId.bind(this)}
                options={contractModel.options}
              />
            </label>

            <label className={`${styles['section-votings__filters-numbers']} 
                               ${styles['section-votings__filters-numbers--id']}`}>
              <span> Номера </span>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                value={0}
                placeholder={'Номер'}
                value={this.state.id}
                onChange={this.selectIdFromTo.bind(this)}
                options={contractModel.votingsPages}
              />
            </label>
            <label className={`${styles['section-votings__filters-numbers']} 
                               ${styles['section-votings__filters-numbers--date']}`}>
              <span> Дата </span>
              <div className="InputFromTo">
                <DayPickerInput
                  value={from}
                  placeholder="From"
                  format="LL"
                  formatDate={formatDate}
                  parseDate={parseDate}
                  dayPickerProps={{
                    selectedDays: [from, { from, to }],
                    toMonth: to,
                    modifiers,
                    numberOfMonths: 2,
                    onDayClick: () => this.to.getInput().focus(),
                  }}
                  onDayChange={this.handleFromChange.bind(this)}
                />{' '}
                —{' '}
                <span className="InputFromTo-to">
                  <DayPickerInput
                    ref={el => (this.to = el)}
                    value={to}
                    placeholder="To"
                    format="LL"
                    formatDate={formatDate}
                    parseDate={parseDate}
                    dayPickerProps={{
                      selectedDays: [from, { from, to }],
                      modifiers,
                      month: from,
                      fromMonth: from,
                      numberOfMonths: 2,
                    }}
                    onDayChange={this.handleToChange.bind(this)}
                  />
                </span>
              </div>
            </label>
          </div>

          {
            renderVotings
          }
        </section>
        <SetVoteModal descision={this.state.descision}/>
        <StartVotingmodal visible={votingTemplate.prepared} submit={this.startVoting.bind(this)} closeWindow={this.hideModal.bind(this)}/>
        <AlertModal/>
      </div>
     );
  }
}
 
export default Votings;
