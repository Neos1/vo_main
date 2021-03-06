import { observable, action, computed, runInAction } from "mobx";
import { Redirect } from "react-router";

class ContractModel {
  @observable contract;
  @observable questions = [];
  @observable hints = [];
  @observable votings = [];
  @observable userGroups = [];
  @observable questionGroups = [];
  @observable balances = {}

  @observable bufferQuestions = [];
  @observable bufferVotings = [];

  @observable votingTemplate = {
    step: 1,
    prepared: false,
    questionId: 0,
    params: [],
    data: []
  };

  @observable userVote = {
    prepared: false,
    voted: false,
    status: 0,

    questionId: "",
    descision: "",
    parameters: []
  };

  @observable balances = {

  }

  @action setVotingStep(num) {
    this.votingTemplate.step = num;
  }

  @action getUserVote(prepared, questionId, descision, parameters) {
    this.userVote = {
      prepared,
      questionId,
      descision,
      parameters,
      status: 0
    };
  }

  @action setContract(contract) {
    this.contract = window.contract = contract;
    console.info(contract);
  }

  //* questions
  @action async getQuestions() {
    let questions;
    let deployedQuestions =
      window.__ENV == "development"
        ? JSON.parse(
          fs.readFileSync(
            path.join(
              window.process.env.INIT_CWD,
              "./contracts/sysQuestions.json"
            ),
            "utf8"
          )
        )
        : JSON.parse(
          fs.readFileSync(
            path.join(
              window.process.env.PORTABLE_EXECUTABLE_DIR,
              "./contracts/sysQuestions.json"
            ),
            "utf8"
          )
        );

    if (localStorage.getItem(`questions[${this.contract._address}]`)) {
      questions = JSON.parse(
        localStorage.getItem(`questions[${this.contract._address}]`)
      );
    }
    if (localStorage.getItem(`hints[${this.contract._address}]`)) {
      this.hints = JSON.parse(
        localStorage.getItem(`hints[${this.contract._address}]`)
      );
    }

    let i = this.questions.length ? this.questions.length + 1 : 1;
    let address = web3.eth.accounts.wallet[0].address;

    let length = await this.contract.methods.getCount().call({
      from: address
    });

    for (i; i <= length - 1; i++) {
      let question = await this.contract.methods.question(i).call({
        from: address
      });
      console.log(i, deployedQuestions.hasOwnProperty(i))
      if (deployedQuestions.hasOwnProperty(i)) {
        this.hints[i - 1] = deployedQuestions[i].hints;
      }
      this.questions.push(question);
    }
    this.bufferQuestions = this.questions;
    localStorage.setItem(
      `questions[${this.contract._address}]`,
      JSON.stringify(this.questions)
    );
    localStorage.setItem(
      `hints[${this.contract._address}]`,
      JSON.stringify(this.hints)
    );
    return this.bufferQuestions;
  }
  @action filterQuestions(filters) {
    const { page, type } = filters;
    this.filterQuestionsByPage(page);
    this.filterQuestionsByType(type);
  }

  @action filterQuestionsByPage(page) {
    if (page != null) {
      let start = Number(page) * 10;
      let end = start + 9;
      this.bufferQuestions = this.questions.filter((question, index) => {
        return index >= start && index <= end;
      });
    } else {
      return false;
    }
  }
  @action filterQuestionsByType(type) {
    this.bufferQuestions = this.bufferQuestions.filter(question => {
      console.log(question.groupId == Number(type) + 1);
      return question.groupId == Number(type) + 1;
    });
  }

  //* questions end

  //* votings
  @action async getVotings(type) {
    let votings;

    if (localStorage.getItem(`votings[${this.contract._address}]`)) {
      votings = JSON.parse(
        localStorage.getItem(`votings[${this.contract._address}]`)
      );
      this.votings = votings;
    }

    let i = this.votings.length !== 0 ? this.votings.length + 1 : 1;
    let address = web3.eth.accounts.wallet[0].address;

    let length = await this.contract.methods.getVotingsCount().call({
      from: address
    });
    for (i; i <= length - 1; i++) {
      let voting = await this.contract.methods.voting(i).call({
        from: address
      });
      let userVote = await this.contract.methods.getUserVote(i).call({
        from: address
      });
      voting['userVote'] = userVote;

      this.votings.push(voting);
      this.votings[i - 1].userVote = userVote;
    }
    this.votings.map((voting, index) => {
      voting.votingId = index + 1;
    });
    this.bufferVotings =
      this.votings.length == length - 1
        ? this.votings.slice().sort((a, b) => (a.votingId < b.votingId ? 1 : -1))
        : "";

    localStorage.setItem(
      `votings[${this.contract._address}]`,
      JSON.stringify(this.votings)
    );
    return this.bufferVotings;
  }

  @action filterVotings(filters) {
    const { questionId, page, from, to } = filters;
    this.filterByQuestion(questionId);
    this.filterByPage(page);
    this.filterByDate(from, to);
  }

  @action filterByQuestion(questionId) {
    this.bufferVotings =
      questionId !== 0
        ? this.votings.filter(voting => {
          return voting[0] == questionId;
        })
        : this.votings.slice().sort((a, b) => (a.votingId < b.votingId ? 1 : -1));
  }
  @action filterByPage(page) {
    if (page != null) {
      let start = Number(page) * 10;
      let end = start + 9;
      this.bufferVotings = this.bufferVotings.filter((voting, index) => {
        return index >= start && index <= end;
      });
    } else {
      return false;
    }
  }

  @action async filterByDate(from, to) {
    this.bufferVotings = this.bufferVotings.filter(voting => {
      let dateStart = null;
      let dateEnd = null;
      let filterStart = null;
      let filterEnd = null;

      if (from != undefined) {
        dateStart = new Date();
        dateStart.setTime(Number(voting.startTime) * 1000);
        filterStart = new Date(from);
      }

      if (to != undefined) {
        filterEnd = new Date(to);
      }

      return dateStart >= filterStart && dateStart <= filterEnd;
    });
  }

  //* votings end

  //* users groups

  @action async getUserGroups() {
    const { contract } = this;
    const { _address: contractAddress } = contract;
    let savedUserGroups;

    if (localStorage.getItem(`userGroups[${contractAddress}]`)) {
      this.userGroups = JSON.parse(
        localStorage.getItem(`userGroups[${contractAddress}]`)
      );
    }

    let i = this.userGroups.length != 0 ? this.userGroups.length + 1 : 1;
    let userAddress = web3.eth.accounts.wallet[0].address;

    let groupsLength = await contract.methods.getUserGroupsLength().call({
      from: userAddress
    });

    for (i; i <= groupsLength - 1; i++) {
      let group = await contract.methods.getUserGroup(i).call({
        from: userAddress
      });
      this.userGroups.push(group);
    }

    this.userGroups.map(group => {
      this.getBalances(group.groupType, group.groupAddress)
    })

    localStorage.setItem(
      `userGroups[${contractAddress}]`,
      JSON.stringify(this.userGroups)
    );
  }
  //* users groups end

  //* question groups
  @action async getQuestionGroups() {
    const { contract, questionGroups } = this;
    const { _address: contractAddress } = contract;
    let savesQuestionGroups;

    if (localStorage.getItem(`questionGroups[${contractAddress}]`)) {
      savesQuestionGroups = localStorage.getItem(
        `questionGroups[${contractAddress}]`
      );
      this.userGroups = savesQuestionGroups;
    }

    let i = questionGroups.length != 0 ? questionGroups.length + 1 : 1;
    let userAddress = web3.eth.accounts.wallet[0].address;

    let groupsLength = await contract.methods.getQuestionGroupsLength().call({
      from: userAddress
    });

    for (i; i <= groupsLength - 1; i++) {
      let group = await contract.methods.getQuestionGroup(i).call({
        from: userAddress
      });
      questionGroups.push(group);
    }
    localStorage.setItem(
      `questionGroups[${contractAddress}]`,
      JSON.stringify(questionGroups)
    );
  }
  //* question groups end

  //* options with questions for selects
  @computed get options() {
    let options = [
      {
        value: null,
        label: "Все вопросы"
      }
    ];
    this.questions.map((item, index) =>
      options.push({
        value: index + 1,
        label: `${index + 1} ${item.caption}`
      })
    );
    return options;
  }
  @computed get optionsForVoting() {
    return this.questions.map((item, index) => ({
      value: index + 1,
      label: `${index + 1} ${item.caption}`
    }));
  }
  //* options with questions for selects end

  //* options with pages of votings
  @computed get votingsPages() {
    let options = [
      {
        value: null,
        label: "Все"
      }
    ];
    let length = this.votings.length;
    if (length / 10 < 1) {
      let option = {
        value: 0,
        label: `1-${length}`
      };
      options.push(option);
    } else {
      let count = Math.ceil(length / 10);
      for (let i = 0; i < count; i++) {
        let option = {
          value: i,
          label: `${i * 10 + 1}-${i * 10 + 10}`
        };
        options.push(option);
      }
    }

    return options;
  }
  //* options with pages of questions
  @computed get questionsPages() {
    let options = [
      {
        value: null,
        label: "Все вопросы"
      }
    ];
    let length = this.questions.length;
    if (length / 10 < 1) {
      let option = {
        value: 0,
        label: `1-${length}`
      };
      options.push(option);
    } else {
      let count = Math.ceil(length / 10);
      for (let i = 0; i < count; i++) {
        let option = {
          value: i,
          label: `${i * 10 + 1}-${i * 10 + 10}`
        };
        options.push(option);
      }
    }
    return options;
  }

  @computed get groupsOfQuestions() {
    let options = [
      {
        value: null,
        label: "Все вопросы"
      }
    ];

    this.questionGroups.map((group, index) => {
      options.push({
        value: index + 1,
        label: `${index + 1} ${group.name}`
      });
    });

    return options;
  }

  @action prepareVoting(id) {
    const { questions } = this;
    let parameters = questions[id - 1]._parameters;
    let params = [];

    for (let i = 0; i < parameters.length; i += 2) {
      let param = [
        web3.utils.hexToUtf8(parameters[i]),
        web3.utils.hexToUtf8(parameters[i + 1])
      ];
      params.push(param);
    }

    this.votingTemplate = {
      step: 1,
      questionId: id,
      params: params,
      data: []
    };
  }
  @action switchFromVoteToStatus() {
    this.userVote.prepared = false;
    this.userVote.voted = true;
  }

  @action async sendVote() {
    const { userGroups, contract } = this;
    let voteId = this.votings.length;
    let descision = this.userVote.descision == true ? 1 : 2;
    let address = web3.eth.accounts.wallet[0].address;

    let userVote = await this.contract.methods.getUserVote(voteId).call({
      from: address
    });

    if (userVote == '0') {
      let privateKey = web3.eth.accounts.wallet[0].privateKey;
      this.userVote.status = 3;

      const ercABI =
        window.__ENV === "development"
          ? JSON.parse(
            fs.readFileSync(
              path.join(window.process.env.INIT_CWD, "/contracts/ERC20.abi"),
              "utf8"
            )
          )
          : JSON.parse(
            fs.readFileSync(
              path.join(
                window.process.env.PORTABLE_EXECUTABLE_DIR,
                "contracts/ERC20.abi"
              ),
              "utf8"
            )
          );
      let index = await this.contract.methods.findUserGroup(address).call({
        from: address
      });

      if (index != 0) {
        const { groupAddress, groupType } = userGroups[index - 1];

        let userContract = new web3.eth.Contract(ercABI, groupAddress);
        let userBalance = await userContract.methods
          .balanceOf(address)
          .call({ from: address });
        if (userBalance > 0) {
          if (groupType == "ERC20") {
            await userContract.methods
              .approve(contract._address, userBalance)
              .send({ from: address, gas: 1000000, gasPrice: window.gasPrice });
          }

          console.log(this.contract._address)
          this.contract.methods
            .sendVote(descision)
            .send({
              from: address,
              gas: web3.utils.toHex(8000000),
              gasPrice: web3.utils.toHex(window.gasPrice)
            })
            .on("error", error => {
              this.userVote.status = 2;
              console.log(error);
            })
            .on("transactionHash", txHash => {
              console.log(txHash);
            })
            .on("receipt", receipt => {
              this.userVote.status = 1;
              this.refreshLastVoting();
            });
        } else {
          this.showAlert("У вас нет токенов, доступных для голосования")
        }
      } else {
        this.userVote.status = 0;
        this.showAlert("Не можем найти вашу группу. Либо ваш баланс токенов равен нулю, либо вас нет ни в одной группе пользователей")
      }
    } else {
      this.showAlert(`Вы уже проголосовали ${userVote == 1 ? "За" : "Против"}`)
    }

  }

  @action async refreshLastVoting() {
    const { contract } = this;
    const address = web3.eth.accounts.wallet[0].address;
    let votingsCount = await contract.methods.getVotingsCount().call({
      from: address
    });
    let index = votingsCount - 1;
    let voting = await contract.methods.voting(index).call({
      from: address
    });
    voting.votingId = index;
    this.votings[index - 1] = voting;
    this.bufferVotings = this.votings
      .slice()
      .sort((a, b) => (a.votingId < b.votingId ? 1 : -1));
    localStorage.setItem(
      `votings[${contract._address}]`,
      JSON.stringify(this.votings)
    );
  }


  @observable alertVisible = false;
  @observable alertText = ''

  @action showAlert(text) {
    this.alertVisible = true;
    this.alertText = text;

    setTimeout(() => {
      this.alertVisible = false;
    }, 3000);
  }


  @action async getBalances(type, address) {

    const userAddress = web3.eth.accounts.wallet[0].address;

    const folder = window.__ENV == 'development'
      ? path.join(window.process.env.INIT_CWD, '/contracts/')
      : path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/')

    const abi = type == 'ERC20'
      ? JSON.parse(fs.readFileSync(path.join(folder, 'ERC20.abi'), 'utf8'))
      : JSON.parse(fs.readFileSync(path.join(folder, 'MERC20.abi'), 'utf8'))

    const testContract = await new web3.eth.Contract(abi, address);


    type == "ERC20"
      ? await this.getERCBalance(testContract, userAddress)
      : await this.getCustomBalances(testContract, userAddress)

    return this.balances[address].balances;
  }


  @action getERCBalance = async (testContract, userAddress) => {
    //const sybmol = await testContract.methods.sybmol().call({ from: userAddress })
    const contractAddr = testContract._address
    this.balances[contractAddr] = {}
    this.balances[contractAddr].balances = {}
    const userBalance = await testContract.methods.balanceOf(userAddress).call({ from: userAddress })
    this.balances[contractAddr].balances[userAddress] = userBalance
  }


  @action getCustomBalances = async (testContract, userAddress) => {
    //const sybmol = await testContract.methods.sybmol().call({ from: userAddress })
    const contractAddr = testContract._address
    const users = await testContract.methods.getUsers().call({ from: userAddress });
    this.balances[contractAddr] = {}
    this.balances[contractAddr].balances = {}
    await users.map(async user => {
      await testContract.methods.balanceOf(user).call({ from: userAddress }).then(balance => {
        this.balances[contractAddr].balances[user] = balance
      })
    })
  }

  @action updateBalance = async (type, group, userAddress) => {

    const folder = window.__ENV == 'development'
      ? path.join(window.process.env.INIT_CWD, '/contracts/')
      : path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/')

    const abi = type == 'ERC20'
      ? JSON.parse(fs.readFileSync(path.join(folder, 'ERC20.abi'), 'utf8'))
      : JSON.parse(fs.readFileSync(path.join(folder, 'MERC20.abi'), 'utf8'))

    const testContract = await new web3.eth.Contract(abi, group);

    const balance = await testContract.methods.balanceOf(userAddress).call({ from: userAddress })

    this.balances[group].balances[userAddress] = balance;
  }
}

const contractModel = (window.contractModel = new ContractModel());

export default contractModel;
