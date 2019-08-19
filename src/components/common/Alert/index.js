import React, { PureComponent } from 'react';
import styles from './style.scss'
import alertIcon from '../../../img/alert-icon.png'

const Alert = ({ visible, text }) => {
  return (
    <div className={`${styles['alert']} ${visible ? `${styles['alert-visible']}` : ''}`}>
      <img src={alertIcon} />
      <p className={styles['alert__message']}>{text}</p>
    </div>
  );
}

export default Alert;
