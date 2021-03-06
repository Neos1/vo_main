import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { observable } from "mobx";
import Select from "react-select";
import CustomSelect from "../../common/Select";
import moment from "moment";
import close from "../../../img/modal-close.svg";

import DayPickerInput from "react-day-picker/DayPickerInput";
import { formatDate, parseDate } from "react-day-picker/moment";
import "react-day-picker/lib/style.css";

import "../../../styles/ballot/basic.scss";
import styles from "./style.scss";
import Question from "../Question/Question";
import { SimpleInput } from "../Input";
import Voting from "../Voting";
import StartVotingmodal from "../Modals/StartVoting";
import SetVoteModal from "../Modals/SetVoteModal";
import AlertModal from "../Modals/AlertModal";
import contractModel from "../../../models/ContractModel";
import Loader from "../../common/Loader";

import VotingActive from "../../../img/voting_active.svg";
import addIcon from "../../../img/add_icon.svg";
import Hint from "../../common/Hint";
import Alert from "../../common/Alert";

@inject("accountStore", "contractModel")
@observer
class Votings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      expanded: true,
      selectedType: "",
      selectedRange: "",
      selected: 0,
      questionId: 0,
      invalidFormula: false,
      id: null,
      from: undefined,
      to: undefined,
      descision: false,
      startVoting: false,
      additionalInputs: [],
      hints: [],
      option: null
    };
  }

  @observable values = [{
    value: 'null',
    label: 'Выберите'
  }, {
    value: 'int',
    label: 'Число'
  },
  {
    value: 'string',
    label: 'Текст'
  },
  {
    value: 'address',
    label: 'Адрес'
  }, {
    value: 'bytes4',
    label: 'Строка (4 байта)'
  }]

  async componentWillMount() {
    const { contractModel } = await this.props;
    const { votingTemplate, hints: Hints } = contractModel;
    const { step } = votingTemplate;
    const { questionId } = votingTemplate;
    window.options = this.options;

    await this.setState({
      selected: questionId - 1,
      hints: questionId - 1 >= 0 ? Hints[questionId] : []
    });
    await this.getData();
  }

  async getData() {
    const { contractModel } = this.props;
    const { step } = contractModel.votingTemplate;

    await this.setState({
      loading: true
    });
    await contractModel.getUserGroups();
    await contractModel.getQuestions();
    await contractModel.getVotings();

    this.setState({
      loading: false
    });
    if ((step == 1) || (step == 5)) {
      console.log('true')
      if (contractModel.bufferVotings[0].status == 0) {
        contractModel.setVotingStep(5)
      } else {
        contractModel.setVotingStep(1)
      }
    }
  }

  showAlert(text) {
    const { contractModel } = this.props;
    contractModel.showAlert(text);
  }

  removeError(e) {
    e.target.classList.remove("field__input--error");
  }
  getLoader(type) {
    const { contractModel } = this.props;
    const { step } = contractModel.votingTemplate;
    return (
      <div>
        <Loader />
        <p id="loader-text">
          {(type == 'left' && this.state.loading) ? 'Проверка статуса' : ''}
          {type == 'right'
            ? ''
            : step == 2
              ? "Отправка транзакции"
              : step == 3
                ? "Получение хэша"
                : step == 4
                  ? "Ожидание чека"
                  : ""}
        </p>
      </div>
    );
  }

  addInput() {
    const { additionalInputs, } = this.state;
    const getInputBlock = () => {
      let idx = additionalInputs.length;
      return (
        <div>
          <SimpleInput />
          <div className='select-wrapper'>
            <CustomSelect />
          </div>
          <span onClick={this.removeEl.bind(this, idx)}>
            {" "}
            <img src={close} />{" "}
          </span>
        </div>
      );
    };
    let input = getInputBlock();

    this.setState({
      additionalInputs: [...additionalInputs, input]
    });
  }

  async removeEl(index) {
    const { additionalInputs } = this.state;
    let inputs = additionalInputs;

    inputs.splice(index, 1);
    await this.setState({
      additionalInputs: inputs
    });
  }
  getPreparingPanel() {
    const { contractModel } = this.props;
    const { startVoting, selected } = this.state;
    const { votingTemplate, hints } = contractModel;

    let types = {
      int: "Число",
      uint: "Число",
      string: "Текст",
      address: "Адрес",
      bytes4: "Байтовая строка (0х + 8 символов)"
    };

    let inputs = contractModel.votingTemplate.params.map((param, index) => {
      let returnField = () => {
        return (
          <p key={index}>
            <span>{param[0]}</span>
            {hints.hasOwnProperty(selected) ? <Hint data={hints[selected][index]} /> : ""}
            <SimpleInput
              type="text"
              placeholder={types[param[1]]}
              onChange={this.removeError.bind(this)}
              required
              name={param[1]}
            />
          </p>
        );
      };

      let returnParams = () => {
        return (
          <div className="votings-additionals">
            <h2>Параметры вопроса</h2>
            {this.state.additionalInputs.map(input => input)}
            <div className="votings-additionals__add">
              <button
                type="button"
                className="btn btn--blue"
                onClick={this.addInput.bind(this)}
                style={{ 'width': '80px', "padding": '10px' }}
              >
                <img src={addIcon} />
              </button>
              <span>Добавить параметр</span>
            </div>
          </div>
        );
      };

      let input = param[0] == "parameters" ? returnParams() : returnField();

      return input;
    });
    let returnContent = () => {
      return (
        <div className={styles["section-parameters__content"]}>
          <div>
            <h1 className={styles["section-parameters__content-heading"]}>
              Начать голосование
          </h1>
            <p className={styles["section-parameters__content-subheading"]}>
              Административные токены
          </p>
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

          <div className={styles["section-parameters__buttons"]}>
            <form name="votingData" onSubmit={this.toggleSubmit.bind(this)}>
              {inputs}
              <button
                className="btn btn--blue"
                disabled={votingTemplate.prepared}
              >
                НАЧАТЬ ГОЛОСОВАНИЕ
            </button>
            </form>
          </div>
        </div>
      )
    }

    let content = this.state.loading ? this.getLoader('left') : returnContent()

    return (
      <div>
        {content}
      </div>
    );
  }
  getActiveVotingPanel() {
    return (
      <div>
        <div className={styles["section-parameters__active"]}>
          <img src={VotingActive} />
          <h1>Голосование запущено</h1>
          <p>
            Вы сможете начать новое голосование, после того как завершится
            активное
          </p>
        </div>
      </div>
    );
  }

  selectType(selected) {
    this.setState({ selectedType: selected.value });
  }

  selectRange(selected) {
    this.setState({ selectedRange: selected.value });
  }

  handleSelect(selected) {
    const { contractModel } = this.props;
    contractModel.prepareVoting(Number(selected.value));
    this.setState({
      selected: selected.value - 1,
      hints: contractModel.hints[selected.value - 1],
      invalidFormula: false
    });
  }

  prepareFormula(formula) {
    const FORMULA_REGEXP = new RegExp(
      /(group)|((?:[a-zA-Z0-9]{1,}))|((quorum|positive))|(>=|<=)|([0-9%]{1,})|(quorum|all)/g
    );
    let matched = formula.match(FORMULA_REGEXP);

    let convertedFormula = [];

    matched[0] == "group" ? convertedFormula.push(0) : convertedFormula.push(1);
    matched[1] == "Owners"
      ? convertedFormula.push(1)
      : convertedFormula.push(this.findUserGroup(matched[1]))
    matched[3] == "quorum"
      ? convertedFormula.push(0)
      : convertedFormula.push(1);
    matched[4] == "<=" ? convertedFormula.push(0) : convertedFormula.push(1);
    convertedFormula.push(Number(matched[5]));

    if (matched.length == 9) {
      matched[8] == "quorum"
        ? convertedFormula.push(0)
        : convertedFormula.push(1);
    }
    console.log(convertedFormula)

    if (convertedFormula[1] == null) {
      this.setState({ invalidFormula: true })
    } else {
      this.setState({ invalidFormula: false })
    }
    return convertedFormula;
  }
  findUserGroup(name) {
    const { contractModel } = this.props;
    const { contract } = contractModel
    const userGroups = JSON.parse(localStorage.getItem(`userGroups[${contract._address}]`));
    console.log(name)
    let groupId = userGroups.map((group, index) => {
      let id;
      if (group.name == name) {
        id = index + 1;
      }
      return id;
    }).filter(e => e)
    console.log(groupId.length);
    return groupId.length > 0 ? groupId[0] : null;
  }

  async createVotingData(target) {

    const { questions, votingTemplate } = contractModel;
    const { selected } = this.state;

    votingTemplate.prepared = !votingTemplate.prepared;
    contractModel.setVotingStep(2)

    let mainInputs = target.querySelectorAll(
      'form[name="votingData"] > p input'
    );
    let additionalInputs = target.querySelectorAll(
      ".votings-additionals .field input"
    );
    let additionalSelects = target.querySelectorAll(
      ".votings-additionals .select input"
    );

    let methodSelector = questions[selected].methodSelector;
    let questionParameters = questions[selected]._parameters;

    let values = [];

    hexString += questions[selected].methodSelector;

    let parametersTypes = questionParameters.map((param, index) => {
      let type = "";
      if (index % 2 != 0) {
        type = web3.utils.hexToUtf8(param);
      }
      return type != "" ? type : "";
    });
    parametersTypes = parametersTypes.filter(e => e);

    if (selected == 0) {
      parametersTypes = [
        "uint[]",
        "uint8",
        "string",
        "string",
        "address",
        "bytes4",
        "uint[]",
        "bytes32[]"
      ];
      let id = await contract.methods
        .getCount()
        .call({ from: web3.eth.accounts.wallet[0].address });
      let groupId = mainInputs[0].value;
      let time = mainInputs[3].value;
      let name = mainInputs[1].value;
      let text = mainInputs[2].value;
      let method = mainInputs[4].value;
      let formula = this.prepareFormula(mainInputs[5].value);
      values.push(
        [Number(id), Number(groupId), Number(time)],
        0,
        name,
        text,
        contract._address,
        method,
        formula
      );
      values.push([]);

      for (let i = 0; i < additionalInputs.length; i++) {
        let arrLen = values.length;
        values[arrLen - 1].push(
          web3.utils.utf8ToHex(additionalInputs[i].value),
          web3.utils.utf8ToHex(additionalSelects[i].value)
        );
      }
    } else {
      mainInputs.forEach(input => {
        values.push(input.value);
      });
    }

    console.log(mainInputs);

    let hexString
    if (!this.state.invalidFormula) {
      console.log(parametersTypes, values)
      hexString = web3.eth.abi.encodeParameters(parametersTypes, values);
    } else {
      hexString = '0x';
    }

    hexString = hexString.replace("0x", methodSelector);
    return hexString;
  }

  async startVoting(e) {
    e.preventDefault();
    const { contractModel } = this.props;
    const { contract, votingTemplate } = contractModel;
    const { questionId } = votingTemplate;

    let privateKey = web3.eth.accounts.wallet[0].privateKey;
    let votingData = await this.createVotingData(document.forms.votingData);

    console.log(this.state.invalidFormula)
    if (!this.state.invalidFormula) {
      let data = contract.methods
        .startNewVoting(questionId, 0, 0, votingData)
        .encodeABI();
      let options = {
        data,
        to: contract._address,
        gasPrice: web3.utils.toHex(window.gasPrice),
        gasLimit: web3.utils.toHex(8000000),
        value: "0x0"
      };

      web3.eth.accounts.signTransaction(options, privateKey).then(data => {
        web3.eth
          .sendSignedTransaction(data.rawTransaction)
          .on("error", err => {
            console.log(err);
          })
          .on("transactionHash", txHash => {
            this.txHash = txHash;
            console.log(txHash);
            contractModel.setVotingStep(4)
          })
          .on("receipt", data => {
            this.setState({
              startVoting: false,
            });
            contractModel.setVotingStep(5)
            contractModel.getVotings();
          });
      });
    } else {
      contractModel.setVotingStep(1);
      this.showAlert.bind(this, 'Такой группы пользователей нет, проверьте еще раз')
    }

  }

  async selectQuestionId(selected) {
    await this.setState({
      questionId: Number(selected.value)
    });
    this.filterVotings();
  }
  async selectIdFromTo(selected) {
    await this.setState({
      id: selected.value
    });
    this.filterVotings(selected.value);
  }
  async handleFromChange(from) {
    // Change the from date and focus the "to" input field
    await this.setState({ from });
    this.filterVotings();
  }
  async handleToChange(to) {
    await this.setState({ to });
    this.filterVotings();
  }

  filterVotings() {
    const { contractModel } = this.props;
    let params = {
      questionId: this.state.questionId,
      page: this.state.id,
      from: this.state.from,
      to: this.state.to
    };
    contractModel.filterVotings(params);
  }
  validateInputs(target) {
    let inputs = target.querySelectorAll("input");
    let valids = [];
    inputs.forEach((input, index) => {
      let name = input.getAttribute("name");
      let valid = false;
      switch (name) {
        case "int":
          valid = Boolean(Number(input.value));
          break;
        case "uint":
          valid = Boolean(Number(input.value));
          break;
        case "string":
          valid = Boolean(String(input.value));
          break;
        case "address":
          valid = Boolean(
            input.value.match(new RegExp(/(0x)+([0-9 a-f A-F]){40}/g))
          );
          break;
        case "bytes4":
          valid = Boolean(
            input.value.length == 10 && input.value.match(new RegExp(/(0x)+([0-9 a-f A-F]){8}/g))
          );
          break;
        default:
          valid = true;
          break;
      }
      if (valid == false) {
        input.classList.add("field__input--error");
      }
      valids.push(valid);
    });
    return [...new Set(valids)];
  }

  toggleSubmit(e) {
    e.preventDefault();
    const { contractModel } = this.props;
    const { votingTemplate } = contractModel;

    let valids = this.validateInputs(document.forms.votingData);

    if (valids.length == 2) {
      if (valids[0] == false || valids[1] == false) {
        return false;
      } else {
        votingTemplate.prepared = !votingTemplate.prepared;
        this.setState({
          startVoting: !this.state.startVoting
        });
      }
    } else {
      if (valids[0] == false) {
        return false;
      } else {
        votingTemplate.prepared = !votingTemplate.prepared;
        this.setState({
          startVoting: !this.state.startVoting
        });
      }
    }
  }

  setVotingStep(num) {
    contractModel.setVotingStep(num)
  }

  hideModal() {
    const { contractModel } = this.props;
    const { votingTemplate } = contractModel;
    votingTemplate.prepared = false;
  }

  render() {
    const { contractModel } = this.props;
    const { from, to, startVoting } = this.state;
    const { bufferVotings, votingTemplate, userVote, alertVisible, alertText } = contractModel;
    const { step } = votingTemplate;
    const modifiers = { start: from, end: to };

    let renderVotings = bufferVotings.map((voting, index) => (
      <Voting key={voting.votingId} data={voting} index={index + 1} setStep={this.setVotingStep.bind(this)} />
    ));
    let loaderRight = this.getLoader('right');
    let rightPanel =
      step == 1
        ? this.getPreparingPanel()
        : step == 5
          ? this.getActiveVotingPanel()
          : this.getLoader();

    return (
      <div className={styles.wrapper}>
        <section
          className={`${styles.section} ${styles["section-parameters"]}`}
        >
          {rightPanel}
        </section>

        <section className={`${styles.section} ${styles["section-votings"]}`}>
          <div className={styles["section-votings__filters"]}>
            <label
              className={`${styles["section-votings__filters-numbers"]} 
                               ${
                styles[
                "section-votings__filters-numbers--questions"
                ]
                }`}
            >
              <span> Вопрос </span>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                placeholder={"Выберите вопрос"}
                value={this.state.questionId}
                onChange={this.selectQuestionId.bind(this)}
                options={contractModel.options}
              />
            </label>

            <label
              className={`${styles["section-votings__filters-numbers"]} 
                               ${
                styles["section-votings__filters-numbers--id"]
                }`}
            >
              <span> Номера </span>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                value={0}
                placeholder={"Номер"}
                value={this.state.id}
                onChange={this.selectIdFromTo.bind(this)}
                options={contractModel.votingsPages}
              />
            </label>
            <label
              className={`${styles["section-votings__filters-numbers"]} 
                               ${
                styles[
                "section-votings__filters-numbers--date"
                ]
                }`}
            >
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
                    onDayClick: () => this.to.getInput().focus()
                  }}
                  onDayChange={this.handleFromChange.bind(this)}
                />{" "}
                —{" "}
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
                      numberOfMonths: 2
                    }}
                    onDayChange={this.handleToChange.bind(this)}
                  />
                </span>
              </div>
            </label>
          </div>

          {this.state.loading ? loaderRight : renderVotings}
        </section>
        <SetVoteModal descision={this.state.descision} />
        <StartVotingmodal
          visible={votingTemplate.prepared}
          submit={this.startVoting.bind(this)}
          closeWindow={this.hideModal.bind(this)}
        />
        <Alert visible={alertVisible} text={alertText} />
        <AlertModal />
      </div>
    );
  }
}

export default Votings;
