import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { observable } from "mobx";
import Select from "react-select";

import "../../../styles/ballot/basic.scss";
import styles from "./style.scss";
import lists from "../../../img/lists.png";
import groupIcon from "../../../img/addGroup_icon.svg";
import questionIcon from "../../../img/addQuestion_icon.svg";
import Question from "../Question/Question";
import { Redirect } from "react-router";
import Loader from "../../common/Loader";

@inject("accountStore", "contractModel")
@observer
class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      redirect: false,
      selectedType: "",
      selectedRange: "",
      page: 0
    };
  }

  @observable questions = [];

  componentWillMount() {
    this.getData();
  }

  async getData() {
    this.setState({
      loading: true
    });

    const { contractModel, accountStore } = this.props;
    const { address } = accountStore;
    const { contract } = contractModel;

    await contractModel.getQuestions("system");
    await contractModel.getQuestionGroups();

    this.setState({
      loading: false
    });
  }

  getLoader() {
    return <Loader />;
  }

  async selectType(selected) {
    await this.setState({ selectedType: selected.value });
    this.filterQuestions();
  }
  async selectRange(selected) {
    await this.setState({ page: selected.value });
    this.filterQuestions();
  }

  filterQuestions() {
    let filters = {
      type: this.state.selectedType,
      page: this.state.page
    };
    const { contractModel } = this.props;
    contractModel.filterQuestions(filters);
  }
  preparePrimaryVotings(id) {
    const { contractModel } = this.props;
    contractModel.prepareVoting(id);
    this.setState({
      redirect: true
    });
  }

  render() {
    const { contractModel } = this.props;
    const { redirect } = this.state;
    let renderQuestions = contractModel.bufferQuestions.map(
      (question, index) => (
        <Question key={index + 1} data={question} index={index + 1} />
      )
    );
    let loader = this.getLoader();

    if (redirect) return <Redirect to="/votings" />;
    return (
      <div className={styles.wrapper}>
        <section className={`${styles.section} ${styles["section-vote"]}`}>
          <div className={styles["section-vote__content"]}>
            <img src={lists} />
            <div className={styles["section-vote__buttons"]}>
              <label>
                <span>
                  {" "}
                  добавить <br /> группу
                </span>
                <button
                  className={"btn btn--blue btn--small"}
                  onClick={this.preparePrimaryVotings.bind(this, 3)}
                >
                  <img src={groupIcon} />
                </button>
              </label>
              <label>
                <button
                  className={"btn btn--blue btn--small"}
                  onClick={this.preparePrimaryVotings.bind(this, 1)}
                >
                  <img src={questionIcon} />
                </button>
                <span>
                  {" "}
                  добавить <br /> вопрос
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles["section-questions"]}`}>
          <div className={styles["section-questions__filters"]}>
            <label className={styles["section-questions__filters-numbers"]}>
              <span> Номера </span>
              <Select
                multi={false}
                searchable={false}
                clearable={false}
                placeholder={"Выберитe номер"}
                value={this.state.page}
                onChange={this.selectRange.bind(this)}
                options={contractModel.questionsPages}
              />
            </label>

            <label className={styles["section-questions__filters-groups"]}>
              <span> Группа вопросов </span>

              <Select
                multi={false}
                searchable={false}
                clearable={false}
                placeholder="Тип вопросов"
                value={this.state.selectedType}
                onChange={this.selectType.bind(this)}
                options={contractModel.groupsOfQuestions}
              />
            </label>
          </div>

          {this.state.loading ? loader : renderQuestions}
        </section>
      </div>
    );
  }
}

export default Questions;
