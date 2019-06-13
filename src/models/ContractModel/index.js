import {observable, action, computed } from 'mobx';
import { Redirect } from 'react-router';

class ContractModel {

  @observable contract;
  @observable questions = {
    system: [],
    other: []
  }
  @observable bufferQuestions = {
    system: [],
    other: []
  }
  @observable votings = [];
  @observable bufferVotings = [];

  @observable votingTemplate = {
    prepared: false,
    questionId: 0,
    params: [],
    data: []
  }
  
  @observable userVote = {
    prepared: false,
    voted: false,
    status: 0,

    questionId:'',
    descision: '',
    parameters:[],
  }

  @action getUserVote(prepared ,questionId, descision, parameters) {
    this.userVote = {
      prepared,
      questionId,
      descision,
      parameters,
      status: 0,
    }
  } 
  
  @action setContract (contract){
    this.contract = window.contract =  contract;
    console.info(contract)
  }

//* questions
  @action async getQuestions (type) {
    let questions
    
    if (localStorage.getItem(`questions[${type}][${this.contract._address}]`)) {
      questions = JSON.parse(localStorage.getItem(`questions[${type}][${this.contract._address}]`));
      this.questions[type] = questions.reverse();
    }

    let i = this.questions[type].length ? this.questions[type].length + 1 : 1;
    let address = web3.eth.accounts.wallet[0].address;

    let length = await this.contract.methods.getCount().call({from: address})

    for (i; i <=(length-1) ; i++) {
      let question = await this.contract.methods.question(i).call({from: address})      
      this.questions[type].push(question)
    }
    this.bufferQuestions[type] = this.questions[type] ;
    localStorage.setItem(`questions[${type}][${this.contract._address}]`, JSON.stringify(this.questions[type]))
    return this.bufferQuestions[type];
  }
    @action filterQuestions(filters) {
      const {page} = filters;
      this.filterQuestionsByPage(page);
    }
    @action filterQuestionsByPage(page) {
      if (page != null) {
        let start = Number(page)*10;
        let end = start+9;
        this.bufferQuestions.system = this.bufferQuestions.system.filter((question, index)=> {
          return((index >= start) && (index <= end))
        })
      } else {
        return false; 
      }
    }

//* questions end


//* votings
  @action async getVotings (type) {
    let votings
    
    if (localStorage.getItem(`votings[${this.contract._address}]`)) {
      votings = JSON.parse(localStorage.getItem(`votings[${this.contract._address}]`));
      this.votings = votings.reverse();
    }

    let i = this.votings.length !== 0 ? this.votings.length+1 : 1;
    let address = web3.eth.accounts.wallet[0].address;

    let length = await this.contract.methods.getVotingsCount().call({from: address})
      for (i ; i <= (length-1); i++) {
        let voting = await this.contract.methods.voting(i).call({from: address})

        this.votings.push(voting)
      }
    this.votings.map((voting, index)=> {
      voting.id = index+1;
    })
    this.votings = this.votings.reverse()
    this.bufferVotings = this.votings;

    localStorage.setItem(`votings[${this.contract._address}]`, JSON.stringify(this.votings));
    return this.bufferVotings;
  }

    @action filterVotings(filters) {
      const {questionId, page, from, to} = filters;
      this.filterByQuestion(questionId);
      this.filterByPage(page);
      this.filterByDate(from, to);
    }

    @action filterByQuestion(questionId) {
      this.bufferVotings = questionId !== 0 
      ? this.votings.filter( voting => { 
        return (voting[0] == questionId);
      }) 
      : this.votings;
    }
    @action filterByPage(page) {
      if (page != null) {
        let start = Number(page)*10;
        let end = start+9;
        this.bufferVotings = this.bufferVotings.filter((voting, index)=> {
          return((index >= start) && (index <= end))
        })
      } else {
        return false; 
      }
    }
    
    @action async filterByDate(from, to) {
      this.bufferVotings = this.bufferVotings.filter((voting) => {

        let dateStart = null;
        let dateEnd = null;
        let filterStart = null;
        let filterEnd = null;

        if (from != undefined) {
          dateStart= new Date();
          dateStart.setTime(Number(voting.startTime)*1000);
          filterStart = new Date(from);
        }
        
        if( to != undefined ) {
          filterEnd = new Date(to);
        }

        return((dateStart >= filterStart) && (dateStart <= filterEnd))
      })
    }

//* votings end

 

//* options with questions for selects
  @computed get options() {
    let options = [{value: null, label: 'Все вопросы'}]
    this.questions['system'].map((item, index) => (
      options.push({value: index+1,label: `${index+1} ${item.caption}`})
    ))
    return options;
  }
  @computed get optionsForVoting() {
    return this.questions['system'].map((item, index) => ({
      value: index+1,
      label: `${index+1} ${item.caption}`
    }))
  }
//* options with questions for selects end

//* options with pages of votings
  @computed get votingsPages() {
    let options = [{value: null, label: 'Все вопросы'}];
    let length = this.votings.length;
    if (length / 10 < 1){
      let option = { value: 0, label: `1-${length}`};
      options.push(option);
    } else {
      let count = Math.ceil(length / 10);
      for ( let i = 0; i < count; i++ ) {
        let option = { value: i, label: `${ i*10+1 }-${( i*10 ) + 10}`};
        options.push(option);
      }
    }

    return options;
  }
//* options with pages of questions
  @computed get questionsPages() {
    let options = [{value: null, label: 'Все вопросы'}];
    let length = this.questions.system.length;
    if (length / 10 < 1){
      let option = { value: 0, label: `1-${length}`};
      options.push(option);
    } else {
      let count = Math.ceil(length / 10);
      for ( let i = 0; i < count; i++ ) {
        let option = { value: i, label: `${ i*10+1 }-${( i*10 ) + 10}`};
        options.push(option);
      }
    }
    return options;
  }


  @action prepareVoting(id) {
    const { questions } = this;
    let parameters = questions.system[id-1]._parameters
    let params = [];

    for(let i = 0; i < parameters.length; i+=2 ) {
      let param = [web3.utils.hexToUtf8(parameters[i]), web3.utils.hexToUtf8(parameters[i+1])];
      params.push(param);
    }


    this.votingTemplate = {

      questionId: id,
      params: params,
      data:[]
    }
  }
  @action switchFromVoteToStatus(){
    this.userVote.prepared = false; 
    this.userVote.voted = true; 
  }
 
  @action sendVote() {
    let voteId = this.votings.length;
    let descision = this.userVote.descision == true ? 1 : 2;
    let address = web3.eth.accounts.wallet[0].address;

    let privateKey = web3.eth.accounts.wallet[0].privateKey;
    this.userVote.status = 3;
    this.contract.methods.sendVote(descision).send({from: address, gas: web3.utils.toHex(6000000), gasPrice: web3.utils.toHex(10000000000)})
      .on('error',(error)=>{ 
        this.userVote.status = 2;
        console.log(error)
        })
      .on('transactionHash',(txHash)=>{ console.log(txHash)})
      .on('receipt',(receipt)=>{ 
        this.userVote.status = 1;
        console.log(receipt)
        })
  }
}

const contractModel = window.contractModel =  new ContractModel();

export default contractModel;