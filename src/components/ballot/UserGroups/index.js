import React, { Component } from 'react';
import styles from './style.scss';
import { Redirect } from "react-router-dom"

import usersPicture from '../../../img/users_image.svg';
import groupIcon from '../../../img/connect_group_icon.svg';
import UserGroup from '../UserGroup';
import SendTokenModal from '../Modals/SendTokenModal';
import { inject, observer } from 'mobx-react';

@inject('contractModel')@observer
class UserGroups extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      modalVisible: false,
      redirect: false,
      type: '',
      address:'',
     }
  }
  componentWillMount() {
    const { contractModel } = this.props;
    contractModel.getUserGroups();
    console.log(this.props);
  }
  toggleModal(type, address) {
    console.log(type, address);
    this.setState({
      modalVisible: !this.state.modalVisible,
      type,
      address
    })
  }
  
  preparePrimaryVotings(id) {
    const { contractModel } = this.props;
    contractModel.prepareVoting(id);
    this.setState({
      redirect: true
    })
  }

  render() { 
    const { contractModel } = this.props;
    const { userGroups } = contractModel;
    const { modalVisible, redirect } = this.state;

    console.log(userGroups);
    if (redirect) return <Redirect to='/votings'/>
    return ( 
      <div className={styles.wrapper}>
        <section className={`${styles.section} ${styles['section-right']}`}>
          <div className={styles['section-right__content']}>
            <img src={usersPicture}/>
            <div className={styles['section-right__buttons']}>
              <label>
                <span> подключить <br/> группу к проекту</span>
                <button className={'btn btn--blue btn--small'} onClick={this.preparePrimaryVotings.bind(this, 2)}> 
                  <img src={groupIcon}/> 
                </button>
              </label>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles['section-groups']}`}>
          { userGroups.map(group => <UserGroup data={group} onTransfer={this.toggleModal.bind(this)}/>)}
        </section>
        {
          modalVisible ? <SendTokenModal type={this.state.type} address={this.state.address}  onclose={this.toggleModal.bind(this)}/>: ""
        }
      </div>
     );
  }
}
 
export default UserGroups;