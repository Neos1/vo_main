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
import Alert from '../../common/Alert';


@inject('contractModel') @observer
class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      timeStart: '',
      timeEnd: '',
      remaining: '',
      percent: 0,
      descision: 0,
      userVote: null,
      isReturned: false,
      closing: false,
      votingPercents: {
        positive: 0,
        negative: 0,
        totalTokens: 0
      },
      preDescision: '',
      graphics: false,
      status: 0,
      interval: '',
    }
  }
  async componentWillMount() {
    const { data } = this.props
    await this.getTime();
    await this.getVotingDescision();
    await this.getVotesPercents();
    await this.getUserVote(data.votingId);
    await this.setState({
      interval: setInterval(() => {
        this.refreshVoting();
      }, 5 * 1000)
    })
  }

  async refreshVoting() {
    const { data } = this.props
    await this.getTime();
    await this.getVotingDescision();
    await this.getVotesPercents();
    await this.getUserVote(data.votingId)
    if (data.status == 1) {
      clearInterval(this.state.interval);
      this.setState({ interval: '' });
    }
  }

  showAlert(text) {
    const { contractModel } = this.props;
    contractModel.showAlert(text);
  }

  async getUserVote(id) {
    const { contractModel, data } = this.props;
    const { contract } = contractModel;
    let userVote = await contract.methods.getUserVote(id).call({ from: web3.eth.accounts.wallet[0].address });
    let isReturned = await contract.methods.isUserReturnTokens(data.votingId, web3.eth.accounts.wallet[0].address).call({ from: web3.eth.accounts.wallet[0].address })
    await this.setState({ userVote, isReturned });
  }

  async returnTokens() {
    const { contractModel, setStep, data } = this.props;
    const { contract } = contractModel;
    contract.methods.returnTokens(data.votingId).send({ from: web3.eth.accounts.wallet[0].address, gas: 5000000, gasPrice: window.gasPrice })
      .on('error', (err) => {
        setStep(1);
        this.showAlert('Произошла ошибка');
      })
      .on('transactionHash', txhash => {
        setStep(4)
      })
      .on('receipt', receipt => {
        setStep(1);
        contractModel.refreshLastVoting();
        this.setState({ isReturned: true });
        this.showAlert("Токены успешно возвращены")
      })

  }

  toggleExpand() {
    this.setState({
      expanded: !this.state.expanded
    })
  }
  async closeVoting(e) {
    console.log(e.target.getAttribute('disabled'));
    const { contractModel, setStep } = this.props;
    const { contract } = contractModel;
    const address = web3.eth.accounts.wallet[0].address;
    await this.setState({
      expanded: false
    })
    if (this.state.closing == false) {
      await this.setState({
        expanded: false,
        closing: true
      })
      contract.methods.closeVoting().send({ from: address, gas: 8000000, gasPrice: window.gasPrice })
        .on('transactionHash', txhash => {
          setStep(4)
        })
        .on('receipt', async (receipt) => {
          setStep(1);
          contractModel.refreshLastVoting();
        })
    }

  }
  getFlow() {
    const { contractModel, data } = this.props;
    console.log(data.votingId);
    const { remaining, percent, status } = this.state;
    console.log(remaining, percent, status);
    const voteNotEnded = () => {
      return (
        <p className={styles['voting-about__progress']}>
          <span className={styles['voting-about__progress-remaining']}>Осталось {remaining == 0 ? 'меньше' : remaining} минут{remaining == 0 ? 'ы' : ''} </span>
          <span className={styles['voting-about__progress-bar']} style={{ 'width': percent + "%" }}></span>
        </p>
      )
    }
    const voteEnded = () => {
      return (
        <p className={styles['voting-about__progress']}>
          <p className={styles['voting-about__progress-last']}>
            <span>Ожидание последнего голоса</span>
            <img src={awaitLastVote} />
          </p>
          <p>
            <a disabled={this.state.closing} onClick={this.closeVoting.bind(this)}>Завершить голосование</a>
          </p>
        </p>
      )
    }
    let result = percent < 100 ? voteNotEnded() : voteEnded()

    return (
      <div className={styles['voting-about__flow-active']}>
        <p>
          <span>Идет голосование</span>
          <img src={voteActive} />
        </p>
        {
          result
        }
      </div>
    )
  }
  getVotingDescision() {
    const { contractModel, index, data } = this.props;
    const { contract } = contractModel;
    const address = web3.eth.accounts.wallet[0].address;
    contract.methods.getVotingDescision(data.votingId).call({ from: address })
      .then(async (result) => {
        await this.setState({ descision: result })
      })

  }

  getDescision() {
    const { descision, userVote, isReturned } = this.state;
    const isVoted = (userVote != 0 && userVote != null);

    let descisions = {
      0: {
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
            <br />
            <strong>{descisions[descision].text}</strong>
          </span>
          <img src={descisions[descision].img} />
        </p>
        <p className={(isVoted && !isReturned) ? "" : "hidden"}>
          <a onClick={this.returnTokens.bind(this)}>Вернуть токены</a>
        </p>
      </div>
    )
  }
  getTime() {
    const { data } = this.props;

    let startTime = Number(data.startTime) * 1000
    let endTime = Number(data.endTime) * 1000;

    let dateStart = new Date();
    let dateEnd = new Date();
    let dateNow = new Date();

    dateStart.setTime(startTime);
    dateEnd.setTime(endTime);
    dateNow = new Date();

    let duration = dateEnd - dateStart;
    let remaining = dateEnd - dateNow;
    let percent = remaining / duration * 100;

    this.setState({
      timeStart: dateStart.toLocaleString(),
      timeEnd: dateEnd.toLocaleString(),
      remaining: (remaining / 60000).toFixed(0),
      percent: 100 - percent
    })
  }

  getQuestionData() {
    const { contractModel, index } = this.props;
    const { questions, bufferVotings } = contractModel;
    let id = bufferVotings[index - 1][0] - 1;
    let votingData = bufferVotings[index - 1].data;
    let methodSelector = questions[id].methodSelector;
    let questionParams = questions[id]._parameters;
    let finalData = [];

    let parametersTypes = questionParams.map((param, index) => {
      let type = '';
      let parameter = web3.utils.hexToUtf8(param);
      if (index % 2 != 0) {
        type = parameter
      }
      return type != "" ? type : '';
    })
    parametersTypes = parametersTypes.filter(e => e);


    if (id == 0) {
      questionParams = ['ID', 'uint', 'Status', 'uint8', 'Name', 'string', 'Text', 'string', 'Target', 'address', 'MethodSelector', 'bytes4', 'Formula', 'uint[]', 'parameters', 'bytes32[]'].map(param => web3.utils.utf8ToHex(param))
      parametersTypes = ['uint[]', 'uint8', 'string', 'string', 'address', 'bytes4', 'uint[]', 'bytes32[]'];
    }

    votingData = votingData.replace(methodSelector, '0x');
    let data = web3.eth.abi.decodeParameters(parametersTypes, votingData);
    data = Object.values(data);

    for (let i = 0; i < data.length - 1; i++) {
      if (i == 0) {
        if (typeof data[i] == 'object') {
          finalData.push([questionParams[i * 2], data[i][0]])
        } else {
          finalData.push([questionParams[i * 2], data[i]])
        }
      } else {
        finalData.push([questionParams[i * 2], data[i]])
      }
    }

    return finalData;
  }

  prepareToVote(descision, params) {
    const { data, contractModel } = this.props;
    contractModel.getUserVote(true, data[0], descision, params);
  }

  getFormula() {
    const { data, contractModel } = this.props;
    let questionId = data[0];
    let formula = contractModel.questions[questionId - 1]._formula;

    let f = formula.map(text => Number(text));
    let r = [];
    let ready = '( )'
    f[0] === 0 ? r.push('group(') : r.push('user(');
    f[1] === 1 ? r.push('Owners) => condition( ') : r.push('Custom) => condition( ');
    f[2] === 0 ? r.push('quorum') : r.push('positive');
    f[3] === 0 ? r.push(' <= ') : r.push(' >= ');
    f.length == 6 ? r.push(`${f[4]} %`) : r.push(`${f[4]} % )`)
    if (f.length == 6) {
      f[5] === 0 ? r.push(' of quorum)') : r.push(' of all)');
    }

    formula = r.join('');
    ready = ready.replace(' ', formula);

    return ready;
  }

  getVotesPercents() {

    const { contractModel, index, data } = this.props;
    const { contract } = contractModel;
    const address = web3.eth.accounts.wallet[0].address;

    contract.methods.getVotes(data.votingId).call({ from: address }).then(data => {
      const positive = Number(data[0]);
      const negative = Number(data[1]);
      const abstained = Number(data[2]) - (positive + negative);
      if ((positive > negative) && (positive > abstained)) this.setState({ preDescision: 'ЗА' })
      if ((negative > positive) && (negative > abstained)) this.setState({ preDescision: 'ПРОТИВ' })
      if ((abstained > positive) && (abstained > negative)) this.setState({ preDescision: 'НЕ ГОЛОСОВАЛО' })

      this.setState({
        votingPercents: {
          positive: Number(data[0]),
          negative: Number(data[1]),
          totalTokens: Number(data[2])
        }
      })
    });
  }

  getGroupBlock() {
    const { contractModel, data } = this.props;

    const { votingPercents } = this.state;
    const { positive, negative, totalTokens } = votingPercents;

    let positive_percent = positive == "0" ? 0 : (positive / totalTokens) * 100
    let negative_percent = negative == "0" ? 0 : (negative / totalTokens) * 100
    let abstained_percent = totalTokens == "0" ? 0 : ((totalTokens - (positive + negative)) / totalTokens) * 100

    let questionId = data.id;
    let groupId = contractModel.questions[questionId - 1].groupId;

    let groupName = contractModel.userGroups[groupId - 1].name;
    let groupType = contractModel.userGroups[groupId - 1].groupType;
    return (
      <div className={styles['voting-group']}>
        <div className={styles['voting-group__heading']}>
          <h2>{groupName}</h2>
          <span>{groupType}</span>
        </div>
        <div className={styles['voting-group__results']}>
          <label className={`${styles['voting-group__results-bar']} `}>
            <span className={styles['voting-bar__label']}>За</span>
            <span className={styles['voting-bar__percent']}> {positive_percent} %</span>
            <p className={`${styles['voting-bar']} ${styles['voting-bar--positive']} `}>
              <span style={{ 'width': positive_percent + '%' }}></span>
            </p>
          </label>
          <label className={`${styles['voting-group__results-bar']}`}>
            <span className={styles['voting-bar__label']}>Против</span>
            <span className={styles['voting-bar__percent']}> {negative_percent} %</span>
            <p className={`${styles['voting-bar']} ${styles['voting-bar--negative']} `}>
              <span style={{ 'width': negative_percent + '%' }}></span>
            </p>
          </label>
          <label className={`${styles['voting-group__results-bar']}`}>
            <span className={styles['voting-bar__label']}>Не голосовало</span>
            <span className={styles['voting-bar__percent']}> {abstained_percent} %</span>
            <p className={`${styles['voting-bar']} ${styles['voting-bar--abstained']} `}>
              <span style={{ 'width': abstained_percent + '%' }}></span>
            </p>
          </label>
        </div>
      </div>
    )
  }

  getVotingsButtons(votingParams) {
    const { userVote } = this.state
    const isVoted = (userVote != 0 && userVote != null);
    return (
      <div className={styles['voting-expanded__split-start']}>
        <label className={`${userVote == 2 ? 'hidden' : ''}`}>
          <span> {`${userVote == 1 ? 'Вы проголосовали' : ''}`} ЗА </span>
          <button className={`btn btn--positive`} onClick={isVoted ? '' : this.prepareToVote.bind(this, true, votingParams)}>
            <img src={positive}></img>
          </button>
        </label>
        <label className={`${userVote == 1 ? 'hidden' : ''}`}>
          <span>{`${userVote == 2 ? 'Вы проголосовали' : ''}`} ПРОТИВ </span>
          <button className={`btn btn--red`} onClick={isVoted ? '' : this.prepareToVote.bind(this, false, votingParams)}>
            <img src={negative}></img>
          </button>
        </label>
      </div>
    )
  }

  toggleGraphs() {
    this.setState({
      graphics: !this.state.graphics
    })
  }

  getHideGroupsBtn() {
    return (
      <div style={{ 'textAlign': 'center', 'padding': '20px' }}>
        <span className={`${styles['label']}`} onClick={this.toggleGraphs.bind(this)}>скрыть группы</span>
      </div>
    )
  }

  render() {
    const { data, index, contractModel } = this.props;
    const { questions, alertVisible, alertText } = contractModel;
    const { timeStart, timeEnd, graphics } = this.state;
    const { remaining, percent } = this.state;
    const vars = {
      int: 'Число',
      string: 'Строка',
      address: 'Адрес',
    }

    if (percent > 100) {
      this.setState({
        percent: 100,
        status: data.status
      })
    }

    let votingParams = this.getQuestionData();
    let formula = this.getFormula();
    let rightPanel = (remaining > 0 || data.status == 0) ? this.getFlow() : this.getDescision();

    let votingParameters = votingParams.map((param, index) => {
      let value;
      if ((index == votingParams.length - 1) && (typeof (param[1]) == 'object')) {
        value = param[1].map((subParam, index) => {
          if (index % 2 == 0) return (
            <p key={index}>
              <span>{web3.utils.hexToUtf8(subParam)}</span>
              <span> - </span>
              <span>{web3.utils.hexToUtf8(param[1][index + 1])}</span>
            </p>
          )

        })
      } else if ((index == votingParams.length - 2) && (typeof (param[1]) == 'object')) {
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
      <div className={styles.voting + ' ' + `${this.state.expanded ? "opened" : ''}`} >
        <div className={styles['voting-about']}  >
          <div className={styles['voting-about__info']} onClick={this.toggleExpand.bind(this)} >
            <span className={styles['voting-id']}>{data.votingId}</span>
            <h1 className={styles['voting-caption']} >{data.caption}</h1>
            <p className={styles['voting-text']}>{data.text}</p>
            <p className={styles['voting-duration']}>Начало {timeStart}</p>
            <p className={styles['voting-duration']}>Конец {timeEnd}</p>
          </div>
          <div className={styles['voting-about__flow']}>
            {rightPanel}
          </div>
        </div>
        <div className={styles['voting-expanded']}>
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
            <p className={styles['voting-expanded__formula-formula']}>{formula}</p>
          </div>
          <div className={`${styles['voting-expanded__votes']}`}>
            <div className={`${styles['voting-expanded__votes--placeholder']} ${!graphics ? '' : 'hidden'}`}>
              <p>
                <span>Большинство голосов<br /> на данный момент</span>
                <span>
                  {
                    this.state.preDescision
                  }
                </span>
              </p>
              <span className={`${styles['label']}`} onClick={this.toggleGraphs.bind(this)}>Показать графики</span>
            </div>
            {graphics ? percents : ''}
            {graphics ? hideBtn : ''}
          </div>
        </div>
      </div>
    );
  }
}

export default Voting;