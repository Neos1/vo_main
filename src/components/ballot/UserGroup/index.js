import React, { Component } from 'react';
import styles from './style.scss';
import { inject, observer } from 'mobx-react';
import accountStore from '../../../models/BallotAccount/AccountModel';

import arrow from '../../../img/arrow_send.svg';

@inject('contractModel', 'accountStore')@observer
class UserGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      totalSupply: 0,
      symbol: '',
      address: '',
      userBalance: '',
      userAddress: web3.eth.accounts.wallet[0].address
    }
  }

  async componentWillMount() {
    const { accountStore } = this.props;
    await this.getERCInfo();
  }

  async getERCInfo() {
    const { contractModel } = this.props;
    const { contract } = contractModel;
    const { userAddress } = this.state;
    let symbol = await contract.methods.getERCSymbol().call({from: userAddress})
    let totalSupply = await contract.methods.getERCTotal().call({from: userAddress})
    let address = await contract.methods.getERCAddress().call({from: userAddress})
    let userBalance = await contract.methods.getUserBalance().call({from: userAddress})
    await this.setState({symbol, totalSupply, address, userBalance})
  }

  expandCard() {
    this.setState({
      expanded: !this.state.expanded
    })
  }



  render() { 
    const { onTransfer } = this.props;
    const {totalSupply, symbol, address, userBalance, userAddress, expanded} = this.state;

    return ( 

      <div className='group'>
        <div className='group-head'>
          <div className='group-head__about'>
            <h1 onClick={this.expandCard.bind(this)}>Admins</h1>
            <p>Неограниченные права</p>
            <p><strong>{address}</strong></p>
          </div>
          <div className='group-head__additional'>
            <p><strong>{totalSupply}</strong> {symbol}</p>
            <p>ERC20</p>
          </div>
        </div>
        <hr/>
        <div className={`group-users ${expanded? '' : 'hidden'}`}>
          <p className='group-users__user'>
            <span className='group-users__user-address'>
              <strong>{userAddress}</strong>
            </span>
            <span className='group-users__user-balance'>
              <strong>{userBalance} </strong> {symbol}
            </span>
            <span className='group-users__user-balance--percent'>
              <strong>{((userBalance/totalSupply)*100).toFixed(0)} %</strong> 
            </span>
            <button className="btn btn--blue" onClick={onTransfer}><img src={arrow}/></button>
          </p>
          <hr/>
        </div>
        <div className='group-description'>
          <p>В группе есть администраторы</p>
          <p>Мы не можем их показать потому, из-за ограничений используемой технологии</p>
        </div>
      </div>

     );
  }
}
 
export default UserGroup;