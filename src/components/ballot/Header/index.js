import React, { Component } from 'react';
import styles from './style.scss';
import avatar from '../../../img/avatar.png';
import votings from '../../../img/votes_icon.svg';
import questions from '../../../img/questions_icon.svg';
import users from '../../../img/users_icon.svg';
import settings from '../../../img/settings_icon.svg';

import { NavLink } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
@inject('accountStore')@observer
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      addressHover: false,
      address:'',
      prettyAddress: '',
     }
  }
  componentWillMount() {
    this.prettyAddress();
  }

  prettyAddress() {
    const { accountStore } = this.props;
    const { address } = accountStore;
  
    let arrayOfParts = [...new Set(address.replace('0x', '').split(new RegExp(/(\w{8})/g)))].filter(function(e){return e})
    let length = arrayOfParts.length
    let prettyAddress = `0x${arrayOfParts[0]}...${arrayOfParts[length-1]}`
    this.setState ({
      address: address,
      prettyAddress: prettyAddress,
    })
  }

  toggleAddress() {
    this.setState({
      addressHover: !this.state.addressHover
    })
  }

  copyAddress() {
    navigator.clipboard.writeText(`0x${this.state.address}`)
  }

  render() { 
    return ( 
      <header className={styles.header}>
        <nav className={styles.nav}>
          <ul className={styles['nav-list']}>
            <li>
              <img src={votings} className={styles.icon}/>
              <NavLink 
                className={styles.link}
                to="/votings"
              > Голосования 
              </NavLink>
            </li>
            <li>
              <img src={questions} className={styles.icon}/>
              <NavLink 
                className={styles.link}  
                to="/questions"
              > Вопросы </NavLink>
            </li>
            <li>
              <img src={users} className={styles.icon}/>
              <NavLink 
                className={styles.link } 
                to="/users"
              > Пользователи </NavLink>
            </li>
            <li>
              <img src={settings} className={styles.icon}/>
              <NavLink  
                className={styles.link} 
                to="/settings"
              > Настройки</NavLink>
            </li>
          </ul>
          <div 
            className={styles['nav-profile']} 
            onMouseOver={this.toggleAddress.bind(this)} 
            onMouseOut={this.toggleAddress.bind(this)}
            > 
              <img src={avatar}/>
              <span className={styles['nav-profile__address']} onClick={this.copyAddress.bind(this)}> 
                {
                  this.state.addressHover ? `0x${this.state.address}` : this.state.prettyAddress
                } 
              </span>
          </div>
        </nav>
      </header>
     );
  }
}
 
export default Header;