import React, { Component } from 'react';
import styles from './style.scss';
import { inject, observer } from 'mobx-react';
import accountStore from '../../../models/BallotAccount/AccountModel';
import arrow from '../../../img/arrow_send.svg';

@inject('contractModel', 'accountStore') @observer
class UserGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      totalSupply: 0,
      groupType: '',
      symbol: '',
      address: '',
      balances: [],
      userBalance: '',
      users: [],
      interval: '',
      userAddress: web3.eth.accounts.wallet[0].address
    }
  }

  async componentWillMount() {
    const { accountStore } = this.props;
    await this.getInfo();
  }
  async componentWillUnmount() {
    clearInterval(this.state.interval);
    await this.setState({ interval: '' });
  }

  async getInfo() {
    const { contractModel } = this.props;
    const { userAddress } = this.state;
    const { groupAddress, groupType } = this.props.data;
    await this.setState({ groupType });
    groupType == 'ERC20' ? await this.getERCinfo(groupAddress) : await this.getCustomInfo(groupAddress);
    await this.setState({
      interval: setInterval(async () => {
        groupType == 'ERC20' ? await this.getERCinfo(groupAddress) : await this.getCustomInfo(groupAddress);
      }, 10 * 1000)
    })
  }

  async getERCinfo(address) {
    const { userAddress } = this.state;
    const abi = window.__ENV == 'development'
      ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, '/contracts/ERC20.abi'), 'utf8'))
      : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/ERC20.abi'), 'utf8'))
    const contract = await new web3.eth.Contract(abi, address);
    let symbol = await contract.methods.symbol().call({ from: userAddress })
    let totalSupply = await contract.methods.totalSupply().call({ from: userAddress })
    let userBalance = await contract.methods.balanceOf(userAddress).call({ from: userAddress })
    await this.setState({ symbol, totalSupply, userBalance })
  }

  async getCustomInfo(address) {
    const { userAddress } = this.state;
    let abi = window.__ENV == 'development'
      ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, '/contracts/MERC20.abi'), 'utf8'))
      : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/MERC20.abi'), 'utf8'))
    let contract = await new web3.eth.Contract(abi, address);
    let symbol = await contract.methods.symbol().call({ from: userAddress })
    let totalSupply = await contract.methods.totalSupply().call({ from: userAddress })
    let userBalance = await contract.methods.balanceOf(userAddress).call({ from: userAddress })
    let users = await contract.methods.getUsers().call({ from: userAddress })
    let balances = await this.getCustomUsersBalances(address, users);
    console.log(JSON.stringify(balances))
    await this.setState({ symbol, totalSupply, userBalance, users, balances });
  }

  async getCustomUsersBalances(address, users) {
    const { userAddress } = this.state;
    let abi = window.__ENV == 'development'
      ? JSON.parse(fs.readFileSync(path.join(window.process.env.INIT_CWD, '/contracts/MERC20.abi'), 'utf8'))
      : JSON.parse(fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, '/contracts/MERC20.abi'), 'utf8'))
    const customContract = new web3.eth.Contract(abi, address);
    let balances = [];
    await users.map(async user => {
      await customContract.methods.balanceOf(user).call({ from: userAddress }).then(balance => {
        balances.push(balance)
      })
    })
    return balances;
  }

  expandCard() {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  openModal(type, groupAddress, userAddress) {
    const { onTransfer } = this.props;
    onTransfer(type, groupAddress, userAddress)
  }


  render() {

    const { totalSupply, symbol, address, userBalance, userAddress, expanded, balances, users } = this.state;
    const { data } = this.props;
    return (
      <div className='group'>
        <div className='group-head'>
          <div className='group-head__about'>
            <h1 onClick={this.expandCard.bind(this)}> {data.name} </h1>
            <p>
              {
                data.name == 'Owner' ? "Неограниченные права" : "Могут голосовать по определенным вопросам"
              }
            </p>
            <p><strong>{data.groupAddress}</strong></p>
          </div>
          <div className='group-head__additional'>
            <p><strong>{totalSupply}</strong> {symbol}</p>
            <p>{data.groupType}</p>
          </div>
        </div>
        <hr />
        <div className={`group-users ${expanded ? '' : 'hidden'}`}>
          {data.groupType == 'ERC20'
            ? <User
              address={userAddress}
              balance={userBalance}
              totalSupply={totalSupply}
              symbol={symbol}
              onclick={this.openModal.bind(this, data.groupType, data.groupAddress, userAddress)}
            />
            : balances.map((balance, index) => <User
              key={index}
              address={users[index]}
              balance={balance}
              totalSupply={totalSupply}
              symbol={symbol}
              onclick={this.openModal.bind(this, data.groupType, data.groupAddress, users[index])}
            />)
          }
          <hr />
        </div>
        <div className='group-description'>
          <p>В группе есть администраторы</p>
          <p>Мы не можем их показать потому, из-за ограничений используемой технологии</p>
        </div>
      </div>

    );
  }
}

const User = ({ address, symbol, balance, totalSupply, onclick }) => {
  return (
    <p className='group-users__user'>
      <span className='group-users__user-address'>
        <strong>{address}</strong>
      </span>
      <span className='group-users__user-balance'>
        <strong>{balance} </strong> {symbol}
      </span>
      <span className='group-users__user-balance--percent'>
        <strong>{((balance / totalSupply) * 100).toFixed(0)} %</strong>
      </span>
      <button className="btn btn--blue" onClick={onclick}><img src={arrow} /></button>
    </p>
  )
}

export default UserGroup;