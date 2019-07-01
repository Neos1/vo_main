import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
//import { AbiCoder } from 'web3-eth-abi';
import start from '../../../img/start_icon.svg'
import styles from './style.scss';

import voteActive from '../../../img/vote_active.svg';
import votePositive from '../../../img/vote_positive.svg';
import voteNegative from '../../../img/vote_negative.svg';
import voteNone from '../../../img/vote_none.svg';
import positive from '../../../img/set_positive.svg';
import negative from '../../../img/set_negative.svg';
import awaitLastVote from '../../../img/voting_lastVote.svg';


@inject('contractModel')@observer
class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
      timeStart:'',
      timeEnd: '',
      remaining: '',
      percent: 0,
      descision: 0,
      votingPercents : {
        positive: 0,
        negative: 0,
        totalTokens: 0
      },
      preDescision: '',
      graphics: false,
    }
  }
  async componentWillMount() {
    this.getTime();
    this.getVotesPercents();
    this.getVotingDescision();
  }
  toggleExpand(){
    this.setState({
      expanded: !this.state.expanded
    })
  }
  getFlow() {
    const {remaining, percent} = this.state;
    if (percent > 100) {
      this.setState({
        percent: 100
      })
    }
    const voteNotEnded = ()=> {
      return (
        <p className={styles['voting-about__progress']}>
          <span className={styles['voting-about__progress-remaining']}>Осталось {remaining < 0 ? 0 : remaining} минут</span>
          <span className={styles['voting-about__progress-bar']} style={{'width': percent+"%"}}></span>
        </p>
      )
    }
    const voteEnded = ()=> {
      return (
        <p className={styles['voting-about__progress']}>
          <p className={styles['voting-about__progress-last']}>
            <span>Ожидание последнего голоса</span>
            <img src={awaitLastVote}/>
          </p>
        </p>
      )
    }
    let result = percent < 100 ? voteNotEnded() : voteEnded()

    return (
      <div className={styles['voting-about__flow-active']}>
        <p>
          <span>Идет голосование</span>
          <img src={voteActive}/>
        </p>
          {
            result
          }
      </div>
    )
  }
  getVotingDescision(){
    const {contractModel, index} = this.props;
    const { contract } = contractModel;
    const address = web3.eth.accounts.wallet[0].address;
    contract.methods.getVotingDescision(index).call({from: address})
      .then(async (result) =>{ 
        await this.setState({descision: result})
      })

  }

  getDescision(){
    const { descision } = this.state;
    let descisions = {
      0:{ 
        text: "НЕ ПРИНЯТО",
        img: voteNone
      },
      1: {
        text: "ЗА",
        img: votePositive
      },
      2: {
        text: "ПРОТИВ",
        img: voteNegative
      }
    }
    
    return (
      <div className={styles['voting-about__flow-descision']}>
        <p>
          <span>Решение 
            <br/> 
            <strong>{descisions[descision].text}</strong>
          </span>
          <img src={descisions[descision].img}/>
        </p>
      </div>
    )
  }
  getTime() {
    const {data} = this.props;

    let startTime = Number(data.startTime)*1000
    let endTime = Number(data.endTime)*1000;

    let dateStart = new Date();
    let dateEnd = new Date();
    let dateNow = new Date();

    dateStart.setTime(startTime);
    dateEnd.setTime(endTime);

    let duration = dateEnd - dateStart;
    let remaining = dateEnd - dateNow;
    let percent = remaining/duration * 100;

    this.setState({
      timeStart: dateStart.toLocaleString(),
      timeEnd: dateEnd.toLocaleString(),
      remaining: (remaining/60000).toFixed(0),
      percent: 100 - percent
    })
  }

  getQuestionData() {
    const {contractModel, index} = this.props;
    const { questions, bufferVotings } = contractModel;
    let id = bufferVotings[index-1][0] - 1;
    let votingData = bufferVotings[index-1].data;
    let methodSelector = questions.system[id].methodSelector;
    let questionParams = questions.system[id]._parameters;
    let finalData = [];

    let parametersTypes = questionParams.map((param, index)=>{
      let type = '';
      let parameter = web3.utils.hexToUtf8(param);
      if (index%2 != 0) {
        type = parameter
      }
      return type != "" ? type : '' ;
    })
    parametersTypes = parametersTypes.filter(e=>e);


    if (id == 0) {
      questionParams = ['ID', 'uint', 'Status','uint8','Name','string','Text','string','Target','address','MethodSelector','bytes4','Formula','uint[]','parameters','bytes32[]'].map(param => web3.utils.utf8ToHex(param))
      parametersTypes = ['uint[]','uint8','string','string','address','bytes4','uint[]','bytes32[]'];
    } 
    
    votingData = votingData.replace(methodSelector, '0x');
    let data = web3.eth.abi.decodeParameters(parametersTypes, votingData);
        data = Object.values(data);

    for(let i = 0; i < data.length - 1; i++) {
      if (i == 0) {
        if (typeof data[i] == 'object') {
          finalData.push([questionParams[i*2], data[i][0]])
        } else {
          finalData.push([questionParams[i*2], data[i]])
        }
      } else {
        finalData.push([questionParams[i*2], data[i]])
      }
    }

    return finalData;
  }
  
  prepareToVote(descision, params) {
    const {data, contractModel} = this.props;
    contractModel.getUserVote(true, data[0], descision, params);
  }

  getFormula() {
    const {data, contractModel} = this.props;
    let questionId = data[0];
    let formula = contractModel.questions.system[questionId-1]._formula; 

    let f = formula.map(text=> Number(text));
    let r = [];
    let ready = '( )'
    f[0] === 0 ? r.push('group(') : r.push('user(') ;
    f[1] === 1 ? r.push('Owners) => condition( ') : r.push('Custom) => condition( ') ;
    f[2] === 0 ? r.push('quorum') : r.push('positive') ;
    f[3] === 0 ? r.push(' <= ') : r.push(' >= ') ;
    f.length == 6 ? r.push(`${f[4]} %`) : r.push(`${f[4]} % )`)
    if (f.length == 6) {
      f[5] === 0 ? r.push(' of quorum)') : r.push(' of all)') ;
    }

    formula = r.join('');
    ready = ready.replace(' ', formula);

    return ready;
  }
  getVotesPercents() {
    const {contractModel, index} = this.props;
    const { contract} = contractModel;
    const address = web3.eth.accounts.wallet[0].address;

    contract.methods.getVotes(index).call({from: address}).then(data => {
      const positive = Number(data[0]);
      const negative = Number(data[1]);
      const abstained = Number(data[2]) - (positive+ negative);
      if ((positive > negative) && (positive > abstained)) this.setState({preDescision: 'ЗА'})
      if ((negative > positive) && (negative > abstained)) this.setState({preDescision: 'ПРОТИВ'})
      if ((abstained > positive) && (abstained > negative)) this.setState({preDescision: 'НЕ ГОЛОСОВАЛО'})

      this.setState({
        votingPercents : {
          positive: Number(data[0]),
          negative: Number(data[1]),
          totalTokens: Number(data[2])
        }
      })
    });
  }

  getGroupBlock() {
    const {votingPercents} = this.state;
    const {positive, negative, totalTokens} = votingPercents;

    let positive_percent = positive == "0" ? 0 :  (positive/totalTokens) * 100
    let negative_percent = negative == "0" ? 0 :  (negative/totalTokens) * 100
    let abstained_percent = totalTokens == "0" ? 0 :  ((totalTokens-(positive+negative))/totalTokens) * 100
    return (
       <div className={styles['voting-group']}>
              <div className={styles['voting-group__heading']}>
                <h2>Администраторы</h2>
                <span>респонденты</span>
              </div>
              <div className={styles['voting-group__results']}>
                <label className={`${styles['voting-group__results-bar']} `}>
                  <span className={styles['voting-bar__label']}>За</span>
                  <span className={styles['voting-bar__percent']}> { positive_percent } %</span>
                  <p className={`${styles['voting-bar']} ${styles['voting-bar--positive']} `}>
                    <span style={{'width': positive_percent +'%'}}></span>
                  </p>
                </label>
                <label className={`${styles['voting-group__results-bar']}`}>
                  <span className={styles['voting-bar__label']}>Против</span>
                  <span className={styles['voting-bar__percent']}> { negative_percent } %</span>
                  <p className={`${styles['voting-bar']} ${styles['voting-bar--negative']} `}>
                    <span style={{'width': negative_percent +'%'}}></span>
                  </p>
                </label>
                <label className={`${styles['voting-group__results-bar']}`}>
                  <span className={styles['voting-bar__label']}>Не голосовало</span>
                  <span className={styles['voting-bar__percent']}> { abstained_percent } %</span>
                  <p className={`${styles['voting-bar']} ${styles['voting-bar--abstained']} `}>
                    <span style={{'width': abstained_percent +'%'}}></span>
                  </p>
                </label>
              </div>
            </div>
    )
  }
  
  getVotingsButtons(votingParams) {
    return(
      <div className={styles['voting-expanded__split-start']}>
          <label>
            <span> ЗА </span>
            <button className="btn btn--blue" onClick={this.prepareToVote.bind(this, true, votingParams)}>
              <img src={positive}></img>
            </button>
          </label>
          <label>
            <span> ПРОТИВ </span>
            <button className="btn btn--red" onClick={this.prepareToVote.bind(this, false, votingParams)}>
              <img src={negative}></img>
            </button>
          </label>
      </div>
    )
  }

  toggleGraphs(){ 
    this.setState({
      graphics: !this.state.graphics 
    })
  }

  getHideGroupsBtn() {
    return(
      <div style={{'textAlign': 'center', 'padding': '20px'}}>
        <span className={`${styles['label']}`} onClick={this.toggleGraphs.bind(this)}>скрыть группы</span> 
      </div>
    )
  }

  render() { 
    const {data, index, contractModel} = this.props;
    const {questions} = contractModel;
    const {timeStart, timeEnd, graphics} = this.state;
    const vars = {
      int: 'Число',
      string: 'Строка',
      address: 'Адрес',
    }

    let rightPanel = data.status == 0  ? this.getFlow() : this.getDescision();
    let votingParams = this.getQuestionData();
    let formula = this.getFormula();

    let votingParameters = votingParams.map(( param, index ) => {
      let value;
      if ((index == votingParams.length - 1 ) && (typeof(param[1]) == 'object')) {
        value = param[1].map((subParam, index) => {
          if (index % 2 == 0 ) return (
            <p key={index}>
              <span>{web3.utils.hexToUtf8(subParam)}</span>
              <span> - </span>
              <span>{web3.utils.hexToUtf8(param[1][index+1])}</span>
            </p>
          )
          
        })
      }else if ((index == votingParams.length - 2 ) && (typeof(param[1]) == 'object')){
        value = param[1];
      } else {
        value = param[1];
      }; 
      
      return (
        <p key={index}>
          <span>{web3.utils.hexToUtf8(param[0])}</span>
          <span> - </span>
          <span>{value}</span>
        </p>
      )
    })

    let hideBtn = this.getHideGroupsBtn();
    let percents = this.getGroupBlock();
    let splitButtons = data.status == 0 ? this.getVotingsButtons(votingParams) : '';

    return ( 
      <div className={styles.voting + ' ' + `${this.state.expanded ? "opened":''}`} >
        <div className={styles['voting-about']} onClick={this.toggleExpand.bind(this)} >
          <div className={styles['voting-about__info']} >
            <span className={styles['voting-id']}>{data.id}</span>
            <h1 className={styles['voting-caption']} >{data.caption}</h1>
            <p className={styles['voting-text']}>{data.text}</p>
            <p className={styles['voting-duration']}>Начало <strong>{timeStart}</strong> часа(ов)</p>
            <p className={styles['voting-duration']}>Конец <strong>{timeEnd}</strong> часа(ов)</p>
          </div>
          <div className={styles['voting-about__flow']}>
                {rightPanel}
          </div>
        </div>
        <div className={styles['voting-expanded'] }>
          <div className={styles['voting-expanded__split']}>
            <div className={styles['voting-expanded__split-info']}>
              {
                votingParameters
              }
            </div>
            {
              splitButtons
            }
          </div>
          <div className={styles['voting-expanded__formula']}>
            <p className={styles['voting-expanded__formula-heading']}>Формула голосования</p>
            <p  className={styles['voting-expanded__formula-formula']}>{ formula }</p>
          </div>
          <div className={`${styles['voting-expanded__votes']}`}>
            <div className={`${styles['voting-expanded__votes--placeholder']} ${!graphics? '' :'hidden'}`}> 
              <p>
                <span>Большинство голосов<br/> на данный момент</span>
                <span>
                  {
                    this.state.preDescision
                  }
                </span>
              </p>
              <span className={`${styles['label']}`} onClick={this.toggleGraphs.bind(this)}>Показать графики</span>
            </div>
              { graphics ? percents: '' }
              { graphics ? hideBtn : '' }
          </div>
        </div>
      </div>
     );
  }
}
 
export default Voting;