import React from 'react';
import styles from './User.scss';

const User = () => (
  <div className={`${styles.user}`}>
    <img className="user__image" src="http://tinygraphs.com/spaceinvaders/0x295856bcf02b2017607e4f61cfc1573fd05d511f?theme=base&numcolors=2&size=22&fmt=svg" alt="avatar" />
    <span className="user__wallet user__wallet--full">0x295856bcf02b2017607e4f61cfc1573fd05d511f</span>
    <span className="user__wallet user__wallet--half">0x295856...5d511f</span>
  </div>
);
export default User;
