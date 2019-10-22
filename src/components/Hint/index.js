import React from 'react';
import propTypes from 'prop-types';
import styles from './Hint.scss';


const Hint = ({ children }) => (
  <div className={`${styles.hint}`}>
    <span className="hint__icon"> ? </span>
    <span className="hint__text">
      {children}
    </span>
  </div>
);

Hint.propTypes = {
  children: propTypes.arrayOf(propTypes.string).isRequired,
};

export default Hint;
