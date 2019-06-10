import React, { Component } from 'react';
import styles from './style.scss';

import usersPicture from '../../../img/users_image.svg';
import groupIcon from '../../../img/connect_group_icon.svg';
import UserGroup from '../UserGroup';
import SendTokenModal from '../Modals/SendTokenModal';


class UserGroups extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      modalVisible: false
     }
  }
  toggleModal() {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  render() { 
    const { modalVisible } = this.state;

    return ( 
      <div className={styles.wrapper}>
        <section className={`${styles.section} ${styles['section-right']}`}>
          <div className={styles['section-right__content']}>
            <img src={usersPicture}/>
            <div className={styles['section-right__buttons']}>
              <label>
                <span> подключить <br/> группу к проекту</span>
                <button className={'btn btn--blue btn--small'}> 
                  <img src={groupIcon}/> 
                </button>
              </label>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles['section-groups']}`}>
          <UserGroup onTransfer={this.toggleModal.bind(this)}/>
        </section>
        {
          modalVisible ? <SendTokenModal  onclose={this.toggleModal.bind(this)}/>: ""
        }
      </div>
     );
  }
}
 
export default UserGroups;